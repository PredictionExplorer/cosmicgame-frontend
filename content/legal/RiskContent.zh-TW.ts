import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** Traditional Chinese (Taiwan) copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyZhTw: RiskCopy = {
  title: '風險揭露',
  // lexicon-allow-start: 法律否認文案須明確列出所排除的類別。
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。它不是彩票、賭場、賭博產品或投資產品，也不承諾任何財務結果。',
  // lexicon-allow-end
  keyPoint: {
    title: '參與之前',
    text: '只用你能承受失去的資金落筆。無論週期後來如何發展，落筆的花費都不會退還。',
  },
  groups: [
    {
      id: 'mechanics',
      heading: '週期機制',
      risks: [
        '當後續落筆跟上時，你落筆所花的 ETH 或 CST 不會退還。',
        `每一次 ETH 落筆都會使下一次 ETH 落筆價格提高 ${facts.ethGestureCostStepUpPercent}%，因此重複落筆的價格會逐次上升。`,
        '校準窗口會改變 CST 落筆價格：無人進行 CST 落筆時價格持續下降，每次 CST 落筆後又會以更高的價格重新開始，因此你看到的價格可能在交易上鏈前發生變化。',
      ],
      source: '規則見服務條款中的<termsMechanics>協議機制與智慧合約</termsMechanics>。',
    },
    {
      id: 'timing',
      heading: '時間與取回',
      risks: [
        `完成收官之筆的參與者可在週期收官時間之後的 ${facts.finalGestureExclusivityHours} 小時內獨自完成收官。此後任何人都可以完成收官，並依照合約規則成為簽名分配的獲配者。`,
        `其他 ETH 分配與附加資產預設為獲配者保留 ${facts.secondaryRetrievalTimeoutWeeks} 週。此後任何人都可以為自己取回剩餘部分。`,
      ],
      source: '規則見服務條款中的<termsRetrieval>取回分配</termsRetrieval>。',
    },
    {
      id: 'permanent',
      heading: '無法撤銷的操作',
      risks: [
        '已確認的交易無法撤銷、取消或退款。',
        '用於減免 ETH 落筆價格的 Random Walk NFT 會被用掉：它再也不能用於減免價格。',
        '每個 NFT 只能錨定一次。解錨後，不能再次錨定。',
      ],
      source: '規則見服務條款中的<termsRandomWalk>Random Walk NFT 價格減免</termsRandomWalk>。',
    },
    {
      id: 'wallets',
      heading: '錢包與金鑰',
      risks: [
        '金鑰只由你自己掌握。任何拿到你助記詞的人都能控制你的錢包，而遺失的助記詞無法找回。',
        '錢包提示授予的權限可能比看起來更多。請閱讀每一項核准，並只使用<securityOfficial>官方地址</securityOfficial>。',
      ],
      source: '規則見服務條款中的<termsEligibility>資格與帳戶要求</termsEligibility>。',
    },
    {
      id: 'availability',
      heading: '網路與應用程式',
      risks: [
        '網路擁塞、RPC 中斷、索引延遲或應用程式問題，都可能延遲或阻斷交易以及本網站顯示的資料。',
        '本網站顯示的資料可能比鏈上狀態落後幾秒或更久。兩者不一致時，以 Arbitrum 上的合約為準。',
        '智慧合約可能存在審計未能發現的缺陷。審計檢查了哪些內容，請見<audits>審計</audits>。',
      ],
      source: '規則見服務條款中的<termsRisks>風險與免責聲明</termsRisks>。',
    },
    {
      id: 'value',
      heading: '價值與結果',
      risks: [
        'ETH、CST 與 NFT 的市場價值可能大幅波動，甚至歸零。',
        // lexicon-allow-start: 否認文案須明確說明不保證財務回報。
        '不得將 CST 與 NFT 理解為有保證的回報或金融產品。',
        // lexicon-allow-end
        '任何落筆都不保證獲得分配。結果由公開的合約規則決定，而非鏈下承諾。',
      ],
      source: '規則見服務條款中的<termsNoGuarantee>不保證結果</termsNoGuarantee>。',
    },
  ],
  participation: {
    heading: '參與者會做什麼',
    paragraphs: [
      '參與者在演繹週期中落筆。落筆會影響不斷演變的協議狀態，可能銘刻參與 CST，並構成確定性 Cosmic Signature NFT 藝術的創作背景。所有結果均由公開的智慧合約機制決定，而非鏈下承諾。',
      // lexicon-allow-start: 連結文字列出目標頁面明確否認的類別。
      '了解為什麼 Cosmic Signature <notALottery>不是彩票、賭場或投資</notALottery>。',
      // lexicon-allow-end
    ],
  },
};
