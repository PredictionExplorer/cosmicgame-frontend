import Link from 'next/link';

import { InfoTooltip } from '@/components/ui/info-tooltip';
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

type SeoSummaryRoute =
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
  label: string;
  value: string;
  tooltip?: string;
}

interface SummaryConfig {
  eyebrow: string;
  heading: string;
  description: string;
  source: string;
  links: { href: string; label: string }[];
}

const numberFormatter = new Intl.NumberFormat('en-US');
const ethFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

const configs: Record<SeoSummaryRoute, SummaryConfig> = {
  allocation: {
    eyebrow: 'Allocation history · Arbitrum',
    heading: 'Allocation Recipients',
    description:
      'Browse public Cosmic Signature allocation history across finalized Performance Cycles, including Signature Allocations, Stellar Selection, Anchor Distributions, and public-goods flows.',
    source: 'Cosmic Signature public round APIs',
    links: [
      { href: '/statistics', label: 'View protocol statistics' },
      { href: '/how-it-works', label: 'Learn how cycles finalize' },
      { href: '/contracts', label: 'Review contract addresses' },
    ],
  },
  anchoring: {
    eyebrow: 'Anchor distributions · Arbitrum',
    heading: 'Anchor Distributions',
    description:
      'Track public Cosmic Signature NFT anchoring, ETH Anchor Distribution records, RandomWalk NFT anchoring, and Anchored-NFT Stellar Selection imprints.',
    source: 'Cosmic Signature public anchoring APIs',
    links: [
      { href: '/statistics', label: 'View anchoring statistics' },
      { href: 'https://cosmicsignature.com/learn/anchoring-nfts', label: 'Learn about anchoring' },
      { href: '/gallery', label: 'Explore Cosmic Signature NFTs' },
    ],
  },
  marketing: {
    eyebrow: 'Outreach allocations · Arbitrum',
    heading: 'Outreach Allocations',
    description:
      'Review Cosmic Signature outreach allocation history and CST distributions for ecosystem contributors who help people discover the protocol.',
    source: 'Cosmic Signature public outreach allocation APIs',
    links: [
      { href: '/faq', label: 'Read the FAQ' },
      { href: '/statistics', label: 'View protocol statistics' },
      { href: '/site-map', label: 'Browse public pages' },
    ],
  },
  imprint: {
    eyebrow: 'RandomWalk NFT imprinting · Arbitrum',
    heading: 'Imprint RandomWalk NFT',
    description:
      'Imprint RandomWalk NFTs for Cosmic Signature participation. Each unused RandomWalk NFT can be attached to one ETH gesture for a 50% Gesture Cost reduction.',
    source: 'Cosmic Signature public protocol configuration APIs',
    links: [
      { href: '/', label: 'Open the active Performance Cycle' },
      { href: '/how-it-works', label: 'Learn how gestures work' },
      { href: '/used-rwlk-nfts', label: 'View used RandomWalk NFTs' },
    ],
  },
  'eth-contribution': {
    eyebrow: 'Direct ETH contributions · Arbitrum',
    heading: 'Direct ETH Contributions',
    description:
      'Browse direct ETH contributions to the Cosmic Signature Public Goods Vault and the public notes, cycles, and contributor records attached to them.',
    source: 'Cosmic Signature public contribution APIs',
    links: [
      { href: '/public-goods-contributions-cg', label: 'Protocol public-goods contributions' },
      { href: '/public-goods-contributions-voluntary', label: 'Voluntary public-goods records' },
      { href: '/risk-disclosures', label: 'Read risk disclosures' },
    ],
  },
  'attached-nfts': {
    eyebrow: 'Attached NFT contributions · Arbitrum',
    heading: 'Attached NFT Contributions',
    description:
      'Browse NFTs attached to Cosmic Signature gestures. Attached ERC-721 tokens forward to the participant who receives the Signature Allocation when a cycle finalizes.',
    source: 'Cosmic Signature public attached NFT APIs',
    links: [
      { href: '/gallery', label: 'Explore Cosmic Signature gallery' },
      { href: '/current-cycle', label: 'View the current Performance Cycle' },
      { href: '/how-it-works', label: 'Learn how attachments fit the cycle' },
    ],
  },
  'allocation-finalized': {
    eyebrow: 'Retrieved allocations · Arbitrum',
    heading: 'Retrieved Allocations',
    description:
      'Inspect public allocation retrieval records from Cosmic Signature, including ETH receipts, Cosmic Signature NFT allocations, and Stellar Selection distributions.',
    source: 'Cosmic Signature public allocation retrieval APIs',
    links: [
      { href: '/allocation', label: 'View allocation recipients' },
      { href: '/statistics', label: 'View aggregate statistics' },
      { href: '/contracts', label: 'Review verified contracts' },
    ],
  },
  'named-nfts': {
    eyebrow: 'Named NFTs · Arbitrum',
    heading: 'Named Cosmic Signature NFTs',
    description:
      'Browse Cosmic Signature NFTs that owners have given custom names, connecting token identity, gallery discovery, and on-chain collection history.',
    source: 'Cosmic Signature public token APIs',
    links: [
      { href: '/gallery', label: 'Explore the full gallery' },
      {
        href: 'https://cosmicsignature.com/learn/three-body-nft-art',
        label: 'Learn about the art',
      },
      { href: '/code', label: 'Review rendering source code' },
    ],
  },
  'used-rwlk-nfts': {
    eyebrow: 'RandomWalk NFT usage · Arbitrum',
    heading: 'Used RandomWalk NFTs',
    description:
      'Review RandomWalk NFTs that have already been attached to ETH gestures for their one-time Gesture Cost reduction.',
    source: 'Cosmic Signature public RandomWalk usage APIs',
    links: [
      { href: '/imprint', label: 'Imprint RandomWalk NFTs' },
      { href: '/how-it-works', label: 'Learn how gestures work' },
      { href: '/current-cycle', label: 'View current cycle data' },
    ],
  },
  'coordination-changes': {
    eyebrow: 'Coordination changes · Arbitrum',
    heading: 'Coordination Changes',
    description:
      'Review public Cosmic Signature coordination changes, including protocol mode changes, parameter updates, and administration records that affect future cycles.',
    source: 'Cosmic Signature public system event APIs',
    links: [
      { href: '/security', label: 'Read the security overview' },
      { href: '/audits', label: 'Review audits and verification' },
      {
        href: 'https://cosmicsignature.com/learn/cst-token-and-cosmic-council',
        label: 'Learn about CST and coordination',
      },
    ],
  },
  'public-goods-contributions-cg': {
    eyebrow: 'Protocol public-goods contributions · Arbitrum',
    heading: 'Protocol Public-Goods Contributions',
    description:
      'Track automatic Cosmic Signature public-goods forwards from protocol cycles to the Public Goods Beneficiary selected through Cosmic Council coordination.',
    source: 'Cosmic Signature public public-goods APIs',
    links: [
      {
        href: 'https://cosmicsignature.com/learn/protocol-guild-public-goods',
        label: 'Learn about public goods',
      },
      { href: '/public-goods-retrievals', label: 'View public-goods retrievals' },
      { href: '/statistics', label: 'View public-goods statistics' },
    ],
  },
  'public-goods-contributions-voluntary': {
    eyebrow: 'Voluntary public-goods contributions · Arbitrum',
    heading: 'Voluntary Public-Goods Contributions',
    description:
      'Browse voluntary public-goods contributions from the Cosmic Signature community, including cycle context and contributor records.',
    source: 'Cosmic Signature public public-goods APIs',
    links: [
      { href: '/eth-contribution', label: 'View direct ETH contributions' },
      { href: '/public-goods-contributions-cg', label: 'Protocol public-goods contributions' },
      { href: '/risk-disclosures', label: 'Read risk disclosures' },
    ],
  },
  'public-goods-retrievals': {
    eyebrow: 'Public-goods retrievals · Arbitrum',
    heading: 'Public Goods Retrievals',
    description:
      'Review retrievals from the Cosmic Signature Public Goods Vault, where cycle reserves forward support to the selected public-goods beneficiary.',
    source: 'Cosmic Signature public public-goods APIs',
    links: [
      { href: '/public-goods-contributions-cg', label: 'Protocol public-goods contributions' },
      {
        href: '/public-goods-contributions-voluntary',
        label: 'Voluntary public-goods contributions',
      },
      { href: '/contracts', label: 'Review public contract addresses' },
    ],
  },
};

function formatNumber(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : 'Unavailable';
}

function formatEth(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${ethFormatter.format(numeric)} ETH` : 'Unavailable';
}

function sumEth<T>(rows: T[], selector: (row: T) => unknown): number {
  return rows.reduce((total, row) => {
    const numeric = Number(selector(row));
    return Number.isFinite(numeric) ? total + numeric : total;
  }, 0);
}

async function getSummaryCards(route: SeoSummaryRoute): Promise<SummaryCard[]> {
  switch (route) {
    case 'allocation': {
      const rounds = await get_round_list();
      return [
        {
          label: 'Finalized Cycles',
          value: formatNumber(rounds.length),
          tooltip: 'The number of Performance Cycles with finalized allocation data.',
        },
        {
          label: 'Signature Allocation Recipients',
          value: formatNumber(new Set(rounds.map((row) => row.WinnerAddr).filter(Boolean)).size),
          tooltip:
            'Distinct wallets that received the Signature Allocation by making the Final Gesture.',
        },
        {
          label: 'Total Signature Allocation ETH',
          value: formatEth(sumEth(rounds, (row) => row.AmountEth)),
          tooltip:
            'The sum of Signature Allocation ETH across finalized cycles, based on round records.',
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
        {
          label: 'Anchor / Release Actions',
          value: formatNumber(cstActions.length + rwalkActions.length),
        },
        {
          label: 'Currently Anchored Tokens',
          value: formatNumber(cstTokens.length + rwalkTokens.length),
        },
        {
          label: 'Anchor Distribution Records',
          value: formatNumber(rewards.length + rwalkMints.length),
        },
      ];
    }
    case 'marketing': {
      const [dashboard, rewards] = await Promise.all([
        get_dashboard_info(),
        get_marketing_rewards(),
      ]);
      return [
        { label: 'Outreach Allocation Records', value: formatNumber(rewards.length) },
        { label: 'Outreach Reserve', value: formatEth(dashboard?.MainStats?.TotalMktRewardsEth) },
        {
          label: 'Unique Outreach Contributors',
          value: formatNumber(new Set(rewards.map((row) => row.MarketerAddr)).size),
        },
      ];
    }
    case 'imprint': {
      const dashboard = await get_dashboard_info();
      return [
        { label: 'Active Performance Cycle', value: formatNumber(dashboard?.CurRoundNum) },
        {
          label: 'Current ETH Gesture Cost',
          value: formatEth(dashboard?.GestureCostEth ?? dashboard?.CurBidPriceEth),
        },
        { label: 'RandomWalk Discount', value: '50%' },
      ];
    }
    case 'eth-contribution': {
      const contributions = await get_donations_cg_with_info_list();
      return [
        { label: 'Direct Contribution Records', value: formatNumber(contributions.length) },
        {
          label: 'Total Direct ETH Contributions',
          value: formatEth(sumEth(contributions, (row) => row.AmountEth)),
        },
        {
          label: 'Unique Contributors',
          value: formatNumber(new Set(contributions.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'attached-nfts': {
      const attachedNfts = await get_donations_nft_list();
      return [
        { label: 'Attached NFT Records', value: formatNumber(attachedNfts.length) },
        {
          label: 'Unique NFT Contracts',
          value: formatNumber(new Set(attachedNfts.map((row) => row.TokenAddr)).size),
        },
        {
          label: 'Contributor Wallets',
          value: formatNumber(new Set(attachedNfts.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'allocation-finalized': {
      const claims = await get_claim_history();
      return [
        { label: 'Retrieved Allocation Records', value: formatNumber(claims.length) },
        { label: 'ETH Retrieved', value: formatEth(sumEth(claims, (row) => row.AmountEth)) },
        {
          label: 'Recipient Wallets',
          value: formatNumber(new Set(claims.map((row) => row.WinnerAddr)).size),
        },
      ];
    }
    case 'named-nfts': {
      const named = await get_named_nfts();
      return [
        { label: 'Named Cosmic Signature NFTs', value: formatNumber(named.length) },
        {
          label: 'Current Owners',
          value: formatNumber(new Set(named.map((row) => row.CurOwnerAddr ?? row.OwnerAddr)).size),
        },
        { label: 'Collection', value: 'Cosmic Signature ERC-721' },
      ];
    }
    case 'used-rwlk-nfts': {
      const used = await get_used_rwlk_nfts();
      return [
        { label: 'Used RandomWalk NFTs', value: formatNumber(used.length) },
        { label: 'One-Time Discount', value: '50%' },
        { label: 'Usage Scope', value: 'One gesture per NFT' },
      ];
    }
    case 'coordination-changes': {
      const changes = await get_system_modelist();
      return [
        { label: 'Coordination Change Records', value: formatNumber(changes.length) },
        { label: 'Governance Surface', value: 'Cosmic Council' },
        { label: 'Network', value: 'Arbitrum' },
      ];
    }
    case 'public-goods-contributions-cg': {
      const deposits = await get_charity_cg_deposits();
      return [
        { label: 'Protocol Contribution Records', value: formatNumber(deposits.length) },
        {
          label: 'Protocol Public-Goods ETH',
          value: formatEth(sumEth(deposits, (row) => row.AmountEth)),
        },
        { label: 'Allocation Track', value: 'Public Goods' },
      ];
    }
    case 'public-goods-contributions-voluntary': {
      const deposits = await get_charity_voluntary();
      return [
        { label: 'Voluntary Contribution Records', value: formatNumber(deposits.length) },
        {
          label: 'Voluntary Public-Goods ETH',
          value: formatEth(sumEth(deposits, (row) => row.AmountEth)),
        },
        {
          label: 'Contributor Wallets',
          value: formatNumber(new Set(deposits.map((row) => row.DonorAddr)).size),
        },
      ];
    }
    case 'public-goods-retrievals': {
      const withdrawals = await get_charity_withdrawals();
      return [
        { label: 'Public-Goods Retrieval Records', value: formatNumber(withdrawals.length) },
        {
          label: 'Retrieved Public-Goods ETH',
          value: formatEth(sumEth(withdrawals, (row) => row.AmountEth)),
        },
        { label: 'Beneficiary Track', value: 'Public Goods Vault' },
      ];
    }
  }
}

function formatUpdatedAt(date: Date): string {
  return `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
}

export async function PublicDataRouteSeoSummary({ route }: { route: SeoSummaryRoute }) {
  const config = configs[route];
  const updatedAt = new Date();
  const cards = await getSummaryCards(route);

  return (
    <section
      aria-labelledby={`${route}-seo-heading`}
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{config.eyebrow}</p>
      <h1 id={`${route}-seo-heading`} className="mt-4 type-display-md text-foreground">
        {config.heading}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">{config.description}</p>
      <p className="mt-3 type-body-sm text-muted-foreground">
        Last updated: {formatUpdatedAt(updatedAt)}. Data source: {config.source}. The interactive
        tables below hydrate with live app data, while this summary is present in the initial HTML
        for search engines and AI crawlers.
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{card.label}</span>
              {card.tooltip ? (
                <InfoTooltip content={card.tooltip} label={card.label} iconClassName="h-3 w-3" />
              ) : null}
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">{card.value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label={`${config.heading} related pages`} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          {config.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-primary underline-offset-4 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
