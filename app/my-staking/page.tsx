import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyStaking from './MyStaking';

export const metadata: Metadata = createMetadata(
  'My Staking | Cosmic Signature',
  'Manage your staking with Cosmic Signature. View your staking status, rewards, and history. Maximize your earnings and participate in the growth of our blockchain ecosystem with ease.',
  undefined,
  '/my-staking',
);

export default function Page() {
  return <MyStaking />;
}
