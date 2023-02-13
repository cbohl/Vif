const Gif = ({ gif, changeGif, changeGif2 }) => {
  // debugger;
  return (
    // <div className='gif' onClick={changeGif(gif.id)}>
    <div className='gif'>
      <div
        onClick={() => changeGif2.changeGif2(gif.images.downsized_large.url)}
      >
        {/* <a
          className='gif__link'
          href={gif.images.original.url}
          aria-label={gif.title}
          target='_blank'
          rel='noopener noreferrer'
        > */}
        <img
          src={gif.images.fixed_width_downsampled.url}
          className='gif__image'
          alt={gif.title}
        />
      </div>
      {/* </a> */}
    </div>
  );
};

export default Gif;
