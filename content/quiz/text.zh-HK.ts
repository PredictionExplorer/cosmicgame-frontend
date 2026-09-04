import type { QuizText } from './structure';
import { basicQuestionsTextZhHk } from './text.basic.zh-HK';
import { hardQuestionsTextZhHk } from './text.hard.zh-HK';
import { mediumQuestionsTextZhHk } from './text.medium.zh-HK';

/** 中文測驗文案，以 structure.ts 中的骨架為鍵。 */
export const quizTextZhHk = {
  hub: {
    eyebrow: '知識測驗',
    h1: '你對 Cosmic Signature 了解多少？',
    intro:
      '一百道題，三個層級，全部出自白皮書：週期、落筆、分配、渲染管線，以及只有細心讀者才會注意到的邊界情形。每道題都附有講解，並指向講清這條規則的原文章節——答題本身，就是一種閱讀。',
    breadcrumbs: {
      ariaLabel: '麵包屑導航',
      homeLabel: '主頁',
      quizLabel: '知識測驗',
    },
    questionCountTemplate: '{count} 道題',
    startLabel: '開始',
  },
  ui: {
    intro: {
      keyboardHint: '提示：按 1–4 作答，按 Enter 繼續。',
      beginLabel: '開始作答',
    },
    progressTemplate: '第 {current} 題，共 {total} 題',
    correctFeedback: [
      '答對了。',
      '正確，來看這條規則的依據。',
      '回答正確。',
      '沒錯，下面是完整解釋。',
    ],
    incorrectFeedback: [
      '這題答錯了，看看下面的解釋。',
      '還不準確，可以對照規則再想一想。',
      '答案不同，關鍵在下面這條規則。',
      '這次未答對，下面附有白皮書說明。',
    ],
    streakTemplate: '連對 {count} 題',
    explanationHeading: '為什麼',
    funFactHeading: '你知道嗎？',
    referenceLabel: '深入閱讀',
    nextLabel: '下一題',
    finishLabel: '查看結果',
    summary: {
      eyebrow: '作答完成',
      scoreTemplate: '答對 {correct} 題，共 {total} 題',
      rankLabel: '理解程度',
      ranks: {
        observer: {
          name: '觀察者',
          line: '可以從白皮書的協議概覽開始，再逐步了解各項機制。',
        },
        participant: {
          name: '參與者',
          line: '已掌握不少基礎概念，接下來可以多留意邊界情形。',
        },
        enduranceChampion: {
          name: '堅守冠軍',
          line: '對協議機制已有紮實理解，可透過參考章節補齊細節。',
        },
        chronoWarrior: {
          name: '時之勇士',
          line: '對協議已有全面理解，也可以再讀參考章節，核對細節。',
        },
      },
      studyHeading: '接下來讀什麼',
      studyIntro: '以下是答錯題目對應的白皮書章節：',
      noMissesNote: '全部答對了。',
      restartLabel: '重新排列題目再答一次',
      hubLabel: '全部層級',
    },
  },
  tiers: {
    basic: {
      title: '基礎',
      tagline: '協議的輪廓：週期、落筆、分配與藝術。',
      description:
        '二十五道基礎題——什麼是落筆、週期如何落幕、ETH 流向哪裏、作品為何是確定性的。初來乍到，從這裏開始。',
      questions: basicQuestionsTextZhHk,
    },
    medium: {
      title: '進階',
      tagline: '運轉中的機制：校準窗口、堅守軌道、議會規則。',
      description:
        '二十五道進階題——價格曲線、CST 反饋迴路、堅守冠軍與時之勇士之辨、星選算術與議會參數。適合看過一兩個週期的讀者。',
      questions: mediumQuestionsTextZhHk,
    },
    hard: {
      title: '高階',
      tagline: '邊界情形與推演：惡意錢包、升級歷史、渲染管線。',
      description:
        '五十道高階題，獻給細心的讀者——到期後的語義、拒收 ETH 的合約、V2 為何改了五處、V3 重新定價了什麼、隨機性如何構造，以及一台 Yoshida 積分器在藝術項目裏做什麼。',
      questions: hardQuestionsTextZhHk,
    },
  },
} as const satisfies QuizText;
