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
      'Anchoring lets you dedicate NFTs to the protocol. Cosmic Signature NFT anchors receive ETH Anchor Distributions, while RandomWalk NFT anchors enter Anchored-NFT Stellar Selection. You can release an anchor at any time to reclaim your NFTs; Cosmic Signature NFT releases also retrieve accumulated ETH distributions. Important: each NFT can be anchored only once, ever \u2014 once released, that NFT can never be anchored again.',
  },
  {
    id: 'cst-anchoring',
    question: 'Cosmic Signature NFT Anchoring',
    answer:
      'Anchor your Cosmic Signature NFTs to receive ETH from the Anchor Distribution pool. Each cycle, 6% of the Cycle Reserve is distributed proportionally among all Cosmic Signature NFT anchor-holders based on how many NFTs they have anchored. Distributions accumulate automatically and are paid out when you release an anchor. If no Cosmic Signature NFTs are anchored when a cycle finalizes, that cycle\u2019s share stays in the Cycle Reserve.',
  },
  {
    id: 'rwlk-anchoring',
    question: 'RandomWalk (RWLK) Anchoring',
    answer:
      'Anchor your RandomWalk NFTs to take part in Anchored-NFT Stellar Selection. Each cycle, ten selections are drawn among anchored RandomWalk NFTs through on-chain random selection; each selection receives 1,000 CST and one newly imprinted Cosmic Signature NFT. Selections are drawn with replacement, so the same anchor-holder can be selected more than once. RandomWalk anchors receive no ETH.',
  },
  {
    id: 'rewards-calculation',
    question: 'How are distributions calculated?',
    answer:
      'Cosmic Signature NFT Anchor Distributions are proportional: if you have anchored 10 out of 100 total anchored Cosmic Signature NFTs, you receive 10% of each ETH distribution deposit. RandomWalk NFT anchoring uses an on-chain random-selection mechanism for Anchored-NFT Stellar Selection, so anchoring more RandomWalk NFTs increases your selection chance rather than an ETH distribution share.',
  },
  {
    id: 'anchor-once-only',
    question: 'Can I re-anchor an NFT after releasing it?',
    answer:
      'No. The anchoring contracts record every NFT that has ever been anchored, and an NFT is allowed to be anchored only once. Releasing an anchor pays out any accumulated ETH distributions (for Cosmic Signature NFTs) and returns the NFT to your wallet, but permanently ends that NFT\u2019s anchoring eligibility. Only release when you want to exit anchoring for that NFT entirely.',
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
