import { protocolFacts } from '@/content/protocol-facts';

import type { LearnText } from './structure';
import type { LearnSection } from './types';

/** Shared appendix sections attached to the end of every Korean article. */
const answerabilitySections: readonly LearnSection[] = [
  {
    heading: '핵심 개념',
    body: [
      'Cosmic Signature는 Arbitrum에서 운영되는 절차적 온체인 아트 프로토콜입니다. 퍼포먼스 사이클, 제스처, 결정론적 삼체 NFT 아트, CST, 앵커링, 공공재 배분이 서로 연결되어 있습니다.',
      '프로토콜 소개와 학습 자료는 cosmicsignature.com에서, 앱과 실시간 데이터는 app.cosmicsignature.com에서 확인할 수 있습니다. 각 페이지의 관련 링크를 통해 설명과 실제 기록을 함께 살펴보세요.',
    ],
  },
  {
    heading: '이 주제를 확인하는 방법',
    body: [
      '실시간 프로토콜 데이터, 검증된 컨트랙트 주소, 소스 코드 자료, 통계는 공식 앱 페이지에서 확인합니다. 컨트랙트 페이지는 프로토콜 설명을 Arbitrum 주소와 연결하고, 통계 페이지는 데이터 출처와 업데이트 시각을 표시합니다.',
      '비용이나 사이클 상태처럼 바뀌는 값은 앱에서 확인해 주세요. 작동 원리와 참여 조건은 학습 센터, 자주 묻는 질문, 이용약관, 보안, 보안 감사, 위험 고지에서 자세히 설명합니다.',
    ],
  },
  {
    heading: '함께 읽을 자료',
    body: [
      '이 문서와 함께 자주 묻는 질문, 컨트랙트, 소스 코드, 통계, 위험 고지를 살펴보면 작동 원리부터 현재 운영 상태까지 파악할 수 있습니다. 모두 지갑 연결 없이 읽을 수 있습니다.',
    ],
  },
  {
    heading: '지갑 연결 없이 살펴보기',
    body: [
      '이 문서는 지갑을 연결하지 않아도 읽을 수 있습니다. 관련 링크에서 각 개념의 설명과 공개된 프로토콜 기록을 확인할 수 있습니다.',
      '학습 자료로 기본 개념을 익힌 뒤, 앱에서 현재 사이클, 컨트랙트 주소, 통계를 살펴보세요. 참여 전에는 위험 고지도 확인해 주세요.',
    ],
  },
];

/** Korean learn copy, keyed by the skeleton in structure.ts. */
export const learnTextKo = {
  hub: {
    meta: {
      title: 'Cosmic Signature 알아보기 | 온체인 아트, 퍼포먼스 사이클, Arbitrum',
      description:
        'Cosmic Signature의 작동 원리를 알아봅니다. 퍼포먼스 사이클, 제스처, CST, 삼체 NFT 아트, Arbitrum 컨트랙트, 앵커링, 공공재, 위험 관련 안내를 다룹니다.',
    },
    eyebrow: 'Cosmic Signature 학습 센터',
    h1: 'Cosmic Signature 알아보기',
    intro:
      '제스처가 쌓여 하나의 작품이 되는 과정을 알아봅니다. 퍼포먼스 사이클부터 삼체 물리로 생성되는 NFT 아트까지, Cosmic Signature의 작동 원리를 차근차근 설명합니다.',
    breadcrumbs: {
      homeLabel: 'Cosmic Signature',
      learnLabel: '학습 센터',
    },
    quizCta: {
      heading: '퀴즈로 이해한 내용을 확인해 보세요',
      body: '백서를 바탕으로 만든 세 단계, 총 100문항입니다. 답마다 해당 규칙을 풀어 설명하고, 근거가 되는 백서 항목으로 안내합니다.',
      linkLabel: '퀴즈 풀기',
    },
  },
  articleUi: {
    eyebrow: 'Cosmic Signature 학습 센터',
    breadcrumbs: {
      ariaLabel: '탐색 경로',
      homeLabel: 'Cosmic Signature',
      learnLabel: '학습 센터',
    },
    lastUpdatedLabel: '최종 업데이트:',
    publisherLabel: '게시자: Cosmic Signature',
    relatedResourcesHeading: '관련 Cosmic Signature 자료',
  },
  articles: {
    'what-is-cosmic-signature': {
      title: 'Cosmic Signature란 무엇인가요? | Cosmic Signature',
      description:
        'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 퍼포먼스 사이클 동안 남긴 제스처가 결정론적 삼체 NFT 작품을 빚어냅니다.',
      h1: 'Cosmic Signature란 무엇인가요?',
      summary:
        'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 그 제스처는 온체인 데이터로 생성되는 결정론적 Cosmic Signature NFT 작품을 빚어냅니다.',
      sections: [
        {
          heading: '짧은 정의',
          body: [
            'Cosmic Signature는 공개 블록체인 참여, 결정론적 아트 생성, 프로토콜 배분을 하나로 묶습니다. 프로토콜은 이더리움 레이어 2 네트워크인 Arbitrum에서 운영되므로, 중요한 행위와 기록은 모두 온체인에서 확인할 수 있습니다.',
            '각 퍼포먼스 사이클은 제스처를 모읍니다. 사이클이 마감되면 최종 시그니처가 NFT 작품으로 각인되고, 사이클 준비금은 프로토콜이 정한 배분 경로로 배분됩니다. 현재 Protocol Guild로 향하는 공공재 배분도 그 가운데 하나입니다.',
          ],
        },
        {
          heading: '이름이 중요한 이유',
          body: [
            '시그니처(Signature)라는 단어는 한 사이클이 만들어 내는 최종 작품을 가리킵니다. 모든 제스처는 사이클의 맥락에 영향을 주고, 그 맥락은 결국 해당 시그니처를 둘러싼 프로토콜 역사의 일부가 됩니다.',
            'Cosmic Signature는 COSMIC 암 돌연변이 데이터베이스나 생물학의 COSMIC 돌연변이 시그니처와 아무 관련이 없습니다. 결정론적 삼체 NFT 아트에 집중하는 온체인 아트 프로토콜입니다.',
          ],
        },
        {
          heading: '이 프로토콜이 다른 이유',
          body: [
            'Cosmic Signature는 단순한 갤러리도, 단순한 스마트 컨트랙트 인터페이스도 아닙니다. 공개된 온체인 행위, 결정론적 시각 결과물, 배분 메커니즘이 서로 연결된 사이클 기반 프로토콜입니다. 한 사이클의 최종 시그니처가 의미를 갖는 이유는 비공개 각인 버튼이 아니라 함께 참여하는 공개 과정에서 나오기 때문입니다.',
            '퍼포먼스 사이클, 시그니처 작품, NFT, CST, 앵커링, 우주 평의회, 공공재 배분은 하나의 프로토콜 안에서 연결됩니다. 앱에서 각 기능을 살펴보고 Arbitrum에 기록된 내역을 확인할 수 있습니다.',
          ],
        },
        {
          heading: '공개 데이터를 읽는 방법',
          body: [
            '앱 호스트는 현재 사이클, 통계, 배분 수령자, 컨트랙트 주소, 갤러리 기록, 기여 내역 같은 실시간 상태를 보여 줍니다. 공개 프로토콜 데이터는 개인 계정 상태에 좌우되지 않아야 하므로, 이 페이지는 지갑을 연결하기 전에도 쓸모 있게 만들어졌습니다.',
            '소개 사이트에서는 기본 개념과 용어를, 앱에서는 현재 상태와 기록을 확인할 수 있습니다. Cosmic Signature는 생물학의 COSMIC 데이터베이스와는 별개의 온체인 아트 프로토콜입니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Cosmic Signature 앱 열기', '자주 묻는 질문 읽기', '프로토콜 통계 보기'],
    },
    'how-the-performance-cycle-works': {
      title: 'Cosmic Signature 퍼포먼스 사이클의 작동 원리 | Cosmic Signature',
      description:
        'Cosmic Signature 퍼포먼스 사이클이 Arbitrum에서 보정 구간, 제스처, 마감, 배분 경로를 어떻게 운용하는지 알아봅니다.',
      h1: 'Cosmic Signature 퍼포먼스 사이클의 작동 원리',
      summary:
        'Cosmic Signature 퍼포먼스 사이클은 제스처가 쌓이고, 시간 구조가 변하며, 최종 시그니처 배분이 온체인 규칙으로 정해지는 프로토콜의 시간 구간입니다.',
      sections: [
        {
          heading: '사이클 시작',
          body: [
            `사이클은 첫 제스처를 위한 ETH 보정 구간으로 시작합니다. CST 보정 구간은 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준값으로 출발한 뒤, 제스처가 들어올 때마다 온체인에서 변합니다.`,
            `첫 제스처가 사이클 마감 시각을 정하고 마감 카운트다운을 시작합니다. 이후의 제스처는 현재 시간 증가량을 더하고 현재 사이클 상태를 갱신합니다. ETH 제스처는 CST 보정 구간을 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄이고, CST 제스처는 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다.`,
          ],
        },
        {
          heading: '마감',
          body: [
            '사이클 마감 시각이 지나면 최종 제스처를 남긴 참여자가 사이클을 마감할 수 있습니다. 우선 마감 구간이 끝나면 누구나 마감할 수 있는 공개 마감이 열립니다.',
            '마감은 사이클 결과를 각인하고 프로토콜 역사를 갱신하며, 사이클 준비금을 시그니처 배분, 앵커링 지급, 별빛 선정, 공공재 배분 같은 배분 경로로 배분합니다.',
          ],
        },
        {
          heading: '사이클이 핵심 단위인 이유',
          body: [
            '퍼포먼스 사이클은 Cosmic Signature에 반복되는 공개 리듬을 부여합니다. 맥락 없이 고립된 행위가 아니라, 모든 제스처는 시작 상태, 변화하는 시간 구조, 현재 비용, 참여 내역, 마감 구간, 배분 결과를 갖춘 하나의 사이클에 속합니다.',
            '이 구조는 검증에 중요합니다. 독자는 진행 중인 사이클을 살펴본 뒤 나중에 다시 돌아와 마감된 배분 기록, 갤러리 결과물, 통계를 비교할 수 있습니다. 사이클 번호는 실시간 참여와 과거 기록을 잇는 다리가 됩니다.',
          ],
        },
        {
          heading: '사이클 동안 바뀌는 것',
          body: [
            '제스처 비용, 사이클 마감 시각, CST 참여, 공공재 회계, 선두 상황은 사이클이 진행되는 동안 모두 바뀔 수 있습니다. 이 변화는 프로토콜에 기록되고, 현재 사이클, 통계, 배분 수령자, 조율 변경 내역 같은 앱 페이지에 표시됩니다.',
            '사이클이 마감되면 프로토콜은 그 사이클을 실시간 상태가 아니라 역사로 다룹니다. 최종 시그니처, 수령자 기록, 배분 회수, 첨부된 NFT, 공공재 기여는 이후의 참여자가 살펴볼 수 있는 공개 아카이브의 일부가 됩니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        '현재 퍼포먼스 사이클 보기',
        '배분 내역 보기',
        '프로토콜 자주 묻는 질문 읽기',
      ],
    },
    'how-gestures-work': {
      title: 'Cosmic Signature에서 제스처가 작동하는 원리 | Cosmic Signature',
      description:
        'ETH 제스처, CST 제스처, 제스처 비용, 참여 CST, 그리고 제스처가 각 Cosmic Signature 퍼포먼스 사이클을 빚어내는 과정을 이해합니다.',
      h1: 'Cosmic Signature에서 제스처가 작동하는 원리',
      summary:
        '제스처는 Cosmic Signature의 온체인 참여 행위입니다. ETH 또는 CST로 남길 수 있으며, 모든 제스처는 진행 중인 퍼포먼스 사이클에 영향을 줍니다.',
      sections: [
        {
          heading: '제스처가 하는 일',
          body: [
            `모든 제스처는 진행 중인 사이클에 참여를 기록하고, 동적 참여 CST를 각인할 수 있으며, 사이클 마감 시각을 연장하고, 최종 시그니처를 둘러싼 역사적 맥락에 기여합니다. 참여 CST는 제곱근 공식을 사용합니다: ${protocolFacts.dynamicCstRewardFormula}.`,
            `제스처 비용은 사이클 동안 변합니다. ETH 제스처와 CST 제스처는 서로 관련되지만 별개인 메커니즘을 따르며, 그 안에는 비용 경로를 참여자에게 보여 주는 보정 구간이 있습니다. CST 제스처마다 CST 보정 구간이 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘어나고, ETH 제스처마다 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄어듭니다.`,
          ],
        },
        {
          heading: 'Random Walk NFT 첨부',
          body: [
            '참여자는 사용하지 않은 Random Walk NFT를 ETH 제스처에 첨부해 제스처 비용을 한 번 낮출 수 있습니다. Random Walk NFT를 앵커링하면 앵커링 NFT 별빛 선정 자격도 얻을 수 있습니다.',
            'NFT 첨부와 앵커링은 지갑을 연결한 뒤 앱에서 실행할 수 있습니다. 각 기능의 작동 원리는 지갑 연결 없이도 이 안내서에서 확인할 수 있습니다.',
          ],
        },
        {
          heading: '공개 신호로서의 제스처',
          body: [
            '제스처는 공개된 프로토콜 행위입니다. 참여자가 진행 중인 퍼포먼스 사이클과 상호작용했다는 사실을 기록하고, 결국 최종 시그니처를 둘러싸게 될 사이클의 맥락을 바꿉니다. 제스처는 ETH로도 CST로도 남길 수 있지만, 어느 쪽이든 사이클 활동의 공개 기록에 속합니다.',
            '제스처는 온체인에 남기 때문에 앱은 이를 단순한 UI 이벤트 이상으로 보여 줄 수 있습니다. 참여자 주소, 시각, CST 참여, 첨부된 토큰, 사이클 연장, 그리고 사이클이 어떻게 마무리되었는지 설명하는 이후의 배분 내역과 연결됩니다.',
          ],
        },
        {
          heading: 'ETH, CST, RandomWalk의 맥락',
          body: [
            'ETH 제스처와 CST 제스처는 관련되지만 서로 다른 역할을 맡습니다. ETH 제스처는 사이클 준비금에 기여하고, CST 제스처는 프로토콜 토큰으로 참여를 표현합니다. 앱은 두 흐름을 구분해 표시하므로, 참여자는 어떤 자산을 쓰는지, 그 자산이 현재 사이클에 어떤 영향을 주는지 이해할 수 있습니다.',
            'RandomWalk NFT 첨부는 공개 맥락에 층을 하나 더합니다. 사용하지 않은 RandomWalk NFT는 제스처 비용을 한 번 낮추기 위해 첨부할 수 있고, 사용된 RandomWalk NFT는 따로 목록에 표시되므로 참여 순간이 지난 뒤에도 공개 기록을 이해할 수 있습니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        '앱에서 제스처 남기기 또는 살펴보기',
        '퍼포먼스 사이클 알아보기',
        '현재 사이클 데이터 보기',
      ],
    },
    'three-body-nft-art': {
      title: 'Cosmic Signature가 삼체 NFT 아트를 생성하는 원리 | Cosmic Signature',
      description:
        '온체인 시드와 삼체 물리로 생성되는 결정론적 Cosmic Signature NFT 작품을 기술적으로 설명합니다.',
      h1: 'Cosmic Signature가 삼체 NFT 아트를 생성하는 원리',
      summary:
        'Cosmic Signature NFT는 온체인 시드와 재현 가능한 삼체 물리 렌더링 파이프라인으로 생성되는 결정론적 작품입니다.',
      sections: [
        {
          heading: '온체인 시드에서 결정론적 렌더까지',
          body: [
            '각 Cosmic Signature NFT는 작품을 재현할 수 있는 시드를 저장합니다. 렌더링 파이프라인은 결정론적 입력만 사용하므로, 같은 시드는 언제나 같은 시그니처 결과물을 만들어 냅니다.',
            '아트 생성 과정은 뉴턴 중력 아래 움직이는 세 천체를 시뮬레이션합니다. 카오스적인 궤적은 스펙트럼 빛깔의 궤도 자취가 되어, 누구나 알아볼 수 있는 프로토콜의 시각적 정체성을 만듭니다.',
          ],
        },
        {
          heading: '개방성과 재현 가능성',
          body: [
            '프로토콜은 재현 가능성을 강조합니다. 소스 코드와 렌더링 파이프라인은 각 시그니처를 시드만으로 독립적으로 검증할 수 있도록 만들어졌습니다.',
            '작품은 CC0로 공개되므로, 시각적 결과물과 기술적 작업 모두 퍼블릭 도메인에 준하는 지위를 갖습니다.',
          ],
        },
        {
          heading: '아트에서 결정론이 중요한 이유',
          body: [
            '삼체 시스템은 Cosmic Signature에 운동, 중력, 불안정한 궤적에 바탕을 둔 시각 언어를 부여합니다. 결정론이 중요한 이유는 작품이 불투명한 호스팅 렌더러에 의존하지 않고 공개된 입력만으로 재현되어야 하기 때문입니다.',
            '수집가, 개발자, 연구자는 공개된 시드와 렌더링 코드로 작품을 재현해 결과를 확인할 수 있습니다. 소스 코드, 갤러리, 토큰 상세, 컨트랙트 페이지에 필요한 자료가 정리되어 있습니다.',
          ],
        },
        {
          heading: '사이클 역사에서 시각적 정체성으로',
          body: [
            '최종 시그니처는 무작위 장식이 아닙니다. 퍼포먼스 사이클의 시각적 종착점이며, 사이클 역사가 이미지에 문화적 맥락과 프로토콜 맥락을 부여합니다. 작품은 완료된 공개 과정을 눈으로 확인할 수 있는 표지가 됩니다.',
            '작품은 프로토콜의 일부입니다. 갤러리와 토큰 상세 페이지에서 작품을 감상하고, 해당 사이클과 생성 시드, 공개 메타데이터를 함께 살펴볼 수 있습니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Cosmic Signature 갤러리 둘러보기',
        '소스 코드 살펴보기',
        '컨트랙트 및 검증 안내 읽기',
      ],
    },
    'cosmic-signature-on-arbitrum': {
      title: 'Arbitrum 위의 Cosmic Signature | Cosmic Signature',
      description:
        'Cosmic Signature가 Arbitrum에서 운영되는 이유와 프로토콜이 온체인 아트를 위해 이더리움 레이어 2 인프라를 활용하는 방식을 설명합니다.',
      h1: 'Arbitrum 위의 Cosmic Signature',
      summary:
        'Cosmic Signature는 제스처, 사이클, NFT 기록, 배분을 이더리움 레이어 2 네트워크에서 처리하기 위해 Arbitrum에서 운영됩니다.',
      sections: [
        {
          heading: 'Arbitrum을 선택한 이유',
          body: [
            'Arbitrum은 이더리움 보안에 기대면서도 실행 비용을 낮춰 줍니다. 참여자가 제스처를 반복해서 남기고 공개 상태를 살펴보는 프로토콜에는 중요한 조건입니다.',
            '앱의 컨트랙트, 통계, 갤러리 페이지는 Arbitrum에 기록된 활동을 보여 줍니다. 각 기록의 링크에서 원본 트랜잭션을 확인할 수 있습니다.',
          ],
        },
        {
          heading: '체인 맥락을 드러내는 이유',
          body: [
            'Cosmic Signature는 앱 전반에서 Arbitrum을 명시합니다. 체인 맥락이 프로토콜 정체성의 일부이기 때문입니다. 제스처, 사이클 기록, 컨트랙트 주소, CST, NFT 소유권, 배분 회수를 독립적으로 확인하려면 모두 구체적인 네트워크 참조가 필요합니다.',
            '컨트랙트와 통계 페이지에서 이 안내서의 설명을 실제 기록과 대조할 수 있습니다. 개념을 익힌 뒤 주소, 트랜잭션, 현재 상태를 직접 확인해 보세요.',
          ],
        },
        {
          heading: '앱 페이지가 Arbitrum 기록과 연결되는 방식',
          body: [
            '앱 페이지는 원시 체인 기록과 API 기록을 읽기 쉬운 프로토콜 언어로 옮깁니다. 배분 페이지는 수령자와 사이클 결과를, 앵커링 페이지는 토큰의 앵커링 상태를, 공공재 페이지는 기여와 회수 흐름을, 갤러리는 토큰 결과물을 설명합니다.',
            '공개 페이지는 지갑 없이도 열람할 수 있습니다. 참여하기 전에 Arbitrum에서 어떤 활동이 이루어지는지, 컨트랙트가 어떻게 작동하는지 살펴보세요.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['검증된 컨트랙트 보기', '프로토콜 통계 보기'],
    },
    'contracts-security-verification': {
      title: 'Cosmic Signature 컨트랙트, 보안, 검증 | Cosmic Signature',
      description:
        'Arbitrum 프로토콜인 Cosmic Signature의 스마트 컨트랙트, 소스 코드, 검증, 보안 맥락을 확인합니다.',
      h1: 'Cosmic Signature 컨트랙트, 보안, 검증',
      summary:
        'Cosmic Signature는 참여자가 프로토콜 메커니즘을 살펴보고 온체인 동작을 검증할 수 있도록 컨트랙트와 소스 코드 정보를 공개합니다.',
      sections: [
        {
          heading: '공개 컨트랙트 맥락',
          body: [
            '컨트랙트 페이지에는 공식 주소, 검증 링크, 배포 정보, 자금 흐름이 정리되어 있습니다.',
            '지갑 연결 전에 공개된 설명과 자료를 읽고, 필요하면 블록 탐색기에서 컨트랙트와 트랜잭션을 확인할 수 있습니다.',
          ],
        },
        {
          heading: '검증 자료',
          body: [
            '검증은 여러 공개 지면에 나뉘어 있습니다. 컨트랙트 페이지는 배포 주소와 탐색기 링크를 나열하고, 소스 코드 페이지는 결정론적 렌더링 자료를 설명하며, 보안 감사 페이지는 검토 현황을 밝히고, 보안 페이지는 사용자가 공식 자료를 확인하는 방법을 안내합니다.',
            '이 페이지는 함께 읽어야 합니다. 맥락 없는 컨트랙트 주소는 해석하기 어렵고, 링크 없는 보안 주장은 검증하기 어렵습니다. 그래서 Cosmic Signature는 주소, 소스 참조, 위험 문구, 보안 감사 현황을 내부 링크로 연결해 둡니다.',
          ],
        },
        {
          heading: '먼저 확인할 것',
          body: [
            '공식 앱 호스트의 컨트랙트 페이지에서 시작해 Arbitrum 네트워크인지 확인합니다. 그다음 소스 코드 링크, 보안 개요, 보안 감사 페이지를 비교합니다. 보안 감사와 정형 검증은 보고서 공개 여부와 실제 검증 범위도 함께 확인해 주세요.',
            '이런 보수적인 접근은 의도된 것입니다. 신뢰 페이지는 배포된 사실, 공개된 보고서, 정적 분석, 커뮤니티 검토, 향후 작업을 근거 없는 하나의 주장으로 뭉뚱그리지 않고 구분할 때 가장 쓸모가 있습니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['컨트랙트 주소 열기', '소스 코드 자료 열기', '자주 묻는 질문 읽기'],
    },
    'cst-token-and-cosmic-council': {
      title: 'CST와 우주 평의회 | Cosmic Signature',
      description: 'CST 토큰이 제스처, 프로토콜 조율, 우주 평의회와 어떻게 연결되는지 알아봅니다.',
      h1: 'CST와 우주 평의회',
      summary:
        'CST는 참여를 통해 각인되는 Cosmic Signature의 ERC-20 토큰이며, 우주 평의회를 통한 프로토콜 조율에 사용됩니다.',
      sections: [
        {
          heading: '프로토콜 안의 CST',
          body: [
            '제스처는 참여 CST를 각인할 수 있고, CST는 자체 보정 구간을 통해 또 하나의 제스처 수단으로도 쓸 수 있습니다. 제스처에 쓰인 CST는 풀에 모이지 않고 소각되어 공급량에서 영구히 제거됩니다.',
            '참여 CST의 양은 동적입니다. 이전 제스처 이후 흐른 시간에 따라 제곱근 공식으로 정해지므로, 오랜 공백 뒤에는 더 많은 CST가 각인되고 빠르게 이어지는 제스처는 0 CST를 각인할 수도 있습니다.',
            'CST는 위임된 뒤(보유자는 자기 자신에게 위임할 수 있습니다) 우주 평의회에서 조율 가중치를 표현하며, 참여자는 그곳에서 온체인 규칙에 따라 프로토콜 변경을 조율합니다.',
          ],
        },
        {
          heading: '프로토콜 맥락으로서의 CST',
          body: [
            'CST는 Cosmic Signature의 참여 및 조율 계층에 속합니다. 제스처로 각인할 수 있고, CST 제스처에 쓸 수 있으며, 우주 평의회에서 조율 가중치를 표현하는 데 쓸 수 있습니다. 그래서 CST는 지분 청구권이 아니라 프로토콜 토큰입니다.',
            '앱에서 제스처 사용, 조율 가중치, 공급량 등 CST의 역할을 확인할 수 있습니다. 이는 프로토콜 내 기능에 관한 설명이며, 가격 변화를 예측하는 정보는 아닙니다.',
          ],
        },
        {
          heading: '조율 기록',
          body: [
            '우주 평의회는 CST 보유자에게 온체인 규칙에 따라 프로토콜 변경을 조율하는 방법을 제공합니다. 조율 변경 내역과 관련 앱 페이지는 매개변수 변경의 역사를 드러내어, 독자가 프로토콜이 어떻게 진화하는지 이해할 수 있게 합니다.',
            '우주 평의회는 프로토콜 변경을 조율하는 기구입니다. 그 역할과 별개로, 참여에 적용되는 법적 조건과 위험은 이용약관과 위험 고지에서 확인해 주세요.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['제스처의 작동 원리 읽기', '앱 열기'],
    },
    'anchoring-nfts': {
      title: 'Cosmic Signature NFT 앵커링 | Cosmic Signature',
      description:
        'Cosmic Signature NFT의 앵커링, ETH 앵커링 지급, Random Walk NFT의 별빛 선정 자격이 어떻게 작동하는지 설명합니다.',
      h1: 'Cosmic Signature NFT 앵커링',
      summary:
        '앵커링은 NFT를 프로토콜과 다시 연결합니다. Cosmic Signature NFT는 ETH 앵커링 지급을 받고, RandomWalk NFT는 앵커링 NFT 별빛 선정의 대상이 됩니다.',
      sections: [
        {
          heading: '앵커링 지급',
          body: [
            'Cosmic Signature NFT는 프로토콜에 앵커링할 수 있습니다. 앵커링된 Cosmic Signature NFT는 프로토콜 규칙에 따라 한 사이클의 ETH 앵커링 지급을 나누어 받으며, 쌓인 ETH는 앵커링을 해제할 때 회수됩니다.',
            'Random Walk NFT의 앵커링은 앵커링 NFT 별빛 선정 자격을 얻기 위한 별도의 역할이며, ETH 앵커링 지급은 받지 않습니다.',
            'Cosmic Signature든 Random Walk든, 각 NFT는 한 번만 앵커링할 수 있습니다. 앵커링을 해제하면 NFT와 쌓인 지급액이 돌아오지만, 그 NFT는 다시는 앵커링할 수 없습니다.',
          ],
        },
        {
          heading: '앵커링이 공개하는 것',
          body: [
            '앵커링은 각인되거나 취득된 NFT를 프로토콜과 다시 연결합니다. 공개 앵커링 페이지는 앵커링 및 해제 작업, 앵커링된 토큰 수, 지급 기록, 관련 RandomWalk NFT 활동을 보여 줍니다.',
            '앵커링 내역은 공개되어 있어 지갑을 연결하지 않아도 살펴볼 수 있습니다. 어떤 토큰이 앵커링되었는지, 언제 해제되었는지, 얼마가 지급되었는지 확인할 수 있습니다.',
          ],
        },
        {
          heading: 'Cosmic Signature와 RandomWalk의 역할',
          body: [
            'Cosmic Signature NFT와 RandomWalk NFT는 앵커링 맥락이 서로 다릅니다. Cosmic Signature NFT는 ETH 앵커링 지급과 연결되고, RandomWalk NFT는 상태에 따라 선정 자격 및 일회성 ETH 제스처 비용 할인과 연결됩니다.',
            '앵커링 전에 NFT 종류와 사용 이력을 확인해 주세요. 통계, 갤러리, 현재 사이클 페이지에서 각 NFT의 상태와 역할을 비교할 수 있습니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['앵커링 도구 열기', '갤러리 둘러보기'],
    },
    'protocol-guild-public-goods': {
      title: 'Cosmic Signature와 이더리움 공공재 | Cosmic Signature',
      description:
        'Cosmic Signature가 이더리움 핵심 기여자를 위한 자금 지원 메커니즘인 Protocol Guild로 공공재 배분을 전달하는 방식을 설명합니다.',
      h1: 'Cosmic Signature와 이더리움 공공재',
      summary:
        'Cosmic Signature에는 공공재 배분 경로가 있으며, 현재 각 사이클 준비금의 일부를 Protocol Guild로 전달합니다.',
      sections: [
        {
          heading: 'Protocol Guild 배분',
          body: [
            'Protocol Guild는 170명이 넘는 이더리움 핵심 기여자를 위한 자금 지원 메커니즘입니다. Cosmic Signature는 현재 공공재 배분을 Protocol Guild로 전달합니다.',
            '공공재 배분은 프로토콜 설계에 포함된 정규 배분 경로입니다. 앱에서 사이클별 배분과 Protocol Guild로 전달된 내역을 확인할 수 있습니다.',
          ],
        },
        {
          heading: '공공재가 프로토콜의 일부인 이유',
          body: [
            '공공재 전달은 이따금 내놓는 홍보 문구가 아니라 프로토콜 수준의 배분 경로입니다. 사이클 준비금의 일부는 앱에 표시된 규칙에 따라 공공재 수령처, 현재는 Protocol Guild로 향합니다.',
            '공공재 페이지에는 기여와 회수 기록, 수령처 정보가 정리되어 있습니다. 사이클 참여가 이더리움 생태계 지원으로 이어지는 과정을 확인할 수 있습니다.',
          ],
        },
        {
          heading: '공공재 흐름을 확인하는 방법',
          body: [
            '적립된 금액은 공공재 기여 페이지에서, 금고에서 전달된 자금은 회수 페이지에서 확인합니다. 주소는 컨트랙트 페이지에서, 집계 맥락은 통계 페이지에서 확인합니다.',
            '공공재로 전달된 자금은 공개 기록에서 확인할 수 있습니다. 이 기록만으로 특정 세무상 취급이나 특별한 법적 지위가 인정되는 것은 아닙니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['공공재 기여 기록 보기', '사이클의 작동 원리 알아보기'],
    },
    'collecting-and-trading-cosmic-signature': {
      title: 'Cosmic Signature NFT와 CST의 수집과 거래 | Cosmic Signature',
      description:
        'Cosmic Signature 자산이 거래되는 곳: 수수료 없는 Axiom Zero NFT 마켓플레이스, Arbitrum의 Uniswap CST 교환, 사이클을 다루는 Chaos Zero 예측 시장.',
      h1: 'Cosmic Signature의 수집과 거래',
      summary:
        'Cosmic Signature NFT는 Arbitrum 위의 공정 출시 제너러티브 아트를 위한 수수료 없는 마켓플레이스 Axiom Zero에서 거래됩니다. CST는 Uniswap에서 거래되며, Chaos Zero는 각 퍼포먼스 사이클을 두고 예측 시장을 운영합니다.',
      sections: [
        {
          heading: '자산이 거래되는 곳',
          body: [
            'Cosmic Signature NFT는 Arbitrum 위의 표준 ERC-721 토큰이며, 주요 마켓플레이스는 Axiom Zero입니다. Axiom Zero는 공정 출시 제너러티브 아트를 위해 만들어진 곳으로, 플랫폼 수수료가 없고, 등록과 판매가 단일 트랜잭션으로 온체인에서 직접 체결되며, 판매자는 판매 금액 전부를 받습니다. 이 마켓플레이스는 Axiom Zero의 두 컬렉션인 Cosmic Signature와 Random Walk를 모두 다루며, 표시하는 모든 가격을 검증된 마켓플레이스 컨트랙트에서 직접 읽어 옵니다.',
            'CST는 표준 ERC-20 토큰이며 Arbitrum의 Uniswap에서 거래됩니다. 두 자산 모두 개방형 토큰 표준을 따르므로 ERC-721 또는 ERC-20을 지원하는 Arbitrum의 어떤 마켓플레이스나 거래소도 다룰 수 있습니다. 거래 전에는 항상 공식 컨트랙트 페이지에서 컨트랙트 주소를 확인해 주세요.',
          ],
        },
        {
          heading: 'Chaos Zero 예측 시장',
          body: [
            'Chaos Zero는 Cosmic Signature를 위해 특별히 만들어진 예측 시장입니다. 퍼포먼스 사이클마다 한 가지 질문을 엽니다: “이번 사이클은 이전 사이클보다 더 많은 제스처로 마감될 것인가?” 포지션은 CST로 표시되며 구조상 완전히 담보됩니다. CST 1개는 언제나 YES 토큰 1개와 NO 토큰 1개로 바뀌고, 짝을 이룬 한 쌍은 언제나 CST 1개로 되돌릴 수 있습니다.',
            '시장은 공개된 온체인 제스처 수로 결정됩니다. 제스처 수가 이전 사이클의 합계를 넘는 순간 결과가 확정되고, 같은 블록에서 거래가 멈추며, 시장은 회수만 가능한 상태가 됩니다. Chaos Zero에는 소유자도, 관리자 키도, 업그레이드 경로도 없습니다.',
          ],
        },
        {
          heading: '앵커링 상태와 수집가 맥락',
          body: [
            '앵커링은 Cosmic Signature와 Random Walk NFT에 작품 자체 외에 시장에서 의미 있는 두 번째 특징을 부여합니다. 모든 NFT는 영구적으로 단 한 번만 프로토콜에 앵커링할 수 있고, 앵커링을 해제하면 그 자격은 영원히 사라집니다. 따라서 한 번도 앵커링되지 않은 토큰은 다음 소유자를 위해 일회성 앵커링 선택지를 열어 둔 셈이며, 수집가가 이 상태를 중시하는 이유도 여기에 있습니다.',
            'Axiom Zero는 앵커링 컨트랙트에서 앵커링 상태를 실시간으로 읽어 모든 토큰에 ‘앵커링 이력 없음’ 또는 ‘앵커링됨’ 표시를 붙이며, 각 컬렉션은 이 상태로 필터링할 수 있습니다. 덕분에 마켓플레이스의 토큰 설명이 앱이 표시하는 온체인 앵커링 기록과 일치합니다.',
          ],
        },
        {
          heading: '거래 장소와 주소를 확인하는 방법',
          body: [
            '거래 전에 앱 호스트의 컨트랙트 페이지에서 공식 컨트랙트 주소를 확인하고, 마켓플레이스나 거래소에서 보고 있는 컬렉션 또는 토큰 페어와 비교합니다. Cosmic Signature는 생태계 거래 장소인 Axiom Zero, Chaos Zero, Uniswap으로 가는 링크를 앱 헤더, 푸터, 사이트맵에 두어, 올바른 목적지로 가는 공식 경로가 항상 존재하도록 합니다.',
            '같은 주의는 CST 교환과 예측 포지션에도 적용됩니다. 토큰 주소가 공개된 CST 컨트랙트와 일치하는지 확인하고, Chaos Zero 포지션은 프로토콜이 기록한 공개 제스처 수로 결정되므로 시장의 모든 입력값을 Arbitrum에서 독립적으로 살펴볼 수 있다는 점을 기억해 주세요.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Axiom Zero에서 Cosmic Signature 둘러보기',
        'Chaos Zero에서 예측하기',
        'Uniswap에서 ETH를 CST로 교환하기',
        '컨트랙트 주소 확인',
        'NFT 갤러리 둘러보기',
      ],
    },
    // lexicon-allow-start: explicit denial language for crawler and compliance clarity.
    'not-a-lottery-not-an-investment': {
      title: 'Cosmic Signature는 복권이나 카지노, 투자 상품인가요? | Cosmic Signature',
      description:
        'Cosmic Signature는 절차적 온체인 아트 프로토콜이며, 복권도, 카지노도, 도박 상품도, 투자 상품도 아닙니다.',
      h1: 'Cosmic Signature는 복권이나 카지노, 투자 상품인가요?',
      summary:
        'Cosmic Signature는 절차적 온체인 아트 프로토콜입니다. 복권도, 카지노도, 도박 상품도, 투자 상품도 아닙니다.',
      sections: [
        {
          heading: '쉬운 말로 풀어 쓴 설명',
          body: [
            '참여자는 퍼포먼스 사이클 동안 제스처를 남깁니다. 사이클이 마감되면 프로토콜은 정해진 경로로 배분을 실행합니다. 하우스도, 딜러도, 베팅도 없습니다.',
            'CST는 프로토콜 안에서 참여와 조율 가중치를 표현합니다. 지분도, 이익 공유도, 배당도, 투자 계약도 아닙니다. Cosmic Signature는 토큰 가격이나 향후 시장 움직임에 관해 어떤 진술도 하지 않습니다.',
          ],
        },
        {
          heading: '부인을 명시하는 이유',
          body: [
            '프로토콜의 배분을 도박이나 투자 상품과 혼동하지 않도록 개념을 명확히 설명합니다. Cosmic Signature는 참여와 온체인 기록을 바탕으로 작동하는 아트 프로토콜입니다.',
            '기준점은 여전히 긍정적인 정의입니다: Cosmic Signature는 절차적 온체인 아트 프로토콜입니다. 참여자는 제스처를 남기고, 사이클은 마감되고, 결정론적 작품이 각인되고, 배분은 공개된 프로토콜 규칙을 따릅니다.',
          ],
        },
        {
          heading: '배분 표현을 읽는 방법',
          body: [
            '배분 표현은 사이클이 마감된 뒤 프로토콜이 수행하는 배분을 설명합니다. 이익 공유, 배당 권리, 지분, 약속된 금전적 수익을 설명하는 것이 아닙니다. 참여 전에 위험 고지와 이용약관을 읽어야 합니다.',
            '지갑을 연결하기 전에 안내서를 읽고, 프로토콜의 개념과 참여 조건을 확인할 수 있습니다.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['이용약관 읽기', '자주 묻는 질문 읽기'],
    },
    // lexicon-allow-end
  },
} satisfies LearnText;
