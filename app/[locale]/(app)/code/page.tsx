import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import { CodeSeoSummary } from './CodeSeoSummary';
import CodeViewer from './CodeViewer';

const description =
  'Explore the Cosmic Signature source code, rendering pipeline, contract repository, verification workflow, and CC0 public-domain license.';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Source Code | CC0 On-Chain Art Protocol',
  description,
  undefined,
  '/code',
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: 'Cosmic Signature Source Code',
            description,
            url: `${APP_ORIGIN}/code`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Source Code', path: '/code' },
          ]),
        ]}
      />
      <CodeSeoSummary />
      <CodeViewer />
    </>
  );
}
