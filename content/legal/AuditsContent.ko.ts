import type { TrustPageCopy } from './TrustPageContent';

/** Korean copy for /audits, rendered by TrustPageContent. */
export const auditsCopyKo: TrustPageCopy = {
  eyebrow: '보안 감사와 검증',
  title: 'Cosmic Signature 보안 감사',
  intro:
    'Cosmic Signature는 컨트랙트 검토 맥락을 크롤링 가능한 형태로 공개하여, 참여자, 연구자, 검색 엔진, AI 시스템이 프로토콜이 어떻게 검증되었고 공개 구현을 어디에서 살펴볼 수 있는지 알 수 있게 합니다.',
  sections: [
    {
      heading: 'Hacken의 독립 보안 감사',
      paragraphs: [
        'Hacken은 2025년 말 Cosmic Signature 스마트 컨트랙트의 독립 보안 검토를 수행했습니다. 검토는 공개 저장소의 운영 컨트랙트를 대상으로 하여, 각 사이클을 운영하는 핵심 프로토콜부터 CST 토큰, 두 NFT 컬렉션, 앵커링 지갑, 그리고 이를 지원하는 지갑 및 시스템 관리 컨트랙트까지 아울렀습니다. Hacken은 2026년 1월에 최종 보고서를 공개했습니다.',
        '보고서에는 23건의 발견 사항이 실려 있으며, 심각도가 치명 또는 높음인 항목은 없습니다. 중간 3건, 낮음 8건, 정보성 관찰 12건입니다. 대부분은 팀이 검토하고 수용한 설계상의 절충을 설명한 것이며, 보고서는 각 발견 사항을 그 상태와 함께 설명합니다.',
        '수동 검토와 함께 Hacken은 시스템 불변 조건 14개를 대상으로 퍼즈 테스트를 실행했습니다. 불변 조건이란 예컨대 프로토콜이 보유한 ETH가 항상 적립된 금액에서 회수된 금액을 뺀 값과 같아야 한다는 성질입니다. 14개 모두 10,000회 실행에서 유지되었습니다.',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: 'Hacken 보안 감사 보고서 전문 읽기',
      },
      note: '최종 검토: 2026년 8월 24일. 이 페이지는 Cosmic Signature의 보안 감사 및 검증 현황을 확인할 수 있는 공식 공개 페이지입니다.',
    },
    {
      heading: '검증 체크리스트',
      bullets: [
        '공식 컨트랙트 페이지에서 컨트랙트 주소를 확인해 주세요.',
        'Arbitrum 블록 탐색기에서 검증된 소스 코드와 ABI 데이터를 비교해 주세요.',
        'Hacken 보안 감사 보고서에서 전체 발견 사항과 그 상태를 확인해 주세요.',
        '앱에 표시되는 메커니즘이 공개된 컨트랙트 동작과 일치하는지 확인해 주세요.',
      ],
    },
    {
      heading: '관련 신뢰 자료',
      links: [
        { kind: 'app', href: '/contracts', label: '검증된 Arbitrum 컨트랙트 주소' },
        { kind: 'app', href: '/code', label: '소스 코드와 결정론적 렌더링 자료' },
        { kind: 'app', href: '/security', label: '보안 개요' },
      ],
    },
  ],
};
