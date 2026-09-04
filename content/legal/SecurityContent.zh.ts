import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /security, rendered by TrustPageContent. */
export const securityCopyZh: TrustPageCopy = {
  eyebrow: '信任与安全',
  title: 'Cosmic Signature 安全',
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。其安全体系依靠公开的智能合约、透明的协议数据、审慎的钱包交互，以及清晰的参与者教育。',
  sections: [
    {
      heading: '安全模型',
      paragraphs: [
        '协议操作由 Arbitrum 智能合约记录。连接钱包或落笔前，可通过公开页面核对合约地址、源代码、验证资料及协议运行所依赖的条件。',
      ],
      bullets: [
        '请使用官方应用 `https://app.cosmicsignature.com/`。',
        '进行链上交互前，请在合约页面核对合约地址。',
        '仔细审阅钱包提示；区块链交易无法撤销。',
        '不得将 CST、NFT、落笔或分配视为有保证的财务结果。',
      ],
    },
    {
      heading: '验证资源',
      paragraphs: [
        '可见的应用内容、已验证合约、源代码与 Arbitrum 实时数据彼此一致，是最有力的安全信号。',
      ],
      links: [
        { kind: 'app', href: '/contracts', label: 'Cosmic Signature 合约与 Arbitrum 地址' },
        { kind: 'app', href: '/code', label: 'Cosmic Signature 源代码与渲染流水线' },
        { kind: 'app', href: '/audits', label: '审计与形式化验证说明' },
        { kind: 'app', href: '/risk-disclosures', label: '风险披露与参与说明' },
      ],
    },
  ],
};
