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

export interface EcosystemDestinationDefinition extends Pick<
  EcosystemDestination,
  'id' | 'href' | 'accent' | 'icon'
> {
  copyKey: 'uniswap' | 'axiomZero' | 'chaosZero';
}

type EcosystemTranslator = (key: string) => string;

/**
 * The external product surfaces that orbit the Cosmic Signature app —
 * rendered as one cohesive "ecosystem" group in the header, the mobile
 * drawer, and the footer so the three destinations always read as a set.
 */
export const ECOSYSTEM_DESTINATIONS: readonly EcosystemDestinationDefinition[] = [
  {
    id: 'uniswap-cst',
    copyKey: 'uniswap',
    href: CST_UNISWAP_SWAP_URL,
    accent: 'cyan',
    icon: ArrowLeftRight,
  },
  {
    id: 'axiom-zero',
    copyKey: 'axiomZero',
    href: COSMIC_SIGNATURE_MARKETPLACE_URL,
    accent: 'violet',
    icon: Store,
  },
  {
    id: 'chaos-zero',
    copyKey: 'chaosZero',
    href: CHAOS_ZERO_PREDICTIONS_URL,
    accent: 'gold',
    icon: TrendingUpDown,
  },
];

export function getEcosystemDestinations(t: EcosystemTranslator): readonly EcosystemDestination[] {
  return ECOSYSTEM_DESTINATIONS.map((destination) => ({
    ...destination,
    name: t(`ecosystem.${destination.copyKey}.name`),
    product: t(`ecosystem.${destination.copyKey}.product`),
    tagline: t(`ecosystem.${destination.copyKey}.tagline`),
    ariaLabel: t(`ecosystem.${destination.copyKey}.ariaLabel`),
  }));
}
