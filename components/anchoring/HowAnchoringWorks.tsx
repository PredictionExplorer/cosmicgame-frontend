'use client';

import { HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface HowAnchoringWorksProps {
  className?: string;
}

const ANCHORING_FAQ = [
  {
    id: 'what-is-anchoring',
    questionKey: 'howItWorks.items.whatIsAnchoring.question',
    answerKey: 'howItWorks.items.whatIsAnchoring.answer',
  },
  {
    id: 'cst-anchoring',
    questionKey: 'howItWorks.items.cosmicSignature.question',
    answerKey: 'howItWorks.items.cosmicSignature.answer',
  },
  {
    id: 'rwlk-anchoring',
    questionKey: 'howItWorks.items.randomWalk.question',
    answerKey: 'howItWorks.items.randomWalk.answer',
  },
  {
    id: 'rewards-calculation',
    questionKey: 'howItWorks.items.calculation.question',
    answerKey: 'howItWorks.items.calculation.answer',
  },
  {
    id: 'anchor-once-only',
    questionKey: 'howItWorks.items.anchorOnce.question',
    answerKey: 'howItWorks.items.anchorOnce.answer',
  },
] as const;

export function HowAnchoringWorks({ className }: HowAnchoringWorksProps) {
  const t = useTranslations('anchoring');

  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.02] p-6', className)}>
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-primary/70" />
        <h2 className="text-lg font-semibold">{t('howItWorks.title')}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t('howItWorks.intro')}</p>
      <Accordion type="single" collapsible>
        {ANCHORING_FAQ.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm">{t(item.questionKey)}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(item.answerKey)}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
