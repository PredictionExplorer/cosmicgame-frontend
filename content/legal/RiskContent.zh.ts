import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyZh: TrustPageCopy = {
  eyebrow: '风险与参与说明',
  title: 'Cosmic Signature 风险披露',
  // lexicon-allow-start: 法律否认文案须明确列出所排除的类别。
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。它不是彩票、赌场、赌博产品或投资产品，也不承诺任何财务结果。',
  // lexicon-allow-end
  sections: [
    {
      heading: '主要风险',
      bullets: [
        '区块链交易公开，且通常无法撤销。',
        '钱包安全、私钥保管与交易批准均由参与者自行负责。',
        '网络拥堵、RPC 中断、索引延迟或应用问题都可能影响使用体验。',
        '参与前应审阅协议参数、分配规则与时间安排。',
        // lexicon-allow-start: 否认文案须明确说明不保证财务回报。
        '不得将 CST 与 NFT 理解为有保证的回报或金融产品。',
        // lexicon-allow-end
      ],
    },
    {
      heading: '参与者会做什么',
      paragraphs: [
        '参与者在演绎周期中落笔。落笔会影响不断演变的协议状态，可能铭刻参与 CST，并构成确定性 Cosmic Signature NFT 艺术的创作背景。所有结果均由公开的智能合约机制决定，而非链下承诺。',
      ],
    },
    {
      heading: '相关页面',
      links: [
        // lexicon-allow-start: 链接标题列出目标页面明确否认的类别。
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Cosmic Signature 是彩票、赌场或投资吗？',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: '服务条款' },
        { kind: 'app', href: '/security', label: '安全概览' },
      ],
    },
  ],
};
