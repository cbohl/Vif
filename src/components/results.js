import Gif from "./gif.js";

const Results = ({ gifs, error }) => {
  return (
    <div className='gif-results' aria-live='polite'>
      {gifs.length > 0 && !error ? (
        gifs.map((gif) => <Gif key={gif.id} gif={gif} />)
      ) : error ? (
        <p>Error retrieving Gifs</p>
      ) : (
        <p>No Gifs Found</p>
      )}
    </div>
  );
};

export default Results;
