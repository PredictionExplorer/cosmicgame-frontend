import { getTermsCopy } from '@/content/legal';
import type { LegalDocumentLabels } from '@/content/legal/labels';
import { TermsContent } from '@/content/legal/TermsContent';

export default function TermsPage({
  locale,
  labels,
}: {
  locale: string;
  labels: LegalDocumentLabels;
}) {
  return <TermsContent copy={getTermsCopy(locale)} locale={locale} labels={labels} />;
}
