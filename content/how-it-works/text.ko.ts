import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

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
    badge: '절차적 온체인 아트 프로토콜',
    headingLead: 'Cosmic Signature',
    headingAccent: '작동 원리',
    paragraph:
      '제스처를 남기고, 시간을 지켜보며, 시그니처를 함께 빚어냅니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 사이클 마감 시각이 지나면 사이클을 마감할 수 있습니다. 배분은 시그니처 배분, 앵커링 지급, Protocol Guild를 비롯한 10개가 넘는 경로로 이루어집니다.',
    primaryCtaLabel: '프로토콜 열기',
    secondaryCtaLabel: '자세히 알아보기',
  },
  overview: {
    heading: '작동 원리',
    subhead: '참여하고 사이클 준비금을 쌓아 가는 세 단계',
    cards: [
      {
        title: '제스처',
        description:
          'ETH 또는 CST(ERC-20)로 제스처를 남깁니다. 제스처마다 사이클 마감 시각이 연장되고, 별빛 선정 자격이 기록되며, 시그니처가 조금씩 빚어집니다.',
        tooltip: `제스처는 ETH 또는 CST 토큰(ERC-20)으로 남길 수 있습니다. ETH 제스처에 Random Walk NFT를 첨부하면 ETH 제스처 비용을 한 번 ${protocolFacts.randomWalkDiscountPercentage}% 할인받습니다.`,
      },
      {
        title: '지속',
        description:
          '사이클은 마감 시각이 지날 때까지 이어집니다. 새 제스처마다 저장된 마감 시각에 현재 시간 증가량이 더해집니다.',
        tooltip:
          '시간 증가량은 약 1시간에서 시작해 사이클을 거치며 조금씩 늘어납니다. CST 제스처 비용은 동적인 보정 구간을 따르며, ETH 제스처와 CST 제스처가 이 구간을 서로 반대 방향으로 움직입니다.',
      },
      {
        title: '수령',
        description:
          '사이클이 마감되면 시그니처 배분, 별빛 선정, 앵커링 지급 등 여러 배분의 대상이 됩니다.',
        tooltip: `최종 제스처를 남긴 참여자는 사이클 준비금의 ${protocolFacts.mainEthPercentage}%, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST, Cosmic Signature NFT를 받습니다. 별빛 선정 수령자, 앵커링 보유자, 다른 참여자도 배분을 받습니다.`,
      },
    ],
  },
  rewardBreakdown: {
    heading: '제스처가 이어 주는 배분',
    subhead: '참여 한 번이 사이클마다 여러 배분 경로에 반영됩니다.',
    items: [
      {
        title: '동적 참여 CST',
        description: '제스처마다 이전 제스처 이후 흐른 시간에 따라 CST가 각인될 수 있습니다.',
        tooltip: `참여 CST는 제곱근 공식을 따릅니다: ${protocolFacts.dynamicCstRewardFormula}. 빠르게 이어진 제스처는 0 CST를 받을 수 있고, 공백이 길수록 더 많이 각인됩니다.`,
      },
      {
        title: '별빛 선정 자격',
        description: '제스처마다 별빛 선정 자격이 기록되어 사이클 마감 시 배분에 반영됩니다.',
        tooltip: `사이클이 마감되면 자격이 무작위로 선정됩니다. 참여자 세 명이 사이클 준비금 ETH의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다.`,
      },
      {
        title: 'Cosmic Signature NFT 선정',
        description: `사이클마다 참여자 열 명이 별빛 선정으로 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 고유한 Cosmic Signature NFT를 받습니다.`,
        tooltip: `사이클마다 별빛 선정 수령자 열 명과 Random Walk NFT 앵커링 보유자 열 명이 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받습니다.`,
      },
      {
        title: '시그니처 배분',
        description: `최종 제스처를 남긴 참여자는 사이클 준비금 ETH의 ${protocolFacts.mainEthPercentage}%, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST, Cosmic Signature NFT를 회수할 수 있습니다.`,
        tooltip:
          '사이클 준비금은 ETH 제스처로 쌓입니다. 최종 제스처를 남긴 참여자가 프로토콜 컨트랙트를 통해 시그니처 배분을 회수합니다.',
      },
    ],
  },
  gameCycle: {
    heading: '퍼포먼스 사이클의 흐름',
    subhead: '모든 사이클은 시작부터 마감까지 이 순서를 따릅니다.',
    phases: [
      {
        label: '사이클 시작',
        description: `새 퍼포먼스 사이클이 시작됩니다. 첫 ETH 보정 구간이 열리고, CST 보정 구간은 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준으로 시작해 참여에 따라 달라집니다.`,
        tooltip:
          '보정 구간에서는 점점 내려가는 비용으로 제스처를 남길 수 있습니다. 사이클 준비금은 0에서 시작하되 이전 사이클의 누적 준비금이 더해집니다.',
      },
      {
        label: '참여자의 제스처',
        description: `제스처마다 사이클 마감 시각에 현재 시간 증가량이 더해집니다. 참여 CST는 동적이며, ETH 제스처와 CST 제스처는 CST 보정 구간을 각각 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄이거나 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다.`,
        tooltip:
          '참여 CST는 이전 제스처 이후 흐른 시간에 제곱근 공식을 적용해 정해집니다. 정확한 CST 양은 앱의 현재 미리 보기가 기준입니다.',
      },
      {
        label: '사이클 마감 시각 도달',
        description:
          '카운트다운이 0에 이르면 최종 제스처를 남긴 참여자가 사이클을 마감할 자격을 얻습니다.',
        tooltip: `마감이 실제로 실행되기 전까지는 제스처를 남길 수 있습니다. 늦게 남긴 제스처는 저장된 시각을 연장하고 최종 제스처 자리를 넘겨받습니다. 최종 제스처 참여자에게는 ${protocolFacts.finalGestureExclusivityHours}시간의 우선 마감 구간이 주어지며, 그 뒤에는 누구나 마감할 수 있고 마감한 사람이 시그니처 배분을 받습니다.`,
      },
      {
        label: '사이클 마감',
        description: `최종 제스처를 남긴 참여자가 시그니처 배분(사이클 준비금의 ${protocolFacts.mainEthPercentage}%, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST, Cosmic Signature NFT)을 회수합니다.`,
        tooltip:
          '시그니처 배분 회수는 프로토콜 컨트랙트를 통해 이루어집니다. CST와 Cosmic Signature NFT는 자동으로 각인됩니다.',
      },
      {
        label: '별빛 선정',
        description: `ETH 별빛 선정 수령자 세 명이 사이클 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다. NFT 별빛 선정 수령자 열 명과 앵커링 NFT 별빛 선정 수령자 열 명은 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받습니다.`,
        tooltip:
          '자격은 제스처마다 기록됩니다. 제스처가 많을수록 선정 빈도가 높아집니다. Random Walk NFT 앵커링 보유자에게는 별도의 별빛 선정이 있습니다.',
      },
      {
        label: '다음 사이클',
        description:
          '사이클 준비금의 약 절반이 누적 준비금으로 이월되고, 다음 사이클이 새 보정 구간과 함께 시작됩니다.',
        tooltip:
          '누적 준비금은 프로토콜이 가치를 빼내지 않고 쌓아 간다는 뜻입니다. 현재 구간 길이와 비용은 컨트랙트의 실시간 값이 기준입니다.',
      },
    ],
  },
  stepByStep: {
    heading: '시작하기',
    subhead: '지갑 연결부터 첫 제스처까지 세 단계',
    stepLabel: '단계',
    steps: [
      {
        title: '지갑 연결',
        tooltip:
          'Arbitrum은 이더리움 위의 레이어 2 블록체인으로, 가스 비용이 낮고 트랜잭션이 빠릅니다.',
        highlights: [
          '페이지 상단의 ‘지갑 연결’ 버튼을 누릅니다.',
          'MetaMask처럼 Arbitrum 블록체인을 지원하는 지갑을 사용합니다.',
          '안내가 나오면 네트워크를 Arbitrum으로 전환하고 권한을 승인합니다.',
          '연결되면 지갑 주소가 헤더에 표시됩니다.',
        ],
      },
      {
        title: '제스처 비용 확인',
        tooltip:
          '가스 비용은 네트워크 상황과 작업 내용에 따라 달라집니다. 제스처 비용과 별도로 필요하므로, 전송 전에 지갑에 표시된 예상 비용을 확인해 주세요.',
        highlights: [
          '사이클 마감 시각을 확인합니다. 제스처마다 저장된 마감 시각에 현재 시간 증가량이 더해집니다.',
          '제스처를 남기기 전에 현재 ETH 또는 CST 제스처 비용을 확인합니다.',
          '실시간 참여 CST 미리 보기를 확인합니다. 이 양은 이전 제스처 이후 흐른 시간에 따라 달라집니다.',
          '시그니처 배분 금액을 보고 예상되는 ETH 배분 규모를 확인합니다.',
          '제스처 비용과 소액의 가스 비용을 낼 잔액이 지갑에 있는지 확인합니다.',
        ],
      },
      {
        title: '제스처 남기기',
        tooltip: `Random Walk NFT 하나는 ETH 제스처 비용 ${protocolFacts.randomWalkDiscountPercentage}% 할인에 한 번만 쓸 수 있으므로, 때를 잘 골라 쓰는 것이 좋습니다.`,
        highlights: [
          `ETH 또는 CST(ERC-20)로 제스처를 남깁니다. ETH 제스처에는 Random Walk NFT를 첨부해 비용을 ${protocolFacts.randomWalkDiscountPercentage}% 할인받을 수도 있습니다.`,
          '‘제스처 남기기’를 누르고 지갑에서 트랜잭션을 확인합니다.',
          '제스처는 사이클 마감 시각을 연장하고 ETH/CST 비용 상태를 갱신합니다.',
          '모든 제스처는 별빛 선정 자격을 기록하며, 동적 참여 CST를 자동으로 각인할 수 있습니다.',
        ],
      },
    ],
  },
  proTips: {
    heading: '활용 팁과 전략',
    subhead: '여러 배분 경로에 걸쳐 참여를 최대한 살리는 실용적인 안내',
    tips: [
      {
        title: '두 보정 구간을 함께 살피기',
        description:
          'ETH 제스처 비용과 CST 제스처 비용은 각각의 실시간 구간을 따르며, 제스처마다 CST 구간이 달라집니다.',
        tooltip:
          'ETH 제스처는 CST 보정 구간을 조금 줄이고, CST 제스처는 조금 늘립니다. 앱의 실시간 패널에서 현재 비용 경로를 볼 수 있습니다.',
      },
      {
        title: 'Random Walk NFT 첨부하기',
        description: `Random Walk NFT를 보유하면 ETH 제스처 비용을 한 번 ${protocolFacts.randomWalkDiscountPercentage}% 할인받을 수 있습니다.`,
        tooltip:
          'Random Walk NFT 하나는 할인에 한 번만 쓸 수 있습니다. 비용이 높은 제스처에 아껴 쓰면 효과가 가장 큽니다.',
      },
      {
        title: '별빛 선정 자격 쌓기',
        description:
          '제스처마다 별빛 선정 자격이 한 건씩 기록됩니다. 제스처가 많을수록 선정 빈도가 높아집니다.',
        tooltip: `ETH 별빛 선정 수령자 세 명이 사이클 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다. NFT 별빛 선정 수령자 열 명과 Random Walk NFT 앵커링 보유자 열 명은 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받습니다.`,
      },
      {
        title: '전용 지갑 사용하기',
        description:
          '스마트 컨트랙트는 온체인에서 소스가 공개 검증되어 있지만, 참여 전용 지갑을 따로 쓰면 안전성이 한층 높아집니다.',
        tooltip:
          '전용 지갑은 프로토콜 활동을 주요 보유 자산과 분리해 보안을 높입니다. 보안 감사와 검증 상태는 보안 감사 페이지에 공개되어 있습니다.',
      },
      {
        title: '마감 시각 지켜보기',
        description: '제스처마다 저장된 사이클 마감 시각에 현재 시간 증가량이 더해집니다.',
        tooltip:
          '마감 직전에 제스처를 남기면 최종 제스처 자리에 가장 가까워지지만, 사이클이 마감되기 전까지는 다른 참여자가 뒤이어 제스처를 남길 수 있습니다.',
      },
      {
        title: 'CST로 제스처 남기기',
        description: 'CST 보정 구간을 통해 CST를 또 하나의 제스처 수단으로 쓸 수 있습니다.',
        tooltip: `CST 제스처는 별빛 선정 자격을 기록하고, 사이클 마감 시각을 연장하고, 동적 참여 CST를 각인할 수 있으며, CST 보정 구간을 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다.`,
      },
    ],
  },
  faqCallout: {
    heading: '궁금한 점이 있나요?',
    body: '사이클 메커니즘, 배분 경로, 토큰 등 Cosmic Signature에 관한 자세한 답은 자주 묻는 질문에 정리되어 있습니다.',
    ctaLabel: '자주 묻는 질문 보기',
  },
  callToAction: {
    heading: '첫 제스처를 남길 준비가 되었나요?',
    // The JSX original rendered a literal "\u2019" because unicode escapes are
    // not processed inside JSX text; this is the intentional fix to a real ’.
    body: '지금 진행 중인 퍼포먼스 사이클에 참여해 주세요. 지갑을 연결하고 첫 제스처를 남기면 참여 CST가 각인될 수 있고, 사이클의 시그니처가 빚어지기 시작합니다.',
    primaryCtaLabel: '프로토콜 열기',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
