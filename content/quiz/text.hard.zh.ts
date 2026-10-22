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
      '核心合约向金库转入失败时，会记录失败并可将该份额留在储备中，不必回退整个收官；没有自动重试。已在金库的 ETH 仍需另一笔无需许可的交易转出。其他必需转账失败仍可能导致收官回退。',
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
    prompt: '已部署的 V3 改动了哪些机制？',
    options: {
      a: '参与 CST 的公式与收取对象、参与者星选权重、CST 下降速率、临近收官溢价，以及分配比例与主 NFT 数量。',
      b: '艺术管线换用新的渲染器。',
      c: '移除 CST 落笔。',
      d: '只有分配比例改变，其他机制完全不变。',
    },
    explanation:
      'V3 已部署：参与 CST 改为下一笔向上一笔参与者线性发放；参与者星选采用基础价格权重，并引入下降速率调整、临近收官溢价及新的分配配置。',
    referenceLabel: '白皮书 §12.3 · 已部署的 V3',
  },
  'v3-shape': {
    prompt: 'V3 临近收官溢价为何采用八次方曲线？',
    options: {
      a: '让涨幅集中在窗口后段，当前参数下最终总价最高约为基础价格的 5 倍。',
      b: '它让溢价在整个窗口内线性上升。',
      c: '整个窗口从一开始就统一使用最高总价。',
      d: '它只影响 CST 落笔。',
    },
    explanation:
      '溢价在当前时间增量的最后三分之一内逐步增加，八次方将大部分涨幅集中到接近截止时。实际计算包含整数截断，当前最大溢价约为基础价格的 4 倍，加上基础价格后总计约 5 倍。',
    referenceLabel: '白皮书 §12.3 · 已部署的 V3',
  },
  'v3-overtime': {
    prompt: 'V3 之下，Zed 等到截止时间过后才在超时阶段落笔。适用什么溢价？',
    options: {
      a: '保持截止时的封顶溢价，当前参数下总价约为基础价格的 5 倍；零 CST 基础价格仍为零。',
      b: '没有溢价——超时落笔回到 1 倍。',
      c: '超过截止时间后，价格继续无限增长。',
      d: 'V3 之下超时落笔被完全禁止。',
    },
    explanation:
      '截止时间之后，溢价保持封顶值。落笔仍可执行，并把当前增量加到旧的收官时间，而非从现在重新计时；延长后时间仍可能已经过期。',
    referenceLabel: '白皮书 §12.3 · 已部署的 V3',
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
    prompt: 'V3 是否会自动移交或移除所有者权限？',
    options: {
      a: '不会。每个所有者角色都需要单独执行链上移交或放弃操作，没有自动期限。',
      b: '首个 V3 周期结束后，所有权限自动消失。',
      c: '出售给权重最高的议会委托人。',
      d: '永久移交给一个公司多签。',
    },
    explanation:
      '所有者权限目前仍保留。移交宇宙议会或放弃所有权都必须分别通过链上交易完成；合约没有自动执行的时间表。',
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
      a: '推广储备按配置接收 CST；当前 ETH 分配没有单列团队份额。',
      b: '每笔落笔中的一小部分 ETH。',
      c: '每第十个周期的签名分配。',
      d: '什么都没有，包括 CST。',
    },
    explanation:
      '当前 ETH 分配没有单列团队份额。推广储备的 CST 由任命的托管人发放；团队关联地址仍可按同样规则参与。没有单列 ETH 份额不代表没有管理权限，也不保证任何财务结果。',
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
      a: '按配置模拟候选轨道，由 Borda 排序形成短名单，再通过图像层面的审美检查。',
      b: '用第一条随机生成的轨道，原样上阵。',
      c: '由团队逐周期人工挑选。',
      d: '铭刻后由 NFT 持有者表决选定。',
    },
    explanation:
      '默认配置模拟十万组候选轨道，每组推进一百万步，再结合排名和图像层面的检查筛选。复现须固定渲染器版本与配置；这些默认值并非不可变的合约参数。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-color': {
    prompt: '三个天体的色彩如何确定？',
    options: {
      a: '连续的感知调色方案改变色相与其他属性，不固定为等间隔色相。',
      b: '每幅签名固定使用红、绿、蓝三色。',
      c: '从真实星云照片中取样。',
      d: '铭刻时由 NFT 的第一位所有者挑选。',
    },
    explanation: '连续的 OKLCh 感知调色方案改变色相与其他色彩属性，不将三个天体固定为等间隔色相。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-spectral': {
    prompt: '轨迹为何呈现出那样的质感？',
    options: {
      a: '光谱渲染：从 380 至 700 纳米划分 64 个波长区间，以随速度变化的线宽和景深渲染轨迹。',
      b: '加了辉光滤镜的扁平矢量笔画。',
      c: '物理模拟器的截图，再交给 AI 放大。',
      d: '在模拟之上手工调校的样条曲线。',
    },
    explanation:
      '渲染器使用光谱波长区间、随速度变化的轨迹和景深，并作色调映射、辉光与色彩调整。这些属于渲染器设置；链上保存的是种子，不是成品像素。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-output': {
    prompt: '管线为每枚 NFT 输出什么文件？',
    options: {
      a: '按渲染器配置生成高分辨率图像与动画。',
      b: '只有一张 JPEG 缩略图。',
      c: '一张动态 GIF。',
      d: '一个 SVG 矢量文件。',
    },
    explanation:
      '图像和视频的格式、分辨率与时长由渲染器配置决定。复现需要链上种子、对应版本、配置与兼容工具链；这些输出选项不是不可变的合约参数。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'art-server-death': {
    prompt: '与项目相关的所有服务器明天全部消失。作品会怎样？',
    options: {
      a: '链上种子仍可取得；配合对应渲染器版本、配置和兼容工具链，可重新生成作品。',
      b: '艺术丢失；只有元数据幸存。',
      c: '只有钱包里的缩略图幸存。',
      d: '取决于 IPFS 固定是否有人维护。',
    },
    explanation:
      '链上种子提供可核验的生成起点。配合对应的渲染器版本、配置与兼容工具链，任何人都可尝试重新生成作品。种子本身不保证跨版本、跨机器逐像素一致，也不保证托管图像与视频的服务始终可用。',
    funFact:
      '仓库提供手动执行的参考图像检查。复现需固定种子、渲染器版本、配置与兼容工具链；当前持续集成并不比较生成帧的哈希。',
    referenceLabel: '白皮书 §6.2 · 可复现性与许可',
  },
  'art-naming': {
    prompt: '所有者对自己的 Cosmic Signature NFT 有哪些自定义空间？',
    options: {
      a: '可在链上记录最长 32 字节的名称，但不改变已记录的种子。',
      b: '可以重掷一次种子。',
      c: '可以调整配色。',
      d: '可以延长视频时长。',
    },
    explanation:
      '命名操作记录文本，不改变链上种子。NFT 元数据的位置仍受合约所有者权限控制；显示的媒体内容与链上种子是不同事项。',
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
      a: '合约在铭刻时派生并记录 32 字节种子，渲染器再结合其版本与配置使用该种子。',
      b: '收官前由艺术家为每枚 NFT 上传种子。',
      c: '种子就是所有者的钱包地址。',
      d: '每次渲染都会重新取一个种子。',
    },
    explanation:
      '链上种子提供可核验的生成起点。配合对应的渲染器版本、配置与兼容工具链，任何人都可尝试重新生成作品。种子本身不保证跨版本、跨机器逐像素一致，也不保证托管图像与视频的服务始终可用。',
    referenceLabel: '白皮书 §6.1 · 渲染管线',
  },
  'hacken-findings': {
    prompt: 'Hacken 对合约的独立安全审查结论是什么？',
    options: {
      a: '共 23 项发现：无严重级，无高危级，中危 3 项、低危 8 项、信息级 12 项——多数是附书面理由接受的设计取舍。',
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
      a: '14 项系统不变量——例如协议持有的 ETH 总额必须始终等于存入减去发放——全部在 10,000 次运行中保持成立。',
      b: '常见交易的 gas 消耗。',
      c: '艺术管线的确定性。',
      d: '前端渲染性能。',
    },
    explanation:
      '模糊测试用生成的输入反复冲击系统，同时断言必须永远成立的性质。Hacken 形式化了 14 项这样的不变量，全部在 10,000 次运行中保持成立——这与逐行审查是两种不同的证据，专门瞄准没有人想到要试的状态。',
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
      a: '需逐个核对当前实现的验证记录；V3 尚未在 Sourcify 验证，旧版本的完全匹配不能证明新实现。',
      b: '源码验证可以保证每一版实现都绝对安全。',
      c: 'V2 的源码匹配会自动验证 V3。',
      d: '只在测试网上验证过，主网没有。',
    },
    explanation:
      '代理与实现是不同地址。当前实现可从代理的 EIP-1967 槽位读取；验证记录也必须对应该实现。源码匹配只说明字节码与提交源码相符，并不等于独立安全审计。',
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
      a: '全部签名分配：ETH 份额、一次固定 CST 数额、当前 V3 的三枚连续编号 NFT，以及附加资产受益权。',
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
    prompt: '本周期 Bea 落笔 30 次，Cal 落笔 3 次。关于 ETH 星选，下列哪项为真？',
    options: {
      a: '相对比例由累计的无溢价 ETH 基础价格权重决定，落笔次数本身不能证明十比一。',
      b: 'Bea 保底至少被选中一次。',
      c: 'Cal 被排除在外；只有头部参与者才有资格。',
      d: '两人机会完全相同——每个地址一次资格。',
    },
    explanation:
      '参与者 ETH 与 NFT 星选都按未减免、未含溢价的 ETH 基础价格加权；CST 落笔采用当时的 ETH 基础价格。不同落笔的权重可不同，选择可以重复，也不保证任何地址获配。',
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
    explanation:
      '参与 CST 在下一笔执行时向上一笔参与者铭刻；表彰 CST 在收官时按轨道发放，签名分配的三枚 NFT 合计仅对应一次 1,000 CST；推广储备另获每周期 3,000 CST。三条路径的时间、收取对象与条件各不相同。',
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
      '收官会计算配置的 ETH 份额、发放或登记各条轨道、铭刻 NFT 与固定 CST，并安排下一周期。公共物品仅先进入金库，向受益方转出需要另一次交易；该轨道特定的转账失败可被容忍。收官不结算最后一笔之后的动态参与 CST。',
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
