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

/** One figure of a lane: its label, the live value and an optional caption. */
function FlowNode({ label, definition, value, caption, loading = false }: FlowNodeProps) {
  return (
    <li className="min-w-0 flex-1 sm:basis-0">
      <p className="type-label text-subtle hyphens-auto sm:min-h-9">
        {definition ? (
          <ExplainedTerm definition={definition} announce="moreInformation">
            {label}
          </ExplainedTerm>
        ) : (
          label
        )}
      </p>
      <div className="mt-1.5 type-figure-md text-foreground">
        {loading ? <Skeleton className="h-6 w-24" /> : value}
      </div>
      {caption && !loading ? <p className="mt-1 type-caption text-subtle">{caption}</p> : null}
    </li>
  );
}

/**
 * The step between two figures: an arrow with an optional operator ("÷",
 * "="). It points down on phones, where the lane stacks, and right from
 * `sm`. The operator is read out through `spoken`; the glyphs are decoration.
 */
function FlowStep({ symbol, spoken }: { symbol?: string; spoken: string }) {
  return (
    <li
      className={cn(
        'flex shrink-0 items-center gap-2 ps-1 text-subtle',
        'sm:w-8 sm:flex-col sm:gap-0.5 sm:ps-0 lg:w-10',
        symbol ? 'sm:mt-7' : 'sm:mt-12',
      )}
    >
      <span className="sr-only">{spoken}</span>
      {symbol ? (
        <span
          aria-hidden
          className="type-label font-medium text-muted-foreground max-sm:order-last"
        >
          {symbol}
        </span>
      ) : null}
      <ArrowDown aria-hidden className="size-4 sm:hidden" />
      <ArrowRight aria-hidden className="size-4 max-sm:hidden" />
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
        <h3 className="flex items-center gap-2 type-title text-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-track-anchoring" />
          {t('flow.cosmicSignature.title')}
        </h3>
        <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3 lg:gap-4">
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
        <h3 className="flex items-center gap-2 type-title text-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-track-stellar-nft" />
          {t('flow.randomWalk.title')}
        </h3>
        <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3 lg:gap-4">
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
