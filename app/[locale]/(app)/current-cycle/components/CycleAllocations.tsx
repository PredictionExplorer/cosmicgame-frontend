'use client';

import { Fragment, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ALLOCATION_TRACK_COLORS, type AllocationTrackId } from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UnknownValue } from '@/components/ui/unknown-value';
import { FundDistribution, reserveTracks } from '@/components/tokens/FundDistribution';
import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAmount, formatPercent } from '@/utils/format';

import { CYCLE_SECTION_SCROLL_MARGIN } from './CycleSectionNav';

/** The copy key of each allocation under `currentCycle.allocations.cards`. */
type AllocationKey =
  | 'signature'
  | 'chronoWarrior'
  | 'ethStellar'
  | 'cosmicAnchor'
  | 'publicGoods'
  | 'nextCycle'
  | 'nftStellar'
  | 'randomWalkAnchor'
  | 'endurance'
  | 'finalCst';

interface AllocationRow {
  key: AllocationKey;
  /** The reserve track the row draws from, for its share and colour. */
  track?: AllocationTrackId;
  name: string;
  definition?: string;
  receives: ReactNode;
  recipients: ReactNode;
}

/**
 * "a · b · c", each part kept whole. The separator ends the part before it,
 * so a wrapped line starts with a part, never with a dot.
 */
function joinParts(parts: ReactNode[]): ReactNode {
  const last = parts.length - 1;
  return parts.map((part, index) => (
    <Fragment key={index}>
      <span className="whitespace-nowrap">
        {part}
        {index < last ? <span className="px-1.5 text-subtle">·</span> : null}
      </span>
      {index < last ? <wbr /> : null}
    </Fragment>
  ));
}

/**
 * What each allocation is, for the section's one disclosure: a definition
 * list of every row that has a definition, in the ledger's order.
 */
function AllocationDefinitions({ rows, summary }: { rows: AllocationRow[]; summary: string }) {
  return (
    <details className="group mb-6 border-y border-rule-faint" data-testid="allocation-definitions">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 type-label text-muted-foreground transition-colors duration-fast hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-subtle transition-transform duration-fast group-open:rotate-90"
        />
        {summary}
      </summary>
      <dl className="grid gap-x-10 pb-4 md:grid-cols-2">
        {rows.flatMap((row) =>
          row.definition
            ? [
                <div key={row.key} className="border-t border-rule-faint py-3">
                  <dt className="type-label text-foreground">{row.name}</dt>
                  <dd className="mt-1 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
                    {row.definition}
                  </dd>
                </div>,
              ]
            : [],
        )}
      </dl>
    </details>
  );
}

/**
 * Everything this cycle allocates when it finalizes, once: the Cycle
 * Reserve split as a proportional bar, then one ledger of every allocation
 * with its share of the reserve (the tracks paid in ETH carry the bar's
 * colours), what each recipient receives and how many recipients there are.
 * The allocation names are plain labels; what each one is sits in one "How
 * the reserve splits" disclosure under the section title, not behind ten
 * separate explanations.
 */
export function CycleAllocations({ data, headingId }: { data: DashboardInfo; headingId: string }) {
  const t = useTranslations('currentCycle');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const tracks = new Map(reserveTracks(data).map((track) => [track.id, track]));
  const eth = (value: number | null | undefined) => {
    const amount = toFiniteNumber(value);
    return amount === null ? unknown : <Amount value={amount} unit="ETH" />;
  };
  const card = (key: AllocationKey, field: 'name' | 'tooltip', values?: Record<string, string>) =>
    t(`allocations.cards.${key}.${field}`, values);
  const recipients = (count: number | null | undefined) => {
    const n = toFiniteNumber(count);
    return n === null ? unknown : t('allocations.recipientCount', { count: n });
  };

  const cst = t('allocations.amounts.fixedCst');
  const nft = t('allocations.amounts.nft');
  const publicGoodsPercent = toFiniteNumber(data.CharityPercentage);
  const stellarEthRecipients = toFiniteNumber(data.NumRaffleEthWinnersBidding);
  const stellarEth = toFiniteNumber(data.RaffleAmountEth);
  const stellarEthEach =
    stellarEth !== null && stellarEthRecipients ? stellarEth / stellarEthRecipients : null;

  const rows: AllocationRow[] = [
    {
      key: 'signature',
      track: 'signature',
      name: card('signature', 'name'),
      definition: card('signature', 'tooltip'),
      receives: joinParts([
        eth(data.PrizeAmountEth),
        cst,
        nft,
        t('allocations.amounts.attachedTokens'),
      ]),
      recipients: recipients(1),
    },
    {
      key: 'chronoWarrior',
      track: 'chrono',
      name: card('chronoWarrior', 'name'),
      definition: card('chronoWarrior', 'tooltip'),
      receives: joinParts([eth(tracks.get('chrono')?.eth), cst, nft]),
      recipients: recipients(1),
    },
    {
      key: 'ethStellar',
      track: 'stellar',
      name: card('ethStellar', 'name'),
      definition: card('ethStellar', 'tooltip'),
      receives:
        stellarEthEach === null ? (
          unknown
        ) : (
          <span className="whitespace-nowrap tabular-nums">
            {t('allocations.amounts.ethEach', {
              amount: formatAmount(stellarEthEach, { unit: 'ETH', locale, withUnit: false }),
            })}
          </span>
        ),
      recipients: recipients(stellarEthRecipients),
    },
    {
      key: 'cosmicAnchor',
      track: 'anchor',
      name: card('cosmicAnchor', 'name'),
      definition: card('cosmicAnchor', 'tooltip'),
      receives: eth(data.StakingAmountEth),
      recipients: t('allocations.cards.cosmicAnchor.recipientLabel'),
    },
    {
      key: 'publicGoods',
      track: 'publicGoods',
      name: card('publicGoods', 'name'),
      // The definition states the live share; without it, the sentence is left out.
      definition:
        publicGoodsPercent === null
          ? undefined
          : card('publicGoods', 'tooltip', { percent: String(publicGoodsPercent) }),
      receives: eth(tracks.get('publicGoods')?.eth),
      recipients: t('allocations.cards.publicGoods.recipientLabel'),
    },
    {
      key: 'nextCycle',
      track: 'nextCycle',
      // The glossary's name for the share that opens the next cycle, as the
      // section's description calls it; the recipients column says which cycle.
      name: card('nextCycle', 'name'),
      definition: card('nextCycle', 'tooltip'),
      receives: eth(tracks.get('nextCycle')?.eth),
      recipients: t('hero.title', { n: data.CurRoundNum + 1 }),
    },
    {
      key: 'nftStellar',
      name: card('nftStellar', 'name'),
      definition: card('nftStellar', 'tooltip'),
      receives: joinParts([
        t('allocations.amounts.fixedCstEach'),
        t('allocations.amounts.nftEach'),
      ]),
      recipients: recipients(data.NumRaffleNFTWinnersBidding),
    },
    {
      key: 'randomWalkAnchor',
      name: card('randomWalkAnchor', 'name'),
      definition: card('randomWalkAnchor', 'tooltip'),
      receives: joinParts([
        t('allocations.amounts.fixedCstEach'),
        t('allocations.amounts.nftEach'),
      ]),
      recipients: recipients(data.NumRaffleNFTWinnersStakingRWalk),
    },
    {
      key: 'endurance',
      name: card('endurance', 'name'),
      definition: card('endurance', 'tooltip'),
      receives: joinParts([cst, nft]),
      recipients: recipients(1),
    },
    {
      key: 'finalCst',
      name: card('finalCst', 'name'),
      definition: card('finalCst', 'tooltip'),
      receives: joinParts([cst, nft]),
      recipients: recipients(1),
    },
  ];

  const shareOf = (row: AllocationRow) =>
    row.track ? (tracks.get(row.track)?.percent ?? null) : undefined;
  const shareText = (share: number | null | undefined) =>
    share === undefined ? null : share === null ? unknown : formatPercent(share, locale);
  const nameOf = (row: AllocationRow) => (
    <span className="inline-flex items-baseline gap-2.5">
      <span
        aria-hidden
        className={cn(
          'size-2.5 shrink-0 translate-y-px rounded-edge',
          row.track ? ALLOCATION_TRACK_COLORS[row.track] : 'border border-rule',
        )}
      />
      {row.name}
    </span>
  );

  const columns = {
    allocation: t('allocations.columns.allocation'),
    share: t('allocations.columns.share'),
    receives: t('allocations.columns.receives'),
    recipients: t('allocations.columns.recipients'),
  };

  return (
    <section aria-labelledby={headingId} className={CYCLE_SECTION_SCROLL_MARGIN} id="allocations">
      <SectionHeader
        headingId={headingId}
        title={t('sections.allocations.title')}
        description={t('sections.allocations.description')}
      />
      <AllocationDefinitions rows={rows} summary={t('allocations.explain')} />
      <FundDistribution data={data} describe={false} className="mb-6" />
      {/* Phones: one short record per allocation (name and share, what each
          recipient receives, how many), instead of four labelled lines each. */}
      <ul
        className="divide-y divide-rule-faint border-y border-rule sm:hidden"
        aria-labelledby={headingId}
      >
        {rows.map((row) => {
          const share = shareOf(row);
          return (
            <li key={row.key} data-allocation={row.key} className="py-4">
              <div className="flex items-baseline justify-between gap-4 type-body-sm text-foreground">
                {nameOf(row)}
                {share === undefined ? null : (
                  <span className="shrink-0 type-figure-sm">{shareText(share)}</span>
                )}
              </div>
              <p className="mt-1.5 pl-5 type-body-sm text-muted-foreground">{row.receives}</p>
              <p className="mt-0.5 pl-5 type-caption text-subtle">{row.recipients}</p>
            </li>
          );
        })}
      </ul>
      <Table labelledBy={headingId} containerClassName="max-sm:hidden">
        <TableHeader>
          <TableRow>
            <TableHead>{columns.allocation}</TableHead>
            <TableHead align="end">{columns.share}</TableHead>
            <TableHead>{columns.receives}</TableHead>
            <TableHead align="end">{columns.recipients}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const share = shareOf(row);
            return (
              <TableRow key={row.key} data-allocation={row.key}>
                <TableCell label={columns.allocation} className="text-foreground">
                  {nameOf(row)}
                </TableCell>
                <TableCell
                  label={columns.share}
                  align="end"
                  numeric
                  data-empty={share === undefined ? 'true' : undefined}
                  className="text-foreground"
                >
                  {shareText(share)}
                </TableCell>
                <TableCell label={columns.receives}>{row.receives}</TableCell>
                <TableCell label={columns.recipients} align="end" numeric>
                  {row.recipients}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
