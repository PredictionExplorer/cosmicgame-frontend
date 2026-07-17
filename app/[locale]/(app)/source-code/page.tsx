import { permanentRedirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SourceCodeAliasPage({ params }: PageProps) {
  const { locale } = await params;
  permanentRedirect({ href: '/code', locale: locale ?? routing.defaultLocale });
}
