'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Gavel, ArrowLeftRight, Ticket, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

interface ActionItem {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function buildActions(address: string): ActionItem[] {
  return [
    {
      label: 'Anchor NFTs',
      description: 'Receive Anchor Distributions by anchoring your tokens',
      href: '/my-anchors',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: 'Make a Gesture',
      description: 'Take part in the active cycle',
      href: '/',
      icon: <Gavel className="h-4 w-4" />,
    },
    {
      label: 'View Transfers',
      description: 'ERC721 and ERC20 transfer history',
      href: `/cosmic-signature-transfer/${address}`,
      icon: <ArrowLeftRight className="h-4 w-4" />,
    },
    {
      label: 'Stellar Selection History',
      description: 'Your Stellar Selection allocations and ETH deposits',
      href: `/user/stellar-selection-eth/${address}`,
      icon: <Ticket className="h-4 w-4" />,
    },
  ];
}

export interface QuickActionsProps {
  address: string;
  className?: string;
}

export function QuickActions({ address, className }: QuickActionsProps) {
  const actions = buildActions(address);

  return (
    <motion.div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print-motion-visible', className)}
      variants={fadeIn}
      initial={false}
      animate="visible"
      data-testid="quick-actions"
    >
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.04] no-underline"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-[11px] text-muted-foreground">{action.description}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary/60" />
        </Link>
      ))}
    </motion.div>
  );
}
