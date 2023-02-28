type Data = {
  name: string;
};

export default async function serverSideCall(req: any, res: any) {
  const apiUrl = "https://api.giphy.com/v1/gifs/search";
  const apiKey = process.env.GIPHY_API_KEY;

  const searchTerm = req.query["gifSearch"];
  const searchLimit = 9;

  let fetchResultJson;

  const fetchResult = await fetch(
    `${apiUrl}?api_key=${apiKey}&q=${searchTerm}&limit=${searchLimit}`
  );

  fetchResultJson = await fetchResult.json();

  res.status(200).json(fetchResultJson);
}
