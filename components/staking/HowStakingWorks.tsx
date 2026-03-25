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
    question: 'What is Staking?',
    answer:
      'Staking lets you lock your NFTs in a smart contract to earn a share of ETH rewards. The longer you stake and the more tokens you commit, the larger your share of each reward distribution. You can unstake at any time to reclaim your NFTs and collect accumulated rewards.',
  },
  {
    id: 'cst-staking',
    question: 'CosmicSignature (CST) Staking',
    answer:
      'Stake your CosmicSignature NFTs to earn ETH from the staking reward pool. Each round, a portion of the prize pool is distributed proportionally among all CST stakers based on how many tokens they have staked. Rewards accumulate automatically and can be claimed when you unstake.',
  },
  {
    id: 'rwlk-staking',
    question: 'RandomWalk (RWLK) Staking',
    answer:
      'Stake your RandomWalk NFTs to participate in RWLK reward distributions. When a RandomWalk reward event occurs, one of the staked RWLK tokens is randomly selected to receive a newly minted token as a reward.',
  },
  {
    id: 'rewards-calculation',
    question: 'How are rewards calculated?',
    answer:
      'CST staking rewards are proportional: if you have staked 10 out of 100 total staked tokens, you receive 10% of each reward deposit. RWLK rewards use a lottery mechanism where a single staked token is randomly chosen per reward event. In both cases, staking more tokens increases your expected rewards.',
  },
] as const;

export function HowStakingWorks({ className }: HowStakingWorksProps) {
  return (
    <div className={cn('rounded-xl border border-white/[0.06] bg-white/[0.02] p-6', className)}>
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-primary/70" />
        <h2 className="text-lg font-semibold">How Staking Works</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        New to staking? Expand any section below to learn more.
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
