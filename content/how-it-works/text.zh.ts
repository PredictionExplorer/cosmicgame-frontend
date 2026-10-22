import { nftAllocationFacts } from '@/content/protocol-facts';
import { protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('zh');
const cst = numbers.specialAllocationCst;
const eth = numbers.count(numbers.ethRecipients);
const nft = numbers.count(numbers.nftRecipients);
const anchored = numbers.count(numbers.anchoredRecipients);

/** 中文运作原理文案，以 structure.ts 中的骨架为键。 */
export const howItWorksTextZh = {
  metadata: {
    title: 'Cosmic Signature 运作原理 · 演绎周期、落笔与 NFT',
    description:
      '了解 Cosmic Signature 演绎周期如何展开：从校准窗口到一次次落笔，再到收官后的分配发放。',
  },
  jsonLd: {
    name: 'Cosmic Signature 运作原理',
    description:
      '了解 Cosmic Signature 演绎周期如何展开：从校准窗口到一次次落笔，再到收官后的分配发放。',
  },
  breadcrumbs: {
    homeLabel: '首页',
    pageLabel: '运作原理',
  },
  hero: {
    heading: 'Cosmic Signature 运作原理',
    paragraph:
      '参与者在演绎周期中落笔，每一笔都在塑造本周期的签名；收官倒计时归零后，周期即可收官，储备将沿一组固定的分配轨道发放——签名分配、锚定派发与 Protocol Guild 都在其中。',
    primaryCtaLabel: '落笔',
    secondaryCtaLabel: '查看当前周期',
  },
  rewardBreakdown: {
    heading: '每一笔会铭刻什么',
    subhead: '每一笔都会参与本周期的多条分配轨道。',
    items: [
      {
        title: '动态参与 CST',
        description:
          '下一笔执行时，按间隔时长线性计算的参与 CST 会全额铭刻给上一笔参与者。首笔不发放，收官也不结算最后一笔之后的累计量。',
      },
      {
        title: '星选资格',
        description: `每笔按当时未减免、未含溢价的 ETH 基础价格增加权重，CST 落笔也一样。收官时 ${eth} 次加权选择均分 ${protocolFacts.stellarSelectionEthPercentage}% ETH。`,
      },
      {
        title: 'Cosmic Signature NFT 星选',
        description: `另按同一权重规则进行 ${nft} 次放回选择，每次分配 ${cst} CST 与 1 枚 NFT。同一地址可多次获配，累计权重不保证获配。`,
      },
      {
        title: '签名分配',
        description: `实际收官者获得 ${protocolFacts.mainEthPercentage}% ETH、合计 ${cst} CST 与 ${nftAllocationFacts.mainPrizeNftPhrase.zh}；收官之笔参与者享有专属收官窗口。`,
      },
    ],
  },
  costs: {
    heading: '落笔的花费',
    subhead: '以 ETH 或 CST 支付落笔之前，请先了解以下几点。',
    items: [
      {
        title: '花费不会退还',
        body: '落笔支付的 ETH 会计入周期储备，支付的 CST 会被销毁。之后有人再落笔，这些花费也不会退还。',
      },
      {
        title: 'ETH 价格逐笔上调',
        body: `每笔 ETH 落笔使下一笔不含溢价的基础价格上调 ${protocolFacts.ethGestureCostStepUpPercent}% 后取整，再加 1 wei。临近收官溢价单独计算，不抬高下一笔基础价格；最终报价可能随溢价窗口而变化。`,
      },
      {
        title: 'Gas 费另计',
        body: '每一笔落笔都是一笔 Arbitrum 交易，因此还需以 ETH 支付 Gas 费。确认前，钱包会显示具体金额。',
      },
    ],
    note: '请只动用你能够承受失去的资金落笔。',
    riskLinkLabel: '阅读风险披露',
  },
  gameCycle: {
    heading: '演绎周期的完整历程',
    subhead: '从开启到收官，每个周期都沿同一顺序展开。',
    legend: {
      gestures: '落笔',
      finalization: '收官',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} 小时窗口：仅写下收官之笔的参与者可收官`,
      allocations: '分配轨道',
    },
    phases: [
      {
        label: '周期开启',
        description:
          '达到启用时间后，周期等待首笔 ETH 落笔。ETH 开场基础价格在校准窗口中下降；首笔才启动收官倒计时与 CST 首个窗口。起始储备包括上一周期的留存。',
      },
      {
        label: '参与者落笔',
        description:
          '后续落笔把当前增量加到已存储的收官时间，即使它已过期；不会从现在重新计时。ETH 落笔尝试加快 CST 价格下降速率，CST 落笔减慢速率并重设窗口上限。',
      },
      {
        label: '收官倒计时归零',
        description: `倒计时归零后，写下收官之笔的参与者有 ${protocolFacts.finalGestureExclusivityHours} 小时的专属时间收官；此后任何人都可收官，收官者获得签名分配。收官执行之前仍可落笔，新的一笔会延长倒计时，并成为新的收官之笔。`,
      },
      {
        label: '周期收官',
        description: `收官交易成功后，实际收官者获得 ${protocolFacts.mainEthPercentage}% ETH、合计 ${cst} CST 与 ${protocolFacts.mainPrizeNftsPerCycle} 枚编号连续的 NFT；其他轨道按条件发放。`,
      },
      {
        label: '星选',
        description: `参与者 ETH 与 NFT 星选都以每笔当时的 ETH 基础价格加权，并允许重复选择。ETH 轨道选择 ${eth} 次，NFT 轨道选择 ${nft} 次。Random Walk NFT 锚定轨道另按已锚定 NFT 资格选择 ${anchored} 次；没有该类锚定时跳过。`,
      },
      {
        label: '下一周期',
        description: `通常约 ${protocolFacts.compoundingReservePercentage}% 储备留至下一周期，另有取整与条件转账影响。下一次启用按收官时的配置延迟安排，当前为 ${protocolFacts.currentNextCycleDelayDays} 天，可由所有者调整。`,
      },
    ],
  },
  payoff: {
    heading: '每个周期都以一幅签名收官',
    body: `收官时会铭刻各轨道的 NFT。签名分配包含 ${protocolFacts.mainPrizeNftsPerCycle} 枚编号连续的 NFT 和合计 ${cst} CST。收官之笔参与者享有 ${protocolFacts.finalGestureExclusivityHours} 小时专属窗口，之后任何人都可收官并取得该分配。`,
    linkLabel: '查看这幅签名',
  },
  stepByStep: {
    heading: '快速上手',
    subhead: '从连接钱包到落下第一笔，只需三步。',
    stepLabel: '第 {n} 步',
    steps: [
      {
        title: '连接钱包',
        highlights: [
          '点击页面右上角的连接按钮。',
          '使用支持 Arbitrum 的钱包，例如 MetaMask。Arbitrum 是以太坊的 Layer 2，Gas 费更低，交易更快。',
          '按提示将网络切换至 Arbitrum，并确认连接。',
          '连接完成后，钱包地址会显示在页面顶部。',
        ],
      },
      {
        title: '查看落笔价格',
        highlights: [
          '落笔前，先确认当前的 ETH 或 CST 落笔价格。',
          '核对参与 CST 的收取对象：V3 在你的下一笔执行时向上一笔参与者发放，而非保证立即向你铭刻。',
          '确保钱包中除落笔价格外，还留有少量 ETH 用作 Gas 费；确认前，钱包会显示具体金额。',
        ],
      },
      {
        title: '落下第一笔',
        highlights: [
          `选择 ETH 或 CST 落笔。ETH 落笔可附加一枚 Random Walk NFT，获得 ${protocolFacts.randomWalkDiscountPercentage}% 的 ETH 落笔价格减免，每枚 NFT 仅可使用一次。`,
          '点击写明方式与价格的落笔按钮（例如“以 ETH 落笔”），然后在钱包中确认交易。',
        ],
      },
    ],
    fundingText: '还没有 Arbitrum 上的 ETH？',
    fundingLinkLabel: '如何在 Arbitrum 上获取 ETH',
  },
  proTips: {
    heading: '值得了解',
    subhead: '几处容易忽略的细节。',
    tips: [
      {
        title: '两个校准窗口',
        body: 'CST 基础价格随时间下降。CST 落笔后，上限重设为不含溢价的基础花费两倍、配置下限及新下降速率乘以 180 秒三者中的最大值。临近收官溢价另计，并可能使最终价格上升。',
      },
      {
        title: '每枚 Random Walk NFT 仅可使用一次',
        body: `一枚 Random Walk NFT 可让一笔 ETH 落笔的价格减免 ${protocolFacts.randomWalkDiscountPercentage}%，用过后不能再次减免。使用与锚定互不影响。`,
      },
      {
        title: '使用专用钱包',
        body: '专用钱包可将协议操作与主要资产隔离。审计页面列出了已完成的审查与验证。',
      },
    ],
  },
  callToAction: {
    heading: '准备落下第一笔了吗？',
    body: '加入当前演绎周期。连接钱包，落下第一笔，共同塑造这一周期的签名。',
    primaryCtaLabel: '落笔',
    faqCtaLabel: '浏览常见问题',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X（Twitter）',
  },
} satisfies HowItWorksText;
