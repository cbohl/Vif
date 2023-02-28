import React, { useState, useEffect, useMemo, useRef } from "react";
import Search from "./search.js";
import Loader from "./loader.js";
import Results from "./results.js";

const debounce = (func, wait = 800) => {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
};

const GiphySearch = (changeGif) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLimit, setSearchLimit] = useState(30);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [gifs, setGifs] = useState([]);

  const initialRender = useRef(true);

  const handleSearchTermInput = useMemo(() =>
    debounce((inputValue) => {
      setSearching(true);
      setSearchTerm(inputValue);
    })
  );

  const handleSearchLimitInput = useMemo(() =>
    debounce((inputValue) => {
      if (inputValue > gifLimit) {
        inputValue = gifLimit;
      } else if (inputValue < 1) {
        inputValue = 1;
      }
      setSearching(true);
      setSearchLimit(inputValue);
    })
  );

  async function getGiphyData(searchTerm) {
    let gifQuery = searchTerm;
    let jsonQuery = { gifSearch: `${searchTerm}` };

    let stringQuery = new URLSearchParams(jsonQuery).toString();

    let requestString = "/api/giphy?" + stringQuery;

    let y = await fetch(requestString);

    let data = await y.json();

    return data;
  }

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const fetchController = new AbortController();

    getGiphyData(searchTerm)
      .then((data) => {
        if (data.meta.status === 200) {
          setGifs([...data.data]);
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => {
        setSearching(false);
        setSearched(true);
      });

    return () => fetchController.abort();
  }, [searchTerm, searchLimit]);

  return (
    <>
      <main>
        <div className='container'>
          <Search
            gifLimit={5}
            handleSearchTermInput={(e) => handleSearchTermInput(e.target.value)}
            handleSearchLimitInput={(e) =>
              handleSearchLimitInput(e.target.value)
            }
          />
          {searching && <Loader />}
          {!searching && searched && (
            <Results gifs={gifs} error={error} changeGif={changeGif} />
          )}
        </div>
      </main>
    </>
  );
};

export default GiphySearch;
