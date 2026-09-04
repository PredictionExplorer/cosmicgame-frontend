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
      '정답입니다.',
      '정확합니다.',
      '정확합니다. 해설에서 작동 원리도 확인해 보세요.',
      '정답입니다. 다음 문항으로 넘어가 보세요.',
    ],
    incorrectFeedback: [
      '정답은 다른 선택지입니다. 작동 원리를 함께 살펴보세요.',
      '해설에서 이 문항의 핵심을 확인할 수 있습니다.',
      '정답과 그 이유를 확인해 보세요.',
      '해설과 백서에서 정답의 근거를 확인할 수 있습니다.',
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
          line: '이제 이해의 폭을 넓혀 볼 차례입니다. 아래 해설과 참고 자료가 복습에 도움이 됩니다.',
        },
        participant: {
          name: '참여자',
          line: '핵심 작동 원리를 이해했습니다. 다음에는 세부 조건과 예외도 살펴보세요.',
        },
        enduranceChampion: {
          name: '수호 챔피언',
          line: '작동 원리를 잘 이해했습니다. 틀린 문항을 복습하면 더 깊이 이해할 수 있습니다.',
        },
        chronoWarrior: {
          name: '시간의 전사',
          line: '프로토콜을 자세히 이해했습니다. 참고 섹션에서는 설계 배경까지 살펴볼 수 있습니다.',
        },
      },
      studyHeading: '복습하기',
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
      tagline: '예외 상황과 설계 분석: 적대적 지갑, 업그레이드 이력, 아트 파이프라인.',
      description:
        '꼼꼼한 독자를 위한 50문항: 카운트다운 만료 이후의 규칙, ETH를 거부하는 컨트랙트, V2가 다섯 가지를 바꾼 이유, V3가 다시 매기는 비용, 무작위성이 만들어지는 방식, 그리고 요시다 적분기가 아트 프로젝트에서 하는 일.',
      questions: hardQuestionsTextKo,
    },
  },
} as const satisfies QuizText;
