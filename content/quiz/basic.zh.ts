import { protocolFacts } from '@/content/protocol-facts';

import type { QuizQuestion } from './types';

/**
 * 基础层：协议的整体轮廓。术语与措辞对齐 content/white-paper/zh.ts 与
 * docs/i18n/glossary-zh.md；题目 id、选项 id 与正确答案与英文版一一对应。
 */
export const basicQuestionsZh: readonly QuizQuestion[] = [
  {
    id: 'what-is-cosmic-signature',
    prompt: '朋友问你：Cosmic Signature 到底是什么？哪个回答是对的？',
    options: [
      {
        id: 'a',
        text: '部署在 Arbitrum 上的程序化链上艺术协议，以一个个限时的演绎周期运转。',
      },
      { id: 'b', text: '一个把文字提示词变成太空图片的 AI 图像服务。' },
      { id: 'c', text: '生物学家使用的癌症突变特征数据库。' },
      { id: 'd', text: '一个预测 NFT 系列价格的服务。' },
    ],
    correctOptionId: 'a',
    explanation:
      'Cosmic Signature 是程序化艺术协议：限时的演绎周期在一次次落笔中延展，收官时铭刻确定性的三体艺术作品。整条管线没有任何 AI 参与——作品是由种子驱动的物理计算，与文字提示词式的图像服务恰好相反。',
    funFact:
      '这个名字与知名的癌症突变数据库 COSMIC 撞了车。协议与它毫无关系——文档中专门写明了这一点。',
    reference: {
      label: '学习中心：什么是 Cosmic Signature？',
      href: '/learn/what-is-cosmic-signature',
    },
  },
  {
    id: 'what-is-a-gesture',
    prompt: '在协议术语中，"落笔"指什么？',
    options: [
      {
        id: 'a',
        text: '一次携带 ETH 或 CST 的链上行为：延长周期倒计时，并计入一次星选资格。',
      },
      { id: 'b', text: '为社区请愿收集的链下签名。' },
      { id: 'c', text: '你亲手绘制、添加到作品上的一道笔触。' },
      { id: 'd', text: '在社区频道里发布的一条消息。' },
    ],
    correctOptionId: 'a',
    explanation:
      '落笔是协议唯一的输入。每一笔都携带 ETH 或 CST，把周期收官时间向后推，在本周期星选池中计入一次资格，还可能铭刻参与 CST。没有任何东西需要亲手去画——作品在收官时由种子计算而来。',
    reference: { label: '白皮书 §4 · 落笔', href: '/white-paper#gestures' },
  },
  {
    id: 'two-currencies',
    prompt: '落笔可以使用哪些货币？',
    options: [
      { id: 'a', text: 'ETH 或 CST——协议自己的 ERC-20 代币。' },
      { id: 'b', text: '只能用 ETH。' },
      { id: 'c', text: '只能用 CST。' },
      { id: 'd', text: '任何 ERC-20，包括稳定币。' },
    ],
    correctOptionId: 'a',
    explanation:
      '入口恰好两条：ETH 落笔与 CST 落笔。其他 ERC-20 代币可以作为附加资产随落笔一同携带，但它们从不支付落笔本身——落笔价格只以 ETH 或 CST 结算。',
    reference: { label: '白皮书 §4 · 落笔', href: '/white-paper#gestures' },
  },
  {
    id: 'countdown-extension',
    prompt: '倒计时还很充裕时，Nova 落下一笔。这一笔对时钟做了什么？',
    options: [
      { id: 'a', text: '把当前时间增量加到链上存储的周期收官时间上。' },
      {
        id: 'b',
        text: `把倒计时重置为全新的 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时。`,
      },
      { id: 'c', text: '缩短倒计时，把周期推向收官。' },
      { id: 'd', text: '什么也不做——只有 ETH 落笔才会影响时钟。' },
    ],
    correctOptionId: 'a',
    explanation: `每一笔落笔，无论 ETH 还是 CST，都会把当前时间增量加到链上存储的收官时间上。时钟从不会被重置到某个固定窗口——${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时只是上线参数下开场落笔之后的初始倒计时。`,
    reference: { label: '白皮书 §3.2 · 收官倒计时', href: '/white-paper#countdown' },
  },
  {
    id: 'final-gesture-role',
    prompt: '倒计时刚刚归零。谁最先有资格收官？',
    options: [
      { id: 'a', text: '最后落下那一笔的参与者——收官之笔。' },
      { id: 'b', text: '本周期落笔次数最多的参与者。' },
      { id: 'c', text: '协议所有者。' },
      { id: 'd', text: '本周期开场落笔的参与者。' },
    ],
    correctOptionId: 'a',
    explanation:
      '周期收官时间一到，收官之笔参与者即可收官，且起初这项权利专属于他。落笔数量在这里毫无作用：一笔恰到好处、坚持到最后的落笔，胜过此前的一百笔。',
    reference: { label: '白皮书 §3.3 · 收官与公开收官窗口', href: '/white-paper#finalization' },
  },
  {
    id: 'sleepy-beneficiary',
    prompt: '倒计时两天前就已归零，收官之笔参与者却杳无音讯。你用自己的钱包调用收官。会发生什么？',
    options: [
      {
        id: 'a',
        text: '周期完成收官，而你成为周期受益方——ETH 份额、CST 与 NFT 都归你。',
      },
      { id: 'b', text: '交易回滚；永远只有收官之笔参与者才能收官。' },
      { id: 'c', text: '周期完成收官，但一切仍归收官之笔参与者。' },
      { id: 'd', text: '在宇宙议会表决介入之前，什么也不会发生。' },
    ],
    correctOptionId: 'a',
    explanation: `这项权利在 ${protocolFacts.finalGestureExclusivityHours} 小时内专属于收官之笔参与者。窗口过后进入公开收官：任何人都可收官，合约会把实际收官者视为周期受益方，该角色的一切随之归属。这条规则刻意不留情面——参与者消失协议照样前行，疏忽也有价格。`,
    funFact: '协议不为缺席者无限期停留。每一条截止时间，最终都会向第一位来者敞开。',
    reference: { label: '白皮书 §3.3 · 收官与公开收官窗口', href: '/white-paper#finalization' },
  },
  {
    id: 'signature-allocation-share',
    prompt: '收官时，签名分配占周期储备的多大份额？',
    options: [
      { id: 'a', text: `${protocolFacts.mainEthPercentage}%` },
      { id: 'b', text: `${protocolFacts.chronoWarriorEthPercentage}%` },
      { id: 'c', text: `${protocolFacts.compoundingReservePercentage}%` },
      { id: 'd', text: `${protocolFacts.publicGoodsPercentage}%` },
    ],
    correctOptionId: 'a',
    explanation: `签名分配为协议 ETH 余额的 ${protocolFacts.mainEthPercentage}%，余额在收官那一刻读取一次。${protocolFacts.compoundingReservePercentage}% 是根本不发放的那部分——它作为滚动储备滚入下一周期。`,
    reference: {
      label: '白皮书 §5.1 · 收官时的发放',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'compounding-reserve',
    prompt: '为什么每个演绎周期都以比上一周期更大的储备开场？',
    options: [
      {
        id: 'a',
        text: `每周期约 ${protocolFacts.compoundingReservePercentage}% 的储备从不发放——它滚入下一周期。`,
      },
      { id: 'b', text: '团队在周期之间补充储备。' },
      { id: 'c', text: '协议每周期都会铭刻新的 ETH。' },
      { id: 'd', text: '宇宙议会表决向储备注入新的 ETH。' },
    ],
    correctOptionId: 'a',
    explanation:
      '五条发放的 ETH 轨道合计正好一半，其余自动滚动累积。没有人补充任何东西，协议也无法凭空创造 ETH——增长纯粹是机械的。协议滚动累积，而非抽取。',
    reference: {
      label: '白皮书 §5.1 · 收官时的发放',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'art-engine',
    prompt: '一幅 Cosmic Signature 作品究竟由什么生成？',
    options: [
      {
        id: 'a',
        text: '一段对引力三体问题的确定性物理模拟，种子来自链上数据。',
      },
      { id: 'b', text: '一个在太空摄影上微调过的扩散模型。' },
      { id: 'c', text: '由艺术家逐幅绘制并上传。' },
      { id: 'd', text: '一个套用太空配色的随机像素生成器。' },
    ],
    correctOptionId: 'a',
    explanation:
      '三个质量相近的天体在牛顿引力下互绕；种子决定初始条件，物理完成其余一切。任何阶段都没有生成式模型——没有训练数据，没有采样，也没有提示词。让每幅签名独一无二的是混沌，而非随机。',
    funFact: '三体问题没有一般解析解。初始条件的毫厘之差，会演成完全不同的舞步。',
    reference: { label: '白皮书 §6 · 艺术', href: '/white-paper#the-art' },
  },
  {
    id: 'same-seed',
    prompt: '你用编号 42 的 NFT 在链上存储的种子，重跑一遍开源渲染管线。会得到什么？',
    options: [
      { id: 'a', text: '在任何机器上都逐像素一致的同一幅图像。' },
      { id: 'b', text: '相似但带有少量随机差异的图像。' },
      { id: 'c', text: '不同硬件上会得到不同的图像。' },
      { id: 'd', text: '只有低分辨率预览；完整作品需要项目服务器。' },
    ],
    correctOptionId: 'a',
    explanation:
      '确定性靠机制保证，而非口头承诺：同一种子在任何机器上都产出逐比特一致的图像。生成帧的 SHA-256 哈希在持续集成中逐一断言，输出一旦漂移，构建立即失败。',
    reference: {
      label: '白皮书 §6.2 · 可复现性与许可',
      href: '/white-paper#reproducibility-and-license',
    },
  },
  {
    id: 'cst-supply-origin',
    prompt: 'CST 从哪里来？',
    options: [
      {
        id: 'a',
        text: '供应量从零起步，只有协议合约能铭刻它——流通中的每一枚 CST 都能追溯到某个周期里的一次参与。',
      },
      { id: 'b', text: '上线时为团队预留了一大笔份额。' },
      { id: 'c', text: '上线前免费发放给了早期钱包。' },
      { id: 'd', text: '任何人调用代币合约都能铭刻 CST。' },
    ],
    correctOptionId: 'a',
    explanation:
      'CST 代币合约只接受协议合约的铭刻与销毁指令，供应量从零起步。没有上限，没有预留份额，也没有团队分配——耐心的参与是新 CST 的唯一来源。',
    reference: { label: '白皮书 §7 · CST 代币', href: '/white-paper#cst' },
  },
  {
    id: 'cst-on-spend',
    prompt: 'Rio 花了一些 CST 落下一笔。这些 CST 去了哪里？',
    options: [
      { id: 'a', text: '被销毁——永久移出供应量。' },
      { id: 'b', text: '进了团队的金库。' },
      { id: 'c', text: '汇入周期储备，收官时再次发放。' },
      { id: 'd', text: '周期收官时退还给 Rio。' },
    ],
    correctOptionId: 'a',
    explanation:
      '每笔 CST 落笔支付的全部价格都会销毁。这把代币供应量与真实使用绑在一起：沉寂的周期铭刻得少，活跃的 CST 使用又把供应量烧回去。没有任何金库来接收它——因为根本不存在。',
    reference: { label: '白皮书 §7.2 · 销毁与供应动态', href: '/white-paper#supply-dynamics' },
  },
  {
    id: 'public-goods-beneficiary',
    prompt: `每个周期都将储备的 ${protocolFacts.publicGoodsPercentage}% 作为公共物品分配转拨出去。目前的受益方是谁？`,
    options: [
      { id: 'a', text: 'Protocol Guild——170 余位以太坊核心贡献者的资助机制。' },
      { id: 'b', text: '协议团队的运营钱包。' },
      { id: 'c', text: 'Arbitrum 验证者。' },
      { id: 'd', text: '随机选出的一位 NFT 持有者。' },
    ],
    correctOptionId: 'a',
    explanation:
      '公共物品金库把这一份额转拨给 Protocol Guild，转拨作为收官的一部分在链上强制执行——没有人逐周期决定是否兑现。道理很简单：活在公共基础设施之上的协议，就该机械地、按节奏地、公开地资助这层设施。',
    reference: { label: '白皮书 §10 · 公共物品', href: '/white-paper#public-goods' },
  },
  {
    id: 'anchoring-basic',
    prompt: 'Mira 把她的 Cosmic Signature NFT 锚定至协议。锚定为她带来什么？',
    options: [
      {
        id: 'a',
        text: `锚定期间，这枚 NFT 按比例累积每周期 ${protocolFacts.anchorDistributionPercentage}% 的锚定派发，累积的 ETH 在解锚时取回。`,
      },
      { id: 'b', text: '把 NFT 挂到市场上出售。' },
      { id: 'c', text: '把 NFT 转换成 CST。' },
      { id: 'd', text: '用新的种子重新渲染作品。' },
    ],
    correctOptionId: 'a',
    explanation:
      '锚定是协议的长期对齐方式：已锚定的 Cosmic Signature NFT 按比例分摊锚定派发，累积的 ETH 在解锚时取回。NFT 本身丝毫不变——种子与作品是永久的。',
    reference: { label: '白皮书 §8 · 锚定', href: '/white-paper#anchoring' },
  },
  {
    id: 'anchor-once-ever',
    prompt: '之后 Mira 解锚了。下个月她还能再锚定这枚 NFT 吗？',
    options: [
      { id: 'a', text: '不能——每枚 NFT 一生仅可锚定一次，解锚是永久的。' },
      { id: 'b', text: '可以，等一段冷却期就行。' },
      { id: 'c', text: '可以，额外付费即可。' },
      { id: 'd', text: '可以，但仅限同一周期内。' },
    ],
    correctOptionId: 'a',
    explanation:
      '一生一次的规则，用一个不可逆的抉择取代了常见的锁定时间表，也让已锚定的集合有了真实的退出成本。要不要继续锚定，是每个周期都可以重新掂量的活问题；要不要解锚，则是永久的决定。',
    reference: { label: '白皮书 §8 · 锚定', href: '/white-paper#anchoring' },
  },
  {
    id: 'random-walk-perk',
    prompt: 'Sol 持有一枚 Random Walk NFT，并把它附加到一笔 ETH 落笔上。会发生什么？',
    options: [
      {
        id: 'a',
        text: `这一笔的价格降低 ${protocolFacts.randomWalkDiscountPercentage}%；NFT 留在 Sol 的钱包里，只被标记为已使用——一生一次。`,
      },
      { id: 'b', text: 'NFT 被转移给协议，以换取降价。' },
      { id: 'c', text: '这一笔变成免费。' },
      { id: 'd', text: 'NFT 让这一笔铭刻的参与 CST 翻倍。' },
    ],
    correctOptionId: 'a',
    explanation: `附加 Random Walk NFT 可使一笔 ETH 落笔的价格降低 ${protocolFacts.randomWalkDiscountPercentage}%。NFT 不会转移——合约只是将其标记为已使用。每枚 Random Walk NFT 在所有周期中仅可附加一次，降价因此成了一种消耗品。`,
    reference: {
      label: '白皮书 §4.2 · 附加 Random Walk NFT',
      href: '/white-paper#random-walk-attachment',
    },
  },
  {
    id: 'first-gesture-currency',
    prompt: '新周期刚刚启用。哪种落笔可以为它开场？',
    options: [
      { id: 'a', text: 'ETH 落笔——CST 落笔从第二笔起才可使用。' },
      { id: 'b', text: 'CST 落笔，因为 CST 是协议自己的代币。' },
      { id: 'c', text: '两种货币都可以开场。' },
      { id: 'd', text: '只有协议所有者能为周期开场。' },
    ],
    correctOptionId: 'a',
    explanation:
      '每个周期的首笔落笔必须使用 ETH，价格由 ETH 校准窗口决定。周期一旦展开，CST 就提供第二条入口。没有任何特权账户负责开场——谁落下开场之笔，谁就开启了周期。',
    reference: { label: '白皮书 §4.3 · CST 落笔', href: '/white-paper#cst-gestures' },
  },
  {
    id: 'message-on-gesture',
    prompt: '除了价值，一笔落笔还能携带什么？',
    options: [
      {
        id: 'a',
        text: `一条最长 ${protocolFacts.gestureMessageMaxLength} 字节、记录在链上的消息，外加可附加的 ERC-20 代币或一枚 ERC-721 NFT。`,
      },
      { id: 'b', text: '什么都不能——落笔只是价值转移。' },
      { id: 'c', text: '一张存储在合约里的图片。' },
      { id: 'd', text: '不限长度的文字，存储在链下。' },
    ],
    correctOptionId: 'a',
    explanation: `落笔可携带最长 ${protocolFacts.gestureMessageMaxLength} 字节的消息，与落笔一同记录在链上；也可附加代币或 NFT。附加资产由分配钱包托管，周期收官后受益方享有优先取回权。`,
    funFact: '每一条随落笔留下的消息都永久可读地留在 Arbitrum 上——一本穿行于周期之间的公开留言簿。',
    reference: {
      label: '白皮书 §4.4 · 消息与附加资产',
      href: '/white-paper#messages-and-attachments',
    },
  },
  {
    id: 'who-runs-cycles',
    prompt: '每个周期的 ETH 如何发放，由谁决定？',
    options: [
      {
        id: 'a',
        text: '没有人——分配比例是已验证合约中的常量，收官时机械执行。',
      },
      { id: 'b', text: '团队逐周期审核并签署发放。' },
      { id: 'c', text: '由一个预言机服务计算分配。' },
      { id: 'd', text: '由应用的后端服务器发出转账。' },
    ],
    correctOptionId: 'a',
    explanation:
      '机械化发放是协议的三项根本性质之一：参与者与发放规则之间没有任何自由裁量的账户，也没有团队钱包从落笔中收取 ETH。应用与服务器只是把合约已经完成的事情展示出来。',
    reference: { label: '白皮书 §1 · 引言', href: '/white-paper#introduction' },
  },
  {
    id: 'nft-count-typical',
    prompt: '典型周期会铭刻多少枚 Cosmic Signature NFT？',
    options: [
      { id: 'a', text: `${protocolFacts.typicalNftsPerCycle} 枚` },
      { id: 'b', text: '1 枚' },
      { id: 'c', text: `${protocolFacts.nftStellarSelectionRecipients} 枚` },
      { id: 'd', text: '100 枚' },
    ],
    correctOptionId: 'a',
    explanation: `典型周期铭刻 ${protocolFacts.typicalNftsPerCycle} 枚 NFT：${protocolFacts.roleNftsPerCycle} 枚角色 NFT（受益方、时之勇士、坚守冠军、CST 收官之笔）、${protocolFacts.nftStellarSelectionRecipients} 枚参与者 NFT 星选、${protocolFacts.anchoredRwlkNftSelectionRecipients} 枚锚定 NFT 星选。跳过某条轨道的周期会少铭刻几枚。`,
    reference: {
      label: '白皮书 §5.1 · 收官时的发放',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'chrono-endurance-exist',
    prompt: '坚守冠军与时之勇士这两条轨道衡量的是什么？',
    options: [
      { id: 'a', text: '时间维度上的坚持——而非谁落得最后或落得最多。' },
      { id: 'b', text: '本周期谁花的 ETH 最多。' },
      { id: 'c', text: '谁的落笔次数最多。' },
      { id: 'd', text: '周期开启时谁落笔最早。' },
    ],
    correctOptionId: 'a',
    explanation:
      '两条轨道衡量的都是坚持，而非位置：坚守冠军以最近落笔者身份坚守了最长的连续间隔，时之勇士则是连续在位坚守冠军最久的人。花得多、落得多，都不直接决定这两个头衔。',
    reference: {
      label: '白皮书 §5.2 · 坚守冠军与时之勇士',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'stellar-selection-what',
    prompt: '星选是什么？',
    options: [
      {
        id: 'a',
        text: '周期进行中按笔计入的资格记录，收官时由合约从中选出获配者。',
      },
      { id: 'b', text: '按活跃度排名参与者的榜单。' },
      { id: 'c', text: '赋予 NFT 作品的稀有度等级。' },
      { id: 'd', text: '为作品中的星座命名的方案。' },
    ],
    correctOptionId: 'a',
    explanation:
      '每笔落笔都在本周期星选池中计入一次资格。收官时，合约为 ETH 星选与 NFT 星选选出资格，入选频次与参与程度成正比。它是一种发放机制，不是排名。',
    reference: { label: '白皮书 §5.3 · 星选', href: '/white-paper#stellar-selections' },
  },
  {
    id: 'ecosystem-optionality',
    prompt: '应用、市场与预测场所同时下线一天。你还能做什么？',
    options: [
      { id: 'a', text: '一切照旧——每项机制都可以直接调用合约完成。' },
      { id: 'b', text: '什么也做不了，只能等应用恢复。' },
      { id: 'c', text: '只能取回分配，不能落笔。' },
      { id: 'd', text: '只能用 CST 落笔，不能用 ETH。' },
    ],
    correctOptionId: 'a',
    explanation:
      '合约之外的生态——应用、Axiom Zero、Uniswap 流动性、Chaos Zero——是便利，不是依赖。它们都不是必需的：落笔、收官、锚定与取回，都可以直接调用已验证的合约完成。',
    reference: { label: '白皮书 §2 · 协议概览', href: '/white-paper#protocol-overview' },
  },
  {
    id: 'what-it-is-not',
    prompt: '关于协议的本质，哪种说法与白皮书一致？',
    options: [
      {
        id: 'a',
        text: '参与者以价值换取参与本身，协议不留任何运营方抽成。',
      },
      { id: 'b', text: '取得 CST 是一条凭他人努力获取金钱的可靠途径。' },
      { id: 'c', text: '有一个运营方从每个周期中留下一定比例。' },
      { id: 'd', text: '协议承诺 NFT 的价值会随时间上涨。' },
    ],
    correctOptionId: 'a',
    explanation:
      '每条分配轨道流向的都是参与者、已锚定的 NFT、滚动储备或公共物品——不存在运营方抽成。白皮书不对价格、流动性或未来价值作任何承诺，并直言任何人都不应带着"凭他人努力获取金钱"的预期取得 CST 或 NFT。',
    reference: {
      label: '白皮书 §14.1 · Cosmic Signature 不是什么',
      href: '/white-paper#what-it-is-not',
    },
  },
  {
    id: 'where-recorded',
    prompt: '落笔、种子与周期历史究竟存放在哪里？',
    options: [
      { id: 'a', text: '在链上——Arbitrum One，一条以太坊 Layer 2 网络。' },
      { id: 'b', text: '在项目的私有数据库里。' },
      { id: 'c', text: '只在团队维护的 IPFS 文件里。' },
      { id: 'd', text: '不作记录，只保留汇总数据。' },
    ],
    correctOptionId: 'a',
    explanation:
      '协议运行在 Arbitrum One 上，重要记录——每一笔落笔、每一个种子、每一份分配——都在链上。正因如此，作品可复现、发放可审计，任何人都无需信任任何服务器。',
    reference: {
      label: '学习中心：Cosmic Signature 与 Arbitrum',
      href: '/learn/cosmic-signature-on-arbitrum',
    },
  },
];
