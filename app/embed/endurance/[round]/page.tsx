import type { Metadata } from 'next';

import EmbedEnduranceChart from './EmbedEnduranceChart';

export const metadata: Metadata = {
  title: 'Endurance & Chrono Timeline',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  return <EmbedEnduranceChart roundNum={parseInt(round, 10)} />;
}
