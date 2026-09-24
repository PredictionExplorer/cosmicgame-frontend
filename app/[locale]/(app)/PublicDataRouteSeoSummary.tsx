import { getLocale, getTranslations } from 'next-intl/server';
import { isAddress } from 'viem';

import { protocolFacts } from '@/content/protocol-facts';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';
import { Link } from '@/i18n/navigation';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import {
  get_staking_cst_actions,
  get_staking_cst_rewards,
  get_staking_rwalk_actions,
  get_staking_rwalk_mints_global,
} from '@/services/api/anchoring';
import {
  get_charity_cg_deposits,
  get_charity_voluntary,
  get_charity_withdrawals,
  get_donations_both,
  get_donations_nft_list,
} from '@/services/api/donations';
import { get_marketing_rewards } from '@/services/api/marketing';
import { get_claim_history, get_dashboard_info, get_round_list } from '@/services/api/rounds';
import { get_coordination_events } from '@/services/api/system';
import { get_named_nfts, get_used_rwlk_nfts } from '@/services/api/tokens';
import { sumAllocatedEth } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatUtcDateTimeStamp, toIntlLocale } from '@/utils/format';
import { formatEthQuote } from '@/utils/gestureQuote';

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

interface SummaryCard {
  key: string;
  /**
   * The formatted figure. `null` means the figure is unknown — its read failed or the value
   * is missing — and renders as an em dash announced as "Unavailable", never as a zero.
   * Omitted for cards whose value is fixed copy in the catalog (`cards.<key>.value`).
   */
  figure?: string | null;
  hasTooltip?: boolean;
}

interface RouteDefinition {
  links: readonly { href: string; key: string }[];
}

const routeDefinitions: Record<SeoSummaryRoute, RouteDefinition> = {
  allocation: {
    links: [
      { href: '/statistics', key: 'statistics' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
  anchoring: {
    links: [
      { href: '/statistics', key: 'statistics' },
      { href: 'https://cosmicsignature.com/learn/anchoring-nfts', key: 'learn' },
      { href: '/gallery', key: 'gallery' },
    ],
  },
  marketing: {
    links: [
      { href: '/faq', key: 'faq' },
      { href: '/statistics', key: 'statistics' },
      { href: '/site-map', key: 'siteMap' },
    ],
  },
  imprint: {
    links: [
      { href: '/', key: 'cycle' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/used-rwlk-nfts', key: 'used' },
    ],
  },
  'eth-contribution': {
    links: [
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/public-goods-contributions-voluntary', key: 'voluntary' },
      { href: '/risk-disclosures', key: 'risk' },
    ],
  },
  'attached-nfts': {
    links: [
      { href: '/gallery', key: 'gallery' },
      { href: '/current-cycle', key: 'cycle' },
      { href: '/how-it-works', key: 'learn' },
    ],
  },
  'allocation-finalized': {
    links: [
      { href: '/allocation', key: 'allocation' },
      { href: '/statistics', key: 'statistics' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
  'named-nfts': {
    links: [
      { href: '/gallery', key: 'gallery' },
      { href: 'https://cosmicsignature.com/learn/three-body-nft-art', key: 'learn' },
      { href: '/code', key: 'code' },
    ],
  },
  'used-rwlk-nfts': {
    links: [
      { href: '/imprint', key: 'imprint' },
      { href: '/how-it-works', key: 'learn' },
      { href: '/current-cycle', key: 'cycle' },
    ],
  },
  'coordination-changes': {
    links: [
      { href: '/security', key: 'security' },
      { href: '/audits', key: 'audits' },
      {
        href: 'https://cosmicsignature.com/learn/cst-token-and-cosmic-council',
        key: 'learn',
      },
    ],
  },
  'public-goods-contributions-cg': {
    links: [
      {
        href: 'https://cosmicsignature.com/learn/protocol-guild-public-goods',
        key: 'learn',
      },
      { href: '/public-goods-retrievals', key: 'retrievals' },
      { href: '/statistics', key: 'statistics' },
    ],
  },
  'public-goods-contributions-voluntary': {
    links: [
      { href: '/eth-contribution', key: 'direct' },
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/risk-disclosures', key: 'risk' },
    ],
  },
  'public-goods-retrievals': {
    links: [
      { href: '/public-goods-contributions-cg', key: 'protocol' },
      { href: '/public-goods-contributions-voluntary', key: 'voluntary' },
      { href: '/contracts', key: 'contracts' },
    ],
  },
};

/** Locale-aware figure formatters; each returns `null` when the value is not a finite number. */
function createFormatters(locale: string) {
  const intlLocale = toIntlLocale(locale);
  const count = new Intl.NumberFormat(intlLocale);
  const amount = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 4 });
  const percent = new Intl.NumberFormat(intlLocale, { style: 'percent' });
  const format = (value: unknown, render: (numeric: number) => string): string | null => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? null : render(numeric);
  };
  return {
    number: (value: unknown) => format(value, (n) => count.format(n)),
    eth: (value: unknown) => format(value, (n) => `${amount.format(n)} ETH`),
    /** An ETH Gesture Cost, in the same quote format as the home tabs and submit button. */
    ethQuote: (value: unknown) => format(value, (n) => `${formatEthQuote(n, locale)} ETH`),
    cst: (value: unknown) => format(value, (n) => `${amount.format(n)} CST`),
    percent: (value: unknown) => format(value, (n) => percent.format(n / 100)),
  };
}

/** Resolves a read to `null` instead of rejecting, so one failed read marks only its own cards unknown. */
async function settle<T>(read: Promise<T>): Promise<T | null> {
  try {
    return await read;
  } catch {
    return null;
  }
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

async function getSummaryCards(route: SeoSummaryRoute, locale: string): Promise<SummaryCard[]> {
  const format = createFormatters(locale);

  switch (route) {
    case 'allocation': {
      const rounds = await settle(get_round_list());
      return [
        {
          key: 'finalizedCycles',
          figure: rounds && format.number(rounds.length),
          hasTooltip: true,
        },
        {
          key: 'recipients',
          figure:
            rounds && format.number(countDistinctAddresses(rounds.map((row) => row.WinnerAddr))),
          hasTooltip: true,
        },
        {
          key: 'totalEth',
          figure: rounds && format.eth(sumAmountEth(rounds)),
          hasTooltip: true,
        },
      ];
    }
    case 'anchoring': {
      const [cstActions, rwalkActions, ethDeposits, stellarImprints] = await Promise.all([
        settle(get_staking_cst_actions()),
        settle(get_staking_rwalk_actions()),
        settle(get_staking_cst_rewards()),
        settle(get_staking_rwalk_mints_global()),
      ]);
      return [
        {
          key: 'actions',
          figure:
            cstActions && rwalkActions && format.number(cstActions.length + rwalkActions.length),
        },
        {
          key: 'ethDeposits',
          figure: ethDeposits && format.number(ethDeposits.length),
          hasTooltip: true,
        },
        {
          key: 'stellarImprints',
          figure: stellarImprints && format.number(stellarImprints.length),
          hasTooltip: true,
        },
      ];
    }
    case 'marketing': {
      const [dashboard, rewards] = await Promise.all([
        settle(get_dashboard_info()),
        settle(get_marketing_rewards()),
      ]);
      return [
        { key: 'records', figure: rewards && format.number(rewards.length) },
        // `TotalMktRewardsEth` is CST already sent to contributors (an 18-decimal token
        // amount despite the `Eth` suffix), not an ETH balance.
        { key: 'allocatedCst', figure: format.cst(dashboard?.MainStats?.TotalMktRewardsEth) },
        {
          key: 'contributors',
          figure:
            rewards &&
            format.number(countDistinctAddresses(rewards.map((row) => row.MarketerAddr))),
        },
      ];
    }
    case 'imprint': {
      const dashboard = await settle(get_dashboard_info());
      return [
        { key: 'cycle', figure: format.number(dashboard?.CurRoundNum) },
        { key: 'cost', figure: format.ethQuote(dashboard?.CurBidPriceEth) },
        { key: 'discount', figure: format.percent(protocolFacts.randomWalkDiscountPercentage) },
      ];
    }
    case 'eth-contribution': {
      // The same source as the Contribution History table below the summary, so the
      // headline figures always reconcile with the rows a reader can count.
      const contributions = await settle(get_donations_both());
      return [
        { key: 'records', figure: contributions && format.number(contributions.length) },
        { key: 'totalEth', figure: contributions && format.eth(sumAmountEth(contributions)) },
        {
          key: 'contributors',
          figure:
            contributions &&
            format.number(countDistinctAddresses(contributions.map((row) => row.DonorAddr))),
        },
      ];
    }
    case 'attached-nfts': {
      const attachedNfts = await settle(get_donations_nft_list());
      return [
        { key: 'records', figure: attachedNfts && format.number(attachedNfts.length) },
        {
          key: 'contracts',
          figure:
            attachedNfts &&
            format.number(countDistinctAddresses(attachedNfts.map((row) => row.TokenAddr))),
        },
        {
          key: 'contributors',
          figure:
            attachedNfts &&
            format.number(countDistinctAddresses(attachedNfts.map((row) => row.DonorAddr))),
        },
      ];
    }
    case 'allocation-finalized': {
      const history = await settle(get_claim_history());
      return [
        { key: 'records', figure: history && format.number(history.length), hasTooltip: true },
        // History rows mix ETH, CST and NFT record types, and `AmountEth` carries each
        // row's own unit: only ETH allocation types may be summed as ETH.
        { key: 'eth', figure: history && format.eth(sumAllocatedEth(history)), hasTooltip: true },
        {
          key: 'recipients',
          figure:
            history && format.number(countDistinctAddresses(history.map((row) => row.WinnerAddr))),
        },
      ];
    }
    case 'named-nfts': {
      const named = await settle(get_named_nfts());
      return [
        { key: 'named', figure: named && format.number(named.length) },
        {
          key: 'owners',
          figure:
            named &&
            format.number(
              countDistinctAddresses(named.map((row) => row.CurOwnerAddr ?? row.OwnerAddr)),
            ),
        },
        { key: 'collection' },
      ];
    }
    case 'used-rwlk-nfts': {
      const used = await settle(get_used_rwlk_nfts());
      return [
        { key: 'used', figure: used && format.number(used.length) },
        { key: 'discount', figure: format.percent(protocolFacts.randomWalkDiscountPercentage) },
        { key: 'scope' },
      ];
    }
    case 'coordination-changes': {
      // The parameter-change events the table on this page lists, not the mode list.
      const events = await settle(get_coordination_events());
      return [
        { key: 'records', figure: events && format.number(events.length) },
        { key: 'governance' },
        { key: 'network' },
      ];
    }
    case 'public-goods-contributions-cg': {
      const deposits = await settle(get_charity_cg_deposits());
      return [
        { key: 'records', figure: deposits && format.number(deposits.length) },
        { key: 'totalEth', figure: deposits && format.eth(sumAmountEth(deposits)) },
        { key: 'track' },
      ];
    }
    case 'public-goods-contributions-voluntary': {
      const deposits = await settle(get_charity_voluntary());
      return [
        { key: 'records', figure: deposits && format.number(deposits.length) },
        { key: 'totalEth', figure: deposits && format.eth(sumAmountEth(deposits)) },
        {
          key: 'contributors',
          figure:
            deposits && format.number(countDistinctAddresses(deposits.map((row) => row.DonorAddr))),
        },
      ];
    }
    case 'public-goods-retrievals': {
      const withdrawals = await settle(get_charity_withdrawals());
      return [
        { key: 'records', figure: withdrawals && format.number(withdrawals.length) },
        { key: 'totalEth', figure: withdrawals && format.eth(sumAmountEth(withdrawals)) },
        { key: 'track' },
      ];
    }
  }
}

export async function PublicDataRouteSeoSummary({ route }: { route: SeoSummaryRoute }) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const prefix = `publicData.routes.${route}`;
  const definition = routeDefinitions[route];
  const heading = t(`${prefix}.heading`);
  const unavailable = t('publicData.common.unavailable');
  const updatedAt = new Date();
  const cards = await getSummaryCards(route, locale);

  return (
    <section
      aria-labelledby={`${route}-seo-heading`}
      className="mb-12 border-b border-border pb-10"
    >
      <p className="type-eyebrow text-primary/80">{t(`${prefix}.eyebrow`)}</p>
      <h1 id={`${route}-seo-heading`} className="mt-4 type-display-lg text-foreground">
        {heading}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t(`${prefix}.description`)}
      </p>
      <p className="mt-3 type-body-sm text-muted-foreground">
        {t('publicData.common.lastUpdated', {
          date: formatUtcDateTimeStamp(updatedAt, locale),
          source: t(`${prefix}.source`),
        })}
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const cardPrefix = `${prefix}.cards.${card.key}`;
          const label = t(`${cardPrefix}.label`);
          const tooltip = card.hasTooltip ? t(`${cardPrefix}.tooltip`) : undefined;
          return (
            <div
              key={card.key}
              data-summary-card={card.key}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>{label}</span>
                {tooltip ? (
                  <InfoTooltip content={tooltip} label={label} iconClassName="h-3 w-3" />
                ) : null}
              </dt>
              <dd className="mt-2 font-display text-2xl font-medium text-foreground">
                {card.figure === undefined ? (
                  t(`${cardPrefix}.value`)
                ) : card.figure === null ? (
                  <UnknownValue label={unavailable} />
                ) : (
                  card.figure
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <nav aria-label={t('publicData.common.relatedPagesAria', { heading })} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          {definition.links.map((link) => (
            <li key={link.href}>
              <Link
                href={localizeCrossHostHref(link.href, locale)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {t(`${prefix}.links.${link.key}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
