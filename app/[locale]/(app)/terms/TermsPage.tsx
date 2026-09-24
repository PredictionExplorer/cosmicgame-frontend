import { getTermsCopy } from '@/content/legal';
import { TermsContent } from '@/content/legal/TermsContent';
import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';

export default function TermsPage({ locale = 'en' }: { locale?: string }) {
  return (
    <TermsContent
      copy={getTermsCopy(locale)}
      tabs={<TrustCenterTabs current="terms" locale={locale} />}
    />
  );
}
