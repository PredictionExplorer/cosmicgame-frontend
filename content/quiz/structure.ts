import type { QuizHubContent, QuizRunnerUi, QuizTierId } from './types';

/**
 * The locale-independent skeleton of the knowledge quiz.
 *
 * Tier order, question order, option ids, correct answers, reference hrefs
 * (white-paper anchors and learn slugs), and fun-fact presence are declared
 * once here; the per-locale text modules (`text.en.ts`, `text.zh.ts`, and the
 * per-tier `text.<tier>.<locale>.ts` files) provide only copy, keyed by these
 * ids. A translation that misses or invents a question — or drops or adds a
 * fun fact — fails to compile.
 */

/** Every question offers the same four option slots; ids are stable across locales. */
export const QUIZ_OPTION_IDS = ['a', 'b', 'c', 'd'] as const;

export type QuizOptionId = (typeof QUIZ_OPTION_IDS)[number];

interface QuizQuestionStructure {
  readonly id: string;
  readonly correctOptionId: QuizOptionId;
  /**
   * Structural, shared by both locales: points at the white-paper section
   * (`/white-paper#section-id`) or learn article that settles the question.
   */
  readonly referenceHref: string;
  /** Whether each locale must provide the optional memorable extra. */
  readonly hasFunFact: boolean;
}

interface QuizTierStructure {
  readonly id: QuizTierId;
  readonly questions: readonly QuizQuestionStructure[];
}

export const QUIZ_STRUCTURE = [
  {
    id: 'basic',
    questions: [
      {
        id: 'what-is-cosmic-signature',
        correctOptionId: 'a',
        referenceHref: '/learn/what-is-cosmic-signature',
        hasFunFact: true,
      },
      {
        id: 'what-is-a-gesture',
        correctOptionId: 'a',
        referenceHref: '/white-paper#gestures',
        hasFunFact: false,
      },
      {
        id: 'two-currencies',
        correctOptionId: 'a',
        referenceHref: '/white-paper#gestures',
        hasFunFact: false,
      },
      {
        id: 'countdown-extension',
        correctOptionId: 'a',
        referenceHref: '/white-paper#countdown',
        hasFunFact: false,
      },
      {
        id: 'final-gesture-role',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: false,
      },
      {
        id: 'sleepy-beneficiary',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: true,
      },
      {
        id: 'signature-allocation-share',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'compounding-reserve',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'art-engine',
        correctOptionId: 'a',
        referenceHref: '/white-paper#the-art',
        hasFunFact: true,
      },
      {
        id: 'same-seed',
        correctOptionId: 'a',
        referenceHref: '/white-paper#reproducibility-and-license',
        hasFunFact: false,
      },
      {
        id: 'cst-supply-origin',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst',
        hasFunFact: false,
      },
      {
        id: 'cst-on-spend',
        correctOptionId: 'a',
        referenceHref: '/white-paper#supply-dynamics',
        hasFunFact: false,
      },
      {
        id: 'public-goods-beneficiary',
        correctOptionId: 'a',
        referenceHref: '/white-paper#public-goods',
        hasFunFact: false,
      },
      {
        id: 'anchoring-basic',
        correctOptionId: 'a',
        referenceHref: '/white-paper#anchoring',
        hasFunFact: false,
      },
      {
        id: 'anchor-once-ever',
        correctOptionId: 'a',
        referenceHref: '/white-paper#anchoring',
        hasFunFact: false,
      },
      {
        id: 'random-walk-perk',
        correctOptionId: 'a',
        referenceHref: '/white-paper#random-walk-attachment',
        hasFunFact: false,
      },
      {
        id: 'first-gesture-currency',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst-gestures',
        hasFunFact: false,
      },
      {
        id: 'message-on-gesture',
        correctOptionId: 'a',
        referenceHref: '/white-paper#messages-and-attachments',
        hasFunFact: true,
      },
      {
        id: 'who-runs-cycles',
        correctOptionId: 'a',
        referenceHref: '/white-paper#introduction',
        hasFunFact: false,
      },
      {
        id: 'nft-count-typical',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'chrono-endurance-exist',
        correctOptionId: 'a',
        referenceHref: '/white-paper#endurance-and-chrono',
        hasFunFact: false,
      },
      {
        id: 'stellar-selection-what',
        correctOptionId: 'a',
        referenceHref: '/white-paper#stellar-selections',
        hasFunFact: false,
      },
      {
        id: 'ecosystem-optionality',
        correctOptionId: 'a',
        referenceHref: '/white-paper#protocol-overview',
        hasFunFact: false,
      },
      {
        id: 'what-it-is-not',
        correctOptionId: 'a',
        referenceHref: '/white-paper#what-it-is-not',
        hasFunFact: false,
      },
      {
        id: 'where-recorded',
        correctOptionId: 'a',
        referenceHref: '/learn/cosmic-signature-on-arbitrum',
        hasFunFact: false,
      },
    ],
  },
  {
    id: 'medium',
    questions: [
      {
        id: 'eth-opening-price-discovery',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-calibration-window',
        hasFunFact: false,
      },
      {
        id: 'eth-step-up',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-gestures',
        hasFunFact: true,
      },
      {
        id: 'overpay-refund',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-gestures',
        hasFunFact: false,
      },
      {
        id: 'cst-window-restart',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst-gestures',
        hasFunFact: false,
      },
      {
        id: 'cst-free-quiet',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst-gestures',
        hasFunFact: false,
      },
      {
        id: 'window-feedback-loop',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst-gestures',
        hasFunFact: false,
      },
      {
        id: 'participation-cst-timing',
        correctOptionId: 'a',
        referenceHref: '/white-paper#imprint-rules',
        hasFunFact: true,
      },
      {
        id: 'cst-max-cost-protection',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cst-gestures',
        hasFunFact: false,
      },
      {
        id: 'endurance-definition',
        correctOptionId: 'a',
        referenceHref: '/white-paper#endurance-and-chrono',
        hasFunFact: false,
      },
      {
        id: 'chrono-definition',
        correctOptionId: 'a',
        referenceHref: '/white-paper#endurance-and-chrono',
        hasFunFact: false,
      },
      {
        id: 'eth-selection-count',
        correctOptionId: 'a',
        referenceHref: '/white-paper#stellar-selections',
        hasFunFact: false,
      },
      {
        id: 'nft-selection-count',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'draws-with-replacement',
        correctOptionId: 'a',
        referenceHref: '/white-paper#stellar-selections',
        hasFunFact: false,
      },
      {
        id: 'anchored-rwlk-track',
        correctOptionId: 'a',
        referenceHref: '/white-paper#anchoring',
        hasFunFact: false,
      },
      {
        id: 'exclusivity-window',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: true,
      },
      {
        id: 'escrow-timeout',
        correctOptionId: 'a',
        referenceHref: '/white-paper#delivery-and-timeouts',
        hasFunFact: false,
      },
      {
        id: 'push-vs-pull',
        correctOptionId: 'a',
        referenceHref: '/white-paper#delivery-and-timeouts',
        hasFunFact: false,
      },
      {
        id: 'council-proposal-threshold',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cosmic-council',
        hasFunFact: false,
      },
      {
        id: 'council-timeline',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cosmic-council',
        hasFunFact: false,
      },
      {
        id: 'quorum-rule',
        correctOptionId: 'a',
        referenceHref: '/white-paper#cosmic-council',
        hasFunFact: false,
      },
      {
        id: 'weight-activation',
        correctOptionId: 'a',
        referenceHref: '/white-paper#coordination-weight',
        hasFunFact: false,
      },
      {
        id: 'time-increment-growth',
        correctOptionId: 'a',
        referenceHref: '/white-paper#countdown',
        hasFunFact: false,
      },
      {
        id: 'typical-cst-fixed',
        correctOptionId: 'a',
        referenceHref: '/white-paper#imprint-rules',
        hasFunFact: false,
      },
      {
        id: 'attached-assets-destination',
        correctOptionId: 'a',
        referenceHref: '/white-paper#messages-and-attachments',
        hasFunFact: false,
      },
      {
        id: 'next-cycle-delay',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: false,
      },
    ],
  },
  {
    id: 'hard',
    questions: [
      {
        id: 'late-gesture-semantics',
        correctOptionId: 'a',
        referenceHref: '/white-paper#countdown',
        hasFunFact: false,
      },
      {
        id: 'refusing-beneficiary',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: false,
      },
      {
        id: 'refusing-chrono',
        correctOptionId: 'a',
        referenceHref: '/white-paper#defensive-design',
        hasFunFact: false,
      },
      {
        id: 'public-goods-transfer-fails',
        correctOptionId: 'a',
        referenceHref: '/white-paper#defensive-design',
        hasFunFact: false,
      },
      {
        id: 'no-anchored-nfts',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'no-cst-gestures',
        correctOptionId: 'a',
        referenceHref: '/white-paper#distribution-at-finalization',
        hasFunFact: false,
      },
      {
        id: 'randomness-sources',
        correctOptionId: 'a',
        referenceHref: '/white-paper#randomness',
        hasFunFact: false,
      },
      {
        id: 'randomness-limits',
        correctOptionId: 'a',
        referenceHref: '/white-paper#randomness',
        hasFunFact: false,
      },
      {
        id: 'precompile-unavailable',
        correctOptionId: 'a',
        referenceHref: '/white-paper#randomness',
        hasFunFact: false,
      },
      {
        id: 'v2-flat-cst-problem',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v2',
        hasFunFact: false,
      },
      {
        id: 'v2-min-imprint-guard',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v2',
        hasFunFact: false,
      },
      {
        id: 'v2-exclusivity-change',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v2',
        hasFunFact: false,
      },
      {
        id: 'v2-timing-loophole',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v2',
        hasFunFact: false,
      },
      {
        id: 'v3-what-changes',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v3',
        hasFunFact: false,
      },
      {
        id: 'v3-shape',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v3',
        hasFunFact: false,
      },
      {
        id: 'v3-overtime',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v3',
        hasFunFact: false,
      },
      {
        id: 'owner-mid-cycle',
        correctOptionId: 'a',
        referenceHref: '/white-paper#decentralization',
        hasFunFact: false,
      },
      {
        id: 'owner-cannot-reach',
        correctOptionId: 'a',
        referenceHref: '/white-paper#decentralization',
        hasFunFact: false,
      },
      {
        id: 'owner-endgame',
        correctOptionId: 'a',
        referenceHref: '/white-paper#decentralization',
        hasFunFact: false,
      },
      {
        id: 'postpone-activation-limit',
        correctOptionId: 'a',
        referenceHref: '/white-paper#decentralization',
        hasFunFact: false,
      },
      {
        id: 'no-team-eth',
        correctOptionId: 'a',
        referenceHref: '/white-paper#imprint-rules',
        hasFunFact: false,
      },
      {
        id: 'art-integrator',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'art-candidates',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'art-color',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'art-spectral',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'art-output',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'art-server-death',
        correctOptionId: 'a',
        referenceHref: '/white-paper#reproducibility-and-license',
        hasFunFact: true,
      },
      {
        id: 'art-naming',
        correctOptionId: 'a',
        referenceHref: '/white-paper#reproducibility-and-license',
        hasFunFact: false,
      },
      {
        id: 'art-license',
        correctOptionId: 'a',
        referenceHref: '/white-paper#reproducibility-and-license',
        hasFunFact: false,
      },
      {
        id: 'seed-derivation',
        correctOptionId: 'a',
        referenceHref: '/white-paper#art-pipeline',
        hasFunFact: false,
      },
      {
        id: 'hacken-findings',
        correctOptionId: 'a',
        referenceHref: '/white-paper#independent-review',
        hasFunFact: false,
      },
      {
        id: 'hacken-invariants',
        correctOptionId: 'a',
        referenceHref: '/white-paper#independent-review',
        hasFunFact: false,
      },
      {
        id: 'verification-tooling',
        correctOptionId: 'a',
        referenceHref: '/white-paper#independent-review',
        hasFunFact: false,
      },
      {
        id: 'sourcify-status',
        correctOptionId: 'a',
        referenceHref: '/white-paper#open-verification',
        hasFunFact: false,
      },
      {
        id: 'reentrancy',
        correctOptionId: 'a',
        referenceHref: '/white-paper#defensive-design',
        hasFunFact: false,
      },
      {
        id: 'intercycle-locks-why',
        correctOptionId: 'a',
        referenceHref: '/white-paper#v1',
        hasFunFact: false,
      },
      {
        id: 'cst-checkpoints',
        correctOptionId: 'a',
        referenceHref: '/white-paper#coordination-weight',
        hasFunFact: false,
      },
      {
        id: 'dust-refund',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-gestures',
        hasFunFact: false,
      },
      {
        id: 'rwlk-not-transferred',
        correctOptionId: 'a',
        referenceHref: '/white-paper#random-walk-attachment',
        hasFunFact: false,
      },
      {
        id: 'open-finalization-carries',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: false,
      },
      {
        id: 'attached-priority-timeout',
        correctOptionId: 'a',
        referenceHref: '/white-paper#delivery-and-timeouts',
        hasFunFact: false,
      },
      {
        id: 'eth-window-duration-drift',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-calibration-window',
        hasFunFact: false,
      },
      {
        id: 'first-cycle-opening',
        correctOptionId: 'a',
        referenceHref: '/white-paper#eth-calibration-window',
        hasFunFact: false,
      },
      {
        id: 'selection-entry-scaling',
        correctOptionId: 'a',
        referenceHref: '/white-paper#stellar-selections',
        hasFunFact: false,
      },
      {
        id: 'recognition-vs-participation',
        correctOptionId: 'a',
        referenceHref: '/white-paper#imprint-rules',
        hasFunFact: false,
      },
      {
        id: 'finalization-actions',
        correctOptionId: 'a',
        referenceHref: '/white-paper#finalization',
        hasFunFact: false,
      },
      {
        id: 'chrono-vs-endurance-trap',
        correctOptionId: 'a',
        referenceHref: '/white-paper#endurance-and-chrono',
        hasFunFact: false,
      },
      {
        id: 'anchored-rwlk-weighting',
        correctOptionId: 'a',
        referenceHref: '/white-paper#stellar-selections',
        hasFunFact: false,
      },
      {
        id: 'voluntary-vault-contributions',
        correctOptionId: 'a',
        referenceHref: '/white-paper#public-goods',
        hasFunFact: false,
      },
      {
        id: 'risk-honesty',
        correctOptionId: 'a',
        referenceHref: '/white-paper#risk-factors',
        hasFunFact: false,
      },
    ],
  },
] as const satisfies readonly QuizTierStructure[];

type QuizStructure = typeof QUIZ_STRUCTURE;

export type QuizQuestionId = QuizStructure[number]['questions'][number]['id'];

/** Copy shared by every quiz question, provided per locale. */
export interface QuizQuestionTextBase {
  readonly prompt: string;
  readonly options: Readonly<Record<QuizOptionId, string>>;
  readonly explanation: string;
  readonly referenceLabel: string;
}

/**
 * Copy for one question. The fun fact is required exactly when the skeleton
 * declares one, so fun-fact parity across locales is a compile error rather
 * than a runtime check.
 */
export type QuizQuestionText<Question extends { readonly hasFunFact: boolean }> =
  QuizQuestionTextBase &
    (Question['hasFunFact'] extends true
      ? { readonly funFact: string }
      : { readonly funFact?: never });

type QuizTierStructureById<TierId extends QuizTierId> = Extract<
  QuizStructure[number],
  { readonly id: TierId }
>;

/**
 * One tier's question copy, keyed by the skeleton's question ids so the
 * compiler rejects missing or extra translations.
 */
export type QuizTierQuestionsText<TierId extends QuizTierId> = {
  readonly [Question in QuizTierStructureById<TierId>['questions'][number] as Question['id']]: QuizQuestionText<Question>;
};

/** Copy for one tier's hub card and tier-page hero. */
export interface QuizTierTextMeta {
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
}

/**
 * The complete quiz copy for one locale. Hub and runner-UI copy have no
 * structural component, so they reuse the public content types directly.
 */
export type QuizText = {
  readonly hub: QuizHubContent;
  readonly ui: QuizRunnerUi;
  readonly tiers: {
    readonly [Tier in QuizStructure[number] as Tier['id']]: QuizTierTextMeta & {
      readonly questions: QuizTierQuestionsText<Tier['id']>;
    };
  };
};
