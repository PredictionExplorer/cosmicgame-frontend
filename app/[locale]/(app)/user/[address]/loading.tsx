import { useTranslations } from 'next-intl';

import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { SITE_EDGE_SHELL_CLASS } from '@/components/statistics/shell';
import {
  PROFILE_HEADER_WITH_NAV_CLASS,
  ProfileSectionNavPlaceholder,
} from '@/components/user-statistics/ProfileSectionNav';

/** A figure's value while it loads: one line of its slot tall, as the profile's own header draws it. */
const PENDING_VALUE = (
  <span aria-hidden className="flex h-[1lh] items-center">
    <Skeleton as="span" className="block h-6 w-24 lg:h-8" />
  </span>
);

/**
 * A participant's profile while its first render streams in, drawn with the
 * profile's own header: the trail, the H1 slot, the lede, the two actions and
 * the four figure labels in place, the contents rail's rule, then the body's
 * loading rows at the height the sections take. Nothing moves when the page replaces it; only the
 * placeholders fill in.
 */
export default function UserProfileLoading() {
  const t = useTranslations('myPages');
  const tCommon = useTranslations('common');
  const trail = useParticipantTrail();
  const figure = (id: string, withInfo: boolean): PageHeaderFigure => ({
    id,
    label: t(`statistics.figures.${id}.label`),
    value: PENDING_VALUE,
    info: withInfo ? t(`statistics.figures.${id}.info`) : undefined,
  });

  return (
    <PageShell variant="data" className={SITE_EDGE_SHELL_CLASS}>
      <span role="status" className="sr-only">
        {tCommon('status.loadingEllipsis')}
      </span>
      <PageHeader
        section="explore"
        breadcrumbs={trail}
        title={
          <>
            <span className="sr-only">{t('statistics.page.participant')}</span>
            <Skeleton as="span" className="inline-block h-[0.8em] w-[11ch] align-middle" />
          </>
        }
        subtitle={t('statistics.page.userSubtitle')}
        actions={
          <>
            <Skeleton className="h-9 w-32 rounded-control" />
            <Skeleton className="h-9 w-40 rounded-control" />
          </>
        }
        figures={[
          figure('gestures', false),
          figure('spent', true),
          figure('received', true),
          figure('balance', false),
        ]}
        className={PROFILE_HEADER_WITH_NAV_CLASS}
      >
        {/* The whole address's row, at the height the profile's own row keeps. */}
        <div aria-hidden className="mt-5 flex min-h-6 items-center sm:mt-6">
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </PageHeader>
      <ProfileSectionNavPlaceholder />
      <div className="min-h-svh">
        <SkeletonTable announce={false} rows={6} columns={4} />
      </div>
    </PageShell>
  );
}
