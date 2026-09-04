import type { QuizText } from './structure';
import { basicQuestionsTextZh } from './text.basic.zh';
import { hardQuestionsTextZh } from './text.hard.zh';
import { mediumQuestionsTextZh } from './text.medium.zh';

/** 中文测验文案，以 structure.ts 中的骨架为键。 */
export const quizTextZh = {
  hub: {
    eyebrow: '知识测验',
    h1: '你对 Cosmic Signature 了解多少？',
    intro:
      '一百道题，三个层级，全部出自白皮书：周期、落笔、分配、渲染管线，以及只有细心读者才会注意到的边界情形。每道题都附有讲解，并指向讲清这条规则的原文章节——答题本身，就是一种阅读。',
    breadcrumbs: {
      ariaLabel: '面包屑导航',
      homeLabel: '首页',
      quizLabel: '知识测验',
    },
    questionCountTemplate: '{count} 道题',
    startLabel: '开始',
  },
  ui: {
    intro: {
      keyboardHint: '提示：按 1–4 作答，按 Enter 继续。',
      beginLabel: '开始作答',
    },
    progressTemplate: '第 {current} 题，共 {total} 题',
    correctFeedback: [
      '答对了。',
      '正确，来看这条规则的依据。',
      '回答正确。',
      '没错，下面是完整解释。',
    ],
    incorrectFeedback: [
      '这题答错了，看看下面的解释。',
      '还不准确，可以对照规则再想一想。',
      '答案不同，关键在下面这条规则。',
      '这次未答对，下面附有白皮书说明。',
    ],
    streakTemplate: '连对 {count} 题',
    explanationHeading: '为什么',
    funFactHeading: '你知道吗？',
    referenceLabel: '深入阅读',
    nextLabel: '下一题',
    finishLabel: '查看结果',
    summary: {
      eyebrow: '作答完成',
      scoreTemplate: '答对 {correct} 题，共 {total} 题',
      rankLabel: '理解程度',
      ranks: {
        observer: {
          name: '观察者',
          line: '可以从白皮书的协议概览开始，再逐步了解各项机制。',
        },
        participant: {
          name: '参与者',
          line: '已掌握不少基础概念，接下来可以多留意边界情形。',
        },
        enduranceChampion: {
          name: '坚守冠军',
          line: '对协议机制已有扎实理解，可通过参考章节补齐细节。',
        },
        chronoWarrior: {
          name: '时之勇士',
          line: '对协议已有全面理解，也可以再读参考章节，核对细节。',
        },
      },
      studyHeading: '接下来读什么',
      studyIntro: '以下是答错题目对应的白皮书章节：',
      noMissesNote: '全部答对了。',
      restartLabel: '重新排列题目再答一次',
      hubLabel: '全部层级',
    },
  },
  tiers: {
    basic: {
      title: '基础',
      tagline: '协议的轮廓：周期、落笔、分配与艺术。',
      description:
        '二十五道基础题——什么是落笔、周期如何落幕、ETH 流向哪里、作品为何是确定性的。初来乍到，从这里开始。',
      questions: basicQuestionsTextZh,
    },
    medium: {
      title: '进阶',
      tagline: '运转中的机制：校准窗口、坚守轨道、议会规则。',
      description:
        '二十五道进阶题——价格曲线、CST 反馈回路、坚守冠军与时之勇士之辨、星选算术与议会参数。适合看过一两个周期的读者。',
      questions: mediumQuestionsTextZh,
    },
    hard: {
      title: '高阶',
      tagline: '边界情形与推演：恶意钱包、升级历史、渲染管线。',
      description:
        '五十道高阶题，献给细心的读者——到期后的语义、拒收 ETH 的合约、V2 为何改了五处、V3 重新定价了什么、随机性如何构造，以及一台 Yoshida 积分器在艺术项目里做什么。',
      questions: hardQuestionsTextZh,
    },
  },
} as const satisfies QuizText;
