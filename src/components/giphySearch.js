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

const GiphySearch = () => {
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
    // const u = new URLSearchParams(myParams).toString();
    // console.log("these are special", u);

    let gifQuery = searchTerm;
    let jsonQuery = { gifSearch: `${searchTerm}` };

    let stringQuery = new URLSearchParams(jsonQuery).toString();

    let requestString = "/api/giphy?" + stringQuery;
    // console.log("this is the rquest string", requestString);

    let y = await fetch(requestString);

    let data = await y.json();
    // .json()
    // .then((response) => response.json())
    // .then((data) => console.log("here is the data the first time", data));

    console.log("trying data the first time again", data);

    // if (data.meta.status === 200) {
    //   console.log("setting gifs as these", [...data.data]);
    //   setGifs([...data.data]);
    //   setError(false);
    // } else {
    //   setError(true);
    // }
    // })
    // .catch(() => setError(true))
    // .finally(() => {
    //   setSearching(false);
    //   setSearched(true);
    // });

    return data;
  }

  // .then((data) => {
  //   if (data.meta.status === 200) {
  //     setGifs([...data.data]);
  //     setError(false);
  //   } else {
  //     setError(true);
  //   }
  // })
  // .catch(() => setError(true))
  // .finally(() => {
  //   setSearching(false);
  //   setSearched(true);
  // });

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const fetchController = new AbortController();

    // let data = getGiphyData(searchTerm);
    // console.log("HERE IS THE DATA", data);

    getGiphyData(searchTerm)
      // .then((res) => res.json())
      .then((data) => {
        if (data.meta.status === 200) {
          console.log("in here");
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

    //   if (data.meta.status === 200) {
    //     setGifs([...data.data]);
    //     setError(false);
    //   } else {
    //     setError(true);
    //   }
    // })
    // .catch(() => setError(true))
    // .finally(() => {
    //   setSearching(false);
    //   setSearched(true);
    // });

    return () => fetchController.abort();
  }, [searchTerm, searchLimit]);

  return (
    <>
      {/* <Header /> */}
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
          {!searching && searched && <Results gifs={gifs} error={error} />}
        </div>
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default GiphySearch;
