const Search = ({
  gifLimit,
  handleSearchTermInput,
  handleSearchLimitInput,
}) => {
  return (
    <div className='gif-search'>
      <div className='gif-search__field'>
        <label htmlFor='search' className='gif-search__label'>
          GIF Search (click to send):
        </label>
        <input
          type='text'
          id='search'
          className='bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500'
          placeholder='e.g. funny cats'
          onChange={handleSearchTermInput}
        />
      </div>

      {/* <div className='gif-search__field'>
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
      </div> */}
    </div>
  );
};

export default Search;
