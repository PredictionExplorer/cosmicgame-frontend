import { PrivacyContentEn } from '@/content/legal/PrivacyContent.en';
import { PrivacyContentZh } from '@/content/legal/PrivacyContent.zh';

export default function PrivacyPage({ locale = 'en' }: { locale?: string }) {
  return locale.toLowerCase().startsWith('zh') ? <PrivacyContentZh /> : <PrivacyContentEn />;
}
