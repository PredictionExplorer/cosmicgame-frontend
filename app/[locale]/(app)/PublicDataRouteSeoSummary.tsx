import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { isAddress } from 'viem';

import { protocolFacts } from '@/content/protocol-facts';

import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import type { PageSectionId } from '@/components/layout/pageSections';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { LANDING_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { sumAllocatedEth } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { NBSP, formatCount, formatPercent, sameAddress } from '@/utils/format';
import { formatEthQuote } from '@/utils/gestureQuote';

import { ContributionFigure } from './eth-contribution/ContributionFigure';
import {
  readAnchorCstActions,
  readAnchorEthDeposits,
  readAnchorRwalkActions,
  readAnchorStellarImprints,
  readAttachedNfts,
  readClaimHistory,
  readCoordinationEvents,
  readDashboard,
  readDirectContributions,
  readMarketingRewards,
  readNamedNfts,
  readPublicGoodsDeposits,
  readPublicGoodsRetrievals,
  readRoundList,
  readUsedRwlkNfts,
  readVoluntaryPublicGoods,
  type TimedRead,
} from './publicDataReads';

export type SeoSummaryRoute =
  | 'allocation'
  | 'anchoring'
  | 'marketing'
  | 'imprint'
  | 'eth-contribution'
  | 'attached-nfts'
  | 'allocation-finalized'
  | 'named-nfts'
  | 'used-rwlk-nfts'
  | 'coordination-changes'
  | 'public-goods-contributions-cg'
  | 'public-goods-contributions-voluntary'
  | 'public-goods-retrievals';

interface RouteDefinition {
  section: PageSectionId;
  /**
   * Related pages. Landing pages are built on `LANDING_ORIGIN`, so
   * `localizeCrossHostHref` adds the reader's locale on every host.
   */
  links: readonly { href: string; key: string }[];
}

const routeDefinitions: Record<SeoSummaryRoute, RouteDefinition> = {
  allocation: {
    section: 'records',
    links: [
      { href: '/statistics', key: 'statistics' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
  anchoring: {
    section: 'records',
    links: [
      { href: '/statistics/anchoring', key: 'statistics' },
      { href: `${LANDING_ORIGIN}/learn/anchoring-nfts`, key: 'learn' },
      { href: '/gallery', key: 'gallery' },
    ],
  },
  marketing: {
    section: 'records',
    links: [
      { href: '/faq', key: 'faq' },
      { href: '/statistics', key: 'statistics' },
      { href: '/site-map', key: 'siteMap' },
    ],
  },
  imprint: {
    section: 'participate',
    links: [
      { href: '/', key: 'cycle' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/used-rwlk-nfts', key: 'used' },
    ],
  },
  'eth-contribution': {
    section: 'records',
    links: [
      { href: '/how-it-works', key: 'reserve' },
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/risk-disclosures', key: 'risk' },
    ],
  },
  'attached-nfts': {
    section: 'collection',
    links: [
      { href: '/gallery', key: 'gallery' },
      { href: '/current-cycle', key: 'cycle' },
      { href: '/how-it-works', key: 'learn' },
    ],
  },
  'allocation-finalized': {
    section: 'records',
    // Every cycle is one click away in the page's own index ("All cycles").
    links: [
      { href: '/my-allocations', key: 'myAllocations' },
      { href: '/statistics', key: 'statistics' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
  'named-nfts': {
    section: 'collection',
    links: [
      { href: '/gallery', key: 'gallery' },
      { href: `${LANDING_ORIGIN}/learn/three-body-nft-art`, key: 'learn' },
      { href: '/code', key: 'code' },
    ],
  },
  'used-rwlk-nfts': {
    section: 'collection',
    links: [
      { href: '/imprint', key: 'imprint' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/current-cycle', key: 'cycle' },
    ],
  },
  'coordination-changes': {
    section: 'records',
    links: [
      { href: '/security', key: 'security' },
      { href: '/audits', key: 'audits' },
      {
        href: `${LANDING_ORIGIN}/learn/cst-token-and-cosmic-council`,
        key: 'learn',
      },
    ],
  },
  'public-goods-contributions-cg': {
    section: 'records',
    links: [
      {
        href: `${LANDING_ORIGIN}/learn/protocol-guild-public-goods`,
        key: 'learn',
      },
      { href: '/public-goods-retrievals', key: 'retrievals' },
      { href: '/statistics', key: 'statistics' },
    ],
  },
  'public-goods-contributions-voluntary': {
    section: 'records',
    links: [
      { href: '/eth-contribution', key: 'direct' },
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/risk-disclosures', key: 'risk' },
    ],
  },
  'public-goods-retrievals': {
    section: 'records',
    links: [
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/public-goods-contributions-voluntary', key: 'voluntary' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
};

/**
 * The value of a figure read from a list that may be empty: `NONE_YET` when the
 * read succeeded but has no row to show ("None yet"), `null` when it failed
 * (the header's "Unavailable" dash).
 */
const NONE_YET = Symbol('none-yet');

/** A figure before its label is resolved: the catalog key under `cards` plus the value. */
interface FigureSpec {
  key: string;
  value: ReactNode | typeof NONE_YET | null;
  /** Show the card's `tooltip` copy behind an info button. */
  hasTooltip?: boolean;
  /** A date: kept at figure-md beside the counts (see `PageHeaderFigure.size`). */
  size?: 'md';
}

interface RouteFigures {
  figures: FigureSpec[];
  /** The reads the figures were built from; the snapshot is dated by those that resolved. */
  reads: readonly TimedRead<unknown>[];
}

function sumAmountEth(rows: readonly { AmountEth?: unknown }[]): number {
  return rows.reduce((total, row) => total + (toFiniteNumber(row.AmountEth) ?? 0), 0);
}

/**
 * Distinct wallet or contract addresses, case-insensitively. Anything that is not an address
 * is skipped: the allocation history records Anchor Distribution ETH against the placeholder
 * "(All CS NFT Stakers)", which is not a wallet and must not count as a recipient.
 */
function countDistinctAddresses(values: readonly unknown[]): number {
  const addresses = new Set<string>();
  for (const value of values) {
    if (typeof value === 'string' && isAddress(value, { strict: false })) {
      addresses.add(value.toLowerCase());
    }
  }
  return addresses.size;
}

/** The newest `TimeStamp` (Unix seconds) among rows, or null when there is none. */
function latestTimestamp(rows: readonly { TimeStamp?: unknown }[]): number | null {
  let latest: number | null = null;
  for (const row of rows) {
    const ts = toFiniteNumber(row.TimeStamp);
    if (ts !== null && ts > 0 && (latest === null || ts > latest)) latest = ts;
  }
  return latest;
}

/** The row with the newest `TimeStamp`, or null. */
function latestRow<T extends { TimeStamp?: unknown }>(rows: readonly T[]): T | null {
  let latest: T | null = null;
  for (const row of rows) {
    const ts = toFiniteNumber(row.TimeStamp) ?? 0;
    if (latest === null || ts > (toFiniteNumber(latest.TimeStamp) ?? 0)) latest = row;
  }
  return latest;
}

/**
 * An ETH quote (five significant digits, like the gesture form's cost) set
 * the way `<Amount>` sets every ETH figure: tabular digits, the unit muted
 * and joined by a no-break space.
 */
function EthQuote({ value, locale }: { value: number; locale: string }) {
  return (
    <data value={value} className="whitespace-nowrap tabular-nums">
      {formatEthQuote(value, locale)}
      {NBSP}
      <span className="text-muted-foreground">ETH</span>
    </data>
  );
}

async function getRouteFigures(route: SeoSummaryRoute, locale: string): Promise<RouteFigures> {
  const count = (value: number) => formatCount(value, locale);
  const eth = (value: number) => <Amount value={value} unit="ETH" locale={locale} />;
  /** The newest row's date, "None yet" for an empty list, unknown when the read failed. */
  const latestDate = (rows: readonly { TimeStamp?: unknown }[] | null) => {
    if (rows === null) return null;
    const seconds = latestTimestamp(rows);
    return seconds === null ? NONE_YET : <DateTime timestamp={seconds} locale={locale} />;
  };

  switch (route) {
    case 'allocation': {
      const rounds = await readRoundList();
      const rows = rounds.data;
      return {
        reads: [rounds],
        figures: [
          { key: 'finalizedCycles', value: rows && count(rows.length), hasTooltip: true },
          {
            key: 'recipients',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.WinnerAddr))),
            hasTooltip: true,
          },
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)), hasTooltip: true },
          {
            key: 'totalGestures',
            value:
              rows &&
              count(
                rows.reduce(
                  (total, row) => total + (toFiniteNumber(row.RoundStats?.TotalBids) ?? 0),
                  0,
                ),
              ),
            hasTooltip: true,
          },
        ],
      };
    }
    case 'anchoring': {
      const [cstActions, rwalkActions, ethDeposits, stellarImprints] = await Promise.all([
        readAnchorCstActions(),
        readAnchorRwalkActions(),
        readAnchorEthDeposits(),
        readAnchorStellarImprints(),
      ]);
      return {
        reads: [cstActions, rwalkActions, ethDeposits, stellarImprints],
        figures: [
          {
            key: 'actions',
            value:
              cstActions.data &&
              rwalkActions.data &&
              count(cstActions.data.length + rwalkActions.data.length),
          },
          {
            key: 'ethDeposits',
            value: ethDeposits.data && count(ethDeposits.data.length),
            hasTooltip: true,
          },
          {
            key: 'stellarImprints',
            value: stellarImprints.data && count(stellarImprints.data.length),
            hasTooltip: true,
          },
        ],
      };
    }
    case 'marketing': {
      const [dashboard, rewards] = await Promise.all([readDashboard(), readMarketingRewards()]);
      // `TotalMktRewardsEth` is CST already sent to contributors (an 18-decimal token
      // amount despite the `Eth` suffix), not an ETH balance.
      const allocatedCst = toFiniteNumber(dashboard.data?.MainStats?.TotalMktRewardsEth);
      return {
        reads: [dashboard, rewards],
        figures: [
          { key: 'records', value: rewards.data && count(rewards.data.length) },
          {
            key: 'allocatedCst',
            value:
              allocatedCst === null ? null : (
                <Amount value={allocatedCst} unit="CST" locale={locale} />
              ),
          },
          {
            key: 'contributors',
            value:
              rewards.data &&
              count(countDistinctAddresses(rewards.data.map((row) => row.MarketerAddr))),
          },
        ],
      };
    }
    case 'imprint': {
      const dashboard = await readDashboard();
      const cycle = toFiniteNumber(dashboard.data?.CurRoundNum);
      const cost = toFiniteNumber(dashboard.data?.CurBidPriceEth);
      return {
        reads: [dashboard],
        figures: [
          { key: 'cycle', value: cycle === null ? null : count(cycle) },
          // The same quote format as the home tabs and submit button (five significant digits).
          { key: 'cost', value: cost === null ? null : <EthQuote value={cost} locale={locale} /> },
          {
            key: 'discount',
            value: formatPercent(protocolFacts.randomWalkDiscountPercentage, locale),
          },
        ],
      };
    }
    case 'eth-contribution': {
      // The figures read the ledger's own client query (seeded from this read), so
      // they always reconcile with the rows below, also after a new contribution.
      const contributions = await readDirectContributions();
      return {
        reads: [contributions],
        figures: [
          { key: 'records', value: <ContributionFigure metric="records" /> },
          { key: 'totalEth', value: <ContributionFigure metric="totalEth" /> },
          { key: 'contributors', value: <ContributionFigure metric="contributors" /> },
        ],
      };
    }
    case 'attached-nfts': {
      const attached = await readAttachedNfts();
      const rows = attached.data;
      return {
        reads: [attached],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          {
            key: 'contracts',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.TokenAddr))),
          },
          {
            key: 'contributors',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.DonorAddr))),
          },
        ],
      };
    }
    case 'allocation-finalized': {
      const history = await readClaimHistory();
      const rows = history.data;
      return {
        reads: [history],
        figures: [
          { key: 'records', value: rows && count(rows.length), hasTooltip: true },
          // History rows mix ETH, CST and NFT record types, and `AmountEth` carries each
          // row's own unit: only ETH allocation types may be summed as ETH.
          { key: 'eth', value: rows && eth(sumAllocatedEth(rows)), hasTooltip: true },
          {
            key: 'recipients',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.WinnerAddr))),
          },
        ],
      };
    }
    case 'named-nfts': {
      const [named, dashboard] = await Promise.all([readNamedNfts(), readDashboard()]);
      const rows = named.data;
      const imprinted = toFiniteNumber(dashboard.data?.MainStats?.NumCSTokenMints);
      const owners = rows?.map((row) => row.CurOwnerAddr || row.OwnerAddr) ?? [];
      // The names endpoint may omit owners. Rows without any owner field say nothing
      // about ownership: counting them would print "0 owners" beside 3 named NFTs.
      const ownersKnown = rows !== null && (rows.length === 0 || owners.some(Boolean));
      return {
        reads: [named, dashboard],
        figures: [
          { key: 'named', value: rows && count(rows.length) },
          ...(rows === null || ownersKnown
            ? [{ key: 'owners', value: rows && count(countDistinctAddresses(owners)) }]
            : []),
          { key: 'imprinted', value: imprinted === null ? null : count(imprinted) },
        ],
      };
    }
    case 'used-rwlk-nfts': {
      const used = await readUsedRwlkNfts();
      const rows = used.data;
      return {
        reads: [used],
        figures: [
          { key: 'used', value: rows && count(rows.length) },
          {
            key: 'wallets',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.BidderAddr))),
          },
          {
            key: 'discount',
            value: formatPercent(protocolFacts.randomWalkDiscountPercentage, locale),
          },
        ],
      };
    }
    case 'coordination-changes': {
      const events = await readCoordinationEvents();
      const rows = events.data;
      return {
        reads: [events],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          { key: 'latest', value: latestDate(rows), size: 'md' },
          {
            key: 'parameters',
            value: rows && count(new Set(rows.map((row) => row.RecordType)).size),
            hasTooltip: true,
          },
        ],
      };
    }
    case 'public-goods-contributions-cg': {
      const [deposits, dashboard] = await Promise.all([readPublicGoodsDeposits(), readDashboard()]);
      const rows = deposits.data;
      // The live contract share, or the documented one when the dashboard read failed.
      const share =
        toFiniteNumber(dashboard.data?.CharityPercentage) ?? protocolFacts.publicGoodsPercentage;
      return {
        reads: [deposits],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          { key: 'share', value: formatPercent(share, locale), hasTooltip: true },
          { key: 'latest', value: latestDate(rows), size: 'md' },
        ],
      };
    }
    case 'public-goods-contributions-voluntary': {
      const deposits = await readVoluntaryPublicGoods();
      const rows = deposits.data;
      return {
        reads: [deposits],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          {
            key: 'contributors',
            value: rows && count(countDistinctAddresses(rows.map((row) => row.DonorAddr))),
          },
        ],
      };
    }
    case 'public-goods-retrievals': {
      const withdrawals = await readPublicGoodsRetrievals();
      const rows = withdrawals.data;
      const latest = rows && latestRow(rows);
      const beneficiary =
        latest && typeof latest.DestinationAddr === 'string' && isAddress(latest.DestinationAddr)
          ? latest.DestinationAddr
          : null;
      // Named when it is the vault's documented beneficiary; any other address reads as hex.
      const { name: beneficiaryName, address: beneficiaryAddress } =
        protocolFacts.publicGoodsBeneficiary;
      return {
        reads: [withdrawals],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          { key: 'latest', value: latestDate(rows), size: 'md' },
          {
            key: 'beneficiary',
            value:
              rows === null ? null : beneficiary === null ? (
                NONE_YET
              ) : (
                <AddressChip
                  address={beneficiary}
                  label={sameAddress(beneficiary, beneficiaryAddress) ? beneficiaryName : undefined}
                  className="type-figure-sm"
                />
              ),
            hasTooltip: true,
          },
        ],
      };
    }
  }
}

/** When the figures were read: the newest of the reads that resolved, or null if none did. */
function snapshotTime(reads: readonly TimedRead<unknown>[]): number | null {
  const resolved = reads.filter((read) => read.data !== null);
  return resolved.length > 0 ? Math.max(...resolved.map((read) => read.at)) : null;
}

export interface PublicDataRouteSeoSummaryProps {
  route: SeoSummaryRoute;
  /** A footnote for the meta line, such as the records' scope. */
  note?: ReactNode;
  /** Right-aligned actions, from the page. */
  actions?: ReactNode;
  /** Sibling pages as `PageHeaderTabs` on the header's bottom rule (e.g. `RouteGroupNav`). */
  tabs?: ReactNode;
}

/**
 * The page header of a public data route, rendered on the server: section
 * eyebrow, H1, lede, the route's figures read from the public API, a snapshot
 * stamp dated by those reads, and related pages. It is the page's only
 * header — client pages render it first and add no header of their own.
 */
export async function PublicDataRouteSeoSummary({
  route,
  note,
  actions,
  tabs,
}: PublicDataRouteSeoSummaryProps) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const prefix = `publicData.routes.${route}`;
  const definition = routeDefinitions[route];
  const heading = t(`${prefix}.heading`);
  const { figures, reads } = await getRouteFigures(route, locale);
  const readAt = snapshotTime(reads);

  const headerFigures: PageHeaderFigure[] = figures.map((figure) => {
    const label = t(`${prefix}.cards.${figure.key}.label`);
    return {
      id: figure.key,
      label,
      value:
        figure.value === NONE_YET ? (
          <span className="text-muted-foreground">{t('publicData.common.none')}</span>
        ) : (
          figure.value
        ),
      info: figure.hasTooltip ? t(`${prefix}.cards.${figure.key}.tooltip`) : undefined,
      size: figure.size,
    };
  });

  return (
    <PageHeader
      section={definition.section}
      title={heading}
      titleId={`${route}-heading`}
      subtitle={t(`${prefix}.description`)}
      figures={headerFigures}
      actions={actions}
      tabs={tabs}
      meta={
        readAt !== null || note ? (
          <>
            {readAt !== null ? (
              // One item, so the stamp and its source flow as one line of text.
              <span>
                <SnapshotStamp at={readAt} />
                {' · '}
                {t('publicData.common.source', { source: t(`${prefix}.source`) })}
              </span>
            ) : null}
            {note}
          </>
        ) : undefined
      }
      related={definition.links.map((link) => ({
        href: localizeCrossHostHref(link.href, locale),
        label: t(`${prefix}.links.${link.key}`),
      }))}
      relatedLabel={t('publicData.common.relatedPagesAria', { heading })}
    />
  );
}
