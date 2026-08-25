import { basicQuestionsEn } from './basic.en';
import { hardQuestionsEn } from './hard.en';
import { mediumQuestionsEn } from './medium.en';
import type { QuizContent } from './types';

export const quizContentEn = {
  hub: {
    eyebrow: 'Knowledge quiz',
    h1: 'How well do you know Cosmic Signature?',
    intro:
      'One hundred questions across three tiers, drawn from the white paper: cycles, gestures, allocations, the art pipeline, and the edge cases that only careful readers catch. Every answer comes with an explanation and a pointer to the exact section that teaches the rule \u2014 answering is a way of reading.',
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
      'Correct \u2014 the orbit holds.',
      'Exactly right.',
      'Correct \u2014 you read the protocol like a seed reads physics.',
      'Right \u2014 a clean trajectory.',
    ],
    incorrectFeedback: [
      'Not quite \u2014 here is what the protocol actually does.',
      'A common misconception \u2014 the mechanics say otherwise.',
      'Close orbit, wrong body. Here is the rule.',
      'Not this time \u2014 the white paper settles it.',
    ],
    streakTemplate: '{count} correct in a row',
    explanationHeading: 'Why',
    funFactHeading: 'Did you know?',
    referenceLabel: 'Go deeper',
    nextLabel: 'Next question',
    finishLabel: 'See your reading',
    summary: {
      eyebrow: 'Reading complete',
      scoreTemplate: '{correct} of {total} correct',
      rankLabel: 'Your standing',
      ranks: {
        observer: {
          name: 'Observer',
          line: 'You have seen the surface. The white paper rewards a closer orbit.',
        },
        participant: {
          name: 'Participant',
          line: 'You know the moving parts. The edge cases are where the design gets interesting.',
        },
        enduranceChampion: {
          name: 'Endurance Champion',
          line: 'A long, steady grasp of the mechanics. Few gaps survived you.',
        },
        chronoWarrior: {
          name: 'Chrono-Warrior',
          line: 'Near-total command of the protocol. The reference sections below are for pleasure, not repair.',
        },
      },
      studyHeading: 'Chart your next orbit',
      studyIntro: 'The questions you missed, each with the section that settles it:',
      noMissesNote: 'Nothing to review \u2014 every answer was correct.',
      restartLabel: 'Restart with a fresh shuffle',
      hubLabel: 'All tiers',
    },
  },
  tiers: [
    {
      id: 'basic',
      title: 'Basic',
      tagline: 'The shape of the protocol: cycles, gestures, allocations, and the art.',
      description:
        'Twenty-five questions on the fundamentals \u2014 what a gesture is, how a cycle ends, where the ETH goes, and what makes the artwork deterministic. If you are new here, start here.',
      questions: basicQuestionsEn,
    },
    {
      id: 'medium',
      title: 'Medium',
      tagline: 'The live mechanics: Calibration Windows, persistence tracks, Council rules.',
      description:
        'Twenty-five questions on the machinery in motion \u2014 cost curves, the CST feedback loop, Endurance Champion versus Chrono-Warrior, Selection math, and Council parameters. For readers who have watched a cycle or two.',
      questions: mediumQuestionsEn,
    },
    {
      id: 'hard',
      title: 'Hard',
      tagline: 'Edge cases and forensics: hostile wallets, upgrade history, the art pipeline.',
      description:
        'Fifty questions for careful readers \u2014 post-expiry semantics, contracts that reject ETH, why V2 changed five things, what V3 reprices, how the randomness is built, and what a Yoshida integrator is doing in an art project.',
      questions: hardQuestionsEn,
    },
  ],
} as const satisfies QuizContent;
