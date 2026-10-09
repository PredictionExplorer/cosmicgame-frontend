import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** Korean copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyKo: RiskCopy = {
  title: '위험 고지',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 이는 복권도, 카지노도, 도박 상품도, 투자 상품도 아니며, 재정적 결과를 약속하지도 않습니다.',
  // lexicon-allow-end
  keyPoint: {
    title: '참여하기 전에',
    text: '잃어도 괜찮은 자금으로만 제스처를 남겨 주세요. 제스처에 쓴 금액은 이후 사이클이 어떻게 되든 돌려받을 수 없습니다.',
  },
  groups: [
    {
      id: 'mechanics',
      heading: '사이클 메커니즘',
      risks: [
        '제스처에 쓴 ETH나 CST는 뒤이어 다른 제스처가 오더라도 돌려받을 수 없습니다.',
        `ETH 제스처가 있을 때마다 다음 ETH 제스처 비용이 ${facts.ethGestureCostStepUpPercent}% 오르므로, 제스처를 반복할수록 비용이 커집니다.`,
        '보정 구간은 CST 제스처 비용을 바꿉니다. CST 제스처가 없는 동안에는 비용이 계속 내려가고, CST 제스처가 있을 때마다 더 높은 가격에서 다시 시작합니다. 그래서 보이는 비용이 트랜잭션이 처리되기 전에 바뀔 수 있습니다.',
      ],
      source:
        '규칙은 이용약관의 <termsMechanics>프로토콜 메커니즘과 스마트 컨트랙트</termsMechanics> 항목에 있습니다.',
    },
    {
      id: 'timing',
      heading: '시간과 회수',
      risks: [
        `최종 제스처를 남긴 참여자는 사이클 마감 시각 뒤 ${facts.finalGestureExclusivityHours}시간 동안 혼자 사이클을 마감할 수 있습니다. 그 뒤에는 누구나 마감할 수 있고, 컨트랙트 규칙에 따라 마감한 사람이 시그니처 배분의 수령자가 됩니다.`,
        `다른 ETH 배분과 첨부 자산은 기본적으로 ${facts.secondaryRetrievalTimeoutWeeks}주 동안 수령자를 기다립니다. 그 뒤에는 누구나 남은 몫을 자신에게 회수할 수 있습니다.`,
      ],
      source: '규칙은 이용약관의 <termsRetrieval>배분 회수</termsRetrieval> 항목에 있습니다.',
    },
    {
      id: 'permanent',
      heading: '되돌릴 수 없는 작업',
      risks: [
        '확정된 트랜잭션은 되돌리거나 취소하거나 환불할 수 없습니다.',
        'ETH 제스처 비용 할인에 쓴 Random Walk NFT는 소진되어 다시는 비용을 할인하는 데 쓸 수 없습니다.',
        'NFT는 한 번만 앵커링할 수 있습니다. 해제한 뒤에는 다시 앵커링할 수 없습니다.',
      ],
      source:
        '규칙은 이용약관의 <termsRandomWalk>Random Walk NFT 비용 할인</termsRandomWalk> 항목에 있습니다.',
    },
    {
      id: 'wallets',
      heading: '지갑과 키',
      risks: [
        '키는 본인만 가지고 있습니다. 시드 구문를 아는 사람은 누구든 지갑을 제어할 수 있고, 잃어버린 시드 구문는 되찾을 수 없습니다.',
        '지갑 요청은 보기보다 많은 권한을 줄 수 있습니다. 모든 승인 내용을 읽고 <securityOfficial>공식 주소</securityOfficial>만 이용해 주세요.',
      ],
      source:
        '규칙은 이용약관의 <termsEligibility>이용 자격 및 계정 요건</termsEligibility> 항목에 있습니다.',
    },
    {
      id: 'availability',
      heading: '네트워크와 앱',
      risks: [
        '네트워크 혼잡, RPC 장애, 인덱서 지연, 앱 문제로 트랜잭션과 이 사이트에 표시되는 데이터가 늦어지거나 막힐 수 있습니다.',
        '이 사이트의 데이터는 체인보다 몇 초 이상 늦을 수 있습니다. 둘이 다를 때는 Arbitrum의 컨트랙트가 기준입니다.',
        '스마트 컨트랙트에는 보안 감사에서 발견되지 않은 결함이 있을 수 있습니다. 감사에서 확인한 범위는 <audits>보안 감사</audits> 페이지에 있습니다.',
      ],
      source: '규칙은 이용약관의 <termsRisks>위험 및 면책</termsRisks> 항목에 있습니다.',
    },
    {
      id: 'value',
      heading: '가치와 결과',
      risks: [
        'ETH, CST, NFT의 시장 가치는 크게 변할 수 있으며 0이 될 수도 있습니다.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CST와 NFT를 보장된 수익이나 금융 상품으로 이해해서는 안 됩니다.',
        // lexicon-allow-end
        '어떤 제스처도 배분을 보장하지 않습니다. 결과는 오프체인의 약속이 아니라 공개된 컨트랙트 규칙에 따라 정해집니다.',
      ],
      source:
        '규칙은 이용약관의 <termsNoGuarantee>결과 보장 없음</termsNoGuarantee> 항목에 있습니다.',
    },
  ],
  participation: {
    heading: '참여자가 하는 일',
    paragraphs: [
      '참여자는 퍼포먼스 사이클 동안 제스처를 남깁니다. 제스처는 프로토콜 상태에 영향을 주고, 참여 CST를 각인할 수 있습니다. 이 기록이 결정론적 Cosmic Signature NFT 작품의 배경을 이룹니다. 결과는 오프체인의 약속이 아니라 공개된 스마트 컨트랙트 규칙에 따라 정해집니다.',
      // lexicon-allow-start: link label names the categories denied by the linked page.
      'Cosmic Signature가 <notALottery>복권, 카지노, 투자가 아닌 이유</notALottery>를 읽어 보세요.',
      // lexicon-allow-end
    ],
  },
};
