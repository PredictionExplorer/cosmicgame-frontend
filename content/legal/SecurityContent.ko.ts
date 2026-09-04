import type { TrustPageCopy } from './TrustPageContent';

/** Korean copy for /security, rendered by TrustPageContent. */
export const securityCopyKo: TrustPageCopy = {
  eyebrow: '신뢰와 보안',
  title: 'Cosmic Signature 보안',
  intro:
    'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 공개된 스마트 컨트랙트와 투명한 프로토콜 데이터, 신중한 지갑 사용, 명확한 참여 안내를 바탕으로 보안을 관리합니다.',
  sections: [
    {
      heading: '보안 모델',
      paragraphs: [
        '프로토콜 작업은 Arbitrum 스마트 컨트랙트에 기록됩니다. 지갑을 연결하거나 제스처를 남기기 전에 공개 페이지에서 컨트랙트 주소, 소스 코드, 검증 범위, 운영 조건을 확인할 수 있습니다.',
      ],
      bullets: [
        '공식 앱(`https://app.cosmicsignature.com/`)을 이용해 주세요.',
        '온체인에서 상호작용하기 전에 컨트랙트 페이지에서 컨트랙트 주소를 확인해 주세요.',
        '지갑에 표시되는 요청 내용을 신중하게 검토해 주세요. 블록체인 트랜잭션은 되돌릴 수 없습니다.',
        'CST, NFT, 제스처, 배분을 보장된 재정적 결과로 여겨서는 안 됩니다.',
      ],
    },
    {
      heading: '검증 자료',
      paragraphs: [
        '가장 강력한 보안 신호는 앱에 표시되는 내용, 검증된 컨트랙트, 소스 코드, 실시간 Arbitrum 데이터가 서로 일치하는 것입니다.',
      ],
      links: [
        {
          kind: 'app',
          href: '/contracts',
          label: 'Cosmic Signature 컨트랙트와 Arbitrum 주소',
        },
        {
          kind: 'app',
          href: '/code',
          label: 'Cosmic Signature 소스 코드와 렌더링 파이프라인',
        },
        { kind: 'app', href: '/audits', label: '보안 감사와 정형 검증 안내' },
        {
          kind: 'app',
          href: '/risk-disclosures',
          label: '위험 고지와 참여자 안내',
        },
      ],
    },
  ],
};
