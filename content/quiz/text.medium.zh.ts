import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('zh-CN');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * 进阶层文案：运转中的机制。校准窗口、CST 反馈回路、坚守轨道、星选算术与
 * 议会参数。键为 structure.ts 中的骨架题目 id。
 */
export const mediumQuestionsTextZh = {
  'eth-opening-price-discovery': {
    prompt: '新周期如何找到自己的开场 ETH 落笔价格？',
    options: {
      a: '从上一周期开场时未减免、未含溢价的 ETH 基础价格的两倍起步，线性下降到上限除以 200 后取整再加 1 wei。',
      b: `每个周期都固定以 ${protocolFacts.initialGestureCostEth} ETH 开场。`,
      c: '每个周期的开场价格由宇宙议会表决决定。',
      d: '价格每小时翻倍，直到有人落笔。',
    },
    explanation: `这是不依赖订单簿的价格发现：上一周期若开得太便宜，翻倍先恢复上行空间；翻倍后若显得偏高，缓慢下行总会停在有人愿意开场的位置。只有第一个周期使用了固定的 ${protocolFacts.initialGestureCostEth} ETH——此后每个周期都从前一个周期校准而来。`,
    referenceLabel: '白皮书 §3.1 · 开场与 ETH 校准窗口',
  },
  'eth-step-up': {
    prompt: 'Pax 以 ETH 落笔后，下一笔不含溢价的 ETH 基础价格如何变化？',
    options: {
      a: `上调 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei——这条序列公开而精确。`,
      b: '翻倍。',
      c: '在周期收官前保持不变。',
      d: `下调 ${protocolFacts.ethGestureCostStepUpPercent}%，以吸引更多落笔。`,
    },
    explanation:
      '每笔 ETH 落笔将下一笔基础价格设为当前基础价格加其百分之一的整数部分，再加 1 wei。临近收官溢价单独计算，不计入这条基础价格序列，因此最终报价不一定只会上升。',
    funFact: '那 1 wei 并非可有可无：当价格小到百分比部分四舍五入为零时，它保证价格仍严格增长。',
    referenceLabel: '白皮书 §4.1 · ETH 落笔',
  },
  'overpay-refund': {
    prompt: 'Vega 不小心多付了明显超出当前落笔价格的 ETH。多出的部分怎么办？',
    options: {
      a: '在同一笔交易中退回给她。',
      b: '无论金额多少，都留给储备。',
      c: '记入她的下一笔落笔。',
      d: '转拨给公共物品。',
    },
    explanation:
      '超出灰尘阈值的超付会在同一笔交易中退回；只有当退款连 gas 都不够抵时，差额才留在储备中——这是一条为你省钱的分界线，不是罚则。',
    referenceLabel: '白皮书 §4.1 · ETH 落笔',
  },
  'cst-window-restart': {
    prompt: 'Lyra 落下一笔 CST 落笔。这对 CST 校准窗口意味着什么？',
    options: {
      a: '以不含溢价的基础花费两倍、配置下限与新下降速率乘以 180 秒三者最大值，重设窗口上限。',
      b: '没有影响——窗口继续原来的下行。',
      c: `价格锁定在 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST，直到周期结束。`,
      d: '窗口关闭，CST 落笔暂停到下一周期。',
    },
    explanation:
      'CST 基础价格随时间下降。CST 落笔后，上限重设为不含溢价的基础花费两倍、配置下限及新下降速率乘以 180 秒三者中的最大值。临近收官溢价另计，并可能使最终价格上升。',
    referenceLabel: '白皮书 §4.3 · CST 落笔',
  },
  'cst-free-quiet': {
    prompt: '协议沉寂了很久，CST 校准窗口已经走完。现在的事实是什么？',
    options: {
      a: 'CST 落笔价格已降至零，无需支付 CST，但仍需支付网络燃料费。',
      b: '周期自动完成收官。',
      c: '在 ETH 落笔到来之前，CST 落笔被禁用。',
      d: 'CST 价格已升至上限。',
    },
    explanation:
      '校准窗口完整走完后，CST 落笔价格可降至零。落笔仍需支付网络燃料费，并满足当前周期规则。收官也需要有人提交交易，周期不会自动收官。',
    referenceLabel: '白皮书 §4.3 · CST 落笔',
  },
  'window-feedback-loop': {
    prompt: '连续的 ETH 落笔如何影响 CST 的下降速率？',
    options: {
      a: '每笔尝试把下降速率提高百分之一，但仅在最短窗口检查通过时采用。',
      b: '每笔都把下降速率降低百分之一。',
      c: '毫无影响——两种货币互不相干。',
      d: '窗口重置回初始时长。',
    },
    explanation:
      'V3 在链上保存 CST 价格下降速率，窗口时长由上限与速率推算。按当前除数，ETH 落笔尝试将速率增加其百分之一，但必须满足最短窗口检查；CST 落笔将速率减去其 1/101。CST 落笔还会重设上限，取不含溢价的基础花费两倍、配置下限与新速率乘以 180 秒三者中的最大值。该检查不是落笔冷却期。',
    referenceLabel: '白皮书 §4.3 · CST 落笔',
  },
  'participation-cst-timing': {
    prompt:
      '按上线参数，两笔落笔分别铭刻参与 CST：一笔落在上一笔之后 1 秒，另一笔终结了一整天的沉默。两者大约各铭刻多少？',
    options: {
      a: `约 ${oneSecondExample.cst} CST 与 ${oneDayExample.cst} CST，按间隔线性计算，并发给上一笔参与者。`,
      b: `每笔固定 ${cst(100)} CST，与时机无关。`,
      c: '两笔相同——时机从不重要。',
      d: '都是零——只有收官才铭刻 CST。',
    },
    explanation:
      'V3 按经过秒数线性计算参与 CST：秒数乘以链上乘数，再除以以微秒计的周期增量，向下取整到 CST 最小单位。按原始一小时时间增量，约每分钟 1 CST；周期增量变大后，该速率会略降。下一笔落笔把计算出的全额铭刻给上一笔参与者；首笔不发放，收官也不结算最后一笔之后的累计量。',
    funFact:
      '可以。每笔落笔都会增加星选权重，并更新坚守记录。下一笔落笔执行时，会按间隔时长向上一笔的参与者铭刻参与 CST；不是通常向本次提交者发放。首笔不铭刻参与 CST，收官也不会结算最后一笔之后的这项累计量。',
    referenceLabel: '白皮书 §7.1 · 铭刻规则',
  },
  'cst-max-cost-protection': {
    prompt: '提交 CST 落笔时，是什么保护 Kestrel 在交易落地偏晚时不至于多花？',
    options: {
      a: '她指定可接受的最高价格；这一笔花费绝不会超过授权。',
      b: '没有保护——执行时是什么价就付什么价。',
      c: '宇宙议会会在周期结束后退还多收部分。',
      d: 'CST 价格在签名与执行之间从不变化。',
    },
    explanation:
      '提交 CST 落笔时需指定可接受的最高价格，交易落地晚于预期也不会多花一分。它在另一笔 CST 落笔刚刚以更高起始价重启窗口时最有价值。',
    referenceLabel: '白皮书 §4.3 · CST 落笔',
  },
  'endurance-definition': {
    prompt:
      'Ari 在一个慵懒的午后落下一笔，十个小时无人打破——这是本周期最长的静默间隔。他有望摘得哪个头衔？',
    options: {
      a: '坚守冠军——他以最近落笔者的身份坚守了最长的连续间隔。',
      b: '时之勇士——他把一个头衔保持了最久。',
      c: '都不是；头衔取决于落笔次数。',
      d: '自动成为收官之笔。',
    },
    explanation:
      '坚守冠军是以最近落笔者身份坚守最久的参与者——单笔落笔撑过的最长静默间隔。时之勇士再上一层，衡量的是另一回事：坚守冠军这个头衔本身被保持了多久。',
    referenceLabel: '白皮书 §5.2 · 坚守冠军与时之勇士',
  },
  'chrono-definition': {
    prompt:
      'Ari 创下十小时的坚守纪录，连续保持坚守冠军身份两天后，纪录才被 Bea 刷新。时之勇士衡量的是什么？',
    options: {
      a: '谁连续在位坚守冠军最久——Ari 保持纪录的那两天都算在他头上。',
      b: '谁在他人落笔后反应最快。',
      c: '谁总共参与的周期最多。',
      d: '谁落下本周期的收官之笔。',
    },
    explanation:
      '坚守衡量你创造的间隔，时之勇士衡量纪录存活的时长。Ari 的坚守间隔是十小时，但他以坚守冠军身份在位了两天——时之勇士轨道计量的正是这段在位。两者都要到收官那一刻才尘埃落定。',
    referenceLabel: '白皮书 §5.2 · 坚守冠军与时之勇士',
  },
  'eth-selection-count': {
    prompt: '收官时，ETH 星选如何发放它的份额？',
    options: {
      a: `从本周期落笔资格池中选出 ${protocolFacts.ethStellarSelectionRecipients} 次，均分储备的 ${protocolFacts.stellarSelectionEthPercentage}%。`,
      b: `选出 ${protocolFacts.nftStellarSelectionRecipients} 次，每次都发放 ETH 和一枚 NFT。`,
      c: '只选出一次，独得全部份额。',
      d: '每位参与者平分。',
    },
    explanation: `ETH 星选选出 ${protocolFacts.ethStellarSelectionRecipients} 次资格，均分储备的 ${protocolFacts.stellarSelectionEthPercentage}%。${protocolFacts.nftStellarSelectionRecipients} 次是另一条轨道——参与者 NFT 星选的数字，它发放的是 CST 与 NFT，不含 ETH。`,
    referenceLabel: '白皮书 §5.3 · 星选',
  },
  'nft-selection-count': {
    prompt: '参与者 NFT 星选每次发放什么？共选出多少次？',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 Cosmic Signature NFT，从落笔资格池中共选出 ${protocolFacts.nftStellarSelectionRecipients} 次。`,
      b: `一份 ETH 份额，共选出 ${protocolFacts.ethStellarSelectionRecipients} 次。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST，只选出一次。`,
      d: `只有 NFT，共选出 ${protocolFacts.typicalNftsPerCycle} 次。`,
    },
    explanation:
      '参与者 NFT 星选每次分配一枚 NFT 与一次表彰 CST，采用基础 ETH 价格权重并允许重复选择。签名分配另有不同规则：三枚 NFT 合计对应一次 1,000 CST，不是每枚都配 1,000 CST。',
    referenceLabel: '白皮书 §5.1 · 收官时的发放',
  },
  'draws-with-replacement': {
    prompt: '同一位参与者可能在一个周期的星选中被选中多次吗？',
    options: {
      a: '可能——选择采用放回方式，资格随落笔累积。',
      b: '不可能——每位参与者至多被选中一次。',
      c: '只有落笔十次以上的参与者才可能重复。',
      d: '需经宇宙议会批准方可重复。',
    },
    explanation:
      '参与者的 ETH 与 NFT 星选都按累计权重选择，而非简单按落笔次数计。权重取每笔发生时未减免、未含溢价的 ETH 基础价格，CST 落笔也一样。随机输入来自链上区块上下文，并非独立的可验证随机服务；不保证完全无偏。Random Walk NFT 锚定星选使用独立的已锚定 NFT 资格池。',
    referenceLabel: '白皮书 §5.3 · 星选',
  },
  'anchored-rwlk-track': {
    prompt: '已锚定的 Random Walk NFT 能从周期中得到什么？',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 次选出，每次 ${cst(protocolFacts.specialAllocationCst)} CST 加一枚 Cosmic Signature NFT，权重按锚定数量计——不含 ETH。`,
      b: `按比例分摊 ${protocolFacts.anchorDistributionPercentage}% 的 ETH 锚定派发。`,
      c: '什么也没有——只有 Cosmic Signature NFT 才能锚定。',
      d: '解锚时的一次性 CST 发放。',
    },
    explanation: `Random Walk NFT 的锚定自成一线，目的也不同：它们参与锚定 NFT 星选，每周期 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，每次携带 CST 与一枚 Cosmic Signature NFT。ETH 锚定派发专属于已锚定的 Cosmic Signature NFT——Random Walk 锚定不含 ETH。`,
    referenceLabel: '白皮书 §8 · 锚定',
  },
  'exclusivity-window': {
    prompt: '收官之笔参与者的专属收官权持续多久？',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours} 小时`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时`,
      c: `${protocolFacts.initialCycleTimeIncrementHours} 小时`,
      d: `${protocolFacts.initialCstCalibrationWindowHours} 小时`,
    },
    explanation: `专属窗口为 ${protocolFacts.finalGestureExclusivityHours} 小时；窗口过后，任何人都可收官并接过受益方角色。${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时是开场落笔之后的初始倒计时——完全是另一座时钟。`,
    funFact: `V1 只给收官之笔参与者 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时的专属期。线上周期证明人真的会睡过截止时间，V2 于是把它翻倍。`,
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
  'escrow-timeout': {
    prompt: 'Juno 在 ETH 星选中被选中，却一直没有取回托管中的 ETH。期限过后会怎样？',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} 周之后，任何人都可以为自己取回这份未取回的分配。`,
      b: '它回到周期储备。',
      c: '它被销毁。',
      d: '它无限期留在托管中等待 Juno。',
    },
    explanation: `托管中的分配与附加资产会等待 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周；期限一过，合约允许任何人为自己取回仍未取回的分配。这条规则与公开收官窗口一脉相承：每份发放终会到达想要它的人手中。请及时取回。`,
    referenceLabel: '白皮书 §5.4 · 发放、托管与期限',
  },
  'push-vs-pull': {
    prompt: '收官时哪些 ETH 直接送达，哪些进入托管？',
    options: {
      a: '签名分配的 ETH 直接送达收官者，公共物品份额先进入金库；次级 ETH 进入分配钱包。',
      b: '全部直接发送给每位获配者。',
      c: '全部进入托管，包括受益方的份额。',
      d: '只有 CST 进入托管；ETH 全部直接送达。',
    },
    explanation:
      '主 ETH 份额直接转给收官者，次级 ETH 留在分配钱包等待取回。公共物品份额先转入金库，转给最终受益方还需另一次交易。CST 与 NFT 按各轨道直接铭刻，相关失败条件由合约规定。',
    referenceLabel: '白皮书 §5.4 · 发放、托管与期限',
  },
  'council-proposal-threshold': {
    prompt: '一个地址需要多少委托 CST 权重才能提交协调提案？',
    options: {
      a: `至少 ${protocolFacts.councilProposalThresholdCst} CST。`,
      b: `至少 ${cst(protocolFacts.specialAllocationCst)} CST。`,
      c: `至少 ${cst(protocolFacts.outreachReserveCst)} CST。`,
      d: '任意数量——没有门槛。',
    },
    explanation: `门槛为 ${protocolFacts.councilProposalThresholdCst} CST 的历史委托权重。${cst(protocolFacts.specialAllocationCst)} CST 则是固定表彰分配，不能混作提案门槛；签名分配的多枚 NFT 合计只对应一次该 CST 数额。`,
    referenceLabel: '白皮书 §9 · 宇宙议会',
  },
  'council-timeline': {
    prompt: '一份协调提案在今天提交。接下来的时间线是什么？',
    options: {
      a: `先经过 ${protocolFacts.councilVotingDelayDays} 天协调延迟，再进入 ${protocolFacts.councilVotingPeriodWeeks} 周的协调期。`,
      b: '只要提案者持有足够 CST，立即生效。',
      c: `先等 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周，再进入 ${protocolFacts.councilVotingDelayDays} 天的协调期。`,
      d: `${protocolFacts.finalGestureExclusivityHours} 小时延迟后自动执行。`,
    },
    explanation: `提案先经过 ${protocolFacts.councilVotingDelayDays} 天协调延迟，再进入 ${protocolFacts.councilVotingPeriodWeeks} 周的协调期。延迟给了持有者在快照前调整委托的时间；没有任何提案会立即生效。`,
    referenceLabel: '白皮书 §9 · 宇宙议会',
  },
  'quorum-rule': {
    prompt: '协调提案何时通过？',
    options: {
      a: `支持权重高于反对权重，且支持与弃权权重之和达到 ${protocolFacts.councilQuorumPercent}% 的协调法定权重。`,
      b: '仅支持权重达到总供应量的一半即可。',
      c: `支持、反对与弃权合计达到 ${protocolFacts.councilQuorumPercent}% 即可。`,
      d: '需协议所有者会签结果。',
    },
    explanation: `两个条件须同时成立：支持权重高于反对权重，且支持与弃权之和达到 CST 总供应量 ${protocolFacts.councilQuorumPercent}% 的协调法定权重。反对权重刻意不计入法定权重——反对一份提案，绝不会反而帮它凑够门槛。`,
    referenceLabel: '白皮书 §9 · 宇宙议会',
  },
  'weight-activation': {
    prompt: 'Rook 钱包里有 CST，却从未碰过议会。他的 CST 表达多少协调权重？',
    options: {
      a: '零——权重只在完成委托后生效，委托给自己或其他地址都可以。',
      b: '每枚 CST 自动表达一个单位。',
      c: '取决于他持有 CST 的时长。',
      d: '权重来自已锚定的 NFT，而非 CST。',
    },
    explanation:
      '协调权重在委托后生效：持有者把权重委托给自己或其他地址，此后每枚 CST 表达一个单位。未委托的 CST 不携带任何权重——仅仅持有，并不构成对协调的参与。',
    referenceLabel: '白皮书 §7.3 · 协调权重',
  },
  'time-increment-growth': {
    prompt: '每笔落笔所加的时间增量上线时恰为一小时。它如何演变？',
    options: {
      a: `每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，周期因此逐年变长。`,
      b: '永远固定在一小时。',
      c: '每个周期翻倍。',
      d: '参与者越多，它越短。',
    },
    explanation: `增量在每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。增量逐周期累积，使周期逐渐变长，NFT 的铭刻节奏也随之放缓。`,
    referenceLabel: '白皮书 §3.2 · 收官倒计时',
  },
  'typical-cst-fixed': {
    prompt: '典型周期铭刻多少固定 CST？如何构成？',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST：固定表彰分配加上推广储备；签名分配的多枚 NFT 只对应一次 CST 数额。`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST，全部归周期受益方。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST，全部用于社区推广。`,
      d: '每个周期都无法预测。',
    },
    explanation: `完整轨道合计铭刻 ${protocolFacts.typicalNftsPerCycle} 枚 NFT 和 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST 固定分配。签名分配有 ${protocolFacts.mainPrizeNftsPerCycle} 枚 NFT，但只发放一次 ${cst(protocolFacts.specialAllocationCst)} CST；动态参与 CST 另计。条件轨道缺席时，总额会减少。`,
    referenceLabel: '白皮书 §7.1 · 铭刻规则',
  },
  'attached-assets-destination': {
    prompt: 'Wren 在落笔时附加了一种 ERC-20 代币。附加资产去了哪里？',
    options: {
      a: '进入分配钱包托管——周期收官后，受益方享有优先取回权。',
      b: '与落笔的 ETH 一道汇入周期储备。',
      c: '周期收官时退回给 Wren。',
      d: '收官时被销毁。',
    },
    explanation:
      '附加资产从不进入 ETH 储备。它们由分配钱包托管，周期收官后受益方享有优先取回权——并与其他托管分配一样，受同一公开取回期限约束。',
    referenceLabel: '白皮书 §4.4 · 消息与附加资产',
  },
  'next-cycle-delay': {
    prompt: '一个周期刚刚完成收官。下一个周期何时启用？',
    options: {
      a: `经过链上配置的延迟后开启，目前为 ${protocolFacts.currentNextCycleDelayDays} 天；所有者可以调整。`,
      b: '同一笔交易内立即启用。',
      c: `正好 ${protocolFacts.finalGestureExclusivityHours} 小时之后。`,
      d: '只有所有者手动开启后才启用。',
    },
    explanation: `下一周期的启用时间由成功收官的时间加上配置延迟决定。当前为 ${protocolFacts.currentNextCycleDelayDays} 天；${protocolFacts.defaultNextCycleDelayMinutes} 分钟是历史 Solidity 默认值，不是当前延迟。`,
    referenceLabel: '白皮书 §3.3 · 收官与公开收官窗口',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
