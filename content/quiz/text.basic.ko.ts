import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

/**
 * 기본 단계: 프로토콜의 큰 틀. 가능한 곳은 상황 설명으로 시작하고, 오답은
 * 누군가 실제로 품고 있는 오해로 구성합니다. 사실과 수치는 protocolFacts에서
 * 끌어오며 백서와 일치합니다.
 */
export const basicQuestionsTextKo = {
  'what-is-cosmic-signature': {
    prompt: '친구가 Cosmic Signature는 대체 무엇이냐고 묻습니다. 어떤 답이 맞을까요?',
    options: {
      a: 'Arbitrum 위에서 시간이 정해진 퍼포먼스 사이클을 잇달아 진행하는 절차적 온체인 아트 프로토콜',
      b: '텍스트 프롬프트를 우주 그림으로 바꿔 주는 AI 이미지 서비스',
      c: '생물학자가 사용하는 암 돌연변이 시그니처 데이터베이스',
      d: 'NFT 컬렉션의 가격 예측 서비스',
    },
    explanation:
      'Cosmic Signature는 절차적 아트 프로토콜입니다. 시간이 정해진 퍼포먼스 사이클이 제스처로 채워지고, 마감이 결정론적 삼체 작품을 각인합니다. 파이프라인 어디에도 AI는 없습니다. 작품은 시드에서 계산된 물리 그 자체이며, 텍스트 프롬프트 이미지 서비스와는 정반대입니다.',
    funFact:
      '이 이름은 잘 알려진 암 돌연변이 데이터베이스 COSMIC과 겹칩니다. 프로토콜은 이 데이터베이스와 아무 관련이 없고, 문서도 이 점을 분명히 밝혀 둡니다.',
    referenceLabel: '학습 센터: Cosmic Signature란 무엇인가요?',
  },
  'what-is-a-gesture': {
    prompt: '프로토콜에서 말하는 제스처란 무엇인가요?',
    options: {
      a: 'ETH 또는 CST를 담아 사이클 카운트다운을 연장하고 별빛 선정 자격을 기록하는 작은 온체인 행위',
      b: '커뮤니티 청원을 위해 모은 오프체인 서명',
      c: '직접 손으로 그려 작품에 더하는 붓질',
      d: '커뮤니티 채널에 올린 메시지',
    },
    explanation:
      '제스처는 프로토콜의 유일한 입력입니다. 제스처 하나하나가 ETH 또는 CST를 담고, 사이클 마감 시각을 뒤로 밀고, 사이클의 별빛 선정에 자격 하나를 기록하며, 참여 CST를 각인할 수 있습니다. 손으로 그리는 것은 아무것도 없습니다. 작품은 마감 시점에 시드에서 계산됩니다.',
    referenceLabel: '백서 §4 — 제스처',
  },
  'two-currencies': {
    prompt: '제스처에 담을 수 있는 통화는 무엇인가요?',
    options: {
      a: 'ETH, 또는 프로토콜 고유의 ERC-20 토큰인 CST',
      b: 'ETH만',
      c: 'CST만',
      d: '스테이블코인을 포함한 모든 ERC-20',
    },
    explanation:
      '입구는 정확히 둘, ETH 제스처와 CST 제스처입니다. 다른 ERC-20 토큰은 첨부 자산으로 제스처에 실을 수 있지만 제스처 자체의 대가가 되지는 못합니다. 제스처 비용은 오직 ETH 또는 CST로만 지불됩니다.',
    referenceLabel: '백서 §4 — 제스처',
  },
  'countdown-extension': {
    prompt:
      '사이클 카운트다운에 시간이 넉넉히 남은 상태에서 Nova가 제스처를 남깁니다. 이 제스처는 시계에 어떤 영향을 주나요?',
    options: {
      a: '저장된 사이클 마감 시각에 현재 시간 증가량을 더합니다.',
      b: `카운트다운을 새로 ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간으로 재설정합니다.`,
      c: '카운트다운을 줄여 사이클을 마감 쪽으로 밀어붙입니다.',
      d: '아무 영향도 없습니다. 시계를 움직이는 것은 ETH 제스처만입니다.',
    },
    explanation: `ETH든 CST든 모든 제스처는 저장된 마감 시각에 현재 시간 증가량을 더합니다. 시계를 고정된 시간으로 되돌리는 일은 결코 없습니다. ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간이라는 수치는 출시 매개변수 기준으로 사이클의 첫 제스처 뒤에 주어지는 초기 카운트다운일 뿐입니다.`,
    referenceLabel: '백서 §3.2 — 마감 카운트다운',
  },
  'final-gesture-role': {
    prompt: '카운트다운이 막 만료되었습니다. 누가 먼저 사이클을 마감할 수 있나요?',
    options: {
      a: '제스처가 가장 뒤에 남은 참여자, 즉 최종 제스처 참여자',
      b: '사이클 동안 제스처를 가장 많이 남긴 참여자',
      c: '프로토콜 소유자',
      d: '사이클의 첫 제스처를 남긴 참여자',
    },
    explanation:
      '사이클 마감 시각이 지나면 최종 제스처 참여자가 마감할 수 있게 되며, 처음에는 이 참여자만 마감할 수 있습니다. 여기서 횟수는 전혀 중요하지 않습니다. 때맞춰 남겨 맨 마지막 자리에 선 제스처 하나가, 그보다 앞선 제스처 백 건보다 우선합니다.',
    referenceLabel: '백서 §3.3 — 마감과 공개 마감 구간',
  },
  'sleepy-beneficiary': {
    prompt:
      '카운트다운이 이틀 전에 만료되었는데 최종 제스처 참여자는 잠잠합니다. 내 지갑에서 마감을 호출하면 어떻게 되나요?',
    options: {
      a: '사이클이 마감되고 마감을 호출한 사람이 사이클 수령자가 되어 ETH 몫, CST, NFT를 모두 받습니다.',
      b: '트랜잭션이 실패합니다. 마감은 오직 최종 제스처 참여자만 할 수 있습니다.',
      c: '사이클은 마감되지만, 모든 것은 여전히 최종 제스처 참여자가 받습니다.',
      d: '우주 평의회가 개입하기로 표결하기 전까지는 아무 일도 일어나지 않습니다.',
    },
    explanation: `최종 제스처 참여자는 ${protocolFacts.finalGestureExclusivityHours}시간 동안 이 권리를 독점합니다. 그 뒤에는 공개 마감 구간이 시작됩니다. 누구든 마감할 수 있고, 컨트랙트는 마감한 사람을 사이클 수령자로 간주하여 그 역할에 딸린 모든 것을 넘깁니다. 이 규칙은 의도적으로 엄격합니다. 참여자가 사라져도 프로토콜을 살아 있게 하고, 부주의에는 대가를 치르게 합니다.`,
    funFact:
      '프로토콜의 어떤 것도 자리를 비운 참여자를 영원히 기다리지 않습니다. 모든 기한은 결국 가장 먼저 호출하는 사람에게 열립니다.',
    referenceLabel: '백서 §3.3 — 마감과 공개 마감 구간',
  },
  'signature-allocation-share': {
    prompt: '마감 시 시그니처 배분은 사이클 준비금의 몇 퍼센트를 차지하나요?',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `시그니처 배분은 마감 순간에 한 번 읽은 프로토콜 ETH 잔액의 ${protocolFacts.mainEthPercentage}%입니다. ${protocolFacts.compoundingReservePercentage}%라는 수치는 전혀 배분되지 않는 몫으로, 누적 준비금이 되어 다음 사이클로 이월됩니다.`,
    referenceLabel: '백서 §5.1 — 마감 시 배분',
  },
  'compounding-reserve': {
    prompt: '왜 퍼포먼스 사이클은 매번 이전보다 큰 준비금으로 시작하나요?',
    options: {
      a: `모든 사이클 준비금의 약 ${protocolFacts.compoundingReservePercentage}%는 결코 배분되지 않고 다음 사이클로 이월됩니다.`,
      b: '팀이 사이클 사이에 준비금을 채워 넣습니다.',
      c: '프로토콜이 사이클마다 새 ETH를 각인합니다.',
      d: '우주 평의회가 표결로 새 ETH를 준비금에 넣습니다.',
    },
    explanation:
      '배분되는 다섯 ETH 경로를 합하면 준비금의 절반이고, 나머지는 자동으로 쌓입니다. 누구도 무엇을 채워 넣지 않고, 어떤 프로토콜도 ETH를 각인할 수는 없습니다. 성장은 순전히 기계적입니다. 프로토콜은 빼내지 않고 쌓아 갑니다.',
    referenceLabel: '백서 §5.1 — 마감 시 배분',
  },
  'art-engine': {
    prompt: 'Cosmic Signature 작품은 실제로 무엇이 만들어 내나요?',
    options: {
      a: '온체인 데이터에서 시드를 얻는, 중력 삼체 문제의 결정론적 물리 시뮬레이션',
      b: '우주 사진으로 미세 조정한 확산 모델',
      c: '작품을 하나하나 그려 업로드하는 아티스트',
      d: '우주 색상 팔레트를 쓰는 무작위 픽셀 생성기',
    },
    explanation:
      '질량이 비슷한 세 천체가 뉴턴 중력 아래에서 궤도를 돕니다. 시드가 초기 조건을 정하고, 나머지는 물리 법칙이 알아서 합니다. 어느 단계에도 생성 모델은 없습니다. 학습 데이터도, 샘플링도, 프롬프트도 없습니다. 모든 시그니처를 유일하게 만드는 것은 무작위성이 아니라 카오스 이론입니다.',
    funFact:
      '삼체 문제에는 일반적인 닫힌 형식의 해가 없습니다. 초기 조건이 감지할 수 없을 만큼만 달라져도 완전히 다른 춤이 펼쳐집니다.',
    referenceLabel: '백서 §6 — 아트: 결정론적 삼체 시그니처',
  },
  'same-seed': {
    prompt:
      '토큰 #42의 온체인 시드를 그대로 넣어 오픈 소스 아트 파이프라인을 다시 실행합니다. 무엇이 나오나요?',
    options: {
      a: '어떤 기기에서든 픽셀 하나까지 동일한 이미지가 나옵니다.',
      b: '작은 무작위 변화가 섞인 비슷한 이미지가 나옵니다.',
      c: '하드웨어가 다르면 다른 이미지가 나옵니다.',
      d: '저해상도 미리보기만 나옵니다. 완전한 작품에는 프로젝트 서버가 필요합니다.',
    },
    explanation:
      '결정론은 가정이 아니라 강제됩니다. 같은 시드는 어떤 기기에서든 비트 하나까지 같은 이미지를 만듭니다. 렌더링된 프레임의 SHA-256 해시를 지속적 통합에서 검사하므로, 출력이 조금이라도 어긋나면 빌드가 실패합니다.',
    referenceLabel: '백서 §6.2 — 재현 가능성과 라이선스',
  },
  'cst-supply-origin': {
    prompt: 'CST는 어디에서 생겨나나요?',
    options: {
      a: '공급량은 0에서 시작하고, 각인은 프로토콜 컨트랙트만 할 수 있습니다. 모든 CST는 어느 사이클의 참여로 거슬러 올라갑니다.',
      b: '출시 때 팀을 위해 큰 몫이 만들어졌습니다.',
      c: '출시 전 초기 지갑에 무상으로 나누어졌습니다.',
      d: '누구든 토큰 컨트랙트를 호출해 CST를 각인할 수 있습니다.',
    },
    explanation:
      'CST 토큰 컨트랙트는 각인과 소각 명령을 프로토콜 컨트랙트에서만 받고, 공급량은 0에서 출발했습니다. 공급 상한도, 사전 각인도, 팀 몫도 없습니다. 새 CST의 유일한 원천은 끈기 있는 참여입니다.',
    referenceLabel: '백서 §7 — CST 토큰',
  },
  'cst-on-spend': {
    prompt: 'Rio가 제스처에 CST를 얼마간 씁니다. 그 CST는 어디로 가나요?',
    options: {
      a: '소각됩니다. 공급량에서 영구히 사라집니다.',
      b: '팀 재무 지갑으로 갑니다.',
      c: '사이클 준비금에 합쳐져 마감 시 다시 배분됩니다.',
      d: '사이클이 마감되면 Rio에게 돌아갑니다.',
    },
    explanation:
      'CST 제스처 비용은 전액 소각됩니다. 그래서 토큰 공급량이 실제 사용에 묶입니다. 조용한 사이클은 조금만 각인하고, CST 활동이 활발하면 공급량이 다시 소각되어 줄어듭니다. 어떤 재무 지갑으로도 흘러가지 않습니다. 그런 지갑은 없습니다.',
    referenceLabel: '백서 §7.2 — 소각과 공급량 변화',
  },
  'public-goods-beneficiary': {
    prompt: `모든 사이클은 준비금의 ${protocolFacts.publicGoodsPercentage}%를 공공재 배분으로 전달합니다. 지금은 누가 받고 있나요?`,
    options: {
      a: '170명이 넘는 이더리움 코어 기여자를 위한 자금 지원 메커니즘인 Protocol Guild',
      b: '프로토콜 팀의 운영 지갑',
      c: 'Arbitrum 검증자',
      d: '무작위로 선정된 NFT 보유자',
    },
    explanation:
      '공공재 금고는 자기 몫을 Protocol Guild로 전달하며, 이 전달은 마감의 일부로 온체인에서 강제됩니다. 사이클마다 누군가가 이행 여부를 결정하지 않습니다. 이유는 이렇습니다. 공공 인프라 위에서 살아가는 프로토콜은 그 인프라에 기계적으로, 정해진 일정에 따라, 공개적으로 자금을 대야 합니다.',
    referenceLabel: '백서 §10 — 공공재',
  },
  'anchoring-basic': {
    prompt:
      'Mira가 자신의 Cosmic Signature NFT를 프로토콜에 앵커링합니다. 앵커링은 Mira에게 무엇을 해 주나요?',
    options: {
      a: `앵커링된 동안 사이클마다 ${protocolFacts.anchorDistributionPercentage}% 앵커링 지급 가운데 비례하는 몫이 NFT에 쌓이고, 앵커링을 해제할 때 회수합니다.`,
      b: 'NFT를 마켓플레이스에 판매 등록합니다.',
      c: 'NFT를 CST로 바꿉니다.',
      d: '새 시드로 작품을 다시 렌더링합니다.',
    },
    explanation:
      '앵커링은 프로토콜이 장기적인 참여를 이어 가는 방식입니다. 앵커링된 Cosmic Signature NFT는 앵커링 지급을 비율대로 나누고, 쌓인 ETH는 해제 시 회수합니다. NFT 자체는 결코 변하지 않습니다. 시드와 작품은 영구적입니다.',
    referenceLabel: '백서 §8 — 앵커링',
  },
  'anchor-once-ever': {
    prompt: 'Mira가 나중에 앵커링을 해제합니다. 다음 달에 그 NFT를 다시 앵커링할 수 있나요?',
    options: {
      a: '아닙니다. 각 NFT는 영구적으로 단 한 번만 앵커링할 수 있습니다. 해제는 되돌릴 수 없습니다.',
      b: '예, 짧은 대기 시간이 지나면 가능합니다.',
      c: '예, 추가 비용을 내면 가능합니다.',
      d: '예, 다만 같은 사이클 안에서만 가능합니다.',
    },
    explanation:
      '‘단 한 번’ 규칙은 흔한 잠금 일정을 되돌릴 수 없는 한 번의 선택으로 대체하여, 앵커링된 집합에 실제 이탈 비용을 부여합니다. NFT를 앵커링된 채로 둘지는 사이클마다 새로 내리는 결정이고, 해제할지는 영구적인 결정입니다.',
    referenceLabel: '백서 §8 — 앵커링',
  },
  'random-walk-perk': {
    prompt: 'Sol이 보유한 Random Walk NFT를 ETH 제스처에 첨부합니다. 어떻게 되나요?',
    options: {
      a: `그 제스처의 비용이 ${protocolFacts.randomWalkDiscountPercentage}% 낮아집니다. NFT는 Sol의 지갑에 남지만 사용됨으로 표시되며, 이는 영구적으로 단 한 번뿐입니다.`,
      b: '비용 인하의 대가로 NFT가 프로토콜에 전송됩니다.',
      c: '제스처 비용이 0이 됩니다.',
      d: 'NFT가 그 제스처가 각인하는 참여 CST를 두 배로 늘립니다.',
    },
    explanation: `Random Walk NFT를 첨부하면 ETH 제스처 한 건의 비용이 ${protocolFacts.randomWalkDiscountPercentage}% 줄어듭니다. NFT는 전송되지 않고, 컨트랙트가 사용됨으로 표시할 뿐입니다. 각 Random Walk NFT는 모든 사이클을 통틀어 정확히 한 번만 첨부할 수 있으므로, 이 비용 인하는 소모성 자원입니다.`,
    referenceLabel: '백서 §4.2 — Random Walk NFT 첨부',
  },
  'first-gesture-currency': {
    prompt: '새 사이클이 막 활성화되었습니다. 어떤 제스처로 사이클을 열 수 있나요?',
    options: {
      a: 'ETH 제스처. CST 제스처는 두 번째 제스처부터 가능해집니다.',
      b: 'CST 제스처. CST가 프로토콜 고유의 토큰이기 때문입니다.',
      c: '첫 제스처에는 두 통화 중 어느 쪽이든 됩니다.',
      d: '사이클은 프로토콜 소유자만 열 수 있습니다.',
    },
    explanation:
      '모든 사이클은 ETH 보정 구간이 값을 매기는 ETH 제스처로 열려야 합니다. 사이클이 진행되기 시작하면 CST가 두 번째 입구가 됩니다. 사이클을 여는 특권 계정은 없습니다. 첫 제스처를 남기는 사람이 사이클을 엽니다.',
    referenceLabel: '백서 §4.3 — CST 제스처',
  },
  'message-on-gesture': {
    prompt: '제스처는 가치 말고 무엇을 더 담을 수 있나요?',
    options: {
      a: `온체인에 기록되는 최대 ${protocolFacts.gestureMessageMaxLength}바이트의 메시지와, 첨부된 ERC-20 토큰 또는 ERC-721 NFT를 담을 수 있습니다.`,
      b: '아무것도 없습니다. 제스처는 가치 전송일 뿐입니다.',
      c: '컨트랙트에 저장되는 이미지 파일을 담을 수 있습니다.',
      d: '오프체인에 저장되는 무제한 텍스트를 담을 수 있습니다.',
    },
    explanation: `제스처에는 최대 ${protocolFacts.gestureMessageMaxLength}바이트의 메시지를 담아 온체인에 함께 기록할 수 있고, 토큰이나 NFT를 첨부할 수도 있습니다. 첨부 자산은 배분 지갑이 보관하며, 마감 뒤에는 사이클 수령자가 우선하여 회수할 수 있습니다.`,
    funFact:
      '제스처에 첨부된 모든 메시지는 Arbitrum에서 영구히 읽을 수 있습니다. 사이클을 가로질러 엮인 공개 방명록입니다.',
    referenceLabel: '백서 §4.4 — 메시지와 첨부 자산',
  },
  'who-runs-cycles': {
    prompt: '사이클마다 ETH를 어떻게 배분할지는 누가 정하나요?',
    options: {
      a: '아무도 정하지 않습니다. 배분 비율은 검증된 컨트랙트에 상수로 들어 있고, 마감 시 기계적으로 실행됩니다.',
      b: '팀이 사이클마다 검토한 뒤 배분에 서명합니다.',
      c: '오라클 서비스가 배분 비율을 계산합니다.',
      d: '앱의 백엔드 서버가 전송을 실행합니다.',
    },
    explanation:
      '기계적 배분은 프로토콜을 떠받치는 세 가지 특성 가운데 하나입니다. 참여자와 배분 규칙 사이에 재량을 가진 계정은 없고, 제스처의 ETH를 받는 팀 지갑도 없습니다. 앱과 서버는 컨트랙트가 이미 한 일을 보여 줄 뿐입니다.',
    referenceLabel: '백서 §1 — 서론',
  },
  'nft-count-typical': {
    prompt: '일반적인 사이클은 Cosmic Signature NFT를 몇 개 각인하나요?',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle}개`,
      b: '1개',
      c: `${protocolFacts.nftStellarSelectionRecipients}개`,
      d: '100개',
    },
    explanation: `일반적인 사이클은 NFT ${protocolFacts.typicalNftsPerCycle}개를 각인합니다. 역할 NFT ${protocolFacts.roleNftsPerCycle}개(사이클 수령자, 시간의 전사, 수호 챔피언, 최종 CST 제스처), 참여자 대상 별빛 선정 NFT ${protocolFacts.nftStellarSelectionRecipients}개, 앵커링된 Random Walk 별빛 선정 NFT ${protocolFacts.anchoredRwlkNftSelectionRecipients}개입니다. 경로 하나를 건너뛴 사이클은 그보다 적게 각인합니다.`,
    referenceLabel: '백서 §5.1 — 마감 시 배분',
  },
  'chrono-endurance-exist': {
    prompt: '수호 챔피언 경로와 시간의 전사 경로는 무엇을 측정하나요?',
    options: {
      a: '시간에 걸쳐 얼마나 오래 버텼는지를 측정합니다. 누가 가장 나중에 또는 가장 많이 제스처를 남겼는지는 아닙니다.',
      b: '사이클 동안 누가 ETH를 가장 많이 썼는지 측정합니다.',
      c: '누가 제스처를 가장 많이 남겼는지 측정합니다.',
      d: '사이클이 열릴 때 누가 먼저 제스처를 남겼는지 측정합니다.',
    },
    explanation:
      '두 경로는 위치가 아니라 얼마나 오래 버텼는지를 측정합니다. 수호 챔피언은 최근 제스처의 자리를 끊기지 않고 가장 오래 지킨 참여자이고, 시간의 전사는 수호 챔피언 칭호 자체를 가장 오래 지킨 참여자입니다. 더 많이 쓰거나 더 많이 제스처를 남겨도 어느 쪽도 직접 결정되지 않습니다.',
    referenceLabel: '백서 §5.2 — 수호 챔피언과 시간의 전사',
  },
  'stellar-selection-what': {
    prompt: '별빛 선정이란 무엇인가요?',
    options: {
      a: '사이클 동안 제스처마다 기록된 자격 가운데에서 마감 시 컨트랙트가 수령자를 선정하는 메커니즘',
      b: '활동량으로 참여자 순위를 매기는 순위표',
      c: 'NFT 작품에 부여되는 희귀도 등급',
      d: '작품 속 별자리에 이름을 붙이는 체계',
    },
    explanation:
      '각 제스처는 사이클의 별빛 선정 풀에 자격 하나를 기록합니다. 마감 시 컨트랙트가 ETH 별빛 선정과 NFT 별빛 선정을 위해 자격을 선정하므로, 선정되는 빈도는 참여에 비례합니다. 이는 순위가 아니라 배분 메커니즘입니다.',
    referenceLabel: '백서 §5.3 — 별빛 선정',
  },
  'ecosystem-optionality': {
    prompt:
      '앱, 마켓플레이스, 예측 플랫폼이 하루 동안 모두 멈춥니다. 그래도 할 수 있는 일은 무엇인가요?',
    options: {
      a: '전부입니다. 모든 메커니즘은 컨트랙트를 직접 호출해 실행할 수 있습니다.',
      b: '앱이 돌아오기 전까지는 아무것도 할 수 없습니다.',
      c: '배분 회수만 가능하고 제스처는 남길 수 없습니다.',
      d: 'CST 제스처만 가능하고 ETH 제스처는 남길 수 없습니다.',
    },
    explanation:
      '컨트랙트를 둘러싼 생태계, 곧 앱, Axiom Zero, Uniswap 유동성, Chaos Zero는 편의일 뿐 의존 대상이 아닙니다. 어느 것도 필수가 아닙니다. 제스처, 마감, 앵커링, 회수는 모두 검증된 컨트랙트를 직접 호출해 실행할 수 있습니다.',
    referenceLabel: '백서 §2 — 프로토콜 개요',
  },
  'what-it-is-not': {
    prompt: '백서가 설명하는 프로토콜의 본질에 맞는 문장은 무엇인가요?',
    options: {
      a: '참여자는 참여 그 자체와 가치를 맞바꾸며, 프로토콜은 어떤 종류의 운영자 마진도 남기지 않습니다.',
      b: 'CST를 취득하면 타인의 노력으로 금전적 이득을 얻을 수 있는 확실한 길이 열립니다.',
      c: '운영자가 사이클마다 일정 비율을 자기 몫으로 챙깁니다.',
      d: '프로토콜은 시간이 지나면 NFT 가치가 오른다고 약속합니다.',
    },
    explanation:
      '모든 배분 경로는 참여자, 앵커링된 NFT, 누적 준비금, 공공재로 흘러갑니다. 운영자 마진은 없습니다. 백서는 가격, 유동성, 미래 가치에 관해 어떤 약속도 하지 않으며, 타인의 노력으로 금전적 이득을 기대하고 CST나 NFT를 취득해서는 안 된다고 분명히 말합니다.',
    referenceLabel: '백서 §14.1 — Cosmic Signature가 아닌 것',
  },
  'where-recorded': {
    prompt: '제스처, 시드, 사이클 이력은 실제로 어디에 있나요?',
    options: {
      a: '온체인, 즉 이더리움 레이어 2 네트워크인 Arbitrum One 위에 있습니다.',
      b: '프로젝트의 비공개 데이터베이스에 있습니다.',
      c: '팀이 고정해 둔 IPFS 파일에만 있습니다.',
      d: '기록되지 않습니다. 합계만 남습니다.',
    },
    explanation:
      '프로토콜은 Arbitrum One 위에서 실행되고, 중요한 기록, 곧 모든 제스처와 시드와 배분은 온체인에 있습니다. 그래서 작품은 재현 가능하고, 배분은 어떤 서버도 신뢰하지 않은 채 누구나 확인할 수 있습니다.',
    referenceLabel: '학습 센터: Arbitrum 위의 Cosmic Signature',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
