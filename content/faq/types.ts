export type FAQCategoryIcon = 'rocket' | 'trophy' | 'cycle' | 'gem' | 'layers' | 'shield';

export interface FAQItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  /** Legacy hash anchors preserved for backward compatibility. */
  readonly hashAnchor?: string;
}

export interface FAQCategory {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: FAQCategoryIcon;
  readonly items: readonly FAQItem[];
}

export interface FAQContent {
  readonly categories: readonly FAQCategory[];
  readonly popularQuestionIds: readonly string[];
}
