import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentKo = {
  metadata: {
    title: 'Cosmic Signature 소개 | Arbitrum 위의 온체인 아트',
    description:
      'Cosmic Signature는 퍼포먼스 사이클의 제스처를 결정론적 삼체 NFT 아트로 바꾸는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다.',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'Cosmic Signature 소개',
    description:
      'Cosmic Signature는 퍼포먼스 사이클의 제스처에서 결정론적 삼체 NFT 아트를 생성하는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다.',
  },
  breadcrumbLabel: '소개',
  eyebrow: 'Cosmic Signature 소개',
  heading: '시드에서 시그니처까지, 누구나 재현할 수 있는 아트',
  body: {
    lede: 'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 퍼포먼스 사이클마다 참여자는 ETH 또는 CST로 제스처를 남기고, 모든 제스처가 최종 시그니처를 함께 빚어냅니다. 시그니처는 온체인 데이터에서 생성되어 삼체 물리 시뮬레이션으로 렌더링되는 결정론적 NFT 작품입니다.',
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature는 투자 상품으로 제공되지 않습니다. 프로토콜은 참여, 제스처, 배분, 앵커링, 공공재 전달을 설명할 뿐, 토큰 가격의 움직임이나 금전적 결과를 약속하지 않습니다.',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: '라이선스',
    license: 'CC0 작품과 코드',
    networkLabel: '네트워크',
    network: 'Arbitrum One',
    publicGoodsLabel: '공공재',
    publicGoodsTemplate: '사이클 준비금의 {percent}',
  },
  origin: {
    heading: '시작',
    paragraphs: [
      `Cosmic Signature는 백서의 저자이기도 한 ${WHITE_PAPER_SHARED.authorName} 님이 설계했습니다. 이 프로토콜은 두 가지 확신에서 출발했습니다. 하나는 제너러티브 아트가 가장 흥미로운 때는 그 안에 임의적인 것이 전혀 없을 때, 즉 모든 이미지가 물리 과정의 결과이고 누구나 같은 시드로 그 과정을 다시 실행할 수 있을 때라는 것입니다. 다른 하나는 참여자를 대신해 ETH를 보관하는 프로토콜이라면 모든 wei가 어디로 가는지 분명히 답해야 한다는 것입니다.`,
      '소유자는 컨트랙트의 조건 아래 매개변수와 구현을 바꿀 권한을 유지합니다. 핵심 변경은 사이클이 비활성일 때로 제한되지만 활성화 시각, 다음 지연 시간, 주변 컨트랙트에는 별도 권한이 있습니다. V3가 우주 평의회에 제어권을 자동 이전하거나 소유자 권한을 자동 해제하지는 않습니다.',
    ],
  },
  milestones: {
    heading: '출시에서 이양까지',
    items: {
      v1: {
        label: 'V1',
        status: '출시',
        text: '업그레이드 가능한 프록시 뒤에서 프로토콜이 Arbitrum One에 출시되었습니다. 사이클, 제스처, 배분 경로, 앵커링, 우주 평의회, 아트 파이프라인이 포함됩니다.',
      },
      v2: {
        label: 'V2',
        status: '과거 버전',
        text: 'V2는 과거 버전이며 현재는 V3로 교체되었습니다.',
      },
      v3: {
        label: 'V3',
        status: '배포 완료',
        text: 'V3는 이미 배포되었습니다. 참여 CST의 공식과 수령자, 참여자 ETH 및 NFT 별빛 선정의 가중치, CST 비용 하락 속도, ETH 비율, 시그니처 배분 NFT 수를 바꾸고 늦은 제스처 할증을 추가합니다.',
      },
      handover: {
        label: '이후',
        status: '자동 실행되지 않음',
        text: '소유자는 컨트랙트의 조건 아래 매개변수와 구현을 바꿀 권한을 유지합니다. 핵심 변경은 사이클이 비활성일 때로 제한되지만 활성화 시각, 다음 지연 시간, 주변 컨트랙트에는 별도 권한이 있습니다. V3가 우주 평의회에 제어권을 자동 이전하거나 소유자 권한을 자동 해제하지는 않습니다.',
      },
    },
  },
  clarificationsHeading: '분명히 해 둘 점',
  officialResources: {
    heading: '공식 자료',
    links: [
      { id: 'app', label: 'Cosmic Signature 앱', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Arbitrum 컨트랙트',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '소스 코드', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
