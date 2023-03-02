import { NextApiRequest, NextApiResponse } from "next";

export default async function serverSideCall(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiUrl = "https://api.giphy.com/v1/gifs/search";
  const apiKey: string = process.env.GIPHY_API_KEY as string;

  const searchTerm: string = req.query["gifSearch"] as string;
  const searchLimit = 9;

  const fetchResult = await fetch(
    `${apiUrl}?api_key=${apiKey}&q=${searchTerm}&limit=${searchLimit}`
  );
  const fetchResultJson: JSON = (await fetchResult.json()) as JSON;

  res.status(200).json(fetchResultJson);
}
