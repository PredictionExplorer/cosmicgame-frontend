import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /audits, rendered by TrustPageContent. */
export const auditsCopyZhHk: TrustPageCopy = {
  eyebrow: '審計與驗證',
  title: 'Cosmic Signature 審計',
  intro:
    '查閱 Cosmic Signature 的合約審計與驗證資料，了解審查範圍、發現及處理狀態，並核對公開的合約實現。',
  sections: [
    {
      heading: 'Hacken 獨立審計',
      paragraphs: [
        '2025年末，Hacken 對 Cosmic Signature 智能合約進行了獨立安全審查。審查範圍覆蓋公開儲存庫中的全部生產合約：驅動每個週期的核心協議、CST 代幣、兩個 NFT 系列、錨定錢包，以及配套的錢包與系統管理合約。最終報告於2026年1月發佈。',
        '報告共列出 23 項發現，其中沒有嚴重或高危級別問題：3 項為中危、8 項為低危、12 項為提示性觀察。多數發現屬於團隊已審閱並接受的設計取捨，報告對每項發現及其處理狀態均有說明。',
        '除人工審查外，Hacken 還對 14 項系統不變量進行了模糊測試，例如協議持有的 ETH 總額必須等於存入減去取回。全部 14 項不變量在 10,000 次運行中均保持成立。',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: '閱讀 Hacken 審計報告全文',
      },
      note: '最後審查：2026年8月24日。本頁面是 Cosmic Signature 審計與驗證狀態的規範公開位置。',
    },
    {
      heading: '驗證清單',
      bullets: [
        '在官方合約頁面確認合約地址。',
        '在 Arbitrum 區塊瀏覽器中比對已驗證源代碼與 ABI 數據。',
        '閱讀 Hacken 審計報告，了解全部發現及其處理狀態。',
        '確認應用程式所展示的機制與公開合約行為一致。',
      ],
    },
    {
      heading: '相關信任資源',
      links: [
        { kind: 'app', href: '/contracts', label: '已驗證的 Arbitrum 合約地址' },
        { kind: 'app', href: '/code', label: '源代碼與確定性渲染資源' },
        { kind: 'app', href: '/security', label: '安全概覽' },
      ],
    },
  ],
};
