import { getPrivacyCopy } from '@/content/legal';
import type { LegalDocumentLabels } from '@/content/legal/labels';
import { PrivacyContent } from '@/content/legal/PrivacyContent';

export default function PrivacyPage({
  locale,
  labels,
}: {
  locale: string;
  labels: LegalDocumentLabels;
}) {
  return <PrivacyContent copy={getPrivacyCopy(locale)} locale={locale} labels={labels} />;
}
