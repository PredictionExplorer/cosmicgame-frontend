import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Link } from '@/i18n/navigation';
import { Steps } from '@/components/ui/steps';

const STEPS = ['anchor', 'receive', 'release'] as const;

interface AnchoringStepsProps {
  /** Rendered on My Anchors itself: the first step names the page without linking to it. */
  onMyAnchors?: boolean;
  className?: string;
}

/**
 * Anchoring in three steps, for a newcomer: how to start, what an anchored
 * NFT receives, and how it ends (releasing is permanent), as the shared
 * `Steps` list; the figures come from `content/protocol-facts.ts`.
 */
export function AnchoringSteps({ onMyAnchors = false, className }: AnchoringStepsProps) {
  const t = useTranslations('anchoring');
  const values = {
    percentage: protocolFacts.anchorDistributionPercentage,
    selections: protocolFacts.anchoredRwlkNftSelectionRecipients,
  };

  return (
    <Steps
      framed
      className={className}
      items={STEPS.map((step) => ({
        id: step,
        title: t(`steps.${step}.title`),
        body: (
          <p>
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
        ),
      }))}
    />
  );
}
