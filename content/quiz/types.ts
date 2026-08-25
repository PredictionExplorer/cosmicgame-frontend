export const QUIZ_PATH = '/quiz';

export const QUIZ_TIER_IDS = ['basic', 'medium', 'hard'] as const;

export type QuizTierId = (typeof QUIZ_TIER_IDS)[number];

export interface QuizOption {
  readonly id: string;
  readonly text: string;
}

/**
 * Where to read more after answering. Every question must point at the
 * white paper section (`/white-paper#section-id`) or learn article that
 * teaches the underlying rule; the summary screen builds its study list
 * from these links.
 */
export interface QuizReference {
  readonly label: string;
  readonly href: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly prompt: string;
  /** Exactly four options; ids are stable across locales. */
  readonly options: readonly QuizOption[];
  readonly correctOptionId: string;
  /**
   * Teaches twice: why the correct answer holds and why the most tempting
   * distractor fails, closing with the design rationale.
   */
  readonly explanation: string;
  readonly reference: QuizReference;
  /** Optional memorable extra shown alongside the explanation. */
  readonly funFact?: string;
}

export interface QuizTier {
  readonly id: QuizTierId;
  readonly title: string;
  /** One line on the hub card. */
  readonly tagline: string;
  /** Longer copy on the tier page hero. */
  readonly description: string;
  readonly questions: readonly QuizQuestion[];
}

export interface QuizHubContent {
  readonly eyebrow: string;
  readonly h1: string;
  readonly intro: string;
  readonly breadcrumbs: {
    readonly ariaLabel: string;
    readonly homeLabel: string;
    readonly quizLabel: string;
  };
  /** `{count}` placeholder, e.g. "{count} questions". */
  readonly questionCountTemplate: string;
  readonly startLabel: string;
}

export interface QuizMasteryRank {
  readonly name: string;
  readonly line: string;
}

export interface QuizRunnerUi {
  readonly intro: {
    readonly keyboardHint: string;
    readonly beginLabel: string;
  };
  /** `{current}` and `{total}` placeholders. */
  readonly progressTemplate: string;
  readonly correctFeedback: readonly string[];
  readonly incorrectFeedback: readonly string[];
  /** `{count}` placeholder; shown from three consecutive correct answers. */
  readonly streakTemplate: string;
  readonly explanationHeading: string;
  readonly funFactHeading: string;
  readonly referenceLabel: string;
  readonly nextLabel: string;
  readonly finishLabel: string;
  readonly summary: {
    readonly eyebrow: string;
    /** `{correct}` and `{total}` placeholders. */
    readonly scoreTemplate: string;
    readonly rankLabel: string;
    readonly ranks: {
      readonly observer: QuizMasteryRank;
      readonly participant: QuizMasteryRank;
      readonly enduranceChampion: QuizMasteryRank;
      readonly chronoWarrior: QuizMasteryRank;
    };
    readonly studyHeading: string;
    readonly studyIntro: string;
    readonly noMissesNote: string;
    readonly restartLabel: string;
    readonly hubLabel: string;
  };
}

export interface QuizContent {
  readonly hub: QuizHubContent;
  readonly ui: QuizRunnerUi;
  readonly tiers: readonly QuizTier[];
}
