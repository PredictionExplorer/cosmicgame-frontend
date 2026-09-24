'use client';

import type { ComponentType, ReactNode } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import {
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  SignatureAllocationIcon,
} from '@/lib/conceptIcons';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import { useFormat } from '@/hooks/useFormat';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { AllocationSummary, GestureSummary, ProfileTitle } from './profileSummary';

const TITLE_ICON: Readonly<Record<ProfileTitle, ComponentType<{ className?: string }>>> = {
  signatureAllocation: SignatureAllocationIcon,
  enduranceChampion: EnduranceChampionIcon,
  chronoWarrior: ChronoWarriorIcon,
  finalCstGesture: FinalCstGestureIcon,
};

/** How a short list of cycle numbers is joined: "0, 1" or 0、1. */
const CYCLE_LIST_SEPARATOR: LocaleRecord<string> = {
  en: ', ',
  zh: '、',
  'zh-TW': '、',
  'zh-HK': '、',
  uk: ', ',
  ko: ', ',
  ja: '、',
  vi: ', ',
};

/**
 * "Copy address" beside the H1 that names the address, so the full address
 * is one tap from its short form rather than a chip below the figures.
 */
function CopyAddressAction({ address }: { address: string }) {
  const tCommon = useTranslations('common');
  const { copied, copy } = useCopyFeedback();
  return (
    <>
      <button
        type="button"
        onClick={() => void copy(address)}
        title={address}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'px-3')}
      >
        {copied ? (
          <Check aria-hidden className="text-positive" />
        ) : (
          <Copy aria-hidden className="text-subtle" />
        )}
        {copied ? tCommon('actions.copied') : tCommon('actions.copyAddress')}
      </button>
      <span role="status" className="sr-only">
        {copied ? tCommon('actions.copied') : ''}
      </span>
    </>
  );
}

export interface ProfileHeaderProps {
  address: string;
  isOwnProfile: boolean;
  gestures: GestureSummary | null;
  allocations: AllocationSummary | null;
  /** Wallet balances; `null` when the read failed. */
  balance: { eth: number; cst: number } | null;
  loading: boolean;
}

/**
 * A participant's identity header: who (the address as the H1 on another
 * participant's page, with "Copy address" and the explorer link beside it;
 * your own wallet's address as a chip on your own page), their recognitions
 * from allocation records as tags, and one row of figures that puts what the
 * address spent on gestures beside what it received, in neutral ink.
 */
export function ProfileHeader({
  address,
  isOwnProfile,
  gestures,
  allocations,
  balance,
  loading,
}: ProfileHeaderProps) {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const format = useFormat();
  const trail = useParticipantTrail();

  const pending = <Skeleton aria-hidden className="mt-1 h-6 w-24 lg:h-8" />;
  const figure = (value: ReactNode) => (loading ? pending : value);

  const figures: PageHeaderFigure[] = [
    {
      id: 'gestures',
      label: t('statistics.figures.gestures.label'),
      value: figure(gestures ? format.count(gestures.count) : null),
      caption:
        !loading && gestures && gestures.cycles > 0
          ? t('statistics.figures.gestures.caption', { count: gestures.cycles })
          : undefined,
    },
    {
      id: 'spent',
      label: t('statistics.figures.spent.label'),
      value: figure(gestures ? <Amount value={gestures.ethSpent} unit="ETH" /> : null),
      info: t('statistics.figures.spent.info'),
      caption:
        !loading && gestures && gestures.cstSpent > 0
          ? t('statistics.figures.spent.caption', {
              amount: format.amount(gestures.cstSpent, { unit: 'CST' }),
            })
          : undefined,
    },
    {
      id: 'received',
      label: t('statistics.figures.received.label'),
      value: figure(allocations ? <Amount value={allocations.ethReceived} unit="ETH" /> : null),
      info: t('statistics.figures.received.info'),
      caption:
        !loading && allocations
          ? t('statistics.figures.received.caption', { count: allocations.records })
          : undefined,
    },
    {
      id: 'balance',
      label: t('statistics.figures.balance.label'),
      value: figure(balance ? <Amount value={balance.eth} unit="ETH" /> : null),
      caption: !loading && balance ? format.amount(balance.cst, { unit: 'CST' }) : undefined,
    },
  ];

  const separator = pickByLocale(CYCLE_LIST_SEPARATOR, format.locale);
  const titles = allocations?.titles ?? [];

  // Another participant's page names the address in its H1 and copies it from beside it;
  // your own page's H1 is "My statistics", so the wallet's address sits here.
  const identity = (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 empty:hidden sm:mt-6">
      {isOwnProfile ? (
        <AddressChip address={address} display="responsive" label={false} href={false} />
      ) : null}
      {titles.length > 0 ? (
        <ul aria-label={t('statistics.titles.label')} className="flex flex-wrap gap-2">
          {titles.map(({ title, cycles }) => {
            const Icon = TITLE_ICON[title];
            return (
              <li key={title}>
                <Badge icon={<Icon />}>
                  {t('statistics.titles.entry', {
                    title: t(`statistics.titles.${title}`),
                    count: cycles.length,
                    cycles: cycles.join(separator),
                  })}
                </Badge>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );

  const explorerLink = (
    <a
      href={getExplorerUrl('address', address)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'px-3 no-underline')}
    >
      {tWallet('account.viewOnExplorer', { explorer: EXPLORER_NAME })}
      <ArrowUpRight aria-hidden className="text-subtle" />
    </a>
  );

  return (
    <PageHeader
      {...(isOwnProfile
        ? {
            section: 'account' as const,
            sectionHub: true,
            title: t('statistics.page.ownTitle'),
            subtitle: t('statistics.page.ownSubtitle'),
          }
        : {
            section: 'explore' as const,
            breadcrumbs: trail,
            title: (
              <>
                <span className="sr-only">{t('statistics.page.participant')} </span>
                <span className="font-mono font-medium tracking-normal [word-spacing:normal]">
                  {formatAddress(address)}
                </span>
              </>
            ),
            subtitle: t('statistics.page.userSubtitle'),
          })}
      actions={
        isOwnProfile ? (
          explorerLink
        ) : (
          <>
            <CopyAddressAction address={address} />
            {explorerLink}
          </>
        )
      }
      figures={figures}
    >
      {identity}
    </PageHeader>
  );
}
