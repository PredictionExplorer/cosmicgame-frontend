import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /security, rendered by TrustPageContent. */
export const securityCopyZhTw: TrustPageCopy = {
  eyebrow: '信任與安全',
  title: 'Cosmic Signature 安全',
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。其安全體系依靠公開的智慧合約、透明的協議資料、審慎的錢包互動，以及清晰的參與者教育。',
  sections: [
    {
      heading: '安全模型',
      paragraphs: [
        '協議操作由 Arbitrum 智慧合約紀錄。連接錢包或落筆前，公開頁面應便於使用者與抓取工具檢查合約地址、原始碼資源、驗證背景及執行假設。',
      ],
      bullets: [
        '請使用官方應用程式 `https://app.cosmicsignature.com/`。',
        '進行鏈上互動前，請在合約頁面核對合約地址。',
        '仔細審閱錢包提示；區塊鏈交易無法撤銷。',
        '不得將 CST、NFT、落筆或分配視為有保證的財務結果。',
      ],
    },
    {
      heading: '驗證資源',
      paragraphs: [
        '可見的應用程式內容、已驗證合約、原始碼與 Arbitrum 即時資料彼此一致，是最有力的安全訊號。',
      ],
      links: [
        { kind: 'app', href: '/contracts', label: 'Cosmic Signature 合約與 Arbitrum 地址' },
        { kind: 'app', href: '/code', label: 'Cosmic Signature 原始碼與渲染流水線' },
        { kind: 'app', href: '/audits', label: '審計與形式化驗證說明' },
        { kind: 'app', href: '/risk-disclosures', label: '風險揭露與參與說明' },
      ],
    },
  ],
};
