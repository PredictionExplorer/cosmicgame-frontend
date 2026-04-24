'use client';

import { useMemo } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { useGestureList } from '@/hooks/useApiQuery';
import BanGestureTable from '@/components/tables/BanGestureTable';

const AdminPage = () => {
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
            Admin · Restricted
          </SectionEyebrow>
        }
        title="Admin"
        gradientTitle="signature"
        subtitle="Manage gestures and system administration"
      />
      <div>
        <h2 className="text-xl font-semibold mb-4">Gesture List</h2>
        {isLoading || gestureList === null ? (
          <p className="text-lg font-semibold" role="status">
            Loading...
          </p>
        ) : (
          <BanGestureTable gestureHistory={gestureList} />
        )}
      </div>
    </PageShell>
  );
};

export default AdminPage;
