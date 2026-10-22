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
      '配套合约与历史 V2 实现的公开匹配记录于 {date} 核对。当前 V3 尚未在 Sourcify 验证；旧版本的记录不能代替当前实现的证据。<contracts>合约页面</contracts>列出各地址及状态。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '复制 {value}',
    copiedLabel: '已复制',
  },
  controls: {
    heading: '所有者权限与升级',
    paragraph:
      'Cosmic Signature 协议合约设有一个所有者：一个可以在下列限度内调整部分参数并升级合约代码的账户。每一次变更都记录在链上，并列在<coordination>协调变更</coordination>中。',
    ownerLabel: '所有者',
    ownerUnavailable: '暂时无法读取所有者。可在 Arbiscan 上调用该合约的 owner() 函数查看。',
    account: {
      singleKey: '单一私钥钱包（外部账户），不是多签钱包，也不是时间锁。',
      contract: '智能合约账户，例如多签钱包或时间锁。',
      renounced: '所有权已放弃：没有任何账户可以再调整参数或升级代码。',
    },
    rows: [
      {
        term: '周期之间',
        detail: '所有者可以调整协议参数，例如每次落笔增加的时间或分配轨道比例。',
      },
      {
        term: '周期进行中',
        detail:
          '核心设置与升级要求当前时间早于周期启用时间。只要首笔尚未执行，所有者仍可推迟启用时间，从而重新进入可维护窗口。外围权限另有各自规则。',
      },
      {
        term: '任何时候',
        detail:
          '所有者可把周期启用推迟至首笔落笔到来，调整下一周期前的延迟，并管理外围合约：公共物品受益方、NFT 元数据链接与分配钱包取回期限。',
      },
      {
        term: '升级',
        detail:
          '协议运行在 UUPS 代理之后，升级会更换实现而保留代理地址。当前实现为 V3；升级须由所有者在合约允许的未启用状态下执行。源码验证与安全审计是不同事项，必须分别核对。',
      },
      {
        term: '宇宙议会',
        detail:
          '宇宙议会只能行使实际授予它的权限，目前并不拥有核心协议。V3 不会自动移交或放弃所有权；每个所有者角色都需要单独的链上操作。',
      },
    ],
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
    lead: '如果你在 Cosmic Signature 合约、应用或本网站中发现漏洞，请发送邮件至 <support>support@cosmicsignature.com</support>，并在主题中注明“Security”。一份有用的报告应说明：',
    include: [
      '你发现了什么，以及影响的是哪个合约、页面或地址。',
      '如何一步步复现。',
      '它会让他人能做什么，涉及谁的资金。',
      '团队如何联系你。',
    ],
    scopeHeading: '范围',
    scope: [
      {
        term: '范围内',
        detail:
          '<securityOfficial>官方地址</securityOfficial>中列出的合约、app.cosmicsignature.com 与 cosmicsignature.com。',
      },
      {
        term: '范围外',
        detail:
          '并非由 Cosmic Signature 运营的服务，例如钱包、NFT 市场、跨链桥以及 Arbitrum 网络本身。请向它们各自的团队报告。',
      },
    ],
    closing:
      '请在公开披露前给团队留出回复与修复的时间，也不要针对线上合约或其他参与者的资金测试漏洞利用。同一联系方式也发布在本网站的 <securityTxt>security.txt</securityTxt> 文件中。',
  },
  verify: {
    heading: '自行验证',
    paragraph:
      '将应用显示与 Arbitrum 实时状态、当前安装的实现、源码及验证范围交叉核对。历史版本的匹配或审计记录不会自动覆盖升级后的实现。',
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
