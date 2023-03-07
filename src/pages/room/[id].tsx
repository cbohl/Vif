// This page, a copy of the room page, is currently necessary due to CSS rendering issues.
// The CSS from Tailwind is not applying to the room folder. This problem needs fixing.

// /* eslint-disable */

import { NextRouter, useRouter } from "next/router";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useSocket from "hooks/useSocket";
import GiphySearch from "@/components/giphySearch";
import NavBar from "@/components/NavBar";

// interface NamespaceSpecificClientToServerEvents {
//   joined: (arg: string) => void;
// }
// types for the namespace named "/my-namespace"
interface NamespaceSpecificClientToServerEvents {
  // foo: (arg: string) => void;
  join: (arg: string) => void;
  leave: (arg: string) => void;
  ready: (arg: string) => void;
  offer: (arg: string) => void;
  answer: (arg: string) => void;
  iceCandidate: (arg: string) => void;
  newPeerToServer: (arg: string) => void;
  setGifToServer: (arg: string) => void;
}

interface NamespaceSpecificServerToClientEvents {
  // bar: (arg: string) => void;
  joined: (arg: string) => void;
  created: (arg: string) => void;
  ready: (arg: string) => void;
  leave: (arg: string) => void;
  full: (arg: string) => void;
  offer: (arg: string) => void;
  answer: (arg: string) => void;
  iceCandidate: (arg: string) => void;
  newGifFromServer: (arg: string) => void;
  newPeerFromServer: (arg: string) => void;

  // iceCandidate: (arg: string) => void;
}

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
  const userVideoRef: MutableRefObject<HTMLMediaElement | undefined> = useRef();
  const peerVideoRef: MutableRefObject<HTMLMediaElement | undefined> = useRef();
  const rtcConnectionRef: MutableRefObject<RTCPeerConnection | null> =
    useRef(null);
  const socketRef: MutableRefObject<
    | Socket<
        NamespaceSpecificServerToClientEvents,
        NamespaceSpecificClientToServerEvents
      >
    | undefined
  > = useRef();
  const userStreamRef: MutableRefObject<MediaStream | undefined> = useRef();
  const hostRef: MutableRefObject<boolean> = useRef(false);

  const { id: roomName } = router.query;

  useEffect(() => {
    // socketRef.current = io();

    const socket: Socket<
      NamespaceSpecificServerToClientEvents,
      NamespaceSpecificClientToServerEvents
    > = io();

    socketRef.current = socket;

    // socketRef.current.on("bar", (arg) => {
    //   console.log(arg); // "123"
    // });

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
    socketRef.current.on("iceCandidate", handlerNewIceCandidateMsg);

    // Update other users GIF if pinged by server called
    socketRef.current.on("newGifFromServer", function (msg: string) {
      console.log("here is the new gif form server", msg);
      setOtherUsersGifLink(msg);
    });

    socketRef.current.on("newPeerFromServer", function () {
      console.log("new peer, sending gif link!", selectedGifUrl);
      console.log("sending link, here is ref", selectedGifUrlRef.current);
      gifLinkToServer(selectedGifUrlRef.current);
    });

    // clear up after
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
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
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
          userVideoRef.current.onloadedmetadata = () => {
            if (userVideoRef.current) {
              userVideoRef.current
                .play()
                .catch((err: string) => console.log(err));
            }
          };
        }
        if (socketRef.current) {
          socketRef.current.emit("ready", roomName);
        }
      })
      .catch((err: string) => {
        console.log(err);
      });

    if (socketRef.current) {
      socketRef.current.emit("newPeerToServer", roomName);
    }
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
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
          userVideoRef.current.onloadedmetadata = () => {
            if (userVideoRef.current) {
              userVideoRef.current
                .play()
                .catch((err: string) => console.log(err));
            }
          };
        }
      })
      .catch((err: string) => {
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
        .then((offer: RTCSessionDescriptionInit) => {
          if (rtcConnectionRef.current) {
            rtcConnectionRef.current
              .setLocalDescription(offer)
              .catch((err: string) => console.log(err));
          }
          if (socketRef.current) {
            socketRef.current.emit("offer", offer, roomName);
          }
        })
        .catch((error: string) => {
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

  const handleReceivedOffer = (offer: RTCSessionDescriptionInit) => {
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
        rtcConnectionRef.current
          .setRemoteDescription(offer)
          .catch((err: string) => console.log(err));
      }
      rtcConnectionRef.current
        .createAnswer()
        .then((answer: RTCSessionDescriptionInit) => {
          if (rtcConnectionRef.current) {
            rtcConnectionRef.current
              .setLocalDescription(answer)
              .catch((err: string) => console.log(err));
          }
          if (socketRef.current) {
            socketRef.current.emit("answer", answer, roomName);
          }
        })
        .catch((err: string) => {
          console.log(err);
        });
    }
  };

  const handleAnswer = (answer: RTCSessionDescriptionInit) => {
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current
        .setRemoteDescription(answer)
        .catch((err: string) => console.log(err));
    }
  };

  const handleICECandidateEvent = (event: RTCIceCandidate) => {
    if (event.candidate) {
      if (socketRef.current) {
        socketRef.current.emit("iceCandidate", event.candidate, roomName);
      }
    }
  };

  const handlerNewIceCandidateMsg = (incoming: RTCIceCandidateInit) => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current
        .addIceCandidate(candidate)
        .catch((e: string) => console.log(e));
    }
  };

  const handleTrackEvent = (event: RTCTrackEvent) => {
    if (peerVideoRef.current) {
      peerVideoRef.current.srcObject = event.streams[0];
    }
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

  const gifLinkToServer = (url: string) => {
    if (socketRef.current) {
      socketRef.current.emit("setGifToServer", url, roomName);
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave", roomName); // Let's the server know that user has left the room.
    }

    if (userVideoRef.current) {
      if (userVideoRef.current.srcObject) {
        userVideoRef.current.srcObject
          .getTracks()
          .forEach((track: any) => track.stop()); // Stops receiving all track of User.
      }
    }

    if (userVideoRef.current) {
      if (userVideoRef.current.srcObject) {
        if (peerVideoRef.current) {
          if (peerVideoRef.current.srcObject) {
            peerVideoRef.current.srcObject
              .getTracks()
              .forEach((track: any) => track.stop()); // Stops receiving audio track of Peer.
          }
        }
      }
    }

    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
    router.push("/").catch((err: string) => console.log(err));
  };

  const changeGif = (url: string) => {
    selectedGifUrlRef.current = url;
    setSelectedGifUrl(url);
    gifLinkToServer(url);
  };

  return (
    <div>
      <NavBar></NavBar>

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
            <div className='w-96 inline-block'>
              <video
                autoPlay
                ref={peerVideoRef}
                poster='/anonymousperson.png'
              />
            </div>
          </div>

          <div>
            <div className='w-96 inline-block'>
              <img src={otherUsersGifLink} className='w-full'></img>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className='w-44 inline-block'>
              <video
                autoPlay
                ref={userVideoRef}
                poster='/anonymousperson.png'
              />
            </div>
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
            <GiphySearch changeGif={changeGif}></GiphySearch>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
