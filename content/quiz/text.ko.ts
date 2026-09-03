import type { QuizText } from './structure';
import { basicQuestionsTextKo } from './text.basic.ko';
import { hardQuestionsTextKo } from './text.hard.ko';
import { mediumQuestionsTextKo } from './text.medium.ko';

/** 지식 퀴즈의 한국어 텍스트. 키는 structure.ts의 골격을 따릅니다. */
export const quizTextKo = {
  hub: {
    eyebrow: '지식 퀴즈',
    h1: 'Cosmic Signature를 얼마나 알고 있나요?',
    intro:
      '백서를 바탕으로 엮은 세 단계 100문항입니다. 사이클, 제스처, 배분, 아트 파이프라인부터 꼼꼼한 독자만 알아채는 경계 사례까지 다룹니다. 답마다 해설과 함께 그 규칙이 실린 백서 섹션 안내가 붙습니다. 답하는 일이 곧 읽는 일입니다.',
    breadcrumbs: {
      ariaLabel: '탐색 경로',
      homeLabel: '홈',
      quizLabel: '퀴즈',
    },
    questionCountTemplate: '{count}문항',
    startLabel: '시작',
  },
  ui: {
    intro: {
      keyboardHint: '팁: 1~4 키로 답하고 Enter 키로 다음 문항으로 넘어갑니다.',
      beginLabel: '시작하기',
    },
    progressTemplate: '{total}문항 중 {current}번째',
    correctFeedback: [
      '정답입니다. 궤도가 유지됩니다.',
      '정확합니다.',
      '정답입니다. 시드가 물리를 결정하듯 정확하게 프로토콜을 읽어 냈습니다.',
      '맞습니다. 깔끔한 궤적입니다.',
    ],
    incorrectFeedback: [
      '조금 다릅니다. 프로토콜이 실제로 하는 일은 이렇습니다.',
      '흔한 오해입니다. 실제 메커니즘은 다릅니다.',
      '궤도는 가까웠지만 천체가 다릅니다. 규칙은 이렇습니다.',
      '이번에는 아닙니다. 답은 백서에 있습니다.',
    ],
    streakTemplate: '{count}문항 연속 정답',
    explanationHeading: '이유',
    funFactHeading: '알고 있었나요?',
    referenceLabel: '더 깊이 읽기',
    nextLabel: '다음 문항',
    finishLabel: '결과 보기',
    summary: {
      eyebrow: '풀이 완료',
      scoreTemplate: '{total}문항 중 {correct}문항 정답',
      rankLabel: '내 등급',
      ranks: {
        observer: {
          name: '관측자',
          line: '표면까지는 보았습니다. 궤도를 더 가까이 돌수록 백서가 보여 주는 것도 많아집니다.',
        },
        participant: {
          name: '참여자',
          line: '핵심 메커니즘은 파악했습니다. 이 설계가 정말 흥미로워지는 대목은 경계 사례입니다.',
        },
        enduranceChampion: {
          name: '수호 챔피언',
          line: '메커니즘을 오랫동안 흔들림 없이 붙들었습니다. 빈틈이 거의 없습니다.',
        },
        chronoWarrior: {
          name: '시간의 전사',
          line: '프로토콜을 거의 완전히 꿰뚫고 있습니다. 아래 참고 섹션은 보완용이 아니라 감상용입니다.',
        },
      },
      studyHeading: '다음 궤도 그리기',
      studyIntro: '틀린 문항과 그 답의 근거가 되는 백서 섹션입니다:',
      noMissesNote: '다시 볼 문항이 없습니다. 모든 답이 정답이었습니다.',
      restartLabel: '새로 섞어 다시 풀기',
      hubLabel: '모든 단계',
    },
  },
  tiers: {
    basic: {
      title: '기본',
      tagline: '프로토콜의 큰 틀: 사이클, 제스처, 배분, 그리고 아트.',
      description:
        '기본 개념 25문항: 제스처란 무엇인지, 사이클이 어떻게 마감되는지, ETH가 어디로 가는지, 작품이 왜 결정론적인지. 처음이라면 여기에서 시작하는 것이 좋습니다.',
      questions: basicQuestionsTextKo,
    },
    medium: {
      title: '중급',
      tagline: '살아 움직이는 메커니즘: 보정 구간, 선두 유지 경로, 평의회 규칙.',
      description:
        '작동 중인 메커니즘 25문항: 비용 곡선, CST 피드백 루프, 수호 챔피언과 시간의 전사 구분, 별빛 선정의 셈법, 평의회 매개변수. 사이클을 한두 번 지켜본 독자를 위한 단계입니다.',
      questions: mediumQuestionsTextKo,
    },
    hard: {
      title: '고급',
      tagline: '경계 사례와 포렌식: 적대적 지갑, 업그레이드 이력, 아트 파이프라인.',
      description:
        '꼼꼼한 독자를 위한 50문항: 카운트다운 만료 이후의 규칙, ETH를 거부하는 컨트랙트, V2가 다섯 가지를 바꾼 이유, V3가 다시 매기는 비용, 무작위성이 만들어지는 방식, 그리고 요시다 적분기가 아트 프로젝트에서 하는 일.',
      questions: hardQuestionsTextKo,
    },
  },
} as const satisfies QuizText;
