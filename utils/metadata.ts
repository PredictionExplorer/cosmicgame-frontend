import { reportError } from './errors';

/**
 * Third-party HTML fetches use plain `fetch` — deliberately not axios.
 * This module is re-exported through the `@/utils` barrel, so an axios
 * import here used to drag the whole HTTP client into every bundle that
 * touched any util (including the marketing host, which otherwise ships no
 * transport stack at all).
 */
const METADATA_TIMEOUT_MS = 25_000;

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
    const response = await fetch(url, { signal: AbortSignal.timeout(METADATA_TIMEOUT_MS) });
    if (!response.ok) {
      throw new Error(`metadata fetch failed with status ${response.status}`);
    }
    const html = await response.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch?.[1] ?? '';

    const descriptionMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
    );
    const description = descriptionMatch?.[1] ?? '';

    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["'](.*?)["']/i);
    const keywords = keywordsMatch?.[1] ?? '';

    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    const image = imageMatch?.[1] ?? '';

    return { title, description, keywords, image };
  } catch (error) {
    reportError(error, 'fetch page metadata');
    return null;
  }
}
