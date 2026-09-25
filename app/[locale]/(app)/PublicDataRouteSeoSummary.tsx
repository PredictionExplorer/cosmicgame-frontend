import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { isAddress, zeroAddress } from 'viem';

import { protocolFacts } from '@/content/protocol-facts';

import { OUTBOUND_LINKS, classifyHref } from '@/config/siteNav';
import { PageHeader, PageHeaderFacts, type PageHeaderFigure } from '@/components/layout/PageHeader';
import type { PageSectionId } from '@/components/layout/pageSections';
import { SiteLink } from '@/components/layout/SiteLink';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { AnchoringHeaderCount } from '@/components/anchoring/AnchoringHeaderCount';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { DateTime } from '@/components/ui/date-time';
import { LANDING_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { sumAllocatedEth } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatCount, formatPercent, sameAddress } from '@/utils/format';

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
  readGameOwner,
  readMarketingRewards,
  readNamedNfts,
  readPublicGoodsDeposits,
  readPublicGoodsRetrievals,
  readRandomWalkImprinted,
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

/** The Learn guide to Public Goods and Protocol Guild. */
const PUBLIC_GOODS_GUIDE = `${LANDING_ORIGIN}/learn/protocol-guild-public-goods`;

/** The Public Goods Vault's section on /contracts: its balance, beneficiary and share. */
const PUBLIC_GOODS_VAULT = '/contracts#public-goods-heading';

/** Protocol Guild's own site, the Public Goods Vault's beneficiary. */
const PROTOCOL_GUILD_URL = OUTBOUND_LINKS.find((link) => link.id === 'protocolGuild')!.href;

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
      // The FAQ answer about the Outreach Reserve itself, not the FAQ's top.
      { href: '/faq#what-are-marketing-rewards', key: 'faq' },
      { href: '/statistics', key: 'statistics' },
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
  // The three Public Goods ledgers link each other through their tabs, so
  // their related pages go where the tabs do not: the guide, and the vault
  // itself on /contracts (its section, not the top of the page).
  'public-goods-contributions-cg': {
    section: 'records',
    links: [
      { href: PUBLIC_GOODS_GUIDE, key: 'learn' },
      { href: PUBLIC_GOODS_VAULT, key: 'contracts' },
    ],
  },
  'public-goods-contributions-voluntary': {
    section: 'records',
    links: [
      { href: '/eth-contribution', key: 'direct' },
      { href: PUBLIC_GOODS_GUIDE, key: 'learn' },
      { href: '/risk-disclosures', key: 'risk' },
    ],
  },
  'public-goods-retrievals': {
    section: 'records',
    links: [
      { href: PUBLIC_GOODS_GUIDE, key: 'learn' },
      { href: PROTOCOL_GUILD_URL, key: 'protocolGuild' },
      { href: PUBLIC_GOODS_VAULT, key: 'contracts' },
    ],
  },
};

/** The section a public data route's header names (checked against the taxonomy in tests). */
export function publicDataRouteSection(route: SeoSummaryRoute): PageSectionId {
  return routeDefinitions[route].section;
}

/** Every public data route. */
export const PUBLIC_DATA_ROUTES = Object.keys(routeDefinitions) as SeoSummaryRoute[];

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
  /** A short count: three of them share one phone row (see `PageHeaderFigure.compact`). */
  compact?: boolean;
  /** A date and time: its own phone row (see `PageHeaderFigure.date`). */
  date?: boolean;
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

async function getRouteFigures(
  route: SeoSummaryRoute,
  locale: string,
  /** The route's own copy, `publicData.routes.<route>.<key>`. */
  copy: (key: string) => string,
): Promise<RouteFigures> {
  const count = (value: number) => formatCount(value, locale);
  const eth = (value: number) => <Amount value={value} unit="ETH" locale={locale} />;
  /**
   * The newest row's date, "None yet" for an empty list, unknown when the read
   * failed. Always with its year, like the same date in the ledger below.
   */
  const latestDate = (rows: readonly { TimeStamp?: unknown }[] | null) => {
    if (rows === null) return null;
    const seconds = latestTimestamp(rows);
    return seconds === null ? (
      NONE_YET
    ) : (
      <DateTime timestamp={seconds} locale={locale} year="always" />
    );
  };

  switch (route) {
    case 'allocation': {
      const rounds = await readRoundList();
      const rows = rounds.data;
      return {
        reads: [rounds],
        // Self-evident counts carry no explanation; the two figures a reader
        // could misread do.
        figures: [
          { key: 'finalizedCycles', value: rows && count(rows.length) },
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
      // The server counts what it read: the action lists (every anchor and release ever) are
      // counted here and never sent to the page. A read that failed here is read again in the
      // browser (AnchoringHeaderCount) instead of cached as a dash.
      const actions =
        cstActions.data && rwalkActions.data
          ? cstActions.data.length + rwalkActions.data.length
          : null;
      return {
        reads: [cstActions, rwalkActions, ethDeposits, stellarImprints],
        // Three short counts: one row on phones.
        figures: [
          {
            key: 'actions',
            // The actions are listed on the anchoring statistics, one link away.
            value: (
              <AnchoringHeaderCount
                metric="actions"
                serverCount={actions}
                href="/statistics/anchoring"
              />
            ),
            hasTooltip: true,
            compact: true,
          },
          {
            key: 'ethDeposits',
            value: (
              <AnchoringHeaderCount
                metric="ethDeposits"
                serverCount={ethDeposits.data?.length ?? null}
              />
            ),
            hasTooltip: true,
            compact: true,
          },
          {
            key: 'stellarImprints',
            value: (
              <AnchoringHeaderCount
                metric="stellarImprints"
                serverCount={stellarImprints.data?.length ?? null}
              />
            ),
            hasTooltip: true,
            compact: true,
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
      // The page's own subject: how many Random Walk NFTs exist (read from
      // the contract) and how many have been used. What an imprint costs is
      // the panel's to say, once, where it is paid.
      const [imprinted, used] = await Promise.all([readRandomWalkImprinted(), readUsedRwlkNfts()]);
      return {
        reads: [imprinted, used],
        figures: [
          // The reduction itself is a constant, stated once in the lede.
          {
            key: 'imprinted',
            value: imprinted.data === null ? null : count(imprinted.data),
            compact: true,
          },
          { key: 'used', value: used.data && count(used.data.length), compact: true },
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
      const named = await readNamedNfts();
      const rows = named.data;
      const owners = rows?.map((row) => row.CurOwnerAddr || row.OwnerAddr) ?? [];
      // The names endpoint may omit owners. Rows without any owner field say nothing
      // about ownership: counting them would print "0 owners" beside 3 named NFTs.
      const ownersKnown = rows !== null && (rows.length === 0 || owners.some(Boolean));
      // Only facts about named NFTs: the collection's size is the gallery's.
      return {
        reads: [named],
        figures: [
          { key: 'named', value: rows && count(rows.length) },
          ...(rows === null || ownersKnown
            ? [{ key: 'owners', value: rows && count(countDistinctAddresses(owners)) }]
            : []),
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
      const [events, owner] = await Promise.all([readCoordinationEvents(), readGameOwner()]);
      const rows = events.data;
      return {
        reads: [events, owner],
        figures: [
          { key: 'records', value: rows && count(rows.length) },
          { key: 'latest', value: latestDate(rows), size: 'md', date: true },
          // Who can still change the parameters: the page's key trust fact,
          // said as a status either way, never left to the tooltip.
          {
            key: 'owner',
            value:
              owner.data === null ? null : sameAddress(owner.data, zeroAddress) ? (
                <Badge tone="positive" dot>
                  {copy('cards.owner.renounced')}
                </Badge>
              ) : (
                <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <AddressChip
                    address={owner.data}
                    variant="plain"
                    showCopy={false}
                    className="type-figure-md"
                  />
                  <Badge tone="attention" dot>
                    {copy('cards.owner.active')}
                  </Badge>
                </span>
              ),
            hasTooltip: true,
            size: 'md',
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
      // The money leads, as on the other two tabs: what the cycles have
      // forwarded so far. The vault section below follows it on (due from
      // the live cycle, in the vault, retrieved); the ledger dates each row.
      return {
        reads: [deposits],
        figures: [
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          { key: 'records', value: rows && count(rows.length) },
          { key: 'share', value: formatPercent(share, locale), hasTooltip: true },
        ],
      };
    }
    case 'public-goods-contributions-voluntary': {
      const deposits = await readVoluntaryPublicGoods();
      const rows = deposits.data;
      // With no contribution yet the row reads 0 · 0 ETH · 0: the three Public
      // Goods tabs keep one header shape, so the tab row never jumps.
      return {
        reads: [deposits],
        figures: [
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          { key: 'records', value: rows && count(rows.length) },
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
          { key: 'totalEth', value: rows && eth(sumAmountEth(rows)) },
          { key: 'records', value: rows && count(rows.length) },
          { key: 'latest', value: latestDate(rows), size: 'md', date: true },
          {
            key: 'beneficiary',
            value:
              rows === null ? null : beneficiary === null ? (
                NONE_YET
              ) : (
                // A figure like its neighbours: the name (or hex) as figure text,
                // linked to the address, not a small chip.
                <AddressChip
                  address={beneficiary}
                  variant="plain"
                  showCopy={false}
                  label={sameAddress(beneficiary, beneficiaryAddress) ? beneficiaryName : undefined}
                  className="type-figure-md"
                />
              ),
            hasTooltip: true,
            size: 'md',
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
  /** Sibling pages as `PageHeaderTabs`, opening the header (e.g. `RouteGroupNav`). */
  tabs?: ReactNode;
  /** Classes for the header, for a page that sets it inside a wider hero row. */
  className?: string;
}

/**
 * The page header of a public data route, rendered on the server: section
 * eyebrow, H1, lede, the route's figures read from the public API (a quiet
 * facts line on the collection pages), a snapshot stamp dated by those
 * reads, and related pages. It is the page's only header — client pages
 * render it first and add no header of their own.
 */
export async function PublicDataRouteSeoSummary({
  route,
  note,
  actions,
  tabs,
  className,
}: PublicDataRouteSeoSummaryProps) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const prefix = `publicData.routes.${route}`;
  const definition = routeDefinitions[route];
  const heading = t(`${prefix}.heading`);
  const { figures, reads } = await getRouteFigures(route, locale, (key) => t(`${prefix}.${key}`));
  const readAt = snapshotTime(reads);
  const related = definition.links.map((link) => ({
    href: localizeCrossHostHref(link.href, locale),
    label: t(`${prefix}.links.${link.key}`),
  }));
  const relatedLabel = t('publicData.common.relatedPagesAria', { heading });

  const snapshot = readAt !== null ? <SnapshotStamp at={readAt} /> : null;
  const noneYet = <span className="text-muted-foreground">{t('publicData.common.none')}</span>;

  // A collection page's headline is its art: its facts sit on one quiet line
  // under the lede, as on the gallery, instead of a row of large figures.
  if (definition.section === 'collection') {
    return (
      <PageHeader
        section={definition.section}
        title={heading}
        titleId={`${route}-heading`}
        subtitle={t(`${prefix}.description`)}
        actions={actions}
        tabs={tabs}
        facts={
          <PageHeaderFacts
            facts={figures.map((figure) => ({
              id: figure.key,
              label: t(`${prefix}.cards.${figure.key}.label`),
              value: figure.value === NONE_YET ? noneYet : figure.value,
            }))}
            meta={
              snapshot || note ? (
                <>
                  {snapshot}
                  {note}
                </>
              ) : undefined
            }
          />
        }
        related={related}
        relatedLabel={relatedLabel}
      />
    );
  }

  const headerFigures: PageHeaderFigure[] = figures.map((figure) => {
    const label = t(`${prefix}.cards.${figure.key}.label`);
    return {
      id: figure.key,
      label,
      value: figure.value === NONE_YET ? noneYet : figure.value,
      info: figure.hasTooltip ? t(`${prefix}.cards.${figure.key}.tooltip`) : undefined,
      size: figure.size,
      compact: figure.compact,
      date: figure.date,
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
        snapshot || note ? (
          <>
            {snapshot}
            {note}
          </>
        ) : undefined
      }
      related={related}
      relatedLabel={relatedLabel}
      className={className}
    />
  );
}

/**
 * The header's related pages again, for phones, where the header hides its
 * chips: a compact list the page puts after its last section, one 44px row
 * per link, with the header's links, order and labels.
 */
export async function PublicDataRelatedPages({
  route,
  className,
}: {
  route: SeoSummaryRoute;
  className?: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const headingId = `${route}-related-pages`;
  return (
    <nav aria-labelledby={headingId} className={cn('sm:hidden', className)}>
      <h2 id={headingId} className="type-label text-subtle">
        {tCommon('pageHeader.relatedPages')}
      </h2>
      <ul className="mt-2 divide-y divide-rule-faint">
        {routeDefinitions[route].links.map((link) => {
          const href = localizeCrossHostHref(link.href, locale);
          const kind = classifyHref(href, 'app');
          const Icon = kind === 'external' ? ArrowUpRight : ArrowRight;
          return (
            <li key={link.key}>
              <SiteLink
                href={href}
                kind={kind}
                externalIcon={false}
                className="flex min-h-11 items-center justify-between gap-4 type-body-sm text-foreground no-underline"
              >
                {t(`publicData.routes.${route}.links.${link.key}`)}
                <Icon aria-hidden className="size-4 shrink-0 text-subtle" />
              </SiteLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
