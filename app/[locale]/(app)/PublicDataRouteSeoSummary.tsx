import { getLocale, getTranslations } from 'next-intl/server';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Link } from '@/i18n/navigation';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import {
  get_staked_cst_tokens,
  get_staked_rwalk_tokens,
  get_staking_cst_actions,
  get_staking_cst_rewards,
  get_staking_rwalk_actions,
  get_staking_rwalk_mints_global,
} from '@/services/api/anchoring';
import {
  get_charity_cg_deposits,
  get_charity_voluntary,
  get_charity_withdrawals,
  get_donations_cg_with_info_list,
  get_donations_nft_list,
} from '@/services/api/donations';
import { get_marketing_rewards } from '@/services/api/marketing';
import { get_claim_history, get_dashboard_info, get_round_list } from '@/services/api/rounds';
import { get_system_modelist } from '@/services/api/system';
import { get_named_nfts, get_used_rwlk_nfts } from '@/services/api/tokens';
import { formatUtcDateTimeStamp, toIntlLocale } from '@/utils/format';

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
  value?: string;
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

function formatLocalizedNumber(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat(toIntlLocale(locale)).format(numeric)
    : unavailable;
}

function formatLocalizedEth(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? `${new Intl.NumberFormat(toIntlLocale(locale), {
        maximumFractionDigits: 4,
      }).format(numeric)} ETH`
    : unavailable;
}

function sumEth<T>(rows: T[], selector: (row: T) => unknown): number {
  return rows.reduce((total, row) => {
    const numeric = Number(selector(row));
    return Number.isFinite(numeric) ? total + numeric : total;
  }, 0);
}

async function getSummaryCards(
  route: SeoSummaryRoute,
  locale: string,
  unavailable: string,
): Promise<SummaryCard[]> {
  const formatNumber = (value: unknown) => formatLocalizedNumber(value, locale, unavailable);
  const formatEth = (value: unknown) => formatLocalizedEth(value, locale, unavailable);

  switch (route) {
    case 'allocation': {
      const rounds = await get_round_list();
      return [
        { key: 'finalizedCycles', value: formatNumber(rounds.length), hasTooltip: true },
        {
          key: 'recipients',
          value: formatNumber(new Set(rounds.map((row) => row.WinnerAddr).filter(Boolean)).size),
          hasTooltip: true,
        },
        {
          key: 'totalEth',
          value: formatEth(sumEth(rounds, (row) => row.AmountEth)),
          hasTooltip: true,
        },
      ];
    }
    case 'anchoring': {
      const [cstActions, rwalkActions, cstTokens, rwalkTokens, rewards, rwalkMints] =
        await Promise.all([
          get_staking_cst_actions(),
          get_staking_rwalk_actions(),
          get_staked_cst_tokens(),
          get_staked_rwalk_tokens(),
          get_staking_cst_rewards(),
          get_staking_rwalk_mints_global(),
        ]);
      return [
        { key: 'actions', value: formatNumber(cstActions.length + rwalkActions.length) },
        { key: 'tokens', value: formatNumber(cstTokens.length + rwalkTokens.length) },
        { key: 'distributions', value: formatNumber(rewards.length + rwalkMints.length) },
      ];
    }
    case 'marketing': {
      const [dashboard, rewards] = await Promise.all([
        get_dashboard_info(),
        get_marketing_rewards(),
      ]);
      return [
        { key: 'records', value: formatNumber(rewards.length) },
        { key: 'reserve', value: formatEth(dashboard?.MainStats?.TotalMktRewardsEth) },
        {
          key: 'contributors',
          value: formatNumber(new Set(rewards.map((row) => row.MarketerAddr)).size),
        },
      ];
    }
    case 'imprint': {
      const dashboard = await get_dashboard_info();
      return [
        { key: 'cycle', value: formatNumber(dashboard?.CurRoundNum) },
        {
          key: 'cost',
          value: formatEth(dashboard?.GestureCostEth ?? dashboard?.CurBidPriceEth),
        },
        { key: 'discount', value: '50%' },
      ];
    }
    case 'eth-contribution': {
      const contributions = await get_donations_cg_with_info_list();
      return [
        { key: 'records', value: formatNumber(contributions.length) },
        {
          key: 'totalEth',
          value: formatEth(sumEth(contributions, (row) => row.AmountEth)),
        },
        {
          key: 'contributors',
          value: formatNumber(new Set(contributions.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'attached-nfts': {
      const attachedNfts = await get_donations_nft_list();
      return [
        { key: 'records', value: formatNumber(attachedNfts.length) },
        {
          key: 'contracts',
          value: formatNumber(new Set(attachedNfts.map((row) => row.TokenAddr)).size),
        },
        {
          key: 'contributors',
          value: formatNumber(new Set(attachedNfts.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'allocation-finalized': {
      const claims = await get_claim_history();
      return [
        { key: 'records', value: formatNumber(claims.length) },
        { key: 'eth', value: formatEth(sumEth(claims, (row) => row.AmountEth)) },
        {
          key: 'recipients',
          value: formatNumber(new Set(claims.map((row) => row.WinnerAddr)).size),
        },
      ];
    }
    case 'named-nfts': {
      const named = await get_named_nfts();
      return [
        { key: 'named', value: formatNumber(named.length) },
        {
          key: 'owners',
          value: formatNumber(new Set(named.map((row) => row.CurOwnerAddr ?? row.OwnerAddr)).size),
        },
        { key: 'collection' },
      ];
    }
    case 'used-rwlk-nfts': {
      const used = await get_used_rwlk_nfts();
      return [
        { key: 'used', value: formatNumber(used.length) },
        { key: 'discount', value: '50%' },
        { key: 'scope' },
      ];
    }
    case 'coordination-changes': {
      const changes = await get_system_modelist();
      return [
        { key: 'records', value: formatNumber(changes.length) },
        { key: 'governance' },
        { key: 'network' },
      ];
    }
    case 'public-goods-contributions-cg': {
      const deposits = await get_charity_cg_deposits();
      return [
        { key: 'records', value: formatNumber(deposits.length) },
        { key: 'totalEth', value: formatEth(sumEth(deposits, (row) => row.AmountEth)) },
        { key: 'track' },
      ];
    }
    case 'public-goods-contributions-voluntary': {
      const deposits = await get_charity_voluntary();
      return [
        { key: 'records', value: formatNumber(deposits.length) },
        { key: 'totalEth', value: formatEth(sumEth(deposits, (row) => row.AmountEth)) },
        {
          key: 'contributors',
          value: formatNumber(new Set(deposits.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'public-goods-retrievals': {
      const withdrawals = await get_charity_withdrawals();
      return [
        { key: 'records', value: formatNumber(withdrawals.length) },
        {
          key: 'totalEth',
          value: formatEth(sumEth(withdrawals, (row) => row.AmountEth)),
        },
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
  const updatedAt = new Date();
  const cards = await getSummaryCards(route, locale, t('publicData.common.unavailable')).catch(
    () => [] as SummaryCard[],
  );

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

      {cards.length > 0 ? (
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          {cards.map((card) => {
            const cardPrefix = `${prefix}.cards.${card.key}`;
            const label = t(`${cardPrefix}.label`);
            const tooltip = card.hasTooltip ? t(`${cardPrefix}.tooltip`) : undefined;
            return (
              <div key={card.key} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span>{label}</span>
                  {tooltip ? (
                    <InfoTooltip content={tooltip} label={label} iconClassName="h-3 w-3" />
                  ) : null}
                </dt>
                <dd className="mt-2 font-display text-2xl font-medium text-foreground">
                  {card.value ?? t(`${cardPrefix}.value`)}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}

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
