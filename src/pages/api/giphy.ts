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
  //   const {
  // query: { firstName, lastName },
  //   } = req;
  //   const baseUrl = `https://api.example-product.com/v1/search?
  //         lastName=${lastName}&firstName=${firstName}
  //         &apiKey=${process.env.KEY}
  //     `;
  //   const response = await fetch(baseUrl);
  res.status(200).json({
    data: { something: "something more" },
  });
  //   req.json({ test: "supertest" });
}
