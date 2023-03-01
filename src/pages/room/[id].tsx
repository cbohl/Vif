// This page, a copy of the room page, is currently necessary due to CSS rendering issues.
// The CSS from Tailwind is not applying to the room folder. This problem needs fixing.

// /* eslint-disable */

import { NextRouter, useRouter } from "next/router";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useSocket from "hooks/useSocket";
import GiphySearch from "@/components/giphySearch";
// import Image from "next/image";
import styles from ".../app/page.module.css";
import NavBar from "@/components/NavBar";

// const x: number = "hello";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
  ],
};

const Room = () => {
  useSocket();
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [otherUsersGifLink, setOtherUsersGifLink] = useState(
    "https://media4.giphy.com/media/xTiN0IuPQxRqzxodZm/giphy.gif?cid=f862e515pl4bfcohtomjl5bywy9z170utqfu7x8coz2pwonl&rid=giphy.gif&ct=g"
  );
  const [selectedGifUrl, setSelectedGifUrl] = useState(
    "https://media4.giphy.com/media/xTiN0IuPQxRqzxodZm/giphy.gif?cid=f862e515pl4bfcohtomjl5bywy9z170utqfu7x8coz2pwonl&rid=giphy.gif&ct=g"
  );
  const selectedGifUrlRef = useRef(
    "https://media4.giphy.com/media/xTiN0IuPQxRqzxodZm/giphy.gif?cid=f862e515pl4bfcohtomjl5bywy9z170utqfu7x8coz2pwonl&rid=giphy.gif&ct=g"
  );

  const router: NextRouter = useRouter();
  const userVideoRef: MutableRefObject<MediaStream | undefined> = useRef();
  const peerVideoRef: MutableRefObject<MediaStream | undefined> = useRef();
  const rtcConnectionRef: MutableRefObject<RTCPeerConnection | null> =
    useRef(null);
  const socketRef: MutableRefObject<MediaStream | undefined> = useRef();
  const userStreamRef: MutableRefObject<MediaStream | undefined> = useRef();
  const hostRef: MutableRefObject<boolean> = useRef(false);

  const { id: roomName } = router.query;

  useEffect(() => {
    socketRef.current = io();
    // First we join a room
    socketRef.current.emit("join", roomName);

    socketRef.current.on("joined", handleRoomJoined);
    // If the room didn't exist, the server would emit the room was 'created'
    socketRef.current.on("created", handleRoomCreated);
    // Whenever the next person joins, the server emits 'ready'
    socketRef.current.on("ready", initiateCall);

    // Emitted when a peer leaves the room
    socketRef.current.on("leave", onPeerLeave);

    // If the room is full, we show an alert
    socketRef.current.on("full", () => {
      window.location.href = "/";
    });

    // Event called when a remote user initiating the connection and
    socketRef.current.on("offer", handleReceivedOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handlerNewIceCandidateMsg);

    // Update other users GIF if pinged by server called
    socketRef.current.on("new-gif-from-server", function (msg: any) {
      console.log("here is the new gif form server", msg);
      setOtherUsersGifLink(msg);
    });

    socketRef.current.on("new-peer-from-server", function () {
      console.log("new peer, sending gif link!", selectedGifUrl);
      console.log("sending link, here is ref", selectedGifUrlRef.current);
      gifLinkToServer(selectedGifUrlRef.current);
    });

    // clear up after
    return () => socketRef.current.disconnect();
  }, [roomName]);

  const handleRoomJoined = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 500, height: 500 },
      })
      .then((stream) => {
        /* use the stream */
        userStreamRef.current = stream;
        userVideoRef.current.srcObject = stream;
        userVideoRef.current.onloadedmetadata = () => {
          userVideoRef.current.play();
        };
        socketRef.current.emit("ready", roomName);
      })
      .catch((err: any) => {
        /* handle the error */
        console.log("error", err);
      });

    socketRef.current.emit("new-peer-to-server", roomName);
    gifLinkToServer(selectedGifUrl);
  };

  const handleRoomCreated = () => {
    hostRef.current = true;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 500, height: 500 },
      })
      .then((stream) => {
        /* use the stream */
        userStreamRef.current = stream;
        userVideoRef.current.srcObject = stream;
        userVideoRef.current.onloadedmetadata = () => {
          userVideoRef.current.play();
        };
      })
      .catch((err: any) => {
        /* handle the error */
        console.log(err);
      });
  };

  const initiateCall = () => {
    if (hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      if (userStreamRef.current) {
        rtcConnectionRef.current.addTrack(
          userStreamRef.current.getTracks()[0],
          userStreamRef.current
        );
        rtcConnectionRef.current.addTrack(
          userStreamRef.current.getTracks()[1],
          userStreamRef.current
        );
      }
      rtcConnectionRef.current
        .createOffer()
        .then((offer: any) => {
          if (rtcConnectionRef.current) {
            rtcConnectionRef.current.setLocalDescription(offer);
          }
          socketRef.current.emit("offer", offer, roomName);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  };

  const onPeerLeave = () => {
    // This person is now the creator because they are the only person in the room.
    hostRef.current = true;
    if (peerVideoRef.current) {
      if (peerVideoRef.current.srcObject) {
        peerVideoRef.current.srcObject
          .getTracks()
          .forEach((track: any) => track.stop()); // Stops receiving all track of Peer.
      }
    }

    // Safely closes the existing connection established with the peer who left.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
  };

  /**
   * Takes a userid which is also the socketid and returns a WebRTC Peer
   *
   * @param  {string} userId Represents who will receive the offer
   * @returns {RTCPeerConnection} peer
   */

  const createPeerConnection = () => {
    // We create a RTC Peer Connection
    const connection = new RTCPeerConnection(ICE_SERVERS);

    // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
    connection.onicecandidate = handleICECandidateEvent;

    // We implement our onTrack method for when we receive tracks
    connection.ontrack = handleTrackEvent;
    return connection;
  };

  const handleReceivedOffer = (offer: any) => {
    if (!hostRef.current) {
      rtcConnectionRef.current = createPeerConnection();
      if (userStreamRef.current) {
        rtcConnectionRef.current.addTrack(
          userStreamRef.current.getTracks()[0],
          userStreamRef.current
        );
        rtcConnectionRef.current.addTrack(
          userStreamRef.current.getTracks()[1],
          userStreamRef.current
        );
        rtcConnectionRef.current.setRemoteDescription(offer);
      }
      rtcConnectionRef.current
        .createAnswer()
        .then((answer: any) => {
          if (rtcConnectionRef.current) {
            rtcConnectionRef.current.setLocalDescription(answer);
          }
          socketRef.current.emit("answer", answer, roomName);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  };

  const handleAnswer = (answer: any) => {
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current
        .setRemoteDescription(answer)
        .catch((err: any) => console.log(err));
    }
  };

  const handleICECandidateEvent = (event: any) => {
    if (event.candidate) {
      socketRef.current.emit("ice-candidate", event.candidate, roomName);
    }
  };

  const handlerNewIceCandidateMsg = (incoming: any) => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current
        .addIceCandidate(candidate)
        .catch((e: any) => console.log(e));
    }
  };

  const handleTrackEvent = (event: any) => {
    // eslint-disable-next-line prefer-destructuring
    peerVideoRef.current.srcObject = event.streams[0];
  };

  const toggleMediaStream = (type: any, state: any) => {
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach((track: any) => {
        if (track.kind === type) {
          // eslint-disable-next-line no-param-reassign
          track.enabled = !state;
        }
      });
    }
  };

  const toggleMic = () => {
    toggleMediaStream("audio", micActive);
    setMicActive((prev) => !prev);
  };

  const toggleCamera = () => {
    toggleMediaStream("video", cameraActive);
    setCameraActive((prev) => !prev);
  };

  const gifLinkToServer = (url: any) => {
    socketRef.current.emit("set-gif-to-server", url, roomName);
  };

  const leaveRoom = () => {
    socketRef.current.emit("leave", roomName); // Let's the server know that user has left the room.

    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject
        .getTracks()
        .forEach((track: any) => track.stop()); // Stops receiving all track of User.
    }
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track: any) => track.stop()); // Stops receiving audio track of Peer.
    }

    // Checks if there is peer on the other side and safely closes the existing connection established with the peer.
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    router.push("/");
  };

  const changeGif = (url: any) => {
    selectedGifUrlRef.current = url;
    setSelectedGifUrl(url);
    gifLinkToServer(url);
  };

  return (
    <div>
      <NavBar></NavBar>
      {/* <div className='w-12 h-12 bg-black'></div> */}

      {/* <div className='space-y-4 font-mono font-bold text-xs text-center text-white'> */}
      {/* <div className='px-4 py-2 bg-blue-500 rounded-lg shadow-lg w-96 sm:block'>
        w-96
      </div> */}
      {/* </div> */}
      {/* <div class='bg-gray-400 p-2'>
        <span class='hidden bg-teal-400'>One</span>
        <span class='block bg-teal-400'>Two</span>
      </div> */}

      {/* <div className='p-8 bg-amber-300'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8'>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            1
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            2
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            3
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            4
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            5
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            6
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            7
          </div>
          <div className='p-4 bg-cyan-400 rounded-md flex items-center justify-center'>
            8
          </div>
        </div>
      </div> */}

      {/* <div className='grid grid-cols-4 gap-4'>
        <div>01</div>
        <div>09</div>
      </div> */}

      <div className='hidden'>
        <h1 className='invisible text-lime-500'>You </h1>
        <video
          className='invisible'
          autoPlay
          ref={userVideoRef}
          poster='https://upload.wikimedia.org/wikipedia/commons/3/37/No_person.jpg'
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8'>
        <div className=''>
          <div>
            {/* <h2 className='text-lime-500 bold'>Other user</h2> */}
            <div className='w-96 inline-block'>
              <video
                autoPlay
                ref={peerVideoRef}
                poster='/anonymousperson.png'
              />
            </div>
          </div>

          <div>
            {/* <h1>Dispay other users GIF here</h1> */}
            {/* <button onClick={gifLinkToServer} type='button'>
              Set new gif link here
            </button> */}
            {/* <img src={otherUsersGifLink} className='w-50'></img> */}
            {/* <div className='w-80 h-10 inline-block bg-black'></div> */}
            <div className='w-96 inline-block'>
              <img src={otherUsersGifLink} className='w-full'></img>
            </div>
          </div>
        </div>

        <div>
          <div>
            {/* <h1>You </h1> */}
            <div className='w-44 inline-block'>
              <video
                autoPlay
                ref={userVideoRef}
                poster='/anonymousperson.png'
              />
            </div>
            {/* <h1>Display select GIF here</h1> */}
            <div className='w-44 inline-block'>
              <img src={selectedGifUrl} className='w-full'></img>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 w-96'>
            <button
              onClick={toggleMic}
              type='button'
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-100'
            >
              {micActive ? "Mute Mic" : "UnMute Mic"}
            </button>
            <button
              onClick={leaveRoom}
              type='button'
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
            >
              Leave
            </button>
            <button
              onClick={toggleCamera}
              type='button'
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </button>
          </div>

          <div>
            {/* <h1>Select GIF from here</h1> */}
            <GiphySearch changeGif={changeGif}> </GiphySearch>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
