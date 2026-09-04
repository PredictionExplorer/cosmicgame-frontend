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
  eyebrow: '프로토콜 소개',
  heading: 'Cosmic Signature 소개',
  body: {
    paragraphs: [
      'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 퍼포먼스 사이클마다 참여자는 ETH 또는 CST로 제스처를 남기고, 모든 제스처가 최종 시그니처를 함께 빚어냅니다. 시그니처는 온체인 데이터에서 생성되어 삼체 물리 시뮬레이션으로 렌더링되는 결정론적 NFT 작품입니다.',
      '프로토콜은 누구나 검증할 수 있는 공개 메커니즘을 중심으로 설계되었습니다. Arbitrum 스마트 컨트랙트가 제스처, 사이클, 배분 경로, CST, 앵커링, NFT 각인을 기록합니다. 작품은 시드에서 재현 가능하며, 프로젝트는 오픈 소스 코드, CC0 아트, 공공재 지원을 중시합니다.',
      'Cosmic Signature는 COSMIC 암 돌연변이 데이터베이스나 생물학의 COSMIC 돌연변이 시그니처와 관련이 없습니다. 온체인 아트 프로토콜이자 앱입니다.',
    ],
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature는 투자 상품으로 제공되지 않습니다. 프로토콜은 참여, 제스처, 배분, 앵커링, 공공재 전달을 설명할 뿐, 토큰 가격의 움직임이나 금전적 결과를 약속하지 않습니다.',
    // lexicon-allow-end
  },
  officialResources: {
    heading: '공식 자료',
    links: [
      { id: 'app', label: 'Cosmic Signature 앱', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: '검증된 Arbitrum 컨트랙트',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '소스 코드', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: '자주 묻는 질문', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: '이용약관', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: '개인정보 처리방침', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
