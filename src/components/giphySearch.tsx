import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  PropsWithChildren,
} from "react";
import Search from "./search";
import Loader from "./loader";
import Results from "./results";

interface Meta {
  status: number;
}
interface APIRequestResult {
  meta: Meta;
  data: [];
}

interface ChangeGifProps extends PropsWithChildren {
  changeGif: (url: string) => void;
}

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

const GiphySearch = (changeGif: ChangeGifProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [searchLimit, setSearchLimit] = useState(30);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [gifs, setGifs] = useState([]);

  const initialRender = useRef(true);

  const handleSearchTermInput = useMemo(
    () =>
      debounce((inputValue: string) => {
        setSearching(true);
        setSearchTerm(inputValue);
      }),
    []
  );

  // GifLimit is hard coded for now.

  // const handleSearchLimitInput = useMemo(
  //   () =>
  //     debounce((inputValue: string) => {
  //       if (inputValue > gifLimit) {
  //         inputValue = gifLimit;
  //       } else if (inputValue < 1) {
  //         inputValue = 1;
  //       }
  //       setSearching(true);
  //       setSearchLimit(inputValue);
  //     }),
  //   []
  // );

  async function getGiphyData(searchTerm: string) {
    const jsonQuery = { gifSearch: `${searchTerm}` };

    const stringQuery = new URLSearchParams(jsonQuery).toString();

    const requestString = "/api/giphy?" + stringQuery;

    const fetchResults = await fetch(requestString);

    const data: APIRequestResult =
      (await fetchResults.json()) as APIRequestResult;

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
  }, [
    searchTerm,
    // searchLimit
  ]);

  return (
    <>
      <main>
        <div className='container'>
          <Search
            gifLimit={9}
            handleSearchTermInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target) {
                handleSearchTermInput(e.target.value);
              }
            }}
            // handleSearchLimitInput={(
            //   e: React.ChangeEvent<HTMLInputElement>
            // ) => {
            //   if (e.target) {
            //     handleSearchLimitInput(e.target.value);
            //   }
            // }}
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
