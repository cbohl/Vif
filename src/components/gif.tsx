import React from "react";

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

const Gif = ({ gif, changeGif }: { gif: GifObject; changeGif: any }) => {
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
