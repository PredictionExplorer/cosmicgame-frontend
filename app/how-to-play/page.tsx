import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import HowToPlayPage from './HowToPlayPage';

export const metadata: Metadata = createMetadata(
  'How It Works | Cosmic Signature',
  'Learn how a Cosmic Signature Performance Cycle unfolds \u2014 from the Calibration Window through Gestures to final allocation distribution.',
  undefined,
  '/how-to-play',
);

export default function Page() {
  return <HowToPlayPage />;
}
