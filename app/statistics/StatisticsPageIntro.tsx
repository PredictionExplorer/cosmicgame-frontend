import { SectionEyebrow } from '@/components/ui/section-eyebrow';

/**
 * Server-rendered heading block for statistics section pages. Keeps an h1 and
 * intro copy in the initial HTML for crawlers while the interactive content
 * hydrates client-side.
 */
export function StatisticsPageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-10">
      <SectionEyebrow tone="aurora">Protocol Statistics · Arbitrum</SectionEyebrow>
      <h1 className="mt-4 type-display-md text-foreground">{title}</h1>
      <p className="mt-3 max-w-3xl type-body-lg text-muted-foreground">{description}</p>
    </header>
  );
}
