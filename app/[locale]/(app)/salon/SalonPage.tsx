'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api';
import { isTxBusy } from '@/lib/txStage';
import { useActiveWeb3React } from '@/hooks/web3';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { useSalonActions } from '@/hooks/useSalonActions';
import { useSalonCredit, useSalonExhibits, useSalonFacts } from '@/hooks/useSalonLots';
import { PageHeader } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';

import { SalonLotCard } from './SalonLotCard';

/**
 * The Salon: the extra Signatures each cycle's finalization places on open
 * offer. Everything on the page is read from the chain itself — the lots,
 * their clocks and the fixed terms — because the salon ships with the V4
 * contracts and the API has no view of it yet. The artwork's seeds come
 * from the token API and degrade to the designed unavailable plate.
 */
const SalonPage = () => {
  const t = useTranslations('salon');
  const format = useFormat();
  const { account } = useActiveWeb3React();
  const nowMs = useNow(1000);

  const { exhibits, clockSkewSeconds, isPending, isError, salonAddress } = useSalonExhibits();
  // The lots' windows run on block time: on a live chain the skew is a few
  // seconds; on a local chain whose clock was advanced it is days.
  const nowSeconds = Math.floor(nowMs / 1000) + clockSkewSeconds;
  const facts = useSalonFacts();
  const credit = useSalonCredit(account ?? undefined);
  const { placeOffer, concludeLot, retrievePiece, retrieveReturnedOffers, txStage } =
    useSalonActions();
  const busy = isTxBusy(txStage);

  // The lots' artwork: seeds and imprint times from the token API, lenient —
  // a missing record leaves the designed unavailable plate, never an error.
  const lotIds = useMemo(
    () => (exhibits ?? []).flatMap((exhibit) => exhibit.lots.map((lot) => lot.nftId)),
    [exhibits],
  );
  const { data: tokenInfos } = useQuery({
    queryKey: ['salonTokenInfo', lotIds.join(',')],
    enabled: lotIds.length > 0,
    staleTime: 60_000,
    queryFn: () => Promise.all(lotIds.map((id) => api.get_cst_info(id))),
  });
  const tokenById = useMemo(() => {
    const map = new Map<number, CSTTokenInfo>();
    for (const info of tokenInfos ?? []) {
      if (info) map.set(info.TokenId, info);
    }
    return map;
  }, [tokenInfos]);

  const termsLine = facts
    ? t('terms', {
        lots: format.count(facts.lotsPerCycle),
        openingDelay: format.duration(facts.openingDelaySeconds, { maxUnits: 1 }),
        offerWindow: format.duration(facts.offerWindowSeconds, { maxUnits: 1 }),
        raise: format.percent(100 / facts.minimumRaiseDivisor),
        extension: format.duration(facts.closingExtensionSeconds, { maxUnits: 2 }),
      })
    : null;

  return (
    <PageShell variant="data" backdrop="subtle">
      <PageHeader section="participate" title={t('title')} subtitle={t('subtitle')} />
      {termsLine && <p className="type-caption text-muted-foreground">{termsLine}</p>}

      {account && credit > 0n && (
        <div className="rounded-surface bg-surface flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <p className="type-body">
            {t('credit.notice')} <Amount value={credit} unit="ETH" context="exact" />
          </p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void retrieveReturnedOffers(credit)}
          >
            {t('credit.retrieve')}
          </Button>
        </div>
      )}

      {!account && (
        <WalletRequiredState
          variant="panel"
          className="rounded-surface bg-surface"
          title={t('connect.title')}
          description={t('connect.description')}
        />
      )}

      {isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          headingLevel={2}
          title={t('readFailed.title')}
          message={t('readFailed.message')}
        />
      ) : !salonAddress ? (
        <EmptyState title={t('absent.title')} description={t('absent.description')} />
      ) : !exhibits || exhibits.length === 0 ? (
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      ) : (
        exhibits.map((exhibit, exhibitIndex) => (
          <section key={exhibit.cycle} aria-labelledby={`salon-cycle-${exhibit.cycle}`}>
            <SectionHeader
              id={`salon-cycle-${exhibit.cycle}`}
              title={t('exhibit.title', { cycle: format.count(exhibit.cycle) })}
              description={t('exhibit.description')}
            />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {exhibit.lots.map((lot, lotIndex) => {
                const info = tokenById.get(lot.nftId);
                return (
                  <SalonLotCard
                    key={lot.nftId}
                    lot={lot}
                    seed={info?.Seed ?? null}
                    imprintedAt={info?.MintTimeStamp ?? null}
                    account={account ?? undefined}
                    busy={busy}
                    nowSeconds={nowSeconds}
                    priority={exhibitIndex === 0 && lotIndex < 4}
                    onOffer={placeOffer}
                    onConclude={concludeLot}
                    onRetrieve={retrievePiece}
                  />
                );
              })}
            </div>
          </section>
        ))
      )}
    </PageShell>
  );
};

export default SalonPage;
