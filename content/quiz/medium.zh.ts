import { protocolFacts } from '@/content/protocol-facts';

import type { QuizQuestion } from './types';

const cst = (amount: number): string => amount.toLocaleString('zh-CN');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * 进阶层：运转中的机制。校准窗口、CST 反馈回路、坚守轨道、星选算术与议会
 * 参数。题目 id、选项 id 与正确答案与英文版一一对应。
 */
export const mediumQuestionsZh: readonly QuizQuestion[] = [
  {
    id: 'eth-opening-price-discovery',
    prompt: '新周期如何找到自己的开场 ETH 落笔价格？',
    options: [
      {
        id: 'a',
        text: `ETH 校准窗口从上一周期开场实付价格的 ${protocolFacts.ethCalibrationCeilingMultiplier} 倍起步，线性下行至其两百分之一加 1 wei 的底价。`,
      },
      { id: 'b', text: `每个周期都固定以 ${protocolFacts.initialGestureCostEth} ETH 开场。` },
      { id: 'c', text: '每个周期的开场价格由宇宙议会表决决定。' },
      { id: 'd', text: '价格每小时翻倍，直到有人落笔。' },
    ],
    correctOptionId: 'a',
    explanation: `这是不依赖订单簿的价格发现：上一周期若开得太便宜，翻倍先恢复上行空间；翻倍后若显得偏高，缓慢下行总会停在有人愿意开场的位置。只有第一个周期使用了固定的 ${protocolFacts.initialGestureCostEth} ETH——此后每个周期都从前一个周期校准而来。`,
    reference: {
      label: '白皮书 §3.1 · 开场与 ETH 校准窗口',
      href: '/white-paper#eth-calibration-window',
    },
  },
  {
    id: 'eth-step-up',
    prompt: 'Pax 落下一笔 ETH 落笔。下一笔 ETH 落笔的价格会怎样？',
    options: [
      {
        id: 'a',
        text: `上调 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei——这条序列公开而精确。`,
      },
      { id: 'b', text: '翻倍。' },
      { id: 'c', text: '在周期收官前保持不变。' },
      { id: 'd', text: `下调 ${protocolFacts.ethGestureCostStepUpPercent}%，以吸引更多落笔。` },
    ],
    correctOptionId: 'a',
    explanation: `开场之后，每笔 ETH 落笔都会把下一笔的价格抬高 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei，价格永远向上。落笔前随时可以从合约读到当前价格——没有意外，只有一段不断上行的阶梯。`,
    funFact: '那 1 wei 并非可有可无：当价格小到百分比部分四舍五入为零时，它保证价格仍严格增长。',
    reference: { label: '白皮书 §4.1 · ETH 落笔', href: '/white-paper#eth-gestures' },
  },
  {
    id: 'overpay-refund',
    prompt: 'Vega 不小心多付了明显超出当前落笔价格的 ETH。多出的部分怎么办？',
    options: [
      { id: 'a', text: '在同一笔交易中退回给她。' },
      { id: 'b', text: '无论金额多少，都留给储备。' },
      { id: 'c', text: '记入她的下一笔落笔。' },
      { id: 'd', text: '转拨给公共物品。' },
    ],
    correctOptionId: 'a',
    explanation:
      '超出灰尘阈值的超付会在同一笔交易中退回；只有当退款连 gas 都不够抵时，差额才留在储备中——这是一条为你省钱的分界线，不是罚则。',
    reference: { label: '白皮书 §4.1 · ETH 落笔', href: '/white-paper#eth-gestures' },
  },
  {
    id: 'cst-window-restart',
    prompt: 'Lyra 落下一笔 CST 落笔。这对 CST 校准窗口意味着什么？',
    options: [
      {
        id: 'a',
        text: `窗口以她刚付价格的 ${protocolFacts.cstCalibrationCeilingMultiplier} 倍重启——起始价不低于 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST——随后再次线性降至零。`,
      },
      { id: 'b', text: '没有影响——窗口继续原来的下行。' },
      {
        id: 'c',
        text: `价格锁定在 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST，直到周期结束。`,
      },
      { id: 'd', text: '窗口关闭，CST 落笔暂停到下一周期。' },
    ],
    correctOptionId: 'a',
    explanation: `每笔 CST 落笔都会以新的起始价重启窗口：上一笔实付价格的 ${protocolFacts.cstCalibrationCeilingMultiplier} 倍，且起始价不低于 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST。此后价格在窗口时长内线性降至零。沿途支付的 CST 全数销毁。`,
    reference: { label: '白皮书 §4.3 · CST 落笔', href: '/white-paper#cst-gestures' },
  },
  {
    id: 'cst-free-quiet',
    prompt: '协议沉寂了很久，CST 校准窗口已经走完。现在的事实是什么？',
    options: [
      {
        id: 'a',
        text: '一笔 CST 落笔近乎免费——任何持有一点 CST 的人都能延续周期。',
      },
      { id: 'b', text: '周期自动完成收官。' },
      { id: 'c', text: '在 ETH 落笔到来之前，CST 落笔被禁用。' },
      { id: 'd', text: 'CST 价格已升至上限。' },
    ],
    correctOptionId: 'a',
    explanation:
      '价格能降到零，而且是有意为之：只要有人持有哪怕一点 CST，周期就总能延续。周期从不自行收官——收官永远是某个人发出的一笔交易。',
    reference: { label: '白皮书 §4.3 · CST 落笔', href: '/white-paper#cst-gestures' },
  },
  {
    id: 'window-feedback-loop',
    prompt: '一阵密集的 ETH 落笔扫过周期。这对 CST 校准窗口的时长意味着什么？',
    options: [
      {
        id: 'a',
        text: `每笔 ETH 落笔使其缩短约 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，CST 价格降得更快，CST 落笔更早变得划算。`,
      },
      {
        id: 'b',
        text: `每笔 ETH 落笔使其延长约 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%，CST 下行随之放慢。`,
      },
      { id: 'c', text: '毫无影响——两种货币互不相干。' },
      { id: 'd', text: '窗口重置回初始时长。' },
    ],
    correctOptionId: 'a',
    explanation: `窗口时长是链上的活参数，也是协议里一条安静的反馈回路：每笔 ETH 落笔使其缩短约 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，每笔 CST 落笔使其延长约 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。ETH 越密集，CST 降得越快；CST 多了，下行又放慢——回路把每个周期推向两种货币的均衡组合。`,
    reference: { label: '白皮书 §4.3 · CST 落笔', href: '/white-paper#cst-gestures' },
  },
  {
    id: 'participation-cst-timing',
    prompt:
      '按上线参数，两笔落笔分别铭刻参与 CST：一笔落在上一笔之后 1 秒，另一笔终结了一整天的沉默。两者大约各铭刻多少？',
    options: [
      {
        id: 'a',
        text: `约 ${oneSecondExample.cst} CST 与约 ${oneDayExample.cst} CST——数量随经过时间的平方根增长。`,
      },
      { id: 'b', text: `每笔固定 ${cst(100)} CST，与时机无关。` },
      { id: 'c', text: '两笔相同——时机从不重要。' },
      { id: 'd', text: '都是零——只有收官才铭刻 CST。' },
    ],
    correctOptionId: 'a',
    explanation: `参与 CST 随距上一笔时间的平方根增长：一秒后跟进的一笔几乎什么也铭刻不到（约 ${oneSecondExample.cst} CST），终结一整天沉默的一笔能铭刻数百（约 ${oneDayExample.cst} CST）。每笔固定 ${cst(100)} CST 正是最初的 V1 规则——它让机器速度的连续落笔凭空生成 CST，V2 因此将其替换。`,
    funFact: '耐心是铭刻可观 CST 的唯一方式。每秒落一笔的机器人，铭刻量约等于零。',
    reference: { label: '白皮书 §7.1 · 铭刻规则', href: '/white-paper#imprint-rules' },
  },
  {
    id: 'cst-max-cost-protection',
    prompt: '提交 CST 落笔时，是什么保护 Kestrel 在交易落地偏晚时不至于多花？',
    options: [
      { id: 'a', text: '她指定可接受的最高价格；这一笔花费绝不会超过授权。' },
      { id: 'b', text: '没有保护——执行时是什么价就付什么价。' },
      { id: 'c', text: '宇宙议会会在周期结束后退还多收部分。' },
      { id: 'd', text: 'CST 价格在签名与执行之间从不变化。' },
    ],
    correctOptionId: 'a',
    explanation:
      '提交 CST 落笔时需指定可接受的最高价格，交易落地晚于预期也不会多花一分。它在另一笔 CST 落笔刚刚以更高起始价重启窗口时最有价值。',
    reference: { label: '白皮书 §4.3 · CST 落笔', href: '/white-paper#cst-gestures' },
  },
  {
    id: 'endurance-definition',
    prompt:
      'Ari 在一个慵懒的午后落下一笔，十个小时无人打破——这是本周期最长的静默间隔。他有望摘得哪个头衔？',
    options: [
      {
        id: 'a',
        text: '坚守冠军——他以最近落笔者的身份坚守了最长的连续间隔。',
      },
      { id: 'b', text: '时之勇士——他把一个头衔保持了最久。' },
      { id: 'c', text: '都不是；头衔取决于落笔次数。' },
      { id: 'd', text: '自动成为收官之笔。' },
    ],
    correctOptionId: 'a',
    explanation:
      '坚守冠军是以最近落笔者身份坚守最久的参与者——单笔落笔撑过的最长静默间隔。时之勇士再上一层，衡量的是另一回事：坚守冠军这个头衔本身被保持了多久。',
    reference: {
      label: '白皮书 §5.2 · 坚守冠军与时之勇士',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'chrono-definition',
    prompt: '上一题里 Ari 的十小时纪录又保持了两天才被 Bea 刷新。时之勇士衡量的究竟是什么？',
    options: [
      {
        id: 'a',
        text: '谁连续在位坚守冠军最久——Ari 保持纪录的那两天都算在他头上。',
      },
      { id: 'b', text: '谁在他人落笔后反应最快。' },
      { id: 'c', text: '谁总共参与的周期最多。' },
      { id: 'd', text: '谁落下本周期的收官之笔。' },
    ],
    correctOptionId: 'a',
    explanation:
      '坚守衡量你创造的间隔，时之勇士衡量纪录存活的时长。Ari 的坚守间隔是十小时，但他以坚守冠军身份在位了两天——时之勇士轨道计量的正是这段在位。两者都要到收官那一刻才尘埃落定。',
    reference: {
      label: '白皮书 §5.2 · 坚守冠军与时之勇士',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'eth-selection-count',
    prompt: '收官时，ETH 星选如何发放它的份额？',
    options: [
      {
        id: 'a',
        text: `从本周期落笔资格池中选出 ${protocolFacts.ethStellarSelectionRecipients} 次，均分储备的 ${protocolFacts.stellarSelectionEthPercentage}%。`,
      },
      {
        id: 'b',
        text: `选出 ${protocolFacts.nftStellarSelectionRecipients} 次，每次都发放 ETH 和一枚 NFT。`,
      },
      { id: 'c', text: '只选出一次，独得全部份额。' },
      { id: 'd', text: '每位参与者平分。' },
    ],
    correctOptionId: 'a',
    explanation: `ETH 星选选出 ${protocolFacts.ethStellarSelectionRecipients} 次资格，均分储备的 ${protocolFacts.stellarSelectionEthPercentage}%。${protocolFacts.nftStellarSelectionRecipients} 次是另一条轨道——参与者 NFT 星选的数字，它发放的是 CST 与 NFT，不含 ETH。`,
    reference: { label: '白皮书 §5.3 · 星选', href: '/white-paper#stellar-selections' },
  },
  {
    id: 'nft-selection-count',
    prompt: '参与者 NFT 星选每次发放什么？共选出多少次？',
    options: [
      {
        id: 'a',
        text: `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 Cosmic Signature NFT，从落笔资格池中共选出 ${protocolFacts.nftStellarSelectionRecipients} 次。`,
      },
      {
        id: 'b',
        text: `一份 ETH 份额，共选出 ${protocolFacts.ethStellarSelectionRecipients} 次。`,
      },
      { id: 'c', text: `${cst(protocolFacts.outreachReserveCst)} CST，只选出一次。` },
      { id: 'd', text: `只有 NFT，共选出 ${protocolFacts.typicalNftsPerCycle} 次。` },
    ],
    correctOptionId: 'a',
    explanation: `参与者 NFT 星选选出 ${protocolFacts.nftStellarSelectionRecipients} 次，每次携带 ${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT。表彰 CST 总是与 NFT 同行——收官时的每份 NFT 发放都是这样成对出现的。`,
    reference: {
      label: '白皮书 §5.1 · 收官时的发放',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'draws-with-replacement',
    prompt: '同一位参与者可能在一个周期的星选中被选中多次吗？',
    options: [
      { id: 'a', text: '可能——选择采用放回方式，资格随落笔累积。' },
      { id: 'b', text: '不可能——每位参与者至多被选中一次。' },
      { id: 'c', text: '只有落笔十次以上的参与者才可能重复。' },
      { id: 'd', text: '需经宇宙议会批准方可重复。' },
    ],
    correctOptionId: 'a',
    explanation:
      '选择采用放回方式，同一参与者可能被选中多次。每笔落笔计入一次资格，入选频次与参与程度成正比——机制随活跃度伸缩，而不是每个地址限选一次。',
    reference: { label: '白皮书 §5.3 · 星选', href: '/white-paper#stellar-selections' },
  },
  {
    id: 'anchored-rwlk-track',
    prompt: '已锚定的 Random Walk NFT 能从周期中得到什么？',
    options: [
      {
        id: 'a',
        text: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 次选出，每次 ${cst(protocolFacts.specialAllocationCst)} CST 加一枚 Cosmic Signature NFT，权重按锚定数量计——不含 ETH。`,
      },
      {
        id: 'b',
        text: `按比例分摊 ${protocolFacts.anchorDistributionPercentage}% 的 ETH 锚定派发。`,
      },
      { id: 'c', text: '什么也没有——只有 Cosmic Signature NFT 才能锚定。' },
      { id: 'd', text: '解锚时的一次性 CST 发放。' },
    ],
    correctOptionId: 'a',
    explanation: `Random Walk NFT 的锚定自成一线，目的也不同：它们参与锚定 NFT 星选，每周期 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，每次携带 CST 与一枚 Cosmic Signature NFT。ETH 锚定派发专属于已锚定的 Cosmic Signature NFT——Random Walk 锚定不含 ETH。`,
    reference: { label: '白皮书 §8 · 锚定', href: '/white-paper#anchoring' },
  },
  {
    id: 'exclusivity-window',
    prompt: '收官之笔参与者的专属收官权持续多久？',
    options: [
      { id: 'a', text: `${protocolFacts.finalGestureExclusivityHours} 小时` },
      { id: 'b', text: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时` },
      { id: 'c', text: `${protocolFacts.initialCycleTimeIncrementHours} 小时` },
      { id: 'd', text: `${protocolFacts.initialCstCalibrationWindowHours} 小时` },
    ],
    correctOptionId: 'a',
    explanation: `专属窗口为 ${protocolFacts.finalGestureExclusivityHours} 小时；窗口过后，任何人都可收官并接过受益方角色。${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时是开场落笔之后的初始倒计时——完全是另一座时钟。`,
    funFact: `V1 只给收官之笔参与者 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时的专属期。线上周期证明人真的会睡过截止时间，V2 于是把它翻倍。`,
    reference: { label: '白皮书 §3.3 · 收官与公开收官窗口', href: '/white-paper#finalization' },
  },
  {
    id: 'escrow-timeout',
    prompt: 'Juno 在 ETH 星选中被选中，却一直没有取回托管中的 ETH。期限过后会怎样？',
    options: [
      {
        id: 'a',
        text: `${protocolFacts.secondaryRetrievalTimeoutWeeks} 周之后，任何人都可以为自己取回这份未取回的分配。`,
      },
      { id: 'b', text: '它回到周期储备。' },
      { id: 'c', text: '它被销毁。' },
      { id: 'd', text: '它无限期留在托管中等待 Juno。' },
    ],
    correctOptionId: 'a',
    explanation: `托管中的分配与附加资产会等待 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周；期限一过，合约允许任何人为自己取回仍未取回的分配。这条规则与公开收官窗口一脉相承：每份发放终会到达想要它的人手中。请及时取回。`,
    reference: {
      label: '白皮书 §5.4 · 发放、托管与期限',
      href: '/white-paper#delivery-and-timeouts',
    },
  },
  {
    id: 'push-vs-pull',
    prompt: '收官时哪些 ETH 直接送达，哪些进入托管？',
    options: [
      {
        id: 'a',
        text: '签名分配与公共物品转拨直接送达；时之勇士的 ETH 与 ETH 星选份额存入分配钱包托管。',
      },
      { id: 'b', text: '全部直接发送给每位获配者。' },
      { id: 'c', text: '全部进入托管，包括受益方的份额。' },
      { id: 'd', text: '只有 CST 进入托管；ETH 全部直接送达。' },
    ],
    correctOptionId: 'a',
    explanation:
      '发放刻意分成主动送达与自行取回两类：受益方的 ETH 与公共物品转拨在收官时送达，次级 ETH 分配存入分配钱包由获配者自行取回。CST 与 NFT 则直接铭刻到各自获配者名下。',
    reference: {
      label: '白皮书 §5.4 · 发放、托管与期限',
      href: '/white-paper#delivery-and-timeouts',
    },
  },
  {
    id: 'council-proposal-threshold',
    prompt: '一个地址需要多少委托 CST 权重才能提交协调提案？',
    options: [
      { id: 'a', text: `至少 ${protocolFacts.councilProposalThresholdCst} CST。` },
      { id: 'b', text: `至少 ${cst(protocolFacts.specialAllocationCst)} CST。` },
      { id: 'c', text: `至少 ${cst(protocolFacts.outreachReserveCst)} CST。` },
      { id: 'd', text: '任意数量——没有门槛。' },
    ],
    correctOptionId: 'a',
    explanation: `提案门槛是 ${protocolFacts.councilProposalThresholdCst} CST 的委托权重——刻意设得不高，让提案保持人人可及。${cst(protocolFacts.specialAllocationCst)} CST 是随每份 NFT 发放的表彰 CST，是一个容易混淆的另一常量。`,
    reference: { label: '白皮书 §9 · 宇宙议会', href: '/white-paper#cosmic-council' },
  },
  {
    id: 'council-timeline',
    prompt: '一份协调提案在今天提交。接下来的时间线是什么？',
    options: [
      {
        id: 'a',
        text: `先经过 ${protocolFacts.councilVotingDelayDays} 天协调延迟，再进入 ${protocolFacts.councilVotingPeriodWeeks} 周的协调期。`,
      },
      { id: 'b', text: '只要提案者持有足够 CST，立即生效。' },
      {
        id: 'c',
        text: `先等 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周，再进入 ${protocolFacts.councilVotingDelayDays} 天的协调期。`,
      },
      {
        id: 'd',
        text: `${protocolFacts.finalGestureExclusivityHours} 小时延迟后自动执行。`,
      },
    ],
    correctOptionId: 'a',
    explanation: `提案先经过 ${protocolFacts.councilVotingDelayDays} 天协调延迟，再进入 ${protocolFacts.councilVotingPeriodWeeks} 周的协调期。延迟给了持有者在快照前调整委托的时间；没有任何提案会立即生效。`,
    reference: { label: '白皮书 §9 · 宇宙议会', href: '/white-paper#cosmic-council' },
  },
  {
    id: 'quorum-rule',
    prompt: '协调提案何时通过？',
    options: [
      {
        id: 'a',
        text: `支持权重高于反对权重，且支持与弃权权重之和达到 ${protocolFacts.councilQuorumPercent}% 的协调法定权重。`,
      },
      { id: 'b', text: '仅支持权重达到总供应量的一半即可。' },
      {
        id: 'c',
        text: `支持、反对与弃权合计达到 ${protocolFacts.councilQuorumPercent}% 即可。`,
      },
      { id: 'd', text: '需协议所有者会签结果。' },
    ],
    correctOptionId: 'a',
    explanation: `两个条件须同时成立：支持权重高于反对权重，且支持与弃权之和达到 CST 总供应量 ${protocolFacts.councilQuorumPercent}% 的协调法定权重。反对权重刻意不计入法定权重——反对一份提案，绝不会反而帮它凑够门槛。`,
    reference: { label: '白皮书 §9 · 宇宙议会', href: '/white-paper#cosmic-council' },
  },
  {
    id: 'weight-activation',
    prompt: 'Rook 钱包里有 CST，却从未碰过议会。他的 CST 表达多少协调权重？',
    options: [
      { id: 'a', text: '零——权重只在完成委托后生效，委托给自己或其他地址都可以。' },
      { id: 'b', text: '每枚 CST 自动表达一个单位。' },
      { id: 'c', text: '取决于他持有 CST 的时长。' },
      { id: 'd', text: '权重来自已锚定的 NFT，而非 CST。' },
    ],
    correctOptionId: 'a',
    explanation:
      '协调权重在委托后生效：持有者把权重委托给自己或其他地址，此后每枚 CST 表达一个单位。未委托的 CST 不携带任何权重——仅仅持有，并不构成对协调的参与。',
    reference: { label: '白皮书 §7.3 · 协调权重', href: '/white-paper#coordination-weight' },
  },
  {
    id: 'time-increment-growth',
    prompt: '每笔落笔所加的时间增量上线时恰为一小时。它如何演变？',
    options: [
      {
        id: 'a',
        text: `每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，周期因此逐年变长。`,
      },
      { id: 'b', text: '永远固定在一小时。' },
      { id: 'c', text: '每个周期翻倍。' },
      { id: 'd', text: '参与者越多，它越短。' },
    ],
    correctOptionId: 'a',
    explanation: `增量在每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。复利安静地做着自己的工作：周期变长，NFT 的铭刻节奏放缓，协议的节拍随岁月刻意舒展。`,
    reference: { label: '白皮书 §3.2 · 收官倒计时', href: '/white-paper#countdown' },
  },
  {
    id: 'typical-cst-fixed',
    prompt: '典型周期铭刻多少固定 CST？如何构成？',
    options: [
      {
        id: 'a',
        text: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST——${protocolFacts.typicalNftsPerCycle} 份 NFT 发放各伴随 ${cst(protocolFacts.specialAllocationCst)} CST，另有 ${cst(protocolFacts.outreachReserveCst)} CST 进入推广储备。`,
      },
      {
        id: 'b',
        text: `${cst(protocolFacts.specialAllocationCst)} CST，全部归周期受益方。`,
      },
      { id: 'c', text: `${cst(protocolFacts.outreachReserveCst)} CST，全部用于社区推广。` },
      { id: 'd', text: '每个周期都无法预测。' },
    ],
    correctOptionId: 'a',
    explanation: `固定流精确可数：${protocolFacts.typicalNftsPerCycle} 份与 NFT 成对的 ${cst(protocolFacts.specialAllocationCst)} CST 铭刻，加上 ${cst(protocolFacts.outreachReserveCst)} CST 推广储备，典型周期合计 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST。各笔落笔沿途铭刻的动态参与 CST 另计，取决于时机。`,
    reference: { label: '白皮书 §7.1 · 铭刻规则', href: '/white-paper#imprint-rules' },
  },
  {
    id: 'attached-assets-destination',
    prompt: 'Wren 在落笔时附加了一种 ERC-20 代币。附加资产去了哪里？',
    options: [
      {
        id: 'a',
        text: '进入分配钱包托管——周期收官后，受益方享有优先取回权。',
      },
      { id: 'b', text: '与落笔的 ETH 一道汇入周期储备。' },
      { id: 'c', text: '周期收官时退回给 Wren。' },
      { id: 'd', text: '收官时被销毁。' },
    ],
    correctOptionId: 'a',
    explanation:
      '附加资产从不进入 ETH 储备。它们由分配钱包托管，周期收官后受益方享有优先取回权——并与其他托管分配一样，受同一公开取回期限约束。',
    reference: {
      label: '白皮书 §4.4 · 消息与附加资产',
      href: '/white-paper#messages-and-attachments',
    },
  },
  {
    id: 'next-cycle-delay',
    prompt: '一个周期刚刚完成收官。下一个周期何时启用？',
    options: [
      {
        id: 'a',
        text: `经过一段短暂延迟——默认 ${protocolFacts.defaultNextCycleDelayMinutes} 分钟，但以链上实时数值为准，且该数值可调整。`,
      },
      { id: 'b', text: '同一笔交易内立即启用。' },
      { id: 'c', text: `正好 ${protocolFacts.finalGestureExclusivityHours} 小时之后。` },
      { id: 'd', text: '只有所有者手动开启后才启用。' },
    ],
    correctOptionId: 'a',
    explanation: `收官之后，下一周期经过一段短暂延迟启用，默认 ${protocolFacts.defaultNextCycleDelayMinutes} 分钟。实时延迟存储在链上、可由所有者调整，因此最终依据是合约而非默认值。周期一旦启用，新的校准窗口随之开启。`,
    reference: { label: '白皮书 §3.3 · 收官与公开收官窗口', href: '/white-paper#finalization' },
  },
];
