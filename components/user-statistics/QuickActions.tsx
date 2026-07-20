'use client';

import { motion } from 'framer-motion';
import { Layers, Gavel, ArrowLeftRight, Ticket, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
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

export interface QuickActionsProps {
  address: string;
  className?: string;
}

export function QuickActions({ address, className }: QuickActionsProps) {
  const t = useTranslations('myPages');
  const actions: ActionItem[] = [
    {
      label: t('statistics.quickActions.anchor.label'),
      description: t('statistics.quickActions.anchor.description'),
      href: '/my-anchors',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: t('statistics.quickActions.gesture.label'),
      description: t('statistics.quickActions.gesture.description'),
      href: '/',
      icon: <Gavel className="h-4 w-4" />,
    },
    {
      label: t('statistics.quickActions.transfers.label'),
      description: t('statistics.quickActions.transfers.description'),
      href: `/cosmic-signature-transfer/${address}`,
      icon: <ArrowLeftRight className="h-4 w-4" />,
    },
    {
      label: t('statistics.quickActions.stellarSelection.label'),
      description: t('statistics.quickActions.stellarSelection.description'),
      href: `/user/stellar-selection-eth/${address}`,
      icon: <Ticket className="h-4 w-4" />,
    },
  ];

  return (
    <motion.div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print-motion-visible',
        className,
      )}
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
