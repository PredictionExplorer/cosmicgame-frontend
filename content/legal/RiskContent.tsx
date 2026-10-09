import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { LegalCallout, LegalList, LegalParagraph } from '@/components/legal/LegalProse';

/** The risk groups, in reading order; each id is its section's anchor. */
export const RISK_GROUP_IDS = [
  'mechanics',
  'timing',
  'permanent',
  'wallets',
  'availability',
  'value',
] as const;

export type RiskGroupId = (typeof RISK_GROUP_IDS)[number];

export interface RiskGroup {
  readonly id: RiskGroupId;
  readonly heading: string;
  /** One risk per item; rich text. */
  readonly risks: readonly string[];
  /** Where the Terms of Service state the rule; rich text linking the clause. */
  readonly source: string;
}

export interface RiskCopy {
  readonly title: string;
  readonly intro: string;
  /** The one sentence to read before taking part, above the groups. */
  readonly keyPoint: { readonly title: string; readonly text: string };
  readonly groups: readonly RiskGroup[];
  readonly participation: { readonly heading: string; readonly paragraphs: readonly string[] };
}

/**
 * /risk-disclosures: the one thing to know before taking part, then the risks
 * grouped by where they come from — the Cycle's mechanics, its timing, the
 * actions that cannot be undone, wallets, the network and the app, and value —
 * each group ending with the Terms clause that states the rule. The groups
 * are short, so they sit two to a row from `xl` on a compact rhythm, and
 * what participants do closes the page as a note rather than a seventh
 * section.
 */
export function RiskContent({
  copy,
  locale,
  labels,
}: {
  copy: RiskCopy;
  locale: string;
  labels: LegalDocumentLabels;
}) {
  return (
    <LegalDocument
      page="risk"
      labels={labels}
      title={copy.title}
      intro={copy.intro}
      summary={
        <LegalCallout
          tone="attention"
          title={copy.keyPoint.title}
          text={copy.keyPoint.text}
          locale={locale}
        />
      }
      density="compact"
      sections={copy.groups.map((group) => ({
        id: group.id,
        heading: group.heading,
        content: (
          <>
            <LegalList items={group.risks} locale={locale} />
            <LegalParagraph text={group.source} locale={locale} size="note" />
          </>
        ),
      }))}
      closing={
        <div role="note" className="space-y-2 border-t border-rule pt-8">
          <p className="type-title text-foreground">{copy.participation.heading}</p>
          {copy.participation.paragraphs.map((paragraph) => (
            <LegalParagraph key={paragraph} text={paragraph} locale={locale} />
          ))}
        </div>
      }
    />
  );
}
