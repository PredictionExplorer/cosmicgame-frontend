import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import AdminPage from './AdminPage';

export const metadata: Metadata = createMetadata(
  'Admin | Cosmic Signature',
  'Administrative controls for the Cosmic Signature game. Manage game parameters, contract settings, and system configuration.',
  undefined,
  '/admin',
);

export default function Page() {
  return <AdminPage />;
}
