import { protocolFacts } from '@/content/protocol-facts';

import type { WhitePaperText } from './structure';
import { WHITE_PAPER_VERSION } from './types';

const cst = (amount: number): string => amount.toLocaleString('ko-KR');

/** protocolFacts stores the example gaps as English strings; render them in Korean. */
const ELAPSED_KO: Record<string, string> = {
  '0 seconds': '0초',
  '1 second': '1초',
  '60 seconds': '60초',
  '1 hour': '1시간',
  '1 day': '1일',
};

/** Korean white-paper copy, keyed by the skeleton in structure.ts. */
export const whitePaperTextKo = {
  metadata: {
    title: 'Cosmic Signature 백서 | 절차적 온체인 아트 프로토콜',
    description:
      'Cosmic Signature의 공식 참조 문서입니다. 퍼포먼스 사이클, 제스처, 배분 경로, 결정론적 삼체 NFT 아트, CST, 앵커링, 우주 평의회, 프로토콜 업그레이드, 완전한 탈중앙화로 가는 길을 다룹니다.',
  },
  breadcrumbLabel: '백서',
  breadcrumbs: {
    ariaLabel: '탐색 경로',
    homeLabel: '홈',
  },
  hero: {
    eyebrow: '백서',
    subtitle: 'Arbitrum 위의 절차적 온체인 아트 프로토콜',
    versionLabel: `버전 ${WHITE_PAPER_VERSION}`,
    dateLabel: '2026년 8월',
    downloadLabel: 'PDF 다운로드',
  },
  abstract: {
    heading: '요약',
    paragraphs: [
      'Cosmic Signature는 Arbitrum One 위에서 작동하는 절차적 아트 프로토콜입니다. 정해진 시간 동안 이어지는 퍼포먼스 사이클이 연속해서 진행됩니다. 사이클이 진행되는 동안 참여자는 ETH 또는 프로토콜의 ERC-20 토큰인 CST로 제스처를 남깁니다. 모든 제스처는 사이클의 카운트다운을 연장하고, 사이클의 별빛 선정에 자격 한 건을 기록하며, 새 CST를 각인할 수 있습니다. 카운트다운이 끝나고 사이클이 마감되면 프로토콜은 ETH 준비금을 10개가 넘는 배분 경로로 배분하고, 새 세대의 Cosmic Signature NFT를 각인하며, 고정된 몫을 이더리움 핵심 기여자 170여 명을 지원하는 자금 조달 메커니즘인 Protocol Guild로 전달합니다. 준비금의 약 절반은 다음 사이클로 이월되므로, 모든 사이클은 이전 사이클보다 큰 준비금으로 시작합니다.',
      '각 Cosmic Signature NFT는 중력 삼체 문제를 결정론적으로 렌더링한 작품입니다. 온체인 시드에서 생성되며, 누구든 픽셀 단위까지 똑같이 재현할 수 있습니다. 어떤 신경망도 이미지에 관여하지 않습니다. 이 백서는 프로토콜의 메커니즘과 토큰 설계를 빠짐없이 설명하고, 현재 적용 중인 V2 업그레이드를 기록하며, 예정된 V3 업그레이드를 소개하고, 설계가 완성되는 즉시 배포 주소에서 모든 형태의 특권적 통제를 제거하겠다는 약속을 밝힙니다.',
    ],
  },
  tocHeading: '목차',
  sections: {
    introduction: {
      heading: '서론',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature는 두 가지 신념에서 출발했습니다. 첫째, 제너러티브 아트는 그 안에 어떤 임의성도 없을 때, 즉 모든 이미지가 시드로 고정된 물리 과정의 출력이고 누구든 그 과정을 다시 실행해 결과를 검증할 수 있을 때 가장 흥미롭습니다. 둘째, 참여자를 대신해 ETH를 보관하는 프로토콜은 모든 wei가 어디로 가는지 기계적이고 읽기 쉬운 답을 내놓을 의무가 있습니다.',
        },
        {
          kind: 'paragraph',
          text: '그 결과가 시간을 중심으로 설계된 프로토콜입니다. 퍼포먼스 사이클이 시작되고, 제스처로 채워지며, 카운트다운이 끝나면 닫힙니다. 제스처는 작은 온체인 행위입니다. ETH 또는 CST를 담고, 짧은 메시지나 첨부 자산을 실을 수 있으며, 사이클의 마감 시각을 더 뒤로 밀어냅니다. 카운트다운이 끝나는 순간 마지막까지 남아 있는 제스처가 최종 제스처이며, 그 참여자가 사이클을 마감합니다. 마감은 준비금을 배분하고, 사이클의 NFT를 각인하며, 다음 사이클을 준비합니다.',
        },
        {
          kind: 'paragraph',
          text: '설계를 뒷받침하는 성질은 세 가지입니다.',
        },
        {
          kind: 'list',
          items: [
            '결정론. 작품은 각인 시점에 온체인에 기록된 시드로 계산됩니다. 렌더링 파이프라인은 오픈 소스이며, 같은 시드는 언제나 비트 단위까지 같은 이미지와 영상을 만들어 냅니다.',
            '기계적 배분. 배분 비율은 검증된 컨트랙트에 고정된 상수입니다. 참여자와 배분 규칙 사이에 재량을 행사하는 계정은 없으며, 어떤 팀 지갑도 제스처에서 나온 ETH를 받지 않습니다.',
            '한정된 팀의 역할. 소유자 권한은 범위가 좁고, 사이클이 진행되는 동안에는 잠기며, 남은 업그레이드가 완료되는 즉시 전부 제거될 예정입니다.',
          ],
        },
        {
          kind: 'paragraph',
          text: '이 백서는 프로토콜의 참조 문서입니다. 2절은 시스템의 윤곽을 그립니다. 3~5절은 사이클, 제스처, 배분을 명세합니다. 6절은 아트를 다룹니다. 7~10절은 CST, 앵커링, 우주 평의회, 공공재를 다룹니다. 11절은 보안과 검증 가능성을 다룹니다. 12절과 13절은 업그레이드 이력과 완전한 탈중앙화로 가는 길을 기록하고, 14절은 이 프로토콜이 무엇이 아닌지 분명히 밝힙니다. 이 백서에 인용된 숫자는 컨트랙트 상수 또는 온체인 파라미터의 출시 시점 값이며, 최종 권위는 부록 A에 나열된 배포 컨트랙트에 있습니다.',
        },
      ],
    },
    'protocol-overview': {
      heading: '프로토콜 개요',
      blocks: [
        {
          kind: 'paragraph',
          text: '시스템은 하나의 핵심 컨트랙트와, 그 주위를 둘러싼 여러 개의 단일 목적 컨트랙트로 이루어집니다. 업그레이드 가능한 프록시 뒤에 배포된 핵심 컨트랙트가 사이클을 운영합니다. 제스처 비용을 산정하고, 카운트다운을 추적하며, 사이클 준비금을 보관하고, 마감을 실행합니다. 그 주위에는 CST 토큰, Cosmic Signature NFT 컬렉션, 배분을 위한 에스크로 지갑, 두 개의 앵커링 지갑, 공공재 금고, 홍보 준비금, 우주 평의회가 자리합니다.',
        },
        {
          kind: 'table',
          table: {
            columns: ['구성 요소', '역할'],
            rows: [
              [
                '프로토콜 컨트랙트',
                '퍼포먼스 사이클을 운영합니다. 제스처 비용 산정, 카운트다운, 사이클 준비금, 마감을 담당합니다.',
              ],
              [
                'CST (ERC-20)',
                '참여 토큰입니다. 프로토콜만 각인할 수 있고, 제스처에 쓰이면 소각되며, 위임하면 조율 가중치를 나타냅니다.',
              ],
              [
                'Cosmic Signature NFT (ERC-721)',
                '결정론적 삼체 작품입니다. 마감 시에만 각인되며, 시드는 온체인에 저장됩니다.',
              ],
              [
                'Random Walk NFT',
                '같은 팀이 앞서 만든 제너러티브 아트 컬렉션입니다. 일회성 제스처 비용 할인과 별도의 앵커링 선정 경로를 제공합니다.',
              ],
              [
                '배분 지갑',
                '2차 ETH 배분과 제스처에 첨부된 자산을 보관하는 에스크로입니다. 기한이 지나면 회수가 개방됩니다.',
              ],
              [
                '앵커링 지갑',
                'Cosmic Signature NFT용(ETH 앵커링 지급)과 Random Walk NFT용(선정 자격)으로 하나씩 있습니다.',
              ],
              [
                '공공재 금고',
                '사이클마다 공공재 배분을 받아 전달합니다. 현재 수령처는 Protocol Guild입니다.',
              ],
              [
                '홍보 준비금',
                `사이클마다 ${cst(protocolFacts.outreachReserveCst)} CST를 받아 커뮤니티 홍보에 사용합니다.`,
              ],
              ['우주 평의회', '위임된 CST가 조율 가중치를 나타내는 온체인 조율 기구입니다.'],
            ],
          },
        },
        {
          kind: 'paragraph',
          text: '컨트랙트 주위로 생태계도 자라났습니다. app.cosmicsignature.com의 앱, NFT 마켓플레이스 Axiom Zero, Arbitrum 위의 CST Uniswap 유동성, 그리고 사이클 결과 예측 플랫폼인 Chaos Zero가 있습니다. 어느 것도 필수는 아닙니다. 이 백서에 설명된 모든 메커니즘은 컨트랙트를 직접 호출해 실행할 수 있습니다.',
        },
      ],
    },
    'performance-cycle': {
      heading: '퍼포먼스 사이클',
      blocks: [
        {
          kind: 'paragraph',
          text: '사이클은 하나의 시간 구간입니다. 비용이 내려가는 보정 구간으로 시작해, 제스처로 채워지고, 사이클 마감 시각이 지나 누군가 마감하면 끝납니다. 이 절은 시계를 다루고, 제스처 자체는 4절에서 다룹니다.',
        },
      ],
      subsections: {
        'eth-calibration-window': {
          heading: '사이클 시작과 ETH 보정 구간',
          blocks: [
            {
              kind: 'paragraph',
              text: `모든 사이클은 ETH 제스처로 시작해야 하며, 그 비용은 ETH 보정 구간이 정합니다. 구간은 이전 사이클에서 실제로 지불된 시작 비용의 ${protocolFacts.ethCalibrationCeilingMultiplier}배에서 출발해, 그 출발값의 ${protocolFacts.ethCalibrationFloorDivisor}분의 1에 1 wei를 더한 하한까지 선형으로 내려갑니다. 출시 파라미터 기준으로 하강에는 약 2일이 걸립니다. 이 기간은 사이클 시간 증분에 연동되어 있어 프로토콜이 오래될수록 천천히 늘어납니다. 아무도 제스처를 남기지 않은 채 구간이 모두 지나면 비용은 하한에 머무릅니다. 첫 사이클은 고정값 ${protocolFacts.initialGestureCostEth} ETH로 시작했습니다.`,
            },
            {
              kind: 'paragraph',
              text: `이 시작 메커니즘은 주문장 없이 가격 발견을 수행합니다. 이전 사이클이 너무 낮은 비용으로 시작했다면 ${protocolFacts.ethCalibrationCeilingMultiplier}배 상향이 여유 폭을 되찾아 주고, 그렇게 올린 값이 너무 높다면 2일에 걸친 하강이 누군가 기꺼이 시작할 수준을 찾아냅니다.`,
            },
          ],
        },
        countdown: {
          heading: '마감 카운트다운',
          blocks: [
            {
              kind: 'paragraph',
              text: `시작 제스처가 시계를 작동시키며, 출시 파라미터 기준으로 사이클 마감 시각을 약 ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간 뒤로 설정합니다. 이후의 모든 제스처는 ETH든 CST든 현재의 시간 증분을 저장된 마감 시각에 더합니다. 증분은 정확히 ${protocolFacts.initialCycleTimeIncrementHours}시간에서 시작해 사이클이 마감될 때마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%씩 늘어나므로, 사이클은 점차 길어지고 NFT 각인 속도는 해를 거듭할수록 느려집니다. 제스처가 계속 들어오는 동안 사이클 길이에는 정해진 상한이 없지만, 실제로는 오르는 제스처 비용 때문에 무한정 연장하기가 비싸집니다.`,
            },
            {
              kind: 'paragraph',
              text: '연장은 현재 시점이 아니라 저장된 시각에 적용됩니다. 카운트다운이 끝난 뒤, 그러나 마감이 실행되기 전에 남긴 제스처는 저장된 값에 증분 하나를 더하고 최종 제스처 자리를 넘겨받습니다. 시계를 다시 시작시키지는 않습니다.',
            },
          ],
        },
        finalization: {
          heading: '마감과 공개 마감 구간',
          blocks: [
            {
              kind: 'paragraph',
              text: '사이클 마감 시각이 지나면 최종 제스처를 남긴 참여자가 마감할 자격을 얻습니다. 마감은 하나의 트랜잭션입니다. 프로토콜의 ETH 잔액을 읽고, 5절의 배분 경로에 따라 배분하며, 사이클의 NFT와 CST를 각인하고, 새 작품마다 시드를 기록하며, 다음 사이클을 예약합니다.',
            },
            {
              kind: 'paragraph',
              text: `최종 제스처 참여자는 이 권리를 ${protocolFacts.finalGestureExclusivityHours}시간 동안 독점합니다. 그 뒤에는 공개 마감 구간이 시작됩니다. 누구든 마감할 수 있고, 컨트랙트는 마감을 실행한 사람을 그 사이클의 수령자로 간주해 이 역할에 따르는 모든 것, 즉 시그니처 배분의 ETH 몫, CST 각인, NFT, 첨부 자산에 대한 우선권을 부여합니다. 이 규칙은 의도적으로 관용을 두지 않습니다. 참여자가 사라져도 프로토콜이 멈추지 않게 하고, 부주의에는 대가를 매깁니다. 2일 안에 행동하지 않은 수령자는 그 역할을 가장 먼저 호출하는 이에게 열어 둔 셈입니다.`,
            },
            {
              kind: 'paragraph',
              text: `마감 뒤에는 짧은 지연(기본값 ${protocolFacts.defaultNextCycleDelayMinutes}분)을 거쳐 다음 사이클이 활성화되고, 그 보정 구간이 시작됩니다.`,
            },
          ],
        },
      },
    },
    gestures: {
      heading: '제스처',
      blocks: [
        {
          kind: 'paragraph',
          text: '제스처는 프로토콜의 유일한 입력입니다. 통화가 무엇이든 제스처 하나하나는 카운트다운을 연장하고, 사이클의 참여자 별빛 선정에 자격 한 건을 기록하며, 5.2절의 선두 유지 기록을 갱신하고, 7.1절에 설명된 대로 참여 CST를 각인할 수 있습니다.',
        },
      ],
      subsections: {
        'eth-gestures': {
          heading: 'ETH 제스처',
          blocks: [
            {
              kind: 'paragraph',
              text: `시작 제스처 이후 각 ETH 제스처는 다음 ETH 제스처 비용을 ${protocolFacts.ethGestureCostStepUpPercent}% 올리고 1 wei를 더합니다. 이 수열은 공개되어 있고 정확합니다. 누구든 행동에 나서기 전에 컨트랙트에서 현재 비용을 읽을 수 있습니다. 소액 기준치를 넘는 초과 지불액은 같은 트랜잭션에서 환불됩니다. 기준치 아래에서는 환불에 드는 가스가 돌려받는 금액보다 크기 때문에 차액은 준비금에 남습니다.`,
            },
          ],
        },
        'random-walk-attachment': {
          heading: 'Random Walk NFT 첨부',
          blocks: [
            {
              kind: 'paragraph',
              text: `Random Walk NFT를 보유한 참여자는 이를 ETH 제스처 하나에 첨부해 그 제스처의 비용을 ${protocolFacts.randomWalkDiscountPercentage}% 할인받을 수 있습니다. NFT는 전송되지 않으며, 컨트랙트가 사용됨으로 표시할 뿐입니다. 각 Random Walk NFT는 모든 사이클을 통틀어 정확히 한 번만 첨부할 수 있으므로, 할인은 소모성 자원이 되고 고정된 외부 컬렉션이 프로토콜 경제에 묶입니다.`,
            },
          ],
        },
        'cst-gestures': {
          heading: 'CST 제스처',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST는 두 번째 참여 방법입니다. CST 보정 구간은 이전 CST 제스처에 지불된 비용의 ${protocolFacts.cstCalibrationCeilingMultiplier}배에서 시작하되 시작값이 ${protocolFacts.cstCalibrationCeilingMinCst} CST를 밑돌지는 않으며, 구간의 지속 시간에 걸쳐 0까지 선형으로 내려갑니다. 모든 CST 제스처는 새 출발값에서 구간을 다시 시작시키며, 사용된 CST는 소각되어 공급량에서 영구히 제거됩니다.`,
            },
            {
              kind: 'paragraph',
              text: `구간의 지속 시간 자체도 살아 있는 파라미터이며, 프로토콜의 조용한 피드백 루프 가운데 하나입니다. 처음에는 ${protocolFacts.initialCstCalibrationWindowHours}시간을 기준으로 시작했습니다. ETH 제스처 하나는 이를 약 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% 줄이고, CST 제스처 하나는 약 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% 늘립니다. 따라서 ETH 활동이 활발하면 CST 하강이 빨라져 CST 제스처가 더 일찍 매력적인 선택이 되고, CST 활동이 활발하면 하강은 다시 느려집니다. 이 루프는 모든 사이클을 두 통화가 균형을 이루는 쪽으로 슬며시 이끕니다.`,
            },
            {
              kind: 'paragraph',
              text: '하강이 0에 닿을 수 있기 때문에, 긴 침묵 뒤에는 CST 제스처의 비용이 거의 0에 가까워질 수 있습니다. 이는 의도된 설계입니다. CST 잔액이 조금이라도 있는 사람이라면 누구든 사이클을 연장할 수 있음을 보장하고, CST 제스처마다 이루어지는 소각은 토큰 공급량을 실제 사용에 묶어 둡니다. CST 제스처를 제출하는 참여자는 수용할 최대 비용을 지정하므로, 예상보다 늦게 처리된 제스처가 승인한 금액 이상을 지불하는 일은 없습니다.',
            },
            {
              kind: 'paragraph',
              text: '모든 사이클의 첫 제스처는 ETH여야 하며, CST 제스처는 두 번째 제스처부터 가능합니다.',
            },
          ],
        },
        'messages-and-attachments': {
          heading: '메시지와 첨부 자산',
          blocks: [
            {
              kind: 'paragraph',
              text: `제스처에는 최대 ${protocolFacts.gestureMessageMaxLength}바이트의 메시지를 실을 수 있으며, 메시지는 제스처와 함께 온체인에 기록됩니다. 제스처에는 ERC-20 토큰이나 ERC-721 NFT를 첨부할 수도 있습니다. 첨부 자산은 ETH 준비금에 합쳐지지 않고 배분 지갑이 보관하며, 마감 뒤에는 사이클 수령자가 이를 회수할 우선권을 갖습니다. 단, 5.4절의 공개 회수 기한이 적용됩니다.`,
            },
          ],
        },
      },
    },
    'allocation-tracks': {
      heading: '사이클 준비금과 배분 경로',
      blocks: [
        {
          kind: 'paragraph',
          text: '제스처에 지불된 모든 ETH는 이전 사이클 준비금의 약 절반과 함께 프로토콜 컨트랙트에 쌓입니다. 이 잔액이 사이클 준비금입니다. 마감은 이를 한 번 읽고 정해진 비율대로 배분합니다.',
        },
      ],
      subsections: {
        'distribution-at-finalization': {
          heading: '마감 시 배분',
          blocks: [
            {
              kind: 'table',
              table: {
                columns: ['ETH 경로', '사이클 준비금 중 비율', '수령자'],
                rows: [
                  [
                    '시그니처 배분',
                    `${protocolFacts.mainEthPercentage}%`,
                    '사이클 수령자. 보통 최종 제스처 참여자입니다.',
                  ],
                  [
                    '시간의 전사 배분',
                    `${protocolFacts.chronoWarriorEthPercentage}%`,
                    '수호 챔피언 자리를 가장 오래 지킨 참여자(5.2절).',
                  ],
                  [
                    '공공재 배분',
                    `${protocolFacts.publicGoodsPercentage}%`,
                    'Protocol Guild. 공공재 금고를 거칩니다.',
                  ],
                  [
                    '앵커링 지급',
                    `${protocolFacts.anchorDistributionPercentage}%`,
                    '앵커링된 Cosmic Signature NFT. NFT 수에 비례해 나눕니다.',
                  ],
                  [
                    'ETH 별빛 선정',
                    `${protocolFacts.stellarSelectionEthPercentage}%`,
                    `사이클의 제스처 풀에서 선정된 자격 ${protocolFacts.ethStellarSelectionRecipients}건이 금액을 균등하게 나눕니다.`,
                  ],
                  [
                    '누적 준비금',
                    `~${protocolFacts.compoundingReservePercentage}%(나머지)`,
                    '다음 사이클로 이월됩니다.',
                  ],
                ],
                footnote: '비율은 마감 시점의 프로토콜 ETH 잔액을 기준으로 계산합니다.',
              },
            },
            {
              kind: 'paragraph',
              text: '배분되는 다섯 경로의 합은 준비금의 절반입니다. 나머지는 누적됩니다. 프로토콜은 빼내지 않고 쌓아 가며, 모든 사이클은 이전 사이클보다 큰 준비금으로 시작합니다. 앵커링된 Cosmic Signature NFT가 하나도 없는 상태로 사이클이 마감되면 그 사이클의 앵커링 지급은 건너뛰고 해당 몫도 함께 누적됩니다.',
            },
            {
              kind: 'table',
              table: {
                columns: ['CST 및 NFT 경로', '배분 내용', '수령자'],
                rows: [
                  [
                    '시그니처 배분',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개`,
                    '사이클 수령자.',
                  ],
                  [
                    '시간의 전사',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개`,
                    '시간의 전사.',
                  ],
                  [
                    '수호 챔피언',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개`,
                    '수호 챔피언.',
                  ],
                  [
                    '최종 CST 제스처',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개`,
                    '사이클의 마지막 CST 제스처를 남긴 참여자.',
                  ],
                  [
                    'NFT 별빛 선정',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개, ${protocolFacts.nftStellarSelectionRecipients}회`,
                    `제스처 풀에서 선정된 자격 ${protocolFacts.nftStellarSelectionRecipients}건.`,
                  ],
                  [
                    '앵커링 NFT 별빛 선정',
                    `${cst(protocolFacts.specialAllocationCst)} CST와 NFT 1개, ${protocolFacts.anchoredRwlkNftSelectionRecipients}회`,
                    `앵커링된 Random Walk NFT를 대상으로 ${protocolFacts.anchoredRwlkNftSelectionRecipients}회 선정.`,
                  ],
                  [
                    '홍보 준비금',
                    `${cst(protocolFacts.outreachReserveCst)} CST`,
                    '커뮤니티 홍보(7.1절).',
                  ],
                ],
              },
            },
            {
              kind: 'paragraph',
              text: `따라서 전형적인 사이클은 고정 배분으로 Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개와 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST를 각인하고, 여기에 개별 제스처가 그 과정에서 각인한 참여 CST가 더해집니다. CST 제스처가 없는 사이클은 최종 CST 제스처 경로를 건너뛰고, 앵커링된 Random Walk NFT가 없는 사이클은 앵커링 선정을 건너뜁니다.`,
            },
          ],
        },
        'endurance-and-chrono': {
          heading: '수호 챔피언과 시간의 전사',
          blocks: [
            {
              kind: 'paragraph',
              text: '두 경로는 위치가 아니라 버텨 낸 시간을 측정합니다. 수호 챔피언은 사이클 동안 ‘가장 최근 제스처를 남긴 참여자’라는 자리를 끊기지 않고 가장 오랫동안 지킨 참여자, 즉 제스처 하나가 버텨 낸 가장 긴 공백을 만든 참여자입니다. 시간의 전사는 한 단계 위에 있습니다. 수호 챔피언이라는 칭호 자체를 가장 오랫동안 끊기지 않고 지킨 참여자입니다.',
            },
            {
              kind: 'paragraph',
              text: '차이는 미묘하지만 실재합니다. 한적한 오후에 제스처를 남기고 열 시간 동안 자리를 내주지 않은 참여자는 강력한 선두 유지 구간을 기록합니다. 그 참여자가 사이클을 시간의 전사로 마치는지는 다른 참여자가 그 기록을 넘어서기 전까지 기록이 얼마나 오래 유지되는지에 달려 있습니다. 선두 유지는 만들어 낸 공백의 길이를 재고, 시간의 전사 경로는 그 기록이 얼마나 오래 살아남았는지를 잽니다. 둘 다 마감 시점에야 확정됩니다.',
            },
          ],
        },
        'stellar-selections': {
          heading: '별빛 선정',
          blocks: [
            {
              kind: 'paragraph',
              text: `각 제스처는 사이클의 참여자 선정 풀에 자격 한 건을 기록합니다. 마감 시 컨트랙트는 ETH 별빛 선정을 위해 자격 ${protocolFacts.ethStellarSelectionRecipients}건을 선정하며, 선정된 자격은 준비금의 ${protocolFacts.stellarSelectionEthPercentage}%를 균등하게 나눕니다. NFT 별빛 선정을 위해서는 자격 ${protocolFacts.nftStellarSelectionRecipients}건을 선정합니다. 선정은 복원 추출 방식이므로 같은 참여자가 여러 번 선정될 수 있고, 자격은 남긴 제스처 수에 따라 늘어납니다. 선정 빈도는 참여에 비례합니다.`,
            },
            {
              kind: 'paragraph',
              text: `별도의 앵커링 NFT 별빛 선정은 앵커링된 Random Walk NFT를 대상으로 진행됩니다. 사이클마다 ${protocolFacts.anchoredRwlkNftSelectionRecipients}회 선정하며, 각 보유자가 앵커링한 NFT 수에 따라 가중됩니다. 이 경로는 CST와 Cosmic Signature NFT만 배분하며 ETH는 포함하지 않습니다.`,
            },
            {
              kind: 'paragraph',
              text: '이 선정을 뒷받침하는 무작위성은 마감 시 온체인에서 구성됩니다. 11.3절에서 그 출처와 한계를 설명합니다.',
            },
          ],
        },
        'delivery-and-timeouts': {
          heading: '전달, 에스크로, 회수 기한',
          blocks: [
            {
              kind: 'paragraph',
              text: '배분은 의도적으로 직접 전달과 회수, 두 방식으로 나뉩니다. 시그니처 배분의 ETH는 마감 도중 사이클 수령자에게 직접 전달되고, 공공재 전달도 마찬가지입니다. 시간의 전사에게 가는 ETH와 ETH 별빛 선정 몫은 에스크로 컨트랙트인 배분 지갑에 보관되며, 각 수령자가 편한 때에 회수합니다. CST와 NFT는 마감 도중 수령자에게 직접 각인됩니다.',
            },
            {
              kind: 'paragraph',
              text: `에스크로에 보관된 배분과 첨부 자산은 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주 동안 회수를 기다립니다. 그 뒤에는 누구든 미회수 배분을 자기 몫으로 회수할 수 있습니다. 이 규칙은 공개 마감 구간과 같은 원리입니다. 프로토콜의 어떤 것도 자리에 없는 참여자를 영원히 기다리지 않으며, 모든 배분은 결국 원하는 이의 손에 닿습니다. 배분은 지체 없이 회수해 주세요.`,
            },
          ],
        },
      },
    },
    'the-art': {
      heading: '아트: 결정론적 삼체 시그니처',
      blocks: [
        {
          kind: 'paragraph',
          text: '모든 Cosmic Signature NFT는 중력 삼체 문제를 렌더링한 작품입니다. 질량이 비슷한 세 천체가 뉴턴 중력 아래에서 서로의 주위를 돕니다. 삼체 문제에는 일반적인 닫힌 형태의 해가 없고, 궤적은 카오스적입니다. 초기 조건이 알아차릴 수 없을 만큼 조금만 달라져도 전혀 다른 춤이 펼쳐집니다. 그 카오스가 컬렉션의 엔진입니다. 시드가 초기 조건을 정하고, 물리가 나머지를 맡으며, 어떤 두 시그니처도 같지 않습니다.',
        },
        {
          kind: 'paragraph',
          text: '어느 단계에도 생성 모델은 관여하지 않습니다. 학습 데이터도, 샘플링도, 프롬프트도 없습니다. 파이프라인은 물리 시뮬레이션과 그 뒤를 잇는 렌더러로 이루어지며, Rust로 작성되어 오픈 소스로 공개되었고, 완전히 결정론적입니다.',
        },
      ],
      subsections: {
        'art-pipeline': {
          heading: '파이프라인',
          blocks: [
            {
              kind: 'list',
              items: [
                '시드. 각인 시점에 컨트랙트가 온체인 데이터(11.3절)에서 32바이트 시드를 도출해 NFT와 함께 저장합니다. 시드는 SHA3-256 난수 생성기를 초기화하며, 이후의 모든 것은 시드의 순수 함수입니다.',
                '시뮬레이션. 10만 개의 후보 구성을 각각 100만 물리 스텝씩 4차 요시다 심플렉틱 적분기로 적분합니다. 이 적분기는 긴 시간 범위에서도 시스템의 에너지 거동을 보존합니다.',
                '선별. 보르다 집계로 각 후보의 카오스 정도와 세 천체가 이루는 삼각형이 정삼각형에 가까운 정도를 점수화한 뒤, 풀에서 시각적으로 가장 흥미로운 궤도를 고릅니다.',
                '카메라. 느린 타원형 카메라 드리프트가 시점을 궤도 사이로 이동시켜 각 시그니처에 영화적인 시차 효과를 부여합니다.',
                '색. OKLab 지각 색 공간에서 천체마다 색상을 120도씩 떨어뜨려 혼합하고, 드리프트와 사인파로 변조합니다.',
                '스펙트럼 렌더링. 380~700nm를 아우르는 64개의 파장 구간이 속도에 따라 두께가 달라지는 궤도 궤적을 심도 효과와 함께 렌더링합니다.',
                '마무리. AgX 톤매핑, 블룸, OpenSimplex 성운 레이어, 컬러 그레이딩이 프레임을 완성합니다.',
              ],
            },
            {
              kind: 'paragraph',
              text: '모든 NFT의 출력물은 16비트 PNG와 30초 길이의 H.265 영상입니다.',
            },
          ],
        },
        'reproducibility-and-license': {
          heading: '재현 가능성과 라이선스',
          blocks: [
            {
              kind: 'paragraph',
              text: '결정론은 가정이 아니라 강제되는 원칙입니다. 같은 시드는 어떤 기기에서도 픽셀 단위까지 같은 이미지를 만들며, 생성된 프레임의 SHA-256 해시는 지속적 통합 과정에서 검증됩니다. 모든 시드가 온체인에 저장되고 파이프라인이 공개되어 있으므로 컬렉션은 어떤 서버에도 의존하지 않습니다. 내일 모든 서버가 사라져도 모든 시그니처를 체인에서 다시 생성할 수 있습니다.',
            },
            {
              kind: 'paragraph',
              text: '소유자는 NFT에 최대 32바이트의 이름을 온체인으로 붙일 수 있습니다. 프로젝트가 소유한 컨트랙트, 셰이더, 렌더링 파이프라인은 어떤 권리도 유보하지 않고 CC0 1.0에 따라 퍼블릭 도메인에 헌정되며, 제3자 의존성은 각자의 라이선스를 유지합니다.',
            },
          ],
        },
      },
    },
    cst: {
      heading: 'CST 토큰',
      blocks: [
        {
          kind: 'paragraph',
          text: 'CST는 프로토콜의 ERC-20 토큰입니다. 공급량은 0에서 시작하며, 토큰 컨트랙트는 프로토콜 컨트랙트가 보내는 각인과 소각 지시만 받아들입니다. 유통 중인 모든 CST의 출처는 어느 사이클에서의 참여로 거슬러 올라갑니다.',
        },
      ],
      subsections: {
        'imprint-rules': {
          heading: '각인 규칙',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST는 세 가지 흐름으로 유통에 들어옵니다. 참여 CST는 아래 공식에 따라 제스처 시점에 각인됩니다. 공로 CST는 마감 시 각인됩니다. 사이클의 NFT 배분 각 건에 ${cst(protocolFacts.specialAllocationCst)} CST가 따라붙으며, 전형적인 사이클에서는 ${protocolFacts.typicalNftsPerCycle}건입니다. 마지막으로 사이클마다 ${cst(protocolFacts.outreachReserveCst)} CST가 홍보 준비금으로 가며, 팀은 이를 커뮤니티 홍보에 사용합니다. 이는 팀이 관리하는 유일한 반복 CST 흐름이며, 어떤 특별한 권한도 수반하지 않습니다.`,
            },
            {
              kind: 'formula',
              formula: protocolFacts.dynamicCstRewardFormula,
              caption:
                '제스처 하나가 각인하는 참여 CST. 경과 시간은 직전 제스처부터 측정하며, 현재 사이클 시간 증분에 맞춰 스케일을 조정합니다.',
            },
            {
              kind: 'paragraph',
              text: '쉽게 말해, 각인량은 직전 제스처 이후 경과한 시간의 제곱근에 비례해 커집니다. 직전 제스처 1초 뒤에 남긴 제스처는 거의 아무것도 각인하지 않고, 하루의 침묵을 끝내는 제스처는 수백 CST를 각인합니다.',
            },
            {
              kind: 'table',
              table: {
                columns: ['직전 제스처 이후 경과 시간', '참여 CST'],
                rows: protocolFacts.dynamicCstRewardExamples.map((example) => [
                  ELAPSED_KO[example.elapsed] ?? example.elapsed,
                  example.cst,
                ]),
                footnote: `출시 시점의 시간 증분(정확히 ${protocolFacts.dynamicCstRewardExamplesAssumeIncrementHours}시간)을 기준으로 계산했습니다. 증분이 커질수록 금액은 조금씩 낮아지며, 앱의 실시간 미리보기와 컨트랙트가 최종 기준입니다.`,
              },
            },
          ],
        },
        'supply-dynamics': {
          heading: '소각과 공급량 변화',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST는 사용될 때마다 유통에서 빠져나갑니다. 모든 CST 제스처의 비용 전액이 소각됩니다. 따라서 공급량은 행동이 결정합니다. 조용한 사이클은 참여 CST를 적게 각인하고, 활발한 CST 사용은 공급량을 다시 태워 줄이며, 고정된 공로 CST와 홍보 흐름은 전형적인 사이클마다 예측 가능한 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST를 더합니다. 상한도, 사전 각인도, 팀 배분도 없습니다.`,
            },
            {
              kind: 'paragraph',
              text: '제곱근 공식 자체가 V2 업그레이드(12.2절)에서 도입된 공급 조절 장치입니다. 원래 설계는 제스처마다 고정 100 CST를 각인했는데, 이 때문에 기계 속도로 이어지는 제스처 연쇄가 새 CST의 무한한 원천이 되었습니다. 현재 규칙에서는 빠르게 연달아 남긴 제스처가 거의 0을 각인하고, 인내심 있는 참여가 공급을 만들어 냅니다.',
            },
          ],
        },
        'coordination-weight': {
          heading: '조율 가중치',
          blocks: [
            {
              kind: 'paragraph',
              text: 'CST는 우주 평의회(9절)의 가중치 토큰 역할도 합니다. 가중치는 위임으로 활성화됩니다. 보유자가 자신 또는 다른 주소에 위임하면 각 CST가 조율 가중치 한 단위를 나타냅니다. 토큰은 타임스탬프 기반 체크포인트를 사용하므로, 제안의 스냅숏은 블록 번호가 아니라 실제 시각을 기준으로 삼습니다.',
            },
          ],
        },
      },
    },
    anchoring: {
      heading: '앵커링',
      blocks: [
        {
          kind: 'paragraph',
          text: `앵커링은 장기적인 참여 의지를 표현하는 프로토콜의 방식입니다. 소유자는 Cosmic Signature NFT를 프로토콜에 앵커링할 수 있으며, 앵커링된 동안 NFT는 사이클마다 ${protocolFacts.anchorDistributionPercentage}%의 앵커링 지급에서 비례 몫을 누적합니다. 누적된 ETH는 앵커링을 해제할 때 회수합니다. 정해진 기간도 페널티도 없지만, 앵커링은 NFT마다 한 번뿐인 결정입니다. 각 NFT는 영구적으로 단 한 번만 앵커링할 수 있으므로, 해제하면 그 NFT의 앵커링 자격은 영구히 끝납니다.`,
        },
        {
          kind: 'paragraph',
          text: '이 한 번뿐인 규칙은 통상적인 잠금 기간 일정을 단 한 번의 되돌릴 수 없는 선택으로 대체하며, 앵커링된 집합에 실질적인 이탈 비용을 부여합니다. NFT를 계속 앵커링해 둘지는 사이클마다 살아 있는 결정이고, 해제할지는 영구적인 결정입니다.',
        },
        {
          kind: 'paragraph',
          text: `Random Walk NFT는 별도로, 그리고 다른 목적으로 앵커링합니다. 앵커링된 Random Walk NFT는 앵커링 NFT 별빛 선정(5.3절)의 대상이 되며, 사이클마다 ${protocolFacts.anchoredRwlkNftSelectionRecipients}회 선정에 각각 ${cst(protocolFacts.specialAllocationCst)} CST와 Cosmic Signature NFT 1개가 따릅니다. Random Walk 앵커링에는 ETH 앵커링 지급이 없습니다. 같은 한 번뿐인 규칙이 적용됩니다.`,
        },
      ],
    },
    'cosmic-council': {
      heading: '우주 평의회',
      blocks: [
        {
          kind: 'paragraph',
          text: `우주 평의회는 프로토콜의 온체인 조율 기구로, 보안 감사를 거친 OpenZeppelin Governor 프레임워크 위에 CST를 가중치 토큰으로 삼아 구축되었습니다. 위임된 가중치를 ${protocolFacts.councilProposalThresholdCst} CST 이상 보유한 주소는 누구든 조율 제안을 제출할 수 있습니다. 제안은 ${protocolFacts.councilVotingDelayDays}일의 조율 지연을 거친 뒤 ${protocolFacts.councilVotingPeriodWeeks}주의 조율 기간 동안 열려 있습니다.`,
        },
        {
          kind: 'paragraph',
          text: `제안은 두 조건이 모두 충족될 때 통과합니다. 찬성이 반대를 넘어야 하고, 찬성과 기권 가중치의 합이 총 CST 공급량의 ${protocolFacts.councilQuorumPercent}%인 조율 정족수에 도달해야 합니다. 반대 가중치는 정족수에 포함되지 않습니다. 가중치 표현은 암호학적 행위이며, 주식이나 지분 증권이 아닙니다. 위임은 언제든 변경할 수 있습니다.`,
        },
        {
          kind: 'paragraph',
          text: '현재 평의회는 팀의 제한된 소유자 역할과 나란히 조율을 수행합니다. 13절의 탈중앙화 단계 이후에는 평의회가 프로토콜의 유일한 조율 계층이 됩니다.',
        },
      ],
    },
    'public-goods': {
      heading: '공공재',
      blocks: [
        {
          kind: 'paragraph',
          text: `모든 사이클은 사이클 준비금의 ${protocolFacts.publicGoodsPercentage}%를 공공재 금고로 전달합니다. 금고의 현재 수령처는 이더리움 핵심 프로토콜 기여자 170여 명을 지원하는 공동 자금 조달 메커니즘인 Protocol Guild입니다. 이 전달은 마감의 일부로 온체인에서 강제되며, 사이클마다 이를 지킬지 말지 누군가가 결정하는 일은 없습니다. 프로토콜이 많이 쓰일수록 이더리움 자체가 의존하는 인프라로 더 많이 흘러갑니다.`,
        },
        {
          kind: 'paragraph',
          text: '이유는 단순합니다. Cosmic Signature는 이더리움의 기반 계층이 계속 작동하기 때문에 존재하며, 공공 인프라 위에서 살아가는 프로토콜은 다른 모든 일을 처리하는 방식 그대로, 즉 기계적으로, 정해진 일정에 따라, 공개적으로 그 인프라에 자금을 보내야 합니다. 금고는 사이클과 무관하게 자발적인 ETH 기여도 직접 받습니다.',
        },
        {
          // lexicon-allow-start: tax-status disclaimer must name the concepts it denies.
          kind: 'note',
          text: '이는 공공재 주소(현재 Protocol Guild)로 ETH를 전달하는 것입니다. 미국 세법상의 자선 기여나 기부가 아니며, Cosmic Signature는 어느 관할권에서든 그 세무 처리에 관해 어떤 진술도 하지 않습니다.',
          // lexicon-allow-end
        },
      ],
    },
    security: {
      heading: '보안, 무작위성, 검증 가능성',
      blocks: [],
      subsections: {
        'independent-review': {
          heading: '독립 검토',
          blocks: [
            {
              kind: 'paragraph',
              text: '2025년 말, Hacken은 Cosmic Signature 컨트랙트에 대한 독립 보안 검토를 수행했습니다. 핵심 프로토콜, CST 토큰, 두 NFT 통합, 앵커링 지갑, 그리고 이를 뒷받침하는 지갑 및 시스템 관리 컨트랙트를 대상으로 했습니다. 2026년 1월에 공개된 최종 보고서에는 23건의 발견 사항이 실려 있습니다. 심각 및 높음 등급은 없으며, 중간 3건, 낮음 8건, 정보성 12건입니다. 대부분은 서면 근거와 함께 검토되고 수용된 설계상의 트레이드오프입니다.',
            },
            {
              kind: 'paragraph',
              text: '수동 검토와 함께 Hacken은 14개의 시스템 불변 조건을 퍼즈 테스트했습니다. 예컨대 프로토콜의 ETH 잔액이 항상 적립액에서 배분액을 뺀 값과 같다는 성질입니다. 14개 모두 10,000회 실행에서 유지되었습니다. 전체 보고서는 공개되어 있으며 참고 자료에 링크되어 있습니다.',
            },
            {
              kind: 'paragraph',
              text: '외부 검토 외에도 저장소에는 Certora 정형 검증 명세, Solidity SMTChecker 설정, Slither 정적 분석, 그리고 Solidity 소스의 완전한 커버리지를 목표로 하는 테스트 스위트가 포함되어 있습니다.',
            },
          ],
        },
        'defensive-design': {
          heading: '방어적 설계',
          blocks: [
            {
              kind: 'list',
              items: [
                '재진입 가드가 핵심 컨트랙트의 모든 외부 진입점을 보호합니다.',
                '전송 대신 회수: 2차 ETH 배분과 첨부 자산은 마감 도중 전송되지 않고 에스크로에 보관되므로, 어떤 수령자 컨트랙트도 사이클이 닫히는 것을 막을 수 없습니다.',
                '실패 허용 전달: 공공재 전송이 완료되지 못하더라도 마감은 그대로 진행되며, 해당 이벤트는 나중에 처리할 수 있도록 기록됩니다.',
                '사이클 간 잠금: 핵심 파라미터 변경과 컨트랙트 업그레이드는 사이클이 진행되는 동안에는 불가능합니다(13절).',
              ],
            },
          ],
        },
        randomness: {
          heading: '무작위성',
          blocks: [
            {
              kind: 'paragraph',
              text: '프로토콜은 두 곳에서 무작위성이 필요합니다. 마감 시의 별빛 선정과 새 NFT마다 부여되는 시드입니다. 프로토콜은 이전 블록 해시, 현재 기본 수수료, 그리고 ArbSys 및 ArbGasInfo 프리컴파일에서 얻는 Arbitrum 고유의 엔트로피(이전 Arbitrum 블록 해시, 가스 적체량, L1 가격 카운터)를 한데 합쳐 온체인에서 시드를 만듭니다. 개별 값은 그 시드에서 keccak256으로 도출합니다. 프리컴파일 호출은 실패를 허용하도록 설계되어, 하나를 사용할 수 없으면 나머지 출처로 대체합니다.',
            },
            {
              kind: 'paragraph',
              text: '이는 의도된 최소주의입니다. 오라클도, 외부 위원회도, 사이클을 좌초시킬 수 있는 콜백도 없습니다. 트레이드오프는 있는 그대로 밝힙니다. 시퀀서는 원칙적으로 블록 수준의 입력에 영향을 줄 수 있으며, 설계는 그 영향이 닿을 수 있는 범위를 제한합니다. 별빛 선정과 아트 시드만이 무작위성을 소비합니다. 카운트다운, 제스처 비용 수열, 5절의 모든 비율은 결정론적입니다. 이 구성은 마감마다 한 번 소비되며, 마감은 누구든 제출할 수 있는 공개 트랜잭션입니다.',
            },
          ],
        },
        'open-verification': {
          heading: '공개 검증',
          blocks: [
            {
              kind: 'paragraph',
              text: '모든 컨트랙트는 부록 A에 고정된 주소로 Sourcify에서 Arbitrum One(체인 42161) 기준 정확 일치 상태로 소스 검증되어 있습니다. 아트 파이프라인의 결정론은 렌더링된 프레임의 SHA-256 해시로 지속적 통합에서 검증됩니다. 프로젝트가 소유한 코드는 CC0입니다. 누구든 컨트랙트, 렌더러, 사이트를 포크할 수 있고, 누구든 어떤 시그니처든 시드에서 다시 생성해 확인할 수 있습니다.',
            },
          ],
        },
      },
    },
    'upgrade-history': {
      heading: '배포 이력과 향후 계획',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature는 완성되도록 설계되었습니다. 업그레이드 가능성은 프로토콜 초기에 관찰된 행동에 맞춰 메커니즘을 바로잡기 위해 존재하며, 설계가 끝나면 함께 끝납니다. 이 절은 무엇이 출시되었고 무엇이 남았는지를 기록합니다.',
        },
      ],
      subsections: {
        v1: {
          heading: 'V1: 출시',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V1은 UUPS 업그레이드 가능 프록시 뒤에서 프로토콜을 Arbitrum One에 출시했습니다. 사이클, 제스처, 배분 경로, 앵커링, 평의회, 아트 파이프라인이 본질적으로 이 백서에 설명된 대로 포함되었습니다. 업그레이드에는 소유자가 필요하며 사이클 사이에만 가능합니다. 어떤 상황에서도 사이클 도중에 컨트랙트를 바꾸는 메커니즘은 의도적으로 두지 않았습니다.',
            },
          ],
        },
        v2: {
          heading: '현재 적용 중인 V2 업그레이드',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V2는 현재 배포되어 있는 구현입니다. 다섯 가지를 변경했으며, 각각 관찰되었거나 예상되는 행동에 대응한 것입니다.',
            },
            {
              kind: 'list',
              items: [
                '동적 참여 CST. 제스처마다 고정 100 CST를 각인하던 방식이 7.1절의 제곱근 공식으로 바뀌었습니다. 고정 각인 아래에서는 빠른 제스처 연쇄가 사실상 비용 없는 CST 각인으로 이어졌습니다. 새 규칙은 빈도가 아니라 인내에 따라 각인합니다.',
                '최소 각인 보호. 모든 제스처 메서드에 참여자가 수용할 최소 참여 CST 양을 지정하는 파라미터가 추가되어, 서명과 실행 사이의 시점 변동에서 참여자를 보호합니다.',
                '살아 있는 CST 보정 구간. 구간의 지속 시간이 제스처 구성에 반응하는 저장값이 되어(4.3절), ETH 경로와 CST 경로가 서로 균형을 유지합니다.',
                `더 긴 독점 구간. 최종 제스처 참여자의 독점 마감 구간이 24시간에서 ${protocolFacts.finalGestureExclusivityHours}시간으로 늘어났습니다.`,
                '시점 및 산술 강화. 카운트다운 연장은 이제 항상 저장된 마감 시각에 적용되어, 만료 뒤에 남긴 거의 비용이 들지 않는 CST 제스처로 마감 시한을 반복해서 뒤로 미룰 수 있었던 허점을 막았습니다. 다음 사이클을 예약하는 산술도 강화되어, 어떤 극단적인 파라미터 구성으로도 사이클 마감을 막을 수 없습니다.',
              ],
            },
          ],
        },
        v3: {
          heading: '예정된 V3 업그레이드',
          blocks: [
            {
              kind: 'paragraph',
              text: '공개 저장소에서 개발 중인 V3는 정확히 한 가지, 늦게 행동하는 비용만 바꿉니다. 사이클 마감 시각 전 마지막 20분 동안 ETH, Random Walk NFT를 첨부한 ETH, CST를 가리지 않고 모든 제스처 비용에 1배에서 10배까지 다항식으로 상승하는 할증 배율이 곱해집니다. 배율은 마감 시각에 10배에 도달하며, 마감 시각을 넘긴 뒤에 남기는 모든 제스처에도 10배가 그대로 적용됩니다.',
            },
            {
              kind: 'formula',
              formula: 'm(t) = 1 + 9 \u00b7 (t / T)^8, 여기서 T = 20분',
              caption: '사이클 후반의 비용 할증. t는 마지막 20분 구간 안에서 경과한 시간입니다.',
            },
            {
              kind: 'paragraph',
              text: '지수가 핵심입니다. 상승 곡선이 8차이기 때문에 할증은 구간의 대부분에서 거의 눈에 띄지 않고 맨 끝에서만 가파릅니다. 마감 10분 전에는 약 1.04배, 5분 전에는 약 1.9배, 1분 전에는 약 7배, 그리고 0초에 10배입니다.',
            },
            {
              kind: 'paragraph',
              text: '의도는 사이클의 종반을 바꾸는 데 있습니다. V2에서는 마지막 몇 초까지 기다렸다가 제스처를 남기는 데 거의 비용이 들지 않아, 사이클이 의미 없는 시점 노리기의 연속으로 끝날 수 있습니다. V3에서는 마지막 순간의 제스처가 값비싼 선언이 되고, 사이클 내내 이어진 참여는 상대적으로 저렴해지며, 5.2절의 선두 유지 경로를 기습하기가 훨씬 어려워집니다. 정확한 파라미터는 배포 전에 조정될 수 있지만, 메커니즘은 설명한 대로입니다.',
            },
          ],
        },
      },
    },
    decentralization: {
      heading: '완전한 탈중앙화로 가는 길',
      blocks: [
        {
          kind: 'paragraph',
          text: '프로토콜에는 현재 소유자가 있습니다. 프로토콜을 배포한 주소입니다. 이 역할은 실재하며, 이 백서는 이를 축소하지 않습니다. 동시에 이 역할은 구조적으로 좁고, 약속에 따라 한시적입니다.',
        },
        {
          kind: 'paragraph',
          text: '사이클이 진행되는 동안 핵심 파라미터는 잠깁니다. 소유자는 사이클 도중에 비율, 증분, 비용을 바꿀 수 없고 컨트랙트를 업그레이드할 수도 없습니다. 소유자의 행동은 사이클과 사이클 사이의 틈에서만 이루어집니다. 더 좁은 세 가지 권한은 언제든 사용할 수 있습니다. 다가오는 사이클의 활성화를 연기하는 것(단, 첫 제스처가 들어오기 전까지만), 다음 사이클 전의 지연 시간을 조정하는 것, 그리고 주변 컨트랙트(공공재 금고의 수령처, NFT 메타데이터 URI, 에스크로 회수 기한)를 관리하는 것입니다. 어떤 소유자 권한도 에스크로에 보관된 배분, 각인된 NFT, 기록된 시드, 누구의 CST 잔액에도 미치지 않으며, 어떤 팀 지갑도 제스처에서 나온 ETH를 받지 않습니다.',
        },
        {
          kind: 'paragraph',
          text: '이 권한이 존재하는 이유는 메커니즘이 새롭기 때문입니다. V2는 어떤 시뮬레이션도 잡아내지 못했을 교훈을 실제 행동이 가르쳐 주었기 때문에 존재하며, V3도 같은 이유로 존재합니다. 범위가 정해진 공개적 조정 기간이 설계를 완성하는 방법입니다. 목록에서 가장 강한 권한은 업그레이드 자체이며, 이 역시 공개적으로 이루어집니다. 새 구현은 다음 사이클이 시작되기 전에 온체인에서 볼 수 있고 검증할 수 있습니다.',
        },
        {
          kind: 'paragraph',
          text: '끝은 다음과 같습니다. V3를 시작으로 남은 업그레이드가 완료되고 메커니즘과 토큰 설계가 최종적이라고 판단되면, 특권적 통제는 배포 주소에서 완전히 제거됩니다. 소유자 역할은 우주 평의회로 이전하거나 소유권을 완전히 포기하는 방식으로 배포자를 영구히 떠나며, 정확한 방식은 사전에 공지됩니다. 그 시점부터 어떤 사적 당사자도 프로토콜을 업그레이드하거나 파라미터를 바꿀 수 없고, 배포 주소는 다른 주소와 다를 바 없는 평범한 주소가 됩니다. 남는 것은 배포된 그대로의 프로토콜, 조율 계층인 평의회, 그리고 아트입니다.',
        },
        {
          kind: 'paragraph',
          text: '이 과정의 모든 단계는 마지막 단계를 포함해 온체인에서 공개적으로 확인할 수 있습니다.',
        },
      ],
    },
    clarifications: {
      heading: '유의 사항과 위험 요인',
      blocks: [],
      subsections: {
        'what-it-is-not': {
          heading: 'Cosmic Signature가 아닌 것',
          blocks: [
            // lexicon-allow-start: denial copy must name the concepts it denies, matching FAQ practice.
            {
              kind: 'paragraph',
              text: 'Cosmic Signature는 복권도, 카지노도, 도박 상품도 아닙니다. 하우스도, 딜러도, 베팅도 없습니다. 참여자는 참여 그 자체와 가치를 교환합니다. 모든 제스처는 작품을 빚어내고, 사이클을 연장하며, 온체인에 영구히 기록되는 표현 행위입니다. 프로토콜은 어떤 종류의 운영자 마진도 남기지 않습니다. 5절의 모든 배분 경로는 참여자, 앵커링된 NFT, 누적 준비금, 또는 공공재로 흘러갑니다.',
            },
            {
              kind: 'paragraph',
              text: 'Cosmic Signature는 투자 상품이 아니며, 이 백서의 어떤 내용도 투자 조언이나 증권의 청약 권유가 아닙니다. CST와 Cosmic Signature NFT는 참여의 수단이자 예술 작품입니다. 프로토콜은 그 가격, 유동성, 미래 가치에 관해 어떤 약속도 하지 않으며, 누구도 타인의 노력에서 비롯되는 이익을 기대하며 이를 취득해서는 안 됩니다.',
            },
            // lexicon-allow-end
          ],
        },
        'risk-factors': {
          heading: '위험 요인',
          blocks: [
            {
              kind: 'list',
              items: [
                '스마트 컨트랙트 위험. 컨트랙트는 검토되고, 정형 분석을 거치고, 소스 검증되었지만, 그 어느 것도 보증은 아닙니다. 가치를 보관하는 모든 소프트웨어에는 알려지지 않은 결함이 있을 수 있습니다.',
                '무작위성의 한계. 별빛 선정은 블록에서 파생된 엔트로피를 사용합니다(11.3절). 시퀀서는 원칙적으로 이에 영향을 줄 수 있으며, 설계는 그 결과를 제한하지만 없애지는 못합니다.',
                `시점 관리 책임. ${protocolFacts.finalGestureExclusivityHours}시간의 마감 구간과 ${protocolFacts.secondaryRetrievalTimeoutWeeks}주의 에스크로 기한은 실제 기한입니다. 그 뒤까지 회수하지 않은 배분은 설계상 다른 사람에게 열립니다.`,
                '파라미터 변경. 탈중앙화 단계가 완료되기 전까지 파라미터는 13절에 설명된 대로 사이클 사이에 바뀔 수 있습니다. 모든 변경은 다음 사이클이 시작되기 전에 공개됩니다.',
                '자산 가치 변동. ETH, CST, NFT의 가치는 움직입니다. 참여에는 실제 비용이 듭니다. 제스처는 금전적 이득으로 가는 길이 아니라 참여와 예술에 쓰는 지출로 보아야 합니다.',
                '규제 불확실성. 디지털 자산의 법적 취급은 관할권마다 다르며 계속 변하고 있습니다.',
              ],
            },
          ],
        },
      },
    },
    conclusion: {
      heading: '결론',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature는 누구의 허락도, 그리고 언젠가는 누구의 관리도 필요하지 않은 제너러티브 아트 프로토콜을 만들려는 시도입니다. 메커니즘은 완전히 명세할 수 있을 만큼 작습니다. 비용이 내려가는 구간, 제스처가 연장하는 카운트다운, 고정된 배분 비율, 누적되는 준비금, 그리고 물리와 시드의 순수 함수인 아트가 전부입니다. 남은 업그레이드는 적고 공개적입니다. 업그레이드가 끝나면 소유자 역할은 사라지고, 이 백서가 설명한 것만 남습니다. 시계 하나, 준비금 하나, 토큰 하나, 평의회 하나, 그리고 끊기지 않고 이어지는 시그니처의 연속. 그 하나하나가 자신을 빚어낸 손의 기록입니다.',
        },
      ],
    },
    'appendix-a': {
      heading: '부록 A: 검증된 컨트랙트 주소',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['컨트랙트', '주소 (Arbitrum One)'],
            rows: [
              ['프로토콜 컨트랙트(프록시)', protocolFacts.contractAddresses.proxy],
              ['프로토콜 구현(V2)', protocolFacts.contractAddresses.implementation],
              ['CST 토큰', protocolFacts.contractAddresses.cstToken],
              ['Cosmic Signature NFT', protocolFacts.contractAddresses.cosmicSignatureNft],
              ['Random Walk NFT', protocolFacts.contractAddresses.randomWalkNft],
              ['우주 평의회', protocolFacts.contractAddresses.cosmicCouncil],
              ['공공재 금고', protocolFacts.contractAddresses.publicGoodsVault],
              ['홍보 준비금', protocolFacts.contractAddresses.outreachReserve],
              ['배분 지갑', protocolFacts.contractAddresses.allocationsWallet],
              [
                '앵커링 지갑, Cosmic Signature NFT',
                protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
              ],
              ['앵커링 지갑, Random Walk NFT', protocolFacts.contractAddresses.rwlkAnchoringWallet],
            ],
            footnote:
              '모든 컨트랙트는 체인 42161용 Sourcify에서 정확 일치로 검증되어 있습니다. 프록시 주소가 프로토콜의 영구 주소이며, 구현은 12절과 13절에 설명된 공개 업그레이드 절차를 통해서만 바뀝니다.',
          },
        },
      ],
    },
    'appendix-b': {
      heading: '부록 B: 파라미터 요약',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['파라미터', '값'],
            rows: [
              ['첫 사이클 시작 비용', `${protocolFacts.initialGestureCostEth} ETH(고정)`],
              [
                'ETH 보정 구간 상한',
                `이전 사이클에서 지불된 시작 비용의 ${protocolFacts.ethCalibrationCeilingMultiplier}배`,
              ],
              ['ETH 보정 구간 하한', `상한 / ${protocolFacts.ethCalibrationFloorDivisor} + 1 wei`],
              [
                'ETH 제스처 비용 상승폭',
                `ETH 제스처마다 ${protocolFacts.ethGestureCostStepUpPercent}% + 1 wei`,
              ],
              [
                'Random Walk NFT 할인',
                `${protocolFacts.randomWalkDiscountPercentage}%, NFT마다 단 한 번`,
              ],
              [
                'CST 보정 구간 상한',
                `max(마지막으로 지불된 CST 비용의 ${protocolFacts.cstCalibrationCeilingMultiplier}배, ${protocolFacts.cstCalibrationCeilingMinCst} CST)`,
              ],
              ['CST 보정 구간 하한', `${protocolFacts.cstCalibrationFloorCst} CST`],
              [
                'CST 보정 구간 지속 시간',
                `초기 기준 ${protocolFacts.initialCstCalibrationWindowHours}시간; ETH 제스처마다 약 \u2212${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, CST 제스처마다 +${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%`,
              ],
              [
                '시작 제스처 후 초기 카운트다운',
                `출시 시점 약 ${protocolFacts.initialCycleFinalizationHoursAtLaunch}시간`,
              ],
              [
                '제스처당 시간 증분',
                `출시 시점 ${protocolFacts.initialCycleTimeIncrementHours}시간, 사이클마다 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% 증가`,
              ],
              ['마감 독점 구간', `${protocolFacts.finalGestureExclusivityHours}시간`],
              [
                '에스크로 회수 기한',
                `${protocolFacts.secondaryRetrievalTimeoutWeeks}주, 이후 공개 회수`,
              ],
              ['제스처 메시지 한도', `${protocolFacts.gestureMessageMaxLength}바이트`],
              [
                'ETH 배분 경로',
                `시그니처 ${protocolFacts.mainEthPercentage}%, 시간의 전사 ${protocolFacts.chronoWarriorEthPercentage}%, 공공재 ${protocolFacts.publicGoodsPercentage}%, 앵커링 지급 ${protocolFacts.anchorDistributionPercentage}%, ETH 별빛 선정 ${protocolFacts.stellarSelectionEthPercentage}%`,
              ],
              ['누적 준비금', `약 ${protocolFacts.compoundingReservePercentage}% 이월`],
              ['NFT 배분 1건당 공로 CST', `${cst(protocolFacts.specialAllocationCst)} CST`],
              ['사이클당 홍보 준비금', `${cst(protocolFacts.outreachReserveCst)} CST`],
              [
                '사이클당 전형적인 각인',
                `NFT ${protocolFacts.typicalNftsPerCycle}개, 고정 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST`,
              ],
              [
                '평의회 파라미터',
                `제안 기준 ${protocolFacts.councilProposalThresholdCst} CST, ${protocolFacts.councilVotingDelayDays}일 지연, ${protocolFacts.councilVotingPeriodWeeks}주 기간, 정족수 ${protocolFacts.councilQuorumPercent}%`,
              ],
              [
                '다음 사이클 전 지연',
                `기본 ${protocolFacts.defaultNextCycleDelayMinutes}분, 소유자 조정 가능`,
              ],
            ],
            footnote:
              '변화하거나 조정 가능한 파라미터는 출시 시점 값을 표시했습니다. 실시간 값은 컨트랙트가 보고합니다.',
          },
        },
      ],
    },
  },
  references: {
    heading: '참고 자료',
    items: [
      {
        label: 'Cosmic Signature 컨트랙트 저장소(소스, 테스트, 검증 도구)',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature',
      },
      {
        label: 'Cosmic Signature 앱',
        href: 'https://app.cosmicsignature.com/ko',
      },
      {
        label: 'Cosmic Signature 프로토콜 사이트',
        href: 'https://cosmicsignature.com/ko',
      },
      {
        label: 'Hacken의 Cosmic Signature 컨트랙트 보안 검토, 2026년 1월',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
      },
      {
        label: 'Protocol Guild 문서',
        href: 'https://protocol-guild.readthedocs.io',
      },
      {
        label: 'OpenZeppelin Governor 문서',
        href: 'https://docs.openzeppelin.com/contracts/5.x/governance',
      },
      {
        label: 'Arbitrum One',
        href: 'https://arbitrum.io',
      },
    ],
  },
  licenseNote:
    '이 백서는 프로젝트가 소유한 다른 모든 Cosmic Signature 자료와 마찬가지로 CC0 1.0에 따라 퍼블릭 도메인에 헌정됩니다.',
} satisfies WhitePaperText;
