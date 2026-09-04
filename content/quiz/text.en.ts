import type { QuizText } from './structure';
import { basicQuestionsTextEn } from './text.basic.en';
import { hardQuestionsTextEn } from './text.hard.en';
import { mediumQuestionsTextEn } from './text.medium.en';

/** English quiz copy, keyed by the skeleton in structure.ts. */
export const quizTextEn = {
  hub: {
    eyebrow: 'Knowledge quiz',
    h1: 'How well do you know Cosmic Signature?',
    intro:
      'Explore the protocol through one hundred questions at three difficulty levels. Topics include cycles, gestures, allocations, the art pipeline, and less familiar cases. Each answer includes an explanation and a reference to the white paper.',
    breadcrumbs: {
      ariaLabel: 'Breadcrumb',
      homeLabel: 'Home',
      quizLabel: 'Quiz',
    },
    questionCountTemplate: '{count} questions',
    startLabel: 'Start',
  },
  ui: {
    intro: {
      keyboardHint: 'Tip: press 1\u20134 to answer, Enter to continue.',
      beginLabel: 'Begin',
    },
    progressTemplate: 'Question {current} of {total}',
    correctFeedback: [
      'Correct.',
      'Exactly right.',
      'That is how the protocol works.',
      'You have it.',
    ],
    incorrectFeedback: [
      'Not quite. The explanation below walks through the rule.',
      'This one is easy to mix up. Here is how it works.',
      'Take a look at the explanation below.',
      'Not this time. The reference below explains the answer.',
    ],
    streakTemplate: '{count} correct in a row',
    explanationHeading: 'Why',
    funFactHeading: 'Did you know?',
    referenceLabel: 'Go deeper',
    nextLabel: 'Next question',
    finishLabel: 'See your results',
    summary: {
      eyebrow: 'Quiz complete',
      scoreTemplate: '{correct} of {total} correct',
      rankLabel: 'Your standing',
      ranks: {
        observer: {
          name: 'Observer',
          line: 'You have made a start. The explanations below will help you build on it.',
        },
        participant: {
          name: 'Participant',
          line: 'You know the moving parts. The edge cases are where the design gets interesting.',
        },
        enduranceChampion: {
          name: 'Endurance Champion',
          line: 'You understand the mechanics well. Review the remaining questions to fill in the details.',
        },
        chronoWarrior: {
          name: 'Chrono-Warrior',
          line: 'You know the protocol in depth. The references below offer more to explore.',
        },
      },
      studyHeading: 'What to explore next',
      studyIntro: 'Review these questions and their references in the white paper:',
      noMissesNote: 'Nothing to review \u2014 every answer was correct.',
      restartLabel: 'Restart with a fresh shuffle',
      hubLabel: 'All tiers',
    },
  },
  tiers: {
    basic: {
      title: 'Basic',
      tagline: 'The shape of the protocol: cycles, gestures, allocations, and the art.',
      description:
        'Twenty-five questions on the fundamentals \u2014 what a gesture is, how a cycle ends, where the ETH goes, and what makes the artwork deterministic. If you are new here, start here.',
      questions: basicQuestionsTextEn,
    },
    medium: {
      title: 'Medium',
      tagline: 'The live mechanics: Calibration Windows, persistence tracks, Council rules.',
      description:
        'Twenty-five questions on the machinery in motion \u2014 cost curves, the CST feedback loop, Endurance Champion versus Chrono-Warrior, Selection math, and Council parameters. For readers who have watched a cycle or two.',
      questions: mediumQuestionsTextEn,
    },
    hard: {
      title: 'Hard',
      tagline: 'Edge cases and forensics: hostile wallets, upgrade history, the art pipeline.',
      description:
        'Fifty questions for careful readers \u2014 post-expiry semantics, contracts that reject ETH, why V2 changed five things, what V3 reprices, how the randomness is built, and what a Yoshida integrator is doing in an art project.',
      questions: hardQuestionsTextEn,
    },
  },
} as const satisfies QuizText;
