import { getPrivacyCopy } from '@/content/legal';
import { PrivacyContent } from '@/content/legal/PrivacyContent';
import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';

export default function PrivacyPage({ locale = 'en' }: { locale?: string }) {
  return (
    <PrivacyContent
      copy={getPrivacyCopy(locale)}
      tabs={<TrustCenterTabs current="privacy" locale={locale} />}
    />
  );
}
