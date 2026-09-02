import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyZhHk: TrustPageCopy = {
  eyebrow: '風險與參與說明',
  title: 'Cosmic Signature 風險披露',
  // lexicon-allow-start: 法律否認文案須明確列出所排除的類別。
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。它不是彩票、賭場、賭博產品或投資產品，也不承諾任何財務結果。',
  // lexicon-allow-end
  sections: [
    {
      heading: '主要風險',
      bullets: [
        '區塊鏈交易公開，且通常無法撤銷。',
        '錢包安全、私鑰保管與交易批准均由參與者自行負責。',
        '網絡擁堵、RPC 中斷、索引延遲或應用程式問題都可能影響使用體驗。',
        '參與前應審閱協議參數、分配規則與時間安排。',
        // lexicon-allow-start: 否認文案須明確說明不保證財務回報。
        '不得將 CST 與 NFT 理解為有保證的回報或金融產品。',
        // lexicon-allow-end
      ],
    },
    {
      heading: '參與者會做什麼',
      paragraphs: [
        '參與者在演繹週期中落筆。落筆會影響不斷演變的協議狀態，可能銘刻參與 CST，並構成確定性 Cosmic Signature NFT 藝術的創作背景。所有結果均由公開的智能合約機制決定，而非鏈下承諾。',
      ],
    },
    {
      heading: '相關頁面',
      links: [
        // lexicon-allow-start: 連結標題列出目標頁面明確否認的類別。
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Cosmic Signature 是彩票、賭場或投資嗎？',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: '服務條款' },
        { kind: 'app', href: '/security', label: '安全概覽' },
      ],
    },
  ],
};
