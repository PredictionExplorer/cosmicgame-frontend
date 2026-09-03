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
      '正解——軌道は保たれています。',
      'まさにそのとおりです。',
      '正解——シードが物理を読むように、プロトコルを読んでいます。',
      '正解——澄んだ軌跡です。',
    ],
    incorrectFeedback: [
      '惜しい——プロトコルが実際にすることはこうです。',
      'よくある誤解です——仕組みはそうなっていません。',
      '軌道は近いものの、天体が違います。ルールはこうです。',
      '今回は不正解——ホワイトペーパーがはっきりさせています。',
    ],
    streakTemplate: '{count}問連続正解',
    explanationHeading: 'なぜ',
    funFactHeading: 'ご存じでしたか？',
    referenceLabel: 'さらに深く',
    nextLabel: '次の問題',
    finishLabel: '読みの結果を見る',
    summary: {
      eyebrow: '読了',
      scoreTemplate: '{total}問中{correct}問正解',
      rankLabel: '到達点',
      ranks: {
        observer: {
          name: '観測者',
          line: '表面は見えています。ホワイトペーパーは、より近い軌道に応えてくれます。',
        },
        participant: {
          name: '参加者',
          line: '動く部品を知っています。設計が面白くなるのは細部です。',
        },
        enduranceChampion: {
          name: '持久チャンピオン',
          line: '仕組みを長く着実に掴んでいます。取りこぼしはほとんどありませんでした。',
        },
        chronoWarrior: {
          name: '時の戦士',
          line: 'プロトコルをほぼ完全に把握しています。下の参照セクションは補修のためではなく、楽しみのためのものです。',
        },
      },
      studyHeading: '次の軌道を描く',
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
      tagline: '細部と解剖：敵対的なウォレット、アップグレードの歴史、アートパイプライン。',
      description:
        '注意深い読者のための50問——期限切れ後の意味論、ETHを拒むコントラクト、V2が五つのことを変えた理由、V3が何の価格を変えたか、乱数はどう作られるか、そしてヨシダ積分器がアートプロジェクトで何をしているのか。',
      questions: hardQuestionsTextJa,
    },
  },
} as const satisfies QuizText;
