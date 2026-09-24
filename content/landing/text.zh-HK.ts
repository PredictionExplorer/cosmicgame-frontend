import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/** 中文着陸頁文案，以 structure.ts 中的骨架為鍵。 */
export const landingTextZhHk = {
  meta: {
    title: 'Cosmic Signature · Arbitrum 上的程序化鏈上藝術協議',
    description: `Cosmic Signature 是運行於 Arbitrum 的程序化鏈上藝術協議。參與者在每個演繹週期中落筆；週期收官後，新的簽名作品隨之銘刻，週期儲備按十餘條軌道分配，其中 ${protocolFacts.publicGoodsPercentage}% 轉撥給以太坊核心貢獻者。`,
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
    headline: '每一次落筆， 都在塑造藝術。',
    headlineLead: '每一次落筆，',
    headlineAccent: '都在塑造藝術。',
    subhead: `使用 ETH 或 CST 落筆，延長週期的收官倒數。倒數歸零後，完成收官即可銘刻新的簽名作品並分配週期儲備，其中 ${protocolFacts.publicGoodsPercentage}% 轉撥給以太坊核心貢獻者。`,
    primaryCtaLabel: '打開應用程式',
    secondaryCtaLabel: '了解週期如何運作',
    art: {
      viewAriaLabel: '在應用程式中查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature {tokenLabel} —— 確定性三體生成藝術作品',
      galleryCta: '瀏覽完整畫廊',
    },
  },

  cycle: {
    eyebrow: '週期',
    heading: '從開啟到收官，讀懂完整的演繹週期。',
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
    heading: '三體軌跡，由鏈上種子生成。',
    description:
      '每枚 Cosmic Signature NFT 都呈現 3 個天體在牛頓引力下的運動軌跡。三體運動天生混沌。沒有 AI，沒有訓練數據，只有確定性的物理。同一種子生成的畫面逐像素一致。',
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
        body: '十萬組候選構型分別透過四階 Yoshida 辛積分器演算，每組推進 1,000,000 個物理步。',
      },
      selection: {
        title: '篩選',
        body: 'Borda 排序聚合會綜合混沌度與等邊性，從候選池中選出視覺張力最強的一條軌道。',
      },
      camera: {
        title: '鏡頭',
        body: '鏡頭沿緩慢的橢圓軌跡漂移，為每幅簽名作品中的三體之舞帶來電影般的視差。',
      },
      color: {
        title: '色彩',
        body: '色彩在 OKLab 感知色彩空間中混合，各天體色相相隔 120°，並由漂移與正弦波調製。',
      },
      'spectral-render': {
        title: '光譜渲染',
        body: '從 380 至 700 納米劃分 64 個波長區間，以隨速度變化的線寬和景深渲染軌跡。',
      },
      signature: {
        title: '簽名',
        body: 'AgX 色調映射、輝光、OpenSimplex 星雲層與色彩分級共同完成畫面。最終生成一張 16 位 PNG 與一段 30 秒 H.265 影片。',
      },
    },
    facts: {
      imprinted: { label: '已銘刻' },
      resolution: { label: '原生解像度' },
      animation: { label: '動畫', value: '30 秒 · 60 fps' },
      license: { label: '授權條款' },
    },
  },

  tracks: {
    eyebrow: '分配軌道',
    heading: '十餘條軌道，讓週期儲備循軌而行。',
    description:
      '週期收官後，協議會沿各條分配軌道發放 ETH 與 CST 儲備，以表彰堅守、時機、投入與參與。約一半 ETH 儲備會滾入下一週期。',
    ethLabel: '每個週期儲備中的 ETH',
    fixedLabel: '每個週期的 CST 與 NFT',
    fixedEach: `每位獲配者獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT。`,
    items: {
      'signature-allocation': {
        title: '簽名分配',
        body: '寫下收官之筆的參與者獲配。其中包括 1,000 CST 與 1 枚 Cosmic Signature NFT。',
      },
      'compounding-reserve': {
        percent: '約 50%',
        title: '滾動儲備',
        body: '儲備滾入下一演繹週期，繼續累積；協議不從中抽取任何部分。',
      },
      'chrono-warrior': {
        title: '時之勇士分配',
        body: `單次連續保持堅守冠軍身份時間最長的參與者獲配。其中包括 ${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      'public-goods': {
        title: '公共物品分配',
        body: '轉撥給 Protocol Guild——為 170 多位以太坊核心貢獻者提供資助的機制。',
      },
      'anchor-distribution': {
        title: '錨定派發',
        body: '按比例發放給本週期錨定至協議的所有 Cosmic Signature NFT。',
      },
      'eth-stellar-selection': {
        title: 'ETH 星選',
        body: '由程序化隨機選出的 3 位參與者均分；入選頻次隨落筆次數增加。',
      },
      'participant-nft-stellar-selection': {
        amount: '10 位獲配者',
        title: '參與者 NFT 星選',
        body: '從本週期的參與者中程序化隨機選出。',
      },
      'anchored-nft-stellar-selection': {
        amount: '10 位獲配者',
        title: '錨定 NFT 星選',
        body: '從 Random Walk NFT 錨定者中程序化隨機選出。',
      },
      'endurance-champion': {
        amount: '1 位獲配者',
        title: '堅守冠軍分配',
        body: '連續堅守時間最長的參與者。',
      },
      'final-cst-gesture': {
        amount: '1 位獲配者',
        title: 'CST 收官之筆分配',
        body: '本週期最後一次使用 CST 落筆的參與者。',
      },
    },
  },

  anchoring: {
    eyebrow: '錨定',
    heading: '將 Cosmic Signature NFT 錨定至協議。',
    body: `將 Cosmic Signature NFT 錨定至協議後，它每個週期都會按比例累積 ${protocolFacts.anchorDistributionPercentage}% 錨定派發中的份額，解錨時即可取回。可隨時解錨，但每枚 NFT 只可錨定一次。`,
    bullets: [
      '每個週期累積 ETH，解錨時取回',
      '沒有固定期限、沒有罰則；每枚 NFT 解錨後不可再錨定',
      '姊妹系列 Random Walk NFT 也可以錨定',
      `已錨定的 Random Walk NFT 可獲得錨定 NFT 星選資格：${protocolFacts.specialAllocationCst.toLocaleString('zh-HK')} CST 與 1 枚 Cosmic Signature NFT，不含 ETH`,
    ],
    ctaLabel: '前往應用程式錨定',
  },

  publicGoods: {
    eyebrow: '公共物品',
    heading: '每個週期的儲備，都有一部分流向以太坊核心貢獻者。',
    body: `每個演繹週期都會將 ETH 儲備中的固定份額轉撥給 Protocol Guild——為 170 多位以太坊核心貢獻者提供資助的集體機制。協議使用得越多，流向以太坊底層基礎設施的資源也越多。`,
    disclaimerHeading: '免責聲明',
    // lexicon-allow-start: 明確否認慈善捐贈及相關稅務定性。
    disclaimer:
      '這是向公共物品地址（目前為 Protocol Guild）轉撥 ETH，並非美國稅法意義上的慈善捐贈。Cosmic Signature 不對其稅務處理作任何陳述。',
    // lexicon-allow-end
    card: {
      label: '週期分配',
      description: '每個演繹週期都會將這部分儲備轉撥給 Protocol Guild。',
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
    columns: [
      {
        title: '協調提案',
        body: '獲委託權重不少於 100 CST 的地址均可提交提案。協調延遲為 2 天，協調期為 2 週。',
      },
      {
        title: '協調權重',
        body: '委託完成後，每單位 CST 對應一單位協調權重。支持、反對或棄權均透過密碼學簽名提交；CST 不代表股份，也不是股權工具。',
      },
      {
        title: '協調法定權重',
        body: '支持權重高於反對權重，且支持與棄權權重之和達到 CST 總供應量的 3%，提案即獲通過。反對權重不計入法定權重。',
      },
    ],
  },

  verifiability: {
    eyebrow: '可驗證性',
    heading: '開放、已驗證、可復現。',
    body: '任何人都能從種子重新生成簽名作品，並對照應用程式中公開的合約、源代碼與審計狀態自行核實。',
    pillars: [
      {
        title: 'CC0 1.0',
        body: 'Cosmic Signature 各儲存庫中的項目自有材料（合約、着色器與渲染管線）採用 CC0 1.0，不保留任何權利；第三方依賴、字體與素材仍適用各自的授權條款。',
      },
      {
        title: '驗證狀態',
        body: '應用程式提供公開合約地址、源代碼資源、驗證說明及審計與報告狀態，任何人都能查看已發佈內容。',
      },
      {
        title: '可復現藝術',
        body: '持續集成會校驗生成畫面的 SHA-256 哈希。同一種子，得到完全相同的輸出。',
      },
    ],
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
          '你可以落筆。每一筆都是使用 ETH 或 CST 發起的鏈上交易，會延長收官倒數、計入一次星選資格，還可能銘刻參與 CST，並共同塑造這一週期的簽名。你還可以將 Cosmic Signature NFT 錨定至協議，使其按比例參與錨定派發；持有至少 100 CST 時，也可以透過宇宙議會提交協調提案。',
      },
      {
        question: '這件藝術作品在技術上是什麼？',
        answer:
          '每枚 Cosmic Signature NFT 都由確定性三體模擬渲染而成，模擬遵循牛頓引力。鏈上種子從 100,000 條候選軌道中選出一條；這些軌道均由四階 Yoshida 辛積分器模擬，再透過 64 個波長區間進行光譜渲染，並以 OKLab 混合色彩。整套管線以 CC0 完全開源，任何人都能從種子復現簽名作品。',
      },
      {
        question: 'ETH 分配來自哪裏？',
        answer:
          '來自週期儲備；參與者落筆時，儲備隨之增加。週期收官後，約一半滾入下一週期的滾動儲備，其餘則按照鏈上參數，經由各條分配軌道發放，包括簽名分配、時之勇士、錨定派發、星選與公共物品。',
      },
      // lexicon-allow-start: 明確否認慈善捐贈及相關稅務定性。
      {
        question: '公共物品具體指什麼？',
        answer:
          '每個週期會將 ETH 儲備的 7% 轉撥至公共物品地址，目前為 Protocol Guild。Protocol Guild 是為 170 多位以太坊核心貢獻者提供資助的集體機制。這是向公共物品地址轉撥 ETH，並非美國稅法意義上的慈善捐贈；Cosmic Signature 不對其稅務處理作任何陳述。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明確否認彩票、賭場、賭博、莊家、荷官及賭注類別。
      {
        question: '這是彩票、賭場或賭博產品嗎？',
        answer:
          '不是。Cosmic Signature 是程序化鏈上藝術協議。參與者在演繹週期中落筆；週期收官後，協議將儲備分配至十餘條軌道。這裏沒有莊家，沒有荷官，也沒有賭注。分配所表彰的是堅守、時機與參與。唯一帶有隨機性的分配軌道——星選——是協議層面的程序化分配。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明確否認投資、利潤、股息及投資合同定性。
      {
        question: '這屬於投資嗎？',
        answer:
          '不是。CST 代幣用於表達協議內的參與和協調權重，不代表股權、利潤分成、股息或投資合同。團隊錢包不會從參與者的落筆中接收 ETH。Cosmic Signature 不對代幣價格或未來表現作任何陳述，也不以投資名義招攬參與。',
      },
      // lexicon-allow-end
      {
        question: '為什麼參與 CST 的數量會變化？',
        answer:
          '參與 CST 的銘刻量採用平方根公式，取決於距上一筆經過的時間。沉寂越久，CST 銘刻量越大；平方根會讓增幅逐漸放緩。落筆間隔極短時，可能銘刻 0 CST。提交前，應用程式會預覽目前數額。',
      },
      {
        question: 'ETH 與 CST 落筆會怎樣影響 CST 校準窗口？',
        answer: `CST 校準窗口保存在鏈上，每次落筆後都會變化。CST 落筆使窗口延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%，CST 落筆價格因而下降得更慢；ETH 落筆使窗口縮短約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，價格下降得更快。`,
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
    heading: '每個週期，都為作品集添上新作。',
    body: '關注即時週期、落筆參與，或瀏覽至今銘刻的每一幅簽名作品。',
  },

  footer: {
    tagline: 'Arbitrum 上的程序化鏈上藝術協議。',
    copyright: '© {year} Cosmic Signature。項目自有材料採用 CC0 1.0。',
    colophon: 'CC0 1.0 · 公開可驗證 · 可復現藝術',
    disambiguation:
      'Cosmic Signature 與 COSMIC 癌症突變數據庫及生物學中的 COSMIC 突變特徵沒有關聯。本項目是鏈上藝術協議及應用程式。',
  },
} satisfies LandingText;
