import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Server-rendered header for the statistics section pages: the shared
 * `PageHeader` with the Insights eyebrow linked to the hub, so the H1 and
 * intro are in the initial HTML while the panels hydrate.
 */
export function StatisticsPageIntro({
  title,
  description,
}: {
  /** @deprecated The eyebrow is the section (Insights), set by the header. */
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return <PageHeader section="insights" title={title} subtitle={description} />;
}
