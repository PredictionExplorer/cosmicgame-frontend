import { getPrivacyCopy } from '@/content/legal';
import { PrivacyContent } from '@/content/legal/PrivacyContent';

export default function PrivacyPage({ locale = 'en' }: { locale?: string }) {
  return <PrivacyContent copy={getPrivacyCopy(locale)} />;
}
