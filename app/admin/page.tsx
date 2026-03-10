import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import AdminPage from './AdminPage';

export const metadata: Metadata = createMetadata(
  'Admin | Cosmic Signature',
  'Administrative methods',
);

export default function Page() {
  return <AdminPage />;
}
