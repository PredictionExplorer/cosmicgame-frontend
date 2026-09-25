'use client';

import { useId, useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

import { useOperatorRoles } from '@/components/admin/useOperatorRoles';
import BanGestureTable from '@/components/tables/BanGestureTable';
import { useGestureList } from '@/hooks/useApiQuery';
import { useActiveWeb3React } from '@/hooks/web3';

/**
 * A line above the list that says why its controls are off. It never carries
 * a second Connect button: the site header's Connect is always in view, and
 * the operator header already says no wallet is connected.
 */
function ModerationNotice({
  id,
  testId,
  children,
}: {
  id?: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      data-testid={testId}
      className="flex items-start gap-2.5 rounded-surface bg-surface px-4 py-3 type-body-sm text-muted-foreground"
    >
      <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
      {children}
    </p>
  );
}

/**
 * The moderation list under the operator header: every gesture that carries
 * a message. Without a wallet the list is read-only and says how to
 * moderate. With one, Hide and Restore stand in each row, live only for a
 * wallet that holds an operator role: a wallet the header labels "No
 * on-chain role" sees them switched off, with the reason above the list,
 * instead of learning it from an error after a press. While the roles are
 * read the controls wait; a failed read leaves them live (the moderation
 * service has the last word).
 */
export default function AdminPage() {
  const t = useTranslations('admin');
  const { data, isLoading, isError, refetch } = useGestureList();
  const { account, active } = useActiveWeb3React();
  const moderatorAddress = active && account ? account : null;
  const { status: rolesStatus, roles } = useOperatorRoles(moderatorAddress);
  const noRoleId = useId();
  const noRole = moderatorAddress !== null && rolesStatus === 'ready' && roles.length === 0;
  const rolesPending = moderatorAddress !== null && rolesStatus === 'loading';

  const messages = useMemo(() => data?.filter((gesture) => gesture.Message !== '') ?? null, [data]);

  let notice: ReactNode = null;
  if (!moderatorAddress) {
    notice = (
      <ModerationNotice testId="moderation-read-only">{t('moderation.readOnly')}</ModerationNotice>
    );
  } else if (noRole) {
    notice = (
      <ModerationNotice id={noRoleId} testId="moderation-no-role">
        {t('moderation.noRole')}
      </ModerationNotice>
    );
  }

  return (
    <BanGestureTable
      title={t('moderation.heading')}
      description={t('moderation.description')}
      gestureHistory={messages ?? []}
      loading={isLoading || (messages === null && !isError)}
      // A failed refresh keeps the loaded messages; DataTable says so above them.
      error={isError ? t('moderation.loadError') : undefined}
      onRetry={() => void refetch()}
      moderatorAddress={moderatorAddress}
      actionsDisabled={noRole || rolesPending}
      actionsDisabledReasonId={noRole ? noRoleId : undefined}
      notice={notice}
    />
  );
}
