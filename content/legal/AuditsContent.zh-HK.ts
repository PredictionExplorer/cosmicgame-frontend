import { formatCount } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from './audit';
import type { AuditsCopy } from './AuditsContent';

const { findings, invariants } = HACKEN_AUDIT;
const count = (value: number) => formatCount(value, 'zh-HK');

/** Traditional Chinese (Hong Kong) copy for /audits, rendered by AuditsContent. */
export const auditsCopyZhHk: AuditsCopy = {
  title: '審計',
  intro:
    'Hacken 對 Cosmic Signature 合約的獨立審計、合約儲存庫中的形式化驗證與分析，以及如何自行核對合約。',
  summary: {
    label: '審計概覽',
    auditor: '審計方',
    published: '報告發佈',
    findings: '發現',
    criticalOrHigh: '嚴重或高危',
    invariants: '成立的不變量',
    invariantsValue: '{held}/{tested}',
    runs: '模糊測試運行次數',
    severity: '按嚴重程度劃分的發現',
    severities: {
      critical: '嚴重',
      high: '高危',
      medium: '中危',
      low: '低危',
      informational: '提示',
    },
    reportCta: '閱讀 Hacken 審計報告',
    repositoryCta: '瀏覽受審計的合約',
  },
  audit: {
    heading: 'Hacken 獨立審計',
    paragraphs: [
      `2025年末，Hacken 對 Cosmic Signature 智能合約進行了獨立安全審查。審查範圍覆蓋公開儲存庫中的全部生產合約：驅動每個週期的核心協議、CST 代幣、兩個 NFT 系列、錨定錢包，以及配套的錢包與系統管理合約。最終報告於2026年1月發佈。`,
      `報告共列出 ${count(AUDIT_FINDINGS_TOTAL)} 項發現，其中沒有嚴重或高危級別問題：${count(findings.medium)} 項為中危、${count(findings.low)} 項為低危、${count(findings.informational)} 項為提示性觀察。多數發現屬於團隊已審閱並接受的設計取捨，報告對每項發現及其處理狀態均有說明。`,
      `除人工審查外，Hacken 還對 ${count(invariants.tested)} 項系統不變量進行了模糊測試，例如協議持有的 ETH 總額必須等於存入減去取回。全部 ${count(invariants.held)} 項不變量在 ${count(invariants.runs)} 次運行中均保持成立。`,
    ],
  },
  analysis: {
    heading: '形式化驗證與分析',
    paragraphs: [
      '合約儲存庫中亦保存着團隊自行運行的檢查：涵蓋協議邏輯、ETH 守恆、存取控制與各錢包合約的 Certora Prover 規格，Solidity SMTChecker 設定，Slither 靜態分析，以及自動化測試套件。',
      '這些檢查只證明或測試其所聲明的屬性。與審計一樣，它們能降低風險，但無法消除風險；詳見<risk>風險披露</risk>。',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Certora 規格',
        description: 'Certora Prover 檢查的屬性，以及每次運行的設定',
      },
      {
        link: 'smtchecker',
        label: 'SMTChecker 設定',
        description: '在啟用 Solidity 模型檢查器的情況下編譯合約的腳本',
      },
      {
        link: 'slither',
        label: 'Slither 分析',
        description: '靜態分析與可升級性檢查，以及運行說明',
      },
      {
        link: 'tests',
        label: '測試套件',
        description: '合約的自動化測試',
      },
    ],
  },
  checklist: {
    heading: '驗證清單',
    intro: '與合約互動前，你可以自行確認以下各項：',
    steps: [
      '在<contracts>合約頁面</contracts>找到合約地址，這是官方地址的唯一清單。',
      '在 <explorer>Arbiscan</explorer> 上開啟該地址，確認它位於 Arbitrum One 且源代碼已驗證。',
      '將該源代碼與<contractsRepository>公開儲存庫</contractsRepository>比對，或在 <sourcify>Sourcify</sourcify> 上核對完全相符。',
      '閱讀 <hacken>Hacken 報告</hacken>，了解每項發現及其處理狀態。',
      '確認應用程式顯示的內容與合約在鏈上的行為一致。',
    ],
  },
};
