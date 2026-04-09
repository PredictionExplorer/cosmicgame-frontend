import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import ChangedParameters from './ChangedParameters';

export const metadata: Metadata = createMetadata(
  'Changed Parameters | Cosmic Signature',
  'Review the complete history of game parameter changes in Cosmic Signature. Track adjustments to bid increments, time additions, reward distributions, and other system settings.',
  undefined,
  '/changed-parameters',
);

export default function Page() {
  return <ChangedParameters />;
}
