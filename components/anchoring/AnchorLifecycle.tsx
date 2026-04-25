'use client';

import * as React from 'react';
import { Anchor, Check, Hourglass, Package } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Surface } from '@/components/ui/surface';
import { fadeRise, useMotionVariants } from '@/lib/motion';

/**
 * AnchorLifecycle — 4-step horizontal stepper that visualizes an anchor's
 * position in the protocol: Anchor → Active → Retrievable → Retrieved.
 *
 * Useful on anchor-action detail pages and anchoring overview cards so
 * users understand where their NFT currently sits without reading prose.
 */

export type AnchorStage = 'anchor' | 'active' | 'retrievable' | 'retrieved';

type IconComponent = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;

interface StageDef {
  id: AnchorStage;
  label: string;
  description: string;
  icon: IconComponent;
}

const STAGES: readonly StageDef[] = [
  {
    id: 'anchor',
    label: 'Anchor',
    description: 'NFT deposited into the protocol',
    icon: Anchor,
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Receiving per-cycle distributions',
    icon: Hourglass,
  },
  {
    id: 'retrievable',
    label: 'Retrievable',
    description: 'Available to retrieve',
    icon: Package,
  },
  {
    id: 'retrieved',
    label: 'Retrieved',
    description: 'Returned to your wallet',
    icon: Check,
  },
];

function stageIndex(stage: AnchorStage): number {
  return STAGES.findIndex((s) => s.id === stage);
}

interface AnchorLifecycleProps {
  current: AnchorStage;
  /** Optional timestamp labels below each stage (e.g. date anchored). */
  timestamps?: Partial<Record<AnchorStage, string>>;
  className?: string;
}

export function AnchorLifecycle({ current, timestamps, className }: AnchorLifecycleProps) {
  const variants = useMotionVariants(fadeRise);
  const activeIdx = stageIndex(current);

  return (
    <Surface variant="glass" radius="md" padding="lg" className={className}>
      <ol
        role="list"
        aria-label="Anchor lifecycle"
        className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-0"
      >
        <div className="absolute left-4 top-4 hidden h-0.5 w-[calc(100%-2rem)] bg-white/[0.06] sm:block" />
        <motion.div
          className="absolute left-4 top-4 hidden h-0.5 origin-left bg-[rgb(var(--aurora-cyan-rgb))] sm:block"
          style={{ width: `calc((100% - 2rem) * ${activeIdx / (STAGES.length - 1)})` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {STAGES.map((stage, idx) => {
          const reached = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          const Icon = stage.icon;
          const ts = timestamps?.[stage.id];
          return (
            <motion.li
              key={stage.id}
              variants={variants}
              initial="initial"
              animate="animate"
              transition={{ delay: idx * 0.08 }}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            >
              <span
                className={cn(
                  'relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors',
                  'duration-[var(--duration-base)] ease-[var(--ease-out-soft)]',
                  reached
                    ? 'border-[rgb(var(--aurora-cyan-rgb))] bg-[rgb(var(--aurora-cyan-rgb)/0.12)] text-[rgb(var(--aurora-cyan-rgb))]'
                    : 'border-white/[0.08] bg-white/[0.02] text-muted-foreground/60',
                  isCurrent && 'animate-signature-pulse',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    'type-body-sm font-semibold',
                    reached ? 'text-foreground' : 'text-muted-foreground/70',
                  )}
                >
                  {stage.label}
                </p>
                <p className="type-body-sm text-muted-foreground">{stage.description}</p>
                {ts ? <p className="mt-0.5 type-mono-sm text-muted-foreground/60">{ts}</p> : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Surface>
  );
}
