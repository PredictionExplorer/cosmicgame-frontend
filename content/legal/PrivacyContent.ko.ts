import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyKo = {
  title: '개인정보 처리방침',
  subtitle:
    '앱과 프로젝트 사이트를 이용할 때 Cosmic Signature가 정보를 어떻게 다루는지 설명합니다. 온체인에 공개되는 정보, 사이트가 측정하고 저장하는 정보, 각 서비스가 받는 정보를 정리했습니다.',
  inShort: {
    title: '요약',
    points: [
      '지갑 주소와 온체인에서 한 모든 일은 공개되며 영구히 남습니다. 누구나 Arbitrum에서 읽을 수 있고 누구도 삭제할 수 없습니다.',
      '지갑을 연결하면 공개 주소만 공유됩니다. 시드 구문, 개인 키, 비밀번호를 요구하지 않으며 이름이나 이메일 주소도 수집하지 않습니다.',
      '사이트는 아래에 적은 서비스로 방문을 측정하고 오류를 보고하며, 아래에 적은 쿠키만 설정합니다.',
    ],
  },
  introductionTitle: '개요',
  introduction: [
    'Cosmic Signature는 이더리움 레이어 2 네트워크인 Arbitrum 위에 구축된 탈중앙화 온체인 아트 프로토콜입니다. 탈중앙화 애플리케이션(dApp)인 만큼, 데이터와 개인정보를 다루는 방식이 기존 웹 애플리케이션과 다릅니다.',
    '본 개인정보 처리방침은 사용자의 Cosmic Signature 이용과 관련하여 회사가 정보를 어떻게 처리하는지 설명합니다. 플랫폼을 이용하면 본 방침에 따른 정보의 수집과 이용에 동의한 것으로 봅니다.',
  ],
  sections: [
    {
      id: 'collection',
      title: '수집하는 정보',
      content: [
        {
          id: 'wallet',
          subtitle: '지갑 정보',
          text: '사용자가 Cosmic Signature를 이용하기 위해 Web3 지갑을 연결하면 회사는 공개 지갑 주소를 수집합니다. 이는 트랜잭션 처리, NFT 표시, 제스처 추적, 배분 실행에 필요합니다.',
        },
        {
          id: 'transactions',
          subtitle: '트랜잭션 데이터',
          text: '회사는 사용자와 스마트 컨트랙트 간 상호작용 정보를 수집합니다. 여기에는 남긴 제스처, 받은 NFT, 앵커링 활동, 배분 회수 내역이 포함됩니다. 이 데이터는 모두 블록체인에 공개되어 있습니다.',
        },
        {
          id: 'usage',
          subtitle: '이용 데이터',
          text: '사이트 이용 현황을 측정합니다. 조회한 페이지, 페이지 로딩 속도, 유입 사이트, 방문한 국가와 브라우저, 기기 종류입니다. 이 측정을 하는 분석 서비스는 <privacyServices>사용하는 서비스</privacyServices>에 적었습니다.',
        },
      ],
    },
    {
      id: 'use',
      title: '정보의 이용',
      content: [
        {
          id: 'delivery',
          subtitle: '서비스 제공',
          text: '지갑 주소와 트랜잭션 데이터는 제스처 처리, NFT 관리, 배분 실행, 프로토콜 통계 표시 등 프로토콜 서비스를 제공하는 데 이용됩니다.',
        },
        {
          id: 'improvement',
          subtitle: '플랫폼 개선',
          text: '집계한 이용 데이터와 오류 보고서로 버그를 고치고 사이트를 개선합니다.',
        },
        {
          id: 'communication',
          subtitle: '안내',
          text: '이메일 주소나 다른 연락처는 수집하지 않으므로 개별적으로 연락하지 않습니다. 보안 공지와 프로토콜 변경을 포함한 공지는 <x>X</x> 및 <discord>Discord</discord>에 게시합니다.',
        },
      ],
    },
    {
      id: 'security',
      title: '데이터 보안',
      content: [
        {
          id: 'blockchain',
          subtitle: '블록체인 보안',
          text: '프로토콜 트랜잭션은 이더리움 레이어 2 네트워크인 Arbitrum에서 처리됩니다. 지갑 연결 자체는 비수탁형이며 자산을 이전하지 않습니다. 다만 사용자가 스마트 컨트랙트 작업을 명시적으로 승인하고 서명하면, 그 트랜잭션은 자산을 프로토콜 컨트랙트로 이전하거나, 정해진 해제 또는 회수 조건이 충족될 때까지 컨트랙트에 잠가 둘 수 있습니다.',
        },
        {
          id: 'infrastructure',
          subtitle: '인프라 보안',
          text: '사이트는 HTTPS로만 제공되며 Vercel 호스팅 플랫폼에서 운영됩니다. 스마트 컨트랙트는 독립 감사를 받았습니다. 자세한 내용은 <audits>보안 감사</audits> 페이지를 참고해 주세요.',
        },
        {
          id: 'passwords',
          subtitle: '비밀번호 없음',
          text: '회사는 비밀번호를 절대 요구하거나 저장하지 않습니다. 인증은 전적으로 사용자의 Web3 지갑을 통해 이루어집니다.',
        },
      ],
    },
    {
      id: 'sharing',
      title: '데이터 공유 및 공개',
      content: [
        {
          id: 'public-chain',
          subtitle: '공개 블록체인 데이터',
          text: '모든 블록체인 트랜잭션은 그 성격상 공개됩니다. 사용자의 지갑 주소, 제스처, NFT 소유 현황, 배분은 블록체인과 회사 플랫폼에서 볼 수 있습니다.',
        },
        {
          id: 'third-party',
          subtitle: '제3자 서비스',
          text: '<privacyServices>사용하는 서비스</privacyServices>에 적은 서비스는 그곳에 설명한 데이터를 받아 각자의 개인정보 처리방침에 따라 처리합니다. 각 방침의 링크는 표에 있습니다.',
        },
        {
          id: 'legal',
          subtitle: '법적 요구',
          text: '회사는 법률, 법원 명령, 정부 규정에 따라 요구되는 경우 정보를 공개할 수 있습니다.',
        },
      ],
    },
    {
      id: 'rights',
      title: '사용자의 권리와 선택',
      content: [
        {
          id: 'wallet',
          subtitle: '지갑 관리',
          text: '지갑의 제어권은 전적으로 사용자에게 있으며, 언제든지 플랫폼과의 연결을 해제할 수 있습니다.',
        },
        {
          id: 'permanence',
          subtitle: '블록체인의 영구성',
          text: '블록체인 트랜잭션은 영구적이며 삭제할 수 없습니다. 제스처를 남기거나 NFT를 전송하면 그 정보는 블록체인에 영원히 남습니다.',
        },
        {
          id: 'cookies',
          subtitle: '쿠키 설정',
          text: '사이트는 <privacyStorage>쿠키와 브라우저 저장소</privacyStorage>에 적은 쿠키만 설정합니다. 브라우저 설정에서 삭제하거나 차단할 수 있습니다. 그래도 사이트는 작동하지만 색상 테마와 언어 선택은 기억하지 못합니다.',
        },
      ],
    },
  ],
  additionalTitle: '추가 정보',
  additional: [
    {
      id: 'children',
      subtitle: '아동의 개인정보',
      text: '회사의 서비스는 만 18세 미만 사용자를 대상으로 하지 않습니다. 회사는 아동의 개인정보를 의도적으로 수집하지 않습니다. 부모 또는 보호자로서 자녀가 회사에 개인정보를 제공했다고 생각되는 경우 회사에 문의해 주세요.',
    },
    {
      id: 'changes',
      subtitle: '방침의 변경',
      text: '이 개인정보 처리방침은 수시로 업데이트될 수 있습니다. 모든 변경 사항은 이 페이지에 게시하고 상단의 "최종 업데이트" 날짜를 갱신하며, 각 변경은 이 방침의 <privacyHistory>개정 이력</privacyHistory>에서도 확인할 수 있습니다.',
    },
    {
      id: 'contact',
      subtitle: '문의처',
      text: '이 개인정보 처리방침에 관한 문의는 <support>support@cosmicsignature.com</support>, <discord>Discord</discord>, <x>X</x> 중 한 곳으로 연락해 주세요.',
    },
    {
      id: 'international',
      subtitle: '국외 사용자',
      text: 'Cosmic Signature는 전 세계에서 접근할 수 있는 이더리움 레이어 2 네트워크인 Arbitrum에서 트랜잭션을 처리합니다. 플랫폼을 이용함으로써 사용자는 자신의 정보가 세계 여러 지역에서 처리되고 저장될 수 있음을 인정합니다.',
    },
  ],
  services: {
    heading: '사용하는 서비스',
    intro:
      '이 사이트는 아래 서비스를 사용합니다. 각 서비스는 표에 적은 데이터를 자체 개인정보 처리방침에 따라 처리합니다.',
    columns: {
      service: '서비스',
      purpose: '용도',
      data: '받는 데이터',
      policy: '개인정보 처리방침',
    },
    policyLink: '처리방침',
    ownPolicy: '이 방침',
    none: '없음',
    items: {
      vercel: {
        purpose: '사이트 호스팅과 전송',
        data: '요청 로그에 남는 IP 주소와 브라우저 정보',
      },
      vercelAnalytics: {
        purpose: '쿠키 없이 페이지 조회 수를 세고 페이지 속도를 측정',
        data: '조회한 페이지, 유입 사이트, 국가, 브라우저, 기기 종류',
      },
      googleAnalytics: {
        purpose: '방문자의 사이트 이용 방식 측정',
        data: '조회한 페이지, 대략적인 위치, 브라우저와 기기(쿠키 사용)',
      },
      sentry: {
        purpose: '수정을 위한 오류 보고',
        data: '오류 내용, 페이지, 브라우저, 오류 직전 화면의 재생(모든 텍스트와 입력은 가림 처리)',
      },
      api: {
        purpose: '페이지에 표시되는 프로토콜 데이터 제공',
        data: '열어 본 기록(조회한 지갑 주소 포함)',
      },
      rpc: {
        purpose: 'Arbitrum 컨트랙트 조회와 서명한 트랜잭션 전달',
        data: 'IP 주소, 조회한 주소, 보낸 트랜잭션',
      },
      walletConnect: {
        purpose: '모바일 지갑과 QR 코드 지갑 연결',
        data: '지갑 주소, 사이트와 지갑 사이의 암호화된 메시지',
      },
      coingecko: {
        purpose: 'ETH와 CST의 미국 달러 가격 제공',
        data: '달러 가격을 표시하는 페이지의 IP 주소',
      },
    },
  },
  storage: {
    heading: '쿠키와 브라우저 저장소',
    intro:
      '사이트는 아래 항목을 기기에 저장합니다. 이름이나 연락처는 포함되지 않습니다. 쿠키는 요청과 함께 전송되고, 브라우저 저장소는 기기에만 남습니다.',
    columns: {
      name: '이름',
      kind: '유형',
      purpose: '용도',
      lifetime: '보관 기간',
    },
    kinds: {
      cookie: '쿠키',
      browser: '브라우저 저장소',
    },
    lifetimes: {
      oneYear: '1년',
      twoYears: '2년',
      untilCleared: '직접 지울 때까지',
    },
    items: {
      themeCookie: '두 Cosmic Signature 사이트에서 색상 테마를 기억',
      localeCookie: '선택한 언어를 기억',
      gaCookies: 'Google Analytics에서 재방문을 구분',
      themeStorage: '이 사이트에서 색상 테마를 기억',
      attention: '마감 전 알림과 소리 설정을 기억',
      explainer: '사이클 안내를 닫은 것을 기억',
      wallet: '연결한 지갑을 기억해 앱이 다시 연결할 수 있게 함',
    },
  },
} as const satisfies PrivacyCopy;
