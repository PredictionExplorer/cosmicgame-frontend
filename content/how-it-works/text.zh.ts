import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('zh-CN');

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
      '落笔，坚守，塑造签名。参与者在演绎周期中落笔；收官倒计时归零后，周期即可收官，储备将沿十余条分配轨道发放——签名分配、锚定派发与 Protocol Guild 都在其中。',
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
          '每一笔都可能铭刻 CST，数量按距上一笔经过时间的平方根计算：紧随上一笔的落笔可能铭刻 0 CST，沉寂越久，铭刻越多。',
      },
      {
        title: '星选资格',
        description: `每一笔都会计入一次星选资格。周期收官时，协议从中随机选出 3 个资格，均分周期储备中 ${protocolFacts.stellarSelectionEthPercentage}% 的 ETH。`,
      },
      {
        title: 'Cosmic Signature NFT 星选',
        description: `另有 10 个资格被选出，每个获配 ${cst} CST 与 1 枚 Cosmic Signature NFT。同一地址可能多次入选；资格再多，也不保证入选。`,
      },
      {
        title: '签名分配',
        description: `写下收官之笔的参与者可收官本周期，并取回周期储备中 ${protocolFacts.mainEthPercentage}% 的 ETH、${cst} CST 与 1 枚 Cosmic Signature NFT。`,
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
        body: `每一笔 ETH 落笔都会让下一笔 ETH 落笔价格上调 ${protocolFacts.ethGestureCostStepUpPercent}%。只有每个周期开启时的 ETH 校准窗口会让价格回落。`,
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
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} 小时窗口：仅写下收官之笔的参与者可收官`,
      allocations: '分配轨道',
    },
    phases: [
      {
        label: '周期开启',
        description: `新的演绎周期开启。ETH 与 CST 落笔价格各自在校准窗口中回落；CST 校准窗口从 ${protocolFacts.initialCstCalibrationWindowHours} 小时的基准出发，之后随参与变化。周期储备的起点，是上一周期滚入的部分。`,
      },
      {
        label: '参与者落笔',
        description: `每一笔都会按当前时间增量延长收官倒计时。ETH 落笔会使 CST 校准窗口缩短约 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，CST 落笔则使其延长约 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。`,
      },
      {
        label: '收官倒计时归零',
        description: `倒计时归零后，写下收官之笔的参与者有 ${protocolFacts.finalGestureExclusivityHours} 小时的专属时间收官；此后任何人都可收官，收官者获得签名分配。收官执行之前仍可落笔，新的一笔会延长倒计时，并成为新的收官之笔。`,
      },
      {
        label: '周期收官',
        description: `收官后，各项分配随即发放。收官者获得签名分配：周期储备的 ${protocolFacts.mainEthPercentage}%、${cst} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      {
        label: '星选',
        description: `3 位 ETH 星选获配者均分周期储备的 ${protocolFacts.stellarSelectionEthPercentage}%。参与者 NFT 星选选出 10 位获配者，锚定 NFT 星选再从已锚定的 Random Walk NFT 中选出 10 位，每位获配 ${cst} CST 与 1 枚 Cosmic Signature NFT。星选资格随每一笔计入；每次星选都从本周期的全部落笔中选取，同一笔落笔可再次获选。`,
      },
      {
        label: '下一周期',
        description: `其余 ${protocolFacts.compoundingReservePercentage}% 的周期储备作为滚动储备滚入下一周期，新周期以全新的校准窗口开启。`,
      },
    ],
  },
  payoff: {
    heading: '每个周期都以一幅签名收官',
    body: '每一次落笔都在塑造本周期的作品。周期收官时，这幅签名会铭刻为 Cosmic Signature NFT，随签名分配交给完成收官之笔的参与者。',
    caption: '第 {cycle} 个周期的签名',
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
          '查看参与 CST 的实时预览；数量会随距上一笔的时间长短而变化。',
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
        body: `ETH 落笔价格只在每个周期开启时的校准窗口中回落一次。CST 落笔价格则在每一笔 CST 落笔后开启新的窗口：从刚支付价格的两倍（至少 ${protocolFacts.cstCalibrationCeilingMinCst} CST）逐步降至零。`,
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
