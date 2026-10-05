'use client';

import { useMemo, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SelectionShare } from '@/components/user-statistics/SelectionShare';
import {
  useDashboardInfo,
  useStellarSelectionDepositsByUser,
  useStellarSelectionNFTAllocationsByUser,
  useUserInfo,
} from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';
import { StellarSelectionIcon } from '@/lib/conceptIcons';
import { getSelectionShare } from '@/lib/selectionStanding';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { STELLAR_SELECTION_FAQ_HREF, type StellarSelectionKind } from './StellarSelectionHeader';

const SIBLING: Record<StellarSelectionKind, StellarSelectionKind> = { eth: 'nft', nft: 'eth' };
const GROUP: Record<StellarSelectionKind, 'stellarSelectionEth' | 'stellarSelectionNft'> = {
  eth: 'stellarSelectionEth',
  nft: 'stellarSelectionNft',
};

interface StellarSelectionEmptyProps {
  kind: StellarSelectionKind;
  /** The participant, checksummed. */
  address: string;
}

/**
 * What a participant's Stellar Selection page says while nothing of this
 * kind was selected for them: the reason, then what they can act on or
 * learn. Their place in the live cycle's pool (the profile's meter: "293 of
 * 1,147 gestures"), when they have gestures in it; the sibling page with its
 * count, when it holds anything; and how selection works. Read only for an
 * empty page, so a full one costs nothing extra.
 */
export function StellarSelectionEmpty({ kind, address }: StellarSelectionEmptyProps) {
  const t = useTranslations('statistics');
  const format = useFormat();
  const sibling = SIBLING[kind];

  const dashboard = useDashboardInfo(undefined, { poll: false });
  const user = useUserInfo(address);
  // The sibling kind's list: the ETH page reads the NFTs, and the NFT page the ETH.
  const siblingNfts = useStellarSelectionNFTAllocationsByUser(sibling === 'nft' ? address : null);
  const siblingEth = useStellarSelectionDepositsByUser(sibling === 'eth' ? address : null);
  const siblingRows = sibling === 'nft' ? siblingNfts.data : siblingEth.data;

  const cycle = toFiniteNumber(dashboard.data?.CurRoundNum);
  const share = useMemo(() => {
    const started = (toFiniteNumber(dashboard.data?.TsRoundStart) ?? 0) > 0;
    const gestures = user.data?.Gestures;
    if (cycle === null || !started || !gestures) return null;
    return getSelectionShare({
      totalGestures: toFiniteNumber(dashboard.data?.CurNumBids) ?? 0,
      myGestures: gestures.filter((gesture) => gesture.RoundNum === cycle).length,
    });
  }, [cycle, dashboard.data?.CurNumBids, dashboard.data?.TsRoundStart, user.data?.Gestures]);

  const actions: ReactNode[] = [];
  if (siblingRows && siblingRows.length > 0) {
    actions.push(
      <Link
        key="sibling"
        href={`/user/stellar-selection-${sibling}/${address}`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {t(`${GROUP[sibling]}.heading`)}
        <Badge size="sm" className="tabular-nums">
          {format.count(siblingRows.length)}
        </Badge>
      </Link>,
    );
  }
  actions.push(
    <Link
      key="faq"
      href={STELLAR_SELECTION_FAQ_HREF}
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
    >
      {t('stellarSelectionPages.howItWorks')}
      <ArrowRight aria-hidden className="size-4" />
    </Link>,
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-2 pb-10">
      <EmptyState
        variant="panel"
        headingLevel={2}
        icon={<StellarSelectionIcon aria-hidden className="size-6" />}
        title={t(`${GROUP[kind]}.emptyTitle`)}
        description={t(`${GROUP[kind]}.emptyDescription`)}
        action={<div className="flex flex-wrap justify-center gap-3">{actions}</div>}
        className="pt-10 pb-8 sm:pt-14"
      />
      {share && cycle !== null ? (
        <SelectionShare
          share={share}
          cycle={cycle}
          ethSelections={toFiniteNumber(dashboard.data?.NumRaffleEthWinnersBidding)}
          nftSelections={toFiniteNumber(dashboard.data?.NumRaffleNFTWinnersBidding)}
        />
      ) : null}
    </div>
  );
}
