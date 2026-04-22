import type { Metadata } from 'next';

import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import PrivacyPage from './PrivacyPage';

export const metadata: Metadata = createMetadata(
  'Privacy Policy | Cosmic Signature',
  'Privacy Policy for Cosmic Signature — how we handle wallet data, transactions, security, and blockchain transparency.',
  undefined,
  '/privacy',
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ])}
      />
      <PrivacyPage />
    </>
  );
}
