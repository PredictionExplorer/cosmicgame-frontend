import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import FAQPage from './FAQPage';

export const metadata: Metadata = createMetadata(
  'FAQ | Cosmic Signature',
  'Frequently Asked Questions (FAQ)',
);

export default function Page() {
  return <FAQPage />;
}
