import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical Taiwan Traditional-Chinese terminology (docs/i18n/glossary-zh-TW.md).
 *
 * Two kinds of rule live here. Coined protocol terms mirror the Simplified
 * pack in Traditional characters with Taiwan-native renderings where the
 * variants diverge (錨定配發, 公共財, 網站導覽, 收官倒數). Vocabulary rules
 * catch the mainland and Hong Kong words that character conversion leaves
 * behind (網絡 for 網路, 軟件 for 軟體, 信息 for 資訊, 用戶 for 使用者) — the
 * commonest reason Taiwan readers describe a Traditional site as "translated
 * from Simplified". Terms banned by ZH_HANT_BANNED_TERMS / ZH_TW_BANNED_TERMS in
 * lexicon-scan-core.ts belong only there. Matched as CJK substrings.
 */
// lexicon-allow-start: drift variants quote the rejected renderings they catch
export const ZH_TW_TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  // ── Coined protocol terms ────────────────────────────────────────────────
  {
    concept: 'Gesture',
    canonical: '落筆',
    variants: ['手勢', '姿態'],
  },
  {
    concept: 'Gesture Cost',
    canonical: '落筆價格',
    variants: ['落筆成本', '手勢價格', '手勢成本'],
  },
  {
    concept: 'Performance Cycle',
    canonical: '演繹週期（密集介面可簡稱「週期」）',
    variants: ['表演週期', '演出週期', '效能週期', '績效週期', '性能週期'],
  },
  {
    concept: 'Finalize / Finalization',
    canonical: '收官',
    variants: ['最終確定', '週期最終確定', '最終落筆'],
  },
  {
    concept: 'Final Gesture',
    canonical: '收官之筆',
    variants: ['最後手勢', '最終手勢'],
  },
  {
    concept: 'Allocation Recipient',
    canonical: '獲配者',
    variants: ['分配接收者', '獲獎者', '勝出者'],
  },
  {
    concept: 'Stellar Selection',
    canonical: '星選',
    variants: ['恆星選擇', '星級選擇', '星空選擇', '隨機抽選'],
  },
  {
    concept: 'Anchoring / release',
    canonical: '錨定 / 解錨',
    variants: ['錨固', '錨點鎖定', '解除錨定', '錨定釋放'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: '錨定配發',
    variants: ['錨定派發', '錨定分發', '錨點派發', '錨定發放'],
  },
  {
    concept: 'Imprint',
    canonical: '銘刻',
    variants: ['刻印', '印製 NFT'],
  },
  {
    concept: 'Cosmic Council',
    canonical: '宇宙議會',
    variants: ['宇宙委員會', '宇宙理事會'],
  },
  {
    concept: 'Public Goods',
    canonical: '公共財',
    variants: ['公共物品', '公益品', '公共產品', '公共商品'],
  },
  {
    concept: 'Public Goods funding',
    canonical: '公共財資助',
    variants: ['公益資助'],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: '滾動儲備',
    variants: ['複合週期儲備', '複合儲備'],
  },
  {
    concept: 'Gallery',
    canonical: '畫廊',
    variants: ['圖庫'],
  },
  {
    concept: 'Learn Hub',
    canonical: '學習中心',
    variants: ['學習樞紐'],
  },
  {
    concept: 'Site Map',
    canonical: '網站導覽',
    variants: ['網站地圖', '站點地圖'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: '推廣儲備',
    variants: ['行銷儲備', '營銷儲備', '市場推廣儲備', '市場儲備'],
  },
  {
    concept: 'Outreach Allocation',
    canonical: '推廣分配',
    variants: ['行銷分配', '營銷分配'],
  },
  {
    concept: 'Participation CST',
    canonical: '參與 CST',
    variants: ['參與度 CST'],
  },
  {
    concept: 'Recognition CST',
    canonical: '表彰 CST',
    variants: ['認可 CST'],
  },
  {
    concept: 'Attached NFTs',
    canonical: '已附加 NFT / 附加',
    variants: ['附屬 NFT', '掛載 NFT'],
  },
  {
    concept: 'Named Tokens',
    canonical: '已命名代幣 / 命名',
    variants: ['命名令牌', '命名通證'],
  },
  {
    concept: 'Finalization countdown',
    canonical: '收官倒數',
    variants: ['收官倒計時', '最終倒數', '結束倒數', '最終倒計時', '結束倒計時'],
  },
  {
    concept: 'Calibration Window',
    canonical: '校準窗口',
    variants: ['校準視窗'],
  },
  {
    concept: 'Procedural (art)',
    canonical: '程序化',
    variants: ['程式化藝術', '程式化鏈上'],
  },
  {
    concept: 'Connect wallet',
    canonical: '連接錢包',
    variants: ['連線錢包', '鏈接錢包'],
  },
  // ── Taiwan vocabulary (mainland / Hong Kong words left by conversion) ────
  {
    concept: 'network',
    canonical: '網路',
    variants: ['網絡'],
  },
  {
    concept: 'software',
    canonical: '軟體',
    variants: ['軟件'],
  },
  {
    concept: 'information',
    canonical: '資訊',
    variants: ['信息'],
  },
  {
    concept: 'user',
    canonical: '使用者',
    variants: ['用戶', '用户'],
  },
  {
    concept: 'log in',
    canonical: '登入',
    variants: ['登錄'],
  },
  {
    concept: 'default (setting)',
    canonical: '預設',
    variants: ['默認'],
  },
  {
    concept: 'settings',
    canonical: '設定',
    variants: ['設置'],
  },
  {
    concept: 'search',
    canonical: '搜尋',
    variants: ['搜索'],
  },
  {
    concept: 'loading',
    canonical: '載入',
    variants: ['加載'],
  },
  {
    // Phrase-level on purpose: 刷新紀錄 ("break a record") is correct Taiwan usage.
    concept: 'refresh (page)',
    canonical: '重新整理',
    variants: ['刷新頁面', '刷新後', '請刷新', '刷新預覽', '刷新目前', '刷新網頁'],
  },
  {
    concept: 'link',
    canonical: '連結',
    variants: ['鏈接'],
  },
  {
    concept: 'video',
    canonical: '影片',
    variants: ['視頻'],
  },
  {
    concept: 'menu',
    canonical: '選單',
    variants: ['菜單'],
  },
  {
    concept: 'server',
    canonical: '伺服器',
    variants: ['服務器'],
  },
  {
    concept: 'smart contract',
    canonical: '智慧合約',
    variants: ['智能合約'],
  },
  {
    concept: 'probability',
    canonical: '機率',
    variants: ['概率'],
  },
  // "quality" is deliberately not a rule: 質量 is also the physics word for
  // mass, which the white paper and trait vocabulary use correctly.
  {
    concept: 'digital',
    canonical: '數位',
    variants: ['數碼', '數字化'],
  },
  {
    concept: 'mobile device',
    canonical: '行動裝置',
    variants: ['移動裝置', '流動裝置', '移動端'],
  },
  {
    concept: 'feedback (loop)',
    canonical: '回饋',
    variants: ['反饋'],
  },
  {
    concept: 'contact',
    canonical: '聯絡',
    variants: ['聯繫'],
  },
  {
    concept: 'interface',
    canonical: '介面',
    variants: ['界面'],
  },
  {
    concept: 'online',
    canonical: '線上',
    variants: ['在線'],
  },
  {
    concept: 'real-time',
    canonical: '即時',
    variants: ['實時'],
  },
  {
    concept: 'account',
    canonical: '帳戶',
    variants: ['賬戶'],
  },
  {
    concept: 'device',
    canonical: '裝置',
    variants: ['設備'],
  },
  {
    concept: 'screen',
    canonical: '螢幕',
    variants: ['屏幕'],
  },
  {
    concept: 'Privacy Policy',
    canonical: '隱私權政策',
    variants: ['隱私政策', '私隱政策'],
  },
  {
    concept: 'Risk Disclosures',
    canonical: '風險揭露',
    variants: ['風險披露'],
  },
  {
    concept: 'Taiwan',
    canonical: '台灣',
    variants: ['臺灣'],
  },
] as const;
// lexicon-allow-end
