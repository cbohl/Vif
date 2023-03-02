import Gif from "./gif";

interface Fixed_width_downsampled {
  url: string;
}

interface Downsized_large {
  url: string;
}

interface Image {
  fixed_width_downsampled: Fixed_width_downsampled;
  downsized_large: Downsized_large;
}

interface GifObject {
  id: number;
  images: Image[];
  title: string;
}

const Results = ({
  gifs,
  error,
  changeGif,
}: {
  gifs: GifObject[];
  error: string;
  changeGif: Function;
}) => {
  return (
    <div className='gif-results grid grid-cols-3 gap-4 w-96' aria-live='polite'>
      {gifs.length > 0 && !error ? (
        gifs.map((gif: GifObject) => (
          <Gif key={gif.id} gif={gif} changeGif={changeGif} />
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
