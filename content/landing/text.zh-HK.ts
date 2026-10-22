import { nftAllocationFacts } from '@/content/protocol-facts';
import { ethDistributionFacts, protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/**
 * 中文着陸頁文案，以 structure.ts 中的骨架為鍵。標題中的 \u200B 標出可換行的短語邊界
 * （lib/phrases.ts），不會顯示。
 */
export const landingTextZhHk = {
  meta: {
    title: 'Cosmic Signature · Arbitrum 上的程序化鏈上藝術協議',
    description: `Cosmic Signature 是運行於 Arbitrum 的程序化鏈上藝術協議。參與者在每個演繹週期中落筆；週期收官後，新的簽名作品隨之銘刻，週期儲備按規則分配至各條軌道，其中 ${ethDistributionFacts.publicGoodsPercentage}% 分配至公共物品金庫。`,
    keywords: [
      'Cosmic Signature',
      '程序化藝術協議',
      '鏈上藝術',
      'Arbitrum',
      '三體問題',
      '生成藝術',
      '公共物品',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: '程序化鏈上藝術協議 · Arbitrum',
    headlineLead: '每一次落筆，',
    headlineAccent: '都在塑造\u200B藝術。',
    subhead: `每一次落筆以 ETH 或 CST 完成，都會延長週期的收官倒數。倒數歸零即可收官：為獲配者銘刻新的簽名作品，並將週期儲備分配到各條軌道，其中 ${ethDistributionFacts.publicGoodsPercentage}% 分配至公共物品金庫。`,
    secondaryCtaLabel: '了解週期如何運作',
    art: {
      viewAriaLabel: '在應用程式中查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature {tokenLabel} —— 確定性三體生成藝術作品',
      galleryCta: '瀏覽完整畫廊',
    },
  },

  cycle: {
    eyebrow: '週期',
    heading: '從開啟到收官，讀懂完整的\u200B演繹週期。',
    steps: {
      gesture: {
        title: '落筆',
        body: 'ETH 或 CST 均可參與。每一筆都記錄在鏈上，並計入本週期的星選資格。',
      },
      extend: {
        title: '延長倒數',
        body: '每一筆都會延長收官倒數；只要有人持續參與，週期就會延續。',
      },
      finalize: {
        title: '收官與分配',
        body: '倒數歸零後即可收官：新的簽名作品隨之銘刻，週期儲備沿下方各條軌道分配。',
      },
    },
    gestureCtaLabel: '落筆',
    guideCtaLabel: '逐步了解運作原理',
  },

  art: {
    eyebrow: '藝術',
    heading: '三體軌跡，由鏈上種子\u200B生成。',
    description:
      '每枚 Cosmic Signature NFT 都呈現牛頓引力下的三體運動。種子記錄在鏈上，圖像與影片在鏈下渲染。重現結果須配合對應的渲染器版本、設定與兼容工具鏈核對。',
    showcase: {
      viewAriaLabel: '查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature 作品 {tokenLabel}',
    },
    stageLabel: '階段',
    stages: {
      seed: {
        title: '種子',
        body: '從鏈上數據——區塊資訊與 ArbSys 預編譯——派生出 32 字節哈希，再送入 SHA3-256 RNG。',
      },
      simulation: {
        title: '模擬',
        body: '十萬組候選構型分別透過四階 Yoshida 辛積分器演算，每組推進 1,000,000 個物理步。',
      },
      selection: {
        title: '篩選',
        body: 'Borda 排序綜合混沌度與等邊性建立候選名單，再透過圖像層面的審美檢查篩選。',
      },
      camera: {
        title: '鏡頭',
        body: '鏡頭沿緩慢的橢圓軌跡漂移，為每幅簽名作品中的三體之舞帶來電影般的視差。',
      },
      color: {
        title: '色彩',
        body: '連續的 OKLCh 感知調色方案調整色相與其他色彩屬性，不把三個天體固定為等間隔色相。',
      },
      'spectral-render': {
        title: '光譜渲染',
        body: '從 380 至 700 納米劃分 64 個波長區間，以隨速度變化的線寬和景深渲染軌跡。',
      },
      signature: {
        title: '簽名',
        body: '軌跡經過色調、輝光等後期處理，生成靜態圖像和動畫；最終外觀與輸出格式取決於渲染器版本及設定。',
      },
    },
    facts: {
      imprinted: { label: '已銘刻' },
      resolution: { label: '原生解像度' },
      animation: { label: '動畫', value: '30 秒 · 60 fps' },
      license: { label: '授權條款' },
    },
  },

  tracks: {
    eyebrow: '分配軌道',
    heading: '每一份週期儲備，都按規則分配。',
    description:
      '收官時，合約按設定發放 ETH 份額，並銘刻固定 CST 與 NFT。通常約一半 ETH 儲備留至下一週期，實際留存亦受取整和條件轉賬影響。',
    ethLabel: '每個週期儲備中的 ETH',
    fixedLabel: '每個週期的 CST 與 NFT',
    fixedEach: `每位獲配者獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT。`,
    recipients: { other: '{count}\u00a0位獲配者' },
    items: {
      'signature-allocation': {
        title: '簽名分配',
        body: `歸實際收官者，通常是收官之筆參與者。包括合共 1,000 CST 與 ${nftAllocationFacts.mainPrizeNftPhrase.zhHant}；專屬窗口過後，其他收官者亦可成為受益方。`,
      },
      'compounding-reserve': {
        percent: '約 50%',
        title: '滾動儲備',
        body: '未分配的 ETH 留作下一週期儲備；取整與未轉出份額可能增加留存，但不保證儲備逐週期增長。',
      },
      'chrono-warrior': {
        title: '時之勇士分配',
        body: `單次連續保持堅守冠軍身份時間最長的參與者獲配。其中包括 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      'public-goods': {
        title: '公共物品分配',
        body: '先轉入公共物品金庫，再由另一筆交易轉給目前受益方 Protocol Guild。',
      },
      'anchor-distribution': {
        title: '錨定派發',
        body: '按比例發放給本週期錨定至協議的所有 Cosmic Signature NFT。',
      },
      'eth-stellar-selection': {
        title: 'ETH 星選',
        body: `由 ${protocolFacts.ethStellarSelectionRecipients} 次加權選取均分。權重取每筆發生時未減免、未含溢價的 ETH 基礎價格，容許重複獲配。`,
      },
      'participant-nft-stellar-selection': {
        title: '參與者 NFT 星選',
        body: '與參與者 ETH 星選採用相同權重規則，按每筆的 ETH 基礎價格加權選取。',
      },
      'anchored-nft-stellar-selection': {
        title: '錨定 NFT 星選',
        body: '從 Random Walk NFT 錨定者中程序化隨機選出。',
      },
      'endurance-champion': {
        title: '堅守冠軍分配',
        body: '連續堅守時間最長的參與者。',
      },
      'final-cst-gesture': {
        title: 'CST 收官之筆分配',
        body: '本週期最後一次使用 CST 落筆的參與者。',
      },
    },
  },

  anchoring: {
    eyebrow: '錨定',
    heading: '將 Cosmic Signature NFT 錨定至協議。',
    body: `將 Cosmic Signature NFT 錨定至協議後，它每個週期都會按比例累積 ${ethDistributionFacts.anchorDistributionPercentage}% 錨定派發中的份額，解錨時即可取回。可隨時解錨，但每枚 NFT 只可錨定一次。`,
    bullets: [
      '每個週期累積 ETH，解錨時取回',
      '沒有固定期限、沒有罰則；每枚 NFT 解錨後不可再錨定',
      '姊妹系列 Random Walk NFT 也可以錨定',
      `已錨定的 Random Walk NFT 可獲得錨定 NFT 星選資格：${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT，不含 ETH`,
    ],
    ctaLabel: '前往應用程式錨定',
  },

  publicGoods: {
    eyebrow: '公共物品',
    heading: '每個週期的儲備，都有一部分\u200B流向\u200B以太坊\u200B核心貢獻者。',
    body: '收官時，協議會嘗試將固定 ETH 份額轉入公共物品金庫。其後任何人均可另發一筆交易，將餘額轉給目前受益方 Protocol Guild，支持以太坊核心貢獻者。金庫所有者可更改受益方。',
    disclaimerHeading: '免責聲明',
    // lexicon-allow-start: 明確否認慈善捐贈及相關稅務定性。
    disclaimer:
      '這是向公共物品地址（目前為 Protocol Guild）轉撥 ETH，並非美國稅法意義上的慈善捐贈。Cosmic Signature 不對其稅務處理作任何陳述。',
    // lexicon-allow-end
    card: {
      label: '週期分配',
      description: '收官時轉入金庫的份額，轉給受益方須另發一筆交易。',
      tableRows: {
        contributors: { label: 'Protocol Guild 貢獻者' },
        enforcement: { label: '執行方式', value: '鏈上' },
        recipient: { label: '獲配者' },
      },
    },
    ctaLabel: '了解 Protocol Guild',
  },

  council: {
    eyebrow: '宇宙議會',
    heading: '協議協調，盡在鏈上。',
    body: 'CST 持有者在鏈上協調協議事務：委託權重、提交協調提案，並表示支持或反對。',
    columns: {
      proposal: {
        title: '協調提案',
        body: `獲委託權重不少於 ${protocolFacts.councilProposalThresholdCst} CST 的地址均可提交提案。協調延遲為 ${protocolFacts.councilVotingDelayDays} 天，協調期為 ${protocolFacts.councilVotingPeriodWeeks} 週。`,
      },
      weight: {
        title: '協調權重',
        body: '委託完成後，每單位 CST 對應一單位協調權重。支持、反對或棄權均透過密碼學簽名提交；CST 不代表股份，也不是股權工具。',
      },
      quorum: {
        title: '協調法定權重',
        body: `支持權重高於反對權重，且支持與棄權權重之和達到 CST 總供應量的 ${protocolFacts.councilQuorumPercent}%，提案即獲通過。反對權重不計入法定權重。`,
      },
    },
  },

  verifiability: {
    eyebrow: '可驗證性',
    heading: '開放、已驗證、可復現。',
    body: '可查閱鏈上種子、對應渲染器版本、合約地址，以及公開的驗證和審計狀態。不同證據各有範圍。',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Cosmic Signature 各儲存庫中的項目自有材料（合約、着色器與渲染管線）採用 CC0 1.0，不保留任何權利；第三方依賴、字體與素材仍適用各自的授權條款。',
      },
      verification: {
        title: '驗證狀態',
        body: '應用程式提供公開合約地址、源代碼資源、驗證說明及審計與報告狀態，任何人都能查看已發佈內容。',
      },
      reproducible: {
        title: '可復現藝術',
        body: '倉庫提供手動執行的參考圖像檢查。重現作品須固定種子、渲染器版本、設定與兼容工具鏈；目前持續整合不會比較生成畫面的雜湊。',
      },
    },
    evidenceLabel: '親自查證',
  },

  faq: {
    eyebrow: '釋疑',
    heading: '值得直面的問題。',
    moreLabel: '更多解答請見常見問題',
    items: [
      {
        question: '參與者實際要做什麼？',
        answer:
          'ETH 或 CST 落筆會記錄加權星選資格，並延長已儲存的收官時間。下一筆執行時，上一筆參與者可能獲得按間隔線性計算的參與 CST。亦可錨定 Cosmic Signature NFT 參與錨定派發；提交宇宙議會提案須符合歷史委託權重門檻。',
      },
      {
        question: '這件藝術作品在技術上是什麼？',
        answer:
          '每枚 Cosmic Signature NFT 的種子與所有權紀錄保存在鏈上。圖像和影片由鏈下開源渲染器生成，呈現牛頓引力下的三體運動。重現作品需要種子、對應渲染器版本、設定與兼容工具鏈；媒體檔案並非全部儲存在合約中。',
      },
      {
        question: 'ETH 分配來自哪裏？',
        answer:
          '來自週期儲備；參與者落筆時，儲備隨之增加。週期收官後，約一半滾入下一週期的滾動儲備，其餘則按照鏈上參數，經由各條分配軌道發放，包括簽名分配、時之勇士、錨定派發、星選與公共物品。',
      },
      // lexicon-allow-start: 明確否認慈善捐贈及相關稅務定性。
      {
        question: '公共物品具體指什麼？',
        answer: `每個週期會將 ETH 儲備的 ${ethDistributionFacts.publicGoodsPercentage}% 先分配至公共物品金庫，再由另一筆交易轉給目前受益方 Protocol Guild。Protocol Guild 是為 170 多位以太坊核心貢獻者提供資助的集體機制。這是向公共物品地址轉撥 ETH，並非美國稅法意義上的慈善捐贈；Cosmic Signature 不對其稅務處理作任何陳述。`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明確否認彩票、賭場、賭博、莊家、荷官及賭注類別。
      {
        question: '這是彩票、賭場或賭博產品嗎？',
        answer:
          '不是。Cosmic Signature 是程序化鏈上藝術協議。參與者在演繹週期中落筆；週期收官後，協議將儲備按規則分配至各條分配軌道。這裏沒有莊家，沒有荷官，也沒有賭注。分配所表彰的是堅守、時機與參與。唯一帶有隨機性的分配軌道——星選——是協議層面的程序化分配。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明確否認投資、利潤、股息及投資合同定性。
      {
        question: '這屬於投資嗎？',
        answer:
          '不是。CST 代幣用於表達協議內的參與和協調權重，不代表股權、利潤分成、股息或投資合同。目前 ETH 分配沒有獨立團隊份額。Cosmic Signature 不對代幣價格或未來表現作任何陳述，也不以投資名義招攬參與。',
      },
      // lexicon-allow-end
      {
        question: '為什麼參與 CST 的數量會變化？',
        answer:
          'V3 按兩筆之間的時長線性計算參與 CST，下一筆執行時全額銘刻給上一筆參與者。首筆不發放這項 CST，收官亦不結算最後一筆之後的累積量。原始時間增量下約每分鐘 1 CST，實際數量以合約為準。',
      },
      {
        question: 'ETH 與 CST 落筆會怎樣影響 CST 校準窗口？',
        answer:
          'V3 調整的是 CST 價格下降速率：ETH 落筆嘗試加快速率，須通過最短窗口檢查；CST 落筆減慢速率，並按不含溢價的基礎花費、設定下限和最短窗口要求重設上限。窗口時長由上限與速率推算，不再按舊版固定百分比調整。',
      },
      {
        question: '我可以自由複用或改編嗎？',
        answer:
          '可以。項目自有的合約、着色器、渲染器、推廣頁面與文檔均採用 CC0 1.0，不保留任何權利。第三方依賴、字體與素材仍適用各自的授權條款；詳見 THIRD_PARTY_NOTICES.md。',
      },
    ],
  },
  closing: {
    eyebrow: '作品集',
    heading: '每個週期，都為作品集\u200B添上新作。',
    body: '關注即時週期、落筆參與，或瀏覽至今銘刻的每一幅簽名作品。',
  },
} satisfies LandingText;
