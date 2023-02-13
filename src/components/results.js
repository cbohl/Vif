// import React from "react";
import Gif from "./gif.js";

const Results = ({ gifs, error, changeGif, changeGif2 }) => {
  // console.log("these are the gifs in results", gifs);

  const checkAroo = () => {
    console.log("Checkaroo!");
  };

  // debugger;

  return (
    <div className='gif-results' aria-live='polite'>
      {gifs.length > 0 && !error ? (
        gifs.map((gif) => (
          <Gif
            key={gif.id}
            gif={gif}
            changeGif={changeGif}
            changeGif2={changeGif2}
          />
        ))
      ) : error ? (
        <p>Error retrieving Gifs</p>
      ) : (
        <p>No Gifs Found</p>
      )}
    </div>
  );
};

export default Results;
