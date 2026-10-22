import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { LandingText } from './structure';

/** Korean landing copy, keyed by the skeleton in structure.ts. */
export const landingTextKo = {
  meta: {
    title: 'Cosmic Signature: Arbitrum 위의 절차적 온체인 아트 프로토콜',
    description:
      'V3는 이미 배포되었습니다. 참여 CST의 공식과 수령자, 참여자 ETH 및 NFT 별빛 선정의 가중치, CST 비용 하락 속도, ETH 비율, 시그니처 배분 NFT 수를 바꾸고 늦은 제스처 할증을 추가합니다.',
    keywords: [
      'Cosmic Signature',
      '절차적 아트 프로토콜',
      '온체인 아트',
      'Arbitrum',
      '삼체 문제',
      '제너러티브 아트',
      '공공재',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: '절차적 온체인 아트 프로토콜 · Arbitrum',
    headlineLead: '모든 제스처가',
    headlineAccent: '아트를 만듭니다.',
    subhead:
      '사이클의 첫 제스처는 ETH여야 하며 마감 시계를 시작합니다. 이후 제스처는 시간이 지난 뒤에도 저장된 마감 시각에 현재 시간 증가량을 더합니다. 현재 시각에서 시계를 다시 시작하지 않습니다. 마감이 성공적으로 실행될 때까지 제스처가 가능합니다. 해당 몫은 공공재 금고로 전달됩니다. 누구나 별도 트랜잭션으로 잔액을 현재 수령처인 Protocol Guild에 보낼 수 있습니다.',
    secondaryCtaLabel: '사이클 작동 원리',
    art: {
      viewAriaLabel: '앱에서 Cosmic Signature {tokenLabel} 보기',
      artworkAlt: 'Cosmic Signature {tokenLabel}: 결정론적 삼체 제너러티브 아트 작품',
      galleryCta: '전체 갤러리 둘러보기',
    },
  },

  cycle: {
    eyebrow: '사이클',
    heading: '퍼포먼스 사이클, 시작에서 마감까지.',
    steps: {
      gesture: {
        title: '제스처 남기기',
        body: 'ETH 또는 CST로 참여합니다. 모든 제스처는 온체인에 기록되고 사이클의 별빛 선정 자격이 됩니다.',
      },
      extend: {
        title: '마감 시각 연장',
        body: '제스처마다 사이클 마감 시각이 늘어나므로, 참여가 이어지는 동안 사이클도 계속됩니다.',
      },
      finalize: {
        title: '마감과 배분',
        body: '시계가 0이 되면 사이클을 마감할 수 있습니다. 마감하면 새 시그니처가 각인되고 사이클 준비금이 아래의 배분 경로로 배분됩니다.',
      },
    },
    gestureCtaLabel: '제스처 남기기',
    guideCtaLabel: '단계별 작동 원리',
  },

  art: {
    eyebrow: '아트',
    heading: '온체인 시드로 그려 내는 삼체 문제.',
    description:
      'NFT 시드는 온체인에 저장되고 이미지와 영상은 오프체인에서 생성됩니다. 재현하려면 같은 시드, 해당 렌더러 버전과 설정, 호환되는 도구가 필요합니다. 시드만 같다고 서로 다른 버전의 결과가 동일하다는 보장은 없습니다.',
    showcase: {
      viewAriaLabel: 'Cosmic Signature {tokenLabel} 보기',
      artworkAlt: 'Cosmic Signature 작품 {tokenLabel}',
    },
    stageLabel: '단계',
    stages: {
      seed: {
        title: '시드',
        body: '블록 정보와 ArbSys 프리컴파일 같은 온체인 데이터에서 32바이트 해시를 얻은 뒤, SHA3-256 RNG에 입력합니다.',
      },
      simulation: {
        title: '시뮬레이션',
        body: '10만 개의 후보 구성이 4차 요시다 심플렉틱 적분기를 통과하며, 각각 100만 번의 물리 스텝을 거칩니다.',
      },
      selection: {
        title: '선별',
        body: '궤적의 성질을 바탕으로 Borda 순위를 매겨 후보를 좁히고, 이미지의 미적 특성을 확인하는 추가 단계로 결과를 정합니다.',
      },
      camera: {
        title: '카메라',
        body: '카메라가 타원형 경로를 따라 천천히 움직이며 세 천체의 궤적을 담습니다. 시점의 변화가 작품에 영화 같은 깊이감을 더합니다.',
      },
      color: {
        title: '색',
        body: '팔레트는 OKLCh 지각 색 공간에서 색상과 색 간격을 조정합니다. 현재 렌더러는 세 천체의 색상을 일정한 각도 간격으로 고정하지 않습니다.',
      },
      'spectral-render': {
        title: '스펙트럼 렌더',
        body: '380~700나노미터를 64개의 파장 구간으로 나누어, 속도에 따라 굵기가 달라지는 궤도 자취를 심도와 함께 렌더링합니다.',
      },
      signature: {
        title: '시그니처',
        body: '톤 매핑, 빛 번짐, 색 처리가 이미지를 완성합니다. 크기, 영상 길이, 파일 형식은 렌더러 버전과 설정에 따라 달라집니다.',
      },
    },
    facts: {
      imprinted: { label: '지금까지 각인' },
      resolution: { label: '원본 해상도' },
      animation: { label: '애니메이션', value: '30초 · 60fps' },
      license: { label: '라이선스' },
    },
  },

  tracks: {
    eyebrow: '배분 경로',
    heading: '모든 사이클 준비금은 규칙에 따라 배분됩니다.',
    description: `모든 경로가 있으면 한 사이클에서 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 고정 배분 CST ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ko')}개가 각인됩니다. 시그니처 배분은 NFT ${protocolFacts.mainPrizeNftsPerCycle}개에 대해 CST ${formatCount(protocolFacts.specialAllocationCst, 'ko')}개를 합계로 한 번 받습니다. 시간의 전사, 수호 챔피언, 최종 CST 제스처는 각각 NFT 1개와 해당 CST를 받으며, 두 NFT 선정 경로가 나머지를 더합니다. CST 제스처나 앵커링된 Random Walk NFT가 없으면 해당 경로는 생략합니다. 참여 CST는 별도입니다.`,
    ethLabel: '각 사이클 준비금의 ETH',
    fixedLabel: '사이클마다 배분되는 CST와 NFT',
    fixedEach: `수령자마다 ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST와 Cosmic Signature NFT 1개를 받습니다.`,
    recipients: { other: '수령자 {count}명' },
    items: {
      'signature-allocation': {
        title: '시그니처 배분',
        body: '마감 수령자는 연속 ID의 Cosmic Signature NFT 3개와 총 1,000 CST를 받습니다. 마감 권한에는 우선 마감 구간과 공개 마감 구간이 적용됩니다.',
      },
      'compounding-reserve': {
        percent: '약 50%',
        title: '누적 준비금',
        body: 'ETH의 약 절반이 다음 사이클로 이어집니다. 정수 처리, 생략된 경로, 실패한 전송으로 더 많은 ETH가 남을 수 있습니다. 다음 사이클의 시작 준비금이 더 커진다는 보장은 없습니다.',
      },
      'chrono-warrior': {
        title: '시간의 전사 배분',
        body: `수호 챔피언 자리를 가장 오랫동안 연속으로 지킨 참여자에게. ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST와 Cosmic Signature NFT 1개가 포함됩니다.`,
      },
      'public-goods': {
        title: '공공재 배분',
        body: '해당 몫은 공공재 금고로 전달됩니다. 누구나 별도 트랜잭션으로 잔액을 현재 수령처인 Protocol Guild에 보낼 수 있습니다.',
      },
      'anchor-distribution': {
        title: '앵커링 지급',
        body: '이 사이클 동안 프로토콜에 앵커링된 Cosmic Signature NFT마다 같은 금액이 지급됩니다.',
      },
      'eth-stellar-selection': {
        title: 'ETH 별빛 선정',
        body: `가중치를 적용한 ${protocolFacts.ethStellarSelectionRecipients}건의 선정이 ETH 몫을 나눕니다. 제스처 당시의 ETH 기본 비용을 가중치로 선정하며, 비용 감소와 늦은 할증은 제외합니다. 같은 주소가 여러 번 선정될 수 있습니다.`,
      },
      'participant-nft-stellar-selection': {
        title: '참여자 대상 NFT 별빛 선정',
        body: '제스처 당시의 ETH 기본 비용을 가중치로 선정하며, 비용 감소와 늦은 할증은 제외합니다. 같은 주소가 여러 번 선정될 수 있습니다.',
      },
      'anchored-nft-stellar-selection': {
        title: '앵커링 NFT 별빛 선정',
        body: 'Random Walk NFT 앵커링 보유자 가운데 무작위로 선정됩니다.',
      },
      'endurance-champion': {
        title: '수호 챔피언 배분',
        body: '가장 오랫동안 끊기지 않고 선두를 지킨 참여자입니다.',
      },
      'final-cst-gesture': {
        title: '최종 CST 제스처 배분',
        body: '사이클에서 마지막으로 CST 제스처를 남긴 참여자입니다.',
      },
    },
  },

  anchoring: {
    eyebrow: '앵커링',
    heading: 'Cosmic Signature NFT를 프로토콜에 앵커링합니다.',
    body: `Cosmic Signature NFT를 앵커링하면 사이클마다 ${protocolFacts.anchorDistributionPercentage}% 앵커링 지급을 비례하여 나누어 받으며, 그 몫은 앵커링을 해제할 때 지급됩니다. 앵커링 해제는 언제든 할 수 있지만 각 NFT는 한 번만 앵커링할 수 있습니다.`,
    bullets: [
      '사이클마다 쌓인 ETH는 앵커링 해제 시 회수',
      '잠금 기간과 페널티 없음. 해제한 NFT는 다시 앵커링할 수 없음',
      '자매 컬렉션인 Random Walk NFT도 앵커링 가능',
      `앵커링된 Random Walk NFT는 앵커링 NFT 별빛 선정 대상: ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST와 Cosmic Signature NFT, ETH는 없음`,
    ],
    ctaLabel: '앱에서 앵커링하기',
  },

  publicGoods: {
    eyebrow: '공공재',
    heading: '모든 사이클이 이더리움 핵심 기여자를 지원합니다.',
    body: '마감 시 프로토콜은 사이클 준비금의 설정된 몫을 공공재 금고로 보내려고 시도합니다. 이후 누구나 별도 트랜잭션으로 금고 잔액을 현재 공공재 수령처인 Protocol Guild에 전달할 수 있습니다. 소유자는 수령처를 바꿀 수 있습니다. 프로토콜에서 금고로 보내는 작업이 실패하면 마감을 취소하지 않고 해당 몫이 준비금에 남을 수 있습니다.',
    disclaimerHeading: '면책 고지',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      '이는 공공재 주소(현재 Protocol Guild)로 ETH를 전달하는 것입니다. 미국 세법상의 자선 기부가 아니며, Cosmic Signature는 그 세무상 취급에 관해 어떤 진술도 하지 않습니다.',
    // lexicon-allow-end
    card: {
      label: '사이클 배분',
      description:
        '해당 몫은 공공재 금고로 전달됩니다. 누구나 별도 트랜잭션으로 잔액을 현재 수령처인 Protocol Guild에 보낼 수 있습니다.',
      tableRows: {
        contributors: { label: 'Protocol Guild 기여자' },
        enforcement: { label: '집행', value: '온체인' },
        recipient: { label: '수령자' },
      },
    },
    ctaLabel: 'Protocol Guild 알아보기',
  },

  council: {
    eyebrow: '우주 평의회',
    heading: '프로토콜 조율, 온체인에서.',
    body: 'CST 보유자는 온체인에서 프로토콜을 조율합니다. 가중치를 위임하고, 조율 제안을 제출하고, 찬성 또는 반대를 표현합니다.',
    columns: {
      proposal: {
        title: '조율 제안',
        body: `위임된 가중치가 ${protocolFacts.councilProposalThresholdCst} CST 이상인 주소는 누구나 제안을 제출할 수 있습니다. 조율 지연은 ${protocolFacts.councilVotingDelayDays}일, 조율 기간은 ${protocolFacts.councilVotingPeriodWeeks}주입니다.`,
      },
      weight: {
        title: '조율 가중치',
        body: '위임된 CST 하나가 가중치 한 단위입니다. 의사 표현은 암호학적 서명이며, 주식이나 지분 증서가 아닙니다.',
      },
      quorum: {
        title: '조율 정족수',
        body: `찬성이 반대를 넘고, 찬성과 기권 가중치의 합이 CST 총 공급량의 ${protocolFacts.councilQuorumPercent}%에 이르면 제안이 통과됩니다. 반대 가중치는 정족수에 포함되지 않습니다.`,
      },
    },
  },

  verifiability: {
    eyebrow: '검증 가능성',
    heading: '열려 있고, 검증되었고, 재현 가능합니다.',
    body: 'NFT 시드는 온체인에 저장되고 이미지와 영상은 오프체인에서 생성됩니다. 재현하려면 같은 시드, 해당 렌더러 버전과 설정, 호환되는 도구가 필요합니다. 시드만 같다고 서로 다른 버전의 결과가 동일하다는 보장은 없습니다.',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Cosmic Signature 저장소들의 프로젝트 소유 자료(컨트랙트, 셰이더, 렌더링 파이프라인)는 CC0 1.0으로 공개되며 어떤 권리도 유보하지 않습니다. 제3자 의존성, 글꼴, 에셋은 각자의 라이선스를 유지합니다.',
      },
      verification: {
        title: '검증 현황',
        body: '앱은 공개 컨트랙트 주소, 소스 코드 자료, 검증 맥락, 보안 감사 및 보고서 현황을 연결하여, 누구나 공개된 내용을 살펴볼 수 있게 합니다.',
      },
      reproducible: {
        title: '재현 가능한 아트',
        body: '저장소에는 수동으로 실행하는 이미지 재현 확인 절차가 있습니다. 현재 지속적 통합 과정은 생성된 프레임의 해시를 비교하지 않습니다.',
      },
    },
    evidenceLabel: '직접 확인하기',
  },

  faq: {
    eyebrow: '자주 묻는 질문',
    heading: '분명하게 답해야 할 질문.',
    moreLabel: '자주 묻는 질문에서 더 보기',
    items: [
      {
        question: '참여자로서 실제로 무엇을 하나요?',
        answer:
          'V3에서는 다음 제스처가 이전 제스처 참여자에게 참여 CST 전액을 각인합니다. 수량은 두 제스처 사이의 시간에 선형으로 비례합니다. 사이클의 첫 제스처는 이 규칙으로 CST를 각인하지 않으며, 마감도 최종 제스처 참여자의 마지막 구간에 추가 참여 CST를 지급하지 않습니다. 두 제스처의 주소가 같으면 해당 주소가 직접 받습니다.',
      },
      {
        question: '작품은 어떤 기술로 만들어지나요?',
        answer:
          'NFT 시드는 온체인에 저장되고 이미지와 영상은 오프체인에서 생성됩니다. 재현하려면 같은 시드, 해당 렌더러 버전과 설정, 호환되는 도구가 필요합니다. 시드만 같다고 서로 다른 버전의 결과가 동일하다는 보장은 없습니다.',
      },
      {
        question: 'ETH 배분은 어디에서 나오나요?',
        answer:
          '참여자가 제스처를 남길수록 커지는 사이클 준비금에서 나옵니다. 사이클이 마감되면 약 절반은 다음 사이클의 누적 준비금으로 이월되고, 나머지는 온체인 매개변수에 따라 배분 경로(시그니처 배분, 시간의 전사, 앵커링 지급, 별빛 선정, 공공재)로 배분됩니다.',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: '공공재란 정확히 무엇인가요?',
        answer: `마감 시 프로토콜은 사이클 준비금의 ${protocolFacts.publicGoodsPercentage}%를 공공재 금고로 보내려고 시도합니다. 이후 누구나 별도 트랜잭션으로 금고 잔액을 현재 공공재 수령처인 Protocol Guild에 전달할 수 있습니다. 소유자는 수령처를 바꿀 수 있습니다. 프로토콜에서 금고로 보내는 작업이 실패하면 마감을 취소하지 않고 해당 몫이 준비금에 남을 수 있습니다.`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: '이것은 복권이나 카지노, 도박 상품인가요?',
        answer:
          '아닙니다. Cosmic Signature는 절차적 온체인 아트 프로토콜입니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 사이클이 마감되면 프로토콜은 정해진 배분 경로에 따라 배분을 실행합니다. 하우스도, 딜러도, 베팅도 없습니다. 배분은 끈기, 타이밍, 참여를 인정합니다. 유일하게 무작위성이 있는 배분 경로인 별빛 선정은 프로토콜 수준의 절차적 배분입니다.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: '이 중에 투자에 해당하는 것이 있나요?',
        answer:
          '없습니다. CST 토큰은 프로토콜 안에서 참여와 조율 가중치를 표현하며, 지분, 이익 공유, 배당, 투자 계약이 아닙니다. 참여자의 제스처에서 나온 ETH를 받는 팀 지갑은 없습니다. Cosmic Signature는 토큰 가격이나 향후 움직임에 관해 어떤 진술도 하지 않으며, 투자로서 참여를 권유하지 않습니다.',
      },
      // lexicon-allow-end
      {
        question: '참여 CST의 양은 왜 달라지나요?',
        answer:
          'V3에서는 다음 제스처가 이전 제스처 참여자에게 참여 CST 전액을 각인합니다. 수량은 두 제스처 사이의 시간에 선형으로 비례합니다. 사이클의 첫 제스처는 이 규칙으로 CST를 각인하지 않으며, 마감도 최종 제스처 참여자의 마지막 구간에 추가 참여 CST를 지급하지 않습니다. 두 제스처의 주소가 같으면 해당 주소가 직접 받습니다.',
      },
      {
        question: 'ETH 제스처와 CST 제스처는 CST 보정 구간에 어떤 영향을 주나요?',
        answer:
          'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
      },
      {
        question: '포크해도 되나요?',
        answer:
          '됩니다. 프로젝트 소유의 컨트랙트, 셰이더, 렌더러, 홍보 페이지, 문서는 CC0 1.0으로 공개되며 어떤 권리도 유보하지 않습니다. 제3자 의존성, 글꼴, 에셋은 각자의 라이선스를 유지합니다. THIRD_PARTY_NOTICES.md를 참고해 주세요.',
      },
    ],
  },
  closing: {
    eyebrow: '컬렉션',
    heading: '사이클마다 컬렉션이 늘어납니다.',
    body: '진행 중인 사이클을 지켜보거나, 제스처를 남기거나, 지금까지 각인된 모든 시그니처를 둘러볼 수 있습니다.',
  },
} satisfies LandingText;
