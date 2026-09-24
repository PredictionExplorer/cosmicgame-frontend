'use client';

import { useId } from 'react';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RetrieveIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { TxStage } from '@/lib/txStage';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { DateTime } from '@/components/ui/date-time';
import { Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { useTxStageLabel } from '@/hooks/useTxStageLabel';
import { deadlineState, type RetrievalPlan } from '@/utils/allocationRetrieval';

export interface RetrievalSummaryProps {
  /** What one transaction would retrieve; `null` while the lists load. */
  plan: RetrievalPlan | null;
  /** Unretrieved Anchor Distribution ETH (retrieved from its own section), or `null` if unknown. */
  anchorAmount: number | null;
  /** The next retrieval deadline among the items, in Unix seconds. */
  deadline: number | null;
  /** The one-transaction retrieval is running. */
  busy: boolean;
  /** The lifecycle of the latest retrieve on the page. */
  stage: TxStage;
  onRetrieveEverything: () => void;
  className?: string;
}

/**
 * The top of My Allocations: what is ready to retrieve (ETH, attached NFTs,
 * attached tokens and Anchor Distributions) in one figure row, the next
 * deadline, and the page's one commit action, "Retrieve everything", which
 * retrieves the ETH and attached assets in a single transaction. Anchor
 * Distributions are paid by the anchoring contract, so they keep their own
 * section below.
 */
export function RetrievalSummary({
  plan,
  anchorAmount,
  deadline,
  busy,
  stage,
  onRetrieveEverything,
  className,
}: RetrievalSummaryProps) {
  const t = useTranslations('myPages');
  const format = useFormat();
  const stageLabel = useTxStageLabel();
  const headingId = useId();
  const nowSeconds = Math.floor(useNow(60_000) / 1000);
  const deadlineStatus = deadlineState(deadline, nowSeconds);
  const deadlineNeedsAction = deadlineStatus === 'soon' || deadlineStatus === 'expired';

  const pending = (width: string) => <Skeleton className={cn('h-7', width)} />;

  const figures: PageHeaderFigure[] = [
    {
      id: 'eth',
      label: t('allocations.summary.eth'),
      value: !plan ? (
        pending('w-28')
      ) : plan.ethAmount === null ? null : (
        <Amount value={plan.ethAmount} unit="ETH" context="hero" />
      ),
      caption:
        plan && plan.ethRounds.length > 0
          ? t('allocations.summary.cycles', { count: plan.ethRounds.length })
          : undefined,
    },
    {
      id: 'nfts',
      label: t('allocations.summary.nfts'),
      value: plan ? format.count(plan.nftIndexes.length) : pending('w-10'),
    },
    {
      id: 'tokens',
      label: t('allocations.summary.tokens'),
      value: plan ? format.count(plan.tokenClaims.length) : pending('w-10'),
    },
    {
      id: 'anchor',
      label: t('allocations.summary.anchor'),
      value:
        anchorAmount === null ? null : <Amount value={anchorAmount} unit="ETH" context="hero" />,
      caption:
        anchorAmount !== null && anchorAmount > 0 ? (
          <a href="#anchors" className="link-quiet">
            {t('allocations.summary.anchorCaption')}
          </a>
        ) : undefined,
    },
  ];

  const canRetrieve = plan !== null && !plan.isEmpty;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="retrieval-summary"
      className={cn('rounded-surface bg-surface p-5 sm:p-8', className)}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="type-heading-3 text-foreground">
          {t('allocations.summary.title')}
        </h2>
        <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
          {t('allocations.summary.description')}
        </p>
      </div>

      <PageHeaderFigures figures={figures} className="mt-6 sm:mt-8" />

      {canRetrieve ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-rule-faint pt-6 sm:flex-row sm:items-center sm:gap-6">
          <ChainGuard requireConnection>
            <Button
              variant="commit"
              size="lg"
              loading={busy}
              onClick={onRetrieveEverything}
              data-testid="retrieve-everything"
              className="max-sm:w-full"
            >
              <RetrieveIcon aria-hidden className="size-4" />
              {(busy && stageLabel(stage)) || t('allocations.summary.retrieveEverything')}
            </Button>
          </ChainGuard>
          <div className="min-w-0 flex-1 space-y-1">
            {deadline ? (
              <p
                className="flex items-start gap-2 type-body-sm text-muted-foreground"
                data-deadline-state={deadlineStatus}
              >
                <Clock
                  aria-hidden
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    deadlineNeedsAction ? 'text-attention' : 'text-subtle',
                  )}
                />
                <span>
                  {t.rich(
                    deadlineStatus === 'expired'
                      ? 'allocations.summary.expired'
                      : 'allocations.summary.retrieveBy',
                    { date: () => <DateTime timestamp={deadline} /> },
                  )}
                </span>
              </p>
            ) : null}
            <TxStatus stage={stage} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
