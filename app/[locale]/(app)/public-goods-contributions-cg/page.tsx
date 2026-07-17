import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import CharityCGDeposits from './CharityCGDeposits';

export const metadata: Metadata = createMetadata(
  'Protocol Public-Goods Contributions | Cosmic Signature',
  'Automatic forwards from the Cosmic Signature protocol to the Public Goods Beneficiary. Each cycle, a fixed share of the Cycle Reserve is forwarded to support public goods via the Cosmic Council.',
  undefined,
  '/public-goods-contributions-cg',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="public-goods-contributions-cg" />
      <CharityCGDeposits />
    </>
  );
}
