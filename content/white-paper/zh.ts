import { protocolFacts } from '@/content/protocol-facts';

import {
  WHITE_PAPER_PATH,
  WHITE_PAPER_PDF_PATH_ZH,
  WHITE_PAPER_VERSION,
  type WhitePaperContent,
} from './types';

const cst = (amount: number): string => amount.toLocaleString('zh-CN');

/** protocolFacts stores the example gaps as English strings; render them in zh. */
const ELAPSED_ZH: Record<string, string> = {
  '0 seconds': '0 秒',
  '1 second': '1 秒',
  '60 seconds': '60 秒',
  '1 hour': '1 小时',
  '1 day': '1 天',
};

export const whitePaperContentZh = {
  metadata: {
    title: 'Cosmic Signature 白皮书 · 程序化链上艺术协议',
    description:
      'Cosmic Signature 的权威说明：演绎周期、落笔、分配轨道、确定性三体 NFT 艺术、CST、锚定、宇宙议会、协议升级与全面去中心化路线。',
    path: WHITE_PAPER_PATH,
  },
  breadcrumbLabel: '白皮书',
  breadcrumbs: {
    ariaLabel: '面包屑导航',
    homeLabel: '首页',
  },
  hero: {
    eyebrow: '白皮书',
    title: 'Cosmic Signature',
    subtitle: 'Arbitrum 上的程序化链上艺术协议',
    authorName: 'Taras Bobrovytsky',
    authorEmail: 'taras@cosmicsignature.com',
    versionLabel: `版本 ${WHITE_PAPER_VERSION}`,
    dateLabel: '2026年8月',
    downloadLabel: '下载 PDF',
    downloadHref: WHITE_PAPER_PDF_PATH_ZH,
  },
  abstract: {
    heading: '摘要',
    paragraphs: [
      'Cosmic Signature 是部署在 Arbitrum One 上的程序化艺术协议，以一个个限时的演绎周期运转。周期进行中，参与者以 ETH 或协议的 ERC-20 代币 CST 落笔：每一笔都会延长收官倒计时，计入一次星选资格，还可能铭刻新的 CST。倒计时结束、周期收官后，协议将 ETH 储备分配至十余条轨道，铭刻新一代 Cosmic Signature NFT，并把固定份额转拨给 Protocol Guild，即 170 余位以太坊核心贡献者的资助机制。约一半储备滚入下一周期，每个新周期都以更大的储备开场。',
      '每枚 Cosmic Signature NFT 都是对引力三体问题的确定性渲染：作品由链上种子生成，任何人都能逐像素复现，全程没有神经网络参与。本文完整阐述协议机制与代币设计，记录已上线的 V2 升级，介绍规划中的 V3 升级，并阐明一项承诺：待设计定稿，部署者地址将交出全部特权控制。',
    ],
  },
  tocHeading: '目录',
  sections: [
    {
      id: 'introduction',
      number: '1',
      heading: '引言',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature 源于两个信念。其一，生成艺术最动人的时刻，是它没有任何随意性：每幅图像都是物理过程的输出，由种子唯一确定，任何人重跑一遍流程即可验证结果。其二，一个替参与者保管 ETH 的协议，应当对“每一个 wei 去了哪里”给出机械的、可读的答案。',
        },
        {
          kind: 'paragraph',
          text: '由此而来的，是一个围绕时间构建的协议。演绎周期开启，在一次次落笔中延展，倒计时归零后落幕。落笔是一次小小的链上行为：携带 ETH 或 CST，可附上一句短消息或一份资产，并把周期的收官时间向后推。倒计时结束时，最后落下的那一笔就是收官之笔，其参与者可完成收官：发放储备、铭刻本周期的 NFT，并为下一周期做好准备。',
        },
        {
          kind: 'paragraph',
          text: '三项性质贯穿整个设计。',
        },
        {
          kind: 'list',
          items: [
            '确定性。作品由铭刻时记录在链上的种子计算而来。渲染管线开源，同一种子永远产出同一图像与视频，逐比特一致。',
            '机械化发放。分配比例是已验证合约中的常量。参与者与发放规则之间没有任何自由裁量的账户，也没有团队钱包从落笔中收取 ETH。',
            '有限的团队角色。所有者权限范围很窄，在周期运行期间全部锁定，并将在剩余升级完成后彻底移除。',
          ],
        },
        {
          kind: 'paragraph',
          text: '本文是协议的权威说明。第 2 节勾勒系统全貌；第 3 至 5 节定义周期、落笔与分配；第 6 节介绍艺术；第 7 至 10 节涵盖 CST、锚定、宇宙议会与公共物品；第 11 节讨论安全与可验证性；第 12、13 节记录升级历史与全面去中心化路线；第 14 节直言协议不是什么。文中引用的数字要么是合约常量，要么是链上参数的上线初始值；附录 A 所列的已部署合约始终是最终依据。',
        },
      ],
    },
    {
      id: 'protocol-overview',
      number: '2',
      heading: '协议概览',
      blocks: [
        {
          kind: 'paragraph',
          text: '系统由一份核心合约和环绕它的一组单一职责合约构成。核心合约部署在可升级代理之后，负责运转周期：为落笔定价、维护倒计时、持有周期储备、执行收官。环绕它的是 CST 代币、Cosmic Signature NFT 系列、分配托管钱包、两个锚定钱包、公共物品金库、推广储备与宇宙议会。',
        },
        {
          kind: 'table',
          table: {
            columns: ['组件', '职责'],
            rows: [
              ['协议合约', '运转演绎周期：落笔定价、收官倒计时、周期储备与收官执行。'],
              ['CST（ERC-20）', '参与代币。仅由协议铭刻，用于落笔时销毁，完成委托后表达协调权重。'],
              [
                'Cosmic Signature NFT（ERC-721）',
                '确定性三体艺术作品。仅在收官时铭刻，种子存储在链上。',
              ],
              [
                'Random Walk NFT',
                '同一团队更早的生成艺术系列。可一次性降低落笔价格，并拥有独立的锚定星选轨道。',
              ],
              ['分配钱包', '托管次级 ETH 分配与随落笔附加的资产，设有公开取回期限。'],
              [
                '锚定钱包',
                '一个面向 Cosmic Signature NFT（ETH 锚定派发），一个面向 Random Walk NFT（星选资格）。',
              ],
              ['公共物品金库', '接收并转拨每周期的公共物品分配，受益方目前为 Protocol Guild。'],
              [
                '推广储备',
                `每周期接收 ${cst(protocolFacts.outreachReserveCst)} CST，用于社区推广。`,
              ],
              ['宇宙议会', '链上协调机构，完成委托的 CST 在其中表达协调权重。'],
            ],
          },
        },
        {
          kind: 'paragraph',
          text: '合约之外，一个生态正在生长：应用位于 app.cosmicsignature.com，NFT 在 Axiom Zero 市场流通，CST 在 Arbitrum 上有 Uniswap 流动性，Chaos Zero 则为每个周期提供预测场所。它们都不是必需的：本文所述的每项机制，都可以直接调用合约完成。',
        },
      ],
    },
    {
      id: 'performance-cycle',
      number: '3',
      heading: '演绎周期',
      blocks: [
        {
          kind: 'paragraph',
          text: '周期是一段时间之窗：以价格递减的校准窗口开启，在落笔中延展，倒计时结束并有人收官后落幕。本节讲清这座时钟；落笔本身见第 4 节。',
        },
      ],
      subsections: [
        {
          id: 'eth-calibration-window',
          number: '3.1',
          heading: '开场与 ETH 校准窗口',
          blocks: [
            {
              kind: 'paragraph',
              text: `每个周期的首笔落笔必须使用 ETH，其价格由 ETH 校准窗口决定。窗口起始价为上一周期开场实付价格的 ${protocolFacts.ethCalibrationCeilingMultiplier} 倍，随后线性下行，直至起始价的两百分之一加 1 wei。按上线参数，整段下行约需两天；时长与周期时间增量挂钩，会随协议年岁缓慢拉长。若窗口走完仍无人落笔，价格便停在底价等待。第一个周期以固定的 ${protocolFacts.initialGestureCostEth} ETH 开场。`,
            },
            {
              kind: 'paragraph',
              text: '这套开场机制不依赖订单簿：上一周期若开得太便宜，翻倍会先恢复上行空间；翻倍后若显得偏高，两天的缓慢下行总会停在有人愿意开场的位置。',
            },
          ],
        },
        {
          id: 'countdown',
          number: '3.2',
          heading: '收官倒计时',
          blocks: [
            {
              kind: 'paragraph',
              text: `首笔落笔启动时钟，按上线参数将周期收官时间设在约 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时之后。此后每笔 ETH 或 CST 落笔，都会把当前时间增量加到链上收官时间上。增量上线时恰为 1 小时，并在每个周期收官后增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，周期因此逐渐变长，NFT 的铭刻节奏也随岁月放缓。只要落笔不断，周期长度没有硬性上限；但落笔价格持续上行，无限延长在实践中代价高昂。`,
            },
            {
              kind: 'paragraph',
              text: '延长作用于链上存储的收官时间，而非当下时刻。倒计时已过、收官尚未执行时，落笔依然有效：它把存储值再推一个增量，并接任收官之笔，但不会让时钟从头再来。',
            },
          ],
        },
        {
          id: 'finalization',
          number: '3.3',
          heading: '收官与公开收官窗口',
          blocks: [
            {
              kind: 'paragraph',
              text: '周期收官时间一到，收官之笔参与者即可收官。收官是一笔交易：读取协议的 ETH 余额，按第 5 节的轨道发放，铭刻本周期的 NFT 与 CST，为每件新作品记录种子，并排定下一周期。',
            },
            {
              kind: 'paragraph',
              text: `这项权利在 ${protocolFacts.finalGestureExclusivityHours} 小时内专属于收官之笔参与者。窗口过后进入公开收官：任何人都可收官，合约会把实际收官者视为周期受益方，该角色的一切随之归属，包括签名分配的 ETH 份额、CST 铭刻、NFT，以及对已附加资产的优先权。这条规则刻意不留情面：即使参与者消失，协议照样前行；疏忽也有价格，受益方两天内不出手，角色就向第一位来者敞开。`,
            },
            {
              kind: 'paragraph',
              text: `收官之后，下一周期经过一段短暂延迟启用（默认 ${protocolFacts.defaultNextCycleDelayMinutes} 分钟），校准窗口随之开启。`,
            },
          ],
        },
      ],
    },
    {
      id: 'gestures',
      number: '4',
      heading: '落笔',
      blocks: [
        {
          kind: 'paragraph',
          text: '落笔是协议唯一的输入。无论使用哪种货币，每一笔都会延长倒计时、在参与者星选池中计入一次资格、更新第 5.2 节的坚守时钟，还可能按第 7.1 节铭刻参与 CST。',
        },
      ],
      subsections: [
        {
          id: 'eth-gestures',
          number: '4.1',
          heading: 'ETH 落笔',
          blocks: [
            {
              kind: 'paragraph',
              text: `开场之后，每笔 ETH 落笔都会把下一笔的 ETH 落笔价格抬高 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei。这条序列公开而精确，落笔前随时可以从合约读到当前价格。超付的金额会在同一笔交易中退回；只有当退款连 gas 都不够抵时，差额才留在储备中。`,
            },
          ],
        },
        {
          id: 'random-walk-attachment',
          number: '4.2',
          heading: '附加 Random Walk NFT',
          blocks: [
            {
              kind: 'paragraph',
              text: `持有 Random Walk NFT 的参与者，可将其附加到一笔 ETH 落笔上，使该笔价格降低 ${protocolFacts.randomWalkDiscountPercentage}%。NFT 不会转移，合约只是将其标记为已使用。每枚 Random Walk NFT 在所有周期中仅可附加一次：降价因此成了一种消耗品，一个数量固定的外部系列也由此融入协议经济。`,
            },
          ],
        },
        {
          id: 'cst-gestures',
          number: '4.3',
          heading: 'CST 落笔',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST 提供第二条入口。CST 校准窗口的起始价为上一笔 CST 实付价格的 ${protocolFacts.cstCalibrationCeilingMultiplier} 倍，且不低于 ${protocolFacts.cstCalibrationCeilingMinCst} CST，随后在窗口时长内线性降至零。每笔 CST 落笔都会以新的起始价重启窗口，所付 CST 全数销毁，永久移出供应量。`,
            },
            {
              kind: 'paragraph',
              text: `窗口时长本身也是链上的活参数，是协议里一条安静的反馈回路。它从 ${protocolFacts.initialCstCalibrationWindowHours} 小时的基准出发：每笔 ETH 落笔使其缩短约 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，每笔 CST 落笔使其延长约 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。ETH 落笔越密集，CST 价格降得越快，CST 落笔越早变得划算；CST 落笔多了，下行又会放慢。这条回路把每个周期推向两种货币的均衡组合。`,
            },
            {
              kind: 'paragraph',
              text: '价格既然能降到零，足够长的沉寂就能让一笔 CST 落笔近乎免费。这是有意为之：只要有人持有哪怕一点 CST，周期就总能延续；而每笔 CST 落笔的销毁，又把代币供应量与真实使用绑在一起。提交 CST 落笔时需指定可接受的最高价格，交易落地晚于预期也不会多花一分。',
            },
            {
              kind: 'paragraph',
              text: '每个周期的首笔落笔必须使用 ETH；从第二笔起即可使用 CST。',
            },
          ],
        },
        {
          id: 'messages-and-attachments',
          number: '4.4',
          heading: '消息与附加资产',
          blocks: [
            {
              kind: 'paragraph',
              text: `落笔可携带最长 ${protocolFacts.gestureMessageMaxLength} 字节的消息，与落笔一同记录在链上；也可附加 ERC-20 代币或一枚 ERC-721 NFT。附加资产不进入 ETH 储备，而由分配钱包托管；周期收官后，受益方享有优先取回权，并受第 5.4 节的公开取回期限约束。`,
            },
          ],
        },
      ],
    },
    {
      id: 'allocation-tracks',
      number: '5',
      heading: '周期储备与分配轨道',
      blocks: [
        {
          kind: 'paragraph',
          text: '所有落笔支付的 ETH 都汇入协议合约，连同上一周期约一半的储备，共同构成周期储备。收官时读取一次余额，按固定比例发放。',
        },
      ],
      subsections: [
        {
          id: 'distribution-at-finalization',
          number: '5.1',
          heading: '收官时的发放',
          blocks: [
            {
              kind: 'table',
              table: {
                columns: ['ETH 轨道', '占周期储备份额', '获配者'],
                rows: [
                  [
                    '签名分配',
                    `${protocolFacts.mainEthPercentage}%`,
                    '周期受益方，通常为收官之笔参与者。',
                  ],
                  [
                    '时之勇士分配',
                    `${protocolFacts.chronoWarriorEthPercentage}%`,
                    '在位最久的坚守冠军（见第 5.2 节）。',
                  ],
                  [
                    '公共物品分配',
                    `${protocolFacts.publicGoodsPercentage}%`,
                    'Protocol Guild，经公共物品金库转拨。',
                  ],
                  [
                    '锚定派发',
                    `${protocolFacts.anchorDistributionPercentage}%`,
                    '已锚定的 Cosmic Signature NFT，按比例分摊。',
                  ],
                  [
                    'ETH 星选',
                    `${protocolFacts.stellarSelectionEthPercentage}%`,
                    `从本周期落笔资格池中选出 ${protocolFacts.ethStellarSelectionRecipients} 次，均分该份额。`,
                  ],
                  [
                    '滚动储备',
                    `约 ${protocolFacts.compoundingReservePercentage}%（其余部分）`,
                    '滚入下一周期。',
                  ],
                ],
                footnote: '各比例均按收官那一刻协议的 ETH 余额计算。',
              },
            },
            {
              kind: 'paragraph',
              text: '五条发放轨道合计正好一半，其余滚动累积：协议滚动累积，而非抽取，每个周期都以比上一周期更大的储备开场。若收官时没有任何已锚定的 Cosmic Signature NFT，该周期的锚定派发将跳过，这部分份额同样滚入下一周期。',
            },
            {
              kind: 'table',
              table: {
                columns: ['CST 与 NFT 轨道', '发放内容', '获配者'],
                rows: [
                  [
                    '签名分配',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT`,
                    '周期受益方。',
                  ],
                  [
                    '时之勇士',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT`,
                    '时之勇士。',
                  ],
                  [
                    '坚守冠军',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT`,
                    '坚守冠军。',
                  ],
                  [
                    'CST 收官之笔',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT`,
                    '本周期最后一笔 CST 落笔的参与者。',
                  ],
                  [
                    '参与者 NFT 星选',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT，共 ${protocolFacts.nftStellarSelectionRecipients} 次`,
                    '从落笔资格池中选出。',
                  ],
                  [
                    '锚定 NFT 星选',
                    `${cst(protocolFacts.specialAllocationCst)} CST 与 1 枚 NFT，共 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次`,
                    '在已锚定的 Random Walk NFT 中选出。',
                  ],
                  [
                    '推广储备',
                    `${cst(protocolFacts.outreachReserveCst)} CST`,
                    '社区推广（见第 7.1 节）。',
                  ],
                ],
              },
            },
            {
              kind: 'paragraph',
              text: `因此，典型周期共铭刻 ${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT，外加 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST 的固定发放；各笔落笔沿途铭刻的参与 CST 另计。没有 CST 落笔的周期跳过 CST 收官之笔轨道；没有已锚定 Random Walk NFT 的周期跳过锚定星选。`,
            },
          ],
        },
        {
          id: 'endurance-and-chrono',
          number: '5.2',
          heading: '坚守冠军与时之勇士',
          blocks: [
            {
              kind: 'paragraph',
              text: '有两条轨道衡量的是坚持，而非位置。坚守冠军，是本周期内以最近落笔者身份坚守最久的参与者，也就是单笔落笔撑过的最长静默间隔。时之勇士再上一层：谁连续在位坚守冠军的时间最长，谁就是时之勇士。',
            },
            {
              kind: 'paragraph',
              text: '两者的差别细微而真实。慵懒的午后落下一笔、十个小时无人打破，就立下了一段漂亮的坚守间隔；但能否以时之勇士的身份走完周期，取决于这项纪录在他人刷新之前又存续了多久。坚守衡量你创造的间隔，时之勇士衡量纪录存活的时长。两者都要到收官那一刻才尘埃落定。',
            },
          ],
        },
        {
          id: 'stellar-selections',
          number: '5.3',
          heading: '星选',
          blocks: [
            {
              kind: 'paragraph',
              text: `每笔落笔都在本周期的参与者星选池中计入一次资格。收官时，合约为 ETH 星选选出 ${protocolFacts.ethStellarSelectionRecipients} 次资格，均分储备的 ${protocolFacts.stellarSelectionEthPercentage}%；再为 NFT 星选选出 ${protocolFacts.nftStellarSelectionRecipients} 次。选择采用放回方式，同一参与者可能被选中多次；资格随落笔累积，入选频次与参与程度成正比。`,
            },
            {
              kind: 'paragraph',
              text: `另有一条独立的锚定 NFT 星选，在已锚定的 Random Walk NFT 中选出 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，权重按各锚定者锚定的 NFT 数量计。这条轨道只发放 CST 与 Cosmic Signature NFT，不含 ETH。`,
            },
            {
              kind: 'paragraph',
              text: '这些选择背后的随机性在收官时于链上构造，其来源与边界见第 11.3 节。',
            },
          ],
        },
        {
          id: 'delivery-and-timeouts',
          number: '5.4',
          heading: '发放、托管与期限',
          blocks: [
            {
              kind: 'paragraph',
              text: '发放刻意分成两类：主动送达与自行取回。签名分配的 ETH 在收官时直接送达受益方，公共物品转拨亦然；时之勇士的 ETH 与三份 ETH 星选份额则存入分配钱包托管，获配者随时取回。CST 与 NFT 在收官时直接铭刻到各自获配者名下。',
            },
            {
              kind: 'paragraph',
              text: `托管中的分配与附加资产会等待 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周。期限一过，合约允许任何人为自己取回仍未取回的分配。这条规则与公开收官窗口一脉相承：协议不为缺席者无限期停留，每份发放终会到达想要它的人手中。请及时取回。`,
            },
          ],
        },
      ],
    },
    {
      id: 'the-art',
      number: '6',
      heading: '艺术：确定性的三体签名',
      blocks: [
        {
          kind: 'paragraph',
          text: '每枚 Cosmic Signature NFT 都是对引力三体问题的一次渲染：三个质量相近的天体在牛顿引力下互绕。三体问题没有一般解析解，轨迹天然混沌，初始条件的毫厘之差会演成完全不同的舞步。这种混沌正是整个系列的引擎：种子决定初始条件，物理完成其余一切，没有两幅签名会重样。',
        },
        {
          kind: 'paragraph',
          text: '任何阶段都没有生成式模型参与。没有训练数据，没有采样，也没有提示词。管线就是一段物理模拟加一个渲染器，以 Rust 写成，完全开源，彻底确定。',
        },
      ],
      subsections: [
        {
          id: 'art-pipeline',
          number: '6.1',
          heading: '渲染管线',
          blocks: [
            {
              kind: 'list',
              items: [
                '种子。铭刻时，合约从链上数据导出 32 字节种子（见第 11.3 节），并与 NFT 一同存储。种子初始化一个 SHA3-256 随机数生成器，此后的一切都是它的纯函数。',
                '模拟。十万组候选构型分别通过四阶 Yoshida 辛积分器演算，每组推进 1,000,000 个物理步；这种积分器能在长时间尺度上保持系统的能量行为。',
                '遴选。Borda 排序聚合按混沌程度与三角形的等边程度为候选打分，选出视觉上最有意味的一条轨道。',
                '镜头。缓慢的椭圆镜头漂移穿行于轨道之间，赋予每幅签名电影般的视差。',
                '色彩。色彩在 OKLab 感知色彩空间中混合，各天体色相相隔 120°，并由漂移与正弦波调制。',
                '光谱渲染。从 380 至 700 纳米划分 64 个波长区间，以随速度变化的线宽和景深渲染轨迹。',
                '收尾。AgX 色调映射、辉光、OpenSimplex 星云层与色彩分级共同完成画面。',
              ],
            },
            {
              kind: 'paragraph',
              text: '每枚 NFT 的最终输出，是一张 16 位 PNG 与一段 30 秒 H.265 视频。',
            },
          ],
        },
        {
          id: 'reproducibility-and-license',
          number: '6.2',
          heading: '可复现性与许可',
          blocks: [
            {
              kind: 'paragraph',
              text: '确定性靠机制保证，而非口头承诺。同一种子在任何机器上都产出逐像素一致的图像，生成帧的 SHA-256 哈希在持续集成中逐一断言。种子全部在链上，管线完全公开，这个系列因此不依赖任何服务器：哪怕明天所有服务器都消失，每幅签名都能从链上重生。',
            },
            {
              kind: 'paragraph',
              text: '所有者可在链上为 NFT 命名，最长 32 字节。项目自有的合约、着色器与渲染管线均以 CC0 1.0 献入公有领域，不保留任何权利；第三方依赖保留各自的许可。',
            },
          ],
        },
      ],
    },
    {
      id: 'cst',
      number: '7',
      heading: 'CST 代币',
      blocks: [
        {
          kind: 'paragraph',
          text: 'CST 是协议的 ERC-20 代币。供应量从零起步，代币合约只接受协议合约的铭刻与销毁指令。流通中的每一枚 CST，都能追溯到某个周期里的一次参与。',
        },
      ],
      subsections: [
        {
          id: 'imprint-rules',
          number: '7.1',
          heading: '铭刻规则',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST 经三条途径进入流通。参与 CST 在落笔时按下方公式铭刻。表彰 CST 在收官时铭刻：本周期每份 NFT 发放都伴随 ${cst(protocolFacts.specialAllocationCst)} CST，典型周期共 ${protocolFacts.typicalNftsPerCycle} 份。此外，每周期还有 ${cst(protocolFacts.outreachReserveCst)} CST 进入推广储备，由团队用于社区推广；这是团队经手的唯一一条固定 CST 流，且不附带任何特殊权限。`,
            },
            {
              kind: 'formula',
              formula: protocolFacts.dynamicCstRewardFormula,
              caption: '一笔落笔铭刻的参与 CST。经过时间自上一笔起算，并按当前周期时间增量归一化。',
            },
            {
              kind: 'paragraph',
              text: '直白地说，数量随距上一笔时间的平方根增长。上一笔落下一秒后就跟进，几乎什么也铭刻不到；终结一整天沉默的一笔，能铭刻数百 CST。',
            },
            {
              kind: 'table',
              table: {
                columns: ['距上一笔的时间', '参与 CST'],
                rows: protocolFacts.dynamicCstRewardExamples.map((example) => [
                  ELAPSED_ZH[example.elapsed] ?? example.elapsed,
                  example.cst,
                ]),
                footnote: `按上线时恰为 ${protocolFacts.dynamicCstRewardExamplesAssumeIncrementHours} 小时的时间增量计算。增量逐周期增长后，实际数额会略低于表中值；实时预览与合约本身才是最终依据。`,
              },
            },
          ],
        },
        {
          id: 'supply-dynamics',
          number: '7.2',
          heading: '销毁与供应动态',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST 一经使用即离开流通：每笔 CST 落笔支付的全部价格都会销毁。供应量因此由行为塑造：沉寂的周期铭刻的参与 CST 不多，活跃的 CST 使用又把供应量烧回去，固定的表彰与推广两条流则为每个典型周期稳定注入 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST。没有上限，没有预留份额，也没有团队分配。`,
            },
            {
              kind: 'paragraph',
              text: '平方根公式本身就是一道供应闸门，由 V2 升级引入（见第 12.2 节）。最初的设计是每笔固定铭刻 100 CST，机器速度的连续落笔由此成了源源不断的新 CST 来源。改用现行规则后，一串急促的落笔几乎什么都铭刻不到；创造供应的，是耐心的参与。',
            },
          ],
        },
        {
          id: 'coordination-weight',
          number: '7.3',
          heading: '协调权重',
          blocks: [
            {
              kind: 'paragraph',
              text: 'CST 同时是宇宙议会（第 9 节）的权重代币。权重在委托后生效：持有者把权重委托给自己或其他地址，此后每枚 CST 表达一个单位的协调权重。代币采用基于时间戳的检查点，提案快照对应的是钟表时间，而非区块高度。',
            },
          ],
        },
      ],
    },
    {
      id: 'anchoring',
      number: '8',
      heading: '锚定',
      blocks: [
        {
          kind: 'paragraph',
          text: `锚定是协议的长期对齐方式。所有者可将 Cosmic Signature NFT 锚定至协议；锚定期间，它按比例累积每周期 ${protocolFacts.anchorDistributionPercentage}% 的锚定派发，累积的 ETH 在解锚时取回。锚定没有固定期限，也没有任何罚则，但它是每枚 NFT 一次性的决定：每枚 NFT 一生仅可锚定一次，解锚即永久失去锚定资格。`,
        },
        {
          kind: 'paragraph',
          text: '一生一次的规则，用一个不可逆的抉择取代了常见的锁定时间表，也让已锚定的集合有了真实的退出成本。要不要继续锚定，是每个周期都可以重新掂量的活问题；要不要解锚，则是永久的决定。',
        },
        {
          kind: 'paragraph',
          text: `Random Walk NFT 的锚定自成一线，目的也不同：已锚定的 Random Walk NFT 参与锚定 NFT 星选（见第 5.3 节），每周期 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，每次携带 ${cst(protocolFacts.specialAllocationCst)} CST 与一枚 Cosmic Signature NFT。Random Walk 锚定不含 ETH 派发。一生一次的规则同样适用。`,
        },
      ],
    },
    {
      id: 'cosmic-council',
      number: '9',
      heading: '宇宙议会',
      blocks: [
        {
          kind: 'paragraph',
          text: `宇宙议会是协议的链上协调机构，基于经过审计的 OpenZeppelin Governor 框架构建，以 CST 为权重代币。任何持有至少 ${protocolFacts.councilProposalThresholdCst} CST 委托权重的地址都可提交协调提案。提案先经过 ${protocolFacts.councilVotingDelayDays} 天协调延迟，再进入 ${protocolFacts.councilVotingPeriodWeeks} 周的协调期。`,
        },
        {
          kind: 'paragraph',
          text: `提案通过需同时满足两个条件：支持权重高于反对权重，且支持与弃权权重之和达到 CST 总供应量 ${protocolFacts.councilQuorumPercent}% 的协调法定权重。反对权重不计入法定权重。表达权重是一次密码学行为，不是股份或权益工具；委托随时可以更改。`,
        },
        {
          kind: 'paragraph',
          text: '今天，议会与团队范围有限的所有者角色并行运作。待第 13 节的去中心化步骤完成，它就是协议仅存的协调层。',
        },
      ],
    },
    {
      id: 'public-goods',
      number: '10',
      heading: '公共物品',
      blocks: [
        {
          kind: 'paragraph',
          text: `每个周期都将周期储备的 ${protocolFacts.publicGoodsPercentage}% 转拨给公共物品金库，其受益方目前是 Protocol Guild，即 170 余位以太坊核心协议贡献者的集体资助机制。转拨作为收官的一部分在链上强制执行，没有人逐周期决定是否兑现。协议使用得越多，流向以太坊赖以运转的基础设施的也就越多。`,
        },
        {
          kind: 'paragraph',
          text: '道理并不复杂：Cosmic Signature 因以太坊基础层持续运转而存在，一个活在公共基础设施之上的协议，就该用它做其他一切事情的方式来资助这层设施：机械地、按节奏地、公开地。金库也接受周期之外的自愿 ETH 贡献。',
        },
        {
          // lexicon-allow-start: 税务免责声明必须点名其否认的概念。
          kind: 'note',
          text: '此处是将 ETH 转拨至公共物品地址（目前为 Protocol Guild）的行为，不构成美国税法意义上的慈善捐赠，Cosmic Signature 亦不对其在任何司法辖区的税务处理作出任何陈述。',
          // lexicon-allow-end
        },
      ],
    },
    {
      id: 'security',
      number: '11',
      heading: '安全、随机性与可验证性',
      blocks: [],
      subsections: [
        {
          id: 'independent-review',
          number: '11.1',
          heading: '独立审查',
          blocks: [
            {
              kind: 'paragraph',
              text: '2025年末，Hacken 对 Cosmic Signature 合约完成了独立安全审查，范围覆盖核心协议、CST 代币、两个 NFT 集成、锚定钱包，以及配套的钱包与系统管理合约。最终报告于2026年1月发布，共列出 23 项发现：无严重级，无高危级，中危 3 项、低危 8 项、信息级 12 项，其中多数是团队已审阅并附书面理由接受的设计取舍。',
            },
            {
              kind: 'paragraph',
              text: '人工审查之外，Hacken 还对 14 项系统不变量做了模糊测试，例如协议持有的 ETH 总额必须始终等于存入减去发放。全部 14 项在 10,000 次运行中均保持成立。报告全文公开，链接见参考资料。',
            },
            {
              kind: 'paragraph',
              text: '外部审查之外，代码仓库还带有 Certora 形式化验证规范、Solidity SMTChecker 配置、Slither 静态分析，以及一套以 Solidity 源码全覆盖为目标的测试。',
            },
          ],
        },
        {
          id: 'defensive-design',
          number: '11.2',
          heading: '防御式设计',
          blocks: [
            {
              kind: 'list',
              items: [
                '重入防护覆盖核心合约的每个外部入口。',
                '取回优先于送达：次级 ETH 分配与附加资产存入托管，而非在收官时直接发送，任何获配方合约都无法借此阻塞周期落幕。',
                '容错转拨：公共物品转账若无法完成，收官照常进行，事件记录在案，留待后续处理。',
                '周期间锁定：周期运行期间，核心参数不可更改，合约不可升级（见第 13 节）。',
              ],
            },
          ],
        },
        {
          id: 'randomness',
          number: '11.3',
          heading: '随机性',
          blocks: [
            {
              kind: 'paragraph',
              text: '协议在两处需要随机性：收官时的星选，以及每枚新 NFT 的种子。它在链上把上一区块哈希、当前基础费，以及来自 ArbSys 与 ArbGasInfo 预编译合约的 Arbitrum 专属熵（上一 Arbitrum 区块哈希、gas 积压量与 L1 计价计数器）折叠成一个种子，再以 keccak256 从中逐个导出随机值。预编译调用具备容错性，某一来源不可用时，构造会退回其余来源。',
            },
            {
              kind: 'paragraph',
              text: '这是有意的极简：不引入预言机，不依赖外部委员会，也没有任何可能让周期搁浅的回调。取舍摆在明处：排序器理论上可以影响区块级输入，而设计限定了这种影响所能触及的范围。随机性的消费者只有星选与艺术种子；倒计时、落笔价格序列和第 5 节的每一个百分比都是确定性的。整个构造每次收官只使用一次，而收官本身是任何人都能提交的公开交易。',
            },
          ],
        },
        {
          id: 'open-verification',
          number: '11.4',
          heading: '公开验证',
          blocks: [
            {
              kind: 'paragraph',
              text: '全部合约都已在 Sourcify 上以精确匹配状态完成源码验证（链 ID 42161），地址固定于附录 A。艺术管线的确定性由持续集成断言：生成帧的 SHA-256 哈希逐一核对。项目自有代码均为 CC0：任何人都可以复刻合约、渲染器或网站，也可以用种子重新生成任何一幅签名来核验。',
            },
          ],
        },
      ],
    },
    {
      id: 'upgrade-history',
      number: '12',
      heading: '部署历史与前路',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature 的设计目标是“完工”。可升级性之所以存在，是为了在协议早期能对照真实行为修正机制；设计定稿之日，就是它谢幕之时。本节记录已经发生的与尚待发生的。',
        },
      ],
      subsections: [
        {
          id: 'v1',
          number: '12.1',
          heading: 'V1：上线',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V1 将协议部署上 Arbitrum One，置于 UUPS 可升级代理之后：周期、落笔、分配轨道、锚定、议会与艺术管线，与本文所述基本一致。升级需由所有者发起，且只能在周期间进行。协议刻意不设任何在周期进行中修改合约的机制，无论情形如何。',
            },
          ],
        },
        {
          id: 'v2',
          number: '12.2',
          heading: 'V2 升级：现已上线',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V2 是当前部署的实现，共有五项改动，每一项都回应了已观察到或可预见的行为。',
            },
            {
              kind: 'list',
              items: [
                '动态参与 CST。每笔固定 100 CST 改为第 7.1 节的平方根公式。固定铭刻曾让高频连续落笔沦为凭空生成 CST 的手段；新规则按耐心铭刻，而非按频次。',
                '最低铭刻保护。每个落笔方法新增一项参数，用于指定参与者可接受的最低参与 CST 数额，避免签名与执行之间的时间差造成损失。',
                '活的 CST 校准窗口。窗口时长改为链上存储值，随落笔构成变化（见第 4.3 节），让 ETH 与 CST 两条路径互相制衡。',
                `更长的专属窗口。收官之笔参与者的专属收官窗口由 24 小时延长至 ${protocolFacts.finalGestureExclusivityHours} 小时。`,
                '时序与算术加固。倒计时延长一律作用于链上存储的收官时间，堵住了到期后用近乎免费的 CST 落笔反复外推截止时间的漏洞；排定下一周期的算术同样加固，任何参数组合，无论多么极端，都无法阻止周期收官。',
              ],
            },
          ],
        },
        {
          id: 'v3',
          number: '12.3',
          heading: '规划中的 V3 升级',
          blocks: [
            {
              kind: 'paragraph',
              text: '正在公开仓库中开发的 V3 只改一件事：晚出手的代价。周期收官时间前的最后 20 分钟内，一切落笔价格（ETH、附加 Random Walk NFT 的 ETH、CST）都会乘上一个溢价系数，从 1 倍按多项式攀升至 10 倍：到点即达 10 倍，超时落笔同样按 10 倍计。',
            },
            {
              kind: 'formula',
              formula: 'm(t) = 1 + 9 \u00b7 (t / T)^8\uff0c\u5176\u4e2d T = 20 \u5206\u949f',
              caption: '临近收官的价格溢价；t 为最后 20 分钟窗口内已经过的时间。',
            },
            {
              kind: 'paragraph',
              text: '指数是关键。八次方的曲线让溢价在窗口的大部分时间里几乎无感，只在最后陡然直立：距收官 10 分钟约 1.04 倍，5 分钟约 1.9 倍，1 分钟约 7 倍，到点 10 倍。',
            },
            {
              kind: 'paragraph',
              text: '意图是改写终局。V2 之下，拖到最后几秒落笔近乎零成本，周期可能在一阵低信号的卡点操作中收场。V3 之下，压哨一笔成了昂贵的表态，贯穿周期的持续参与相对便宜，想在第 5.2 节的坚守轨道上偷袭得手，也难得多。参数在部署前仍可能微调，机制则如上所述。',
            },
          ],
        },
      ],
    },
    {
      id: 'decentralization',
      number: '13',
      heading: '全面去中心化之路',
      blocks: [
        {
          kind: 'paragraph',
          text: '协议目前有一位所有者，即部署它的地址。这一角色真实存在，本文无意淡化；但它天生范围有限，并且注定是临时的。',
        },
        {
          kind: 'paragraph',
          text: '周期运行期间，核心参数全部锁定：所有者不能在周期中途更改比例、增量或价格，也不能升级合约；所有者的操作只存在于周期与周期之间的缝隙里。另有三项范围更窄的权限随时可用：把下一周期的启用时间向后推（仅限其首笔落笔到来之前）、调整下一周期前的延迟，以及管理外围合约，即公共物品金库受益方、NFT 元数据 URI 与托管取回期限。任何所有者权限都触不到托管中的分配、已铭刻的 NFT、已记录的种子或任何人的 CST 余额；也没有任何团队钱包从落笔中收取 ETH。',
        },
        {
          kind: 'paragraph',
          text: '这些权限之所以存在，是因为机制是全新的。V2 的每一项改动都来自线上真实行为的教训，V3 亦然；一段有边界、全公开的调整期，是设计走向完工的方式。清单里最强的权限是升级本身，而它同样公开：新实现上链即可见、可验证，且必须赶在下一周期开始之前完成。',
        },
        {
          kind: 'paragraph',
          text: '终点是这样约定的：待以 V3 为首的剩余升级完成、机制与代币设计定稿，部署者地址将交出全部特权控制。所有者角色将永久离开部署者，或转交宇宙议会，或直接放弃所有权，具体方式会提前公布。自那时起，任何私人主体都无法再升级协议或更改参数，部署者地址所拥有的，与其他任何地址再无不同。留下来的，是按部署形态运行的协议、作为协调层的议会，以及艺术本身。',
        },
        {
          kind: 'paragraph',
          text: '这一进程的每一步都在链上公开可见，包括最后一步。',
        },
      ],
    },
    {
      id: 'clarifications',
      number: '14',
      heading: '释疑与风险因素',
      blocks: [],
      subsections: [
        {
          id: 'what-it-is-not',
          number: '14.1',
          heading: 'Cosmic Signature 不是什么',
          blocks: [
            // lexicon-allow-start: 否认文案必须点名其否认的概念，与常见问题页做法一致。
            {
              kind: 'paragraph',
              text: 'Cosmic Signature 不是彩票，不是赌场，也不是赌博产品。这里没有庄家，没有荷官，也没有赌注。参与者以价值换取参与本身：每一笔都是塑造作品、延长周期并永久记录在链上的表达行为。协议不留任何运营方抽成；第 5 节的每条分配轨道，流向的都是参与者、已锚定的 NFT、滚动储备或公共物品。',
            },
            {
              kind: 'paragraph',
              text: 'Cosmic Signature 也不是投资产品，本文的任何内容都不构成投资建议或证券要约。CST 与 Cosmic Signature NFT 是参与凭据与艺术对象，协议不对其价格、流动性或未来价值作任何承诺；任何人都不应带着“凭他人努力获利”的预期取得它们。',
            },
            // lexicon-allow-end
          ],
        },
        {
          id: 'risk-factors',
          number: '14.2',
          heading: '风险因素',
          blocks: [
            {
              kind: 'list',
              items: [
                '智能合约风险。合约经过审查、形式化分析与源码验证，但这些都不构成保证；任何持有价值的软件都可能存在未知缺陷。',
                '随机性边界。星选使用区块衍生熵（见第 11.3 节），排序器理论上可施加影响；设计限定了后果的范围，但无法彻底消除。',
                `时限责任。${protocolFacts.finalGestureExclusivityHours} 小时收官窗口与 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 周托管期限是真实的截止时间；逾期未取回的分配将向他人开放，这正是设计使然。`,
                '参数变更。去中心化步骤完成之前，参数仍可能按第 13 节所述在周期间调整；每次变更都会在下一周期开始前公开。',
                '资产波动。ETH、CST 与 NFT 的价值都会波动。参与需要花费真金白银，应把落笔当作为参与和艺术付出的花费，而非获取金钱的途径。',
                '监管不确定性。数字资产的法律定性因司法辖区而异，且仍在演变。',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'conclusion',
      number: '15',
      heading: '结语',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature 想要建成这样一个生成艺术协议：不需要任何人的许可，最终也不需要任何人的照看。机制小到可以完整写清：价格递减的窗口、落笔不断延长的倒计时、固定的分配比例、滚动累积的储备，以及一门只由物理和种子决定的艺术。剩下的升级屈指可数，且全部公开。待它们完成，所有者角色退场，留下的正是本文所写的一切：一座时钟、一份储备、一枚代币、一个议会，以及一幅接一幅、记录着每双塑造之手的签名。',
        },
      ],
    },
    {
      id: 'appendix-a',
      number: 'A',
      heading: '附录 A：已验证合约地址',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['合约', '地址（Arbitrum One）'],
            rows: [
              ['协议合约（代理）', protocolFacts.contractAddresses.proxy],
              ['协议实现（V2）', protocolFacts.contractAddresses.implementation],
              ['CST 代币', protocolFacts.contractAddresses.cstToken],
              ['Cosmic Signature NFT', protocolFacts.contractAddresses.cosmicSignatureNft],
              ['Random Walk NFT', protocolFacts.contractAddresses.randomWalkNft],
              ['宇宙议会', protocolFacts.contractAddresses.cosmicCouncil],
              ['公共物品金库', protocolFacts.contractAddresses.publicGoodsVault],
              ['推广储备', protocolFacts.contractAddresses.outreachReserve],
              ['分配钱包', protocolFacts.contractAddresses.allocationsWallet],
              [
                '锚定钱包（Cosmic Signature NFT）',
                protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
              ],
              ['锚定钱包（Random Walk NFT）', protocolFacts.contractAddresses.rwlkAnchoringWallet],
            ],
            footnote:
              '全部合约均已在 Sourcify 上完成精确匹配验证（链 ID 42161）。代理地址是协议的永久地址；实现只会经由第 12、13 节所述的公开升级流程更替。',
          },
        },
      ],
    },
    {
      id: 'appendix-b',
      number: 'B',
      heading: '附录 B：参数一览',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['参数', '数值'],
            rows: [
              ['首个周期开场价格', `${protocolFacts.initialGestureCostEth} ETH（固定）`],
              [
                'ETH 校准窗口上限',
                `上一周期开场实付价格的 ${protocolFacts.ethCalibrationCeilingMultiplier} 倍`,
              ],
              [
                'ETH 校准窗口下限',
                `上限 ÷ ${protocolFacts.ethCalibrationFloorDivisor}，再加 1 wei`,
              ],
              [
                'ETH 落笔价格步进',
                `每笔 ETH 落笔上调 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei`,
              ],
              [
                'Random Walk NFT 降价',
                `${protocolFacts.randomWalkDiscountPercentage}%，每枚一生一次`,
              ],
              [
                'CST 校准窗口上限',
                `max(上一笔 CST 实付价格的 ${protocolFacts.cstCalibrationCeilingMultiplier} 倍，${protocolFacts.cstCalibrationCeilingMinCst} CST)`,
              ],
              ['CST 校准窗口下限', `${protocolFacts.cstCalibrationFloorCst} CST`],
              [
                'CST 校准窗口时长',
                `初始基准 ${protocolFacts.initialCstCalibrationWindowHours} 小时；每笔 ETH 落笔约 -${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%，每笔 CST 落笔约 +${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%`,
              ],
              [
                '开场后的初始倒计时',
                `上线时约 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小时`,
              ],
              [
                '每笔落笔的时间增量',
                `上线时 ${protocolFacts.initialCycleTimeIncrementHours} 小时，每周期增长 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%`,
              ],
              ['专属收官窗口', `${protocolFacts.finalGestureExclusivityHours} 小时`],
              ['托管取回期限', `${protocolFacts.secondaryRetrievalTimeoutWeeks} 周，随后公开取回`],
              ['落笔消息长度上限', `${protocolFacts.gestureMessageMaxLength} 字节`],
              [
                'ETH 分配轨道',
                `签名 ${protocolFacts.mainEthPercentage}%、时之勇士 ${protocolFacts.chronoWarriorEthPercentage}%、公共物品 ${protocolFacts.publicGoodsPercentage}%、锚定派发 ${protocolFacts.anchorDistributionPercentage}%、ETH 星选 ${protocolFacts.stellarSelectionEthPercentage}%`,
              ],
              ['滚动储备', `约 ${protocolFacts.compoundingReservePercentage}% 滚入下一周期`],
              ['每份 NFT 发放的表彰 CST', `${cst(protocolFacts.specialAllocationCst)} CST`],
              ['每周期推广储备', `${cst(protocolFacts.outreachReserveCst)} CST`],
              [
                '典型周期铭刻量',
                `${protocolFacts.typicalNftsPerCycle} 枚 NFT，${cst(protocolFacts.typicalCstImprintsPerCycle)} CST 固定发放`,
              ],
              [
                '议会参数',
                `提案门槛 ${protocolFacts.councilProposalThresholdCst} CST，延迟 ${protocolFacts.councilVotingDelayDays} 天，协调期 ${protocolFacts.councilVotingPeriodWeeks} 周，法定权重 ${protocolFacts.councilQuorumPercent}%`,
              ],
              [
                '下一周期前延迟',
                `默认 ${protocolFacts.defaultNextCycleDelayMinutes} 分钟，所有者可调整`,
              ],
            ],
            footnote: '会演变或可调整的参数以上线值列出；实时数值以合约为准。',
          },
        },
      ],
    },
  ],
  references: {
    id: 'references',
    heading: '参考资料',
    items: [
      {
        label: 'Cosmic Signature 合约仓库（源码、测试与验证工具）',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature',
      },
      {
        label: 'Cosmic Signature 应用',
        href: 'https://app.cosmicsignature.com',
      },
      {
        label: 'Cosmic Signature 协议站点',
        href: 'https://cosmicsignature.com',
      },
      {
        label: 'Hacken 对 Cosmic Signature 合约的安全审查（2026年1月）',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
      },
      {
        label: 'Protocol Guild 文档',
        href: 'https://protocol-guild.readthedocs.io',
      },
      {
        label: 'OpenZeppelin Governor 文档',
        href: 'https://docs.openzeppelin.com/contracts/5.x/governance',
      },
      {
        label: 'Arbitrum One',
        href: 'https://arbitrum.io',
      },
    ],
  },
  citation: `Bobrovytsky, T. (2026). Cosmic Signature: A Procedural On-Chain Art Protocol. Version ${WHITE_PAPER_VERSION}.`,
  licenseNote: '本文与 Cosmic Signature 全部项目自有材料一样，依 CC0 1.0 献入公有领域。',
} as const satisfies WhitePaperContent;
