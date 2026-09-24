import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** Simplified Chinese copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyZh: RiskCopy = {
  title: '风险披露',
  // lexicon-allow-start: 法律否认文案须明确列出所排除的类别。
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。它不是彩票、赌场、赌博产品或投资产品，也不承诺任何财务结果。',
  // lexicon-allow-end
  keyPoint: {
    title: '参与之前',
    text: '只用你能承受失去的资金落笔。无论周期后来如何发展，落笔的花费都不会退还。',
  },
  groups: [
    {
      id: 'mechanics',
      heading: '周期机制',
      risks: [
        '当后续落笔跟上时，你落笔所花的 ETH 或 CST 不会退还。',
        `每一次 ETH 落笔都会使下一次 ETH 落笔价格提高 ${facts.ethGestureCostStepUpPercent}%，因此重复落笔的价格会逐次上升。`,
        '校准窗口会改变 CST 落笔价格：无人进行 CST 落笔时价格持续下降，每次 CST 落笔后又会以更高的价格重新开始，因此你看到的价格可能在交易上链前发生变化。',
      ],
      source: '规则见服务条款中的<termsMechanics>协议机制与智能合约</termsMechanics>。',
    },
    {
      id: 'timing',
      heading: '时间与取回',
      risks: [
        `完成收官之笔的参与者可在周期收官时间之后的 ${facts.finalGestureExclusivityHours} 小时内独自完成收官。此后任何人都可以完成收官，并依照合约规则成为签名分配的获配者。`,
        `其他 ETH 分配与附加资产默认为获配者保留 ${facts.secondaryRetrievalTimeoutWeeks} 周。此后任何人都可以为自己取回剩余部分。`,
      ],
      source: '规则见服务条款中的<termsRetrieval>取回分配</termsRetrieval>。',
    },
    {
      id: 'permanent',
      heading: '不可撤销的操作',
      risks: [
        '已确认的交易无法撤销、取消或退款。',
        '用于减免 ETH 落笔价格的 Random Walk NFT 会被用掉：它再也不能用于减免价格。',
        '每个 NFT 只能锚定一次。解锚后，不能再次锚定。',
      ],
      source: '规则见服务条款中的<termsRandomWalk>Random Walk NFT 价格减免</termsRandomWalk>。',
    },
    {
      id: 'wallets',
      heading: '钱包与密钥',
      risks: [
        '密钥只由你自己掌握。任何拿到你助记词的人都能控制你的钱包，而遗失的助记词无法找回。',
        '钱包提示授予的权限可能比看上去更多。请阅读每一项批准，并只使用<securityOfficial>官方地址</securityOfficial>。',
      ],
      source: '规则见服务条款中的<termsEligibility>资格与账户要求</termsEligibility>。',
    },
    {
      id: 'availability',
      heading: '网络与应用',
      risks: [
        '网络拥堵、RPC 中断、索引延迟或应用问题都可能延迟或阻断交易，以及本网站显示的数据。',
        '本网站显示的数据可能比链上状态滞后几秒或更久。两者不一致时，以 Arbitrum 上的合约为准。',
        '智能合约可能存在审计未能发现的缺陷。审计检查了哪些内容，请见<audits>审计</audits>。',
      ],
      source: '规则见服务条款中的<termsRisks>风险与免责声明</termsRisks>。',
    },
    {
      id: 'value',
      heading: '价值与结果',
      risks: [
        'ETH、CST 与 NFT 的市场价值可能大幅波动，甚至归零。',
        // lexicon-allow-start: 否认文案须明确说明不保证财务回报。
        '不得将 CST 与 NFT 理解为有保证的回报或金融产品。',
        // lexicon-allow-end
        '任何落笔都不保证获得分配。结果由公开的合约规则决定，而非链下承诺。',
      ],
      source: '规则见服务条款中的<termsNoGuarantee>不保证结果</termsNoGuarantee>。',
    },
  ],
  participation: {
    heading: '参与者会做什么',
    paragraphs: [
      '参与者在演绎周期中落笔。落笔会影响不断演变的协议状态，可能铭刻参与 CST，并构成确定性 Cosmic Signature NFT 艺术的创作背景。所有结果均由公开的智能合约机制决定，而非链下承诺。',
      // lexicon-allow-start: 链接文字列出目标页面明确否认的类别。
      '了解为什么 Cosmic Signature <notALottery>不是彩票、赌场或投资</notALottery>。',
      // lexicon-allow-end
    ],
  },
};
