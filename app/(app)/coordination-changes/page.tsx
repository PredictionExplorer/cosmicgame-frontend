import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import ChangedParameters from './ChangedParameters';

export const metadata: Metadata = createMetadata(
  'Coordination Changes | Cosmic Signature',
  'Complete history of protocol parameter adjustments in Cosmic Signature. Track Gesture-Cost step-ups, cycle time additions, Anchor Distribution settings, and other coordination updates.',
  undefined,
  '/coordination-changes',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="coordination-changes" />
      <ChangedParameters />
    </>
  );
}
