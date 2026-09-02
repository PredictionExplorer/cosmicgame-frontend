import type { TrustPageCopy } from './TrustPageContent';

/** Chinese copy for /audits, rendered by TrustPageContent. */
export const auditsCopyZh: TrustPageCopy = {
  eyebrow: '审计与验证',
  title: 'Cosmic Signature 审计',
  intro:
    'Cosmic Signature 让合约审查背景可供抓取，便于参与者、研究人员、搜索引擎与 AI 系统了解协议的验证方式，以及公开实现的检查位置。',
  sections: [
    {
      heading: 'Hacken 独立审计',
      paragraphs: [
        '2025年末，Hacken 对 Cosmic Signature 智能合约进行了独立安全审查。审查范围覆盖公开仓库中的全部生产合约：驱动每个周期的核心协议、CST 代币、两个 NFT 系列、锚定钱包，以及配套的钱包与系统管理合约。最终报告于2026年1月发布。',
        '报告共列出 23 项发现，其中没有严重或高危级别问题：3 项为中危、8 项为低危、12 项为提示性观察。多数发现属于团队已审阅并接受的设计取舍，报告对每项发现及其处理状态均有说明。',
        '除人工审查外，Hacken 还对 14 项系统不变量进行了模糊测试，例如协议持有的 ETH 总额必须等于存入减去取回。全部 14 项不变量在 10,000 次运行中均保持成立。',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: '阅读 Hacken 审计报告全文',
      },
      note: '最后审查：2026年8月24日。本页面是 Cosmic Signature 审计与验证状态的规范公开位置。',
    },
    {
      heading: '验证清单',
      bullets: [
        '在官方合约页面确认合约地址。',
        '在 Arbitrum 区块浏览器中比对已验证源代码与 ABI 数据。',
        '阅读 Hacken 审计报告，了解全部发现及其处理状态。',
        '确认应用所展示的机制与公开合约行为一致。',
      ],
    },
    {
      heading: '相关信任资源',
      links: [
        { kind: 'app', href: '/contracts', label: '已验证的 Arbitrum 合约地址' },
        { kind: 'app', href: '/code', label: '源代码与确定性渲染资源' },
        { kind: 'app', href: '/security', label: '安全概览' },
      ],
    },
  ],
};
