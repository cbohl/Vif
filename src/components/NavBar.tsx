import React from "react";
import Head from "next/head";

const NavBar = () => {
  return (
    <>
      <Head>
        <title>Vif: Video Hangout and GIFs</title>
        <meta
          name='description'
          content='Use Native WebRTC API for video conferencing'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <nav className='w-screen'>
        <div className='flex-1 flex justify-center mr-auto'>
          <a href={"/"} className='font-bold text-center content-center'>
            Vif
          </a>
        </div>
        <hr className='h-px my-8 bg-gray-200 border-0 dark:bg-gray-700'></hr>
      </nav>
    </>
  );
};

export default NavBar;
