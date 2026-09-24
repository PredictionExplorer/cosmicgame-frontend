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
    paragraphs: [
      '컨트랙트, 앱, 이 웹사이트에서 취약점을 발견하면 제목에 "Security"를 넣어 <support>support@cosmicsignature.com</support> 주소로 이메일을 보내 주세요. 발견한 내용, 재현 방법, 영향 범위를 적어 주세요.',
      '공개하기 전에 팀이 답변하고 문제를 고칠 시간을 주시고, 운영 중인 컨트랙트나 다른 참여자의 자금을 대상으로 공격 방법을 시험하지 마세요. 같은 연락처는 사이트의 <securityTxt>security.txt</securityTxt> 파일에도 있습니다.',
    ],
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
