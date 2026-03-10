import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CodeViewer from './CodeViewer';

export const metadata: Metadata = createMetadata('Code | Cosmic Signature', 'Code');

export default function Page() {
  return <CodeViewer />;
}
