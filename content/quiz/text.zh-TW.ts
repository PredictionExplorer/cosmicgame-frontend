import type { QuizText } from './structure';
import { basicQuestionsTextZhTw } from './text.basic.zh-TW';
import { hardQuestionsTextZhTw } from './text.hard.zh-TW';
import { mediumQuestionsTextZhTw } from './text.medium.zh-TW';

/** 中文測驗文案，以 structure.ts 中的骨架為鍵。 */
export const quizTextZhTw = {
  hub: {
    eyebrow: '知識測驗',
    h1: '你對 Cosmic Signature 了解多少？',
    intro:
      '一百道題，三個層級，全部出自白皮書：週期、落筆、分配、渲染管線，以及只有細心讀者才會注意到的邊界情形。每道題都附有講解，並指向講清這條規則的原文章節——答題本身，就是一種閱讀。',
    breadcrumbs: {
      ariaLabel: '麵包屑導覽',
      homeLabel: '首頁',
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
      '答對了——軌道穩穩當當。',
      '完全正確。',
      '答對了——你讀協議，就像種子讀物理。',
      '正確——一條幹淨的軌跡。',
    ],
    incorrectFeedback: [
      '不太對——協議實際是這樣做的。',
      '一個常見的誤解——機制並非如此。',
      '軌道很近，天體不對。規則在這裡。',
      '這次沒對——白皮書一錘定音。',
    ],
    streakTemplate: '連對 {count} 題',
    explanationHeading: '為什麼',
    funFactHeading: '你知道嗎？',
    referenceLabel: '深入閱讀',
    nextLabel: '下一題',
    finishLabel: '檢視結果',
    summary: {
      eyebrow: '作答完成',
      scoreTemplate: '答對 {correct} 題，共 {total} 題',
      rankLabel: '你的段位',
      ranks: {
        observer: {
          name: '觀察者',
          line: '你看到了表面。白皮書值得一次更近的環繞。',
        },
        participant: {
          name: '參與者',
          line: '你認得每個部件。邊界情形才是設計最有意思的地方。',
        },
        enduranceChampion: {
          name: '堅守冠軍',
          line: '對機制的把握綿長而穩定，少有間隔能撐過你。',
        },
        chronoWarrior: {
          name: '時之勇士',
          line: '對協議近乎全盤掌握。下面的參考章節是消遣，不是補課。',
        },
      },
      studyHeading: '規劃你的下一條軌道',
      studyIntro: '你答錯的題目，各自附上一錘定音的章節：',
      noMissesNote: '無需複習——每一題都答對了。',
      restartLabel: '重新洗題再來一次',
      hubLabel: '全部層級',
    },
  },
  tiers: {
    basic: {
      title: '基礎',
      tagline: '協議的輪廓：週期、落筆、分配與藝術。',
      description:
        '二十五道基礎題——什麼是落筆、週期如何落幕、ETH 流向哪裡、作品為何是確定性的。初來乍到，從這裡開始。',
      questions: basicQuestionsTextZhTw,
    },
    medium: {
      title: '進階',
      tagline: '運轉中的機制：校準窗口、堅守軌道、議會規則。',
      description:
        '二十五道進階題——價格曲線、CST 回饋迴路、堅守冠軍與時之勇士之辨、星選算術與議會參數。適合看過一兩個週期的讀者。',
      questions: mediumQuestionsTextZhTw,
    },
    hard: {
      title: '高階',
      tagline: '邊界情形與推演：惡意錢包、升級歷史、渲染管線。',
      description:
        '五十道高階題，獻給細心的讀者——到期後的語義、拒收 ETH 的合約、V2 為何改了五處、V3 重新定價了什麼、隨機性如何構造，以及一台 Yoshida 積分器在藝術專案裡做什麼。',
      questions: hardQuestionsTextZhTw,
    },
  },
} as const satisfies QuizText;
