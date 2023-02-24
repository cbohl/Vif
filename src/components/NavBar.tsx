import React from "react";

const NavBar = () => {
  return (
    <nav className='w-screen'>
      <div className='flex-1 flex justify-center mr-auto'>
        <a href={"/"} className='font-bold text-center content-center'>
          Vif
        </a>
      </div>
      <hr className='h-px my-8 bg-gray-200 border-0 dark:bg-gray-700'></hr>
    </nav>
  );
};

export default NavBar;
