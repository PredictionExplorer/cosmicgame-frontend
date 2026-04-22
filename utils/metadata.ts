import axios from 'axios';

import { reportError } from './errors';

/** Axios instance without Cosmic API interceptors (see `services/api/client.ts`). Used for third-party HTML fetches. */
let metadataHttp: ReturnType<typeof axios.create> | null = null;

function getMetadataHttp() {
  if (!metadataHttp) {
    metadataHttp = axios.create({ timeout: 25_000 });
  }
  return metadataHttp;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

/**
 * Fetches and parses metadata (title, description, keywords, og:image)
 * from a remote URL.
 *
 * @param url - The target page URL to scrape metadata from.
 * @returns Parsed metadata object, or `null` if the fetch fails.
 */
export async function getMetadata(url: string): Promise<PageMetadata | null> {
  try {
    const { data: html } = await getMetadataHttp().get<string>(url);

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
