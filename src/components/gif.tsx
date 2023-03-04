import React, { PropsWithChildren } from "react";

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

const Gif = ({
  gif,
  changeGif,
}: {
  gif: GifObject;
  changeGif: ChangeGifProps;
}) => {
  return (
    <div className='gif'>
      <div onClick={() => changeGif.changeGif(gif.images.downsized_large.url)}>
        <img
          src={gif.images.fixed_width_downsampled.url}
          className='gif__image'
          alt={gif.title}
        />
      </div>
    </div>
  );
};

export default Gif;
