import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/** Korean landing copy, keyed by the skeleton in structure.ts. */
export const landingTextKo = {
  meta: {
    title: 'Cosmic Signature: Arbitrum 위의 절차적 온체인 아트 프로토콜',
    description:
      'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 모든 제스처가 사이클의 최종 시그니처를 빚어내고, 프로토콜은 그 결과를 함께 빚어낸 모든 참여자에게, 그리고 이더리움 자체가 의존하는 인프라에까지 준비금을 다시 배분합니다.',
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
      '정형 검증',
    ],
  },

  hero: {
    eyebrow: '절차적 온체인 아트 프로토콜 · Arbitrum',
    headline: 'Cosmic Signature: Arbitrum 위의 절차적 온체인 아트',
    headlineLead: 'Cosmic Signature: Arbitrum 위의',
    headlineAccent: '절차적 온체인 아트',
    subhead:
      '모든 제스처가 시그니처를 빚어냅니다. 퍼포먼스 사이클 동안 제스처를 남기면, 그 하나하나가 사이클의 최종 시그니처에 스며듭니다. 사이클이 마감되면 프로토콜은 준비금을 열 개가 넘는 배분 경로로 배분하며, 그 가운데에는 이더리움 자체가 의존하는 인프라도 있습니다.',
    biologyDisclaimer:
      'Cosmic Signature는 COSMIC 암 돌연변이 데이터베이스나 생물학의 COSMIC 돌연변이 시그니처와 관련이 없습니다. 온체인 아트 프로토콜이자 앱입니다.',
    primaryCtaLabel: '앱 열기',
    secondaryCtaLabel: '사이클 살펴보기',
    statisticsCtaLabel: '프로토콜 통계',
    galleryCtaLabel: 'NFT 갤러리',
    scrollAriaLabel: '사이클 섹션으로 이동',
    marqueeChips: [
      '검증된 컨트랙트',
      'CC0',
      '오픈 소스',
      '결정론적 아트',
      '7%는 Protocol Guild로',
      '우주 평의회',
      'Arbitrum One',
    ],
    art: {
      eyebrow: '컬렉션에서 실시간으로',
      caption: '온체인에 각인 · CC0',
      cstNote: `각인된 시그니처 한 점마다 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST가 함께 배분됩니다.`,
      formingLabel: '신호 형성 중',
      formingBody: '네트워크가 응답하는 즉시 컬렉션의 시그니처 한 점이 이곳에 나타납니다.',
      viewAriaLabel: '앱에서 Cosmic Signature {tokenLabel} 보기',
      artworkAlt: 'Cosmic Signature {tokenLabel}: 결정론적 삼체 제너러티브 아트 작품',
      galleryCta: '전체 갤러리 둘러보기',
    },
  },

  cycle: {
    eyebrow: '사이클',
    heading: '퍼포먼스 사이클, 시작에서 마감까지.',
    description:
      '사이클은 시간 속의 한 구간입니다. 보정 구간으로 열리고, 제스처로 채워지며, 사이클 마감 시각이 지나면 마감됩니다. 하우스도 없고, 딜러도 없습니다. 오직 프로토콜만 있습니다.',
    stages: {
      opening: {
        title: '사이클 시작',
        body: `새 퍼포먼스 사이클이 시작됩니다. 첫 ETH 보정 구간이 열리고, CST 보정 구간은 온체인에 저장된 길이를 따르며 현재는 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준으로 출발합니다.`,
      },
      gestures: {
        title: '제스처',
        body: `참여자는 ETH 또는 CST로 제스처를 남깁니다. 모든 제스처는 사이클 마감 시각을 연장하고, 별빛 선정 자격을 기록하며, 이전 제스처 이후 흐른 시간의 제곱근에 따라 동적 참여 CST를 각인할 수 있습니다. ETH 제스처는 CST 보정 구간을 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄이고, CST 제스처는 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다.`,
      },
      finalization: {
        title: '마감',
        body: '사이클 마감 시각이 지나면 최종 제스처를 남긴 참여자가 사이클을 마감할 수 있습니다. 우선 마감 구간이 끝나면 공개 마감 구간이 열려 누구나 마감할 수 있습니다.',
      },
      allocations: {
        title: '배분',
        body: '프로토콜은 사이클 준비금을 열 개가 넘는 배분 경로로 배분합니다. ETH 준비금의 약 절반은 다음 사이클의 누적 준비금으로 이월됩니다.',
      },
    },
  },

  art: {
    eyebrow: '아트',
    heading: '삼체 문제, 온체인에서 렌더링됩니다.',
    description:
      '모든 Cosmic Signature NFT는 뉴턴 중력 아래 서로를 도는 세 천체를 시각화합니다. 세 천체는 본질적으로 카오스적인 궤적을 그립니다. AI도 없고, 학습 데이터도 없습니다. 오직 결정론적 물리만 있습니다. 같은 시드 → 픽셀 하나까지 같은 결과물.',
    loading: {
      label: '실시간 아카이브 동기화 중',
      description:
        '인덱싱된 토큰 메타데이터가 준비되는 즉시 실제로 생성된 NFT가 이곳에 나타납니다.',
    },
    showcase: {
      liveLabel: '실시간 시그니처',
      signalLabel: '신호',
      awaitingMetadataLabel: '메타데이터 대기 중',
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
        body: '보르다 집계(카오스 × 등변성)가 후보 풀에서 시각적으로 가장 흥미로운 궤도를 골라냅니다.',
      },
      camera: {
        title: '카메라',
        body: '느린 타원형 카메라 드리프트가 각 시그니처에 삼체의 춤을 가로지르는 영화적인 시차 효과를 더합니다.',
      },
      color: {
        title: '색',
        body: '색은 OKLab 지각 색 공간에서 천체마다 색상을 120°씩 벌려 혼합되며, 드리프트와 사인파로 변조됩니다.',
      },
      'spectral-render': {
        title: '스펙트럼 렌더',
        body: '380~700나노미터를 64개의 파장 구간으로 나누어, 속도에 따라 굵기가 달라지는 궤도 자취를 심도와 함께 렌더링합니다.',
      },
      signature: {
        title: '시그니처',
        body: 'AgX 톤매핑, 블룸, OpenSimplex 성운 레이어, 컬러 그레이딩이 프레임을 완성합니다. 결과물은 16비트 PNG 한 장과 30초 길이의 H.265 영상입니다.',
      },
    },
    facts: {
      'wavelength-bins': { label: '파장 구간' },
      'physics-steps': { label: '후보당 물리 스텝', value: '1,000,000' },
      'candidate-orbits': { label: '후보 궤도', value: '100,000' },
      license: { label: '라이선스' },
    },
  },

  tracks: {
    eyebrow: '배분 경로',
    heading: '사이클 준비금이 배분되는 열 개가 넘는 경로.',
    description:
      '사이클이 마감되면 프로토콜은 ETH와 CST 준비금을 끈기, 타이밍, 헌신, 참여를 인정하는 배분 경로로 배분합니다. ETH 준비금의 약 절반은 다음 사이클로 이월됩니다.',
    cardLabel: '배분',
    items: {
      'signature-allocation': {
        title: '시그니처 배분',
        body: '최종 제스처를 남긴 참여자에게. 1,000 CST와 Cosmic Signature NFT 1개가 포함됩니다.',
      },
      'compounding-reserve': {
        percent: '약 50%',
        title: '누적 준비금',
        body: '다음 퍼포먼스 사이클로 이월됩니다. 프로토콜은 빼내지 않고 쌓아 갑니다.',
      },
      'chrono-warrior': {
        title: '시간의 전사 배분',
        body: `수호 챔피언 자리를 가장 오랫동안 연속으로 지킨 참여자에게. ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT 1개가 포함됩니다.`,
      },
      'public-goods': {
        title: '공공재 배분',
        body: '170명이 넘는 이더리움 핵심 기여자를 위한 자금 지원 메커니즘인 Protocol Guild로 전달됩니다.',
      },
      'anchor-distribution': {
        title: '앵커링 지급',
        body: '이 사이클 동안 프로토콜에 앵커링된 모든 Cosmic Signature NFT에 NFT당 균등하게 지급됩니다.',
      },
      'eth-stellar-selection': {
        title: 'ETH 별빛 선정',
        body: '무작위로 선정된 참여자 3명이 나누어 받습니다. 선정 빈도는 남긴 제스처 수에 따라 늘어납니다.',
      },
      'participant-nft-stellar-selection': {
        percent: 'NFT 10개',
        title: '참여자 대상 NFT 별빛 선정',
        body: `무작위로 선정된 참여자 10명이 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT 1개를 받습니다.`,
      },
      'anchored-nft-stellar-selection': {
        percent: 'NFT 10개',
        title: '앵커링 NFT 별빛 선정',
        body: `무작위로 선정된 Random Walk NFT 앵커링 보유자 10명이 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT 1개를 받습니다.`,
      },
      'endurance-champion': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST`,
        title: '수호 챔피언 배분',
        body: '가장 오랫동안 끊기지 않고 선두를 지킨 참여자에게 공로 CST 1,000개와 Cosmic Signature NFT 1개가 배분됩니다.',
      },
      'final-cst-gesture': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST`,
        title: '최종 CST 제스처 배분',
        body: '사이클에서 마지막으로 CST 제스처를 남긴 참여자에게 공로 CST 1,000개와 Cosmic Signature NFT 1개가 배분됩니다.',
      },
    },
  },

  anchoring: {
    eyebrow: '앵커링',
    heading: 'Cosmic Signature NFT를 프로토콜에 앵커링합니다.',
    body: `앵커링된 Cosmic Signature NFT는 사이클마다 ${protocolFacts.anchorDistributionPercentage}%의 앵커링 지급을 비례하여 나누어 받으며, 그 몫은 앵커링을 해제할 때 지급됩니다. 앵커링 해제는 언제든 할 수 있지만, 각 NFT는 한 번만 앵커링할 수 있으므로 해제하면 그 NFT의 앵커링 자격은 영구히 끝납니다. 앵커링된 Random Walk NFT는 앵커링 NFT 별빛 선정 자격을 얻으며, 선정된 앵커링 보유자는 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받습니다(ETH는 포함되지 않습니다).`,
    bullets: [
      '사이클마다 ETH가 쌓이고, 앵커링 해제 시 회수',
      '앵커링 해제는 언제든 가능, 각 NFT는 한 번만 앵커링',
      'Random Walk 앵커링은 별빛 선정에 포함',
      '잠금 기간도 페널티도 없음, 해제는 NFT마다 영구적',
    ],
    ctaLabel: '앱에서 앵커링하기',
  },

  publicGoods: {
    eyebrow: '공공재',
    heading: '모든 사이클의 7%가 이더리움 핵심 기여자에게 흘러갑니다.',
    body: '모든 퍼포먼스 사이클은 ETH 준비금의 7%를 Protocol Guild로 전달합니다. Protocol Guild는 170명이 넘는 이더리움 핵심 기여자를 위한 공동 자금 지원 메커니즘입니다. 프로토콜이 많이 쓰일수록 이더리움 자체가 의존하는 인프라로 더 많이 흘러갑니다.',
    disclaimerHeading: '면책 고지',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      '이는 공공재 주소(현재 Protocol Guild)로 ETH를 전달하는 것입니다. 미국 세법상의 자선 기부가 아니며, Cosmic Signature는 그 세무상 취급에 관해 어떤 진술도 하지 않습니다.',
    // lexicon-allow-end
    card: {
      label: '사이클 배분',
      description: '모든 퍼포먼스 사이클에서 이만큼이 Protocol Guild로 전달됩니다.',
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
    body: '우주 평의회는 프로토콜을 온체인에서 조율합니다. CST 보유자는 가중치를 자기 자신이나 다른 주소에 위임하고, 조율 제안을 제출하고, 찬성 또는 반대를 표현합니다. 찬성과 기권 가중치의 합이 CST 공급량의 3%에 이르면 조율 정족수가 충족됩니다. 제안 제출 기준: 100 CST.',
    columns: [
      {
        title: '조율 제안',
        body: '위임된 가중치가 100 CST 이상인 주소는 누구나 제안을 제출할 수 있습니다. 조율 지연은 2일, 조율 기간은 2주입니다.',
      },
      {
        title: '조율 가중치',
        body: '위임된 CST 하나가 가중치 한 단위입니다. 의사 표현은 암호학적 서명이며, 주식이나 지분 증서가 아닙니다.',
      },
      {
        title: '조율 정족수',
        body: '찬성이 반대를 넘고, 찬성과 기권 가중치의 합이 CST 총 공급량의 3%에 이르면 제안이 통과됩니다. 반대 가중치는 정족수에 포함되지 않습니다.',
      },
    ],
  },

  verifiability: {
    eyebrow: '검증 가능성',
    heading: '열려 있고, 검증되었고, 재현 가능합니다.',
    body: '누구나 시드로 시그니처를 다시 생성해 검증할 수 있습니다. 컨트랙트 검증, 정적 분석 노트, 보안 감사 현황은 보고서가 나오는 대로 앱을 통해 공개됩니다. 이 저장소의 프로젝트 소유 자료는 CC0 1.0으로 공개되며, 제3자 의존성, 글꼴, 에셋은 각자의 라이선스를 유지합니다.',
    pillars: [
      {
        title: 'CC0 1.0',
        body: '프로젝트 소유의 컨트랙트, 셰이더, 렌더링 파이프라인. 어떤 권리도 유보하지 않습니다. 제3자 자료는 제외됩니다.',
      },
      {
        title: '검증 현황',
        body: '앱은 공개 컨트랙트 주소, 소스 코드 자료, 검증 맥락, 보안 감사 및 보고서 현황을 연결하여, 누구나 공개된 내용을 살펴볼 수 있게 합니다.',
      },
      {
        title: '재현 가능한 아트',
        body: '생성된 프레임의 SHA-256 해시를 지속적 통합에서 검증합니다. 같은 시드 → 같은 결과물.',
      },
    ],
  },

  faq: {
    eyebrow: '자주 묻는 질문',
    heading: '분명하게 답해야 할 질문.',
    items: [
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: '이것은 복권이나 카지노, 도박 상품인가요?',
        answer:
          '아닙니다. Cosmic Signature는 절차적 온체인 아트 프로토콜입니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 사이클이 마감되면 프로토콜은 열 개가 넘는 경로로 배분을 실행합니다. 하우스도, 딜러도, 베팅도 없습니다. 배분은 끈기, 타이밍, 참여를 인정합니다. 유일하게 무작위성이 있는 배분 경로인 별빛 선정은 프로토콜 수준의 절차적 배분입니다.',
      },
      // lexicon-allow-end
      {
        question: '참여자로서 실제로 무엇을 하나요?',
        answer:
          '제스처를 남깁니다. 각 제스처는 ETH 또는 CST 트랜잭션으로, 사이클 마감 시각을 연장하고, 별빛 선정 자격을 기록하고, 동적 참여 CST를 각인할 수 있으며, 사이클의 시그니처를 빚어냅니다. Cosmic Signature NFT를 앵커링하면 앵커링 지급의 몫을 받을 수 있습니다. 100 CST 이상을 보유하면 우주 평의회를 통해 조율 제안을 제출할 수 있습니다.',
      },
      {
        question: '참여 CST의 양은 왜 달라지나요?',
        answer: `참여 CST 각인은 이전 제스처 이후 흐른 시간을 바탕으로 한 제곱근 공식을 사용합니다. 공백이 길수록 더 많은 CST가 각인되지만, 제곱근 공식이므로 증가 폭은 선형보다 완만합니다. 매우 빠르게 이어지는 제스처는 0 CST를 각인할 수도 있습니다. 앱은 제출 전에 현재 수량을 미리 보여 줍니다.`,
      },
      {
        question: 'ETH 제스처와 CST 제스처는 CST 보정 구간에 어떤 영향을 주나요?',
        answer: `CST 보정 구간은 온체인에 저장되며 제스처마다 바뀝니다. CST 제스처는 구간을 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘려 CST 제스처 비용이 더 천천히 내려가게 하고, ETH 제스처는 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄여 CST 제스처 비용이 더 빨리 내려가게 합니다.`,
      },
      {
        question: 'ETH 배분은 어디에서 나오나요?',
        answer:
          '참여자가 제스처를 남길수록 커지는 사이클 준비금에서 나옵니다. 사이클이 마감되면 약 절반은 다음 사이클의 누적 준비금으로 이월되고, 나머지는 온체인 매개변수에 따라 배분 경로(시그니처 배분, 시간의 전사, 앵커링 지급, 별빛 선정, 공공재)로 배분됩니다.',
      },
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: '이 중에 투자에 해당하는 것이 있나요?',
        answer:
          '없습니다. CST 토큰은 프로토콜 안에서 참여와 조율 가중치를 표현하며, 지분, 이익 공유, 배당, 투자 계약이 아닙니다. 참여자의 제스처에서 나온 ETH를 받는 팀 지갑은 없습니다. Cosmic Signature는 토큰 가격이나 향후 움직임에 관해 어떤 진술도 하지 않으며, 투자로서 참여를 권유하지 않습니다.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: '공공재란 정확히 무엇인가요?',
        answer:
          '각 사이클 ETH 준비금의 7%가 공공재 주소, 현재는 Protocol Guild로 전달됩니다. Protocol Guild는 170명이 넘는 이더리움 핵심 기여자를 위한 공동 자금 지원 메커니즘입니다. 이는 공공재 주소로 ETH를 전달하는 것으로, 미국 세법상의 자선 기부가 아니며, Cosmic Signature는 그 세무상 취급에 관해 어떤 진술도 하지 않습니다.',
      },
      // lexicon-allow-end
      {
        question: '이 아트는 기술적으로 무엇인가요?',
        answer:
          '각 Cosmic Signature NFT는 뉴턴 중력 삼체 시뮬레이션의 결정론적 렌더입니다. 온체인 시드가 4차 요시다 심플렉틱 적분기로 시뮬레이션한 후보 궤도 100,000개 가운데 하나를 고르고, 그 궤도를 OKLab 색 혼합과 함께 64개의 파장 구간으로 스펙트럼 렌더링합니다. 파이프라인은 CC0로 완전히 오픈 소스이며, 누구나 시드로 시그니처를 재현할 수 있습니다.',
      },
      {
        question: '포크해도 되나요?',
        answer:
          '됩니다. 프로젝트 소유의 컨트랙트, 셰이더, 렌더러, 홍보 페이지, 문서는 CC0 1.0으로 공개되며 어떤 권리도 유보하지 않습니다. 제3자 의존성, 글꼴, 에셋은 각자의 라이선스를 유지합니다. THIRD_PARTY_NOTICES.md를 참고해 주세요.',
      },
    ],
  },

  footer: {
    brandName: 'Cosmic Signature',
    logoAlt: 'Cosmic Signature',
    tagline: 'Arbitrum 위의 절차적 온체인 아트 프로토콜.',
    columns: {
      protocol: {
        heading: '프로토콜',
        links: {
          app: '앱 열기',
          about: '소개',
          learn: '학습 센터',
          quiz: '지식 퀴즈',
          'how-it-works': '문서',
          contracts: '컨트랙트',
          code: '소스 코드',
          audits: '보안 감사',
        },
      },
      ecosystem: {
        heading: '생태계',
        links: {
          marketplace: 'Axiom Zero 마켓플레이스',
          predictions: 'Chaos Zero 예측',
          uniswap: 'Uniswap에서 CST 거래',
          geckoterminal: 'GeckoTerminal에서 CST 풀 보기',
        },
      },
      community: {
        heading: '커뮤니티',
        links: {
          twitter: 'X / Twitter',
          discord: 'Discord',
          github: 'GitHub',
          'protocol-guild': 'Protocol Guild',
        },
      },
      legal: {
        heading: '법적 고지',
        links: {
          terms: '이용약관',
          privacy: '개인정보 처리방침',
          faq: '자주 묻는 질문',
        },
      },
    },
    copyright: '© {year} Cosmic Signature. 프로젝트 소유 자료: CC0 1.0.',
    colophon: 'CC0 1.0 · 공개 검증 가능 · 재현 가능한 아트',
  },

  notFound: {
    heading: '별 지도 밖입니다.',
    description: '이 좌표는 프로토콜 바깥으로 흘러갔습니다. 시그니처로 돌아가 주세요.',
    ctaLabel: '시그니처로 돌아가기',
  },
} satisfies LandingText;
