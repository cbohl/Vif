import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../app/page.module.css";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const joinRoom = () => {
    router.push(`/room/${roomName || Math.random().toString(36).slice(2)}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Vif: Video Hangout and GIFs</title>
        <meta
          name='description'
          content='Use Native WebRTC API for video conferencing'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className='text-lime-500 bold'>
          Welcome to Vif: Video Hangout and GIFs!
        </h1>
        <h2>Select a room now!</h2>
        <input
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
          className='bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500'
        />
        <button
          onClick={joinRoom}
          type='button'
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
        >
          Join Room
        </button>
      </main>
    </div>
  );
}
