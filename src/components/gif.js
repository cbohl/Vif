const Gif = ({ gif, changeGif }) => {
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
