import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import AdminSettingsPage from './AdminSettingsPage';

export const metadata: Metadata = createMetadata(
  'Admin Settings | Cosmic Signature',
  'Administrative settings and contract management',
);

export default function Page() {
  return <AdminSettingsPage />;
}
