import { nftAllocationFacts } from '@/content/protocol-facts';
import { cstRewardFacts, ethDistributionFacts, protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { FAQText } from './structure';

/**
 * Protocol amounts in this locale's number style (grouping from
 * `i18n/localeConfig.ts` through the format layer, never an Intl tag typed
 * into a copy module).
 */
const cst = formatCount(protocolFacts.specialAllocationCst, 'zh');
const outreachCst = formatCount(protocolFacts.outreachReserveCst, 'zh');

/** protocolFacts stores the example gaps as English strings; render them in zh. */
const ELAPSED_ZH: Record<
  | (typeof protocolFacts.dynamicCstRewardExamples)[number]['elapsed']
  | (typeof protocolFacts.v3.dynamicCstRewardExamples)[number]['elapsed'],
  string
> = {
  '0 seconds': '0 秒',
  '1 second': '1 秒',
  '60 seconds': '60 秒',
  '1 hour': '1 小时',
  '1 day': '1 天',
};

/** 中文 FAQ 文案，以 structure.ts 中的骨架为键。 */
export const faqTextZh = {
  'getting-started': {
    title: '开始使用',
    description: '了解 Cosmic Signature 的基础知识与参与方式',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature 是什么？',
        answer:
          'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。参与者在演绎周期中落笔，每一笔都会塑造这一周期最终的签名。周期收官后，协议将储备分配至一组固定的轨道，其中包括支持 170 多位以太坊核心贡献者的 Protocol Guild。',
      },
      'how-does-the-bidding-game-work': {
        question: '演绎周期如何运作？',
        answer: `每个周期都以首笔落笔的 ETH 校准窗口开启。首笔落笔会启动周期收官倒计时，当前默认约为 24 小时。此后每笔 ETH 或 CST 落笔都会把当前时间增量加到链上收官时间；该增量初始为 1 小时，并在每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。倒计时结束后，收官之笔的参与者享有 ${protocolFacts.finalGestureExclusivityHours} 小时的专属收官窗口，可完成周期收官并取回签名分配；在周期实际收官前，仍可继续落笔。`,
      },
      'what-type-of-gestures-are-available': {
        question: '可以用哪些方式落笔？',
        answer:
          '每个周期必须由 ETH 落笔开启，此后可使用 ETH 或 CST。拥有尚未用于减免的 Random Walk NFT 时，可将其用于 ETH 落笔减免；该 NFT 不会因此转出。Cosmic Signature NFT 用于分配与锚定，不能支付落笔。CST 基础价格随时间下降，下降速率会随落笔调整；临近收官时，两种落笔价格还可能包含溢价。',
      },
      'can-i-participate-without-nfts': {
        question: '没有 NFT 也能参与吗？',
        answer:
          '可以。任何人都能在 Cosmic Signature 的演绎周期中落笔。若拥有尚未使用的 Random Walk NFT，也可将其附加至一笔 ETH 落笔，使落笔价格降低 50%。每枚 Random Walk NFT 仅可用于这项减免一次。',
      },
      'how-can-i-get-involved': {
        question: '有哪些参与方式？',
        answer:
          '你可以在演绎周期中落笔，也可以将自己项目的 NFT 贡献给协议，供参与者随落笔附加。加入 Discord，即可认识其他参与者。',
      },
      'how-long-does-each-round-last': {
        question: '每个演绎周期会持续多久？',
        answer: `首笔 ETH 落笔会开启周期，并将收官倒计时设为当前时间增量的约 24 倍（协议上线时约为 1 天）。此后每笔落笔都会加入当前时间增量；该增量初始恰为 1 小时，并在每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。因此，只要在收官前持续有人落笔，一个周期就可能远超 1 天。`,
      },
      'can-i-place-multiple-gestures': {
        question: '一个周期内可以多次落笔吗？',
        answer:
          '可以。每笔落笔都会增加星选权重，并更新坚守记录。下一笔落笔执行时，会按间隔时长向上一笔的参与者铭刻参与 CST；不是通常向本次提交者发放。首笔不铭刻参与 CST，收官也不会结算最后一笔之后的这项累计量。',
      },
    },
  },
  'allocations-and-rewards': {
    title: '分配与派发',
    description: '了解周期收官后参与者可能获得的资产',
    items: {
      'what-is-the-main-allocation': {
        question: '什么是签名分配？',
        answer: `签名分配归实际收官者。倒计时归零后的 ${protocolFacts.finalGestureExclusivityHours} 小时内，只有收官之笔参与者可以收官；此后任何人都可收官并成为受益方。分配包括周期储备的 ${protocolFacts.mainEthPercentage}% ETH、合计 ${cst} CST、${nftAllocationFacts.mainPrizeNftPhrase.zh}，以及对该周期附加资产的取回权。`,
      },
      'what-rewards-per-bid': {
        question: '每次落笔会带来什么？',
        answer:
          '每笔落笔记录一份加权星选资格，更新坚守记录，并可能为上一笔参与者铭刻参与 CST。V3 按间隔秒数线性计算，合约以最小单位截断；等待本身不会形成可取回余额，必须有下一笔落笔执行。首笔不发放这项 CST，收官也不结算最后一笔之后的累计量。',
      },
      'how-does-the-stellarSelection-work': {
        question: '星选如何运作？',
        answer: `参与者 ETH 星选与 NFT 星选都采用加权、放回选择。每笔落笔的权重，是当时未减免、未加临近收官溢价的 ETH 基础价格；CST 落笔也使用同一时刻的 ETH 基础价格。${protocolFacts.ethStellarSelectionRecipients} 次选择均分 ${protocolFacts.stellarSelectionEthPercentage}% ETH，另 ${protocolFacts.nftStellarSelectionRecipients} 次选择各获配 ${cst} CST 与 1 枚 NFT。同一地址可多次获配。Random Walk NFT 锚定星选独立按已锚定 NFT 资格选择。`,
      },
      'how-random-selection-works': {
        question: '程序化随机选择是怎样完成的？',
        answer:
          '参与者的 ETH 与 NFT 星选都按累计权重选择，而非简单按落笔次数计。权重取每笔发生时未减免、未含溢价的 ETH 基础价格，CST 落笔也一样。随机输入来自链上区块上下文，并非独立的可验证随机服务；不保证完全无偏。Random Walk NFT 锚定星选使用独立的已锚定 NFT 资格池。',
      },
      'how-do-i-claim-my-allocation': {
        question: '成为获配者后，如何取回分配？',
        answer: `获配者可通过应用与协议合约取回分配。周期收官倒计时结束后，收官之笔参与者享有 ${protocolFacts.finalGestureExclusivityHours} 小时的专属时间，可完成周期收官并取回签名分配。\n\n此后进入公开收官窗口：任何人都可发起收官交易，智能合约会把实际完成收官的人视为周期受益方——收官者将获得整份签名分配，包括 ETH 份额、${cst} CST 铭刻、Cosmic Signature NFT，以及对已附加资产的优先权。\n\n次级 ETH、已附加代币与已附加 NFT 会由分配钱包托管，并采用另一项取回超时设置，当前默认为 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周；超时后，合约允许任何人为自己取回仍未取回的分配。请及时处理。`,
      },
      'how-does-anchoring-work': {
        question: '锚定如何运作？',
        answer: `Cosmic Signature NFT 可锚定至协议，以获得 ETH 锚定派发：每个已收官周期会划出周期储备的 ${ethDistributionFacts.anchorDistributionPercentage}%，按当时已锚定的 Cosmic Signature NFT 数量平均分配；累积的 ETH 会在解锚时派发。\n\nRandom Walk NFT 也可以锚定，但只用于取得锚定 NFT 星选资格——被选中的锚定者会获得 CST 与 Cosmic Signature NFT，而不是 ETH。\n\n还需注意两条规则：每枚 NFT 永远只能锚定一次（解锚后不可再次锚定）；若周期收官时没有任何 Cosmic Signature NFT 处于锚定状态，该周期的 ${ethDistributionFacts.anchorDistributionPercentage}% 会留在周期储备中。CST（ERC-20）不能锚定。可从账户菜单进入"我的锚定"页面管理锚定。`,
      },
      'what-are-marketing-rewards': {
        question: '什么是推广储备？',
        answer: `帮助推广协议可获得 CST 代币（ERC-20）。推广储备每个周期铭刻 ${outreachCst} CST，并将其发放给生态贡献者。具体方式可在 Discord 联系推广托管人。`,
      },
      'how-many-nfts-minted': {
        question: '每个周期会铭刻多少枚 Cosmic Signature NFT？',
        answer: `各轨道均满足条件时，收官会铭刻 ${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT：签名分配 ${protocolFacts.mainPrizeNftsPerCycle} 枚，时之勇士、坚守冠军与 CST 收官之笔各 1 枚，参与者星选 ${protocolFacts.nftStellarSelectionRecipients} 枚，Random Walk NFT 锚定星选 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 枚。签名分配的 CST 合计仅为 ${cst}，不按其中的 NFT 枚数重复计算。没有 CST 落笔或没有已锚定 Random Walk NFT 时，相关轨道会跳过。`,
      },
      'what-happens-to-remaining-eth': {
        question: '周期储备中剩余的 ETH 会怎样处理？',
        answer:
          '未分配的 ETH 留在合约中，作为下一周期的起始储备。按当前配置通常约为一半，另可能留有取整余数或未成功转出的份额。这不保证下一周期的储备一定更大。',
      },
      'what-happens-to-attached-assets': {
        question: '随落笔附加的代币或 NFT 会怎样处理？',
        answer: `随落笔附加的 ERC-20 代币或 ERC-721 NFT 由分配钱包合约托管，不会进入 ETH 周期储备。周期收官后，周期受益方（通常为收官之笔参与者）享有优先取回权。若超出次级取回期限仍无人取回，目前默认期限为 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周，合约将允许任何人为自己取回这些资产。`,
      },
      'who-receives-10-percent': {
        question: '周期储备中的公共物品分配会发给谁？',
        answer: `当前公共物品份额为周期储备的 ${protocolFacts.publicGoodsPercentage}%。收官时，合约尝试将其转入公共物品金库；任何人随后都可另发一笔交易，将金库余额转给当前受益方 Protocol Guild。核心合约转入金库失败时，该份额可留在储备中而不阻止收官。受益方可由金库所有者更改；宇宙议会不会自动取得该权限。`,
      },
    },
  },
  'game-mechanics': {
    title: '周期机制',
    description: '深入了解落笔时机与协议规则',
    items: {
      'how-does-price-increase': {
        question: '一个周期内，落笔价格如何变化？',
        answer:
          'ETH 开场基础价格在校准窗口中下降；开场后，每笔 ETH 落笔会提高下一笔基础价格。CST 基础价格按链上下降速率随时间减少，ETH 落笔尝试加快该速率，CST 落笔减慢该速率并重设上限。两种价格都可能在临近收官时加上溢价，所以最终价格不保证始终下降。',
      },
      'what-is-dutch-auction': {
        question: '什么是校准窗口？',
        answer: `校准窗口让基础价格随时间下降。ETH 开场基础价格降至上限的 1/${protocolFacts.ethCalibrationFloorDivisor} 向下取整再加 1 wei；CST 基础价格为上限减去经过秒数乘下降速率，最低为零。V3 的 CST 窗口是按速率推算的，并非固定初始时长。临近收官溢价另计；CST 基础价格为零时，加上溢价仍为零。`,
      },
      'how-is-participation-cst-calculated': {
        question: '参与 CST 如何计算？',
        answer: `V3 按经过秒数线性计算参与 CST：秒数乘以链上乘数，再除以以微秒计的周期增量，向下取整到 CST 最小单位。按原始一小时时间增量，约每分钟 1 CST；周期增量变大后，该速率会略降。下一笔落笔把计算出的全额铭刻给上一笔参与者；首笔不发放，收官也不结算最后一笔之后的累计量。\n\n原始一小时时间增量下的近似示例：${cstRewardFacts.examples.map((example) => `${ELAPSED_ZH[example.elapsed]}后为 ${example.cst} CST`).join('、')}。`,
      },
      'why-minimum-cst-reward-protection': {
        question: '什么是最低 CST 铭刻保护？',
        answer:
          '这项下限约束的是本次交易向上一笔参与者铭刻的参与 CST，通常不是提交者自己收到的数量。若提交者也是上一笔参与者，下限才保护其自身的这次铭刻。其他落笔先执行时，收取对象和金额都可能改变。首笔 ETH 落笔跳过这项检查；价格上限与网络费用另行处理。',
      },
      'how-cst-calibration-window-changes': {
        question: '每笔落笔如何改变 CST 校准窗口？',
        answer:
          'V3 在链上保存 CST 价格下降速率，窗口时长由上限与速率推算。按当前除数，ETH 落笔尝试将速率增加其百分之一，但必须满足最短窗口检查；CST 落笔将速率减去其 1/101。CST 落笔还会重设上限，取不含溢价的基础花费两倍、配置下限与新速率乘以 180 秒三者中的最大值。该检查不是落笔冷却期。',
      },
      'what-is-open-finalization-window': {
        question: '什么是公开收官窗口？',
        answer: `周期收官倒计时结束后，收官之笔参与者享有 ${protocolFacts.finalGestureExclusivityHours} 小时的专属收官时间。若未在该窗口内完成收官，任何人都可发起收官交易，智能合约会把实际收官者设为周期受益方。收官者将获得完整的签名分配，包括 ETH 份额、${cst} CST、Cosmic Signature NFT，以及对已附加资产的优先权。因此，收官之笔参与者应在专属窗口结束前完成收官。即使该参与者离开，公开收官机制也能让协议继续运行。`,
      },
      'what-is-endurance-champion': {
        question: '什么是坚守冠军？',
        answer:
          '一个周期内，保持“最近一笔落笔者”身份时间最长的参与者，即下一笔落笔出现前拥有最长连续间隔的人，会成为坚守冠军。周期收官时，坚守冠军将获得 1,000 CST 的表彰铭刻与 1 枚 Cosmic Signature NFT。',
      },
      'what-is-final-cst-gesture': {
        question: '什么是 CST 收官之笔？',
        answer:
          'CST 收官之笔是一个周期中最后一笔使用 CST 完成的落笔。周期收官时，完成该笔落笔的参与者将获得 1,000 CST 的表彰铭刻与 1 枚 Cosmic Signature NFT。',
      },
      'what-is-chrono-warrior': {
        question: '什么是时之勇士？',
        answer: `时之勇士是在坚守冠军位置上连续保持最久的参与者。坚守冠军对应保持"最近一笔落笔者"身份最久的人，时之勇士则对应保持坚守冠军身份最久的人。周期收官时，时之勇士将获得周期储备中 ${ethDistributionFacts.chronoWarriorEthPercentage}% 的 ETH、${cst} CST 与 1 枚 Cosmic Signature NFT。`,
      },
      'does-time-per-bid-stay-same': {
        question: '每笔落笔增加的时间始终相同吗？',
        answer: `不会。协议上线时，每笔落笔增加的时间恰为 1 小时；此后每当一个周期收官，增量都会增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。由于增量变大也会拉长每个周期，按日历时间看，这种增长会自然放缓。`,
      },
      'why-time-per-bid-increases': {
        question: '为什么每笔落笔增加的时间会逐步增长？',
        answer:
          '这一机制决定 Cosmic Signature NFT 的长期铭刻节奏：周期越长，同一段时间内铭刻的新 NFT 越少。',
      },
      'how-time-increase-affects-game': {
        question: '落笔时间增量上升会怎样影响协议？',
        answer:
          '随着每笔落笔增加的时间变长，周期的平均持续时间也会延长。这一变化循序渐进，既保持平稳的参与体验，也限制长期范围内 Cosmic Signature NFT 的总供应增长。',
      },
      'what-if-two-gestures-same-time': {
        question: '两笔落笔同时提交会怎样？',
        answer:
          'Arbitrum 的排序器会确定交易顺序。每笔落笔都按执行时的协议状态检查；后一笔仍可能成功，但前一笔可能改变落笔价格或参与 CST 铭刻量。若变化超出你设置的保护范围，交易就会回退。',
      },
      'is-there-game-theory': {
        question: '参与 Cosmic Signature 是否需要策略？',
        answer:
          '需要。落笔时机、频率和方式（ETH、CST 或附加 Random Walk NFT）都会影响各条分配轨道的结果。协议机制与参与者之间的互动允许多种策略在不同轨道上发挥作用。',
      },
    },
  },
  'tokens-and-nfts': {
    title: '代币与 Cosmic Signature',
    description: '了解 CST、链上艺术与数字资产',
    items: {
      'what-are-cst-and-dao': {
        question: 'CST 代币与宇宙议会是什么？',
        answer:
          'CST 用于落笔和委托后的宇宙议会协调权重。V3 的下一笔落笔会向上一笔参与者铭刻动态参与 CST；固定分配另在收官时发放。议会只能行使实际授予它的权限，目前并不拥有核心协议。移交所有权或放弃所有权都需要各自的链上交易，不会随 V3 自动发生。',
      },
      'what-can-i-do-with-cst': {
        question: 'CST 代币有哪些用途？',
        answer:
          'CST 可通过 CST 校准窗口替代 ETH 用于落笔；落笔消耗的 CST 会被销毁（永久移出供应量），而不会汇入资金池。落笔也可能铭刻参与 CST，但数量会随距上一笔落笔的时间动态变化。完成委托后（可以委托给自己），CST 还可用于表达宇宙议会中的协调权重。',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFT 有何独特之处？',
        answer:
          '每枚 Cosmic Signature NFT 的种子与所有权记录保存在链上。图像和视频由链下开源渲染器生成，呈现牛顿引力下的三体运动。复现作品需要种子、对应渲染器版本、配置与兼容工具链；媒体文件并非全部存储在合约中。',
      },
      'how-are-nft-images-created': {
        question: 'NFT 图像是怎样生成的？',
        answer:
          '每枚 Cosmic Signature NFT 都以牛顿引力下的三体问题为主题。流水线模拟三个天体在引力作用下的运动，并在 380 至 700 纳米范围内以 64 个波长区间对轨迹进行光谱渲染，为每枚 NFT 生成独特的混沌图案。',
      },
      'significance-of-random-seed': {
        question: '为什么每枚 NFT 都由链上种子生成？',
        answer:
          '链上种子提供可核验的生成起点。配合对应的渲染器版本、配置与兼容工具链，任何人都可尝试重新生成作品。种子本身不保证跨版本、跨机器逐像素一致，也不保证托管图像与视频的服务始终可用。',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFT 的数量有限吗？',
        answer: `合约没有硬性供应上限。每个周期收官后，落笔时间增量会增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，通常会使周期变长、NFT 铭刻节奏放缓。实际铭刻速度也取决于参与情况。`,
      },
      'impact-of-limiting-nfts': {
        question: '周期时长如何影响新 NFT 的铭刻数量？',
        answer:
          '落笔时间增量逐步增长，通常会使周期变长，因此同一段时间内铭刻的 NFT 会减少。每一枚 Cosmic Signature NFT 都记录了协议历史的一部分，总量没有固定上限。',
      },
      'connection-with-randomwalknft': {
        question: 'Cosmic Signature 与 Random Walk NFT 有什么关联？',
        answer:
          'Random Walk NFT 持有者可将一枚尚未使用的代币附加至一笔 ETH 落笔，使 ETH 落笔价格降低 50%。Random Walk NFT 锚定者还会在每个周期取得锚定 NFT 星选资格。',
      },
      'how-to-trade-nfts-tokens': {
        question: '如何交易或出售 Cosmic Signature NFT 与 CST？',
        answer:
          'Cosmic Signature NFT 可在 Axiom Zero（axiomzero.market）交易；这是专为 Cosmic Signature 与 Random Walk NFT 打造的零手续费 NFT 市场。CST 则可在 Arbitrum 上的 Uniswap 交易。二者分别是标准 ERC-721 与 ERC-20 资产，因此任何支持相应标准的 Arbitrum 市场或交易平台也可使用，包括 OpenSea。',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: '在哪里可以买卖 Cosmic Signature NFT？',
        answer:
          '主要平台是 Axiom Zero（https://www.axiomzero.market/cosmic-signature），这是 Arbitrum 上面向公平启动生成艺术的零手续费 NFT 市场。挂单与成交均直接在链上结算，出售方会收到全部成交金额；每个代币页面还会实时读取锚定合约并显示 NFT 的锚定状态。未曾锚定的代币会为下一位持有者保留一次锚定机会。',
      },
      'cosmic-signature-prediction-market': {
        question: 'Cosmic Signature 有预测市场吗？',
        answer:
          '有。Chaos Zero（https://chaoszero.com）是专为 Cosmic Signature 构建的预测市场。每个演绎周期都会提出一个问题：本周期收官时的落笔次数是否会超过上一周期？所有头寸以 CST 计价，并按机制完全抵押；市场依据公开的链上落笔次数结算，不设所有者或管理密钥。',
      },
      'participate-dao-without-bidding': {
        question: '不落笔也能参与宇宙议会吗？',
        answer:
          '可以。你可以在受支持的平台取得 CST，委托给自己或其他地址后，即可在宇宙议会中表达协调权重。落笔仍是铭刻新 CST 的主要方式。',
      },
      'donate-nfts-to-game': {
        question: '其他 NFT 项目如何向某个周期贡献代币？',
        answer:
          '项目方可在落笔界面的“高级”面板中附加 ERC-721 或 ERC-20 代币。填写合约地址、代币 ID 或数量后提交落笔。附加的代币会由分配钱包托管，并在周期收官后流向签名分配获配者。',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrum 与技术',
    description: '网络设置、钱包与技术细节',
    items: {
      'what-is-arbitrum': {
        question: 'Arbitrum 是什么？Cosmic Signature 为什么部署在这里？',
        answer:
          'Arbitrum 是以太坊 Layer 2 汇总网络，旨在以更低成本处理交易。Cosmic Signature 使用它来支持频繁的链上交互。费用会随网络状况变化，Arbitrum 也有自身的执行与结算规则。',
      },
      'why-arbitrum-not-ethereum': {
        question: '为什么选择 Arbitrum，而不是以太坊主网？',
        answer:
          '越来越多的链上活动正在迁移至 Layer 2。Arbitrum 大幅降低燃料费，同时沿用以太坊 Layer 1 的安全模型，非常适合需要频繁落笔的 Cosmic Signature 协议。',
      },
      'arbitrum-security': {
        question: 'Arbitrum 为什么能获得以太坊 Layer 1 级别的安全性？',
        answer:
          'Arbitrum 是汇总网络，而不是侧链。每批交易都会发布回以太坊主网，因此 Arbitrum 的安全性锚定在以太坊本身：数据与争议解决均位于 Layer 1。',
      },
      'how-to-get-eth-on-arbitrum': {
        question: '如何在 Arbitrum 上取得 ETH？',
        answer:
          '可使用 Arbitrum 官方跨链桥或其他受支持的跨链桥，把 ETH 从以太坊主网转入 Arbitrum。ETH 会锁定在以太坊上，并在 Arbitrum 上生成等额可用余额。跨链过程需要支付以太坊 Layer 1 燃料费。',
      },
      'existing-wallet-on-arbitrum': {
        question: '现有的以太坊钱包能在 Arbitrum 上使用吗？',
        answer:
          '可以。同一组私钥可在两个网络上签署交易，只需把 Arbitrum 添加到钱包的网络列表即可。',
      },
      'view-tokens-on-arbitrum': {
        question: '如何查看 Arbitrum 上的 CST 与 Cosmic Signature NFT？',
        answer:
          '可以直接在 Cosmic Signature 网站查看，也可手动把合约地址添加至钱包。所有合约地址都公布在“合约”页面与社区 Discord 中。',
      },
      'trade-on-arbitrum': {
        question: '可以在 Arbitrum 上交易 Cosmic Signature NFT 与 CST 吗？',
        answer:
          '可以。Cosmic Signature NFT 可在该系列的零手续费市场 Axiom Zero 交易，CST 可在 Uniswap 交易。二者分别是 Arbitrum 上的标准 ERC-721 与 ERC-20 资产，因此任何支持这些标准的市场或交易平台也可使用。交易前请务必核对合约地址。',
      },
      'verify-bid-success': {
        question: '如何确认落笔已成功提交？',
        answer:
          '成功的落笔会在 Arbitrum 上得到确认，并显示在 Arbitrum 区块浏览器 Arbiscan 中。将交易哈希粘贴至浏览器，即可验证这笔落笔。',
      },
      'game-security': {
        question: '协议如何保障安全？',
        answer:
          '公开的合约地址、源码资源、验证状态与审计范围可供核对。Hacken 审查的是历史版本，不能自动覆盖此后每一项 V3 改动。当前 V3 与所核对的本地编译产物匹配，但尚未在 Sourcify 验证；这些证据都不保证绝对安全。',
      },
      'fees-involved': {
        question: '参与需要支付哪些费用？',
        answer:
          '除落笔价格外，每笔交易还需支付 Arbitrum 网络燃料费。燃料费会随网络状况波动，不由 Cosmic Signature 控制。',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature 与生物学领域的 COSMIC 数据库有关吗？',
        answer:
          '没有关系。Cosmic Signature 与 COSMIC 癌症突变数据库及生物学中的 COSMIC 突变特征均无关联。它是链上艺术协议及应用，聚焦由确定性三体运动生成的 NFT 艺术。',
      },
    },
  },
  'trust-and-governance': {
    title: '信任与协调',
    description: '了解透明度、团队权限与开源愿景',
    items: {
      'team-controls': {
        question: '团队对协议拥有哪些控制权限？',
        answer:
          '初期，团队可以调整部分协议参数，例如落笔时间增量或分配轨道比例。这些权限通过智能合约的 Ownable 模式实现，并限定在周期间窗口：下一个周期一旦启用（启用发生在首笔落笔之前），核心协议参数便会锁定，直至该周期收官。\n\n锁定期间仍保留少量范围更窄的权限：所有者可把周期启用推迟至首笔落笔到来，也可随时调整下一周期前的延迟，并随时管理外围合约（公共物品金库受益方、NFT 元数据 URI 与分配钱包取回期限）。\n\n协议合约还可由所有者通过 UUPS 升级，但只能在周期间进行；当前部署的是 V3，实现地址应以代理槽位为准；V3 尚未在 Sourcify 验证。',
      },
      'will-team-always-have-control': {
        question: '团队会一直控制协议参数吗？',
        answer:
          '目前所有者仍保有合约规定的权限。移交宇宙议会或放弃所有权都需要单独执行链上操作，V3 没有自动完成这些步骤的期限。',
      },
      'what-is-renounce-ownership': {
        question: '“放弃所有权”是什么意思？',
        answer:
          '放弃所有权会禁用该合约的所有者专属操作，与把权限移交宇宙议会不同。各合约的所有者角色是分开的；一个合约放弃所有权，不代表其他合约或其他权限也同时消失。',
      },
      'why-renounce-ownership': {
        question: '团队为什么会放弃所有权？',
        answer:
          '目标是让协议保持公平与去中心化。放弃所有权可确保协议上线后，规则不能被任意更改，从而增强参与者对协议的信任与可预期性。',
      },
      'how-team-profits': {
        question: 'Cosmic Signature 团队如何从协议中获得价值？',
        answer: `当前 ETH 分配没有单列的团队份额。推广储备每个收官周期获得 ${outreachCst} CST，由任命的托管人发放。团队关联地址仍可按同样规则参与；这不代表所有者权限已移除，也不保证未来配置不变。`,
      },
      'why-was-cs-created': {
        question: '为什么要创建 Cosmic Signature？',
        answer:
          'Cosmic Signature 源于对混沌理论与三体问题无解析解特性的着迷。由链上种子生成独特而确定的艺术，既引人入胜，也契合支持公共物品的协议理念。',
      },
      'what-if-team-disappears': {
        question: '如果团队不再维护项目，会怎样？',
        answer:
          '协议按可持续独立运行的目标设计。种子存储在链上，任何人都可以使用开源 Rust 流水线重新生成 NFT 图像与视频。无论团队状态如何，每枚 Cosmic Signature NFT 都能持续访问。',
      },
      'can-create-competing-site': {
        question: '可以复刻代码并搭建自己的网站吗？',
        answer:
          '当然可以。项目自有的合约、着色器、渲染器、页面与文档均采用 CC0 1.0，不保留任何权利。第三方依赖、字体与素材仍适用各自的许可证；详见 THIRD_PARTY_NOTICES.md。',
      },
      'donate-to-pot': {
        question: '不落笔也能向周期储备贡献 ETH 吗？',
        answer:
          '可以。协议合约提供独立于落笔的专用贡献函数，可接收 ETH，也可附加备注并显示在周期贡献列表中。请使用应用内的贡献流程，不要直接从钱包向协议地址转账：直接发送至协议地址的 ETH 会被处理为 ETH 落笔，而不是贡献。详情可通过 Discord 咨询。',
      },
      'get-help': {
        question: '遇到问题时，如何获得帮助？',
        answer: '可使用“关于”页面列出的官方 Discord、X（Twitter）链接或支持邮箱联系我们。',
      },
      'stay-updated': {
        question: '如何关注 Cosmic Signature 的最新动态？',
        answer: '关注官方社交媒体并加入 Discord 社区，即可获取最新公告、协议协调提案与周期回顾。',
      },
    },
  },
} satisfies FAQText;
