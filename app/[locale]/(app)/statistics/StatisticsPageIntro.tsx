import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Server-rendered header for the statistics section pages: the shared
 * `PageHeader` with the Explore eyebrow linked to the hub, so the H1 and
 * intro are in the initial HTML while the panels hydrate.
 */
export function StatisticsPageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <PageHeader section="explore" title={title} subtitle={description} />;
}
