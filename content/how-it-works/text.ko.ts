import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('ko-KR');

/** 한국어 작동 원리 copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextKo = {
  metadata: {
    title: 'Cosmic Signature 작동 원리 | 퍼포먼스 사이클, 제스처, NFT',
    description:
      'Cosmic Signature 퍼포먼스 사이클이 보정 구간에서 제스처를 거쳐 최종 배분까지 어떻게 펼쳐지는지 알아봅니다.',
  },
  jsonLd: {
    name: 'Cosmic Signature 작동 원리',
    description:
      'Cosmic Signature 퍼포먼스 사이클이 보정 구간에서 제스처를 거쳐 최종 배분까지 어떻게 펼쳐지는지 알아봅니다.',
  },
  breadcrumbs: {
    homeLabel: '홈',
    pageLabel: '작동 원리',
  },
  hero: {
    heading: 'Cosmic Signature 작동 원리',
    paragraph:
      '제스처를 남기고, 시간을 지켜보며, 시그니처를 함께 빚어냅니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 사이클 마감 시각이 지나면 사이클을 마감할 수 있습니다. 배분은 시그니처 배분, 앵커링 지급, Protocol Guild를 비롯한 10개가 넘는 경로로 이루어집니다.',
    primaryCtaLabel: '제스처 남기기',
    secondaryCtaLabel: '현재 사이클 보기',
  },
  rewardBreakdown: {
    heading: '제스처가 이어 주는 배분',
    subhead: '제스처는 각각 해당 사이클의 여러 배분 경로에 반영됩니다.',
    items: [
      {
        title: '동적 참여 CST',
        description:
          '제스처는 CST를 각인할 수 있습니다. 그 양은 이전 제스처 이후 흐른 시간의 제곱근을 따르므로, 앞 제스처 바로 뒤에 남긴 제스처는 0 CST일 수 있고 공백이 길수록 더 많이 각인됩니다.',
      },
      {
        title: '별빛 선정 자격',
        description: `제스처마다 자격이 한 건 기록됩니다. 사이클이 마감되면 무작위로 세 건이 선정되어 사이클 준비금 ETH의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다.`,
      },
      {
        title: 'Cosmic Signature NFT 선정',
        description: `열 건이 추가로 선정되어 각각 ${cst} CST와 Cosmic Signature NFT를 받습니다. 같은 주소가 두 번 이상 선정될 수 있으며, 자격이 아무리 많아도 선정이 보장되지는 않습니다.`,
      },
      {
        title: '시그니처 배분',
        description: `최종 제스처를 남긴 참여자는 사이클을 마감하고 사이클 준비금 ETH의 ${protocolFacts.mainEthPercentage}%, ${cst} CST, Cosmic Signature NFT를 회수할 수 있습니다.`,
      },
    ],
  },
  costs: {
    heading: '제스처에 드는 비용',
    subhead: 'ETH나 CST로 제스처 비용을 내기 전에 아래 내용을 확인해 주세요.',
    items: [
      {
        title: '낸 비용은 돌아오지 않습니다',
        body: '제스처에 낸 ETH는 사이클 준비금에 더해지고, 낸 CST는 소각됩니다. 뒤이어 다른 사람이 제스처를 남겨도 어느 쪽도 돌아오지 않습니다.',
      },
      {
        title: 'ETH 비용은 제스처마다 오릅니다',
        body: `ETH 제스처가 있을 때마다 다음 ETH 제스처 비용이 ${protocolFacts.ethGestureCostStepUpPercent}% 오릅니다. 비용이 내려가는 때는 사이클마다 시작할 때 열리는 ETH 보정 구간뿐입니다.`,
      },
      {
        title: '가스 비용은 따로 듭니다',
        body: '제스처는 Arbitrum 트랜잭션이므로 네트워크 수수료도 ETH로 냅니다. 금액은 확인하기 전에 지갑에 표시됩니다.',
      },
    ],
    note: '잃어도 괜찮은 자금으로만 제스처를 남겨 주세요.',
    riskLinkLabel: '위험 고지 읽기',
  },
  gameCycle: {
    heading: '퍼포먼스 사이클의 흐름',
    subhead: '모든 사이클은 시작부터 마감까지 이 순서를 따릅니다.',
    legend: {
      gestures: '제스처',
      exclusiveWindow: `최종 제스처 참여자만 마감할 수 있는 ${protocolFacts.finalGestureExclusivityHours}시간`,
      allocations: '배분 경로',
    },
    phases: [
      {
        label: '사이클 시작',
        description: `새 퍼포먼스 사이클이 시작됩니다. ETH와 CST 제스처 비용은 각자의 보정 구간에서 내려가며, CST 보정 구간은 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준으로 시작해 참여에 따라 달라집니다. 사이클 준비금은 이전 사이클에서 이월된 금액으로 시작합니다.`,
      },
      {
        label: '참여자의 제스처',
        description: `제스처마다 사이클 마감 시각에 현재 시간 증가량이 더해집니다. ETH 제스처는 CST 보정 구간을 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄이고, CST 제스처는 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다.`,
      },
      {
        label: '사이클 마감 시각 도달',
        description: `카운트다운이 0에 이르면 최종 제스처를 남긴 참여자에게 사이클을 마감할 수 있는 ${protocolFacts.finalGestureExclusivityHours}시간이 주어집니다. 그 뒤에는 누구나 마감할 수 있고, 마감한 사람이 시그니처 배분을 받습니다. 마감이 실행되기 전까지는 새 제스처가 시각을 연장하고 최종 제스처가 됩니다.`,
      },
      {
        label: '사이클 마감',
        description: `마감과 함께 모든 배분이 이루어집니다. 마감한 참여자가 시그니처 배분(사이클 준비금의 ${protocolFacts.mainEthPercentage}%, ${cst} CST, Cosmic Signature NFT)을 받습니다.`,
      },
      {
        label: '별빛 선정',
        description: `ETH 별빛 선정 수령자 세 명이 사이클 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다. NFT 별빛 선정 수령자 열 명과, 앵커링된 Random Walk NFT 가운데 선정되는 앵커링 NFT 별빛 선정 수령자 열 명이 각각 ${cst} CST와 Cosmic Signature NFT를 받습니다.`,
      },
      {
        label: '다음 사이클',
        description: `사이클 준비금의 나머지 ${protocolFacts.compoundingReservePercentage}%가 누적 준비금으로 이월되고, 다음 사이클이 새 보정 구간과 함께 시작됩니다.`,
      },
    ],
  },
  payoff: {
    heading: '모든 사이클은 시그니처로 마무리됩니다',
    body: '모든 제스처가 사이클의 작품을 빚어냅니다. 사이클이 마감되면 시그니처가 Cosmic Signature NFT로 각인되어 시그니처 배분과 함께 최종 제스처를 남긴 참여자에게 전달됩니다.',
    caption: '사이클 {cycle}의 시그니처',
    linkLabel: '이 시그니처 보기',
  },
  stepByStep: {
    heading: '시작하기',
    subhead: '지갑 연결부터 첫 제스처까지 세 단계',
    stepLabel: '{n}단계',
    steps: [
      {
        title: '지갑 연결',
        highlights: [
          '페이지 상단의 ‘지갑 연결’ 버튼을 누릅니다.',
          'MetaMask처럼 Arbitrum을 지원하는 지갑을 사용합니다. Arbitrum은 이더리움의 레이어 2로, 수수료가 낮고 트랜잭션이 빠릅니다.',
          '지갑이 요청하면 네트워크를 Arbitrum으로 전환하고 연결을 승인합니다.',
          '연결되면 지갑 주소가 헤더에 표시됩니다.',
        ],
      },
      {
        title: '제스처 비용 확인',
        highlights: [
          '제스처를 남기기 전에 현재 ETH 또는 CST 제스처 비용을 확인합니다.',
          '참여 CST 미리 보기를 확인합니다. 이 양은 이전 제스처 이후 흐른 시간에 따라 달라집니다.',
          '제스처 비용과 네트워크 수수료로 쓸 약간의 ETH가 지갑에 있는지 확인합니다. 수수료는 확인하기 전에 지갑에 표시됩니다.',
        ],
      },
      {
        title: '제스처 남기기',
        highlights: [
          `ETH 또는 CST를 선택합니다. ETH 제스처에는 Random Walk NFT를 첨부해 ETH 제스처 비용을 ${protocolFacts.randomWalkDiscountPercentage}% 할인받을 수 있으며, NFT 하나당 한 번만 쓸 수 있습니다.`,
          '방식과 비용이 표시된 제스처 버튼(예: ‘ETH로 제스처 남기기’)을 누르고 지갑에서 트랜잭션을 확인합니다.',
        ],
      },
    ],
    fundingText: 'Arbitrum에 ETH가 아직 없나요?',
    fundingLinkLabel: 'Arbitrum 네트워크에서 ETH를 준비하는 방법',
  },
  proTips: {
    heading: '알아 두면 좋은 점',
    subhead: '놓치기 쉬운 세부 사항입니다.',
    tips: [
      {
        title: '두 보정 구간',
        body: `ETH 제스처 비용은 사이클이 시작될 때 한 번만 보정 구간에서 내려갑니다. CST 제스처 비용은 CST 제스처가 있을 때마다 새 구간이 시작되어, 방금 낸 비용의 두 배(최소 ${protocolFacts.cstCalibrationCeilingMinCst} CST)에서 0까지 내려갑니다.`,
      },
      {
        title: 'Random Walk NFT는 한 번만',
        body: `Random Walk NFT 하나는 ETH 제스처 한 번의 비용을 ${protocolFacts.randomWalkDiscountPercentage}% 낮추며, 그 뒤에는 다른 제스처에 쓸 수 없습니다. 사용과 앵커링은 서로 별개입니다.`,
      },
      {
        title: '전용 지갑 사용하기',
        body: '전용 지갑은 프로토콜 활동을 주요 보유 자산과 분리합니다. 검토와 검증 현황은 보안 감사 페이지에서 확인할 수 있습니다.',
      },
    ],
  },
  callToAction: {
    heading: '첫 제스처를 남길 준비가 되었나요?',
    body: '지금 진행 중인 퍼포먼스 사이클에 참여해 주세요. 지갑을 연결하고 첫 제스처를 남기면 참여 CST가 각인될 수 있고, 사이클의 시그니처가 빚어지기 시작합니다.',
    primaryCtaLabel: '제스처 남기기',
    faqCtaLabel: '자주 묻는 질문 보기',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
