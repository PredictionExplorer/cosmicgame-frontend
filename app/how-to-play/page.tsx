import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import HowToPlayPage from './HowToPlayPage';

export const metadata: Metadata = createMetadata(
  'How To Play Guide | Cosmic Signature',
  'Learn how to play Cosmic Signature with our comprehensive guide. Discover game rules, strategies, and tips to enhance your gameplay experience. Start mastering the cosmic adventure today!',
);

export default function Page() {
  return <HowToPlayPage />;
}
