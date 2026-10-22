import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { FAQText } from './structure';

/**
 * Protocol amounts in this locale's number style (grouping from
 * `i18n/localeConfig.ts` through the format layer, never an Intl tag typed
 * into a copy module).
 */
const cst = formatCount(protocolFacts.specialAllocationCst, 'ko');
const outreachCst = formatCount(protocolFacts.outreachReserveCst, 'ko');

/** protocolFacts stores the example gaps as English strings; render them in Korean. */

/** 한국어 자주 묻는 질문 copy, keyed by the skeleton in structure.ts. */
export const faqTextKo = {
  'getting-started': {
    title: '시작하기',
    description: 'Cosmic Signature의 기본 개념과 참여 방법',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature란 무엇인가요?',
        answer:
          'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 참여자는 퍼포먼스 사이클 동안 제스처를 남기고, 모든 제스처가 사이클의 최종 시그니처를 빚어냅니다. 사이클이 마감되면 프로토콜은 준비금을 정해진 배분 경로로 배분합니다. 이더리움 핵심 기여자 170명 이상을 위한 자금 지원 메커니즘인 Protocol Guild도 그중 하나입니다.',
      },
      'how-does-the-bidding-game-work': {
        question: '퍼포먼스 사이클은 어떻게 진행되나요?',
        answer:
          '사이클의 첫 제스처는 ETH여야 하며 마감 시계를 시작합니다. 이후 제스처는 시간이 지난 뒤에도 저장된 마감 시각에 현재 시간 증가량을 더합니다. 현재 시각에서 시계를 다시 시작하지 않습니다. 마감이 성공적으로 실행될 때까지 제스처가 가능합니다.',
      },
      'what-type-of-gestures-are-available': {
        question: '어떤 종류의 제스처가 있나요?',
        answer:
          'ETH와 CST의 기본 비용은 별도 규칙을 따릅니다. 사이클이 열릴 때 ETH 비용은 보정 구간에서 내려가고, ETH 제스처마다 다음 기본 비용이 올라갑니다. CST 비용은 온체인에 저장된 속도로 내려갑니다. 마감이 가까우면 두 비용 모두 늦은 제스처 할증이 붙지만, 이 할증은 다음 기본 비용이나 별빛 선정 가중치를 높이지 않습니다. 사이클의 첫 제스처는 ETH여야 하며 마감 시계를 시작합니다. 이후 제스처는 시간이 지난 뒤에도 저장된 마감 시각에 현재 시간 증가량을 더합니다. 현재 시각에서 시계를 다시 시작하지 않습니다. 마감이 성공적으로 실행될 때까지 제스처가 가능합니다. ETH 비용 감소에는 각 Random Walk NFT를 단 한 번 사용할 수 있습니다. 컨트랙트는 소유권을 확인하고 사용 표시를 남기며 NFT 자체는 전송하지 않습니다. 앵커링과는 별도 권리입니다.',
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
        answer:
          '사이클의 첫 제스처는 ETH여야 하며 마감 시계를 시작합니다. 이후 제스처는 시간이 지난 뒤에도 저장된 마감 시각에 현재 시간 증가량을 더합니다. 현재 시각에서 시계를 다시 시작하지 않습니다. 마감이 성공적으로 실행될 때까지 제스처가 가능합니다.',
      },
      'can-i-place-multiple-gestures': {
        question: '한 사이클에서 제스처를 여러 번 남길 수 있나요?',
        answer:
          'V3에서는 다음 제스처가 이전 제스처 참여자에게 참여 CST 전액을 각인합니다. 수량은 두 제스처 사이의 시간에 선형으로 비례합니다. 사이클의 첫 제스처는 이 규칙으로 CST를 각인하지 않으며, 마감도 최종 제스처 참여자의 마지막 구간에 추가 참여 CST를 지급하지 않습니다. 두 제스처의 주소가 같으면 해당 주소가 직접 받습니다.',
      },
    },
  },
  'allocations-and-rewards': {
    title: '배분과 앵커링 지급',
    description: '사이클이 마감되면 참여자가 받을 수 있는 것',
    items: {
      'what-is-the-main-allocation': {
        question: '시그니처 배분이란 무엇인가요?',
        answer: `마감을 성공적으로 실행한 주소는 사이클 준비금의 ${protocolFacts.mainEthPercentage}%, 총 ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST, 연속 ID의 Cosmic Signature NFT ${protocolFacts.mainPrizeNftsPerCycle}개를 받습니다. 마감 시각 이후 첫 ${protocolFacts.finalGestureExclusivityHours}시간에는 최종 제스처 참여자만 실행할 수 있고, 그 뒤에는 누구나 실행하여 자기 몫으로 받을 수 있습니다.`,
      },
      'what-rewards-per-bid': {
        question: '제스처마다 무엇을 받나요?',
        answer:
          'V3에서는 다음 제스처가 이전 제스처 참여자에게 참여 CST 전액을 각인합니다. 수량은 두 제스처 사이의 시간에 선형으로 비례합니다. 사이클의 첫 제스처는 이 규칙으로 CST를 각인하지 않으며, 마감도 최종 제스처 참여자의 마지막 구간에 추가 참여 CST를 지급하지 않습니다. 두 제스처의 주소가 같으면 해당 주소가 직접 받습니다.',
      },
      'how-does-the-stellarSelection-work': {
        question: '별빛 선정은 어떻게 이루어지나요?',
        answer:
          '참여자 ETH 별빛 선정과 NFT 별빛 선정 모두 제스처별 가중치를 사용합니다. 가중치는 해당 시점의 ETH 기본 비용이며, Random Walk NFT 비용 감소와 늦은 제스처 할증은 제외합니다. CST 제스처에도 같은 시점의 ETH 기본 비용을 적용합니다. 복원 선정이므로 같은 주소가 여러 번 선정될 수 있습니다. 앵커링 NFT 별빛 선정은 활성 Random Walk NFT를 별도로 대상으로 합니다.',
      },
      'how-random-selection-works': {
        question: '무작위 선정은 어떻게 이루어지나요?',
        answer:
          '참여자 ETH 별빛 선정과 NFT 별빛 선정 모두 제스처별 가중치를 사용합니다. 가중치는 해당 시점의 ETH 기본 비용이며, Random Walk NFT 비용 감소와 늦은 제스처 할증은 제외합니다. CST 제스처에도 같은 시점의 ETH 기본 비용을 적용합니다. 복원 선정이므로 같은 주소가 여러 번 선정될 수 있습니다. 앵커링 NFT 별빛 선정은 활성 Random Walk NFT를 별도로 대상으로 합니다.',
      },
      'how-do-i-claim-my-allocation': {
        question: '수령자가 되면 배분을 어떻게 회수하나요?',
        answer: `마감을 성공적으로 실행한 주소는 사이클 준비금의 ${protocolFacts.mainEthPercentage}%, 총 ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST, 연속 ID의 Cosmic Signature NFT ${protocolFacts.mainPrizeNftsPerCycle}개를 받습니다.

마감 시각 이후 첫 ${protocolFacts.finalGestureExclusivityHours}시간에는 최종 제스처 참여자만 실행할 수 있고, 그 뒤에는 누구나 실행하여 자기 몫으로 받을 수 있습니다.

2차 ETH 배분과 첨부 자산은 배분 지갑에서 별도로 회수합니다. 현재 기한인 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주가 지나면 누구나 미회수 자산을 자기 몫으로 회수할 수 있습니다. 기한 만료만으로 자동 전송되지는 않습니다.`,
      },
      'how-does-anchoring-work': {
        question: '앵커링은 어떻게 작동하나요?',
        answer: `Cosmic Signature NFT를 프로토콜에 앵커링하면 ETH 앵커링 지급을 받을 수 있습니다. 마감되는 사이클마다 사이클 준비금의 ${protocolFacts.anchorDistributionPercentage}%가 앵커링된 Cosmic Signature NFT에 균등하게 나뉘고, 쌓인 ETH는 앵커링을 해제할 때 지급됩니다.\n\nRandom Walk NFT도 앵커링할 수 있지만, 이는 앵커링 NFT 별빛 선정 자격을 얻기 위한 것입니다. 선정된 앵커링 보유자는 ETH가 아니라 CST와 Cosmic Signature NFT를 받습니다.\n\n알아 두어야 할 규칙이 두 가지 있습니다. 모든 NFT는 단 한 번만 앵커링할 수 있으며(앵커링을 해제한 NFT는 다시 앵커링할 수 없습니다), 사이클이 마감될 때 앵커링된 Cosmic Signature NFT가 하나도 없으면 그 사이클의 ${protocolFacts.anchorDistributionPercentage}%는 사이클 준비금에 그대로 남습니다. CST(ERC-20)는 앵커링할 수 없습니다. 앵커링 관리는 계정 메뉴의 내 앵커링 페이지에서 할 수 있습니다.`,
      },
      'what-are-marketing-rewards': {
        question: '홍보 준비금이란 무엇인가요?',
        answer: `프로토콜을 알리는 데 힘을 보태면 CST 토큰(ERC-20)을 받을 수 있습니다. 홍보 준비금은 사이클마다 ${outreachCst} CST를 각인해 생태계 기여자에게 전달합니다. 자세한 안내는 Discord에서 홍보 준비금 재무 담당자에게 문의해 주세요.`,
      },
      'how-many-nfts-minted': {
        question: '사이클마다 Cosmic Signature NFT가 몇 개 각인되나요?',
        answer: `모든 경로가 있으면 한 사이클에서 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 고정 배분 CST ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ko')}개가 각인됩니다. 시그니처 배분은 NFT ${protocolFacts.mainPrizeNftsPerCycle}개에 대해 CST ${formatCount(protocolFacts.specialAllocationCst, 'ko')}개를 합계로 한 번 받습니다. 시간의 전사, 수호 챔피언, 최종 CST 제스처는 각각 NFT 1개와 해당 CST를 받으며, 두 NFT 선정 경로가 나머지를 더합니다. CST 제스처나 앵커링된 Random Walk NFT가 없으면 해당 경로는 생략합니다. 참여 CST는 별도입니다.`,
      },
      'what-happens-to-remaining-eth': {
        question: '사이클 준비금에 남은 ETH는 어떻게 되나요?',
        answer:
          'ETH의 약 절반이 다음 사이클로 이어집니다. 정수 처리, 생략된 경로, 실패한 전송으로 더 많은 ETH가 남을 수 있습니다. 다음 사이클의 시작 준비금이 더 커진다는 보장은 없습니다.',
      },
      'what-happens-to-attached-assets': {
        question: '제스처에 첨부된 토큰이나 NFT는 어떻게 되나요?',
        answer: `제스처에 첨부된 ERC-20 토큰이나 ERC-721 NFT는 배분 지갑 컨트랙트가 에스크로로 보관하며, ETH 사이클 준비금에는 합쳐지지 않습니다. 마감 후에는 사이클 수령자(보통 최종 제스처 참여자)에게 이를 우선 회수할 권리가 있습니다. 첨부 자산이 2차 회수 기한(현재 기본값 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주)을 넘겨도 회수되지 않으면, 누구든 이를 자기 몫으로 회수할 수 있습니다.`,
      },
      'who-receives-10-percent': {
        question: '사이클 준비금의 공공재 배분은 누가 받나요?',
        answer: `마감 시 프로토콜은 사이클 준비금의 ${protocolFacts.publicGoodsPercentage}%를 공공재 금고로 보내려고 시도합니다. 이후 누구나 별도 트랜잭션으로 금고 잔액을 현재 공공재 수령처인 Protocol Guild에 전달할 수 있습니다. 소유자는 수령처를 바꿀 수 있습니다. 프로토콜에서 금고로 보내는 작업이 실패하면 마감을 취소하지 않고 해당 몫이 준비금에 남을 수 있습니다.`,
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
          'ETH와 CST의 기본 비용은 별도 규칙을 따릅니다. 사이클이 열릴 때 ETH 비용은 보정 구간에서 내려가고, ETH 제스처마다 다음 기본 비용이 올라갑니다. CST 비용은 온체인에 저장된 속도로 내려갑니다. 마감이 가까우면 두 비용 모두 늦은 제스처 할증이 붙지만, 이 할증은 다음 기본 비용이나 별빛 선정 가중치를 높이지 않습니다.',
      },
      'what-is-dutch-auction': {
        question: '보정 구간이란 무엇인가요?',
        answer:
          'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
      },
      'how-is-participation-cst-calculated': {
        question: '참여 CST는 어떻게 계산되나요?',
        answer: `참여 CST의 최소 단위 수량은 ${protocolFacts.dynamicCstRewardFormula}입니다. 경과 시간은 초, 사이클 시간 증가량은 마이크로초 단위입니다. CST 수량으로 표시할 때는 결과를 10^18로 나눕니다.

다음 제스처가 이전 참여자에게 전액을 각인합니다. 첫 제스처에는 참여 CST가 없으며 마감도 마지막 구간을 추가 지급하지 않습니다.`,
      },
      'why-minimum-cst-reward-protection': {
        question: '최소 참여 CST 보호란 무엇인가요?',
        answer:
          '최소 참여 CST는 다음 제스처가 이전 참여자에게 각인할 수량을 제한하며, 제출자에게 지급할 수량을 보장하지 않습니다. 두 주소가 같으면 제출자가 직접 받습니다. 0은 이 제한을 해제하며, 사이클의 첫 ETH 제스처는 이 검사를 건너뜁니다. 최대 비용과 네트워크 수수료는 별도 조건입니다.',
      },
      'how-cst-calibration-window-changes': {
        question: '제스처마다 CST 보정 구간은 어떻게 달라지나요?',
        answer:
          'V3는 CST 비용의 하락 속도를 저장하며 구간 길이는 속도와 상한에서 계산합니다. ETH 제스처는 rate + floor(rate / 100)으로 속도 증가를 시도하고, CST 제스처는 rate - floor(rate / 101)로 속도를 줄입니다. 최소 구간 조건을 어기면 ETH의 속도 증가는 적용하지 않습니다. CST 제스처는 할증 전 기본 비용의 두 배, 설정된 최소값, 새 속도에 180초를 곱한 값 가운데 가장 큰 값으로 상한을 다시 설정합니다. 다음 제스처를 즉시 남기는 것은 가능합니다.',
      },
      'what-is-open-finalization-window': {
        question: '공개 마감 구간이란 무엇인가요?',
        answer: `마감을 성공적으로 실행한 주소는 사이클 준비금의 ${protocolFacts.mainEthPercentage}%, 총 ${formatCount(protocolFacts.specialAllocationCst, 'ko')} CST, 연속 ID의 Cosmic Signature NFT ${protocolFacts.mainPrizeNftsPerCycle}개를 받습니다. 마감 시각 이후 첫 ${protocolFacts.finalGestureExclusivityHours}시간에는 최종 제스처 참여자만 실행할 수 있고, 그 뒤에는 누구나 실행하여 자기 몫으로 받을 수 있습니다.`,
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
        answer: `수호 챔피언 자리를 끊기지 않고 가장 오래 지킨 참여자입니다. 수호 챔피언이 최근 제스처 참여자 자리를 가장 오래 지킨 사람이라면, 시간의 전사는 수호 챔피언 자리를 가장 오래 지킨 사람입니다. 사이클이 마감되면 시간의 전사는 사이클 준비금 ETH의 ${protocolFacts.chronoWarriorEthPercentage}%, ${cst} CST, Cosmic Signature NFT 1개를 받습니다.`,
      },
      'does-time-per-bid-stay-same': {
        question: '제스처마다 더해지는 시간은 늘 같나요?',
        answer: `아닙니다. 제스처마다 더해지는 시간은 출시 시점에 정확히 1시간이었고, 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%씩 늘어납니다. 증가량이 커지면 사이클 하나도 더 오래 이어지므로, 실제 달력 시간으로 보면 증가 속도는 자연스럽게 느려집니다.`,
      },
      'why-time-per-bid-increases': {
        question: '제스처마다 더해지는 시간이 왜 점점 늘어나나요?',
        answer:
          '이 메커니즘은 Cosmic Signature NFT의 장기적인 각인 속도를 정합니다. 사이클이 길어질수록 같은 기간에 각인되는 새 NFT가 줄어듭니다.',
      },
      'how-time-increase-affects-game': {
        question: '제스처당 시간 증가는 프로토콜에 어떤 영향을 주나요?',
        answer:
          '시간 증가량이 커지면 사이클 마감 빈도에 영향을 줄 수 있지만, NFT 공급량의 고정 상한이나 일정 기간의 새 작품 수를 보장하지는 않습니다.',
      },
      'what-if-two-gestures-same-time': {
        question: '두 제스처가 동시에 제출되면 어떻게 되나요?',
        answer:
          'Arbitrum 트랜잭션은 시퀀서가 포함한 순서대로 처리됩니다. 뒤의 제스처는 앞의 제스처가 반영된 상태에서 실행됩니다. 최대 비용과 최소 참여 CST 조건을 충족하면 뒤의 제스처도 실행되고, 충족하지 못하면 취소됩니다. 취소된 경우 미리 보기를 갱신한 뒤 다시 시도해 주세요.',
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
          'CST는 제스처에 사용하거나 위임 후 우주 평의회의 조율 가중치로 사용할 수 있습니다. 평의회는 실제로 보유한 자산과 권한만 관리합니다. 현재 핵심 프로토콜의 소유자는 평의회가 아니며, 권한 이전이나 포기에는 별도 온체인 조치가 필요합니다.',
      },
      'what-can-i-do-with-cst': {
        question: 'CST 토큰으로 무엇을 할 수 있나요?',
        answer:
          'CST 토큰은 CST 보정 구간을 통해 ETH 대신 제스처에 쓸 수 있습니다. 제스처에 쓰인 CST는 풀에 모이지 않고 소각되어 공급량에서 영구히 사라집니다. 제스처는 참여 CST를 각인할 수도 있지만, 그 양은 동적이며 이전 제스처 이후 흐른 시간에 따라 달라집니다. CST는 위임한 뒤(자신에게 위임할 수도 있습니다) 우주 평의회에서 조율 가중치로도 쓰입니다.',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFT는 무엇이 특별한가요?',
        answer:
          'NFT 시드는 온체인에 저장되고 이미지와 영상은 오프체인에서 생성됩니다. 재현하려면 같은 시드, 해당 렌더러 버전과 설정, 호환되는 도구가 필요합니다. 시드만 같다고 서로 다른 버전의 결과가 동일하다는 보장은 없습니다.',
      },
      'how-are-nft-images-created': {
        question: 'NFT 이미지는 어떻게 만들어지나요?',
        answer:
          '각 Cosmic Signature NFT는 뉴턴 중력 아래의 삼체 문제를 시각화합니다. 파이프라인은 중력 아래 움직이는 세 천체를 시뮬레이션하고, 380~700나노미터에 걸친 64개 파장 구간에서 그 궤적을 분광 렌더링해 NFT마다 고유한 카오스 패턴을 만듭니다.',
      },
      'significance-of-random-seed': {
        question: 'NFT를 온체인 시드에서 생성하는 이유는 무엇인가요?',
        answer:
          'NFT 시드는 온체인에 저장되고 이미지와 영상은 오프체인에서 생성됩니다. 재현하려면 같은 시드, 해당 렌더러 버전과 설정, 호환되는 도구가 필요합니다. 시드만 같다고 서로 다른 버전의 결과가 동일하다는 보장은 없습니다.',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFT의 수는 제한되어 있나요?',
        answer:
          '시간 증가량이 커지면 사이클 마감 빈도에 영향을 줄 수 있지만, NFT 공급량의 고정 상한이나 일정 기간의 새 작품 수를 보장하지는 않습니다.',
      },
      'impact-of-limiting-nfts': {
        question: '사이클 길이는 새로 각인되는 NFT 수에 어떤 영향을 주나요?',
        answer:
          '시간 증가량이 커지면 사이클 마감 빈도에 영향을 줄 수 있지만, NFT 공급량의 고정 상한이나 일정 기간의 새 작품 수를 보장하지는 않습니다.',
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
          'Arbitrum은 이더리움을 기반으로 하는 레이어 2 롤업입니다. 처리 비용을 낮추고 트랜잭션을 효율적으로 처리하도록 설계되어, 제스처를 반복해서 남기는 Cosmic Signature에 적합합니다. 실제 가스 비용은 네트워크 혼잡도와 작업 내용에 따라 달라집니다.',
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
          '공개 감사는 검토된 과거 컨트랙트 버전에 해당합니다. 이후 V2와 V3의 모든 변경을 독립적으로 검토했다는 뜻은 아닙니다. 공개 소스와 배포 코드가 일치한다는 검증도 보안 평가와 다릅니다. 현재 프로토콜 구현은 V3입니다. 구현 주소는 프록시의 EIP-1967 슬롯과 대조해야 합니다. V3의 공개 소스 검증은 아직 확인되지 않았으며, 과거 V2의 검증은 새 구현에 적용되지 않습니다.',
      },
      'fees-involved': {
        question: '수수료가 있나요?',
        answer:
          '제스처 비용 외에 트랜잭션마다 Arbitrum 네트워크 가스 비용을 냅니다. 가스 비용은 네트워크 상황에 따라 변동하며, Cosmic Signature가 정하는 것이 아닙니다.',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature는 생물학의 COSMIC 데이터베이스와 관련이 있나요?',
        answer:
          '아닙니다. Cosmic Signature는 COSMIC 암 돌연변이 데이터베이스나 생물학의 COSMIC 돌연변이 시그니처와 아무 관련이 없습니다. 결정론적 삼체 NFT 아트에 집중하는 온체인 아트 프로토콜이자 앱입니다.',
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
          '소유자는 컨트랙트의 조건 아래 매개변수와 구현을 바꿀 권한을 유지합니다.\n\n핵심 변경은 사이클이 비활성일 때로 제한되지만 활성화 시각, 다음 지연 시간, 주변 컨트랙트에는 별도 권한이 있습니다.\n\nV3가 우주 평의회에 제어권을 자동 이전하거나 소유자 권한을 자동 해제하지는 않습니다.',
      },
      'will-team-always-have-control': {
        question: '팀이 프로토콜 매개변수 권한을 계속 갖게 되나요?',
        answer:
          '소유자는 컨트랙트의 조건 아래 매개변수와 구현을 바꿀 권한을 유지합니다. 핵심 변경은 사이클이 비활성일 때로 제한되지만 활성화 시각, 다음 지연 시간, 주변 컨트랙트에는 별도 권한이 있습니다. V3가 우주 평의회에 제어권을 자동 이전하거나 소유자 권한을 자동 해제하지는 않습니다.',
      },
      'what-is-renounce-ownership': {
        question: '‘소유권 포기’란 무슨 뜻인가요?',
        answer:
          '소유자는 컨트랙트의 조건 아래 매개변수와 구현을 바꿀 권한을 유지합니다. 핵심 변경은 사이클이 비활성일 때로 제한되지만 활성화 시각, 다음 지연 시간, 주변 컨트랙트에는 별도 권한이 있습니다. V3가 우주 평의회에 제어권을 자동 이전하거나 소유자 권한을 자동 해제하지는 않습니다.',
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
          'Cosmic Signature는 카오스 이론과 삼체 문제의 복잡성에 대한 관심에서 시작되었습니다. 온체인 시드에서 생성되는 고유하고 결정론적인 아트라는 발상은 흥미로울 뿐 아니라 공공재를 지향하는 프로토콜에 잘 어울렸습니다.',
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
          'Discord, X (Twitter), 지원 이메일로 문의할 수 있습니다. 공식 링크와 이메일 주소는 ‘Cosmic Signature 소개’ 페이지에서 확인해 주세요.',
      },
      'stay-updated': {
        question: 'Cosmic Signature 소식은 어떻게 받아 볼 수 있나요?',
        answer:
          '공식 소셜 미디어 채널을 팔로우하고 Discord 커뮤니티에 참여하면 최신 공지, 프로토콜 조율 제안, 사이클 요약을 받아 볼 수 있습니다.',
      },
    },
  },
} satisfies FAQText;
