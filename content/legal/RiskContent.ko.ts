import type { TrustPageCopy } from './TrustPageContent';

/** Korean copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyKo: TrustPageCopy = {
  eyebrow: '위험과 참여자 안내',
  title: 'Cosmic Signature 위험 고지',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 이는 복권도, 카지노도, 도박 상품도, 투자 상품도 아니며, 재정적 결과를 약속하지도 않습니다.',
  // lexicon-allow-end
  sections: [
    {
      heading: '주요 위험',
      bullets: [
        '블록체인 트랜잭션은 공개되며 일반적으로 되돌릴 수 없습니다.',
        '지갑 보안, 개인 키, 트랜잭션 승인은 사용자의 책임입니다.',
        '네트워크 혼잡, RPC 장애, 인덱서 지연, 앱 문제는 사용 경험에 영향을 줄 수 있습니다.',
        '참여하기 전에 프로토콜 매개변수, 배분, 시간 관련 조건을 검토해야 합니다.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CST와 NFT를 보장된 수익이나 금융 상품으로 이해해서는 안 됩니다.',
        // lexicon-allow-end
      ],
    },
    {
      heading: '참여자가 하는 일',
      paragraphs: [
        '참여자는 퍼포먼스 사이클 동안 제스처를 남깁니다. 제스처는 변화하는 프로토콜 상태에 영향을 주고, 참여 CST를 각인하며, 결정론적 Cosmic Signature NFT 아트의 맥락을 만드는 데 기여합니다. 결과는 오프체인의 약속이 아니라 공개된 스마트 컨트랙트 메커니즘에 따라 정해집니다.',
      ],
    },
    {
      heading: '관련 페이지',
      links: [
        // lexicon-allow-start: link label names the categories denied by the linked page.
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Cosmic Signature는 복권이나 카지노, 투자인가요?',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: '이용약관' },
        { kind: 'app', href: '/security', label: '보안 개요' },
      ],
    },
  ],
};
