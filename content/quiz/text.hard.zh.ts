import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('zh-CN');

/**
 * 高阶层文案：边界情形、对抗性推演、升级历史、渲染管线与安全设计。
 * 键为 structure.ts 中的骨架题目 id。
 */
export const hardQuestionsTextZh = {
  'late-gesture-semantics': {
    prompt: '倒计时一分钟前已经归零，但还没有人收官。Fen 悄悄落下一笔。这一笔究竟做了什么？',
    options: {
      a: '把一个增量加到链上存储的收官时间上，并接任收官之笔——但不会让时钟从头再来。',
      b: '从当下时刻起完整重启倒计时。',
      c: '交易回滚——到期后不可能再落笔。',
      d: '这一笔计入下一个周期。',
    },
    explanation:
      '延长作用于链上存储的收官时间，而非当下时刻。倒计时已过、收官尚未执行时，落笔依然有效：它把存储值再推一个增量，并接任收官之笔。时钟永不重启——这正是到期后的接任始终如履薄冰的原因。',
    referenceLabel: '白皮书 §3.2 · 收官倒计时',
  },
  'refusing-beneficiary': {
    prompt: '一个自动化合约钱包握有收官之笔，却被写成拒收一切 ETH。它调用收官。会发生什么？',
    options: {
      a: `签名分配转账失败，它自己的交易回滚——${protocolFacts.finalGestureExclusivityHours} 小时后，其他任何人都可收官并接过受益方角色。`,
      b: '收官成功，ETH 悄然丢失。',
      c: '收官成功，它的 ETH 份额滚入下一周期。',
      d: '协议暂停，等待所有者介入。',
    },
    explanation:
      '签名分配在收官时直接送达受益方，拒收 ETH 的受益方只会让自己的收官交易回滚。协议毫不在意：专属窗口一过，公开收官窗口开启，任何人都可收官并亲自成为受益方。恶意钱包只能破坏自己的位置。',
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'refusing-chrono': {
    prompt: '一个拒收一切 ETH 的合约以时之勇士的身份走完了周期。它为什么无法阻塞周期收官？',
    options: {
      a: '它的 ETH 存入分配钱包托管，收官从不依赖这位获配方接受转账。',
      b: '收官会反复重试转账，直到被接受。',
      c: '它的份额被跳过，滚入下一周期。',
      d: '宇宙议会把这份额改道给其他地址。',
    },
    explanation:
      '取回优先于送达：次级 ETH 分配存入托管，而非在收官时直接发送，任何获配方合约都无法借此阻塞周期落幕。这个恶意钱包的 ETH 在分配钱包里等着——若长期无人取回，最终会成为任何人都可取回的分配。',
    referenceLabel: '白皮书 §11.2 · 防御式设计',
  },
  'public-goods-transfer-fails': {
    prompt: '收官过程中，公共物品转拨无法完成。协议怎么办？',
    options: {
      a: '收官照常进行，事件记录在案，留待后续处理。',
      b: '整个收官回滚，直到转账成功。',
      c: '这份额被销毁。',
      d: '这份额被悄悄并入受益方的分配。',
    },
    explanation:
      '容错转拨是刻意的设计选择：公共物品金库出问题，绝不能让周期搁浅。收官照常完成，失败记录在链上，转拨事后处理。对比受益方的直接送达——那笔转账确实会回滚，但只回滚调用者自己的交易。',
    referenceLabel: '白皮书 §11.2 · 防御式设计',
  },
  'no-anchored-nfts': {
    prompt: '某周期收官时，没有任何已锚定的 Cosmic Signature NFT。锚定派发怎么办？',
    options: {
      a: `该周期的 ${protocolFacts.anchorDistributionPercentage}% 被跳过，这部分份额滚入下一周期。`,
      b: '改为转拨给公共物品。',
      c: '先留存，待有人锚定后补发。',
      d: '在星选获配者之间分摊。',
    },
    explanation:
      '收官时若没有任何已锚定的 Cosmic Signature NFT，锚定派发将跳过，这部分份额随滚动储备滚入下一周期。不为未来的锚定者留存任何东西——每个周期的发放只看收官那一刻的锚定集合。',
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'no-cst-gestures': {
    prompt: '某周期结束时没有一笔 CST 落笔。哪条分配轨道受影响？如何处理？',
    options: {
      a: '该周期完全跳过 CST 收官之笔轨道。',
      b: '它的 CST 与 NFT 转给最后一笔 ETH 落笔的参与者。',
      c: '在有人用 CST 落笔之前，周期无法收官。',
      d: `它的 ${cst(protocolFacts.specialAllocationCst)} CST 被销毁以示抗议。`,
    },
    explanation:
      '没有 CST 落笔的周期直接跳过 CST 收官之笔轨道——不会另立替补获配者，收官照常进行。同样的“跳过而不替补”原则也适用于没有锚定的周期里的锚定 NFT 星选。',
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'randomness-sources': {
    prompt: '星选与艺术种子背后的随机性来自哪里？',
    options: {
      a: '一个链上构造：折叠上一区块哈希、当前基础费与来自 Arbitrum 预编译合约的熵，再以 keccak256 逐个导出随机值。',
      b: '一份 Chainlink VRF 预言机订阅。',
      c: '周期参与者之间的提交-揭示仪式。',
      d: '每次收官前由团队提交的种子。',
    },
    explanation:
      '种子把上一区块哈希、当前基础费与来自 ArbSys 和 ArbGasInfo 预编译合约的 Arbitrum 专属熵（上一 Arbitrum 区块哈希、gas 积压量与 L1 计价计数器）折叠在一起。这是有意的极简：不引入预言机，不依赖外部委员会，也没有任何可能让周期搁浅的回调。',
    referenceLabel: '白皮书 §11.3 · 随机性',
  },
  'randomness-limits': {
    prompt: '关于这种随机性的局限，白皮书明确承认了什么？',
    options: {
      a: '排序器理论上可以影响区块级输入；设计限定了这种影响所能触及的范围。',
      b: '没有局限——这个构造对所有人都可证明不可预测。',
      c: '随机性偶尔会失败，导致周期作废。',
      d: '落笔多的参与者能够预测选择结果。',
    },
    explanation:
      '取舍摆在明处：排序器理论上可以影响区块级输入。设计限定了影响的边界——随机性的消费者只有星选与艺术种子，整个构造每次收官只使用一次，而收官本身是任何人都能提交的公开交易。',
    referenceLabel: '白皮书 §11.3 · 随机性',
  },
  'precompile-unavailable': {
    prompt: '收官那一刻，某个 Arbitrum 预编译合约不可用。随机性构造会怎样？',
    options: {
      a: '预编译调用具备容错性；构造退回其余来源继续。',
      b: '收官回滚，直到预编译恢复。',
      c: '周期每小时重试一次，直到成功。',
      d: '由所有者提供替代种子。',
    },
    explanation:
      '每个熵来源在设计上都是可选的：某个预编译调用不可用时，构造就折叠其余来源。这一主题贯穿协议——任何外部事物，哪怕是 Arbitrum 自己的预编译合约，都不得挟持收官。',
    referenceLabel: '白皮书 §11.3 · 随机性',
  },
  'v2-flat-cst-problem': {
    prompt: `V1 每笔固定铭刻 ${cst(100)} CST。V2 为什么要改用平方根公式？`,
    options: {
      a: '固定铭刻让机器速度的连续落笔沦为凭空生成 CST 的手段；新规则按耐心铭刻，而非按频次。',
      b: '参与者抱怨固定数额太少。',
      c: '简化公式是为了节省 gas。',
      d: '为了给团队做一次性分配。',
    },
    explanation:
      '固定铭刻之下，一串急促的落笔仅凭速度就能凭空造出 CST。平方根规则之下，这样的连击几乎什么都铭刻不到，创造供应的是耐心的参与——这个公式本身就是一道供应闸门，而不只是一条定价曲线。',
    referenceLabel: '白皮书 §12.2 · V2 升级',
  },
  'v2-min-imprint-guard': {
    prompt: 'V2 给每个落笔方法加了一项参数：参与者可接受的最低参与 CST 数额。它是干什么用的？',
    options: {
      a: '避免签名与执行之间的时间差造成损失——若铭刻量将低于这个下限，这一笔直接回滚。',
      b: '让参与者付费索取额外 CST。',
      c: '限定一个周期能铭刻的 CST 总量。',
      d: '这是议会控制的一项落笔税。',
    },
    explanation:
      '参与 CST 取决于距上一笔的时间。在签名与交易执行之间，若他人先落笔，这段间隔就会缩短。最低铭刻保护让参与者事先设定下限：实际铭刻量低于下限时，交易会回退。',
    referenceLabel: '白皮书 §12.2 · V2 升级',
  },
  'v2-exclusivity-change': {
    prompt: 'V2 对收官之笔参与者的专属收官窗口做了什么？',
    options: {
      a: `由 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时延长至 ${protocolFacts.finalGestureExclusivityHours} 小时。`,
      b: `缩短到 ${protocolFacts.initialCycleTimeIncrementHours} 小时，加快周期节奏。`,
      c: '取消了——收官立即向所有人开放。',
      d: '改为无限期——永远只有收官之笔参与者能收官。',
    },
    explanation: `V2 把专属窗口从 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时翻倍至 ${protocolFacts.finalGestureExclusivityHours} 小时——这是对真实行为的回应：人会睡觉、出行、忘记截止时间。窗口依然有限，因为协议不为任何人无限期停留。`,
    referenceLabel: '白皮书 §12.2 · V2 升级',
  },
  'v2-timing-loophole': {
    prompt: 'V2 的时序加固堵住了一个漏洞。是什么漏洞？',
    options: {
      a: '到期后近乎免费的 CST 落笔可以反复外推截止时间；如今延长一律作用于链上存储的收官时间。',
      b: 'ETH 落笔可以跨周期重放。',
      c: '所有者可以在周期中途暂停倒计时。',
      d: '已锚定的 NFT 可以在一笔交易里解锚再锚定。',
    },
    explanation:
      'CST 价格降到近零时，到期后的落笔几乎不要钱——若每一笔都从当下时刻起延长，几个小钱就能把周期无限拖下去。把延长锚定在链上存储的时间堵住了这个漏洞；同一次升级还加固了排定下一周期的算术，任何参数组合都无法阻止周期收官。',
    referenceLabel: '白皮书 §12.2 · V2 升级',
  },
  'v3-what-changes': {
    prompt: '规划中的 V3 升级只改一件事。是什么？',
    options: {
      a: '晚出手的代价：最后 20 分钟内，一切落笔价格都乘上一个从 1 倍攀升至 10 倍的溢价系数。',
      b: '艺术管线换用新的渲染器。',
      c: '移除 CST 落笔。',
      d: '重新调整各分配比例。',
    },
    explanation:
      'V3 只动终局：周期收官时间前的最后 20 分钟内，一切落笔价格——ETH、附加 Random Walk NFT 的 ETH、CST——都乘上一个按多项式从 1 倍攀升至 10 倍的溢价系数。协议的其余部分保持 V2 的定义不变。',
    referenceLabel: '白皮书 §12.3 · 规划中的 V3 升级',
  },
  'v3-shape': {
    prompt: 'V3 的溢价是 m(t) = 1 + 9·(t/T)⁸。八次方的指数为什么重要？',
    options: {
      a: '溢价在窗口的大部分时间里几乎无感，只在最后陡然直立——距收官 10 分钟约 1.04 倍，5 分钟约 1.9 倍，1 分钟约 7 倍，到点 10 倍。',
      b: '它让溢价在整个窗口内线性上升。',
      c: '它让整个窗口都按 10 倍计价。',
      d: '它只影响 CST 落笔。',
    },
    explanation:
      '八次方曲线把几乎全部涨幅压缩到最后几分钟：贯穿窗口的普通参与几乎无感，压哨突袭却要付出高价。线性曲线会向整个窗口征价，固定 10 倍会一视同仁——正是这个指数，让溢价精确瞄准卡点者。',
    referenceLabel: '白皮书 §12.3 · 规划中的 V3 升级',
  },
  'v3-overtime': {
    prompt: 'V3 之下，Zed 等到截止时间过后才在超时阶段落笔。适用什么溢价？',
    options: {
      a: '足额 10 倍——溢价到点即达 10 倍，超时落笔一律按 10 倍计。',
      b: '没有溢价——超时落笔回到 1 倍。',
      c: '最高值的一半，5 倍。',
      d: 'V3 之下超时落笔被完全禁止。',
    },
    explanation:
      '溢价攀升到 10 倍后便停在那里，超时落笔一律按 10 倍计。到期后的接任依然可行——V2 的存储时间规则仍然管辖时钟——但在 V3 之下，它们是昂贵的表态，而非免费的偷袭。',
    referenceLabel: '白皮书 §12.3 · 规划中的 V3 升级',
  },
  'owner-mid-cycle': {
    prompt: '周期进行中，所有者想改一个比例、再升级合约。此刻所有者究竟能做什么？',
    options: {
      a: '比例调整与升级都必须等到周期间进行；周期运行期间，核心参数保持锁定。',
      b: '可以立即改比例，但不能改代码。',
      c: '可以升级合约，但不能改参数。',
      d: '有宇宙议会会签就都可以。',
    },
    explanation:
      '周期运行期间，所有者不能更改核心分配比例、时间增量或落笔价格，也不能升级协议合约。部分外围设置等较窄权限，则有各自的适用条件。',
    referenceLabel: '白皮书 §13 · 全面去中心化之路',
  },
  'owner-cannot-reach': {
    prompt: '下列哪些是所有者即使在周期之间也能触碰的？',
    options: {
      a: '文档所列的管理函数都不能直接改动这些资产的归属或重写这些记录。',
      b: '托管中的分配可以，其余不行。',
      c: '已记录的种子可以，用于修复有问题的作品。',
      d: '紧急情况下可以动 CST 余额。',
    },
    explanation:
      '文档所列的管理函数不会直接改动托管分配、已铭刻 NFT 的归属、已记录的种子或 CST 余额。在交出特权控制前，所有者仍保有另行披露的周期间升级权限。',
    referenceLabel: '白皮书 §13 · 全面去中心化之路',
  },
  'owner-endgame': {
    prompt: '按白皮书的承诺，所有者角色如何谢幕？',
    options: {
      a: '剩余升级完成后，特权控制将永久离开部署者地址——或转交宇宙议会，或直接放弃所有权，具体方式提前公布。',
      b: '永不谢幕；团队无限期保留维护角色。',
      c: '出售给权重最高的议会委托人。',
      d: '永久移交给一个公司多签。',
    },
    explanation:
      '承诺是明确的：以 V3 为首的剩余升级完成后，所有者角色将永久离开部署者，具体方式提前公布。自那时起，任何私人主体都无法再升级协议或更改参数——而这一进程的每一步都在链上公开可见，包括最后一步。',
    referenceLabel: '白皮书 §13 · 全面去中心化之路',
  },
  'postpone-activation-limit': {
    prompt: '所有者想把下一周期的启用时间向后推。这项权限的边界在哪里？',
    options: {
      a: '只在该周期的首笔落笔到来之前有效——首笔一落，这项权限即告失效。',
      b: '任何时刻都能暂停周期，包括进行中。',
      c: '需要一份议会提案先行通过。',
      d: '根本不存在这样的权限。',
    },
    explanation:
      '推迟下一周期启用是随时可用的三项窄权限之一——但仅限其首笔落笔到来之前。有人落笔的那一刻，周期便已启程，所有者手里的时间杠杆随之消失。',
    referenceLabel: '白皮书 §13 · 全面去中心化之路',
  },
  'no-team-eth': {
    prompt: '团队经手的唯一固定流是什么？团队又从落笔中收取多少 ETH？',
    options: {
      a: `每周期进入推广储备的 ${cst(protocolFacts.outreachReserveCst)} CST——而且没有任何团队钱包从落笔中收取 ETH，一分也没有。`,
      b: '每笔落笔中的一小部分 ETH。',
      c: '每第十个周期的签名分配。',
      d: '什么都没有，包括 CST。',
    },
    explanation: `推广储备每周期接收 ${cst(protocolFacts.outreachReserveCst)} CST 用于社区推广——这是团队经手的唯一一条固定流，且不附带任何特殊权限。至于 ETH，白皮书说得斩钉截铁：没有团队钱包从落笔中收取 ETH。`,
    referenceLabel: '白皮书 §7.1 · 铭刻规则',
  },
  'art-integrator': {
    prompt: '三体模拟用什么数值方法积分？这个选择为何重要？',
    options: {
      a: '四阶 Yoshida 辛积分器——它能在长时间尺度上保持系统的能量行为。',
      b: '简单的 Euler 步进——够快，画画足够了。',
      c: '一个近似轨道的神经网络。',
      d: '三体方程的解析解。',
    },
    explanation:
      '辛积分器保持哈密顿系统的几何结构，适合维持长时间模拟中的能量稳定性，但不保证每一步都精确满足能量守恒。三体问题没有一般解析解，因此管线采用数值积分。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-candidates': {
    prompt: '管线如何挑出最终成为签名的那条轨道？',
    options: {
      a: '十万组候选构型各推进一百万个物理步，再由 Borda 排序聚合按混沌程度与三角形等边程度打分，选出视觉上最有意味的一条。',
      b: '用第一条随机生成的轨道，原样上阵。',
      c: '由团队逐周期人工挑选。',
      d: '铭刻后由 NFT 持有者表决选定。',
    },
    explanation:
      '种子生成十万组候选构型；每组推进一百万个物理步；Borda 排序聚合按混沌与等边两项指标选出最出挑的一条。每个阶段都是种子的纯函数——遴选由算法完成，任何人都能一模一样地复现。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-color': {
    prompt: '三个天体的色彩如何确定？',
    options: {
      a: '在 OKLab 感知色彩空间中混合，各天体色相相隔 120°，并由漂移与正弦波调制。',
      b: '每幅签名固定使用红、绿、蓝三色。',
      c: '从真实星云照片中取样。',
      d: '铭刻时由 NFT 的第一位所有者挑选。',
    },
    explanation:
      '色彩在 OKLab 中混合——在这个感知色彩空间里，数值上等距的颜色在人眼看来差异也相等——各天体色相相隔 120°，彼此始终分明。与种子之后的一切一样，配色是确定性的。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-spectral': {
    prompt: '轨迹为何呈现出那样的质感？',
    options: {
      a: '光谱渲染：从 380 至 700 纳米划分 64 个波长区间，以随速度变化的线宽和景深渲染轨迹。',
      b: '加了辉光滤镜的扁平矢量笔画。',
      c: '物理模拟器的截图，再交给 AI 放大。',
      d: '在模拟之上手工调校的样条曲线。',
    },
    explanation:
      '渲染器把光当作光谱，而非三条颜色通道：可见光范围内的 64 个波长区间、随速度变化的线宽、营造纵深的景深。AgX 色调映射、辉光、OpenSimplex 星云层与色彩分级共同完成画面。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-output': {
    prompt: '管线为每枚 NFT 输出什么文件？',
    options: {
      a: '一张 16 位 PNG 与一段 30 秒 H.265 视频。',
      b: '只有一张 JPEG 缩略图。',
      c: '一张动态 GIF。',
      d: '一个 SVG 矢量文件。',
    },
    explanation:
      '每幅签名交付一张 16 位 PNG——每通道色深是常规的两倍——外加一段 30 秒的 H.265 轨道运动视频。两者都可以由任何人用链上种子跑一遍开源管线重新生成。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-server-death': {
    prompt: '与项目相关的所有服务器明天全部消失。作品会怎样？',
    options: {
      a: '每幅签名都能从链上重生——种子在链上，管线是公开的。',
      b: '艺术丢失；只有元数据幸存。',
      c: '只有钱包里的缩略图幸存。',
      d: '取决于 IPFS 固定是否有人维护。',
    },
    explanation:
      'NFT 种子保存在链上，渲染管线开源且具有确定性。任何人只要拥有种子和管线，就能重新生成作品，无需依赖项目的图像服务器。',
    funFact: '持续集成逐帧断言渲染结果的 SHA-256 哈希——管线哪怕意外漂移一个像素，构建都会失败。',
    referenceLabel: '白皮书 §6.2 · 可复现性与许可',
  },
  'art-naming': {
    prompt: '所有者对自己的 Cosmic Signature NFT 有哪些自定义空间？',
    options: {
      a: '可在链上为它命名，最长 32 字节——作品本身永不改变。',
      b: '可以重掷一次种子。',
      c: '可以调整配色。',
      d: '可以延长视频时长。',
    },
    explanation:
      '所有者可在链上记录一个最长 32 字节的名字。自定义空间到此为止：种子、轨道、配色与视频在铭刻那一刻永久固定——确定性是这个系列的核心承诺，重掷种子会将其击碎。',
    referenceLabel: '白皮书 §6.2 · 可复现性与许可',
  },
  'art-license': {
    prompt: '项目自有的合约、着色器与渲染管线以什么许可发布？',
    options: {
      a: 'CC0 1.0——献入公有领域，不保留任何权利。',
      b: '团队持有的专有许可。',
      c: 'GPL-3.0，衍生作品必须开源。',
      d: '每枚 NFT 各自持有的单独许可。',
    },
    explanation:
      '项目自有代码均以 CC0 1.0 献入公有领域，不保留任何权利：任何人都可以复刻合约、渲染器或网站。第三方依赖保留各自的许可。就连白皮书本身也是 CC0。',
    referenceLabel: '白皮书 §6.2 · 可复现性与许可',
  },
  'seed-derivation': {
    prompt: 'NFT 的艺术种子在何时、如何产生？',
    options: {
      a: '铭刻时由合约从链上数据导出 32 字节种子，与 NFT 一同存储；一个 SHA3-256 生成器让此后的一切都是它的纯函数。',
      b: '收官前由艺术家为每枚 NFT 上传种子。',
      c: '种子就是所有者的钱包地址。',
      d: '每次渲染都会重新取一个种子。',
    },
    explanation:
      '种子在铭刻时于链上导出，并与 NFT 永久存储。它初始化一个 SHA3-256 随机数生成器，此后的每个选择——候选轨道、镜头、色彩——都是它的纯函数。今天渲染，或十年后渲染：同一种子，同一幅签名。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'hacken-findings': {
    prompt: 'Hacken 对合约的独立安全审查结论是什么？',
    options: {
      a: '共 23 项发现：无严重级，无高危级，中危 3 项、低危 8 项、信息级 12 项——多数是附书面理由接受的设计取舍。',
      b: '数项严重级发现至今未修复。',
      c: '零发现，任何级别都没有。',
      d: '报告从未发布。',
    },
    explanation:
      '最终报告于2026年1月发布，覆盖核心协议、CST 代币、两个 NFT 集成、锚定钱包与配套合约。阅读时应结合问题严重度、处理状态和审查范围。报告没有严重或高危级别发现，但这不等于协议不存在风险。',
    referenceLabel: '白皮书 §11.1 · 独立审查',
  },
  'hacken-invariants': {
    prompt: '人工审查之外，Hacken 的模糊测试检验了什么？',
    options: {
      a: '14 项系统不变量——例如协议持有的 ETH 总额必须始终等于存入减去发放——全部在 10,000 次运行中保持成立。',
      b: '常见交易的 gas 消耗。',
      c: '艺术管线的确定性。',
      d: '前端渲染性能。',
    },
    explanation:
      '模糊测试用生成的输入反复冲击系统，同时断言必须永远成立的性质。Hacken 形式化了 14 项这样的不变量，全部在 10,000 次运行中保持成立——这与逐行审查是两种不同的证据，专门瞄准没有人想到要试的状态。',
    referenceLabel: '白皮书 §11.1 · 独立审查',
  },
  'verification-tooling': {
    prompt: '外部审查之外，代码仓库还带有哪些验证工具？',
    options: {
      a: 'Certora 形式化验证规范、Solidity SMTChecker 配置、Slither 静态分析，以及一套以全覆盖为目标的测试。',
      b: '什么都没有——外部审查是唯一的检查。',
      c: '一套私下运行的闭源测试。',
      d: '每次发布前的人工测试。',
    },
    explanation:
      'Certora 规范、SMTChecker、Slither 与覆盖率导向的测试，分别检查不同性质与缺陷类型。它们与 Hacken 审查和模糊测试互为补充；任何单项检查都不能证明系统完全正确。',
    referenceLabel: '白皮书 §11.1 · 独立审查',
  },
  'sourcify-status': {
    prompt: '已部署合约的源码验证状态如何？',
    options: {
      a: '已在 Sourcify 上以精确匹配状态完成验证（链 ID 42161），地址固定于白皮书附录。',
      b: '未验证——只能信任字节码。',
      c: '只验证了代理，没有验证实现。',
      d: '只在测试网上验证过，主网没有。',
    },
    explanation:
      '全部合约都在 Sourcify 上以精确匹配状态完成验证（链 ID 42161）——这是最严格的验证等级：链上字节码与公开源码逐字节一致，连元数据也不例外。代理地址是协议的永久地址，实现只会经由公开升级流程更替。',
    referenceLabel: '白皮书 §11.4 · 公开验证',
  },
  reentrancy: {
    prompt: '一个恶意合约试图借回调在交易中途重入协议。挡住它的是什么？',
    options: {
      a: '重入防护覆盖核心合约的每个外部入口。',
      b: '什么也没有——协议指望获配方守规矩。',
      c: '一份由议会管理的可信合约名单。',
      d: '仅凭 gas 上限就让重入不可能发生。',
    },
    explanation:
      '重入防护会阻止受保护入口在同一笔尚未完成的交易中被再次调用。次级分配采用托管取回方式，也避免在收官期间直接向获配者转账。这些防护针对特定风险，不代表所有攻击都已被排除。',
    referenceLabel: '白皮书 §11.2 · 防御式设计',
  },
  'intercycle-locks-why': {
    prompt: '为什么周期运行期间合约不可升级——哪怕出了紧急情况？',
    options: {
      a: '刻意如此：协议不设任何在周期进行中修改合约的机制，无论情形如何——参与者行动时所见的规则永远可查。',
      b: '周期中途升级的 gas 太贵。',
      c: '这是代理模式的技术限制。',
      d: '议会一致同意即可升级。',
    },
    explanation:
      '周期间锁定是写进合约的准则，不是技术上的偶然——UUPS 代理在技术上随时可以升级。协议选择让周期中途的修改不可能发生：参与者落笔时看到的规则，就是结算这个周期的规则。',
    referenceLabel: '白皮书 §12.1 · V1：上线',
  },
  'cst-checkpoints': {
    prompt: 'CST 如何为提案快照协调权重？',
    options: {
      a: '基于时间戳的检查点——提案快照对应钟表时间，而非区块高度。',
      b: '基于区块高度的检查点，和多数 Governor 部署一样。',
      c: '在每次表达权重的当下实时读取。',
      d: '每个周期收官时统一快照一次。',
    },
    explanation:
      '代币采用基于时间戳的检查点，提案快照对应的是钟表时间。在区块节奏与以太坊主网不同的 L2 上，时间戳是更稳的参照——一个让协调时间线保持可预期的细微抉择。',
    referenceLabel: '白皮书 §7.3 · 协调权重',
  },
  'dust-refund': {
    prompt: 'Pia 的 ETH 落笔多付了几 wei——低于灰尘阈值。差额怎么办？',
    options: {
      a: '留在储备中：这么小的退款，gas 都不够抵。',
      b: '出于原则，照样退回。',
      c: '累积到一个个人余额里。',
      d: '为保护她，这一笔直接回滚。',
    },
    explanation:
      '超出灰尘阈值的超付在同一笔交易中退回；低于阈值时，差额留在储备中，因为退款本身烧掉的 gas 比退回的钱还多。一处微小而诚实的不对称——写在明处，而非藏起来。',
    referenceLabel: '白皮书 §4.1 · ETH 落笔',
  },
  'rwlk-not-transferred': {
    prompt: 'Sol 为降价附加了他的 Random Walk NFT。之后这枚 NFT 在哪里？',
    options: {
      a: '仍在他的钱包里——合约只是将其标记为已使用；它从未被转移或托管。',
      b: '托管在分配钱包里，直到周期结束。',
      c: '被销毁，换取降价。',
      d: '转移给协议，收官后归还。',
    },
    explanation:
      'Random Walk NFT 从不移动：合约记下“已使用”，并应用降价。被消耗的是这个标记——每枚一生一次，横跨所有周期——一个数量固定的外部系列由此融入协议经济，而协议不必保管任何东西。',
    referenceLabel: '白皮书 §4.2 · 附加 Random Walk NFT',
  },
  'open-finalization-carries': {
    prompt: '公开收官窗口期间，从未落过一笔的 Quill 完成了收官。她究竟得到什么？',
    options: {
      a: '受益方角色的一切：签名分配的 ETH 份额、CST 铭刻、NFT，以及对已附加资产的优先权。',
      b: '一笔固定的收官报酬，分配仍归收官之笔参与者。',
      c: '只有 NFT；ETH 滚入下一周期。',
      d: '什么也没有——收官是义务劳动。',
    },
    explanation:
      '公开收官窗口内，合约把实际收官者视为周期受益方，一步到位——ETH 份额、CST 铭刻、NFT，以及对附加资产的优先权。Quill 从头到尾无需落过一笔。缺席的收官之笔参与者失去的是整个角色，而非其中一角。',
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'attached-priority-timeout': {
    prompt: '受益方对已附加资产的优先权能持续多久？',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} 周——公开取回期限一过，任何人都可取回。`,
      b: '永久——附加资产无限期等待受益方。',
      c: `${protocolFacts.finalGestureExclusivityHours} 小时，与收官窗口一致。`,
      d: '直到下一个周期收官。',
    },
    explanation: `附加资产在分配钱包中的期限与其他托管分配相同：${protocolFacts.secondaryRetrievalTimeoutWeeks} 周。窗口内受益方优先；窗口过后，资产向第一位来者开放。${protocolFacts.finalGestureExclusivityHours} 小时管的是收官权，不是托管。`,
    referenceLabel: '白皮书 §5.4 · 发放、托管与期限',
  },
  'eth-window-duration-drift': {
    prompt: 'ETH 校准窗口的下行需要多久？这个时长是固定的吗？',
    options: {
      a: '按上线参数约两天——但时长与周期时间增量挂钩，会随协议年岁缓慢拉长。',
      b: `永远固定 ${protocolFacts.finalGestureExclusivityHours} 小时。`,
      c: `固定 ${protocolFacts.initialCstCalibrationWindowHours} 小时，与 CST 窗口的基准一致。`,
      d: '活跃度越高，每个周期越短。',
    },
    explanation: `按上线参数，整段下行约需两天；若窗口走完仍无人落笔，价格便停在底价等待。时长与时间增量挂钩——增量每周期增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%——窗口因此随协议逐渐舒展的节拍一同拉长，而非一成不变。`,
    referenceLabel: '白皮书 §3.1 · 开场与 ETH 校准窗口',
  },
  'first-cycle-opening': {
    prompt: '第一个周期没有前任可供校准。它如何开场？',
    options: {
      a: `以固定的 ${protocolFacts.initialGestureCostEth} ETH。`,
      b: '以议会选定的 1 ETH。',
      c: '免费——第一笔什么都不用付。',
      d: '按部署 gas 费用的两倍。',
    },
    explanation: `没有上一周期的开场价可以翻倍，第一个周期便以固定的 ${protocolFacts.initialGestureCostEth} ETH 开场——刻意定得极小，让市场通过 ${protocolFacts.ethGestureCostStepUpPercent}% 的步进与周期间校准自己把价格走出来，而不是由谁来猜一个发行价。`,
    referenceLabel: '白皮书 §3.1 · 开场与 ETH 校准窗口',
  },
  'selection-entry-scaling': {
    prompt: '本周期 Bea 落笔 30 次，Cal 落笔 3 次。关于 ETH 星选，下列哪项为真？',
    options: {
      a: 'Bea 的资格在池中出现的频次是 Cal 的十倍，放回方式下她甚至可能被选中多次——但 Cal 完全可能被选中。',
      b: 'Bea 保底至少被选中一次。',
      c: 'Cal 被排除在外；只有头部参与者才有资格。',
      d: '两人机会完全相同——每个地址一次资格。',
    },
    explanation:
      '资格随落笔累积——入选频次与参与程度成正比——且选择采用放回方式。没有人有保底，也没有落过笔的人会被排除：星选池按活跃度加权，不设门槛，也不搞配给。',
    referenceLabel: '白皮书 §5.3 · 星选',
  },
  'recognition-vs-participation': {
    prompt: 'CST 经三条途径进入流通。哪一条由团队经手？它附带什么权限？',
    options: {
      a: `只有推广储备每周期的 ${cst(protocolFacts.outreachReserveCst)} CST——而且不附带任何特殊权限。`,
      b: '表彰 CST，由团队指定给偏爱的参与者。',
      c: '参与 CST，团队可逐笔调整。',
      d: '三条途径都由团队经手。',
    },
    explanation: `三条途径是：参与 CST（落笔时按公式铭刻）、表彰 CST（收官时随每份 NFT 发放 ${cst(protocolFacts.specialAllocationCst)} CST），以及推广储备（每周期 ${cst(protocolFacts.outreachReserveCst)} CST）。只有最后一条由团队经手——而它只是普通 CST，不附带任何特殊权限，用于社区推广。`,
    referenceLabel: '白皮书 §7.1 · 铭刻规则',
  },
  'finalization-actions': {
    prompt: '收官是一笔交易。它究竟做了什么？',
    options: {
      a: '读取一次协议的 ETH 余额，发放各分配轨道，铭刻本周期的 NFT 与 CST，为每件作品记录种子，并排定下一周期。',
      b: '只转出受益方的 ETH；其余事后处理。',
      c: '只铭刻 NFT；ETH 发放分成多笔交易陆续完成。',
      d: '启动一个由团队经手、历时数日的结算流程。',
    },
    explanation:
      '一笔交易结清整个周期：读取一次 ETH 余额，发放第 5 节的各条轨道（受益方与公共物品直接送达，其余托管），铭刻 NFT 与 CST 并记录种子，排定下一周期。原子性正是要点——不存在“收官到一半”的状态。',
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'chrono-vs-endurance-trap': {
    prompt:
      '周期前段，Nyx 以最近落笔者身份坚守了六小时。随后 Orin 坚守了九小时，但他的纪录在收官前只保持了片刻，而 Nyx 的纪录曾保持两天。两个头衔各归谁？',
    options: {
      a: 'Orin 是坚守冠军（单段间隔最长）；Nyx 长时间保持纪录，很可能拿下时之勇士。',
      b: 'Nyx 双冠——两天胜过一切。',
      c: 'Orin 双冠——更大的间隔通吃。',
      d: '两个头衔都归收官之笔参与者。',
    },
    explanation:
      '坚守衡量你创造的间隔——Orin 的九小时胜过 Nyx 的六小时。时之勇士衡量坚守冠军头衔被保持的时长：Nyx 在位两天才被 Orin 刷新，而 Orin 的在位只延续到收官。两条轨道刻意褒扬不同形态的坚持，并且都要到收官那一刻才尘埃落定。',
    referenceLabel: '白皮书 §5.2 · 坚守冠军与时之勇士',
  },
  'anchored-rwlk-weighting': {
    prompt: 'Vale 锚定了五枚 Random Walk NFT，Wynn 锚定了一枚。锚定 NFT 星选如何对待他们？',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 次选出按各锚定者锚定的 NFT 数量加权——Vale 的权重是 Wynn 的五倍。`,
      b: '每位锚定者恰好一次，与数量无关。',
      c: '按各枚 NFT 锚定的先后加权。',
      d: 'Vale 与 Wynn 平分这些选出。',
    },
    explanation: `锚定 NFT 星选每周期在已锚定的 Random Walk NFT 中选出 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，权重按各锚定者锚定的数量计。每次携带 ${cst(protocolFacts.specialAllocationCst)} CST 与一枚 Cosmic Signature NFT——不含 ETH，ETH 派发专属于已锚定的 Cosmic Signature NFT。`,
    referenceLabel: '白皮书 §5.3 · 星选',
  },
  'voluntary-vault-contributions': {
    prompt: '除了每周期的转拨，ETH 还能通过别的途径进入公共物品金库吗？',
    options: {
      a: '能——金库也接受周期之外的自愿 ETH 贡献。',
      b: '不能——只有收官能向金库转入 ETH。',
      c: '只有所有者能为金库注资。',
      d: '自愿贡献只能用 CST。',
    },
    explanation: `在链上强制执行的每周期 ${protocolFacts.publicGoodsPercentage}% 之外，金库也直接接受自愿 ETH 贡献。机械转拨定下底线；有心多出一份力的人，不必等待任何一次收官。`,
    referenceLabel: '白皮书 §10 · 公共物品',
  },
  'risk-honesty': {
    prompt: '下列哪一条是白皮书自己的风险章节所承认的？',
    options: {
      a: '审查与形式化分析都不构成保证——任何持有价值的软件都可能存在未知缺陷。',
      b: '合约已被数学证明不含任何缺陷。',
      c: '风险只存在到 V3 升级上线为止。',
      d: '唯一真正的风险是以太坊本身失败。',
    },
    explanation:
      '风险因素毫不粉饰：智能合约风险在每一轮审查之后依然存在；随机性有明说的边界；期限是真实的截止时间；去中心化完成之前，参数仍可能在周期间调整；资产价值会波动。应把落笔当作为参与和艺术付出的花费——这是白皮书自己的措辞。',
    referenceLabel: '白皮书 §14.2 · 风险因素',
  },
} as const satisfies QuizTierQuestionsText<'hard'>;
