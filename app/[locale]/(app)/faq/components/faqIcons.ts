import { Blocks, Gem, Rocket, ShieldCheck, type LucideIcon } from 'lucide-react';

import type { FAQCategoryIcon } from '@/content/faq/types';

import { AllocationIcon, CycleIcon } from '@/lib/conceptIcons';

export const FAQ_ICONS: Record<FAQCategoryIcon, LucideIcon> = {
  rocket: Rocket,
  trophy: AllocationIcon,
  cycle: CycleIcon,
  gem: Gem,
  layers: Blocks,
  shield: ShieldCheck,
};
