import { useRouter } from "next/navigation";
import { useState } from "react";
import NavBar from "@/components/NavBar";

interface KeyboardEvent {
  key: string;
}

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const joinRoom = () => {
    router.push(`/room/${roomName || Math.random().toString(36).slice(2)}`);
  };

  const downHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <>
      <NavBar></NavBar>

      <main>
        <h1 className='text-lime-500 bold'>
          Welcome to Vif: Video Hangout and GIFs!
        </h1>
        <h2>
          Create a room with the name of your choice! (Or join one made by a
          friend)
        </h2>
        <input
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
          className='bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500'
          placeholder='e.g. PartyPlace'
          onKeyDown={(e) => {
            downHandler(e);
          }}
        />
        <button
          onClick={joinRoom}
          type='button'
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
        >
          Join Room
        </button>

        <div className='grid'>
          <video
            id='background-video'
            autoPlay
            loop
            muted
            className='fixed mb-80 z-0 w-2/3 mt-10 object-cover'
          >
            <source src='vifdemo.mov' type='video/mp4'></source>
          </video>
        </div>
      </main>
    </>
  );
}
