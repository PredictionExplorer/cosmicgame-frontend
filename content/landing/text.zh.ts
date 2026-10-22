import { nftAllocationFacts } from '@/content/protocol-facts';
import { ethDistributionFacts, protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/**
 * 中文着陆页文案，以 structure.ts 中的骨架为键。标题中的 \u200B 标出可换行的短语边界
 * （lib/phrases.ts），不会显示。
 */
export const landingTextZh = {
  meta: {
    title: 'Cosmic Signature · Arbitrum 上的程序化链上艺术协议',
    description: `Cosmic Signature 是运行于 Arbitrum 的程序化链上艺术协议。参与者在每个演绎周期中落笔；周期收官后，新的签名作品随之铭刻，周期储备按规则分配至各条轨道，其中 ${ethDistributionFacts.publicGoodsPercentage}% 分配至公共物品金库。`,
    keywords: [
      'Cosmic Signature',
      '程序化艺术协议',
      '链上艺术',
      'Arbitrum',
      '三体问题',
      '生成艺术',
      '公共物品',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: '程序化链上艺术协议 · Arbitrum',
    headlineLead: '每一次落笔，',
    headlineAccent: '都在塑造\u200B艺术。',
    subhead: `每一次落笔以 ETH 或 CST 完成，都会延长周期的收官倒计时。倒计时归零即可收官：为获配者铭刻新的签名作品，并将周期储备分配到各条轨道，其中 ${ethDistributionFacts.publicGoodsPercentage}% 分配至公共物品金库。`,
    secondaryCtaLabel: '了解周期如何运作',
    art: {
      viewAriaLabel: '在应用中查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature {tokenLabel} —— 确定性三体生成艺术作品',
      galleryCta: '浏览完整画廊',
    },
  },

  cycle: {
    eyebrow: '周期',
    heading: '从开启到收官，读懂完整的\u200B演绎周期。',
    steps: {
      gesture: {
        title: '落笔',
        body: 'ETH 或 CST 均可参与。每一笔都记录在链上，并计入本周期的星选资格。',
      },
      extend: {
        title: '延长倒计时',
        body: '每一笔都会延长收官倒计时；只要有人持续参与，周期就会延续。',
      },
      finalize: {
        title: '收官与分配',
        body: '倒计时归零后即可收官：新的签名作品随之铭刻，周期储备沿下方各条轨道分配。',
      },
    },
    gestureCtaLabel: '落笔',
    guideCtaLabel: '分步了解运作原理',
  },

  art: {
    eyebrow: '艺术',
    heading: '三体轨迹，由链上种子\u200B生成。',
    description:
      '每枚 Cosmic Signature NFT 都呈现牛顿引力下的三体运动。种子记录在链上，图像与视频在链下渲染。使用对应的渲染器版本、配置与兼容工具链，才能核对复现结果。',
    showcase: {
      viewAriaLabel: '查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature 作品 {tokenLabel}',
    },
    stageLabel: '阶段',
    stages: {
      seed: {
        title: '种子',
        body: '从链上数据——区块信息与 ArbSys 预编译——派生出 32 字节哈希，再送入 SHA3-256 RNG。',
      },
      simulation: {
        title: '模拟',
        body: '十万组候选构型分别通过四阶 Yoshida 辛积分器演算，每组推进 1,000,000 个物理步。',
      },
      selection: {
        title: '筛选',
        body: 'Borda 排序综合混沌度与等边性形成候选短名单，再通过图像层面的审美检查筛选。',
      },
      camera: {
        title: '镜头',
        body: '镜头沿缓慢的椭圆轨迹漂移，为每幅签名作品中的三体之舞带来电影般的视差。',
      },
      color: {
        title: '色彩',
        body: '连续的 OKLCh 感知调色方案改变色相与其他色彩属性，不将三个天体固定为等间隔色相。',
      },
      'spectral-render': {
        title: '光谱渲染',
        body: '从 380 至 700 纳米划分 64 个波长区间，以随速度变化的线宽和景深渲染轨迹。',
      },
      signature: {
        title: '签名',
        body: '轨迹经过色调与辉光等后处理，生成静态图像和动画；最终外观与输出格式取决于渲染器版本及配置。',
      },
    },
    facts: {
      imprinted: { label: '已铭刻' },
      resolution: { label: '原生分辨率' },
      animation: { label: '动画', value: '30 秒 · 60 fps' },
      license: { label: '许可协议' },
    },
  },

  tracks: {
    eyebrow: '分配轨道',
    heading: '每一份周期储备，都按规则分配。',
    description:
      '收官时，合约按配置发放 ETH 份额，并铭刻固定 CST 与 NFT。通常约一半 ETH 储备留至下一周期，实际留存也受取整和条件转账影响。',
    ethLabel: '每个周期储备中的 ETH',
    fixedLabel: '每个周期的 CST 与 NFT',
    fixedEach: `每位获配者获配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT。`,
    recipients: { other: '{count}\u00a0位获配者' },
    items: {
      'signature-allocation': {
        title: '签名分配',
        body: `归实际收官者，通常是收官之笔参与者。包括合计 1,000 CST 与 ${nftAllocationFacts.mainPrizeNftPhrase.zh}；专属窗口过后，其他收官者也可成为受益方。`,
      },
      'compounding-reserve': {
        percent: '约 50%',
        title: '滚动储备',
        body: '未分配的 ETH 留作下一周期储备；取整与未转出份额可能增加留存，但不保证储备逐周期增长。',
      },
      'chrono-warrior': {
        title: '时之勇士分配',
        body: `单次连续保持坚守冠军身份时间最长的参与者获配。其中包括 ${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      'public-goods': {
        title: '公共物品分配',
        body: '先转入公共物品金库，再由另一次交易转给当前受益方 Protocol Guild。',
      },
      'anchor-distribution': {
        title: '锚定派发',
        body: '按比例发放给本周期锚定至协议的所有 Cosmic Signature NFT。',
      },
      'eth-stellar-selection': {
        title: 'ETH 星选',
        body: `由 ${protocolFacts.ethStellarSelectionRecipients} 次加权选择均分。权重取每笔发生时未减免、未含溢价的 ETH 基础价格，允许重复获配。`,
      },
      'participant-nft-stellar-selection': {
        title: '参与者 NFT 星选',
        body: '与参与者 ETH 星选使用相同权重规则，按每笔的 ETH 基础价格加权选择。',
      },
      'anchored-nft-stellar-selection': {
        title: '锚定 NFT 星选',
        body: '从 Random Walk NFT 锚定者中程序化随机选出。',
      },
      'endurance-champion': {
        title: '坚守冠军分配',
        body: '连续坚守时间最长的参与者。',
      },
      'final-cst-gesture': {
        title: 'CST 收官之笔分配',
        body: '本周期最后一次使用 CST 落笔的参与者。',
      },
    },
  },

  anchoring: {
    eyebrow: '锚定',
    heading: '将 Cosmic Signature NFT 锚定至协议。',
    body: `将 Cosmic Signature NFT 锚定至协议后，它每个周期都会按比例累积 ${ethDistributionFacts.anchorDistributionPercentage}% 锚定派发中的份额，解锚时即可取回。可随时解锚，但每枚 NFT 仅可锚定一次。`,
    bullets: [
      '每个周期累积 ETH，解锚时取回',
      '无固定期限、无罚则；每枚 NFT 解锚后不可再锚定',
      '姊妹系列 Random Walk NFT 也可以锚定',
      `已锚定的 Random Walk NFT 可获得锚定 NFT 星选资格：${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT，不含 ETH`,
    ],
    ctaLabel: '前往应用锚定',
  },

  publicGoods: {
    eyebrow: '公共物品',
    heading: '每个周期的储备，都有一部分\u200B流向\u200B以太坊\u200B核心贡献者。',
    body: '收官时，协议尝试将固定 ETH 份额转入公共物品金库。任何人都可另发一笔交易，将金库余额转给目前的受益方 Protocol Guild，支持以太坊核心贡献者。金库所有者可更改受益方。',
    disclaimerHeading: '免责声明',
    // lexicon-allow-start: 明确否认慈善捐赠及相关税务定性。
    disclaimer:
      '这是向公共物品地址（目前为 Protocol Guild）转拨 ETH，并非美国税法意义上的慈善捐赠。Cosmic Signature 不对其税务处理作任何陈述。',
    // lexicon-allow-end
    card: {
      label: '周期分配',
      description: '收官时转入金库的份额，转给受益方需要另一次交易。',
      tableRows: {
        contributors: { label: 'Protocol Guild 贡献者' },
        enforcement: { label: '执行方式', value: '链上' },
        recipient: { label: '获配者' },
      },
    },
    ctaLabel: '了解 Protocol Guild',
  },

  council: {
    eyebrow: '宇宙议会',
    heading: '协议协调，尽在链上。',
    body: 'CST 持有者在链上协调协议事务：委托权重、提交协调提案，并表示支持或反对。',
    columns: {
      proposal: {
        title: '协调提案',
        body: `获委托权重不少于 ${protocolFacts.councilProposalThresholdCst} CST 的地址均可提交提案。协调延迟为 ${protocolFacts.councilVotingDelayDays} 天，协调期为 ${protocolFacts.councilVotingPeriodWeeks} 周。`,
      },
      weight: {
        title: '协调权重',
        body: '委托完成后，每单位 CST 对应一单位协调权重。支持、反对或弃权均通过密码学签名提交；CST 不代表股份，也不是股权工具。',
      },
      quorum: {
        title: '协调法定权重',
        body: `支持权重高于反对权重，且支持与弃权权重之和达到 CST 总供应量的 ${protocolFacts.councilQuorumPercent}%，提案即获通过。反对权重不计入法定权重。`,
      },
    },
  },

  verifiability: {
    eyebrow: '可验证性',
    heading: '开放、已验证、可复现。',
    body: '可查阅链上种子、对应的渲染器版本、合约地址，以及公开的验证和审计状态。不同证据各有范围。',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Cosmic Signature 各代码仓库中的项目自有材料（合约、着色器与渲染管线）采用 CC0 1.0，不保留任何权利；第三方依赖、字体与素材仍适用各自的许可证。',
      },
      verification: {
        title: '验证状态',
        body: '应用提供公开合约地址、源代码资源、验证说明及审计与报告状态，任何人都能查看已发布内容。',
      },
      reproducible: {
        title: '可复现艺术',
        body: '仓库提供手动执行的参考图像检查。复现需固定种子、渲染器版本、配置与兼容工具链；当前持续集成并不比较生成帧的哈希。',
      },
    },
    evidenceLabel: '亲自查证',
  },

  faq: {
    eyebrow: '释疑',
    heading: '值得直面的问题。',
    moreLabel: '更多解答见常见问题',
    items: [
      {
        question: '参与者实际要做什么？',
        answer:
          'ETH 或 CST 落笔会记录加权星选资格并延长已存储的收官时间。下一笔执行时，上一笔参与者可能获得按间隔线性计算的参与 CST。也可锚定 Cosmic Signature NFT 参与锚定派发；提交宇宙议会提案需满足历史委托权重门槛。',
      },
      {
        question: '这件艺术作品在技术上是什么？',
        answer:
          '每枚 Cosmic Signature NFT 的种子与所有权记录保存在链上。图像和视频由链下开源渲染器生成，呈现牛顿引力下的三体运动。复现作品需要种子、对应渲染器版本、配置与兼容工具链；媒体文件并非全部存储在合约中。',
      },
      {
        question: 'ETH 分配来自哪里？',
        answer:
          '来自周期储备；参与者落笔时，储备随之增加。周期收官后，约一半滚入下一周期的滚动储备，其余则按照链上参数，经由各条分配轨道发放，包括签名分配、时之勇士、锚定派发、星选与公共物品。',
      },
      // lexicon-allow-start: 明确否认慈善捐赠及相关税务定性。
      {
        question: '公共物品具体指什么？',
        answer: `每个周期会将 ETH 储备的 ${ethDistributionFacts.publicGoodsPercentage}% 先分配至公共物品金库，再由另一次交易转给当前受益方 Protocol Guild。Protocol Guild 是为 170 多位以太坊核心贡献者提供资助的集体机制。这是向公共物品地址转拨 ETH，并非美国税法意义上的慈善捐赠；Cosmic Signature 不对其税务处理作任何陈述。`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明确否认彩票、赌场、赌博、庄家、荷官及赌注类别。
      {
        question: '这是彩票、赌场或赌博产品吗？',
        answer:
          '不是。Cosmic Signature 是程序化链上艺术协议。参与者在演绎周期中落笔；周期收官后，协议将储备按规则分配至各条分配轨道。这里没有庄家，没有荷官，也没有赌注。分配所表彰的是坚守、时机与参与。唯一带有随机性的分配轨道——星选——是协议层面的程序化分配。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明确否认投资、利润、股息及投资合同定性。
      {
        question: '这属于投资吗？',
        answer:
          '不是。CST 代币用于表达协议内的参与和协调权重，不代表股权、利润分成、股息或投资合同。当前 ETH 分配没有单列团队份额。Cosmic Signature 不对代币价格或未来表现作任何陈述，也不以投资名义招揽参与。',
      },
      // lexicon-allow-end
      {
        question: '为什么参与 CST 的数量会变化？',
        answer:
          'V3 按两笔之间的时长线性计算参与 CST，在下一笔执行时全额铭刻给上一笔参与者。首笔不发放这项 CST，收官也不结算最后一笔之后的累计量。原始时间增量下约每分钟 1 CST；实时数量以合约为准。',
      },
      {
        question: 'ETH 与 CST 落笔会怎样影响 CST 校准窗口？',
        answer:
          'V3 调整的是 CST 价格下降速率：ETH 落笔尝试加快速率，受最短窗口检查限制；CST 落笔减慢速率，并按不含溢价的基础花费、配置下限和最短窗口要求重设上限。窗口时长由当前上限与速率推算，不再按旧版固定百分比调整。',
      },
      {
        question: '我可以自由复用或改编吗？',
        answer:
          '可以。项目自有的合约、着色器、渲染器、营销页面与文档均采用 CC0 1.0，不保留任何权利。第三方依赖、字体与素材仍适用各自的许可证；详见 THIRD_PARTY_NOTICES.md。',
      },
    ],
  },
  closing: {
    eyebrow: '作品集',
    heading: '每个周期，都为作品集\u200B添上新作。',
    body: '关注实时周期、落笔参与，或浏览迄今铭刻的每一幅签名作品。',
  },
} satisfies LandingText;
