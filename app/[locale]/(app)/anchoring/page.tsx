import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { PageMessages } from '@/components/i18n/PageMessages';
import { AnchoringQuestions } from '@/components/anchoring/AnchoringQuestions';
import { AnchoringSteps } from '@/components/anchoring/AnchoringSteps';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import AnchoringPage from './AnchoringPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('anchoring.title'), t('anchoring.description'), undefined, '/anchoring', {
    locale,
  });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'anchoring' });

  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <AnchoringPage
        steps={<AnchoringSteps />}
        questions={<AnchoringQuestions className="mt-[var(--block-gap)] sm:mt-20" />}
        seoSummary={
          <PublicDataRouteSeoSummary
            route="anchoring"
            actions={
              <Link href="/my-anchors" className={buttonVariants({ variant: 'default' })}>
                {t('overview.start')}
                <ArrowRight aria-hidden />
              </Link>
            }
          />
        }
      />
    </PageMessages>
  );
}
