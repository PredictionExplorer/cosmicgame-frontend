import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('ko-KR');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * 중급 단계: 살아 움직이는 메커니즘. 보정 구간, CST 피드백 루프, 선두 유지
 * 경로, 별빛 선정의 셈법, 평의회 매개변수. 수치는 protocolFacts에서
 * 끌어옵니다.
 */
export const mediumQuestionsTextKo = {
  'eth-opening-price-discovery': {
    prompt: '새 사이클은 시작 ETH 제스처 비용을 어떻게 찾아내나요?',
    options: {
      a: 'ETH와 CST의 기본 비용은 별도 규칙을 따릅니다. 사이클이 열릴 때 ETH 비용은 보정 구간에서 내려가고, ETH 제스처마다 다음 기본 비용이 올라갑니다. CST 비용은 온체인에 저장된 속도로 내려갑니다. 마감이 가까우면 두 비용 모두 늦은 제스처 할증이 붙지만, 이 할증은 다음 기본 비용이나 별빛 선정 가중치를 높이지 않습니다.',
      b: `모든 사이클은 고정된 ${protocolFacts.initialGestureCostEth} ETH로 시작합니다.`,
      c: '우주 평의회가 사이클마다 시작 비용을 표결로 정합니다.',
      d: '누군가 제스처를 남길 때까지 비용이 매시간 두 배가 됩니다.',
    },
    explanation: `주문장 없는 가격 발견입니다. 이전 사이클이 너무 싸게 시작했다면 두 배로 올려 여유 폭을 되찾고, 두 배가 너무 높다면 내려가는 과정에서 누군가 시작할 마음이 드는 수준을 찾아냅니다. 고정된 ${protocolFacts.initialGestureCostEth} ETH를 쓴 것은 맨 첫 사이클만이고, 그 뒤의 모든 사이클은 직전 사이클을 기준으로 보정합니다.`,
    referenceLabel: '백서 §3.1 — 사이클 시작과 ETH 보정 구간',
  },
  'eth-step-up': {
    prompt: 'Pax가 ETH 제스처를 남깁니다. 다음 ETH 제스처의 비용은 어떻게 되나요?',
    options: {
      a: `${protocolFacts.ethGestureCostStepUpPercent}%에 1 wei를 더한 만큼 오릅니다. 이 수열은 공개되어 있고 정확합니다.`,
      b: '두 배가 됩니다.',
      c: '사이클이 마감될 때까지 그대로입니다.',
      d: `더 많은 활동을 끌어들이기 위해 ${protocolFacts.ethGestureCostStepUpPercent}% 내려갑니다.`,
    },
    explanation:
      'ETH와 CST의 기본 비용은 별도 규칙을 따릅니다. 사이클이 열릴 때 ETH 비용은 보정 구간에서 내려가고, ETH 제스처마다 다음 기본 비용이 올라갑니다. CST 비용은 온체인에 저장된 속도로 내려갑니다. 마감이 가까우면 두 비용 모두 늦은 제스처 할증이 붙지만, 이 할증은 다음 기본 비용이나 별빛 선정 가중치를 높이지 않습니다.',
    funFact:
      '덧붙이는 1 wei에는 이유가 있습니다. 비용이 너무 작아 백분율이 0으로 반올림되는 경우에도 엄격한 증가를 보장합니다.',
    referenceLabel: '백서 §4.1 — ETH 제스처',
  },
  'overpay-refund': {
    prompt:
      'Vega가 실수로 현재 제스처 비용보다 눈에 띄게 많은 ETH를 보냅니다. 초과분은 어떻게 되나요?',
    options: {
      a: '같은 트랜잭션에서 Vega에게 환불됩니다.',
      b: '금액이 얼마든 준비금으로 넘어가 돌아오지 않습니다.',
      c: 'Vega의 다음 제스처 비용에 충당됩니다.',
      d: '공공재로 전달됩니다.',
    },
    explanation:
      '더스트 기준값을 넘는 초과 지불은 같은 트랜잭션에서 환불됩니다. 기준값 아래에서는 환불에 드는 가스가 돌려받는 금액보다 크기 때문에 차액이 준비금에 남습니다. 소액 환불의 가스 비용이 환불액보다 커지는 일을 막기 위한 기준입니다.',
    referenceLabel: '백서 §4.1 — ETH 제스처',
  },
  'cst-window-restart': {
    prompt: 'Lyra가 CST 제스처를 남깁니다. CST 보정 구간에는 어떤 일이 생기나요?',
    options: {
      a: 'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
      b: '아무 일도 없습니다. 구간은 있던 자리에서 계속 내려갑니다.',
      c: `비용이 사이클이 끝날 때까지 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST로 고정됩니다.`,
      d: '구간이 닫히고 다음 사이클까지 CST 제스처가 멈춥니다.',
    },
    explanation:
      'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
    referenceLabel: '백서 §4.3 — CST 제스처',
  },
  'cst-free-quiet': {
    prompt:
      '프로토콜이 오랫동안 조용했고 CST 보정 구간이 완전히 지났습니다. 지금은 어떤 상태인가요?',
    options: {
      a: 'CST 제스처 비용은 0입니다. 실행에는 현재 사이클 규칙이 적용되며 가스 비용이 별도로 필요합니다.',
      b: '사이클이 저절로 마감됩니다.',
      c: 'ETH 제스처가 들어올 때까지 CST 제스처가 비활성화됩니다.',
      d: 'CST 비용이 상한까지 올라 있습니다.',
    },
    explanation:
      'CST 보정 구간이 모두 지나면 CST 제스처 비용은 0이 됩니다. 그래도 현재 사이클의 실행 조건을 충족해야 하며, 가스 비용은 별도로 듭니다. 비용이 0이라는 사실만으로 제스처 실행이나 시간 연장이 보장되지는 않습니다. 사이클 마감에도 별도의 트랜잭션이 필요합니다.',
    referenceLabel: '백서 §4.3 — CST 제스처',
  },
  'window-feedback-loop': {
    prompt: 'ETH 제스처가 연달아 들어옵니다. CST 보정 구간의 길이는 어떻게 달라지나요?',
    options: {
      a: 'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
      b: `ETH 제스처마다 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%씩 길어져서 CST 하강이 느려집니다.`,
      c: '아무 영향도 없습니다. 두 통화는 서로 독립적입니다.',
      d: '구간이 원래 지속 시간으로 재설정됩니다.',
    },
    explanation:
      'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
    referenceLabel: '백서 §4.3 — CST 제스처',
  },
  'participation-cst-timing': {
    prompt:
      '출시 매개변수 기준으로 두 제스처가 참여 CST를 각인합니다. 하나는 직전 제스처 1초 뒤에 들어오고, 다른 하나는 하루 내내 이어진 침묵을 끝냅니다. 각각 대략 얼마를 각인하나요?',
    options: {
      a: `이전 참여자에게 약 ${oneSecondExample.cst} CST와 ${oneDayExample.cst} CST가 지급되며, 시간에 선형으로 비례합니다.`,
      b: `타이밍과 상관없이 각각 고정 ${cst(100)} CST입니다.`,
      c: '같은 양입니다. 타이밍은 전혀 상관없습니다.',
      d: '둘 다 0입니다. CST를 각인하는 것은 마감만입니다.',
    },
    explanation: `참여 CST의 최소 단위 수량은 ${protocolFacts.dynamicCstRewardFormula}입니다. 경과 시간은 초, 사이클 시간 증가량은 마이크로초 단위입니다. CST 수량으로 표시할 때는 결과를 10^18로 나눕니다. 다음 제스처가 이전 참여자에게 전액을 각인합니다. 첫 제스처에는 참여 CST가 없으며 마감도 마지막 구간을 추가 지급하지 않습니다.`,
    funFact:
      'V3에서는 다음 제스처가 이전 제스처 참여자에게 참여 CST 전액을 각인합니다. 수량은 두 제스처 사이의 시간에 선형으로 비례합니다. 사이클의 첫 제스처는 이 규칙으로 CST를 각인하지 않으며, 마감도 최종 제스처 참여자의 마지막 구간에 추가 참여 CST를 지급하지 않습니다. 두 제스처의 주소가 같으면 해당 주소가 직접 받습니다.',
    referenceLabel: '백서 §7.1 — 각인 규칙',
  },
  'cst-max-cost-protection': {
    prompt:
      'CST 제스처를 제출할 때, 트랜잭션이 늦게 처리되더라도 Kestrel이 예상보다 많이 내지 않도록 보호하는 것은 무엇인가요?',
    options: {
      a: '받아들일 최대 비용을 직접 지정합니다. 제스처는 승인된 금액보다 많이 쓸 수 없습니다.',
      b: '아무것도 없습니다. 실행 시점의 가격을 그대로 냅니다.',
      c: '사이클이 끝난 뒤 우주 평의회가 초과 청구액을 환불합니다.',
      d: 'CST 비용은 서명과 실행 사이에 결코 변하지 않습니다.',
    },
    explanation:
      'CST 제스처를 제출하는 참여자는 받아들일 최대 비용을 지정하므로, 예상보다 늦게 처리된 제스처도 승인된 금액보다 많이 쓸 수 없습니다. 다른 CST 제스처가 구간을 더 높은 값에서 다시 시작시킨 직후에 가장 중요한 보호 장치입니다.',
    referenceLabel: '백서 §4.3 — CST 제스처',
  },
  'endurance-definition': {
    prompt:
      'Ari가 제스처를 남긴 뒤 열 시간 동안 새로운 제스처가 없었습니다. 이 사이클에서 가장 긴 선두 유지 기록입니다. 현재 Ari는 어떤 칭호의 대상인가요?',
    options: {
      a: '수호 챔피언. 가장 긴 구간 동안 끊기지 않고 최근 제스처의 자리를 지켰기 때문입니다.',
      b: '시간의 전사. 칭호를 가장 오래 유지했기 때문입니다.',
      c: '둘 다 아닙니다. 칭호는 남긴 제스처 수로 정해집니다.',
      d: '최종 제스처 역할. 자동으로 주어집니다.',
    },
    explanation:
      '수호 챔피언은 최근 제스처의 자리를 끊기지 않고 가장 오래 지킨 참여자입니다. 제스처 하나가 버텨 낸 가장 긴 공백이라고도 할 수 있습니다. 시간의 전사 경로는 한 단계 위에 있으며 다른 것을 측정합니다. 수호 챔피언 칭호 자체가 얼마나 오래 유지되었는지입니다.',
    referenceLabel: '백서 §5.2 — 수호 챔피언과 시간의 전사',
  },
  'chrono-definition': {
    prompt:
      'Ari가 열 시간의 선두 유지 기록을 세우고, Bea가 이를 경신하기 전까지 이틀 동안 수호 챔피언 자리를 지켰습니다. 시간의 전사 경로는 무엇을 측정하나요?',
    options: {
      a: '수호 챔피언 칭호를 끊기지 않고 가장 오래 유지한 사람입니다. Ari가 기록을 지킨 이틀은 Ari의 몫으로 셈해집니다.',
      b: '다른 참여자의 제스처 뒤에 가장 빨리 반응하는 사람입니다.',
      c: '전체적으로 가장 많은 사이클에 참여한 사람입니다.',
      d: '사이클의 최종 제스처를 남기는 사람입니다.',
    },
    explanation:
      '수호 챔피언 경로는 만들어 낸 공백을 측정하고, 시간의 전사 경로는 그 기록이 얼마나 오래 유지되었는지를 측정합니다. Ari의 선두 유지 구간은 열 시간이었지만 수호 챔피언으로 있던 기간은 이틀이었고, 시간의 전사 경로가 셈하는 것은 바로 그 기간입니다. 둘 다 마감 시점에야 확정됩니다.',
    referenceLabel: '백서 §5.2 — 수호 챔피언과 시간의 전사',
  },
  'eth-selection-count': {
    prompt: 'ETH 별빛 선정은 마감 시 자기 몫을 어떻게 배분하나요?',
    options: {
      a: `사이클의 제스처 풀에서 자격 ${protocolFacts.ethStellarSelectionRecipients}건이 선정되어 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 균등하게 나눕니다.`,
      b: `자격 ${protocolFacts.nftStellarSelectionRecipients}건이 선정되고, 각각 ETH와 NFT를 받습니다.`,
      c: '자격 1건이 선정되어 몫 전체를 받습니다.',
      d: '모든 참여자가 균등한 몫을 받습니다.',
    },
    explanation: `ETH 별빛 선정은 자격 ${protocolFacts.ethStellarSelectionRecipients}건을 선정하고, 선정된 자격은 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 균등하게 나눕니다. ${protocolFacts.nftStellarSelectionRecipients}건이라는 수치는 별도의 NFT 별빛 선정에 속하며, 그쪽은 ETH가 아니라 CST와 NFT를 전달합니다.`,
    referenceLabel: '백서 §5.3 — 별빛 선정',
  },
  'nft-selection-count': {
    prompt: 'NFT 별빛 선정 수령자는 각각 무엇을 받고, 몇 건이 선정되나요?',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST와 Cosmic Signature NFT 1개를 받으며, 제스처 풀에서 ${protocolFacts.nftStellarSelectionRecipients}건이 선정됩니다.`,
      b: `ETH 몫을 받으며, ${protocolFacts.ethStellarSelectionRecipients}건이 선정됩니다.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST를 받으며, 1건이 선정됩니다.`,
      d: `NFT 1개만 받으며, ${protocolFacts.typicalNftsPerCycle}건이 선정됩니다.`,
    },
    explanation: `모든 경로가 있으면 한 사이클에서 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 고정 배분 CST ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ko')}개가 각인됩니다. 시그니처 배분은 NFT ${protocolFacts.mainPrizeNftsPerCycle}개에 대해 CST ${formatCount(protocolFacts.specialAllocationCst, 'ko')}개를 합계로 한 번 받습니다. 시간의 전사, 수호 챔피언, 최종 CST 제스처는 각각 NFT 1개와 해당 CST를 받으며, 두 NFT 선정 경로가 나머지를 더합니다. CST 제스처나 앵커링된 Random Walk NFT가 없으면 해당 경로는 생략합니다. 참여 CST는 별도입니다.`,
    referenceLabel: '백서 §5.1 — 마감 시 배분',
  },
  'draws-with-replacement': {
    prompt: '한 사이클의 별빛 선정에서 같은 참여자가 두 번 이상 선정될 수 있나요?',
    options: {
      a: '제스처 당시의 ETH 기본 비용을 가중치로 선정하며, 비용 감소와 늦은 할증은 제외합니다. 같은 주소가 여러 번 선정될 수 있습니다.',
      b: '아닙니다. 참여자마다 최대 한 번만 선정될 수 있습니다.',
      c: '제스처를 열 번 이상 남긴 참여자만 중복 선정될 수 있습니다.',
      d: '우주 평의회가 중복을 승인할 때만 가능합니다.',
    },
    explanation:
      '참여자 ETH 별빛 선정과 NFT 별빛 선정 모두 제스처별 가중치를 사용합니다. 가중치는 해당 시점의 ETH 기본 비용이며, Random Walk NFT 비용 감소와 늦은 제스처 할증은 제외합니다. CST 제스처에도 같은 시점의 ETH 기본 비용을 적용합니다. 복원 선정이므로 같은 주소가 여러 번 선정될 수 있습니다. 앵커링 NFT 별빛 선정은 활성 Random Walk NFT를 별도로 대상으로 합니다.',
    referenceLabel: '백서 §5.3 — 별빛 선정',
  },
  'anchored-rwlk-track': {
    prompt: '앵커링된 Random Walk NFT는 사이클에서 무엇을 받나요?',
    options: {
      a: `각 건에 ${cst(protocolFacts.specialAllocationCst)} CST와 Cosmic Signature NFT 1개가 딸린 선정 ${protocolFacts.anchoredRwlkNftSelectionRecipients}건이며, 앵커링한 NFT 수에 따라 가중됩니다. ETH는 없습니다.`,
      b: `${protocolFacts.anchorDistributionPercentage}% ETH 앵커링 지급 가운데 비례하는 몫을 받습니다.`,
      c: '아무것도 받지 않습니다. 앵커링할 수 있는 것은 Cosmic Signature NFT만입니다.',
      d: '앵커링을 해제할 때 한 번 CST를 받습니다.',
    },
    explanation: `Random Walk NFT는 별도로, 그리고 다른 목적으로 앵커링됩니다. 앵커링 NFT 별빛 선정에서 사이클마다 ${protocolFacts.anchoredRwlkNftSelectionRecipients}건이 선정되며, 각 건에 CST와 Cosmic Signature NFT 1개가 딸려 갑니다. ETH 앵커링 지급은 앵커링된 Cosmic Signature NFT에만 돌아갑니다. Random Walk 앵커링에는 ETH가 없습니다.`,
    referenceLabel: '백서 §8 — 앵커링',
  },
  'exclusivity-window': {
    prompt: '최종 제스처 참여자가 마감을 독점하는 시간은 얼마나 되나요?',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours}시간`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간`,
      c: `${protocolFacts.initialCycleTimeIncrementHours}시간`,
      d: `${protocolFacts.initialCstCalibrationWindowHours}시간`,
    },
    explanation: `우선 마감 구간은 ${protocolFacts.finalGestureExclusivityHours}시간입니다. 그 뒤에는 누구든 마감하고 사이클 수령자 역할을 넘겨받을 수 있습니다. ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간이라는 수치는 사이클의 첫 제스처 뒤에 주어지는 초기 카운트다운으로, 전혀 다른 시계입니다.`,
    funFact: `V1은 최종 제스처 참여자에게 ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간의 우선 마감 구간만 주었습니다. 실제 사이클에서 참여자가 정말로 기한을 자다가 놓치는 모습이 확인된 뒤, V2가 이를 두 배로 늘렸습니다.`,
    referenceLabel: '백서 §3.3 — 마감과 공개 마감 구간',
  },
  'escrow-timeout': {
    prompt:
      'Juno가 ETH 별빛 선정에서 선정되었지만 에스크로에 있는 ETH를 회수하지 않습니다. 시한이 지나면 어떻게 되나요?',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks}주 뒤에는 누구든 미회수 배분을 자기 것으로 회수할 수 있습니다.`,
      b: '사이클 준비금으로 돌아갑니다.',
      c: '소각됩니다.',
      d: 'Juno가 나타날 때까지 에스크로에서 무기한 대기합니다.',
    },
    explanation: `에스크로에 있는 배분과 첨부 자산은 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주 동안 기다립니다. 그 뒤에는 누구든 미회수 배분을 자기 것으로 회수할 수 있습니다. 이 규칙은 공개 마감 구간과 같은 원리입니다. 모든 배분은 결국 원하는 손에 닿습니다. 배분은 제때 회수해 주세요.`,
    referenceLabel: '백서 §5.4 — 전달, 에스크로, 회수 기한',
  },
  'push-vs-pull': {
    prompt: '마감 중에 바로 나가는 ETH는 무엇이고, 에스크로에서 기다리는 ETH는 무엇인가요?',
    options: {
      a: '시그니처 배분과 공공재 전달은 바로 나가고, 시간의 전사에게 갈 ETH와 ETH 별빛 선정 몫은 배분 지갑에서 기다립니다.',
      b: '모든 것이 모든 수령자에게 바로 전송됩니다.',
      c: '사이클 수령자의 몫까지 모든 것이 에스크로에서 기다립니다.',
      d: 'CST만 에스크로에 들어가고, ETH는 모두 바로 나갑니다.',
    },
    explanation: `마감 시 프로토콜은 사이클 준비금의 ${protocolFacts.publicGoodsPercentage}%를 공공재 금고로 보내려고 시도합니다. 이후 누구나 별도 트랜잭션으로 금고 잔액을 현재 공공재 수령처인 Protocol Guild에 전달할 수 있습니다. 소유자는 수령처를 바꿀 수 있습니다. 프로토콜에서 금고로 보내는 작업이 실패하면 마감을 취소하지 않고 해당 몫이 준비금에 남을 수 있습니다.`,
    referenceLabel: '백서 §5.4 — 전달, 에스크로, 회수 기한',
  },
  'council-proposal-threshold': {
    prompt: '조율 제안을 제출하려면 주소에 위임된 CST 가중치가 얼마나 필요한가요?',
    options: {
      a: `최소 ${protocolFacts.councilProposalThresholdCst} CST입니다.`,
      b: `최소 ${cst(protocolFacts.specialAllocationCst)} CST입니다.`,
      c: `최소 ${cst(protocolFacts.outreachReserveCst)} CST입니다.`,
      d: '얼마든 됩니다. 기준선이 없습니다.',
    },
    explanation:
      'CST는 제스처에 사용하거나 위임 후 우주 평의회의 조율 가중치로 사용할 수 있습니다. 평의회는 실제로 보유한 자산과 권한만 관리합니다. 현재 핵심 프로토콜의 소유자는 평의회가 아니며, 권한 이전이나 포기에는 별도 온체인 조치가 필요합니다.',
    referenceLabel: '백서 §9 — 우주 평의회',
  },
  'council-timeline': {
    prompt: '오늘 조율 제안이 제출되었습니다. 어떤 일정이 이어지나요?',
    options: {
      a: `${protocolFacts.councilVotingDelayDays}일의 조율 지연 뒤 ${protocolFacts.councilVotingPeriodWeeks}주의 조율 기간이 이어집니다.`,
      b: '제안자가 CST를 충분히 보유했다면 즉시 효력이 생깁니다.',
      c: `${protocolFacts.secondaryRetrievalTimeoutWeeks}주의 지연 뒤 ${protocolFacts.councilVotingDelayDays}일의 조율 기간이 이어집니다.`,
      d: `${protocolFacts.finalGestureExclusivityHours}시간의 지연 뒤 자동으로 실행됩니다.`,
    },
    explanation: `제안은 ${protocolFacts.councilVotingDelayDays}일의 조율 지연을 거친 뒤 ${protocolFacts.councilVotingPeriodWeeks}주의 조율 기간 동안 열려 있습니다. 지연 기간은 보유자가 스냅숏 전에 위임을 조정할 시간을 줍니다. 즉시 효력이 생기는 것은 없습니다.`,
    referenceLabel: '백서 §9 — 우주 평의회',
  },
  'quorum-rule': {
    prompt: '조율 제안은 언제 통과되나요?',
    options: {
      a: `찬성이 반대를 넘고, 찬성과 기권 가중치의 합이 ${protocolFacts.councilQuorumPercent}% 조율 정족수에 이르렀을 때입니다.`,
      b: '찬성만으로 총 CST 공급량의 절반에 이르렀을 때입니다.',
      c: `찬성, 반대, 기권을 합쳐 ${protocolFacts.councilQuorumPercent}%에 이르렀을 때입니다.`,
      d: '프로토콜 소유자가 결과에 확인 서명을 했을 때입니다.',
    },
    explanation: `두 조건이 함께 충족되어야 합니다. 찬성이 반대를 넘어야 하고, 찬성과 기권의 합이 총 CST 공급량의 ${protocolFacts.councilQuorumPercent}%인 조율 정족수에 이르러야 합니다. 반대 가중치는 의도적으로 정족수에 들어가지 않습니다. 제안에 반대했다가 뜻하지 않게 제안이 문턱을 넘도록 돕는 일은 없습니다.`,
    referenceLabel: '백서 §9 — 우주 평의회',
  },
  'weight-activation': {
    prompt:
      'Rook은 지갑에 CST를 보유하고 있지만 평의회에는 관여한 적이 없습니다. Rook의 CST는 조율 가중치를 얼마나 나타내나요?',
    options: {
      a: '전혀 없습니다. 가중치는 자기 자신이나 다른 주소에 위임할 때에만 활성화됩니다.',
      b: 'CST당 1단위가 자동으로 생깁니다.',
      c: 'CST를 얼마나 오래 보유했는지에 따라 다릅니다.',
      d: '가중치는 CST가 아니라 앵커링된 NFT에서 나옵니다.',
    },
    explanation:
      '조율 가중치는 위임으로 활성화됩니다. 보유자가 자기 자신이나 다른 주소에 위임하면 그때부터 CST 하나가 가중치 1단위를 나타냅니다. 위임되지 않은 CST에는 가중치가 전혀 없습니다. 보유만으로는 조율에 참여하는 것이 아닙니다.',
    referenceLabel: '백서 §7.3 — 조율 가중치',
  },
  'time-increment-growth': {
    prompt:
      '제스처마다 더해지는 시간 증가량은 정확히 1시간에서 출발했습니다. 이 값은 어떻게 변해 가나요?',
    options: {
      a: `사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%씩 커져서, 여러 해에 걸쳐 사이클이 조금씩 길어집니다.`,
      b: '영원히 1시간으로 고정되어 있습니다.',
      c: '사이클마다 두 배가 됩니다.',
      d: '참여자가 늘어날수록 줄어듭니다.',
    },
    explanation: `증가량은 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%씩 커집니다. 누적은 조용히 제 일을 합니다. 사이클은 길어지고, NFT 각인 속도는 느려지며, 프로토콜의 박자는 설계된 대로, 세월이 흐를수록 느긋해집니다.`,
    referenceLabel: '백서 §3.2 — 마감 카운트다운',
  },
  'typical-cst-fixed': {
    prompt: '일반적인 사이클은 고정 CST를 얼마나 각인하고, 그 구성은 어떻게 되나요?',
    options: {
      a: `모든 경로가 있으면 한 사이클에서 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 고정 배분 CST ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ko')}개가 각인됩니다. 시그니처 배분은 NFT ${protocolFacts.mainPrizeNftsPerCycle}개에 대해 CST ${formatCount(protocolFacts.specialAllocationCst, 'ko')}개를 합계로 한 번 받습니다. 시간의 전사, 수호 챔피언, 최종 CST 제스처는 각각 NFT 1개와 해당 CST를 받으며, 두 NFT 선정 경로가 나머지를 더합니다. CST 제스처나 앵커링된 Random Walk NFT가 없으면 해당 경로는 생략합니다. 참여 CST는 별도입니다.`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST입니다. 전부 사이클 수령자에게 갑니다.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST입니다. 전부 커뮤니티 홍보에 쓰입니다.`,
      d: '사이클마다 예측할 수 없이 달라집니다.',
    },
    explanation: `모든 경로가 있으면 한 사이클에서 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 고정 배분 CST ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ko')}개가 각인됩니다. 시그니처 배분은 NFT ${protocolFacts.mainPrizeNftsPerCycle}개에 대해 CST ${formatCount(protocolFacts.specialAllocationCst, 'ko')}개를 합계로 한 번 받습니다. 시간의 전사, 수호 챔피언, 최종 CST 제스처는 각각 NFT 1개와 해당 CST를 받으며, 두 NFT 선정 경로가 나머지를 더합니다. CST 제스처나 앵커링된 Random Walk NFT가 없으면 해당 경로는 생략합니다. 참여 CST는 별도입니다.`,
    referenceLabel: '백서 §7.1 — 각인 규칙',
  },
  'attached-assets-destination': {
    prompt: 'Wren이 제스처에 ERC-20 토큰을 첨부합니다. 첨부 자산은 어디로 가나요?',
    options: {
      a: '배분 지갑 에스크로로 갑니다. 마감 뒤에는 사이클 수령자가 우선하여 회수할 수 있습니다.',
      b: '제스처의 ETH와 함께 사이클 준비금으로 들어갑니다.',
      c: '사이클이 마감되면 Wren에게 돌아갑니다.',
      d: '마감 시 소각됩니다.',
    },
    explanation:
      '첨부 자산은 결코 ETH 준비금에 합쳐지지 않습니다. 배분 지갑이 보관하며, 마감 뒤에는 사이클 수령자가 우선하여 회수할 수 있습니다. 다만 에스크로에 있는 다른 모든 배분과 똑같은 공개 회수 시한이 적용됩니다.',
    referenceLabel: '백서 §4.4 — 메시지와 첨부 자산',
  },
  'next-cycle-delay': {
    prompt: '사이클이 막 마감되었습니다. 다음 사이클은 언제 활성화되나요?',
    options: {
      a: `다음 사이클은 성공적인 마감 후 온체인에 설정된 지연 시간이 지나면 열립니다. 현재는 ${protocolFacts.currentNextCycleDelayDays}일입니다. 소유자가 변경할 수 있으며, 초기 기본값 ${protocolFacts.defaultNextCycleDelayMinutes}분은 현재 설정이 아닙니다.`,
      b: '같은 트랜잭션에서 즉시 활성화됩니다.',
      c: `정확히 ${protocolFacts.finalGestureExclusivityHours}시간 뒤에 활성화됩니다.`,
      d: '소유자가 직접 시작할 때에만 활성화됩니다.',
    },
    explanation: `다음 사이클은 성공적인 마감 후 온체인에 설정된 지연 시간이 지나면 열립니다. 현재는 ${protocolFacts.currentNextCycleDelayDays}일입니다. 소유자가 변경할 수 있으며, 초기 기본값 ${protocolFacts.defaultNextCycleDelayMinutes}분은 현재 설정이 아닙니다.`,
    referenceLabel: '백서 §3.3 — 마감과 공개 마감 구간',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
