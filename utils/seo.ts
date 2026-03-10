import { logoImgUrl } from './index';

interface OpenGraphItem {
  property?: string;
  name?: string;
  content: string;
}

export interface OpenGraphPageProps {
  title: string;
  description: string;
  openGraphData: OpenGraphItem[];
}

/**
 * Builds the standard OpenGraph + Twitter meta-tag props used by every page.
 * Pass a custom `imageUrl` for pages that feature a specific token image;
 * all other pages default to the site logo.
 */
export function createOpenGraphProps(
  title: string,
  description: string,
  imageUrl: string = logoImgUrl,
): OpenGraphPageProps {
  const openGraphData: OpenGraphItem[] = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];
  return { title, description, openGraphData };
}
