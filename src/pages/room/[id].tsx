/* eslint-disable */

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useSocket from "hooks/useSocket";
import GiphySearch from "@/components/giphySearch";
import Image from "next/image";
// const giphy = require("giphy-api")(process.env.GIPHY_API_KEY);

// debugger;

// fetch("/api/users")
//    .then(response => response())
//    .then(response => console.log(response.data))
//    .catch(err => console.log(err)

// Search with a plain string using callback
// giphy.search("pokemon", function (err, res) {
//   console.log(err);
//   console.log(res);
//   debugger;
//   // Res contains gif data!
// });

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
    "https://media1.giphy.com/media/xTiN0IuPQxRqzxodZm/200w_d.gif?cid=f862e515s4k9l5sctolvc5s6ddygrlm8q4lasl14udviceh4&rid=200w_d.gif&ct=g"
  );
  const [selectedGifUrl, setSelectedGifUrl] = useState(
    "https://media1.giphy.com/media/xTiN0IuPQxRqzxodZm/200w_d.gif?cid=f862e515s4k9l5sctolvc5s6ddygrlm8q4lasl14udviceh4&rid=200w_d.gif&ct=g"
  );
  const selectedGifUrlRef = useRef(
    "https://media1.giphy.com/media/xTiN0IuPQxRqzxodZm/200w_d.gif?cid=f862e515s4k9l5sctolvc5s6ddygrlm8q4lasl14udviceh4&rid=200w_d.gif&ct=g"
  );

  const router: any = useRouter();
  const userVideoRef: any = useRef();
  const peerVideoRef: any = useRef();
  const rtcConnectionRef: any = useRef(null);
  const socketRef: any = useRef();
  const userStreamRef: any = useRef();
  const hostRef: any = useRef(false);

  const { id: roomName } = router.query;

  useEffect(() => {
    // getGiphyData();
    // debugger;

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

    // resend GifLink so new user can receive it and not just use default GIF
    // alert("room joined!!!");
    // debugger;
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
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current
      );
      rtcConnectionRef.current
        .createOffer()
        .then((offer: any) => {
          rtcConnectionRef.current.setLocalDescription(offer);
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
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track: any) => track.stop()); // Stops receiving all track of Peer.
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
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      );
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[1],
        userStreamRef.current
      );
      rtcConnectionRef.current.setRemoteDescription(offer);

      rtcConnectionRef.current
        .createAnswer()
        .then((answer: any) => {
          rtcConnectionRef.current.setLocalDescription(answer);
          socketRef.current.emit("answer", answer, roomName);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  };

  const handleAnswer = (answer: any) => {
    rtcConnectionRef.current
      .setRemoteDescription(answer)
      .catch((err: any) => console.log(err));
  };

  const handleICECandidateEvent = (event: any) => {
    if (event.candidate) {
      socketRef.current.emit("ice-candidate", event.candidate, roomName);
    }
    // alert("ice candidate!");
  };

  const handlerNewIceCandidateMsg = (incoming: any) => {
    // We cast the incoming candidate to RTCIceCandidate
    const candidate = new RTCIceCandidate(incoming);
    rtcConnectionRef.current
      .addIceCandidate(candidate)
      .catch((e: any) => console.log(e));
    // alert("new mesg");
  };

  const handleTrackEvent = (event: any) => {
    // eslint-disable-next-line prefer-destructuring
    peerVideoRef.current.srcObject = event.streams[0];
  };

  const toggleMediaStream = (type: any, state: any) => {
    userStreamRef.current.getTracks().forEach((track: any) => {
      if (track.kind === type) {
        // eslint-disable-next-line no-param-reassign
        track.enabled = !state;
      }
    });
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

  const changeGif2 = (url: any) => {
    // alert(url);
    selectedGifUrlRef.current = url;
    setSelectedGifUrl(url);
    // console.log("this is hte selectedgifurlref", selectedGifUrlRef);
    gifLinkToServer(url);
  };

  return (
    <div>
      <video autoPlay ref={userVideoRef} />
      <h1>Display select GIF here</h1>
      <div className='gif'>
        {/* <Image
          src={selectedGifUrl}
          className='gif__image'
          alt='test'
          width='500'
          height='500'
        /> */}
        <img src={selectedGifUrl} className='gif__image' alt='test'></img>
      </div>
      <h1>Select GIF from here</h1>
      <GiphySearch changeGif2={changeGif2}> </GiphySearch>
      {/* <ReactGiphySearchbox
        apiKey='YOUR_API_KEY' // Required: get your on https://developers.giphy.com
        onSelect={(item) => console.log(item)}
      /> */}
      <video autoPlay ref={peerVideoRef} />
      <h1>Dispay other users GIF here</h1>
      <button onClick={gifLinkToServer} type='button'>
        Set new gif link here
      </button>
      <img src={otherUsersGifLink} className='gif__image' alt='test'></img>

      {/* <iframe
        src={otherUsersGifLink}
        width='480'
        height='480'
        frameBorder='0'
        className='giphy-embed'
        allowFullScreen
      ></iframe>
      <p>
        <a href='https://giphy.com/gifs/moodman-YRVP7mapl24G6RNkwJ'>
          via GIPHY
        </a>
      </p> */}
      <button onClick={toggleMic} type='button'>
        {micActive ? "Mute Mic" : "UnMute Mic"}
      </button>
      <button onClick={leaveRoom} type='button'>
        Leave
      </button>
      <button onClick={toggleCamera} type='button'>
        {cameraActive ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
};

export default Room;
