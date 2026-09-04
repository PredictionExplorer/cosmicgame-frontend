import { protocolFacts } from '@/content/protocol-facts';

import type { TermsCopy } from './TermsContent';

export const termsCopyKo = {
  title: '이용약관',
  subtitle:
    'Cosmic Signature를 이용하기 전에 본 약관을 주의 깊게 읽어 주세요. 플랫폼을 이용하면 본 약관에 구속되는 데 동의한 것으로 봅니다.',
  homeLabel: '홈',
  lastUpdated: '최종 업데이트: 2026년 7월 20일',
  sections: [
    {
      id: 'acceptance',
      title: '약관 동의',
      content: [
        {
          id: 'acceptance',
          text: 'Cosmic Signature에 접속하여 이용함으로써 사용자는 본 이용약관을 수락하고 이에 구속되는 데 동의합니다. 본 약관에 동의하지 않는 경우 플랫폼을 이용하지 말아 주세요.',
        },
        {
          id: 'binding-agreement',
          text: '본 약관은 사용자와 Cosmic Signature(이하 “회사”) 사이에 법적 구속력을 갖는 계약입니다. 회사는 언제든지 본 약관을 변경할 수 있으며, 변경된 약관은 게시 즉시 효력이 발생합니다.',
        },
      ],
    },
    {
      id: 'eligibility',
      title: '이용 자격 및 계정 요건',
      content: [
        {
          id: 'age',
          subtitle: '연령 요건',
          text: 'Cosmic Signature를 이용하려면 만 18세 이상이어야 합니다. 플랫폼을 이용함으로써 사용자는 이 연령 요건을 충족한다는 점을 진술하고 보증합니다.',
        },
        {
          id: 'wallet',
          subtitle: '지갑 관리 책임',
          text: 'Web3 지갑과 개인 키의 보안을 유지하는 책임은 전적으로 사용자에게 있습니다. Cosmic Signature는 개인 키나 시드 구문을 절대 요구하지 않습니다. 지갑에 접근할 수 없게 되면 NFT와 자금을 영구적으로 잃을 수 있습니다.',
        },
        {
          id: 'compliance',
          subtitle: '법규 준수',
          text: 'Cosmic Signature를 이용할 때 사용자는 암호화폐 및 블록체인 기술 관련 법령을 포함하여 자신이 속한 관할권의 모든 관련 법령과 규정을 준수하는 데 동의합니다.',
        },
      ],
    },
    {
      id: 'mechanics',
      title: '프로토콜 메커니즘과 스마트 컨트랙트',
      content: [
        {
          id: 'protocol',
          subtitle: '프로토콜 작동 원리',
          text: 'Cosmic Signature는 참여자가 퍼포먼스 사이클 동안 ETH 또는 CST 토큰으로 제스처를 남기는 탈중앙화 절차적 온체인 아트 프로토콜입니다. 제스처는 사이클 마감 시각을 연장하고, 프로토콜에 기록을 남기며, 스마트 컨트랙트 공식에 따라 동적 참여 CST를 각인할 수 있습니다. 사이클 마감 시각이 지나면 최종 제스처를 남긴 참여자가 시그니처 배분을 회수할 수 있습니다. 추가 배분은 공개된 배분 경로 구조에 따라 이루어집니다.',
        },
        {
          id: 'dynamic-cst',
          subtitle: '동적 CST 각인',
          text: '제스처로 각인되는 참여 CST의 양은 고정되어 있지 않습니다. 이전 제스처 이후 경과한 시간에 따라 달라지며, 제곱근 공식으로 계산됩니다. 매우 짧은 간격으로 이어지는 제스처는 각인되는 CST가 0일 수도 있습니다.',
        },
        {
          id: 'cst-window',
          subtitle: 'CST 보정 구간',
          text: `CST 제스처 비용은 온체인에 저장된 보정 구간을 따라 하락합니다. CST 제스처 1회마다 이 구간은 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘어나고, ETH 제스처 1회마다 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄어듭니다.`,
        },
        {
          id: 'smart-contract',
          subtitle: '스마트 컨트랙트 상호작용',
          text: '모든 프로토콜 작업은 Arbitrum 네트워크의 스마트 컨트랙트를 통해 실행됩니다. 트랜잭션이 온체인에서 확인되면 되돌릴 수 없습니다. 사용자는 블록체인 트랜잭션이 최종적이며 취소할 수 없다는 점을 인정합니다.',
        },
        {
          id: 'gas',
          subtitle: '가스 수수료',
          text: '트랜잭션에 발생하는 Arbitrum 네트워크 가스 수수료는 모두 사용자가 부담합니다. 가스 수수료는 제스처 비용과 별개이며, Cosmic Signature가 아니라 네트워크에 지불됩니다.',
        },
        {
          id: 'random-walk',
          subtitle: 'Random Walk NFT 비용 할인',
          text: 'Random Walk NFT를 ETH 제스처에 한 번 첨부하면 ETH 제스처 비용을 50% 할인받을 수 있습니다. 이 작업은 영구적이며 취소할 수 없습니다. 한 번 사용된 Random Walk NFT는 비용 할인에 다시 사용할 수 없습니다.',
        },
      ],
    },
    {
      id: 'allocations',
      title: '배분 구조와 절차',
      content: [
        {
          id: 'distribution',
          subtitle: '배분 실행',
          text: `배분은 스마트 컨트랙트 규칙에 따라 자동으로 실행됩니다. 일반적인 사이클에서는 아래 배분 경로에 걸쳐 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 ${protocolFacts.typicalCstImprintsPerCycle.toLocaleString('ko-KR')} CST가 각인됩니다.`,
        },
        {
          id: 'signature',
          subtitle: '시그니처 배분',
          text: `최종 제스처를 남긴 참여자는 ETH의 ${protocolFacts.mainEthPercentage}%, 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개, Cosmic Signature NFT 1개, 그리고 해당 사이클에 첨부된 토큰이 있다면 그 토큰을 회수할 수 있습니다.`,
        },
        {
          id: 'chrono',
          subtitle: '시간의 전사',
          text: `수호 챔피언 자리를 가장 오랫동안 연속으로 지킨 참여자는 ETH의 ${protocolFacts.chronoWarriorEthPercentage}%, 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개, Cosmic Signature NFT 1개를 받습니다.`,
        },
        {
          id: 'endurance',
          subtitle: '수호 챔피언',
          text: `최근 제스처 자리를 중단 없이 가장 오랫동안 지킨 참여자는 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개와 Cosmic Signature NFT 1개를 받습니다.`,
        },
        {
          id: 'final-cst',
          subtitle: '최종 CST 제스처',
          text: `사이클에서 마지막으로 CST 제스처를 남긴 참여자는 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개와 Cosmic Signature NFT 1개를 받습니다.`,
        },
        {
          id: 'eth-selection',
          subtitle: 'ETH 별빛 선정',
          text: `별빛 선정으로 정해진 참여자 ${protocolFacts.ethStellarSelectionRecipients}명이 사이클 준비금 ETH의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받습니다.`,
        },
        {
          id: 'nft-selection',
          subtitle: 'NFT 별빛 선정',
          text: `별빛 선정으로 정해진 참여자 ${protocolFacts.nftStellarSelectionRecipients}명이 각각 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개와 Cosmic Signature NFT 1개를 받습니다.`,
        },
        {
          id: 'anchored-selection',
          subtitle: '앵커링 NFT 별빛 선정',
          text: `별빛 선정으로 정해진 Random Walk NFT 앵커링 보유자 ${protocolFacts.anchoredRwlkNftSelectionRecipients}명이 각각 공로 CST ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')}개와 Cosmic Signature NFT 1개를 받습니다.`,
        },
        {
          id: 'anchor-distribution',
          subtitle: '앵커링 지급',
          text: `ETH의 ${protocolFacts.anchorDistributionPercentage}%는 앵커링된 모든 Cosmic Signature NFT에 비례하여 지급됩니다.`,
        },
        {
          id: 'public-goods',
          subtitle: '공공재',
          text: `ETH의 ${protocolFacts.publicGoodsPercentage}%는 현재 공공재 수령처인 Protocol Guild로 전달됩니다.`,
        },
        {
          id: 'compounding',
          subtitle: '누적 준비금',
          text: `사이클 준비금의 약 ${protocolFacts.compoundingReservePercentage}%는 다음 퍼포먼스 사이클로 이월됩니다.`,
        },
        {
          id: 'outreach',
          subtitle: '홍보 준비금',
          text: `사이클마다 홍보 배분과 생태계 기여자를 위해 ${protocolFacts.outreachReserveCst.toLocaleString('ko-KR')} CST가 각인됩니다.`,
        },
        {
          id: 'retrieval',
          subtitle: '배분 회수',
          text: `일부 배분은 플랫폼에서 직접 회수해야 합니다. 시그니처 배분 자격이 있는 참여자는 사이클 마감 시각 이후 ${protocolFacts.finalGestureExclusivityHours}시간 동안 단독으로 사이클을 마감할 수 있습니다. 이 기간이 지나면 누구나 사이클을 마감할 수 있으며, 스마트 컨트랙트 규칙에 따라 마감 실행자가 사이클 수령자가 되어 시그니처 배분을 받습니다. 2차 ETH 배분과 첨부된 토큰 또는 첨부된 NFT 배분에는 별도의 회수 기한이 적용되며, 기본값은 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주입니다. 이 기한이 지나면 스마트 컨트랙트 규칙상 누구든지 미회수 배분을 자신의 것으로 회수할 수 있습니다. 이 기한이 만료되기 전에 배분을 회수하는 책임은 사용자에게 있습니다.`,
        },
        {
          id: 'no-guarantee',
          subtitle: '결과 보장 없음',
          text: 'Cosmic Signature 참여는 어떠한 결과도 보장하지 않습니다. 모든 제스처는 최종적인 것으로 간주되며, 사용자는 제스처 비용 전액을 되돌려 받지 못할 수 있습니다. 자금을 잃더라도 생활에 지장이 없는 범위에서만 참여해 주세요.',
        },
      ],
    },
    {
      id: 'risks',
      title: '위험 및 면책',
      content: [
        {
          id: 'blockchain-risk',
          subtitle: '블록체인 기술 위험',
          text: '사용자는 블록체인 기술에 내재된 위험을 인정합니다. 이러한 위험에는 스마트 컨트랙트 취약점, 네트워크 혼잡, 가스 가격 변동, 규제 변화, 기술적 문제로 인한 자금 손실 가능성이 포함되며, 이에 한정되지 않습니다.',
        },
        {
          id: 'warranties',
          subtitle: '보증의 부인',
          text: 'Cosmic Signature는 명시적이든 묵시적이든 어떠한 종류의 보증도 없이 “있는 그대로” 제공됩니다. 회사는 플랫폼이 중단 없이, 오류 없이, 또는 유해한 구성 요소 없이 운영될 것을 보증하지 않습니다.',
        },
        {
          id: 'volatility',
          subtitle: '시장 변동성',
          text: '암호화폐와 NFT 시장은 변동성이 매우 큽니다. ETH, CST 토큰, NFT의 가치는 크게 변동할 수 있습니다. 과거의 성과는 미래의 결과를 보장하지 않습니다.',
        },
        {
          id: 'audits',
          subtitle: '스마트 컨트랙트 보안 감사',
          text: '회사는 스마트 컨트랙트의 보안을 확보하기 위해 노력하지만, 어떠한 보안 감사도 완전한 보안을 보장할 수 없습니다. 사용자는 자신의 책임으로 플랫폼을 이용합니다.',
        },
      ],
    },
    {
      id: 'prohibited',
      title: '금지 행위',
      content: [
        {
          id: 'intro',
          text: '사용자는 다음의 금지 행위를 하지 않는 데 동의합니다:',
        },
        {
          id: 'exploit',
          text: '• 버그, 결함, 취약점을 이용하여 프로토콜 메커니즘을 조작하거나 악용하려는 시도',
        },
        {
          id: 'automation',
          text: '• 봇, 스크립트, 자동화 도구를 사용하여 플랫폼과 상호작용하는 행위',
        },
        {
          id: 'collusion',
          text: '• 어떠한 형태의 시장 조작이나 다른 사용자와의 담합',
        },
        {
          id: 'security',
          text: '• 플랫폼의 보안을 해킹하거나 역설계하거나 훼손하려는 시도',
        },
        {
          id: 'law',
          text: '• 적용되는 법령이나 규정의 위반',
        },
        {
          id: 'accounts',
          text: '• 부당한 이점을 얻기 위해 여러 계정을 만드는 행위',
        },
        {
          id: 'malicious',
          text: '• 악성 콘텐츠를 업로드하거나 서비스 거부 공격을 시도하는 행위',
        },
      ],
    },
  ],
  additionalTitle: '추가 조항',
  additional: [
    {
      id: 'intellectual-property',
      subtitle: '지식재산권',
      text: '저장소 루트의 LICENSE 파일이 적용되는 프로젝트 소유 자료는 CC0 1.0에 따라 퍼블릭 도메인으로 헌정됩니다. 제3자 의존성, 글꼴, 에셋, 그 밖의 제3자 자료는 각자의 라이선스를 유지하며 이 헌정에 포함되지 않습니다. 자세한 내용은 THIRD_PARTY_NOTICES.md에서 확인할 수 있습니다. CC0는 상표권이나 특허권을 포기하지 않습니다. CC0 또는 명시된 오픈 소스 라이선스가 적용되지 않는 자료는 해당 권리자의 소유로 남으며, 적용되는 지식재산권 법률에 따라 보호됩니다. 프로토콜을 통해 받은 NFT는 해당 토큰의 소유권을 부여하지만, 명시적으로 밝히지 않는 한 그 기반이 되는 지식재산권은 부여하지 않습니다.',
    },
    // lexicon-allow-start: boilerplate limitation-of-liability language must preserve "profits".
    {
      id: 'liability',
      subtitle: '책임의 제한',
      text: '법률이 허용하는 최대 범위 내에서, 회사와 그 계열사는 사용자의 플랫폼 이용으로 발생하는 간접적, 부수적, 특별, 결과적 또는 징벌적 손해, 직접적이든 간접적이든 발생한 이익이나 수익의 손실, 그리고 데이터, 이용 기회, 영업권 또는 그 밖의 무형 손실에 대해 책임을 지지 않습니다.',
    },
    // lexicon-allow-end
    {
      id: 'indemnification',
      subtitle: '손해 배상 및 면책',
      text: '사용자는 자신의 플랫폼 이용, 본 약관 위반, 또는 타인의 권리 침해로 발생하는 모든 청구, 손실, 손해, 책임, 비용(법률 비용 포함)에 대해 회사와 그 계열사에 손해를 배상하고 회사와 그 계열사를 면책하는 데 동의합니다.',
    },
    {
      id: 'disputes',
      subtitle: '분쟁 해결',
      text: '본 약관 또는 사용자의 Cosmic Signature 이용으로 발생하는 모든 분쟁은 미국중재협회(American Arbitration Association)의 규칙에 따른 구속력 있는 중재로 해결합니다. 사용자는 배심 재판을 받을 권리와 집단 소송에 참여할 권리를 포기합니다.',
    },
    {
      id: 'law',
      subtitle: '준거법',
      text: '본 약관은 Cosmic Signature가 운영되는 관할권의 법률에 따라 규율되고 해석되며, 해당 관할권의 법률 충돌 원칙은 적용하지 않습니다.',
    },
    {
      id: 'severability',
      subtitle: '분리 가능성',
      text: '본 약관의 어느 조항이 무효이거나 집행할 수 없는 것으로 판단되더라도, 나머지 조항은 계속하여 완전한 효력을 유지합니다.',
    },
    {
      id: 'agreement',
      subtitle: '완전 합의',
      text: '본 약관은 플랫폼 이용에 관한 사용자와 회사 사이의 완전한 합의를 구성하며, 이전의 모든 합의를 대체합니다.',
    },
    {
      id: 'contact',
      subtitle: '문의처',
      text: '본 이용약관에 관한 질문은 공식 커뮤니티 채널이나 GitHub 저장소를 통해 문의해 주세요.',
    },
  ],
  // lexicon-allow-start: Howey-test denial copy must explicitly negate an investment framing.
  warning: {
    title: '중요 경고',
    text: 'Cosmic Signature 참여에는 금전적 위험이 따릅니다. 암호화폐와 NFT 시장은 변동성이 매우 크며, 사용자는 제스처의 가치를 되돌려 받지 못할 수 있습니다. 자금을 잃더라도 생활에 지장이 없는 범위에서만 참여해 주세요. Cosmic Signature는 투자 상품이 아니며, 토큰 가격이나 향후 동향에 관해 어떠한 진술도 하지 않으며, 투자로서의 참여를 권유하지 않습니다. 참여하기 전에 항상 스스로 조사하고 재정 상황을 신중하게 고려해 주세요.',
  },
  // lexicon-allow-end
  acknowledgment: {
    title: '확인',
    text: 'Cosmic Signature를 이용함으로써 사용자는 본 이용약관을 읽고 이해했으며 이에 구속되는 데 동의함을 확인합니다. 또한 사용자는 블록체인 기술, 암호화폐, NFT와 관련된 위험을 이해하고 있음을 확인합니다.',
  },
} as const satisfies TermsCopy;
