// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

// export default function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
// ) {
//   console.log(process.env.GIPHY_API_KEY);
//   //   res.status(200).json({ name: "John Doe" });
//   res.json({ name: "John Doe" });
// }

export default async function serverSideCall(req: any, res: any) {
  console.log("this is the req to the server", req);
  console.log("this is the req query", req.query);
  console.log("this is the search term", req.query["gifSearch"]);

  const apiUrl = "https://api.giphy.com/v1/gifs/search";
  const apiKey = process.env.GIPHY_API_KEY;
  // const gifLimit = 50;

  const searchTerm = req.query["gifSearch"];
  const searchLimit = 9;

  console.log("this is the real search term", searchTerm);

  let x;

  const fetchString = `${apiUrl}?api_key=${apiKey}&q=${searchTerm}&limit=${searchLimit}`;
  console.log("this is the fetch string", fetchString);

  const y = await fetch(
    `${apiUrl}?api_key=${apiKey}&q=${searchTerm}&limit=${searchLimit}`
  );
  // .then((res) => res.json())
  // .then((data) => {
  //   console.log("here is the result", data);
  //   let x = data;
  // })
  // .then(() => {
  //   console.log("here is the result again", x);
  // });

  x = await y.json();

  console.log("here is is for real", x);
  // console.log("here is the result again", x);

  // res.status(200).json({
  //   data: { something: "something more" },
  // });

  res.status(200).json(x);
}
