import { Gamepad2, Gem, Layers, Rocket, ShieldCheck, Trophy, type LucideIcon } from 'lucide-react';

import type { FAQCategoryIcon } from '@/content/faq';

export const FAQ_ICONS: Record<FAQCategoryIcon, LucideIcon> = {
  rocket: Rocket,
  trophy: Trophy,
  cycle: Gamepad2,
  gem: Gem,
  layers: Layers,
  shield: ShieldCheck,
};
