import type { Metadata } from 'next';

import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import TermsPage from './TermsPage';

export const metadata: Metadata = createMetadata(
  'Terms of Service | Cosmic Signature',
  'Terms of Service for Cosmic Signature \u2014 eligibility, protocol mechanics, allocations, risks, prohibited activities, and legal terms.',
  undefined,
  '/terms',
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ])}
      />
      <TermsPage />
    </>
  );
}
