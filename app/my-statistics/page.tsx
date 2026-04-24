import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyStatistics from './MyStatistics';

export const metadata: Metadata = createMetadata(
  'My Statistics | Cosmic Signature',
  "Track your performance with Cosmic Signature's My Statistics page. View detailed gesture history, anchor status, distributions, and more. Stay informed and optimize your participation in our on-chain protocol.",
  undefined,
  '/my-statistics',
);

export default function Page() {
  return <MyStatistics />;
}
