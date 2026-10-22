import { nftAllocationFacts } from '@/content/protocol-facts';
import { protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('zh-TW');
const cst = numbers.specialAllocationCst;
const eth = numbers.count(numbers.ethRecipients);
const nft = numbers.count(numbers.nftRecipients);
const anchored = numbers.count(numbers.anchoredRecipients);

/** 繁體中文（台灣）運作原理文案，以 structure.ts 中的骨架為鍵。 */
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
    heading: 'Cosmic Signature 運作原理',
    paragraph:
      '參與者在演繹週期中落筆，每一筆都在塑造本週期的簽名；收官倒數歸零後，週期即可收官，儲備將沿一組固定的分配軌道發放——簽名分配、錨定配發與 Protocol Guild 都在其中。',
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
          '下一筆執行時，依間隔時長線性計算的參與 CST 會全額銘刻給上一筆參與者。首筆不發放，收官也不結算最後一筆之後的累積量。',
      },
      {
        title: '星選資格',
        description: `每筆依當時未減免、未含溢價的 ETH 基礎價格增加權重，CST 落筆也相同。收官時 ${eth} 次加權選取均分 ${protocolFacts.stellarSelectionEthPercentage}% ETH。`,
      },
      {
        title: 'Cosmic Signature NFT 星選',
        description: `另依相同權重規則進行 ${nft} 次放回選取，每次分配 ${cst} CST 與 1 枚 NFT。同一地址可多次獲配，累積權重不保證獲配。`,
      },
      {
        title: '簽名分配',
        description: `實際收官者獲得 ${protocolFacts.mainEthPercentage}% ETH、合計 ${cst} CST 與 ${nftAllocationFacts.mainPrizeNftPhrase.zhHant}；收官之筆參與者享有專屬收官窗口。`,
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
        body: `每筆 ETH 落筆使下一筆不含溢價的基礎價格上調 ${protocolFacts.ethGestureCostStepUpPercent}% 後取整，再加 1 wei。臨近收官溢價另行計算，不提高下一筆基礎價格，最終報價可能隨溢價窗口變化。`,
      },
      {
        title: 'Gas 費另計',
        body: '每一筆落筆都是一筆 Arbitrum 交易，因此還需以 ETH 支付 Gas 費。確認前，錢包會顯示具體金額。',
      },
    ],
    note: '請只動用你能夠承受失去的資金落筆。',
    riskLinkLabel: '閱讀風險揭露',
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
        description:
          '到達啟用時間後，週期等待首筆 ETH 落筆。ETH 開場基礎價格在校準窗口下降；首筆才啟動收官倒數與首個 CST 窗口。起始儲備包含上一週期的留存。',
      },
      {
        label: '參與者落筆',
        description:
          '後續落筆會把目前增量加到已儲存的收官時間，即使時間已過，也不會從現在重新計時。ETH 落筆嘗試加快 CST 價格下降速率，CST 落筆減慢速率並重設窗口上限。',
      },
      {
        label: '收官倒數歸零',
        description: `倒數歸零後，寫下收官之筆的參與者有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬時間收官；此後任何人都可收官，收官者獲得簽名分配。收官執行之前仍可落筆，新的一筆會延長倒數，並成為新的收官之筆。`,
      },
      {
        label: '週期收官',
        description: `收官交易成功後，實際收官者獲得 ${protocolFacts.mainEthPercentage}% ETH、合計 ${cst} CST 與 ${protocolFacts.mainPrizeNftsPerCycle} 枚編號連續的 NFT；其他軌道依條件發放。`,
      },
      {
        label: '星選',
        description: `參與者 ETH 與 NFT 星選都依每筆當時的 ETH 基礎價格加權，並允許重複選取。ETH 軌道選取 ${eth} 次，NFT 軌道選取 ${nft} 次。Random Walk NFT 錨定軌道另按已錨定 NFT 資格選取 ${anchored} 次，沒有這類錨定時跳過。`,
      },
      {
        label: '下一週期',
        description: `通常約 ${protocolFacts.compoundingReservePercentage}% 儲備留至下一週期，另受取整與條件轉帳影響。下次啟用依收官時設定的延遲安排，目前為 ${protocolFacts.currentNextCycleDelayDays} 天，可由所有者調整。`,
      },
    ],
  },
  payoff: {
    heading: '每個週期都以一幅簽名收官',
    body: `收官時會銘刻各軌道的 NFT。簽名分配包含 ${protocolFacts.mainPrizeNftsPerCycle} 枚編號連續的 NFT 與合計 ${cst} CST。收官之筆參與者享有 ${protocolFacts.finalGestureExclusivityHours} 小時專屬窗口，之後任何人都能收官並取得這份分配。`,
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
          '點選頁面右上角的連接按鈕。',
          '使用支援 Arbitrum 的錢包，例如 MetaMask。Arbitrum 是以太坊的 Layer 2，Gas 費更低，交易更快。',
          '按提示將網路切換至 Arbitrum，並確認連線。',
          '連線完成後，錢包地址會顯示在頁面頂部。',
        ],
      },
      {
        title: '檢視落筆價格',
        highlights: [
          '落筆前，先確認目前的 ETH 或 CST 落筆價格。',
          '核對參與 CST 的收取對象：V3 在你的下一筆執行時向上一筆參與者發放，不保證當下向你銘刻。',
          '確保錢包中除落筆價格外，還留有少量 ETH 用作 Gas 費；確認前，錢包會顯示具體金額。',
        ],
      },
      {
        title: '落下第一筆',
        highlights: [
          `選擇 ETH 或 CST 落筆。ETH 落筆可附加一枚 Random Walk NFT，獲得 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落筆價格減免，每枚 NFT 僅可使用一次。`,
          '點選標明方式與價格的落筆按鈕（例如「以 ETH 落筆」），然後在錢包中確認交易。',
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
        body: 'CST 基礎價格隨時間下降。CST 落筆後，上限重設為不含溢價的基礎花費兩倍、設定下限及新下降速率乘以 180 秒三者最大值。臨近收官溢價另計，可能使最終價格上升。',
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
    body: '加入目前演繹週期。連接錢包，落下第一筆，一起塑造這一週期的簽名。',
    primaryCtaLabel: '落筆',
    faqCtaLabel: '瀏覽常見問題',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X（Twitter）',
  },
} satisfies HowItWorksText;
