import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

/**
 * 基础层文案：协议的整体轮廓。术语与措辞对齐 content/white-paper/text.zh.ts 与
 * docs/i18n/glossary-zh.md；键为 structure.ts 中的骨架题目 id。
 */
export const basicQuestionsTextZh = {
  'what-is-cosmic-signature': {
    prompt: '朋友问你：Cosmic Signature 到底是什么？哪个回答是对的？',
    options: {
      a: '部署在 Arbitrum 上的程序化链上艺术协议，以一个个限时的演绎周期运转。',
      b: '一个把文字提示词变成太空图片的 AI 图像服务。',
      c: '生物学家使用的癌症突变特征数据库。',
      d: '一个预测 NFT 系列价格的服务。',
    },
    explanation:
      'Cosmic Signature 是程序化艺术协议：限时的演绎周期在一次次落笔中延展，收官时铭刻确定性的三体艺术作品。整条管线没有任何 AI 参与——作品是由种子驱动的物理计算，与文字提示词式的图像服务恰好相反。',
    funFact: 'COSMIC 也是一个癌症突变数据库的名称，两者没有关联。协议文档对此有明确说明。',
    referenceLabel: '学习：什么是 Cosmic Signature？',
  },
  'what-is-a-gesture': {
    prompt: '在协议术语中，“落笔”指什么？',
    options: {
      a: '一次携带 ETH 或 CST 的链上行为：延长周期倒计时，并计入一次星选资格。',
      b: '为社区请愿收集的链下签名。',
      c: '你亲手绘制、添加到作品上的一道笔触。',
      d: '在社区频道里发布的一条消息。',
    },
    explanation:
      '落笔推动演绎周期。每一笔都携带 ETH 或 CST，把周期收官时间向后推，在本周期星选池中计入一次资格，还可能铭刻参与 CST。没有任何东西需要亲手去画——作品在收官时由种子计算而来。',
    referenceLabel: '白皮书 §4 · 落笔',
  },
  'two-currencies': {
    prompt: '落笔可以使用哪些货币？',
    options: {
      a: 'ETH 或 CST——协议自己的 ERC-20 代币。',
      b: '只能用 ETH。',
      c: '只能用 CST。',
      d: '任何 ERC-20，包括稳定币。',
    },
    explanation:
      '入口恰好两条：ETH 落笔与 CST 落笔。其他 ERC-20 代币可以作为附加资产随落笔一同携带，但它们从不支付落笔本身——落笔价格只以 ETH 或 CST 结算。',
    referenceLabel: '白皮书 §4 · 落笔',
  },
  'countdown-extension': {
    prompt: '倒计时还很充裕时，Nova 落下一笔。这一笔对时钟做了什么？',
    options: {
      a: '把当前时间增量加到链上存储的周期收官时间上。',
      b: `把倒计时重置为全新的 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时。`,
      c: '缩短倒计时，把周期推向收官。',
      d: '什么也不做——只有 ETH 落笔才会影响时钟。',
    },
    explanation: `每一笔落笔，无论 ETH 还是 CST，都会把当前时间增量加到链上存储的收官时间上。时钟从不会被重置到某个固定窗口——${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时只是上线参数下开场落笔之后的初始倒计时。`,
    referenceLabel: '白皮书 §3.2 · 收官倒计时',
  },
  'final-gesture-role': {
    prompt: '倒计时刚刚归零。谁最先有资格收官？',
    options: {
      a: '最后落下那一笔的参与者——收官之笔。',
      b: '本周期落笔次数最多的参与者。',
      c: '协议所有者。',
      d: '本周期开场落笔的参与者。',
    },
    explanation:
      '周期收官时间一到，收官之笔参与者即可收官，且起初这项权利专属于他。落笔数量在这里毫无作用：一笔恰到好处、坚持到最后的落笔，胜过此前的一百笔。',
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'sleepy-beneficiary': {
    prompt: '倒计时两天前就已归零，收官之笔参与者却杳无音讯。你用自己的钱包调用收官。会发生什么？',
    options: {
      a: '周期完成收官，而你成为周期受益方——ETH 份额、CST 与 NFT 都归你。',
      b: '交易回滚；永远只有收官之笔参与者才能收官。',
      c: '周期完成收官，但一切仍归收官之笔参与者。',
      d: '在宇宙议会表决介入之前，什么也不会发生。',
    },
    explanation: `这项权利在 ${protocolFacts.finalGestureExclusivityHours} 小时内专属于收官之笔参与者。窗口过后进入公开收官：任何人都可收官，合约会把实际收官者视为周期受益方，该角色的一切随之归属。这条规则刻意不留情面——参与者消失协议照样前行，疏忽也有价格。`,
    funFact: '协议不为缺席者无限期停留。每一条截止时间，最终都会向第一位来者敞开。',
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'signature-allocation-share': {
    prompt: '收官时，签名分配占周期储备的多大份额？',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `签名分配为协议 ETH 余额的 ${protocolFacts.mainEthPercentage}%，余额在收官那一刻读取一次。${protocolFacts.compoundingReservePercentage}% 是根本不发放的那部分——它作为滚动储备滚入下一周期。`,
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'compounding-reserve': {
    prompt: '周期储备如何延续至下一个演绎周期？',
    options: {
      a: `每周期约 ${protocolFacts.compoundingReservePercentage}% 的储备从不发放——它滚入下一周期。`,
      b: '团队在周期之间补充储备。',
      c: '协议每周期都会铭刻新的 ETH。',
      d: '宇宙议会表决向储备注入新的 ETH。',
    },
    explanation:
      '五条 ETH 分配轨道合计约占储备的一半，其余会滚入下一周期。这不保证每个周期的储备都比上一周期更大；储备规模还取决于周期内新增的 ETH。',
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'art-engine': {
    prompt: '一幅 Cosmic Signature 作品究竟由什么生成？',
    options: {
      a: '一段对引力三体问题的确定性物理模拟，种子来自链上数据。',
      b: '一个在太空摄影上微调过的扩散模型。',
      c: '由艺术家逐幅绘制并上传。',
      d: '一个套用太空配色的随机像素生成器。',
    },
    explanation:
      '三个质量相近的天体在牛顿引力下互绕；种子决定初始条件，物理完成其余一切。任何阶段都没有生成式模型——没有训练数据，没有采样，也没有提示词。让每幅签名独一无二的是混沌，而非随机。',
    funFact: '三体问题没有一般解析解。初始条件的毫厘之差，会演成完全不同的舞步。',
    referenceLabel: '白皮书 §6 · 艺术',
  },
  'same-seed': {
    prompt: '复现编号 42 的 NFT 已发布作品，需要哪些条件？',
    options: {
      a: '配合对应的渲染器版本、配置和兼容工具链，可核对生成的作品。',
      b: '相似但带有少量随机差异的图像。',
      c: '不同硬件上会得到不同的图像。',
      d: '只有低分辨率预览；完整作品需要项目服务器。',
    },
    explanation:
      '仓库提供手动执行的参考图像检查。复现需固定种子、渲染器版本、配置与兼容工具链；当前持续集成并不比较生成帧的哈希。',
    referenceLabel: '白皮书 §6.2 · 可复现性与许可',
  },
  'cst-supply-origin': {
    prompt: 'CST 从哪里来？',
    options: {
      a: '供应量从零起步，仅由协议合约按既定机制铭刻。',
      b: '上线时为团队预留了一大笔份额。',
      c: '上线前免费发放给了早期钱包。',
      d: '任何人调用代币合约都能铭刻 CST。',
    },
    explanation:
      'CST 由协议按参与机制与固定分配铭刻。V3 的动态参与 CST 在下一笔执行时发给上一笔参与者；表彰 CST 和推广储备在收官时铭刻。用于落笔的 CST 会销毁，持有人及获授权的支出者也可销毁代币；供应量受代币表示范围限制。',
    referenceLabel: '白皮书 §7 · CST 代币',
  },
  'cst-on-spend': {
    prompt: 'Rio 花了一些 CST 落下一笔。这些 CST 去了哪里？',
    options: {
      a: '被销毁——永久移出供应量。',
      b: '进了团队的金库。',
      c: '汇入周期储备，收官时再次发放。',
      d: '周期收官时退还给 Rio。',
    },
    explanation:
      '每笔 CST 落笔支付的全部 CST 都会销毁，永久移出供应量，不会转入任何金库。供应量同时受各项铭刻机制影响，因此既取决于新铭刻的数量，也取决于落笔消耗的数量。',
    referenceLabel: '白皮书 §7.2 · 销毁与供应动态',
  },
  'public-goods-beneficiary': {
    prompt: `每个周期都将储备的 ${protocolFacts.publicGoodsPercentage}% 作为公共物品分配转拨出去。目前的受益方是谁？`,
    options: {
      a: 'Protocol Guild——170 余位以太坊核心贡献者的资助机制。',
      b: '协议团队的运营钱包。',
      c: 'Arbitrum 验证者。',
      d: '随机选出的一位 NFT 持有者。',
    },
    explanation:
      '收官时，公共物品份额先进入金库。任何人都可另发一笔交易，将金库余额转给当前受益方 Protocol Guild；金库所有者可更改受益方。失败转入可留在储备，不保证每次收官都完成最终转拨。',
    referenceLabel: '白皮书 §10 · 公共物品',
  },
  'anchoring-basic': {
    prompt: 'Mira 把她的 Cosmic Signature NFT 锚定至协议。锚定为她带来什么？',
    options: {
      a: `锚定期间，这枚 NFT 按比例累积每周期 ${protocolFacts.anchorDistributionPercentage}% 的锚定派发，累积的 ETH 在解锚时取回。`,
      b: '把 NFT 挂到市场上出售。',
      c: '把 NFT 转换成 CST。',
      d: '用新的种子重新渲染作品。',
    },
    explanation:
      '锚定是协议的长期对齐方式：已锚定的 Cosmic Signature NFT 按比例分摊锚定派发，累积的 ETH 在解锚时取回。NFT 本身丝毫不变——种子与作品是永久的。',
    referenceLabel: '白皮书 §8 · 锚定',
  },
  'anchor-once-ever': {
    prompt: 'Mira 解锚了一枚 NFT。下个月还能再锚定这枚 NFT 吗？',
    options: {
      a: '不能——每枚 NFT 一生仅可锚定一次，解锚是永久的。',
      b: '可以，等一段冷却期就行。',
      c: '可以，额外付费即可。',
      d: '可以，但仅限同一周期内。',
    },
    explanation:
      '一生一次的规则，用一个不可逆的抉择取代了常见的锁定时间表，也让已锚定的集合有了真实的退出成本。要不要继续锚定，是每个周期都可以重新掂量的活问题；要不要解锚，则是永久的决定。',
    referenceLabel: '白皮书 §8 · 锚定',
  },
  'random-walk-perk': {
    prompt: 'Sol 持有一枚 Random Walk NFT，并把它附加到一笔 ETH 落笔上。会发生什么？',
    options: {
      a: `这一笔的价格降低 ${protocolFacts.randomWalkDiscountPercentage}%；NFT 留在 Sol 的钱包里，只被标记为已使用——一生一次。`,
      b: 'NFT 被转移给协议，以换取降价。',
      c: '这一笔变成免费。',
      d: 'NFT 让这一笔铭刻的参与 CST 翻倍。',
    },
    explanation: `附加 Random Walk NFT 可使一笔 ETH 落笔的价格降低 ${protocolFacts.randomWalkDiscountPercentage}%。NFT 不会转移——合约只是将其标记为已使用。每枚 Random Walk NFT 在所有周期中仅可附加一次，降价因此成了一种消耗品。`,
    referenceLabel: '白皮书 §4.2 · 附加 Random Walk NFT',
  },
  'first-gesture-currency': {
    prompt: '新周期刚刚启用。哪种落笔可以为它开场？',
    options: {
      a: 'ETH 落笔——CST 落笔从第二笔起才可使用。',
      b: 'CST 落笔，因为 CST 是协议自己的代币。',
      c: '两种货币都可以开场。',
      d: '只有协议所有者能为周期开场。',
    },
    explanation:
      '每个周期的首笔落笔必须使用 ETH，价格由 ETH 校准窗口决定。周期一旦展开，CST 就提供第二条入口。没有任何特权账户负责开场——谁落下开场之笔，谁就开启了周期。',
    referenceLabel: '白皮书 §4.3 · CST 落笔',
  },
  'message-on-gesture': {
    prompt: '除了价值，一笔落笔还能携带什么？',
    options: {
      a: `一条最长 ${protocolFacts.gestureMessageMaxLength} 字节、记录在链上的消息，外加可附加的 ERC-20 代币或一枚 ERC-721 NFT。`,
      b: '什么都不能——落笔只是价值转移。',
      c: '一张存储在合约里的图片。',
      d: '不限长度的文字，存储在链下。',
    },
    explanation: `落笔可携带最长 ${protocolFacts.gestureMessageMaxLength} 字节的消息，与落笔一同记录在链上；也可附加代币或 NFT。附加资产由分配钱包托管，周期收官后受益方享有优先取回权。`,
    funFact: '每一条随落笔留下的消息都永久可读地留在 Arbitrum 上——一本穿行于周期之间的公开留言簿。',
    referenceLabel: '白皮书 §4.4 · 消息与附加资产',
  },
  'who-runs-cycles': {
    prompt: '每个周期的 ETH 如何发放，由谁决定？',
    options: {
      a: '由合约执行——已验证合约会在收官时按协议规则分配。',
      b: '团队逐周期审核并签署发放。',
      c: '由一个预言机服务计算分配。',
      d: '由应用的后端服务器发出转账。',
    },
    explanation:
      '机械化发放是协议的三项根本性质之一：参与者与发放规则之间没有任何自由裁量的账户，也没有团队钱包从落笔中收取 ETH。应用与服务器只是把合约已经完成的事情展示出来。',
    referenceLabel: '白皮书 §1 · 引言',
  },
  'nft-count-typical': {
    prompt: '典型周期会铭刻多少枚 Cosmic Signature NFT？',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle} 枚`,
      b: '1 枚',
      c: `${protocolFacts.nftStellarSelectionRecipients} 枚`,
      d: '100 枚',
    },
    explanation: `全部轨道存在时，共 ${protocolFacts.typicalNftsPerCycle} 枚 NFT：签名分配 ${protocolFacts.mainPrizeNftsPerCycle} 枚，其余角色各一枚，另有参与者与 Random Walk NFT 锚定星选。签名分配的 CST 仅发放一次，不按其中的 NFT 枚数重复计算；缺少相关参与或锚定时，条件轨道会跳过。`,
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'chrono-endurance-exist': {
    prompt: '坚守冠军与时之勇士这两条轨道衡量的是什么？',
    options: {
      a: '时间维度上的坚持——而非谁落得最后或落得最多。',
      b: '本周期谁花的 ETH 最多。',
      c: '谁的落笔次数最多。',
      d: '周期开启时谁落笔最早。',
    },
    explanation:
      '两条轨道衡量的都是坚持，而非位置：坚守冠军以最近落笔者身份坚守了最长的连续间隔，时之勇士则是连续在位坚守冠军最久的人。花得多、落得多，都不直接决定这两个头衔。',
    referenceLabel: '白皮书 §5.2 · 坚守冠军与时之勇士',
  },
  'stellar-selection-what': {
    prompt: '星选是什么？',
    options: {
      a: '周期中记录的加权参与资格，用于收官时的分配选择。',
      b: '按活跃度排名参与者的榜单。',
      c: '赋予 NFT 作品的稀有度等级。',
      d: '为作品中的星座命名的方案。',
    },
    explanation:
      '参与者 ETH 与 NFT 星选都按每笔当时未减免、未含溢价的 ETH 基础价格加权。CST 落笔也使用同一时刻的 ETH 基础价格；可以重复获配，但不保证任何地址获配。',
    referenceLabel: '白皮书 §5.3 · 星选',
  },
  'ecosystem-optionality': {
    prompt: '应用、市场与预测场所同时下线一天。你还能做什么？',
    options: {
      a: '一切照旧——每项机制都可以直接调用合约完成。',
      b: '什么也做不了，只能等应用恢复。',
      c: '只能取回分配，不能落笔。',
      d: '只能用 CST 落笔，不能用 ETH。',
    },
    explanation:
      '合约之外的生态——应用、Axiom Zero、Uniswap 流动性、Chaos Zero——是便利，不是依赖。它们都不是必需的：落笔、收官、锚定与取回，都可以直接调用已验证的合约完成。',
    referenceLabel: '白皮书 §2 · 协议概览',
  },
  'what-it-is-not': {
    prompt: '关于协议的本质，哪种说法与白皮书一致？',
    options: {
      a: '参与不保证获得分配、资产价值、流动性，或未来移除所有者权限。',
      b: '取得 CST 是一条凭他人努力获取金钱的可靠途径。',
      c: '有一个运营方从每个周期中留下一定比例。',
      d: '协议承诺 NFT 的价值会随时间上涨。',
    },
    explanation:
      '当前 ETH 分配没有单列团队份额。推广储备的 CST 由任命的托管人发放；团队关联地址仍可按同样规则参与。没有单列 ETH 份额不代表没有管理权限，也不保证任何财务结果。',
    referenceLabel: '白皮书 §14.1 · Cosmic Signature 不是什么',
  },
  'where-recorded': {
    prompt: '落笔、种子与周期历史究竟存放在哪里？',
    options: {
      a: '在链上——Arbitrum One，一条以太坊 Layer 2 网络。',
      b: '在项目的私有数据库里。',
      c: '只在团队维护的 IPFS 文件里。',
      d: '不作记录，只保留汇总数据。',
    },
    explanation:
      '协议运行在 Arbitrum One 上，重要记录——每一笔落笔、每一个种子、每一份分配——都在链上。正因如此，作品可复现、发放可审计，任何人都无需信任任何服务器。',
    referenceLabel: '学习：Cosmic Signature 与 Arbitrum',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
