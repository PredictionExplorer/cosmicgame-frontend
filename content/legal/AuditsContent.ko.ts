import type { AuditsCopy } from './AuditsContent';

/** Korean copy for /audits, rendered by AuditsContent. */
export const auditsCopyKo: AuditsCopy = {
  title: '보안 감사',
  intro:
    '공개 감사는 검토된 과거 컨트랙트 버전에 해당합니다. 이후 V2와 V3의 모든 변경을 독립적으로 검토했다는 뜻은 아닙니다. 공개 소스와 배포 코드가 일치한다는 검증도 보안 평가와 다릅니다.',
  summary: {
    label: '보안 감사 요약',
    auditor: '감사 기관',
    published: '보고서 공개',
    findings: '발견 사항',
    criticalOrHigh: '치명 또는 높음',
    invariants: '유지된 불변 조건',
    invariantsValue: '{held}/{tested}',
    runs: '퍼즈 테스트 실행 횟수',
    severity: '심각도별 발견 사항',
    severities: {
      critical: '치명',
      high: '높음',
      medium: '중간',
      low: '낮음',
      informational: '정보성',
    },
    reportCta: 'Hacken 보고서 읽기',
    repositoryCta: '컨트랙트 저장소 보기',
  },
  audit: {
    heading: 'Hacken의 독립 보안 감사',
    paragraphs: [
      '공개 감사는 검토된 과거 컨트랙트 버전에 해당합니다. 이후 V2와 V3의 모든 변경을 독립적으로 검토했다는 뜻은 아닙니다. 공개 소스와 배포 코드가 일치한다는 검증도 보안 평가와 다릅니다.',
      '보고서는 각 발견 사항을 심각도 및 상태와 함께 제시하며, 위의 요약이 그 수를 집계합니다. 치명 또는 높음 심각도 항목은 없으며, 대부분은 팀이 검토하고 수용한 설계상의 절충을 설명한 것입니다.',
      '수동 검토와 함께 Hacken은 시스템 불변 조건을 대상으로 퍼즈 테스트를 실행했습니다. 불변 조건이란 예컨대 프로토콜이 보유한 ETH가 항상 적립된 금액에서 회수된 금액을 뺀 값과 같아야 한다는 성질입니다. 모든 불변 조건이 유지되었습니다.',
    ],
  },
  analysis: {
    heading: '정형 검증과 분석',
    paragraphs: [
      '컨트랙트 저장소에는 팀이 직접 실행하는 검사도 있습니다. 프로토콜 로직, ETH 보존, 접근 제어, 지갑 컨트랙트를 다루는 Certora Prover 명세, Solidity SMTChecker 설정, Slither 정적 분석, 자동화된 테스트 모음입니다.',
      '이 검사들은 각자 명시한 성질만 증명하거나 시험합니다. 보안 감사와 마찬가지로 위험을 줄일 뿐 없애지는 못합니다. 자세한 내용은 <risk>위험 고지</risk> 페이지에 있습니다.',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Certora 명세',
        description: 'Certora Prover가 검사하는 성질과 실행별 설정',
      },
      {
        link: 'smtchecker',
        label: 'SMTChecker 설정',
        description: 'Solidity 모델 검사기를 켜고 컨트랙트를 컴파일하는 스크립트',
      },
      {
        link: 'slither',
        label: 'Slither 분석',
        description: '정적 분석과 업그레이드 가능성 검사, 실행 방법 안내',
      },
      {
        link: 'tests',
        label: '테스트 모음',
        description: '컨트랙트 자동화 테스트',
      },
    ],
  },
  checklist: {
    heading: '검증 체크리스트',
    intro: '컨트랙트와 상호작용하기 전에 아래 항목을 직접 확인할 수 있습니다.',
    steps: [
      '<contracts>컨트랙트 페이지</contracts>에서 컨트랙트 주소를 찾아 주세요. 공식 주소 목록은 이곳 하나뿐입니다.',
      '현재 프로토콜 구현은 V3입니다. 구현 주소는 프록시의 EIP-1967 슬롯과 대조해야 합니다. V3의 공개 소스 검증은 아직 확인되지 않았으며, 과거 V2의 검증은 새 구현에 적용되지 않습니다. 자세히: <explorer>Arbiscan</explorer>.',
      '공개 감사는 검토된 과거 컨트랙트 버전에 해당합니다. 이후 V2와 V3의 모든 변경을 독립적으로 검토했다는 뜻은 아닙니다. 공개 소스와 배포 코드가 일치한다는 검증도 보안 평가와 다릅니다. 자세히: <contractsRepository>공개 저장소</contractsRepository>, <sourcify>Sourcify</sourcify>.',
      '<hacken>Hacken 보고서</hacken>에서 각 발견 사항과 상태를 읽어 주세요.',
      '앱에 표시되는 내용이 온체인 컨트랙트의 동작과 일치하는지 확인해 주세요.',
    ],
  },
};
