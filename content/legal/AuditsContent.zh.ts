import type { AuditsCopy } from './AuditsContent';

/** Simplified Chinese copy for /audits, rendered by AuditsContent. */
export const auditsCopyZh: AuditsCopy = {
  title: '审计',
  intro:
    'Hacken 对 Cosmic Signature 合约的独立审计、合约仓库中的形式化验证与分析，以及如何自行核对合约。',
  summary: {
    label: '审计概览',
    auditor: '审计方',
    published: '报告发布',
    findings: '发现',
    criticalOrHigh: '严重或高危',
    invariants: '成立的不变量',
    invariantsValue: '{held}/{tested}',
    runs: '模糊测试运行次数',
    severity: '按严重程度划分的发现',
    severities: {
      critical: '严重',
      high: '高危',
      medium: '中危',
      low: '低危',
      informational: '提示',
    },
    reportCta: '阅读 Hacken 审计报告',
    repositoryCta: '浏览被审计的合约',
  },
  audit: {
    heading: 'Hacken 独立审计',
    paragraphs: [
      `2025年末，Hacken 对 Cosmic Signature 智能合约进行了独立安全审查。审查范围覆盖公开仓库中的全部生产合约：驱动每个周期的核心协议、CST 代币、两个 NFT 系列、锚定钱包，以及配套的钱包与系统管理合约。最终报告于2026年1月发布。`,
      '报告逐项列出每项发现的严重级别与处理状态，上方摘要按级别统计了数量。其中没有严重或高危级别问题，多数属于团队已审阅并接受的设计取舍。',
      '除人工审查外，Hacken 还对系统不变量进行了模糊测试，例如协议持有的 ETH 总额必须等于存入减去取回。所有不变量均保持成立。',
    ],
  },
  analysis: {
    heading: '形式化验证与分析',
    paragraphs: [
      '合约仓库中还保存着团队自行运行的检查：覆盖协议逻辑、ETH 守恒、访问控制与各钱包合约的 Certora Prover 规范，Solidity SMTChecker 配置，Slither 静态分析，以及自动化测试套件。',
      '这些检查只证明或测试其所声明的属性。与审计一样，它们能降低风险，但无法消除风险；详见<risk>风险披露</risk>。',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Certora 规范',
        description: 'Certora Prover 检查的属性，以及每次运行的配置',
      },
      {
        link: 'smtchecker',
        label: 'SMTChecker 配置',
        description: '在启用 Solidity 模型检查器的情况下编译合约的脚本',
      },
      {
        link: 'slither',
        label: 'Slither 分析',
        description: '静态分析与可升级性检查，以及运行说明',
      },
      {
        link: 'tests',
        label: '测试套件',
        description: '合约的自动化测试',
      },
    ],
  },
  checklist: {
    heading: '验证清单',
    intro: '与合约交互前，你可以自行确认以下各项：',
    steps: [
      '在<contracts>合约页面</contracts>找到合约地址，这是官方地址的唯一清单。',
      '在 <explorer>Arbiscan</explorer> 上打开该地址，确认它位于 Arbitrum One 且源代码已验证。',
      '将该源代码与<contractsRepository>公开仓库</contractsRepository>比对，或在 <sourcify>Sourcify</sourcify> 上核对完全匹配。',
      '阅读 <hacken>Hacken 报告</hacken>，了解每项发现及其处理状态。',
      '确认应用显示的内容与合约在链上的行为一致。',
    ],
  },
};
