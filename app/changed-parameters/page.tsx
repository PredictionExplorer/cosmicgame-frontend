import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import ChangedParameters from './ChangedParameters';

export const metadata: Metadata = createMetadata(
  'Changed Parameters | Cosmic Signature',
  'Changed Parameters',
);

export default function Page() {
  return <ChangedParameters />;
}
