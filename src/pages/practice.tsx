import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GiphySearch from "../components/giphySearch.js";

// import styles from "../app/page.module.css";

export default function Practice() {
  return (
    <div>
      <GiphySearch></GiphySearch>
      <h1>Test</h1>
    </div>
  );
}
