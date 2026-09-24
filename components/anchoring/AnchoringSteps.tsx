import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const STEPS = ['anchor', 'receive', 'release'] as const;

interface AnchoringStepsProps {
  /** Rendered on My Anchors itself: the first step names the page without linking to it. */
  onMyAnchors?: boolean;
  className?: string;
}

/**
 * Anchoring in three steps, for a newcomer: how to start, what an anchored
 * NFT receives, and how it ends (releasing is permanent). Numbered with
 * hairlines between steps; the figures come from `content/protocol-facts.ts`.
 */
export function AnchoringSteps({ onMyAnchors = false, className }: AnchoringStepsProps) {
  const t = useTranslations('anchoring');
  const values = {
    percentage: protocolFacts.anchorDistributionPercentage,
    selections: protocolFacts.anchoredRwlkNftSelectionRecipients,
  };

  return (
    <ol className={cn('divide-y divide-rule-faint border-y border-rule-faint', className)}>
      {STEPS.map((step, index) => (
        <li key={step} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-5">
          <span aria-hidden className="pt-0.5 type-label font-mono tabular-nums text-subtle">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0 space-y-1.5">
            <h3 className="type-title text-foreground">{t(`steps.${step}.title`)}</h3>
            <p className="type-body-sm leading-relaxed text-muted-foreground">
              {t.rich(`steps.${step}.body`, {
                ...values,
                link: (chunks) =>
                  onMyAnchors ? (
                    <span className="text-foreground">{chunks}</span>
                  ) : (
                    <Link href="/my-anchors" className="link">
                      {chunks}
                    </Link>
                  ),
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
