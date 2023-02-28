import Gif from "./gif.js";

const Results = ({ gifs, error, changeGif }) => {
  return (
    <div className='gif-results grid grid-cols-3 gap-4 w-96' aria-live='polite'>
      {gifs.length > 0 && !error ? (
        gifs.map((gif) => <Gif key={gif.id} gif={gif} changeGif={changeGif} />)
      ) : error ? (
        <p>Error retrieving Gifs</p>
      ) : (
        <p>No Gifs Found</p>
      )}
    </div>
  );
};

export default Results;
