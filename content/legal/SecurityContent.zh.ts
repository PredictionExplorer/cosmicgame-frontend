import type { SecurityCopy } from './SecurityContent';

/** Simplified Chinese copy for /security, rendered by SecurityContent. */
export const securityCopyZh: SecurityCopy = {
  title: '安全',
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。其安全体系依靠公开的智能合约、透明的协议数据、审慎的钱包交互，以及清晰的参与者教育。',
  official: {
    heading: '官方地址',
    intro:
      '请只从以下网站打开 Cosmic Signature，并在连接钱包或批准交易前逐字核对地址。任何其他自称 Cosmic Signature 的网站或账号都不是官方渠道。',
    websitesHeading: '网站',
    websites: {
      app: '应用：落笔、分配、锚定与公开记录',
      landing: '项目网站：艺术作品、白皮书与指南',
    },
    communityHeading: '社区',
    community: {
      x: '公告',
      discord: '社区交流与支持',
    },
    contractsHeading: 'Arbitrum One 上的核心合约',
    contractsIntro:
      '每个合约公开的源代码在 Sourcify 上均为完全匹配（核对日期：{date}），因此链上的字节码就是你能读到的代码。<contracts>合约页面</contracts>列出了所有地址。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '复制 {value}',
    copiedLabel: '已复制',
  },
  model: {
    heading: '安全模型',
    paragraph:
      '协议的每一项操作都由 Arbitrum 智能合约记录。连接钱包或落笔前，请查看公开的合约地址、源代码、审计与风险。',
    bullets: [
      '只从上方的官方地址打开应用，并在连接钱包前检查地址栏。',
      '在链上与合约交互前，先在<contracts>合约页面</contracts>核对合约地址。',
      '批准前请阅读每一个钱包提示：区块链交易无法撤销。',
      'Cosmic Signature 绝不会索取你的助记词或私钥。任何索取者都不是 Cosmic Signature。',
      '不得将 CST、NFT、落笔或分配视为有保证的财务结果；详见<risk>风险披露</risk>。',
    ],
  },
  report: {
    heading: '报告漏洞',
    paragraphs: [
      '如果你在合约、应用或本网站中发现漏洞，请发送邮件至 <support>support@cosmicsignature.com</support>，并在主题中注明“Security”。请说明你发现的问题、复现方法以及影响范围。',
      '请在公开披露前给团队留出回复与修复的时间，也不要针对线上合约或其他参与者的资金测试漏洞利用。同一联系方式也发布在本网站的 <securityTxt>security.txt</securityTxt> 文件中。',
    ],
  },
  verify: {
    heading: '自行验证',
    paragraph:
      '最有力的安全信号，是应用显示的内容、已验证合约、源代码与 Arbitrum 实时数据彼此一致。这些都可以在不依赖本网站的情况下自行核对。',
    resources: [
      {
        link: 'contracts',
        label: '合约地址',
        description: '所有 Cosmic Signature 合约在 Arbitrum 上的地址，附区块浏览器与 Sourcify 链接',
      },
      {
        link: 'audits',
        label: '审计',
        description: 'Hacken 审计：按严重程度划分的问题、模糊测试的不变量与完整报告',
      },
      {
        link: 'code',
        label: '源代码',
        description: '各代码仓库，以及把每个种子变成作品的渲染器',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: '将任一合约的字节码与其公开源代码比对',
      },
    ],
  },
};
