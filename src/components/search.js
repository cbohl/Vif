const Search = ({ handleSearchTermInput }) => {
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
    </div>
  );
};

export default Search;
