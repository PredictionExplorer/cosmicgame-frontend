import axios from 'axios';

import { reportError } from './errors';
import { getProxiedUrl } from './urls';

// Fetches metadata (title, description, keywords, image) from a given URL
export async function getMetadata(url: string) {
  try {
    const { data: html } = await axios.get(getProxiedUrl(url));

    // Extract metadata from the HTML content using regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';

    const descriptionMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
    );
    const description = descriptionMatch ? descriptionMatch[1] : '';

    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i);
    const keywords = keywordsMatch ? keywordsMatch[1] : '';

    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    const image = imageMatch ? imageMatch[1] : '';

    return { title, description, keywords, image };
  } catch (error) {
    reportError(error, 'fetch page metadata');
    return null;
  }
}
