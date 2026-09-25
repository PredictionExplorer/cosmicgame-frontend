'use client';

import { useId, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, getRelativeTime } from '@/utils';

import type { NftTraitEntry, RarityInfo } from '@/lib/nftMetadata';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useNow } from '@/hooks/useNow';
import { formatCount } from '@/utils/format';
import { RecordRow } from '@/components/detail-page/RecordRow';
import { AddressChip } from '@/components/ui/address-chip';
import { CopyButton } from '@/components/ui/copy-button';
import { DateTime } from '@/components/ui/date-time';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';

import { useTraitLabels } from './traits/useTraitLabels';

/** The token record fields the provenance ledger reads. */
export interface NFTLedgerRecord {
  TimeStamp?: number;
  TxHash?: string;
  WinnerAddr?: string;
  CurOwnerAddr?: string;
  RecordType?: number;
  RoundNum?: number;
  Staked?: boolean;
  WasUnstaked?: boolean;
}

/** The indexer's allocation record types, for tokens whose metadata has no Allocation trait. */
const RECORD_TYPE_LABEL_KEYS: Readonly<Record<number, string>> = {
  1: 'badges.stellarSelectionRecipient',
  2: 'badges.anchorRecipient',
  3: 'badges.cycleRecipient',
  4: 'badges.enduranceChampion',
};

/** An internal link in the ledger: quiet text with a trailing arrow, so it reads as a way on. */
function LedgerLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link-quiet group inline-flex min-h-6 items-center gap-1">
      {children}
      <ArrowRight
        aria-hidden
        className="size-3.5 shrink-0 text-subtle transition-colors duration-[var(--duration-fast)] group-hover:text-foreground"
      />
    </Link>
  );
}

/** "3 weeks ago", once the page knows the time (nothing on the server, so no mismatch). */
function ImprintAge({ timestamp }: { timestamp: number }) {
  const locale = useLocale();
  const nowMs = useNow(60_000);
  if (nowMs <= 0) return null;
  return <>{getRelativeTime(timestamp, Math.floor(nowMs / 1000), locale)}</>;
}

export interface NFTSpecListProps {
  nft: NFTLedgerRecord | null;
  /** The token's traits: the allocation that delivered it. */
  entry?: NftTraitEntry | null;
  /** The token's rarity across the collection. */
  rarity?: RarityInfo | null;
  /** Number of ranked tokens. */
  rarityTotal?: number;
  className?: string;
}

/**
 * NFTSpecList — the provenance ledger of the detail page's wall label: cycle,
 * imprint (linked to its transaction), allocation, recipient and owner, rarity
 * and anchoring. Unknown values read as unknown, never as a confident blank.
 * Links carry a trailing arrow (up-right when they leave the site). Anchoring
 * is stated in a neutral tone: a token that has been anchored is not an error.
 */
export function NFTSpecList({ nft, entry, rarity, rarityTotal = 0, className }: NFTSpecListProps) {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const tTraits = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel, valueLabel } = useTraitLabels();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const recordTypeKey = nft?.RecordType != null ? RECORD_TYPE_LABEL_KEYS[nft.RecordType] : null;
  const allocation = entry?.allocation
    ? valueLabel('allocation', entry.allocation)
    : recordTypeKey
      ? t(recordTypeKey)
      : null;

  const anchoringEligible = nft != null && !nft.Staked && !nft.WasUnstaked;

  return (
    <dl
      className={cn('divide-y divide-rule-faint border-y border-rule-faint', className)}
      data-testid="nft-spec-list"
    >
      <RecordRow labelWidth="narrow" label={t('metadata.cycle')} testId="spec-cycle">
        {nft?.RoundNum != null ? (
          <LedgerLink href={`/allocation/${nft.RoundNum}`}>
            {t('metadata.roundNumber', { round: nft.RoundNum })}
          </LedgerLink>
        ) : (
          unknown
        )}
      </RecordRow>

      <RecordRow
        labelWidth="narrow"
        label={t('metadata.imprinted')}
        caption={nft?.TimeStamp ? <ImprintAge timestamp={nft.TimeStamp} /> : null}
        testId="spec-imprinted"
      >
        {/* The date stands alone on the page, so it says its zone ("Aug 11,
            2026, 18:38 UTC-5"); the seconds are in its hover title. It may
            break between date and time: the value column is about 150px wide
            on a 320px phone. */}
        {nft?.TimeStamp ? (
          nft.TxHash ? (
            <a
              href={getExplorerUrl('tx', nft.TxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet inline-flex min-h-6 items-center gap-1"
            >
              <DateTime
                timestamp={nft.TimeStamp}
                year="always"
                showZone
                className="whitespace-normal"
              />
              <ArrowUpRight aria-hidden className="size-3.5 shrink-0 text-subtle" />
            </a>
          ) : (
            <DateTime
              timestamp={nft.TimeStamp}
              year="always"
              showZone
              className="whitespace-normal"
            />
          )
        ) : (
          unknown
        )}
      </RecordRow>

      {allocation ? (
        <RecordRow labelWidth="narrow" label={typeLabel('allocation')} testId="spec-allocation">
          {allocation}
        </RecordRow>
      ) : null}

      {/* A protocol contract's name ("Cosmic Signature NFT Anchoring Wallet")
          wraps here: the ledger is the one place its full name should read. */}
      <RecordRow labelWidth="narrow" label={t('metadata.recipient')} testId="spec-recipient">
        {nft?.WinnerAddr ? (
          <AddressChip address={nft.WinnerAddr} variant="plain" wrapLabel />
        ) : (
          unknown
        )}
      </RecordRow>

      <RecordRow labelWidth="narrow" label={t('metadata.owner')} testId="spec-owner">
        {nft?.CurOwnerAddr ? (
          <AddressChip address={nft.CurOwnerAddr} variant="plain" wrapLabel />
        ) : (
          unknown
        )}
      </RecordRow>

      {rarity && rarityTotal > 0 ? (
        <RecordRow
          labelWidth="narrow"
          label={tTraits('rarity.rankLabel')}
          caption={
            rarity.rarest
              ? `${tTraits('rarity.rarest')} · ${valueLabel(rarity.rarest.key, rarity.rarest.value)}`
              : null
          }
          testId="spec-rarity"
        >
          {tTraits('rarity.rankOf', {
            rank: formatCount(rarity.rank, locale),
            total: formatCount(rarityTotal, locale),
          })}
        </RecordRow>
      ) : null}

      {nft ? (
        <RecordRow
          labelWidth="narrow"
          label={
            <>
              {t('metadata.anchoring')}
              <InfoTooltip
                content={
                  anchoringEligible
                    ? t('badges.eligibleForAnchoringTooltip')
                    : t('badges.alreadyAnchoredTooltip')
                }
                label={t('metadata.anchoring')}
                iconClassName="size-3"
              />
            </>
          }
          testId="spec-anchoring"
        >
          {anchoringEligible ? (
            <LedgerLink href="/anchoring">{t('badges.eligibleForAnchoring')}</LedgerLink>
          ) : (
            <span>{t('badges.alreadyAnchored')}</span>
          )}
        </RecordRow>
      ) : null}
    </dl>
  );
}

export interface NFTSeedProps {
  seed?: string | number;
  /** The heading level of the "Seed" label: 3 where it sits inside a section. */
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * NFTSeed — the token's full 64-character seed in a sunken well with a copy
 * button: the verification data every trait and pixel derives from.
 */
export function NFTSeed({ seed, headingLevel = 2, className }: NFTSeedProps) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const headingId = useId();
  const seedText = String(seed ?? '');

  if (!seedText) return null;

  return (
    <section aria-labelledby={headingId} className={className} data-testid="nft-seed">
      <div className="mb-2 flex items-center gap-1.5">
        <Heading id={headingId} className="type-label text-subtle">
          {t('metadata.seed')}
        </Heading>
        <InfoTooltip content={t('metadata.seedTooltip')} label={t('metadata.seed')} />
      </div>
      <div className="flex max-w-full items-center gap-3 rounded-control bg-surface-sunken py-2.5 pl-4 pr-2 sm:w-fit">
        <p className="min-w-0 flex-1 py-1 type-hash text-foreground" data-testid="seed-value">
          {seedText}
        </p>
        {/* The check shows only when the clipboard write succeeded. */}
        <CopyButton
          value={seedText}
          label={t('metadata.copySeed')}
          copiedLabel={tCommon('actions.copied')}
          className="size-9"
        />
      </div>
    </section>
  );
}
