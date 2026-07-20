import { TermsContentEn } from '@/content/legal/TermsContent.en';
import { TermsContentZh } from '@/content/legal/TermsContent.zh';

export default function TermsPage({ locale = 'en' }: { locale?: string }) {
  return locale.toLowerCase().startsWith('zh') ? <TermsContentZh /> : <TermsContentEn />;
}
