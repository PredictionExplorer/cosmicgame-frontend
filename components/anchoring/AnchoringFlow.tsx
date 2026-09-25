'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { cn } from '@/lib/utils';
import type { DistributionPerAnchoredNft } from '@/utils/anchoringStats';
import { useFormat } from '@/hooks/useFormat';
import { Amount } from '@/components/ui/amount';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

export interface AnchoringFlowProps {
  /** The Anchor Distribution pool this cycle will deposit (ETH); `null` when unread. */
  poolEth: number | null;
  /** Cosmic Signature NFTs anchored now; `null` when unread. */
  anchoredCosmicSignature: number | null;
  perNft: DistributionPerAnchoredNft;
  /** Random Walk NFTs anchored now; `null` when unread. */
  anchoredRandomWalk: number | null;
  /** Distinct wallets anchoring either collection; `null` when unread. */
  activeHolders: number | null;
  loading?: boolean;
  className?: string;
}

interface FlowNodeProps {
  label: string;
  /** A one-sentence definition: the label becomes an explained term. */
  definition?: string;
  value: ReactNode;
  caption?: ReactNode;
  loading?: boolean;
}

/**
 * A lane from `sm`: figures and steps in one row of columns, with three
 * shared rows (label, value, caption) that each figure joins as a subgrid.
 * Every value then sits on the same line however many lines a label takes
 * in a long locale, and the steps align to the values. Each figure is
 * centred in its column, so an operator sits balanced between its operands
 * whatever their lengths ("1.9376 ETH ÷ 33 = 0.0587 ETH" reads as one
 * equation, not three left-aligned values with uneven gaps). It stacks,
 * start-aligned, on phones.
 */
const LANE_CLASS = cn(
  'mt-4 flex flex-col gap-3',
  'sm:grid sm:grid-flow-col sm:grid-rows-[repeat(3,auto)] sm:gap-x-3 sm:gap-y-1.5 lg:gap-x-4',
  'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]',
);

/**
 * A lane title's colour dot, centred on the title's first line (half its
 * line height, less half the dot), so a title that wraps keeps the dot
 * beside its first line instead of floating between the two.
 */
const TITLE_DOT_CLASS = 'mt-[calc(0.5lh-3px)] size-1.5 shrink-0 rounded-full';

/** One figure of a lane: its label, the live value and an optional caption. */
function FlowNode({ label, definition, value, caption, loading = false }: FlowNodeProps) {
  return (
    <li className="min-w-0 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:text-center">
      <p className="type-label text-subtle hyphens-auto sm:self-end">
        {definition ? (
          <ExplainedTerm definition={definition} announce="moreInformation">
            {label}
          </ExplainedTerm>
        ) : (
          label
        )}
      </p>
      <div className="mt-1.5 type-figure-md text-foreground sm:mt-0">
        {loading ? <Skeleton className="h-6 w-24 sm:mx-auto" /> : value}
      </div>
      {caption && !loading ? (
        <p className="mt-1 type-caption text-subtle sm:row-start-3 sm:mt-0">{caption}</p>
      ) : null}
    </li>
  );
}

/**
 * The step between two figures, centred on the value row from `sm`: the
 * operator ("÷", "=") where the lane is arithmetic, an arrow where it is a
 * sequence (down on phones, where the lane stacks; across from `sm`). One
 * glyph a step, never an arrow beside an operator. The step is read out
 * through `spoken`; the glyphs are decoration.
 */
function FlowStep({ symbol, spoken }: { symbol?: string; spoken: string }) {
  return (
    <li className="flex shrink-0 items-center ps-1 text-subtle sm:row-start-2 sm:w-8 sm:justify-center sm:self-center sm:ps-0 lg:w-10">
      <span className="sr-only">{spoken}</span>
      {symbol ? (
        <span aria-hidden className="type-title font-medium text-muted-foreground">
          {symbol}
        </span>
      ) : (
        <>
          <ArrowDown aria-hidden className="size-4 sm:hidden" />
          <ArrowRight aria-hidden className="size-4 max-sm:hidden" />
        </>
      )}
    </li>
  );
}

/**
 * How a cycle reaches anchored NFTs, as live figures in two lanes. Cosmic
 * Signature NFTs share the Anchor Distribution pool (the pool divided by the
 * NFTs anchored gives each one's share); Random Walk NFTs enter a Stellar
 * Selection whose picks each receive CST and a new Cosmic Signature NFT. The
 * figures come from the dashboard, the protocol constants from
 * `content/protocol-facts.ts`. Nothing animates: only the art moves by itself.
 */
export function AnchoringFlow({
  poolEth,
  anchoredCosmicSignature,
  perNft,
  anchoredRandomWalk,
  activeHolders,
  loading = false,
  className,
}: AnchoringFlowProps) {
  const t = useTranslations('anchoring');
  const format = useFormat();
  const unknown = <UnknownValue label={t('flow.unavailable')} />;
  const count = (value: number | null) => (value === null ? unknown : format.count(value));

  return (
    <figure
      className={cn('rounded-surface border border-rule bg-surface/40', className)}
      aria-labelledby="anchoring-flow-caption"
    >
      <figcaption id="anchoring-flow-caption" className="sr-only">
        {t('flow.caption')}
      </figcaption>

      <div className="p-5 sm:p-6">
        <h3 className="flex items-start gap-2 type-title text-foreground">
          <span aria-hidden className={cn(TITLE_DOT_CLASS, 'bg-track-anchoring')} />
          {t('flow.cosmicSignature.title')}
        </h3>
        <ol className={LANE_CLASS}>
          <FlowNode
            label={t('flow.cosmicSignature.pool.label')}
            definition={t('flow.cosmicSignature.pool.definition')}
            value={
              poolEth === null ? unknown : <Amount value={poolEth} unit="ETH" context="card" />
            }
            caption={t('flow.cosmicSignature.pool.caption', {
              percentage: protocolFacts.anchorDistributionPercentage,
            })}
            loading={loading}
          />
          <FlowStep symbol="÷" spoken={t('flow.dividedBy')} />
          <FlowNode
            label={t('flow.cosmicSignature.anchored.label')}
            definition={t('flow.cosmicSignature.anchored.definition')}
            value={count(anchoredCosmicSignature)}
            loading={loading}
          />
          <FlowStep symbol="=" spoken={t('flow.equals')} />
          <FlowNode
            label={t('flow.cosmicSignature.perNft.label')}
            definition={t('flow.cosmicSignature.perNft.definition')}
            value={
              perNft.status === 'available' ? (
                <Amount value={perNft.perNftEth} unit="ETH" context="card" />
              ) : (
                unknown
              )
            }
            caption={
              perNft.status === 'noneAnchored'
                ? t('flow.cosmicSignature.perNft.noneAnchored')
                : t('flow.cosmicSignature.perNft.caption')
            }
            loading={loading}
          />
        </ol>
      </div>

      <div className="border-t border-rule-faint p-5 sm:p-6">
        <h3 className="flex items-start gap-2 type-title text-foreground">
          <span aria-hidden className={cn(TITLE_DOT_CLASS, 'bg-track-stellar-nft')} />
          {t('flow.randomWalk.title')}
        </h3>
        <ol className={LANE_CLASS}>
          <FlowNode
            label={t('flow.randomWalk.anchored.label')}
            definition={t('flow.randomWalk.anchored.definition')}
            value={count(anchoredRandomWalk)}
            loading={loading}
          />
          <FlowStep spoken={t('flow.then')} />
          <FlowNode
            label={t('flow.randomWalk.selections.label')}
            value={format.count(protocolFacts.anchoredRwlkNftSelectionRecipients)}
            caption={t('flow.randomWalk.selections.caption')}
          />
          <FlowStep spoken={t('flow.then')} />
          <FlowNode
            label={t('flow.randomWalk.allocation.label')}
            value={<Amount value={protocolFacts.specialAllocationCst} unit="CST" context="card" />}
            caption={t('flow.randomWalk.allocation.caption')}
          />
        </ol>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule-faint px-5 py-4 sm:px-6">
        <p className="type-label text-subtle">
          <ExplainedTerm definition={t('flow.holders.definition')} announce="moreInformation">
            {t('flow.holders.label')}
          </ExplainedTerm>
        </p>
        <div className="type-figure-sm text-foreground">
          {loading ? <Skeleton className="h-4 w-10" /> : count(activeHolders)}
        </div>
      </div>
    </figure>
  );
}
