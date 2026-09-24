import { formatCount } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from './audit';
import type { AuditsCopy } from './AuditsContent';

const { findings, invariants } = HACKEN_AUDIT;
const count = (value: number) => formatCount(value, 'ko');

/** Korean copy for /audits, rendered by AuditsContent. */
export const auditsCopyKo: AuditsCopy = {
  title: '보안 감사',
  intro:
    'Hacken의 Cosmic Signature 컨트랙트 독립 보안 감사, 컨트랙트 저장소에 있는 정형 검증과 분석, 그리고 컨트랙트를 직접 확인하는 방법을 정리했습니다.',
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
    repositoryCta: '감사받은 컨트랙트 보기',
  },
  audit: {
    heading: 'Hacken의 독립 보안 감사',
    paragraphs: [
      `Hacken은 2025년 말 Cosmic Signature 스마트 컨트랙트의 독립 보안 검토를 수행했습니다. 검토는 공개 저장소의 운영 컨트랙트를 대상으로 하여, 각 사이클을 운영하는 핵심 프로토콜부터 CST 토큰, 두 NFT 컬렉션, 앵커링 지갑, 그리고 이를 지원하는 지갑 및 시스템 관리 컨트랙트까지 아울렀습니다. Hacken은 2026년 1월에 최종 보고서를 공개했습니다.`,
      `보고서에는 발견 사항 ${count(AUDIT_FINDINGS_TOTAL)}건이 실려 있으며, 심각도가 치명 또는 높음인 항목은 없습니다. 중간 ${count(findings.medium)}건, 낮음 ${count(findings.low)}건, 정보성 관찰 ${count(findings.informational)}건입니다. 대부분은 팀이 검토하고 수용한 설계상의 절충을 설명한 것이며, 보고서는 각 발견 사항을 그 상태와 함께 설명합니다.`,
      `수동 검토와 함께 Hacken은 시스템 불변 조건 ${count(invariants.tested)}개를 대상으로 퍼즈 테스트를 실행했습니다. 불변 조건이란 예컨대 프로토콜이 보유한 ETH가 항상 적립된 금액에서 회수된 금액을 뺀 값과 같아야 한다는 성질입니다. ${count(invariants.held)}개 모두 ${count(invariants.runs)}회 실행에서 유지되었습니다.`,
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
      '<explorer>Arbiscan</explorer>에서 그 주소를 열어 Arbitrum One에 있고 소스 코드가 검증되었는지 확인해 주세요.',
      '그 소스를 <contractsRepository>공개 저장소</contractsRepository>와 비교하거나 <sourcify>Sourcify</sourcify>에서 완전 일치를 확인해 주세요.',
      '<hacken>Hacken 보고서</hacken>에서 각 발견 사항과 상태를 읽어 주세요.',
      '앱에 표시되는 내용이 온체인 컨트랙트의 동작과 일치하는지 확인해 주세요.',
    ],
  },
};
