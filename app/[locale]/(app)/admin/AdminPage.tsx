'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { useGestureList } from '@/hooks/useApiQuery';
import BanGestureTable from '@/components/tables/BanGestureTable';

const AdminPage = () => {
  const t = useTranslations('admin');
  const { data: bidListRaw, isLoading } = useGestureList();

  const gestureList = useMemo(
    () => bidListRaw?.filter((x) => x.Message !== '') ?? null,
    [bidListRaw],
  );

  return (
    <PageShell variant="data">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="rose" pulse>
            {t('page.eyebrow')}
          </SectionEyebrow>
        }
        title={t('page.title')}
        subtitle={t('page.subtitle')}
      />
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('page.gestureList')}</h2>
        <BanGestureTable
          gestureHistory={gestureList ?? []}
          loading={isLoading || gestureList === null}
        />
      </div>
    </PageShell>
  );
};

export default AdminPage;
