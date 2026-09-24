import {
  Anchor,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  Flag,
  Gauge,
  History,
  Hourglass,
  Landmark,
  Layers,
  Megaphone,
  Orbit,
  Paperclip,
  PenLine,
  RotateCcw,
  Shuffle,
  Signature,
  Split,
  Sprout,
  Stamp,
  Timer,
  UserCheck,
  Vault,
  type LucideIcon,
} from 'lucide-react';

/**
 * One pictogram per coined concept (AGENTS.md → "The lexicon").
 *
 * The lexicon keeps auction, lottery, prize and game vocabulary out of the
 * copy; this map keeps the matching imagery out of the interface. Every icon
 * here names what the thing is in the protocol's own register — a pen for a
 * Gesture, an orbit for a Cycle, a gauge for a Calibration Window — and none
 * of them depicts a gavel, a trophy, a crown, crossed swords, dice, a gamepad
 * or a gift box. ESLint (`no-restricted-imports` on lucide-react in
 * eslint.config.mjs) rejects those glyphs so they cannot come back.
 *
 * Use the named exports in JSX, so each page bundles only the glyphs it draws:
 *
 *   import { GestureIcon } from '@/lib/conceptIcons';
 *   <GestureIcon className="size-4" aria-hidden />
 *
 * Use `CONCEPT_ICONS` for data-driven maps keyed by concept (allocation record
 * types, FAQ categories); importing the record bundles every glyph.
 *
 * One concept, one icon, everywhere. When a surface needs a pictogram for a
 * coined term, add the concept here instead of choosing a glyph at the call
 * site, and never give two concepts that sit side by side the same icon.
 */

/** A Gesture (was: bid): the pen stroke a participant adds to the Signature. */
export const GestureIcon = PenLine;
/** A Performance Cycle (was: round). */
export const CycleIcon = Orbit;
/** The Cycle Finalization Time: the clock every Gesture extends. */
export const FinalizationTimeIcon = Timer;
/** A Calibration Window (was: Dutch auction): a cost that descends on a known gauge. */
export const CalibrationWindowIcon = Gauge;
/** The Cycle Reserve the allocation tracks draw from. */
export const CycleReserveIcon = Vault;
/** The Compounding Cycle Reserve carried into the next Cycle. */
export const CompoundingReserveIcon = RotateCcw;
/** A generic allocation record, or the set of allocation tracks. */
export const AllocationIcon = Layers;
/** An allocation recipient (was: winner). */
export const RecipientIcon = UserCheck;
/** The Signature Allocation, received for the Final Gesture of a Cycle. */
export const SignatureAllocationIcon = Signature;
/** The Final CST Gesture of a Cycle and its allocation. */
export const FinalCstGestureIcon = Flag;
/** The Endurance Champion: the longest consecutive hold of the most recent Gesture. */
export const EnduranceChampionIcon = Hourglass;
/** The Chrono-Warrior: the longest consecutive hold of the Endurance Champion position. */
export const ChronoWarriorIcon = History;
/** Stellar Selection (was: raffle): the protocol's random selection at finalization. */
export const StellarSelectionIcon = Shuffle;
/** Anchoring (was: staking) a Cosmic Signature or Random Walk NFT. */
export const AnchoringIcon = Anchor;
/** An Anchor Distribution (was: yield), split equally across anchored NFTs. */
export const AnchorDistributionIcon = Split;
/** Retrieve (was: withdraw or claim) an allocation to the wallet. */
export const RetrieveIcon = ArrowDownToLine;
/** Imprint (was: mint) an NFT or CST. */
export const ImprintIcon = Stamp;
/** Public Goods (was: charity or donation). */
export const PublicGoodsIcon = Sprout;
/** The Outreach Reserve (was: marketing). */
export const OutreachReserveIcon = Megaphone;
/** The Cosmic Council (was: DAO). */
export const CosmicCouncilIcon = Landmark;
/** ETH contributed to the Cycle Reserve outside a Gesture (was: donation). */
export const ContributionIcon = ArrowUpFromLine;
/** Tokens or NFTs attached to a Gesture and held for the Cycle's recipients. */
export const AttachedAssetsIcon = Paperclip;
/** CST, the protocol's ERC-20 token, as an asset: a balance, a supply, a transfer. */
export const CstTokenIcon = Coins;

/** Every coined concept and its icon, for data-driven maps. */
export const CONCEPT_ICONS = {
  gesture: GestureIcon,
  cycle: CycleIcon,
  finalizationTime: FinalizationTimeIcon,
  calibrationWindow: CalibrationWindowIcon,
  cycleReserve: CycleReserveIcon,
  compoundingReserve: CompoundingReserveIcon,
  allocation: AllocationIcon,
  recipient: RecipientIcon,
  signatureAllocation: SignatureAllocationIcon,
  finalCstGesture: FinalCstGestureIcon,
  enduranceChampion: EnduranceChampionIcon,
  chronoWarrior: ChronoWarriorIcon,
  stellarSelection: StellarSelectionIcon,
  anchoring: AnchoringIcon,
  anchorDistribution: AnchorDistributionIcon,
  retrieve: RetrieveIcon,
  imprint: ImprintIcon,
  publicGoods: PublicGoodsIcon,
  outreachReserve: OutreachReserveIcon,
  cosmicCouncil: CosmicCouncilIcon,
  contribution: ContributionIcon,
  attachedAssets: AttachedAssetsIcon,
  cstToken: CstTokenIcon,
} as const satisfies Record<string, LucideIcon>;

export type Concept = keyof typeof CONCEPT_ICONS;
