import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/** 中文着陆页文案，以 structure.ts 中的骨架为键。 */
export const landingTextZh = {
  meta: {
    title: 'Cosmic Signature · Arbitrum 上的程序化链上艺术协议',
    description: `Cosmic Signature 是运行于 Arbitrum 的程序化链上艺术协议。参与者在每个演绎周期中落笔；周期收官后，新的签名作品随之铭刻，周期储备按十余条轨道分配，其中 ${protocolFacts.publicGoodsPercentage}% 转拨给以太坊核心贡献者。`,
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
    headline: '每一次落笔， 都在塑造艺术。',
    headlineLead: '每一次落笔，',
    headlineAccent: '都在塑造艺术。',
    subhead: `使用 ETH 或 CST 落笔，延长周期的收官倒计时。倒计时归零后，完成收官即可铭刻新的签名作品并分配周期储备，其中 ${protocolFacts.publicGoodsPercentage}% 转拨给以太坊核心贡献者。`,
    primaryCtaLabel: '打开应用',
    secondaryCtaLabel: '了解周期如何运作',
    art: {
      viewAriaLabel: '在应用中查看 Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature {tokenLabel} —— 确定性三体生成艺术作品',
      galleryCta: '浏览完整画廊',
    },
  },

  cycle: {
    eyebrow: '周期',
    heading: '从开启到收官，读懂完整的演绎周期。',
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
    heading: '三体轨迹，由链上种子生成。',
    description:
      '每枚 Cosmic Signature NFT 都呈现 3 个天体在牛顿引力下的运动轨迹。三体运动天生混沌。没有 AI，没有训练数据，只有确定性的物理。同一种子生成的画面逐像素一致。',
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
        body: '十万组候选构型分别通过四阶 Yoshida 辛积分器演算，每组推进 1,000,000 个物理步。',
      },
      selection: {
        title: '筛选',
        body: 'Borda 排序聚合会综合混沌度与等边性，从候选池中选出视觉张力最强的一条轨道。',
      },
      camera: {
        title: '镜头',
        body: '镜头沿缓慢的椭圆轨迹漂移，为每幅签名作品中的三体之舞带来电影般的视差。',
      },
      color: {
        title: '色彩',
        body: '色彩在 OKLab 感知色彩空间中混合，各天体色相相隔 120°，并由漂移与正弦波调制。',
      },
      'spectral-render': {
        title: '光谱渲染',
        body: '从 380 至 700 纳米划分 64 个波长区间，以随速度变化的线宽和景深渲染轨迹。',
      },
      signature: {
        title: '签名',
        body: 'AgX 色调映射、辉光、OpenSimplex 星云层与色彩分级共同完成画面。最终生成一张 16 位 PNG 与一段 30 秒 H.265 视频。',
      },
    },
    facts: {
      imprinted: { label: '已铭刻' },
      resolution: { label: '原生分辨率' },
      animation: { label: '动画', value: '30 秒 · 60 fps' },
      license: { label: '许可协议' },
    },
  },

  tracks: {
    eyebrow: '分配轨道',
    heading: '十余条轨道，让周期储备循轨而行。',
    description:
      '周期收官后，协议会沿各条分配轨道发放 ETH 与 CST 储备，以表彰坚守、时机、投入与参与。约一半 ETH 储备会滚入下一周期。',
    ethLabel: '每个周期储备中的 ETH',
    fixedLabel: '每个周期的 CST 与 NFT',
    items: {
      'signature-allocation': {
        title: '签名分配',
        body: '写下收官之笔的参与者获配。其中包括 1,000 CST 与 1 枚 Cosmic Signature NFT。',
      },
      'compounding-reserve': {
        percent: '约 50%',
        title: '滚动储备',
        body: '储备滚入下一演绎周期，继续累积；协议不从中抽取任何部分。',
      },
      'chrono-warrior': {
        title: '时之勇士分配',
        body: `单次连续保持坚守冠军身份时间最长的参与者获配。其中包括 ${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      'public-goods': {
        title: '公共物品分配',
        body: '转拨给 Protocol Guild——为 170 多位以太坊核心贡献者提供资助的机制。',
      },
      'anchor-distribution': {
        title: '锚定派发',
        body: '按比例发放给本周期锚定至协议的所有 Cosmic Signature NFT。',
      },
      'eth-stellar-selection': {
        title: 'ETH 星选',
        body: '由程序化随机选出的 3 位参与者均分；入选频次随落笔次数增加。',
      },
      'participant-nft-stellar-selection': {
        percent: '10 枚 NFT',
        title: '参与者 NFT 星选',
        body: `程序化随机选出 10 位参与者，每位获配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      'anchored-nft-stellar-selection': {
        percent: '10 枚 NFT',
        title: '锚定 NFT 星选',
        body: `程序化随机选出 10 位 Random Walk NFT 锚定者，每位获配 ${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      'endurance-champion': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST`,
        title: '坚守冠军分配',
        body: '连续坚守时间最长的参与者获配 1,000 表彰 CST 与 1 枚 Cosmic Signature NFT。',
      },
      'final-cst-gesture': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST`,
        title: 'CST 收官之笔分配',
        body: '本周期最后一次使用 CST 落笔的参与者获配 1,000 表彰 CST 与 1 枚 Cosmic Signature NFT。',
      },
    },
  },

  anchoring: {
    eyebrow: '锚定',
    heading: '将 Cosmic Signature NFT 锚定至协议。',
    body: `将 Cosmic Signature NFT 锚定至协议后，它每个周期都会按比例累积 ${protocolFacts.anchorDistributionPercentage}% 锚定派发中的份额，解锚时即可取回。可随时解锚，但每枚 NFT 仅可锚定一次。`,
    bullets: [
      '每个周期累积 ETH，解锚时取回',
      '无固定期限、无罚则；每枚 NFT 解锚后不可再锚定',
      '姊妹系列 Random Walk NFT 也可以锚定',
      `已锚定的 Random Walk NFT 可获得锚定 NFT 星选资格：${protocolFacts.specialAllocationCst.toLocaleString('zh-CN')} CST 与 1 枚 Cosmic Signature NFT，不含 ETH`,
    ],
    ctaLabel: '前往应用锚定',
  },

  publicGoods: {
    eyebrow: '公共物品',
    heading: `${protocolFacts.publicGoodsPercentage}% 的周期储备，流向以太坊核心贡献者。`,
    body: `每个演绎周期都会将 ETH 储备的 ${protocolFacts.publicGoodsPercentage}% 转拨给 Protocol Guild——为 170 多位以太坊核心贡献者提供资助的集体机制。协议使用得越多，流向以太坊底层基础设施的资源也越多。`,
    disclaimerHeading: '免责声明',
    // lexicon-allow-start: 明确否认慈善捐赠及相关税务定性。
    disclaimer:
      '这是向公共物品地址（目前为 Protocol Guild）转拨 ETH，并非美国税法意义上的慈善捐赠。Cosmic Signature 不对其税务处理作任何陈述。',
    // lexicon-allow-end
    card: {
      label: '周期分配',
      description: '每个演绎周期都会将这部分储备转拨给 Protocol Guild。',
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
    columns: [
      {
        title: '协调提案',
        body: '获委托权重不少于 100 CST 的地址均可提交提案。协调延迟为 2 天，协调期为 2 周。',
      },
      {
        title: '协调权重',
        body: '委托完成后，每单位 CST 对应一单位协调权重。支持、反对或弃权均通过密码学签名提交；CST 不代表股份，也不是股权工具。',
      },
      {
        title: '协调法定权重',
        body: '支持权重高于反对权重，且支持与弃权权重之和达到 CST 总供应量的 3%，提案即获通过。反对权重不计入法定权重。',
      },
    ],
  },

  verifiability: {
    eyebrow: '可验证性',
    heading: '开放、已验证、可复现。',
    body: '任何人都能从种子重新生成签名作品，独立完成验证。合约验证、静态分析说明和审计状态会随报告一同发布在应用中。Cosmic Signature 各代码仓库中的项目自有材料采用 CC0 1.0；第三方依赖、字体与素材仍适用各自的许可证。',
    pillars: [
      {
        title: 'CC0 1.0',
        body: '项目自有的合约、着色器与渲染管线采用 CC0 1.0，不保留任何权利；第三方材料不在此范围内。',
      },
      {
        title: '验证状态',
        body: '应用提供公开合约地址、源代码资源、验证说明及审计与报告状态，任何人都能查看已发布内容。',
      },
      {
        title: '可复现艺术',
        body: '持续集成会校验生成画面的 SHA-256 哈希。同一种子，得到完全相同的输出。',
      },
    ],
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
          '你可以落笔。每一笔都是使用 ETH 或 CST 发起的链上交易，会延长收官倒计时、计入一次星选资格，还可能铭刻参与 CST，并共同塑造这一周期的签名。你还可以将 Cosmic Signature NFT 锚定至协议，使其按比例参与锚定派发；持有至少 100 CST 时，也可以通过宇宙议会提交协调提案。',
      },
      {
        question: '这件艺术作品在技术上是什么？',
        answer:
          '每枚 Cosmic Signature NFT 都由确定性三体模拟渲染而成，模拟遵循牛顿引力。链上种子从 100,000 条候选轨道中选出一条；这些轨道均由四阶 Yoshida 辛积分器模拟，再通过 64 个波长区间进行光谱渲染，并以 OKLab 混合色彩。整套管线以 CC0 完全开源，任何人都能从种子复现签名作品。',
      },
      {
        question: 'ETH 分配来自哪里？',
        answer:
          '来自周期储备；参与者落笔时，储备随之增加。周期收官后，约一半滚入下一周期的滚动储备，其余则按照链上参数，经由各条分配轨道发放，包括签名分配、时之勇士、锚定派发、星选与公共物品。',
      },
      // lexicon-allow-start: 明确否认慈善捐赠及相关税务定性。
      {
        question: '公共物品具体指什么？',
        answer:
          '每个周期会将 ETH 储备的 7% 转拨至公共物品地址，目前为 Protocol Guild。Protocol Guild 是为 170 多位以太坊核心贡献者提供资助的集体机制。这是向公共物品地址转拨 ETH，并非美国税法意义上的慈善捐赠；Cosmic Signature 不对其税务处理作任何陈述。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明确否认彩票、赌场、赌博、庄家、荷官及赌注类别。
      {
        question: '这是彩票、赌场或赌博产品吗？',
        answer:
          '不是。Cosmic Signature 是程序化链上艺术协议。参与者在演绎周期中落笔；周期收官后，协议将储备分配至十余条轨道。这里没有庄家，没有荷官，也没有赌注。分配所表彰的是坚守、时机与参与。唯一带有随机性的分配轨道——星选——是协议层面的程序化分配。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: 明确否认投资、利润、股息及投资合同定性。
      {
        question: '这属于投资吗？',
        answer:
          '不是。CST 代币用于表达协议内的参与和协调权重，不代表股权、利润分成、股息或投资合同。团队钱包不会从参与者的落笔中接收 ETH。Cosmic Signature 不对代币价格或未来表现作任何陈述，也不以投资名义招揽参与。',
      },
      // lexicon-allow-end
      {
        question: '为什么参与 CST 的数量会变化？',
        answer:
          '参与 CST 的铭刻量采用平方根公式，取决于距上一笔经过的时间。沉寂越久，CST 铭刻量越大；平方根会让增幅逐渐放缓。落笔间隔极短时，可能铭刻 0 CST。提交前，应用会预览当前数额。',
      },
      {
        question: 'ETH 与 CST 落笔会怎样影响 CST 校准窗口？',
        answer: `CST 校准窗口保存在链上，每次落笔后都会变化。CST 落笔使窗口延长约 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%，CST 落笔价格因而下降得更慢；ETH 落笔使窗口缩短约 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，价格下降得更快。`,
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
    heading: '每个周期，都为作品集添上新作。',
    body: '关注实时周期、落笔参与，或浏览迄今铭刻的每一幅签名作品。',
  },

  footer: {
    tagline: 'Arbitrum 上的程序化链上艺术协议。',
    copyright: '© {year} Cosmic Signature。项目自有材料采用 CC0 1.0。',
    colophon: 'CC0 1.0 · 公开可验证 · 可复现艺术',
    disambiguation:
      'Cosmic Signature 与 COSMIC 癌症突变数据库及生物学中的 COSMIC 突变特征没有关联。本项目是链上艺术协议及应用。',
  },
} satisfies LandingText;
