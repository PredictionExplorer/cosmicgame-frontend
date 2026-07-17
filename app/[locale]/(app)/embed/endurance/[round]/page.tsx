import type { Metadata } from 'next';

import EmbedEnduranceChart from './EmbedEnduranceChart';

export const metadata: Metadata = {
  title: 'Endurance & Chrono Timeline',
  robots: { index: false, follow: false },
};

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  return <EmbedEnduranceChart roundNum={parseInt(round, 10)} />;
}
