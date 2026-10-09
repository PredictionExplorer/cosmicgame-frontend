import type { SecurityCopy } from './SecurityContent';

/** Korean copy for /security, rendered by SecurityContent. */
export const securityCopyKo: SecurityCopy = {
  title: '보안',
  intro:
    'Cosmic Signature는 Arbitrum 위의 절차적 온체인 아트 프로토콜입니다. 공개된 스마트 컨트랙트와 투명한 프로토콜 데이터, 신중한 지갑 사용, 명확한 참여 안내를 바탕으로 보안을 관리합니다.',
  official: {
    heading: '공식 주소',
    intro:
      'Cosmic Signature는 아래 웹사이트에서만 열어 주세요. 지갑을 연결하거나 트랜잭션을 승인하기 전에는 주소를 한 글자씩 확인해 주세요. 이 밖에 Cosmic Signature를 자처하는 사이트나 계정은 공식이 아닙니다.',
    websitesHeading: '웹사이트',
    websites: {
      app: '앱: 제스처, 배분, 앵커링, 공개 기록',
      landing: '프로젝트 사이트: 작품, 백서, 가이드',
    },
    communityHeading: '커뮤니티',
    community: {
      x: '공지',
      discord: '커뮤니티 대화와 지원',
    },
    contractsHeading: 'Arbitrum One의 핵심 컨트랙트',
    contractsIntro:
      '각 컨트랙트의 공개 소스 코드는 Sourcify에서 완전히 일치하므로(확인일: {date}), 온체인 바이트코드가 곧 읽을 수 있는 코드입니다. 모든 주소는 <contracts>컨트랙트 페이지</contracts>에 있습니다.',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '{value} 복사',
    copiedLabel: '복사했습니다',
  },
  controls: {
    heading: '소유자 권한과 업그레이드',
    paragraph:
      'Cosmic Signature 프로토콜 컨트랙트에는 소유자가 있습니다. 아래 범위 안에서 일부 매개변수를 바꾸고 컨트랙트 코드를 업그레이드할 수 있는 하나의 계정입니다. 모든 변경은 온체인에 기록되며 <coordination>조율 변경 내역</coordination>에 나열됩니다.',
    ownerLabel: '소유자',
    ownerUnavailable:
      '지금은 소유자를 읽을 수 없습니다. Arbiscan에서 컨트랙트의 owner() 함수로 확인할 수 있습니다.',
    account: {
      singleKey: '단일 키 지갑(외부 소유 계정)이며, 멀티시그나 타임록이 아닙니다.',
      contract: '멀티시그나 타임록 같은 스마트 컨트랙트 계정입니다.',
      renounced:
        '소유권이 포기되었습니다. 어떤 계정도 매개변수를 바꾸거나 코드를 업그레이드할 수 없습니다.',
    },
    rows: [
      {
        term: '사이클 사이',
        detail:
          '소유자는 제스처마다 더해지는 시간이나 배분 경로 비율 같은 프로토콜 매개변수를 바꿀 수 있습니다.',
      },
      {
        term: '사이클 진행 중',
        detail:
          '사이클이 활성화되는 순간(첫 제스처 전)부터 그 사이클이 마감될 때까지 핵심 매개변수는 잠깁니다.',
      },
      {
        term: '언제든',
        detail:
          '소유자는 첫 제스처가 올 때까지 사이클 활성화를 미루고, 다음 사이클 전의 지연 시간을 바꾸고, 주변 컨트랙트(공공재 수령처, NFT 메타데이터 링크, 배분 지갑 회수 기한)를 관리할 수 있습니다.',
      },
      {
        term: '업그레이드',
        detail:
          '프로토콜은 UUPS 프록시 뒤에서 작동하므로 주소가 바뀌지 않습니다. 소유자는 사이클 사이에만 새 코드를 연결할 수 있으며, 현재 사용 중인 코드는 위에 나열된 공개 검증된 V2 구현입니다.',
      },
      {
        term: '우주 평의회',
        detail:
          '프로토콜이 안정되면 소유권을 우주 평의회로 이전할 계획입니다. 그 뒤로 매개변수는 조율 정족수를 충족한 프로토콜 조율 제안을 통해서만 바뀝니다.',
      },
    ],
  },
  model: {
    heading: '보안 모델',
    paragraph:
      '모든 프로토콜 작업은 Arbitrum 스마트 컨트랙트에 기록됩니다. 지갑을 연결하거나 제스처를 남기기 전에 공개된 컨트랙트 주소, 소스 코드, 보안 감사, 위험을 확인해 주세요.',
    bullets: [
      '앱은 위의 공식 주소에서만 열고, 지갑을 연결하기 전에 주소 표시줄을 확인해 주세요.',
      '온체인에서 컨트랙트와 상호작용하기 전에 <contracts>컨트랙트 페이지</contracts>에서 주소를 확인해 주세요.',
      '승인하기 전에 지갑의 요청을 모두 읽어 주세요. 블록체인 트랜잭션은 되돌릴 수 없습니다.',
      'Cosmic Signature는 시드 구문나 개인 키를 절대 요구하지 않습니다. 요구하는 쪽은 Cosmic Signature가 아닙니다.',
      'CST, NFT, 제스처, 배분을 보장된 재정적 결과로 여기지 마세요. 자세한 내용은 <risk>위험 고지</risk> 페이지에 있습니다.',
    ],
  },
  report: {
    heading: '취약점 신고',
    lead: 'Cosmic Signature 컨트랙트, 앱, 이 웹사이트에서 취약점을 발견하면 제목에 "Security"를 넣어 <support>support@cosmicsignature.com</support> 주소로 이메일을 보내 주십시오. 유용한 신고에는 다음 내용이 들어갑니다.',
    include: [
      '발견한 내용과 영향을 받는 컨트랙트, 페이지 또는 주소',
      '단계별 재현 방법',
      '이 문제로 무엇을 할 수 있는지, 누구의 자금이 관련되는지',
      '팀이 연락할 수 있는 방법',
    ],
    scopeHeading: '범위',
    scope: [
      {
        term: '범위 안',
        detail:
          '<securityOfficial>공식 주소</securityOfficial>에 나열된 컨트랙트, app.cosmicsignature.com, cosmicsignature.com',
      },
      {
        term: '범위 밖',
        detail:
          '지갑, 마켓플레이스, 브리지, Arbitrum 네트워크 자체처럼 Cosmic Signature가 운영하지 않는 서비스입니다. 해당 팀에 직접 신고하십시오.',
      },
    ],
    closing:
      '공개하기 전에 팀이 답변하고 문제를 고칠 시간을 주시고, 운영 중인 컨트랙트나 다른 참여자의 자금을 대상으로 공격 방법을 시험하지 마세요. 같은 연락처는 사이트의 <securityTxt>security.txt</securityTxt> 파일에도 있습니다.',
  },
  verify: {
    heading: '직접 확인하기',
    paragraph:
      '가장 강력한 보안 신호는 앱에 표시되는 내용, 검증된 컨트랙트, 소스 코드, 실시간 Arbitrum 데이터가 서로 일치하는 것입니다. 모두 이 사이트를 믿지 않고도 확인할 수 있습니다.',
    resources: [
      {
        link: 'contracts',
        label: '컨트랙트 주소',
        description: 'Arbitrum의 모든 Cosmic Signature 컨트랙트와 블록 탐색기, Sourcify 링크',
      },
      {
        link: 'audits',
        label: '보안 감사',
        description: 'Hacken 감사: 심각도별 발견 사항, 퍼징한 불변식, 보고서 전문',
      },
      {
        link: 'code',
        label: '소스 코드',
        description: '각 저장소와 시드를 작품으로 바꾸는 렌더러',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: '어떤 컨트랙트든 바이트코드를 공개 소스와 대조',
      },
    ],
  },
};
