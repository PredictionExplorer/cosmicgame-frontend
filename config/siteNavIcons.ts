/**
 * One icon per destination of the site navigation taxonomy (config/siteNav.ts),
 * shared by the header panels, the drawer, the site map, the 404 page, the
 * wallet menu and the command palette. Kept apart from the taxonomy so the
 * landing header and footer, which draw no icons, never bundle them.
 */
import {
  Activity,
  Anchor,
  ArrowLeftRight,
  AtSign,
  BadgeCheck,
  BookOpen,
  ChartColumn,
  ChartLine,
  CircleHelp,
  Code2,
  Coins,
  Compass,
  FileCode2,
  FileText,
  Gift,
  Globe,
  GraduationCap,
  HandCoins,
  History,
  Images,
  Layers,
  LayoutDashboard,
  ListChecks,
  Map as MapIcon,
  Megaphone,
  MessagesSquare,
  Orbit,
  PenLine,
  Repeat,
  ScrollText,
  SendHorizontal,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Stamp,
  Store,
  Tag,
  Telescope,
  Trophy,
  Users,
  Vault,
  type LucideIcon,
} from 'lucide-react';

import type {
  OutboundGroupId,
  OutboundLinkId,
  SiteRouteGroupId,
  SiteRouteId,
  SiteSectionId,
} from './siteNav';

export const SITE_ROUTE_ICONS: Record<SiteRouteId, LucideIcon> = {
  observatory: Telescope,
  currentCycle: Orbit,
  imprint: Stamp,
  gallery: Images,
  namedNfts: Tag,
  attachedNfts: Gift,
  usedRwlkNfts: Repeat,
  statistics: ChartColumn,
  statisticsParticipation: Users,
  statisticsTokens: Coins,
  statisticsAnchoring: Anchor,
  statisticsActivity: Activity,
  statisticsPerformance: Trophy,
  allocationRecipients: Users,
  anchorDistributions: Anchor,
  outreachAllocations: Megaphone,
  publicGoodsProtocol: Sprout,
  publicGoodsVoluntary: HandCoins,
  publicGoodsRetrievals: Vault,
  ethContributions: PenLine,
  coordinationChanges: SlidersHorizontal,
  retrievedAllocations: ListChecks,
  howItWorks: Compass,
  faq: CircleHelp,
  learnHub: GraduationCap,
  whitePaper: FileText,
  quiz: BadgeCheck,
  about: BookOpen,
  projectSite: Sparkles,
  security: ShieldCheck,
  audits: ScrollText,
  contracts: FileCode2,
  sourceCode: Code2,
  riskDisclosures: ShieldAlert,
  terms: FileText,
  privacy: ShieldCheck,
  siteMap: MapIcon,
  myStatistics: LayoutDashboard,
  myAllocations: Gift,
  myNfts: Images,
  myAnchors: Layers,
  allocationHistory: History,
  transferCst: SendHorizontal,
};

export const SITE_ROUTE_GROUP_ICONS: Record<SiteRouteGroupId, LucideIcon> = {
  publicGoods: Sprout,
};

export const SITE_SECTION_ICONS: Record<SiteSectionId, LucideIcon> = {
  participate: Telescope,
  collection: Images,
  explore: ChartLine,
  records: ScrollText,
  learn: GraduationCap,
  trust: ShieldCheck,
  account: LayoutDashboard,
};

export const OUTBOUND_GROUP_ICONS: Record<OutboundGroupId, LucideIcon> = {
  ecosystem: Globe,
  community: MessagesSquare,
};

/**
 * Outbound destinations share one neutral treatment: no accent colours, and
 * the new-tab arrow is added by the link itself.
 */
export const OUTBOUND_ICONS: Record<OutboundLinkId, LucideIcon> = {
  uniswap: ArrowLeftRight,
  axiomZero: Store,
  chaosZero: Globe,
  geckoTerminal: ChartLine,
  x: AtSign,
  discord: MessagesSquare,
  github: Code2,
  protocolGuild: Sprout,
};
