import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import Contracts from './Contracts';
import { ContractsSeoSummary } from './ContractsSeoSummary';

const description =
  'Find Cosmic Signature smart contract addresses, verification status, audits, formal verification notes, and Arbitrum deployment details.';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Contracts | Verified Arbitrum Smart Contracts',
  description,
  undefined,
  '/contracts',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: 'Cosmic Signature Contracts',
            description,
            url: `${APP_ORIGIN}/contracts`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contracts', path: '/contracts' },
          ]),
        ]}
      />
      <ContractsSeoSummary />
      <Contracts />
    </>
  );
}
