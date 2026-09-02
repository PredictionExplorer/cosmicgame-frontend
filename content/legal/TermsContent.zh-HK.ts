import {
  ethDistributionFacts,
  isV3Mechanics,
  nftAllocationFacts,
  protocolFacts,
} from '@/content/protocol-facts';

import type { TermsCopy } from './TermsContent';

export const termsCopyZhHk = {
  title: '服務條款',
  subtitle: '使用 Cosmic Signature 前，請仔細閱讀本條款。使用本平台即表示你同意受本條款約束。',
  homeLabel: '主頁',
  lastUpdated: '最後更新：2026年7月20日',
  sections: [
    {
      id: 'acceptance',
      title: '接受條款',
      content: [
        {
          id: 'acceptance',
          text: '訪問及使用 Cosmic Signature，即表示你接受並同意受本服務條款約束。若不同意本條款，請勿使用本平台。',
        },
        {
          id: 'binding-agreement',
          text: '本條款構成你與 Cosmic Signature 之間具有法律約束力的協議。我們保留隨時修改本條款的權利；修改內容一經發布即刻生效。',
        },
      ],
    },
    {
      id: 'eligibility',
      title: '資格與帳戶要求',
      content: [
        {
          id: 'age',
          subtitle: '年齡要求',
          text: '你必須年滿 18 週歲方可使用 Cosmic Signature。使用本平台即表示你聲明並保證符合該年齡要求。',
        },
        {
          id: 'wallet',
          subtitle: '錢包責任',
          text: '你須自行負責 Web3 錢包與私鑰的安全。Cosmic Signature 絕不會索取私鑰或助記詞。若失去錢包訪問權限，可能永久失去 NFT 與資金。',
        },
        {
          id: 'compliance',
          subtitle: '遵守法律',
          text: '使用 Cosmic Signature 時，你同意遵守所在司法管轄區的一切適用法律法規，包括與加密貨幣及區塊鏈技術有關的規定。',
        },
      ],
    },
    {
      id: 'mechanics',
      title: '協議機制與智能合約',
      content: [
        {
          id: 'protocol',
          subtitle: '協議運作方式',
          text: 'Cosmic Signature 是去中心化的程序化鏈上藝術協議。參與者在演繹週期中使用 ETH 或 CST 代幣落筆。落筆會延長週期收官倒數、記錄協議資格，並可能依據智能合約公式銘刻動態參與 CST。週期收官倒數結束後，完成收官之筆的參與者可以取回簽名分配；其他分配則按照已公佈的分配軌道結構發放。',
        },
        {
          id: 'dynamic-cst',
          subtitle: '動態 CST 銘刻',
          text: isV3Mechanics
            ? '每筆落筆銘刻的參與 CST 並非固定數量，而是隨距上一筆落筆經過的時間線性累積，且每次銘刻的一部分會記入被超越的參與者。極短間隔的落筆可能銘刻 0 CST。'
            : '每筆落筆銘刻的參與 CST 並非固定數量，而是取決於距上一筆落筆經過的時間，並按平方根公式計算。極短間隔的落筆可能銘刻 0 CST。',
        },
        {
          id: 'cst-window',
          subtitle: 'CST 校準窗口',
          text: isV3Mechanics
            ? 'CST 落筆價格會在校準窗口中逐步下降。每筆 CST 落筆會以其成交價的兩倍（受鏈上最低值約束）重啟該窗口，之後價格按鏈上恆定速率下降，直至歸零或另一筆 CST 落筆成交。'
            : `CST 落筆價格會在鏈上儲存的校準窗口中逐步下降。每筆 CST 落筆會使該窗口增加約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%，每筆 ETH 落筆會使其減少約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%。`,
        },
        {
          id: 'smart-contract',
          subtitle: '智能合約互動',
          text: '所有協議操作都透過 Arbitrum 網絡上的智能合約執行。交易一經鏈上確認便無法撤銷。你確認知悉區塊鏈交易具有最終性且不可逆。',
        },
        {
          id: 'gas',
          subtitle: '燃料費',
          text: '你須支付與自身交易有關的全部 Arbitrum 網絡燃料費。燃料費與落筆價格相互獨立，支付給網絡，而非 Cosmic Signature。',
        },
        {
          id: 'random-walk',
          subtitle: 'Random Walk NFT 價格減免',
          text: '一枚 Random Walk NFT 可附加至一筆 ETH 落筆，使 ETH 落筆價格降低 50%。該操作永久有效且無法撤銷；使用後，同一枚 Random Walk NFT 不得再次用於價格減免。',
        },
      ],
    },
    {
      id: 'allocations',
      title: '分配與派發',
      content: [
        {
          id: 'distribution',
          subtitle: '分配發放',
          text: `分配按照智能合約規則自動發放。通常，每個週期會沿下列分配軌道銘刻 ${nftAllocationFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT 與 ${protocolFacts.typicalCstImprintsPerCycle.toLocaleString('zh-HK')} CST。`,
        },
        {
          id: 'signature',
          subtitle: '簽名分配',
          text: `完成收官之筆的參與者可以取回 ${ethDistributionFacts.mainEthPercentage}% 的 ETH、${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻、${nftAllocationFacts.mainPrizeNftPhrase.zhHant}，以及該週期中可能存在的已附加代幣。`,
        },
        {
          id: 'chrono',
          subtitle: '時之勇士',
          text: `連續保持堅守冠軍身份時間最長的參與者將獲得 ${ethDistributionFacts.chronoWarriorEthPercentage}% 的 ETH、${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻與 1 枚 Cosmic Signature NFT。`,
        },
        {
          id: 'endurance',
          subtitle: '堅守冠軍',
          text: `連續保持「最近一筆落筆者」身份時間最長的參與者將獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻與 1 枚 Cosmic Signature NFT。`,
        },
        {
          id: 'final-cst',
          subtitle: 'CST 收官之筆',
          text: `完成本週期最後一筆 CST 落筆的參與者將獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻與 1 枚 Cosmic Signature NFT。`,
        },
        {
          id: 'eth-selection',
          subtitle: 'ETH 星選',
          text: `${protocolFacts.ethStellarSelectionRecipients} 位獲配者共同分得週期儲備中 ${ethDistributionFacts.stellarSelectionEthPercentage}% 的 ETH。`,
        },
        {
          id: 'nft-selection',
          subtitle: 'NFT 星選',
          text: `${protocolFacts.nftStellarSelectionRecipients} 位獲配者各獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻與 1 枚 Cosmic Signature NFT。`,
        },
        {
          id: 'anchored-selection',
          subtitle: '錨定 NFT 星選',
          text: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 位 Random Walk NFT 錨定者各獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 表彰銘刻與 1 枚 Cosmic Signature NFT。`,
        },
        {
          id: 'anchor-distribution',
          subtitle: '錨定派發',
          text: `${ethDistributionFacts.anchorDistributionPercentage}% 的 ETH 按已錨定 Cosmic Signature NFT 的數量比例派發。`,
        },
        {
          id: 'public-goods',
          subtitle: '公共物品',
          text: `${ethDistributionFacts.publicGoodsPercentage}% 的 ETH 會轉撥給目前公共物品受益方 Protocol Guild。`,
        },
        {
          id: 'compounding',
          subtitle: '滾動儲備',
          text: `約 ${protocolFacts.compoundingReservePercentage}% 的週期儲備會滾入下一個演繹週期。`,
        },
        {
          id: 'outreach',
          subtitle: '推廣儲備',
          text: `每個週期會為推廣派發與生態貢獻者銘刻 ${protocolFacts.outreachReserveCst.toLocaleString('zh-HK')} CST。`,
        },
        {
          id: 'retrieval',
          subtitle: '取回分配',
          text: `部分分配需要透過平台手動取回。週期收官倒數結束後，簽名分配的合資格參與者享有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬收官時間。該窗口結束後，任何人都可完成週期收官；按照智能合約規則，實際收官者將成為週期受益方並獲得簽名分配。次級 ETH、已附加代幣與已附加 NFT 採用另一項取回期限，預設為 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 週；期限結束後，智能合約允許任何人為自己取回仍未取回的分配。你有責任在相應期限屆滿前取回分配。`,
        },
        {
          id: 'no-guarantee',
          subtitle: '不保證結果',
          text: '參與 Cosmic Signature 不保證產生任何結果。所有落筆均視為最終操作，你可能無法收回落筆價格的全部金額。切勿使用無法承受失去的資金落筆。',
        },
      ],
    },
    {
      id: 'risks',
      title: '風險與免責聲明',
      content: [
        {
          id: 'blockchain-risk',
          subtitle: '區塊鏈技術風險',
          text: '你確認知悉區塊鏈技術的固有風險，包括但不限於智能合約漏洞、網絡擁堵、燃料費波動、監管變化，以及技術問題可能造成的資金損失。',
        },
        {
          id: 'warranties',
          subtitle: '不作保證',
          text: 'Cosmic Signature 按「現狀」提供，不附帶任何明示或默示保證。我們不保證平台持續不中斷、毫無錯誤或不含有害組件。',
        },
        {
          id: 'volatility',
          subtitle: '市場波動',
          text: '加密貨幣與 NFT 市場波動劇烈。ETH、CST 代幣及 NFT 的價值可能大幅變化；過往表現並不代表未來結果。',
        },
        {
          id: 'audits',
          subtitle: '智能合約審計',
          text: '我們會盡力保障智能合約安全，但任何審計都無法保證絕對安全。你須自行承擔使用本平台的風險。',
        },
      ],
    },
    {
      id: 'prohibited',
      title: '禁止行為',
      content: [
        {
          id: 'intro',
          text: '你同意不得從事以下任何禁止行為：',
        },
        {
          id: 'exploit',
          text: '• 利用程序缺陷、故障或漏洞操縱或破壞協議機制',
        },
        {
          id: 'automation',
          text: '• 使用機器人、腳本或自動化工具與平台互動',
        },
        {
          id: 'collusion',
          text: '• 實施任何形式的市場操縱，或與其他用戶串通',
        },
        {
          id: 'security',
          text: '• 試圖入侵、逆向工程或破壞平台安全',
        },
        {
          id: 'law',
          text: '• 違反任何適用法律法規',
        },
        {
          id: 'accounts',
          text: '• 創建多個帳戶以取得不公平優勢',
        },
        {
          id: 'malicious',
          text: '• 上傳惡意內容或試圖發動拒絕服務攻擊',
        },
      ],
    },
  ],
  additionalTitle: '其他條款',
  additional: [
    {
      id: 'intellectual-property',
      subtitle: '知識產權',
      text: '儲存庫根目錄 LICENSE 所涵蓋的項目自有材料採用 CC0 1.0。第三方依賴、字體、素材及其他第三方材料仍適用各自的授權條款，不在該權利放棄範圍內；詳見 THIRD_PARTY_NOTICES.md。CC0 不放棄商標權或專利權。未採用 CC0 或指定開源授權的材料仍歸各自權利人所有，並受適用的知識產權法律保護。透過協議獲得 NFT，代表你擁有相應的特定代幣；除非另有明確說明，該所有權不包含底層知識產權。',
    },
    // lexicon-allow-start: 責任限制條款須忠實保留利潤損失這一法律概念。
    {
      id: 'liability',
      subtitle: '責任限制',
      text: '在法律允許的最大範圍內，Cosmic Signature 及其關聯方不對任何間接、附帶、特殊、後果性或懲罰性損害承擔責任，也不對直接或間接發生的任何利潤或營收損失，以及因使用本平台而產生的數據、使用權、商譽或其他無形損失承擔責任。',
    },
    // lexicon-allow-end
    {
      id: 'indemnification',
      subtitle: '賠償',
      text: '對於因你使用本平台、違反本條款或侵害任何第三方權利而產生的任何索賠、損失、損害、責任及費用（包括法律費用），你同意賠償 Cosmic Signature 及其關聯方並使其免受損害。',
    },
    {
      id: 'disputes',
      subtitle: '爭議解決',
      text: '因本條款或你使用 Cosmic Signature 而產生的任何爭議，應按照美國仲裁協會規則透過具有約束力的仲裁解決。你放棄接受陪審團審判或參與集體訴訟的任何權利。',
    },
    {
      id: 'law',
      subtitle: '適用法律',
      text: '本條款受 Cosmic Signature 運營所在司法管轄區的法律管轄並依其解釋，不適用該司法管轄區的法律衝突規則。',
    },
    {
      id: 'severability',
      subtitle: '可分割性',
      text: '若本條款任何規定被認定無效或不可執行，其餘規定仍將保持完全效力。',
    },
    {
      id: 'agreement',
      subtitle: '完整協議',
      text: '本條款構成你與 Cosmic Signature 之間關於使用本平台的完整協議，並取代此前的一切協議。',
    },
    {
      id: 'contact',
      subtitle: '聯絡方式',
      text: '如對本服務條款有任何疑問，請透過官方社區渠道或 GitHub 儲存庫聯絡我們。',
    },
  ],
  // lexicon-allow-start: Howey 測試否認文案須明確排除投資屬性。
  warning: {
    title: '重要警示',
    text: '參與 Cosmic Signature 涉及財務風險。加密貨幣與 NFT 市場波動劇烈，你可能無法收回落筆所對應的價值。切勿使用無法承受失去的資金落筆。Cosmic Signature 不是投資產品，不對代幣價格或未來表現作任何陳述，也不會以投資名義招攬參與。參與前，請自行研究並審慎考慮自身財務狀況。',
  },
  // lexicon-allow-end
  acknowledgment: {
    title: '確認',
    text: '使用 Cosmic Signature，即表示你確認已閱讀、理解並同意受本服務條款約束。你同時確認已理解區塊鏈技術、加密貨幣與 NFT 所涉及的風險。',
  },
} as const satisfies TermsCopy;
