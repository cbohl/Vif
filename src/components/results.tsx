import React, { PropsWithChildren } from "react";
import Gif from "./gif";

interface SpecificImageProps {
  url: string;
}

interface ImagesProps {
  fixed_width_downsampled: SpecificImageProps;
  downsized_large: SpecificImageProps;
}

interface GifObject {
  id: number;
  images: ImagesProps;
  title: string;
}

interface ChangeGifProps extends PropsWithChildren {
  changeGif: (url: string) => void;
}

const Results = ({
  gifs,
  error,
  changeGif,
}: {
  gifs: GifObject[];
  error: boolean;
  changeGif: ChangeGifProps;
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
