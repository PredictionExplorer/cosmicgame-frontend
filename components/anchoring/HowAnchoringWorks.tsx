'use client';

import { HelpCircle } from 'lucide-react';

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
    question: 'What is Anchoring?',
    answer:
      'Anchoring lets you dedicate your NFTs to the protocol. Cosmic Signature NFT anchors receive ETH Anchor Distributions, while RandomWalk NFT anchors enter Anchored-NFT Stellar Selection. You can release an anchor at any time to reclaim your NFTs and retrieve accumulated distributions.',
  },
  {
    id: 'cst-anchoring',
    question: 'Cosmic Signature NFT Anchoring',
    answer:
      'Anchor your Cosmic Signature NFTs to receive ETH from the Anchor Distribution pool. Each cycle, 6% of the Cycle Reserve is distributed proportionally among all Cosmic Signature NFT anchor-holders based on how many NFTs they have anchored. Distributions accumulate automatically and can be retrieved when you release an anchor.',
  },
  {
    id: 'rwlk-anchoring',
    question: 'RandomWalk (RWLK) Anchoring',
    answer:
      'Anchor your RandomWalk NFTs to take part in Anchored-NFT Stellar Selection. Each cycle, ten RandomWalk NFT anchor-holders are selected through on-chain random selection to each receive 1,000 CST and one newly imprinted Cosmic Signature NFT.',
  },
  {
    id: 'rewards-calculation',
    question: 'How are distributions calculated?',
    answer:
      'Cosmic Signature NFT Anchor Distributions are proportional: if you have anchored 10 out of 100 total anchored NFTs, you receive 10% of each distribution deposit. RandomWalk NFT allocations use an on-chain random-selection mechanism for Anchored-NFT Stellar Selection. In both cases, anchoring more NFTs increases your expected distributions.',
  },
] as const;

export function HowAnchoringWorks({ className }: HowAnchoringWorksProps) {
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
        {ANCHORING_FAQ.map((item) => (
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
