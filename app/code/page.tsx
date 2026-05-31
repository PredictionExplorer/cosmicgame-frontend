import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { CodeSeoSummary } from './CodeSeoSummary';
import CodeViewer from './CodeViewer';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Source Code | CC0 On-Chain Art Protocol',
  'Explore the Cosmic Signature source code, rendering pipeline, contract repository, verification workflow, and CC0 public-domain license.',
  undefined,
  '/code',
);

export default function Page() {
  return (
    <>
      <CodeSeoSummary />
      <CodeViewer />
    </>
  );
}
