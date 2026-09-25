import { protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('zh-HK');
const cst = numbers.specialAllocationCst;
const eth = numbers.count(numbers.ethRecipients);
const nft = numbers.count(numbers.nftRecipients);
const anchored = numbers.count(numbers.anchoredRecipients);

/** 繁體中文（香港）運作原理文案，以 structure.ts 中的骨架為鍵。 */
export const howItWorksTextZhHk = {
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
    homeLabel: '主頁',
    pageLabel: '運作原理',
  },
  hero: {
    heading: 'Cosmic Signature 運作原理',
    paragraph:
      '參與者在演繹週期中落筆，每一筆都在塑造本週期的簽名；收官倒數歸零後，週期即可收官，儲備將沿十餘條分配軌道發放——簽名分配、錨定派發與 Protocol Guild 都在其中。',
    primaryCtaLabel: '落筆',
    secondaryCtaLabel: '查看目前週期',
  },
  rewardBreakdown: {
    heading: '每一筆會銘刻什麼',
    subhead: '每一筆都會參與本週期的多條分配軌道。',
    items: [
      {
        title: '動態參與 CST',
        description:
          '每一筆都可能銘刻 CST，數量按距上一筆經過時間的平方根計算：緊接上一筆的落筆可能銘刻 0 CST，沉寂越久，銘刻越多。',
      },
      {
        title: '星選資格',
        description: `每一筆都會計入一次星選資格。週期收官時，協議從中隨機選出 ${eth} 個資格，均分週期儲備中 ${protocolFacts.stellarSelectionEthPercentage}% 的 ETH。`,
      },
      {
        title: 'Cosmic Signature NFT 星選',
        description: `另有 ${nft} 個資格被選出，每個獲配 ${cst} CST 與 1 枚 Cosmic Signature NFT。同一地址可能多次入選；資格再多，也不保證入選。`,
      },
      {
        title: '簽名分配',
        description: `寫下收官之筆的參與者可收官本週期，並取回週期儲備中 ${protocolFacts.mainEthPercentage}% 的 ETH、${cst} CST 與 1 枚 Cosmic Signature NFT。`,
      },
    ],
  },
  costs: {
    heading: '落筆的花費',
    subhead: '以 ETH 或 CST 支付落筆之前，請先了解以下幾點。',
    items: [
      {
        title: '花費不會退還',
        body: '落筆支付的 ETH 會計入週期儲備，支付的 CST 會被銷毀。之後有人再落筆，這些花費也不會退還。',
      },
      {
        title: 'ETH 價格逐筆上調',
        body: `每一筆 ETH 落筆都會讓下一筆 ETH 落筆價格上調 ${protocolFacts.ethGestureCostStepUpPercent}%。只有每個週期開啟時的 ETH 校準窗口會讓價格回落。`,
      },
      {
        title: 'Gas 費另計',
        body: '每一筆落筆都是一筆 Arbitrum 交易，因此還需以 ETH 支付 Gas 費。確認前，錢包會顯示具體金額。',
      },
    ],
    note: '請只動用你能夠承受失去的資金落筆。',
    riskLinkLabel: '閱讀風險披露',
  },
  gameCycle: {
    heading: '演繹週期的完整歷程',
    subhead: '從開啟到收官，每個週期都沿同一順序展開。',
    legend: {
      gestures: '落筆',
      finalization: '收官',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} 小時窗口：僅寫下收官之筆的參與者可收官`,
      allocations: '分配軌道',
    },
    phases: [
      {
        label: '週期開啟',
        description: `新的演繹週期開啟。ETH 與 CST 落筆價格各自在校準窗口中回落；CST 校準窗口從 ${protocolFacts.initialCstCalibrationWindowHours} 小時的基準出發，之後隨參與變化。週期儲備的起點，是上一週期滾入的部分。`,
      },
      {
        label: '參與者落筆',
        description: `每一筆都會按目前時間增量延長收官倒數。ETH 落筆會使 CST 校準窗口縮短約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，CST 落筆則使其延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。`,
      },
      {
        label: '收官倒數歸零',
        description: `倒數歸零後，寫下收官之筆的參與者有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬時間收官；此後任何人都可收官，收官者獲得簽名分配。收官執行之前仍可落筆，新的一筆會延長倒數，並成為新的收官之筆。`,
      },
      {
        label: '週期收官',
        description: `收官後，各項分配隨即發放。收官者獲得簽名分配：週期儲備的 ${protocolFacts.mainEthPercentage}%、${cst} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      {
        label: '星選',
        description: `${eth} 位 ETH 星選獲配者均分週期儲備的 ${protocolFacts.stellarSelectionEthPercentage}%。參與者 NFT 星選選出 ${nft} 位獲配者，錨定 NFT 星選再從已錨定的 Random Walk NFT 中選出 ${anchored} 位，每位獲配 ${cst} CST 與 1 枚 Cosmic Signature NFT。星選資格隨每一筆計入；ETH 星選與參與者 NFT 星選都從本週期的全部落筆中選取，同一筆落筆可再次獲選。`,
      },
      {
        label: '下一週期',
        description: `其餘 ${protocolFacts.compoundingReservePercentage}% 的週期儲備作為滾動儲備滾入下一週期，新週期以全新的校準窗口開啟。`,
      },
    ],
  },
  payoff: {
    heading: '每個週期都以一幅簽名收官',
    body: `每一次落筆都在塑造本週期的作品。週期收官時，這幅簽名會銘刻為 Cosmic Signature NFT，隨簽名分配交給收官者：倒數歸零後的 ${protocolFacts.finalGestureExclusivityHours} 小時內，只有寫下收官之筆的參與者可以收官，此後任何人都可收官。`,
    caption: '第 {cycle} 個週期的簽名',
    linkLabel: '查看這幅簽名',
  },
  stepByStep: {
    heading: '快速上手',
    subhead: '從連接錢包到落下第一筆，只需三步。',
    stepLabel: '第 {n} 步',
    steps: [
      {
        title: '連接錢包',
        highlights: [
          '點擊頁面右上角的連接按鈕。',
          '使用支援 Arbitrum 的錢包，例如 MetaMask。Arbitrum 是以太坊的 Layer 2，Gas 費更低，交易更快。',
          '按提示將網絡切換至 Arbitrum，並確認連接。',
          '連接完成後，錢包地址會顯示在頁面頂部。',
        ],
      },
      {
        title: '查看落筆價格',
        highlights: [
          '落筆前，先確認目前的 ETH 或 CST 落筆價格。',
          '查看參與 CST 的即時預覽；數量會隨距上一筆的時間長短而變化。',
          '確保錢包中除落筆價格外，還留有少量 ETH 用作 Gas 費；確認前，錢包會顯示具體金額。',
        ],
      },
      {
        title: '落下第一筆',
        highlights: [
          `選擇 ETH 或 CST 落筆。ETH 落筆可附加一枚 Random Walk NFT，獲得 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免，每枚 NFT 僅可使用一次。`,
          '點擊標明方式與價格的落筆按鈕（例如「以 ETH 落筆」），然後在錢包中確認交易。',
        ],
      },
    ],
    fundingText: '還沒有 Arbitrum 上的 ETH？',
    fundingLinkLabel: '如何在 Arbitrum 上取得 ETH',
  },
  proTips: {
    heading: '值得了解',
    subhead: '幾處容易忽略的細節。',
    tips: [
      {
        title: '兩個校準窗口',
        body: `ETH 落筆價格只在每個週期開啟時的校準窗口中回落一次。CST 落筆價格則在每一筆 CST 落筆後開啟新的窗口：從剛支付價格的兩倍（至少 ${protocolFacts.cstCalibrationCeilingMinCst} CST）逐步降至零。`,
      },
      {
        title: '每枚 Random Walk NFT 僅可使用一次',
        body: `一枚 Random Walk NFT 可讓一筆 ETH 落筆的價格減免 ${protocolFacts.randomWalkDiscountPercentage}%，用過後不能再次減免。使用與錨定互不影響。`,
      },
      {
        title: '使用專用錢包',
        body: '專用錢包可將協議操作與主要資產隔離。審計頁面列出了已完成的審查與驗證。',
      },
    ],
  },
  callToAction: {
    heading: '準備落下第一筆了嗎？',
    body: '加入目前演繹週期。連接錢包，落下第一筆，共同塑造這一週期的簽名。',
    primaryCtaLabel: '落筆',
    faqCtaLabel: '瀏覽常見問題',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X（Twitter）',
  },
} satisfies HowItWorksText;
