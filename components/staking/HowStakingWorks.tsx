'use client';

import { HelpCircle } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface HowStakingWorksProps {
  className?: string;
}

const STAKING_FAQ = [
  {
    id: 'what-is-staking',
    question: 'What is Anchoring?',
    answer:
      'Anchoring lets you dedicate your NFTs to the protocol to receive a share of ETH Anchor Distributions. The more tokens you anchor, the larger your share of each distribution. You can release an anchor at any time to reclaim your NFTs and retrieve accumulated distributions.',
  },
  {
    id: 'cst-staking',
    question: 'Cosmic Signature (CST) Anchoring',
    answer:
      'Anchor your Cosmic Signature NFTs to receive ETH from the Anchor Distribution pool. Each cycle, a portion of the Cycle Reserve is distributed proportionally among all CST anchor-holders based on how many tokens they have anchored. Distributions accumulate automatically and can be retrieved when you release an anchor.',
  },
  {
    id: 'rwlk-staking',
    question: 'RandomWalk (RWLK) Anchoring',
    answer:
      'Anchor your RandomWalk NFTs to take part in RWLK allocation imprints. When a RandomWalk allocation event occurs, one of the anchored RWLK tokens is selected at random through on-chain selection to receive a newly imprinted token.',
  },
  {
    id: 'rewards-calculation',
    question: 'How are distributions calculated?',
    answer:
      'CST Anchor Distributions are proportional: if you have anchored 10 out of 100 total anchored tokens, you receive 10% of each distribution deposit. RWLK allocations use an on-chain random-selection mechanism where a single anchored token is selected per allocation event. In both cases, anchoring more tokens increases your expected distributions.',
  },
] as const;

export function HowStakingWorks({ className }: HowStakingWorksProps) {
  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.02] p-6', className)}>
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-primary/70" />
        <h2 className="text-lg font-semibold">How Anchoring Works</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        New to anchoring? Expand any section below to learn more.
      </p>
      <Accordion type="single" collapsible>
        {STAKING_FAQ.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm">{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
