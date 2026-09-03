import { protocolFacts } from '@/content/protocol-facts';

import type { FAQText } from './structure';

/** protocolFacts stores the example gaps as English strings; render them in Korean. */
const ELAPSED_KO: Record<string, string> = {
  '0 seconds': '0초',
  '1 second': '1초',
  '60 seconds': '60초',
  '1 hour': '1시간',
  '1 day': '1일',
};

/** 한국어 자주 묻는 질문 copy, keyed by the skeleton in structure.ts. */
export const faqTextKo = {
  'getting-started': {
    title: '시작하기',
    description: 'Cosmic Signature의 기본 개념과 참여 방법',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature란 무엇인가요?',
        answer:
          'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 모든 제스처가 사이클의 최종 시그니처를 빚어냅니다. 사이클이 마감되면 프로토콜은 준비금을 10개가 넘는 배분 경로로 배분합니다. 이더리움 핵심 기여자 170명 이상을 위한 자금 지원 메커니즘인 Protocol Guild도 그중 하나입니다.',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature는 생물학의 COSMIC 데이터베이스와 관련이 있나요?',
        answer:
          '아닙니다. Cosmic Signature는 COSMIC 암 돌연변이 데이터베이스나 생물학의 COSMIC 돌연변이 시그니처와 아무 관련이 없습니다. 결정론적 삼체 NFT 아트에 집중하는 온체인 아트 프로토콜이자 앱입니다.',
      },
      'how-does-the-bidding-game-work': {
        question: '퍼포먼스 사이클은 어떻게 진행되나요?',
        answer: `사이클은 첫 제스처를 위한 ETH 보정 구간으로 시작됩니다. 이 첫 제스처가 사이클 마감 시각을 설정하며, 현재 기본값은 약 24시간입니다. 이후의 ETH 또는 CST 제스처는 저장된 마감 시각에 현재 시간 증가량을 더합니다. 시간 증가량은 1시간에서 시작해 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% 늘어납니다. 사이클 마감 시각이 지나면 최종 제스처를 남긴 참여자가 ${protocolFacts.finalGestureExclusivityHours}시간 동안 단독으로 사이클을 마감하고 시그니처 배분을 회수할 수 있습니다. 사이클이 실제로 마감되기 전까지는 누구나 제스처를 남길 수 있습니다.`,
      },
      'what-type-of-gestures-are-available': {
        question: '어떤 종류의 제스처가 있나요?',
        answer:
          '제스처는 ETH 또는 CST 토큰(ERC-20)으로 남길 수 있습니다. 매 사이클의 첫 제스처는 ETH 제스처여야 하며, 그 뒤로는 ETH 제스처와 CST 제스처를 자유롭게 섞어 남길 수 있습니다. ETH 제스처에 Random Walk NFT를 첨부하면 ETH 제스처 비용이 50% 할인됩니다. Cosmic Signature NFT(ERC-721)는 배분과 앵커링에 쓰이는 자산이며, 제스처 비용으로는 쓸 수 없습니다. CST 제스처에는 별도의 보정 구간이 있습니다. 구간이 진행되는 동안 CST 제스처 비용은 내려가고, 구간의 길이 자체도 ETH 또는 CST 제스처마다 달라집니다.',
      },
      'can-i-participate-without-nfts': {
        question: 'NFT가 하나도 없어도 참여할 수 있나요?',
        answer:
          '네. 누구나 제스처를 남기는 것만으로 Cosmic Signature 퍼포먼스 사이클에 참여할 수 있습니다. 아직 사용하지 않은 Random Walk NFT가 있다면 ETH 제스처에 첨부해 제스처 비용을 50% 할인받을 수 있습니다.',
      },
      'how-can-i-get-involved': {
        question: '어떻게 참여할 수 있나요?',
        answer:
          '퍼포먼스 사이클 동안 제스처를 남기거나, 자신의 프로젝트 NFT를 참여자의 제스처에 첨부할 수 있도록 기여하는 방식으로 참여할 수 있습니다. 다른 참여자는 Discord에서 만날 수 있습니다.',
      },
      'how-long-does-each-round-last': {
        question: '퍼포먼스 사이클 하나는 얼마나 오래 이어지나요?',
        answer: `사이클은 첫 ETH 제스처와 함께 시작되며, 이때 사이클 마감 시각은 현재 시간 증가량의 약 24배로 설정됩니다(출시 시점 기준 약 1일). 이후의 모든 제스처는 현재 시간 증가량을 더합니다. 시간 증가량은 정확히 1시간에서 시작했고, 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% 늘어납니다. 따라서 마감 전까지 제스처가 계속 이어지면 사이클은 하루보다 훨씬 오래 지속될 수 있습니다.`,
      },
      'can-i-place-multiple-gestures': {
        question: '한 사이클에서 제스처를 여러 번 남길 수 있나요?',
        answer:
          '네. 제스처마다 참여 CST가 지갑에 각인될 수 있고, 별빛 선정 자격이 한 건씩 늘어나며, 사이클의 시그니처가 조금씩 달라집니다. 참여 CST의 양은 동적입니다. 이전 제스처 이후 흐른 시간에 따라 정해지므로, 긴 공백 뒤에 남긴 제스처는 연달아 남긴 제스처보다 더 많은 CST를 각인합니다.',
      },
    },
  },
  'allocations-and-rewards': {
    title: '배분과 앵커링 지급',
    description: '사이클이 마감되면 참여자가 받을 수 있는 것',
    items: {
      'what-is-the-main-allocation': {
        question: '시그니처 배분이란 무엇인가요?',
        answer:
          '시그니처 배분은 사이클의 최종 제스처를 남긴 참여자가 받습니다. Cosmic Signature NFT 1개, 공로 CST 1,000개, 사이클 준비금 ETH의 25%, 그리고 사이클 동안 참여자 제스처에 첨부된 모든 토큰과 NFT가 포함됩니다.',
      },
      'what-rewards-per-bid': {
        question: '제스처마다 무엇을 받나요?',
        answer: `모든 제스처는 사이클 마감 시 이루어지는 별빛 선정에 자격 한 건을 더하고, 수호 챔피언과 시간의 전사 경로에 반영되는 선두 유지 기록을 갱신하며, 참여 CST를 각인할 수 있습니다. 참여 CST는 제곱근 공식으로 계산합니다: ${protocolFacts.dynamicCstRewardFormula}. 쉽게 말해, 이전 제스처 이후 흐른 시간이 길수록 양이 늘어나지만 늘어나는 속도는 점점 느려집니다. 아주 빠르게 이어진 제스처는 0 CST를 받을 수 있고, 간격이 길면 훨씬 많은 CST가 각인됩니다.`,
      },
      'how-does-the-stellarSelection-work': {
        question: '별빛 선정은 어떻게 이루어지나요?',
        answer: `제스처마다 별빛 선정 자격이 한 건씩 기록됩니다. 사이클이 마감되면 스마트 컨트랙트가 풀에서 자격을 무작위로 선정합니다. 선정된 자격 ${protocolFacts.ethStellarSelectionRecipients}건이 사이클 준비금 ETH의 ${protocolFacts.stellarSelectionEthPercentage}%를 나누어 받고, 또 다른 ${protocolFacts.nftStellarSelectionRecipients}건은 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받으며, 앵커링된 Random Walk NFT 가운데 선정되는 ${protocolFacts.anchoredRwlkNftSelectionRecipients}건도 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST와 Cosmic Signature NFT를 받습니다. 선정은 복원 추출 방식으로 이루어지므로 같은 주소가 한 사이클에서 여러 번 선정될 수 있습니다. 제스처를 많이 남길수록 선정 빈도가 높아집니다.`,
      },
      'how-random-selection-works': {
        question: '무작위 선정은 어떻게 이루어지나요?',
        answer:
          '별빛 선정은 사이클 마감 시점의 온체인 무작위성 소스를 사용하며, 여기에는 Arbitrum이 제공하는 블록 컨텍스트와 예비 엔트로피 소스가 포함됩니다. 참여자 별빛 선정은 자격 수에 비례합니다. 제스처마다 자격이 한 건 추가되므로 제스처가 많을수록 선정 빈도가 높아집니다. 앵커링 NFT 별빛 선정은 별개의 절차로, 참여자의 제스처 자격 풀이 아니라 앵커링된 Random Walk NFT의 자격을 기준으로 이루어집니다.',
      },
      'how-do-i-claim-my-allocation': {
        question: '수령자가 되면 배분을 어떻게 회수하나요?',
        answer: `수령자는 앱과 프로토콜 컨트랙트를 통해 배분을 회수합니다. 최종 제스처 참여자는 사이클 마감 시각이 지난 뒤 ${protocolFacts.finalGestureExclusivityHours}시간 동안 단독으로 사이클을 마감하고 시그니처 배분을 회수할 수 있습니다. 그 뒤에는 공개 마감 구간이 시작됩니다. 누구나 사이클을 마감할 수 있고, 스마트 컨트랙트는 마감을 실행한 사람을 사이클 수령자로 취급합니다. 즉 마감 실행자가 시그니처 배분 전체(ETH 몫, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST 각인, Cosmic Signature NFT, 첨부 자산 우선권)를 받습니다. 2차 ETH 배분과 첨부 토큰 또는 첨부 NFT 배분은 배분 지갑 에스크로에 보관되며, 별도의 회수 기한이 적용됩니다. 기본값은 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주이며, 기한이 지나면 누구든 미회수 배분을 자기 몫으로 회수할 수 있습니다. 배분은 서둘러 회수해 주세요.`,
      },
      'how-does-anchoring-work': {
        question: '앵커링은 어떻게 작동하나요?',
        answer: `Cosmic Signature NFT를 프로토콜에 앵커링하면 ETH 앵커링 지급을 받을 수 있습니다. 마감되는 사이클마다 사이클 준비금의 ${protocolFacts.anchorDistributionPercentage}%가 앵커링된 Cosmic Signature NFT에 균등하게 나뉘고, 쌓인 ETH는 앵커링을 해제할 때 지급됩니다. Random Walk NFT도 앵커링할 수 있지만, 이는 앵커링 NFT 별빛 선정 자격을 얻기 위한 것입니다. 선정된 앵커링 보유자는 ETH가 아니라 CST와 Cosmic Signature NFT를 받습니다. 알아 두어야 할 규칙이 두 가지 있습니다. 모든 NFT는 단 한 번만 앵커링할 수 있으며(앵커링을 해제한 NFT는 다시 앵커링할 수 없습니다), 사이클이 마감될 때 앵커링된 Cosmic Signature NFT가 하나도 없으면 그 사이클의 ${protocolFacts.anchorDistributionPercentage}%는 사이클 준비금에 그대로 남습니다. CST(ERC-20)는 앵커링할 수 없습니다. 앵커링 관리는 계정 메뉴의 내 앵커링 페이지에서 할 수 있습니다.`,
      },
      'what-are-marketing-rewards': {
        question: '홍보 준비금이란 무엇인가요?',
        answer: `프로토콜을 알리는 데 힘을 보태면 CST 토큰(ERC-20)을 받을 수 있습니다. 홍보 준비금은 사이클마다 ${protocolFacts.outreachReserveCst.toLocaleString('ko-KR')} CST를 각인해 생태계 기여자에게 전달합니다. 자세한 안내는 Discord에서 홍보 준비금 재무 담당자에게 문의해 주세요.`,
      },
      'how-many-nfts-minted': {
        question: '사이클마다 Cosmic Signature NFT가 몇 개 각인되나요?',
        answer: `대부분의 사이클에서는 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개가 각인됩니다. 시그니처 배분 수령자에게 1개, 최종 CST 제스처 수령자에게 1개, 수호 챔피언에게 1개, 시간의 전사에게 1개, NFT 별빛 선정 수령자에게 ${protocolFacts.nftStellarSelectionRecipients}개, 그리고 앵커링 NFT 별빛 선정으로 선정된 Random Walk NFT 앵커링 보유자에게 ${protocolFacts.anchoredRwlkNftSelectionRecipients}개입니다. 이 ${protocolFacts.typicalNftsPerCycle}개의 NFT 배분에는 각각 ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST도 함께 포함됩니다. 사이클에 CST 제스처가 없거나 앵커링된 Random Walk NFT가 없으면 해당 각인은 그 사이클에서 이루어지지 않습니다.`,
      },
      'what-happens-to-remaining-eth': {
        question: '사이클 준비금에 남은 ETH는 어떻게 되나요?',
        answer:
          '사이클 준비금의 약 절반은 누적 준비금으로 다음 퍼포먼스 사이클에 이월되어 다음 사이클의 시작 잔액을 키웁니다. 프로토콜은 빼내지 않고 쌓아 갑니다.',
      },
      'what-happens-to-attached-assets': {
        question: '제스처에 첨부된 토큰이나 NFT는 어떻게 되나요?',
        answer: `제스처에 첨부된 ERC-20 토큰이나 ERC-721 NFT는 배분 지갑 컨트랙트가 에스크로로 보관하며, ETH 사이클 준비금에는 합쳐지지 않습니다. 마감 후에는 사이클 수령자(보통 최종 제스처 참여자)에게 이를 우선 회수할 권리가 있습니다. 첨부 자산이 2차 회수 기한(현재 기본값 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주)을 넘겨도 회수되지 않으면, 누구든 이를 자기 몫으로 회수할 수 있습니다.`,
      },
      'who-receives-10-percent': {
        question: '사이클 준비금의 공공재 배분은 누가 받나요?',
        answer:
          '마감 시 사이클 준비금의 7%가 공공재 금고로 전달되고, 그 뒤 누구나 금고 잔액을 설정된 공공재 수령처로 전달할 수 있습니다. 현재 수령처는 이더리움 핵심 기여자 170명 이상을 위한 공동 자금 지원 메커니즘인 Protocol Guild입니다. 지금은 프로토콜 소유자가 수령처 주소를 설정하지만, 소유권이 평의회 관리 아래로 넘어간 뒤에는 우주 평의회가 이를 정하도록 설계되어 있습니다.',
      },
    },
  },
  'game-mechanics': {
    title: '사이클 메커니즘',
    description: '제스처 타이밍과 프로토콜 규칙 깊이 들여다보기',
    items: {
      'how-does-price-increase': {
        question: '제스처 비용은 사이클 동안 어떻게 달라지나요?',
        answer:
          'ETH 제스처 비용과 CST 제스처 비용은 온체인에서 각각 다른 경로를 따릅니다. ETH 제스처 비용은 ETH 보정 구간을 거친 뒤 ETH 제스처가 있을 때마다 한 단계씩 오릅니다. CST 제스처 비용은 현재 CST 보정 구간을 따라 내려갑니다. 이 CST 구간은 고정되어 있지 않습니다. ETH 제스처는 구간을 조금 줄이고 CST 제스처는 조금 늘리므로, 비용 경로는 ETH 참여와 CST 참여의 균형에 반응합니다.',
      },
      'what-is-dutch-auction': {
        question: '보정 구간이란 무엇인가요?',
        answer: `보정 구간은 정해진 시간 동안 제스처 비용이 보정 상한에서 선형으로 내려가는 비용 탐색 구간입니다. ETH 제스처와 CST 제스처는 하한이 다른 별도의 구간을 사용합니다. ETH 제스처 비용은 상한의 약 1/${protocolFacts.ethCalibrationFloorDivisor}까지 내려가고, CST 제스처 비용은 ${protocolFacts.cstCalibrationFloorCst} CST까지 완전히 내려가므로 구간이 끝까지 지나면 비용 없이 CST 제스처를 남길 수도 있습니다. CST 보정 구간은 현재 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준으로 시작하지만, 그 길이는 온체인에 저장되어 제스처마다 달라집니다. CST 제스처는 구간을 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘리고, ETH 제스처는 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄입니다.`,
      },
      'how-is-participation-cst-calculated': {
        question: '참여 CST는 어떻게 계산되나요?',
        answer: `참여 CST는 이전 제스처 이후 흐른 시간에 제곱근 공식을 적용해 계산합니다: ${protocolFacts.dynamicCstRewardFormula}. 제곱근을 쓰는 이유는 긴 공백을 더 크게 반영하되, 양이 끝없이 선형으로 늘어나지는 않게 하기 위해서입니다. 출시 매개변수(시간 증가량 정확히 1시간) 기준의 예시는 대략 다음과 같습니다: ${protocolFacts.dynamicCstRewardExamples.map((example) => `${ELAPSED_KO[example.elapsed] ?? example.elapsed}에 ${example.cst} CST`).join(', ')}. 시간 증가량은 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% 늘어나므로, 실제 양은 시간이 지날수록 이 예시보다 조금씩 낮아집니다. 제스처가 반영되는 순간의 정확한 양은 앱의 실시간 미리 보기와 컨트랙트가 기준입니다.`,
      },
      'why-minimum-cst-reward-protection': {
        question: '최소 참여 CST 보호란 무엇인가요?',
        answer:
          '제스처를 제출하기 전에 앱은 예상 참여 CST 양을 미리 보여 주고, 받아들일 최소 CST 양을 함께 보냅니다. 다른 제스처가 먼저 반영되면 예상 양이 달라질 수 있습니다. 최소 참여 CST 보호는 실제 각인될 CST가 선택한 최소값보다 적을 경우 트랜잭션을 되돌릴 수 있습니다. 0 CST를 포함해 어떤 CST 양이든 받아들이도록 설정하면, 비용 검사만 통과해도 제스처가 그대로 진행됩니다.',
      },
      'how-cst-calibration-window-changes': {
        question: '제스처마다 CST 보정 구간은 어떻게 달라지나요?',
        answer: `모든 ETH 또는 CST 제스처는 저장된 CST 보정 구간을 갱신합니다. CST 제스처는 구간을 현재 길이의 1/${protocolFacts.cstCalibrationWindowChangeDivisor}만큼 늘리며, 이는 정수 절삭 전 기준 약 +${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%입니다. ETH 제스처는 구간을 약 1/${protocolFacts.cstCalibrationWindowChangeDivisor + 1}만큼, 즉 약 -${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄입니다. 구간이 짧아지면 CST 제스처 비용이 더 빨리 내려가고, 길어지면 더 천천히 내려갑니다.`,
      },
      'what-is-open-finalization-window': {
        question: '공개 마감 구간이란 무엇인가요?',
        answer: `사이클 마감 시각이 지나면 최종 제스처 참여자는 ${protocolFacts.finalGestureExclusivityHours}시간 동안 단독으로 사이클을 마감할 수 있습니다. 이 우선 마감 구간 안에 마감하지 않으면 누구나 마감 트랜잭션을 호출할 수 있고, 스마트 컨트랙트는 마감을 실행한 사람을 사이클 수령자로 삼습니다. 마감 실행자가 시그니처 배분 전체(ETH 몫, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST, Cosmic Signature NFT, 첨부 자산 우선권)를 받으므로, 최종 제스처 참여자는 구간이 끝나기 전에 마감해야 합니다. 공개 마감은 최종 제스처 참여자가 사라지더라도 프로토콜이 멈추지 않도록 합니다.`,
      },
      'what-is-endurance-champion': {
        question: '수호 챔피언이란 무엇인가요?',
        answer:
          '한 사이클 안에서 최근 제스처 참여자 자리를 끊기지 않고 가장 오래 지킨 참여자입니다(다음 제스처가 오기까지의 공백이 가장 길었던 참여자). 사이클이 마감되면 수호 챔피언은 공로 CST 1,000개와 Cosmic Signature NFT 1개를 받습니다.',
      },
      'what-is-final-cst-gesture': {
        question: '최종 CST 제스처란 무엇인가요?',
        answer:
          '최종 CST 제스처는 한 사이클에서 CST 토큰으로 남긴 제스처 가운데 가장 나중의 것입니다. 사이클이 마감되면 이를 남긴 참여자가 공로 CST 1,000개와 Cosmic Signature NFT 1개를 받습니다.',
      },
      'what-is-chrono-warrior': {
        question: '시간의 전사란 무엇인가요?',
        answer: `수호 챔피언 자리를 끊기지 않고 가장 오래 지킨 참여자입니다. 수호 챔피언이 최근 제스처 참여자 자리를 가장 오래 지킨 사람이라면, 시간의 전사는 수호 챔피언 자리를 가장 오래 지킨 사람입니다. 사이클이 마감되면 시간의 전사는 사이클 준비금 ETH의 ${protocolFacts.chronoWarriorEthPercentage}%, ${protocolFacts.specialAllocationCst.toLocaleString('ko-KR')} CST, Cosmic Signature NFT 1개를 받습니다.`,
      },
      'does-time-per-bid-stay-same': {
        question: '제스처마다 더해지는 시간은 늘 같나요?',
        answer: `아닙니다. 제스처마다 더해지는 시간은 출시 시점에 정확히 1시간이었고, 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%씩 늘어납니다. 증가량이 커지면 사이클 하나도 더 오래 이어지므로, 실제 달력 시간으로 보면 증가 속도는 자연스럽게 느려집니다.`,
      },
      'why-time-per-bid-increases': {
        question: '제스처마다 더해지는 시간이 왜 점점 늘어나나요?',
        answer:
          '이 메커니즘은 Cosmic Signature NFT가 장기적으로 각인되는 속도를 제한합니다. 사이클이 느려질수록 단위 시간당 유통되는 새 NFT가 줄어들어 희귀성이 유지됩니다.',
      },
      'how-time-increase-affects-game': {
        question: '제스처당 시간 증가는 프로토콜에 어떤 영향을 주나요?',
        answer:
          '제스처마다 더해지는 시간이 늘어나면 사이클은 평균적으로 더 길어집니다. 변화는 점진적이어서 참여 경험은 매끄럽게 유지되고, 장기적으로 Cosmic Signature NFT의 총 공급량은 제한됩니다.',
      },
      'what-if-two-gestures-same-time': {
        question: '두 제스처가 동시에 제출되면 어떻게 되나요?',
        answer:
          'Arbitrum의 트랜잭션은 시퀀서가 포함한 순서대로 처리됩니다. 두 제스처가 같은 순간에 도착하면 먼저 확인된 것이 유효한 제스처가 됩니다.',
      },
      'is-there-game-theory': {
        question: 'Cosmic Signature에 전략적 요소가 있나요?',
        answer:
          '네. 참여자의 타이밍, 제스처 빈도, 제스처 수단(ETH, CST, Random Walk NFT 첨부)이 모두 배분이 이루어지는 방식에 영향을 줍니다. 사회적 역학과 프로토콜 설계는 서로 다른 배분 경로에서 여러 전략이 함께 결실을 맺을 수 있도록 짜여 있습니다.',
      },
    },
  },
  'tokens-and-nfts': {
    title: '토큰과 Cosmic Signature',
    description: 'CST, 온체인 아트, 디지털 자산',
    items: {
      'what-are-cst-and-dao': {
        question: 'CST 토큰과 우주 평의회란 무엇인가요?',
        answer:
          '모든 제스처는 CST 토큰을 각인할 수 있으며, CST는 우주 평의회에서 조율 가중치로 쓰입니다. 평의회는 프로토콜을 온체인에서 조율합니다. CST 보유자는 조율 제안을 올리고 찬성 또는 반대를 표명합니다(가중치를 활성화하려면 CST를 자신이나 다른 주소에 위임해야 합니다). 평의회는 컨트랙트 소유권이 평의회 관리 아래로 넘어간 뒤, 7% 배분을 받는 공공재 수령처를 비롯한 프로토콜 매개변수를 정하도록 설계되어 있습니다. 지금은 이 설정을 프로토콜 소유자가 관리합니다.',
      },
      'what-can-i-do-with-cst': {
        question: 'CST 토큰으로 무엇을 할 수 있나요?',
        answer:
          'CST 토큰은 CST 보정 구간을 통해 ETH 대신 제스처에 쓸 수 있습니다. 제스처에 쓰인 CST는 풀에 모이지 않고 소각되어 공급량에서 영구히 사라집니다. 제스처는 참여 CST를 각인할 수도 있지만, 그 양은 동적이며 이전 제스처 이후 흐른 시간에 따라 달라집니다. CST는 위임한 뒤(자신에게 위임할 수도 있습니다) 우주 평의회에서 조율 가중치로도 쓰입니다.',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFT는 무엇이 특별한가요?',
        answer:
          'Cosmic Signature NFT는 온체인에 존재하며 스스로 지속됩니다. 각 NFT에는 스마트 컨트랙트에 저장된 무작위 생성 시드가 각인됩니다. 이미지와 영상은 오픈 소스 Rust 파이프라인으로 이 시드에서 렌더링됩니다. 시드가 세 천체의 초기 조건을 결정하므로 NFT마다 고유한 카오스 궤적이 만들어집니다.',
      },
      'how-are-nft-images-created': {
        question: 'NFT 이미지는 어떻게 만들어지나요?',
        answer:
          '각 Cosmic Signature NFT는 뉴턴 중력 아래의 삼체 문제를 시각화합니다. 파이프라인은 중력 아래 움직이는 세 천체를 시뮬레이션하고, 380~700나노미터에 걸친 64개 파장 구간에서 그 궤적을 분광 렌더링해 NFT마다 고유한 카오스 패턴을 만듭니다.',
      },
      'significance-of-random-seed': {
        question: 'NFT를 온체인 시드에서 생성하는 이유는 무엇인가요?',
        answer:
          '시드 기반 파이프라인은 장기적인 재현 가능성을 보장합니다. 이미지를 중앙 서버에 두는 NFT 프로젝트와 달리, 모든 Cosmic Signature NFT의 시드는 Arbitrum에 저장됩니다. 누구나 언제든 오픈 소스 Rust 파이프라인으로 NFT 이미지와 영상을 독립적으로 다시 생성할 수 있으며, 결과는 원본과 픽셀 단위로 동일합니다.',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFT의 수는 제한되어 있나요?',
        answer: `실질적으로 그렇습니다. 제스처마다 더해지는 시간은 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% 늘어나므로 사이클은 점차 길어지고 NFT 각인 속도는 느려집니다. 컨트랙트에 고정된 공급 상한은 없지만, 느려지는 사이클 리듬 때문에 Cosmic Signature NFT는 시간이 갈수록 더 희귀해집니다.`,
      },
      'impact-of-limiting-nfts': {
        question: 'NFT 공급이 제한되면 어떤 영향이 있나요?',
        answer:
          '제스처마다 늘어나는 시간 증가량과 느려지는 각인 속도가 희귀성을 지킵니다. 새로 각인되는 Cosmic Signature NFT 하나하나는 누적된 프로토콜 역사에서 점점 더 드문 한 조각이 됩니다.',
      },
      'connection-with-randomwalknft': {
        question: 'Random Walk NFT와는 어떤 관계인가요?',
        answer:
          'Random Walk NFT 보유자는 아직 사용하지 않은 토큰을 ETH 제스처 한 건에 첨부해 ETH 제스처 비용을 50% 할인받을 수 있습니다. Random Walk NFT 앵커링 보유자는 사이클마다 앵커링 NFT 별빛 선정 자격도 받습니다.',
      },
      'how-to-trade-nfts-tokens': {
        question: 'Cosmic Signature NFT나 CST는 어떻게 거래하거나 판매하나요?',
        answer:
          'Cosmic Signature NFT는 Cosmic Signature와 Random Walk NFT를 위해 만들어진 수수료 없는 NFT 마켓플레이스 Axiom Zero(axiomzero.market)에서, CST는 Arbitrum의 Uniswap에서 거래됩니다. 둘 다 표준 ERC-721 및 ERC-20 자산이므로 OpenSea를 포함해 이 표준을 지원하는 다른 Arbitrum 마켓플레이스나 거래소에서도 거래할 수 있습니다.',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: 'Cosmic Signature NFT는 어디에서 사고팔 수 있나요?',
        answer:
          '주된 거래 장소는 Axiom Zero(https://www.axiomzero.market/cosmic-signature)입니다. 공정하게 출시된 제너러티브 아트를 위해 만들어진, 수수료 없는 Arbitrum NFT 마켓플레이스입니다. 등록과 판매는 온체인에서 직접 처리되고 판매자는 판매 금액 전부를 받으며, 모든 토큰 페이지에는 앵커링 컨트랙트에서 실시간으로 읽어 온 NFT의 앵커링 상태가 표시됩니다. 한 번도 앵커링되지 않은 토큰은 다음 소유자를 위해 1회 앵커링 기회를 그대로 남겨 둡니다.',
      },
      'cosmic-signature-prediction-market': {
        question: 'Cosmic Signature 예측 시장이 있나요?',
        answer:
          '네. Chaos Zero(https://chaoszero.com)는 Cosmic Signature를 위해 특별히 만들어진 예측 시장입니다. 퍼포먼스 사이클마다 하나의 질문을 엽니다: “이번 사이클은 이전 사이클보다 더 많은 제스처로 마감될 것인가?” 포지션은 CST로 표시되며 구조적으로 전액 담보되고, 시장은 소유자나 관리자 키 없이 공개된 온체인 제스처 수로 결과가 확정됩니다.',
      },
      'participate-dao-without-bidding': {
        question: '제스처를 남기지 않고도 우주 평의회에 참여할 수 있나요?',
        answer:
          '네. 지원되는 거래소에서 CST를 구해 자신이나 다른 주소에 위임한 뒤, 우주 평의회에서 조율 가중치로 쓸 수 있습니다. 다만 새 CST를 각인하는 주된 방법은 여전히 제스처를 남기는 것입니다.',
      },
      'donate-nfts-to-game': {
        question: '다른 NFT 프로젝트는 어떻게 자기 토큰을 사이클에 기여할 수 있나요?',
        answer:
          '프로젝트는 ‘고급’ 패널을 사용해 토큰(ERC-721 또는 ERC-20)을 제스처에 첨부할 수 있습니다. 컨트랙트 주소와 토큰 ID 또는 수량을 입력하고 제스처를 제출하면 됩니다. 첨부된 토큰은 배분 지갑 에스크로에 보관되며, 마감 후 시그니처 배분 수령자에게 전달됩니다.',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrum과 기술',
    description: '네트워크 설정, 지갑, 기술적 세부 사항',
    items: {
      'what-is-arbitrum': {
        question: 'Arbitrum이란 무엇이며, Cosmic Signature는 왜 Arbitrum에 배포되었나요?',
        answer:
          'Arbitrum은 트랜잭션을 빠르게 하고 수수료를 낮추는 이더리움 레이어 2 롤업입니다. Cosmic Signature는 이더리움의 보안 보장을 유지하면서 1센트 미만의 가스 비용과 더 빠른 확정을 제공하기 위해 Arbitrum에 배포되었습니다.',
      },
      'why-arbitrum-not-ethereum': {
        question: '이더리움 메인넷이 아니라 왜 Arbitrum인가요?',
        answer:
          '온체인 활동의 대부분이 레이어 2로 옮겨 가고 있습니다. Arbitrum은 이더리움 레이어 1과 같은 보안 모델을 유지하면서 가스 비용을 크게 낮추므로, Cosmic Signature처럼 제스처가 많은 프로토콜에 알맞은 자리입니다.',
      },
      'arbitrum-security': {
        question: 'Arbitrum이 이더리움 레이어 1만큼 안전한 이유는 무엇인가요?',
        answer:
          'Arbitrum은 사이드체인이 아니라 롤업입니다. 모든 트랜잭션 배치는 이더리움 메인넷에 다시 게시됩니다. 이렇게 Arbitrum의 보안은 이더리움 자체에 뿌리를 둡니다. 데이터 저장과 분쟁 해결은 레이어 1에서 이루어집니다.',
      },
      'how-to-get-eth-on-arbitrum': {
        question: 'Arbitrum에서 ETH는 어떻게 얻나요?',
        answer:
          '공식 Arbitrum 브리지나 지원되는 다른 브리지로 이더리움 메인넷의 ETH를 옮겨 오면 됩니다. ETH는 이더리움에 잠기고, 같은 양을 Arbitrum에서 쓸 수 있게 됩니다. 브리지 이용에는 이더리움 레이어 1 가스 비용이 듭니다.',
      },
      'existing-wallet-on-arbitrum': {
        question: '기존 이더리움 지갑을 Arbitrum에서도 쓸 수 있나요?',
        answer:
          '네. 같은 개인 키로 두 네트워크 모두에서 트랜잭션에 서명합니다. 지갑의 네트워크 목록에 Arbitrum 네트워크를 추가하기만 하면 됩니다.',
      },
      'view-tokens-on-arbitrum': {
        question: 'Arbitrum에서 내 CST 토큰과 Cosmic Signature NFT는 어떻게 확인하나요?',
        answer:
          'Cosmic Signature 웹사이트에서 바로 확인하거나, 컨트랙트 주소를 지갑에 직접 추가할 수 있습니다. 컨트랙트 주소는 컨트랙트 페이지와 커뮤니티 Discord에 공개되어 있습니다.',
      },
      'trade-on-arbitrum': {
        question: 'Cosmic Signature NFT와 CST를 Arbitrum에서 거래할 수 있나요?',
        answer:
          '네. Cosmic Signature NFT는 이 컬렉션을 위한 수수료 없는 마켓플레이스 Axiom Zero에서, CST는 Uniswap에서 거래됩니다. 둘 다 Arbitrum의 표준 ERC-721 및 ERC-20 자산이므로 이 표준을 지원하는 어느 마켓플레이스나 거래소에서도 거래할 수 있습니다. 거래 전에는 반드시 컨트랙트 주소를 확인해 주세요.',
      },
      'verify-bid-success': {
        question: '제스처가 정상적으로 제출되었는지 어떻게 확인하나요?',
        answer:
          '성공한 제스처는 Arbitrum에서 확인되며 Arbitrum 블록 탐색기(Arbiscan)에서 볼 수 있습니다. 트랜잭션 해시를 탐색기에 붙여 넣으면 제스처를 검증할 수 있습니다.',
      },
      'game-security': {
        question: '프로토콜의 보안은 어떻게 확보되나요?',
        answer:
          'Cosmic Signature는 커뮤니티가 동작을 독립적으로 살펴볼 수 있도록 컨트랙트 주소, 소스 코드 자료, 검증 맥락을 공개합니다. 스마트 컨트랙트는 독립 보안 기업 Hacken의 보안 감사를 받았으며, 전체 보고서는 보안 감사 페이지에 링크되어 있습니다.',
      },
      'fees-involved': {
        question: '수수료가 있나요?',
        answer:
          '제스처 비용 외에 트랜잭션마다 Arbitrum 네트워크 가스 비용을 냅니다. 가스 비용은 네트워크 상황에 따라 변동하며, Cosmic Signature가 정하는 것이 아닙니다.',
      },
    },
  },
  'trust-and-governance': {
    title: '신뢰와 조율',
    description: '투명성, 팀의 권한, 오픈 소스 비전',
    items: {
      'team-controls': {
        question: '팀은 프로토콜에 어떤 권한을 갖고 있나요?',
        answer:
          '초기에는 팀이 제스처당 시간 증가량이나 배분 경로 비율 같은 프로토콜의 일부 매개변수를 조정할 수 있습니다. 이 권한은 스마트 컨트랙트의 ‘Ownable’ 패턴으로 구현되며 사이클 사이의 구간으로 한정됩니다. 다음 사이클이 활성화되면(첫 제스처 전에 이루어집니다) 핵심 프로토콜 매개변수는 그 사이클이 마감될 때까지 잠깁니다. 이 잠금과 별개로 몇 가지 제한된 권한은 남아 있습니다. 소유자는 첫 제스처가 오기 전까지 사이클 활성화를 미룰 수 있고, 다음 사이클 전의 지연 시간을 언제든 조정할 수 있으며, 주변 컨트랙트(공공재 금고 수령처, NFT 메타데이터 URI, 배분 지갑 회수 기한)를 언제든 관리할 수 있습니다. 프로토콜 컨트랙트는 소유자가 업그레이드(UUPS)할 수도 있지만 사이클 사이에만 가능하며, 현재 배포된 구현은 공개 검증된 V2입니다.',
      },
      'will-team-always-have-control': {
        question: '팀이 프로토콜 매개변수 권한을 계속 갖게 되나요?',
        answer:
          '아닙니다. 프로토콜이 안정되면 소유권은 우주 평의회로 이전됩니다. 그 뒤로 매개변수 변경은 조율 정족수를 충족한 프로토콜 조율 제안을 통해서만 이루어집니다.',
      },
      'what-is-renounce-ownership': {
        question: '‘소유권 포기’란 무슨 뜻인가요?',
        answer:
          '소유권 포기는 배포자 주소가 가진 제어 권한을 영구히 내려놓는 Ownable 컨트랙트 함수입니다. 한 번 호출되면 어떤 특권 역할도 컨트랙트 매개변수를 변경할 수 없습니다.',
      },
      'why-renounce-ownership': {
        question: '팀은 왜 소유권을 포기하려 하나요?',
        answer:
          '목표는 공정하고 탈중앙화된 프로토콜입니다. 소유권 포기는 프로토콜이 가동된 뒤 규칙이 임의로 바뀌지 않도록 보장하여 참여자에게 신뢰와 예측 가능성을 더해 줍니다.',
      },
      'how-team-profits': {
        question: 'Cosmic Signature 팀은 프로토콜에서 어떤 가치를 얻나요?',
        answer:
          '참여자의 제스처에서 나온 ETH를 받는 팀 지갑은 없습니다. 모든 ETH는 사이클 준비금으로 들어가 배분 경로에 따라 배분됩니다. 팀과 프로토콜은 Random Walk NFT를 통해 간접적으로만 이어져 있으며, 프로토콜이 성공하면 그 NFT의 문화적 가치가 높아질 수 있습니다. 주된 동기는 호기심, 창의성, 그리고 오픈 소스 공공재 기여입니다.',
      },
      'why-was-cs-created': {
        question: 'Cosmic Signature는 왜 만들어졌나요?',
        answer:
          'Cosmic Signature는 카오스 이론과 삼체 문제의 풀리지 않는 성질에 매혹된 데서 태어났습니다. 온체인 시드에서 생성되는 고유하고 결정론적인 아트라는 발상은 흥미로울 뿐 아니라 공공재를 지향하는 프로토콜에 잘 어울렸습니다.',
      },
      'what-if-team-disappears': {
        question: '팀이 사라지면 어떻게 되나요?',
        answer:
          '프로토콜은 스스로 지속되도록 설계되었습니다. 시드는 온체인에 저장되어 있고, 누구나 오픈 소스 Rust 파이프라인으로 NFT 이미지와 영상을 다시 생성할 수 있습니다. 따라서 팀의 상황과 관계없이 모든 Cosmic Signature NFT는 계속 이용할 수 있습니다.',
      },
      'can-create-competing-site': {
        question: '이 프로젝트를 포크해서 내 사이트를 만들 수 있나요?',
        answer:
          '물론입니다. 프로젝트가 소유한 컨트랙트, 셰이더, 렌더러, 페이지, 문서는 CC0 1.0으로 퍼블릭 도메인에 헌정되어 있으며 어떤 권리도 유보하지 않습니다. 제3자 의존성, 글꼴, 에셋은 각자의 라이선스를 따릅니다. THIRD_PARTY_NOTICES.md를 참고해 주세요.',
      },
      'donate-to-pot': {
        question: '제스처를 남기지 않고 사이클 준비금에 ETH를 기여할 수 있나요?',
        answer:
          '네. 프로토콜 컨트랙트에는 제스처와 별개로 ETH를 받는 전용 기여 함수가 있으며, 사이클의 기여 목록에 표시될 수 있는 메모를 덧붙일 수 있습니다. 지갑에서 단순 전송하지 말고 앱의 기여 절차를 이용해 주세요. 프로토콜 주소로 직접 보낸 ETH는 기여가 아니라 ETH 제스처로 처리됩니다. 자세한 내용은 Discord로 문의해 주세요.',
      },
      'get-help': {
        question: '궁금한 점이 있을 때 어디에서 도움을 받을 수 있나요?',
        answer:
          '커뮤니티와 지원팀은 Discord, X / Twitter, 그리고 연락처 페이지에 안내된 지원 이메일을 통해 만날 수 있습니다.',
      },
      'stay-updated': {
        question: 'Cosmic Signature 소식은 어떻게 받아 볼 수 있나요?',
        answer:
          '공식 소셜 미디어 채널을 팔로우하고 Discord 커뮤니티에 참여하면 최신 공지, 프로토콜 조율 제안, 사이클 요약을 받아 볼 수 있습니다.',
      },
    },
  },
} satisfies FAQText;
