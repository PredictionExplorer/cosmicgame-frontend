import { getTermsCopy } from '@/content/legal';
import { TermsContent } from '@/content/legal/TermsContent';

export default function TermsPage({ locale = 'en' }: { locale?: string }) {
  return <TermsContent copy={getTermsCopy(locale)} />;
}
