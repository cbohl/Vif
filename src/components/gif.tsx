import React from "react";

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

const Gif = ({ gif, changeGif }: { gif: GifObject; changeGif: () => void }) => {
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
