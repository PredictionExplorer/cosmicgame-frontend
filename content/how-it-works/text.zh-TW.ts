import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

/** 中文運作原理文案，以 structure.ts 中的骨架為鍵。 */
export const howItWorksTextZhTw = {
  metadata: {
    title: 'Cosmic Signature 運作原理 · 演繹週期、落筆與 NFT',
    description:
      '了解 Cosmic Signature 演繹週期如何展開：從校準窗口到一次次落筆，再到收官後的分配發放。',
  },
  jsonLd: {
    name: 'Cosmic Signature 運作原理',
    description:
      '了解 Cosmic Signature 演繹週期如何展開：從校準窗口到一次次落筆，再到收官後的分配發放。',
  },
  breadcrumbs: {
    homeLabel: '首頁',
    pageLabel: '運作原理',
  },
  hero: {
    badge: '程序化鏈上藝術協議',
    headingLead: 'Cosmic Signature',
    headingAccent: '運作原理',
    paragraph:
      '落筆，堅守，塑造簽名。參與者在演繹週期中落筆；收官倒數歸零後，週期即可收官，儲備將沿十餘條分配軌道發放——簽名分配、錨定配發與 Protocol Guild 都在其中。',
    primaryCtaLabel: '進入協議',
    secondaryCtaLabel: '了解更多',
  },
  overview: {
    heading: '運作原理',
    subhead: '三步參與，共同塑造週期儲備。',
    cards: [
      {
        title: '落筆',
        description:
          '使用 ETH 或 CST（ERC-20）落筆。每一筆都會延長收官倒數，計入一次星選資格，並繼續塑造這一週期的簽名。',
        tooltip: `落筆可使用 ETH 或 CST 代幣（ERC-20）。在 ETH 落筆時附加一枚 Random Walk NFT，可獲得一次性 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免。`,
      },
      {
        title: '堅守',
        description: '週期會持續推進，直至收官倒數歸零；每有新落筆，倒數都會按目前時間增量延長。',
        tooltip:
          '時間增量最初約為 1 小時，並隨週期緩慢增長。CST 落筆價格採用動態校準窗口，ETH 與 CST 落筆會使窗口朝相反方向變化。',
      },
      {
        title: '獲配',
        description: '週期收官後，協議會按規則發放簽名分配、星選分配與錨定配發等。',
        tooltip: `寫下收官之筆的參與者會獲得週期儲備的 ${protocolFacts.mainEthPercentage}%、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。星選獲配者、錨定者及其他參與者也會獲得相應分配。`,
      },
    ],
  },
  rewardBreakdown: {
    heading: '每一筆會銘刻什麼',
    subhead: '每個週期，參與都會在多條分配軌道留下銘刻。',
    items: [
      {
        title: '動態參與 CST',
        description: '每一筆都可能銘刻 CST，數量取決於距上一筆經過的時間。',
        tooltip: `參與 CST 採用平方根公式：${protocolFacts.dynamicCstRewardFormula}。連續快速落筆可能銘刻 0 CST；沉寂越久，銘刻量越大。`,
      },
      {
        title: '星選資格',
        description: '每一筆都會計入一次星選資格，參與週期收官時的分配。',
        tooltip: `週期收官後，協議會從星選資格中程序化隨機選出獲配者：3 位參與者均分週期儲備中 ${protocolFacts.stellarSelectionEthPercentage}% 的 ETH。`,
      },
      {
        title: 'Cosmic Signature NFT 星選',
        description: `每個週期，都有 10 位參與者經星選獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚獨一無二的 Cosmic Signature NFT。`,
        tooltip: `每個週期，10 位星選獲配者與 10 位 Random Walk NFT 錨定者，每位都會獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      {
        title: '簽名分配',
        description: `寫下收官之筆的參與者，可取回週期儲備中 ${protocolFacts.mainEthPercentage}% 的 ETH、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
        tooltip: '週期儲備隨每一筆增長。寫下收官之筆的參與者透過協議合約取回簽名分配。',
      },
    ],
  },
  gameCycle: {
    heading: '演繹週期的完整歷程',
    subhead: '從開啟到收官，每個週期都沿同一順序展開。',
    phases: [
      {
        label: '週期開啟',
        description: `新的演繹週期由此開始。首個 ETH 校準窗口隨之開啟；CST 校準窗口從 ${protocolFacts.initialCstCalibrationWindowHours} 小時的基準出發，之後隨參與不斷變化。`,
        tooltip:
          '在校準窗口內，落筆價格會逐步回落，參與者可自行選擇落筆時機。週期儲備的起點，是上一週期滾入的滾動儲備。',
      },
      {
        label: '參與者落筆',
        description: `每一筆都會按目前時間增量延長收官倒數。參與 CST 動態變化；ETH 落筆會使 CST 校準窗口縮短約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，CST 落筆則使其延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。`,
        tooltip:
          '參與 CST 按平方根公式計算，取決於距上一筆經過的時間。確切數量以應用程式中的即時預覽為準。',
      },
      {
        label: '收官倒數歸零',
        description: '倒數歸零後，寫下收官之筆的參與者隨即取得收官資格。',
        tooltip: `收官真正執行前，仍可繼續落筆——遲來的一筆會再次延長倒數，併成為新的收官之筆。寫下收官之筆的參與者擁有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬收官窗口；窗口結束後，任何人都可收官並獲得簽名分配。`,
      },
      {
        label: '週期收官',
        description: `寫下收官之筆的參與者取回簽名分配：週期儲備的 ${protocolFacts.mainEthPercentage}%、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
        tooltip: '簽名分配經由協議合約取回；CST 與 Cosmic Signature NFT 會自動完成銘刻。',
      },
      {
        label: '星選',
        description: `3 位 ETH 星選獲配者均分週期儲備的 ${protocolFacts.stellarSelectionEthPercentage}%；參與者 NFT 星選與錨定 NFT 星選各選出 10 位獲配者，每位獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
        tooltip:
          '星選資格隨每一筆計入；落筆越多，入選頻次越高。Random Walk NFT 錨定者另有單獨的星選。',
      },
      {
        label: '下一週期',
        description: '約一半週期儲備會作為滾動儲備滾入下一週期，新週期則以全新的校準窗口開啟。',
        tooltip:
          '滾動儲備意味著協議滾動累積，而非抽取。目前窗口時長與落筆價格，以即時合約資料為準。',
      },
    ],
  },
  stepByStep: {
    heading: '快速上手',
    subhead: '從連接錢包到落下第一筆，只需三步。',
    stepLabel: '步驟',
    steps: [
      {
        title: '連接錢包',
        tooltip: 'Arbitrum 是以太坊上的 Layer 2 區塊鏈，Gas 費更低，交易更快。',
        highlights: [
          '點選頁面頂部的「連接錢包」按鈕。',
          '使用支援 Arbitrum 的錢包，例如 MetaMask。',
          '按提示將網路切換至 Arbitrum，並確認相關授權。',
          '連線完成後，錢包地址會顯示在頁面頂部。',
        ],
      },
      {
        title: '檢視落筆價格',
        tooltip: 'Arbitrum 上的 Gas 費通常只有幾美分，遠低於以太坊主網。',
        highlights: [
          '檢視週期收官時間——每一筆都會按目前時間增量將其延長。',
          '落筆前，先確認目前的 ETH 或 CST 落筆價格。',
          '檢視參與 CST 的即時預覽；數量會隨距上一筆的時間長短而變化。',
          '留意簽名分配金額，了解這一週期潛在的 ETH 分配。',
          '確保錢包中除落筆價格外，還留有少量 ETH 用作 Gas 費。',
        ],
      },
      {
        title: '落下第一筆',
        tooltip: `每枚 Random Walk NFT 僅可使用一次，用於 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免——不妨留到合適的時機。`,
        highlights: [
          `選擇 ETH 落筆，並可附加一枚 Random Walk NFT 獲得 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免；也可使用 CST（ERC-20）落筆。`,
          '點選「落筆」，然後在錢包中確認交易。',
          '這一筆會延長收官倒數，並更新 ETH 與 CST 的價格狀態。',
          '每一筆都會計入一次星選資格，還可能自動銘刻動態的參與 CST。',
        ],
      },
    ],
  },
  proTips: {
    heading: '進階技巧與策略',
    subhead: '實用建議，幫助你在各條分配軌道上更充分地參與。',
    tips: [
      {
        title: '同時關注兩個校準窗口',
        description: 'ETH 與 CST 落筆價格各有即時窗口；每一筆都會改變 CST 窗口。',
        tooltip:
          'ETH 落筆會略微縮短 CST 校準窗口，CST 落筆則會略微將其延長。目前價格走勢可在應用程式面板中即時檢視。',
      },
      {
        title: '附加 Random Walk NFT',
        description: `持有 Random Walk NFT，可獲得一次性 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免。`,
        tooltip: '每枚 Random Walk NFT 僅可用於一次價格減免。留到落筆價格較高時使用，效果更佳。',
      },
      {
        title: '積累星選資格',
        description: '每一筆都會計入一次星選資格；落筆越多，入選頻次越高。',
        tooltip: `3 位 ETH 星選獲配者均分週期儲備的 ${protocolFacts.stellarSelectionEthPercentage}%；10 位參與者 NFT 獲配者與 10 位 Random Walk NFT 錨定者，每位獲配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      {
        title: '使用專用錢包',
        description: '智慧合約的原始碼已在鏈上公開驗證；使用專用錢包參與，還能再添一層保障。',
        tooltip: '專用錢包將協議操作與主要資產隔離，安全性更高。審計與驗證狀態可在審計頁面檢視。',
      },
      {
        title: '留意收官倒數',
        description: '每一筆都會按目前時間增量延長鏈上紀錄的週期收官時間。',
        tooltip: '臨近歸零時落筆，你距離收官之筆最近；但在週期收官前，其他參與者仍可在你之後落筆。',
      },
      {
        title: '使用 CST 落筆',
        description: 'CST 也可用於落筆，價格由專屬的 CST 校準窗口決定。',
        tooltip: `CST 落筆同樣會計入一次星選資格、延長收官倒數，還可能銘刻動態的參與 CST，並使 CST 校準窗口延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。`,
      },
    ],
  },
  faqCallout: {
    heading: '還有疑問？',
    body: '關於週期機制、分配軌道、代幣，以及 Cosmic Signature 的方方面面，常見問題頁都有詳細解答。',
    ctaLabel: '瀏覽常見問題',
  },
  callToAction: {
    heading: '準備落下第一筆了嗎？',
    body: '加入目前演繹週期。連接錢包，落下第一筆，一起塑造這一週期的簽名。',
    primaryCtaLabel: '進入協議',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
