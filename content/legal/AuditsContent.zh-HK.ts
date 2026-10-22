import type { AuditsCopy } from './AuditsContent';

/** Traditional Chinese (Hong Kong) copy for /audits, rendered by AuditsContent. */
export const auditsCopyZhHk: AuditsCopy = {
  title: '審計',
  intro:
    'Hacken 的歷史合約審查、倉庫中的驗證工具，以及如何核對目前部署。歷史報告並非對每項其後 V3 改動的獨立審計。',
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
    repositoryCta: '瀏覽合約儲存庫',
  },
  audit: {
    heading: 'Hacken 獨立審計',
    paragraphs: [
      'Hacken 於 2025 年末審查了 Cosmic Signature 較早的合約版本，最終報告於 2026 年 1 月發佈。審計範圍以報告列出的程式碼版本為準，不會自動涵蓋其後每一項 V2 或 V3 改動。',
      '報告逐項列出每項發現的嚴重級別與處理狀態，上方摘要按級別統計了數量。其中沒有嚴重或高危級別問題，多數屬於團隊已審閱並接受的設計取捨。',
      '除人工審查外，Hacken 還對系統不變量進行了模糊測試，例如協議持有的 ETH 總額必須等於存入減去取回。所有不變量均保持成立。',
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
      '在 <explorer>Arbiscan</explorer> 開啟地址，確認網絡為 Arbitrum One，並檢查目前實作及其實際原始碼驗證狀態。',
      '將公開原始碼與<contractsRepository>程式碼倉庫</contractsRepository>比對，並查詢 <sourcify>Sourcify</sourcify>。目前 V3 尚無 Sourcify 驗證紀錄，不能沿用 V2 的完全匹配作為 V3 證據。',
      '閱讀 <hacken>Hacken 報告</hacken>，了解每項發現及其處理狀態。',
      '確認應用程式顯示的內容與合約在鏈上的行為一致。',
    ],
  },
};
