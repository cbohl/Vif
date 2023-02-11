const Search = ({
  gifLimit,
  handleSearchTermInput,
  handleSearchLimitInput,
}) => {
  return (
    <div className='gif-search'>
      <div className='gif-search__field'>
        <label htmlFor='search' className='gif-search__label'>
          GIF Search:
        </label>
        <input
          type='text'
          id='search'
          className='gif-search__input gif-search__input--term'
          placeholder='e.g. funny cats'
          onChange={handleSearchTermInput}
        />
      </div>
      <div className='gif-search__field'>
        <label htmlFor='limit' className='gif-search__label'>
          No. of GIFs:
        </label>
        <input
          type='number'
          id='limit'
          className='gif-search__input gif-search__input--limit'
          placeholder='e.g. 30'
          defaultValue='30'
          min='1'
          max={gifLimit}
          onChange={handleSearchLimitInput}
        />
      </div>
    </div>
  );
};

export default Search;
