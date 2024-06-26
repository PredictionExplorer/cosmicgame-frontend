// pages/api/proxy.js
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  api: {
    responseLimit: false,
  },
}
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing' });
    }

    // Make a request to the external HTTP endpoint
    const response = await axios.get(url as string);

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Proxy request failed', error });
  }
};
