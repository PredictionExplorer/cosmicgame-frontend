'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatEther, parseEther } from 'viem';

import type { SalonLot } from '@/hooks/useSalonLots';
import type { TxResult } from '@/hooks/useTxFlow';
import { useLotOfferHistory } from '@/hooks/useLotOfferHistory';
import { SignatureCard } from '@/components/nft/SignatureCard';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { Duration } from '@/components/ui/duration';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { formatPercent } from '@/utils/format';

/** Where a lot stands, derived from its chain state and the clock. */
export type SalonLotPhase =
  | 'upcoming'
  | 'awaitingFirstOffer'
  | 'open'
  | 'concludable'
  | 'awaitingRetrieval'
  | 'retrieved';

/**
 * A lot's phase. The closing clock only starts with the first offer
 * (`closesAt` is 0 until then), so an untouched lot stays open and a closed
 * one always has a leading patron to conclude for.
 */
export function salonLotPhase(lot: SalonLot, nowSeconds: number): SalonLotPhase {
  if (lot.retrieved) return 'retrieved';
  if (lot.concluded) return 'awaitingRetrieval';
  if (nowSeconds < lot.opensAt) return 'upcoming';
  if (lot.closesAt === 0) return 'awaitingFirstOffer';
  if (nowSeconds < lot.closesAt) return 'open';
  return 'concludable';
}

/**
 * The status badge's tone per phase: a lot with live offers breathes, one
 * needing a hand (conclude, retrieve) asks for it, the rest stay quiet.
 */
const PHASE_TONE: Record<SalonLotPhase, NonNullable<BadgeProps['tone']>> = {
  upcoming: 'neutral',
  awaitingFirstOffer: 'neutral',
  open: 'live',
  concludable: 'attention',
  awaitingRetrieval: 'positive',
  retrieved: 'neutral',
};

interface SalonLotCardProps {
  lot: SalonLot;
  /** The Signature's seed from the API; without one the plate says so. */
  seed?: string | number | null;
  /** When the Signature was imprinted (unix seconds), from the API. */
  imprintedAt?: number | null;
  /** The connected wallet, lower-cased comparisons are done here. */
  account?: string;
  /** A salon transaction is already in flight: every action holds. */
  busy: boolean;
  /** The shared clock (unix seconds), from `useNow` upstream. */
  nowSeconds: number;
  /** First row of the grid: load the art eagerly. */
  priority?: boolean;
  onOffer: (nftId: number, totalOffer: bigint) => Promise<TxResult>;
  onConclude: (nftId: number) => Promise<TxResult>;
  onRetrieve: (nftId: number) => Promise<TxResult>;
}

/** The plate's rendered width at each breakpoint, for the srcset choice. */
const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw';

/**
 * One Signature on offer: its art (linking to its detail page), where its
 * offers stand, and the action its phase allows — an offer field while
 * open, Conclude once closed, Retrieve for its recipient.
 */
export function SalonLotCard({
  lot,
  seed,
  imprintedAt,
  account,
  busy,
  nowSeconds,
  priority,
  onOffer,
  onConclude,
  onRetrieve,
}: SalonLotCardProps) {
  const t = useTranslations('salon');
  const phase = salonLotPhase(lot, nowSeconds);
  const [historyOpen, setHistoryOpen] = useState(false);

  // The field starts at — and, until the patron edits it, follows — the
  // lot's live minimum, so the form is submittable exactly as rendered;
  // typing is only needed to offer more than the minimum.
  const minimumText = formatEther(lot.minimumNextOffer);
  const [offerText, setOfferText] = useState(minimumText);
  const [edited, setEdited] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Guarded reset during render (not an effect): when the chain minimum
  // moves and the patron hasn't typed, the prefill follows it.
  const [lastMinimum, setLastMinimum] = useState(minimumText);
  if (lastMinimum !== minimumText) {
    setLastMinimum(minimumText);
    if (!edited) setOfferText(minimumText);
  }

  const isLeadingPatron = !!account && lot.leadingPatron.toLowerCase() === account.toLowerCase();

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let total: bigint;
    try {
      total = parseEther(offerText.trim());
    } catch {
      setOfferError(t('lot.invalidAmount'));
      return;
    }
    if (total < lot.minimumNextOffer) {
      setOfferError(t('lot.offerTooLow', { minimum: `${minimumText} ETH` }));
      return;
    }
    setOfferError(null);
    const result = await onOffer(lot.nftId, total);
    // Hand the field back to the live minimum, which the confirmed offer
    // just raised.
    if (result.status === 'confirmed') setEdited(false);
  };

  const facts: React.ReactNode[] = [];
  if (phase === 'upcoming') {
    facts.push(
      <span key="opens">
        {t('lot.opensIn')}{' '}
        <Duration seconds={lot.opensAt - nowSeconds} variant="compact" maxUnits={2} />
      </span>,
    );
  }
  if (phase === 'open') {
    facts.push(
      <span key="closes">
        {t('lot.closesIn')}{' '}
        <Duration seconds={lot.closesAt - nowSeconds} variant="compact" maxUnits={2} />
      </span>,
    );
  }
  if (lot.leadingOffer > 0n) {
    facts.push(
      <span key="leading">
        {t('lot.leadingOffer')} <Amount value={lot.leadingOffer} unit="ETH" context="exact" />
      </span>,
    );
  }

  return (
    <SignatureCard
      tokenId={lot.nftId}
      seed={seed}
      entry={null}
      imprintedAt={imprintedAt}
      sizes={CARD_SIZES}
      priority={priority}
      extraMeta={facts}
      after={
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={PHASE_TONE[phase]} size="sm" dot={phase === 'open'}>
              {t(`status.${phase}`)}
            </Badge>
            {isLeadingPatron && phase === 'open' && (
              <Badge tone="accent" size="sm">
                {t('lot.youLead')}
              </Badge>
            )}
          </div>
          {(phase === 'awaitingFirstOffer' || phase === 'open') && (
            <>
              <p className="type-caption text-muted-foreground">
                {t('lot.minimumNextOffer')}{' '}
                <Amount value={lot.minimumNextOffer} unit="ETH" context="exact" />
              </p>
              {account ? (
                <form onSubmit={(event) => void submitOffer(event)} className="flex gap-2">
                  <Input
                    value={offerText}
                    onChange={(event) => {
                      setEdited(true);
                      setOfferError(null);
                      setOfferText(event.target.value);
                    }}
                    inputMode="decimal"
                    aria-label={t('lot.offerAmountLabel')}
                    disabled={busy}
                  />
                  <Button type="submit" disabled={busy}>
                    {isLeadingPatron ? t('lot.raiseOffer') : t('lot.placeOffer')}
                  </Button>
                </form>
              ) : (
                <p className="type-caption text-muted-foreground">{t('lot.connectToOffer')}</p>
              )}
              {offerError && (
                <p role="alert" className="type-caption text-destructive">
                  {offerError}
                </p>
              )}
            </>
          )}
          {phase === 'concludable' && account && (
            <Button variant="outline" disabled={busy} onClick={() => void onConclude(lot.nftId)}>
              {t('lot.conclude')}
            </Button>
          )}
          {phase === 'awaitingRetrieval' &&
            (isLeadingPatron ? (
              <Button disabled={busy} onClick={() => void onRetrieve(lot.nftId)}>
                {t('lot.retrievePiece')}
              </Button>
            ) : (
              <p className="type-caption text-muted-foreground">
                {t('lot.awaitingRecipient')}{' '}
                <AddressChip address={lot.leadingPatron} variant="plain" />
              </p>
            ))}
          {phase === 'retrieved' && lot.leadingPatron && (
            <p className="type-caption text-muted-foreground">
              {t('lot.retrievedBy')} <AddressChip address={lot.leadingPatron} variant="plain" />
            </p>
          )}
          {lot.leadingOffer > 0n && (
            <div>
              <Button
                variant="quiet"
                size="sm"
                aria-expanded={historyOpen}
                onClick={() => setHistoryOpen((open) => !open)}
              >
                {historyOpen ? t('history.hide') : t('history.show')}
              </Button>
              {historyOpen && <LotOfferHistory nftId={lot.nftId} />}
            </div>
          )}
        </div>
      }
    />
  );
}

/**
 * Every offer a lot has received, newest first: who placed it, its total,
 * how far it raised the one before, and when. Read from the chain's event
 * log only once opened, then re-read on the salon's polling cadence so a
 * live contest can be watched from the card.
 */
function LotOfferHistory({ nftId }: { nftId: number }) {
  const t = useTranslations('salon');
  const locale = useLocale();
  const { offers, isPending, isError } = useLotOfferHistory(nftId, true);

  if (isPending) {
    return (
      <div className="py-2">
        <Spinner size="sm" />
      </div>
    );
  }
  if (isError) {
    return <p className="type-caption text-destructive">{t('history.failed')}</p>;
  }
  if (!offers || offers.length === 0) {
    return <p className="type-caption text-muted-foreground">{t('history.empty')}</p>;
  }

  return (
    <div className="mt-1 space-y-1">
      <p className="type-caption text-muted-foreground">
        {t('history.count', { count: offers.length })}
      </p>
      <ol className="space-y-1">
        {offers.map((offer) => (
          <li
            key={offer.txHash || `${offer.patron}-${offer.placedAt}`}
            className="type-caption flex flex-wrap items-baseline gap-x-2"
          >
            <AddressChip address={offer.patron} variant="plain" />
            <Amount value={offer.total} unit="ETH" context="exact" />
            <span className="text-muted-foreground">
              {offer.raisePercent !== null
                ? formatPercent(offer.raisePercent, locale, { signDisplay: 'always' })
                : t('history.first')}
            </span>
            {offer.placedAt > 0 && (
              <DateTime
                timestamp={offer.placedAt}
                variant="relative"
                className="text-muted-foreground"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
