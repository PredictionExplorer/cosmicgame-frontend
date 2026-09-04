import type { QuizText } from './structure';
import { basicQuestionsTextJa } from './text.basic.ja';
import { hardQuestionsTextJa } from './text.hard.ja';
import { mediumQuestionsTextJa } from './text.medium.ja';

/** Japanese quiz copy, keyed by the skeleton in structure.ts. */
export const quizTextJa = {
  hub: {
    eyebrow: '知識クイズ',
    h1: 'Cosmic Signatureをどれだけ知っていますか？',
    intro:
      'ホワイトペーパーから出題する三段階・全100問：サイクル、一筆、配分、アートパイプライン、そして注意深い読者だけが気づく細部。すべての答えには解説と、そのルールを教える正確なセクションへの案内が付いています。答えることは、読むことの一つの形です。',
    breadcrumbs: {
      ariaLabel: 'パンくずリスト',
      homeLabel: 'ホーム',
      quizLabel: 'クイズ',
    },
    questionCountTemplate: '{count}問',
    startLabel: '開始',
  },
  ui: {
    intro: {
      keyboardHint: 'ヒント：1〜4のキーで答え、Enterで進めます。',
      beginLabel: '始める',
    },
    progressTemplate: '{total}問中{current}問目',
    correctFeedback: [
      '正解です。',
      'まさにそのとおりです。',
      'そのとおりです。解説で仕組みを確認できます。',
      '正解です。次の問題へ進みましょう。',
    ],
    incorrectFeedback: [
      '正解は別の選択肢です。仕組みを確認してみましょう。',
      'この問題のポイントを解説で確認できます。',
      '正解とその理由を見てみましょう。',
      '正解の根拠は、解説とホワイトペーパーで確認できます。',
    ],
    streakTemplate: '{count}問連続正解',
    explanationHeading: 'なぜ',
    funFactHeading: 'ご存じでしたか？',
    referenceLabel: 'さらに深く',
    nextLabel: '次の問題',
    finishLabel: '結果を見る',
    summary: {
      eyebrow: '読了',
      scoreTemplate: '{total}問中{correct}問正解',
      rankLabel: '到達点',
      ranks: {
        observer: {
          name: '観測者',
          line: 'ここから理解を深めていきましょう。下の解説と参照先が復習に役立ちます。',
        },
        participant: {
          name: '参加者',
          line: '基本的な仕組みを理解できています。次は、細かな条件や例外にも目を向けてみましょう。',
        },
        enduranceChampion: {
          name: '持久チャンピオン',
          line: '仕組みをよく理解できています。間違えた問題を振り返ると、さらに理解が深まります。',
        },
        chronoWarrior: {
          name: '時の戦士',
          line: 'プロトコルを詳しく理解できています。参考セクションでは、設計の背景も読めます。',
        },
      },
      studyHeading: '復習する',
      studyIntro: '間違えた問題と、それぞれをはっきりさせるセクション：',
      noMissesNote: '復習するものはありません——すべて正解でした。',
      restartLabel: '新しい並びでやり直す',
      hubLabel: 'すべての段階',
    },
  },
  tiers: {
    basic: {
      title: '基礎',
      tagline: 'プロトコルの輪郭：サイクル、一筆、配分、そしてアート。',
      description:
        '基礎概念25問——一筆とは何か、サイクルはどう終わるか、ETHはどこへ行くか、アートワークはなぜ決定論的なのか。初めての方はここから始めてください。',
      questions: basicQuestionsTextJa,
    },
    medium: {
      title: '中級',
      tagline: '動いている仕組み：調律期間、持続トラック、評議会のルール。',
      description:
        '動いている機構についての25問——費用の曲線、CSTのフィードバックループ、持久チャンピオンと時の戦士の違い、星選の計算、評議会のパラメーター。サイクルを一つ二つ見守ってきた読者のために。',
      questions: mediumQuestionsTextJa,
    },
    hard: {
      title: '上級',
      tagline: '設計を掘り下げる：敵対的なウォレット、アップグレードの歴史、アートパイプライン。',
      description:
        '注意深い読者のための50問——期限が過ぎた後の動作、ETHを拒むコントラクト、V2が五つのことを変えた理由、V3が何の価格を変えたか、乱数はどう作られるか、そしてヨシダ積分器がアートプロジェクトで何をしているのか。',
      questions: hardQuestionsTextJa,
    },
  },
} as const satisfies QuizText;
