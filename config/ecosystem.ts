import { ArrowLeftRight, Store, TrendingUpDown, type LucideIcon } from 'lucide-react';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

/** Accent palettes are resolved to concrete classes by the consuming component. */
export type EcosystemAccent = 'cyan' | 'violet' | 'gold';

export interface EcosystemDestination {
  /** Stable identifier, used for keys and test hooks. */
  id: string;
  /** Short visible label, e.g. "Axiom Zero". */
  name: string;
  /** What the destination is, e.g. "NFT marketplace". */
  product: string;
  /** One-line description used in menus and drawers. */
  tagline: string;
  /** Absolute https URL of the destination. */
  href: string;
  /** Full accessible name for the link. Must contain the visible label. */
  ariaLabel: string;
  accent: EcosystemAccent;
  icon: LucideIcon;
}

/**
 * The external product surfaces that orbit the Cosmic Signature app —
 * rendered as one cohesive "ecosystem" group in the header, the mobile
 * drawer, and the footer so the three destinations always read as a set.
 */
export const ECOSYSTEM_DESTINATIONS: readonly EcosystemDestination[] = [
  {
    id: 'uniswap-cst',
    name: 'Trade CST',
    product: 'Uniswap',
    tagline: 'Swap ETH for CST on Uniswap',
    href: CST_UNISWAP_SWAP_URL,
    ariaLabel: 'Trade CST on Uniswap',
    accent: 'cyan',
    icon: ArrowLeftRight,
  },
  {
    id: 'axiom-zero',
    name: 'Axiom Zero',
    product: 'NFT marketplace',
    tagline: 'Collect Cosmic Signature NFTs on the zero-fee marketplace',
    href: COSMIC_SIGNATURE_MARKETPLACE_URL,
    ariaLabel: 'Axiom Zero NFT marketplace',
    accent: 'violet',
    icon: Store,
  },
  {
    id: 'chaos-zero',
    name: 'Chaos Zero',
    product: 'Prediction market',
    tagline: 'Make predictions on each cycle of the protocol',
    href: CHAOS_ZERO_PREDICTIONS_URL,
    ariaLabel: 'Make predictions on Chaos Zero',
    accent: 'gold',
    icon: TrendingUpDown,
  },
];
