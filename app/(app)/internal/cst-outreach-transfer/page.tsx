import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CstOutreachTransferPage from './CstOutreachTransferPage';

export const metadata: Metadata = createMetadata(
  'CST Outreach Transfer | Cosmic Signature',
  'Restricted CST transfer tool for the configured outreach reserve wallet signer.',
  undefined,
  '/internal/cst-outreach-transfer',
  { index: false },
);

export default function Page() {
  return <CstOutreachTransferPage />;
}
