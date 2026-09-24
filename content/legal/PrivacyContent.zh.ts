import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyZh = {
  title: '隐私政策',
  subtitle:
    'Cosmic Signature 如何处理你使用应用与项目网站时的信息：哪些内容在链上公开、网站统计与存储哪些数据，以及各项服务会收到哪些数据。',
  inShort: {
    title: '要点',
    points: [
      '你的钱包地址以及你在链上的一切操作都公开且永久：任何人都能在 Arbitrum 上读取，任何人都无法删除。',
      '连接钱包只会共享公开地址。我们绝不会索取你的助记词、私钥或密码，也不会收集你的姓名或电子邮箱地址。',
      '网站通过下方列出的服务统计访问并报告错误，并且只设置下方列出的 Cookie。',
    ],
  },
  introductionTitle: '引言',
  introduction: [
    'Cosmic Signature 是构建在 Arbitrum（以太坊二层网络）上的程序化链上艺术协议。作为去中心化应用（dApp），我们在数据与隐私方面的运作方式不同于传统 Web 应用。',
    '本隐私政策说明我们如何处理与你使用 Cosmic Signature 有关的信息。使用本平台，即表示你同意我们按照本政策收集及使用信息。',
  ],
  sections: [
    {
      id: 'collection',
      title: '我们收集的信息',
      content: [
        {
          id: 'wallet',
          subtitle: '钱包信息',
          text: '连接 Web3 钱包使用 Cosmic Signature 时，我们会收集你的公开钱包地址。处理交易、显示 NFT、记录落笔及发放分配均需要该地址。',
        },
        {
          id: 'transactions',
          subtitle: '交易数据',
          text: '我们会收集你与智能合约交互的信息，包括落笔、获得 NFT、锚定操作及分配取回记录。所有这些数据都已在区块链上公开。',
        },
        {
          id: 'usage',
          subtitle: '使用数据',
          text: '我们统计网站的使用情况：浏览的页面、页面加载速度、来源网站，以及访问所在的国家或地区、浏览器与设备类型。执行这些统计的分析服务列在<privacyServices>我们使用的服务</privacyServices>中。',
        },
      ],
    },
    {
      id: 'use',
      title: '我们如何使用信息',
      content: [
        {
          id: 'delivery',
          subtitle: '提供服务',
          text: '我们使用钱包地址与交易数据提供协议服务，包括处理落笔、管理 NFT、发放分配及显示协议统计。',
        },
        {
          id: 'improvement',
          subtitle: '改进平台',
          text: '我们使用汇总后的使用数据与错误报告修复缺陷、改进网站。',
        },
        {
          id: 'communication',
          subtitle: '沟通',
          text: '我们不收集电子邮箱地址或其他联系方式，因此不会直接联系你。公告（包括安全通知与协议变更）会发布在 <x>X</x> 与 <discord>Discord</discord> 上。',
        },
      ],
    },
    {
      id: 'security',
      title: '数据安全',
      content: [
        {
          id: 'blockchain',
          subtitle: '区块链安全',
          text: '协议结算发生在 Arbitrum（以太坊二层网络）上。仅连接钱包属于非托管操作，不会转移资产；但当你明确批准并签署智能合约操作时，相关交易可能把资产转入协议合约，或将资产锁定在其中，直至满足相应的释放或取回条件。',
        },
        {
          id: 'infrastructure',
          subtitle: '基础设施安全',
          text: '本网站仅通过 HTTPS 提供，托管于 Vercel 平台。智能合约已接受独立审计，详见<audits>审计</audits>。',
        },
        {
          id: 'passwords',
          subtitle: '不使用密码',
          text: '我们绝不会索取或存储密码。身份验证完全通过 Web3 钱包完成。',
        },
      ],
    },
    {
      id: 'sharing',
      title: '信息共享与披露',
      content: [
        {
          id: 'public-chain',
          subtitle: '公开区块链数据',
          text: '区块链交易天然公开。你的钱包地址、落笔、NFT 所有权及分配均可在区块链与本平台上查看。',
        },
        {
          id: 'third-party',
          subtitle: '第三方服务',
          text: '<privacyServices>我们使用的服务</privacyServices>中列出的服务会收到该处所述的数据，并按照各自的隐私政策处理；表格中附有链接。',
        },
        {
          id: 'legal',
          subtitle: '法律要求',
          text: '若法律、法院命令或政府法规要求，我们可能披露相关信息。',
        },
      ],
    },
    {
      id: 'rights',
      title: '你的权利与选择',
      content: [
        {
          id: 'wallet',
          subtitle: '钱包控制权',
          text: '你始终完全控制自己的钱包，并可随时断开钱包与本平台的连接。',
        },
        {
          id: 'permanence',
          subtitle: '区块链永久性',
          text: '区块链交易永久存在且无法删除。完成落笔或转移 NFT 后，相关信息将永久保留在区块链上。',
        },
        {
          id: 'cookies',
          subtitle: 'Cookie 偏好',
          text: '本网站只设置<privacyStorage>Cookie 与浏览器存储</privacyStorage>中列出的 Cookie。你可以在浏览器设置中删除或阻止它们；网站仍可正常使用，只是不会记住你的配色与语言。',
        },
      ],
    },
  ],
  additionalTitle: '其他信息',
  additional: [
    {
      id: 'children',
      subtitle: '未成年人隐私',
      text: '本服务不面向未满 18 周岁的用户。我们不会在明知的情况下收集未成年人的个人信息。如果你是父母或监护人，并认为孩子向我们提供了个人信息，请联系我们。',
    },
    {
      id: 'changes',
      subtitle: '政策变更',
      text: '我们可能不时更新本隐私政策。每次变更都会发布在本页面，并更新页首的“最后更新”日期；每项变更也可在本政策的<privacyHistory>修订历史</privacyHistory>中查看。',
    },
    {
      id: 'contact',
      subtitle: '联系方式',
      text: '如对本隐私政策有任何疑问，请发送邮件至 <support>support@cosmicsignature.com</support>，或通过 <discord>Discord</discord>、<x>X</x> 联系我们。',
    },
    {
      id: 'international',
      subtitle: '国际用户',
      text: 'Cosmic Signature 在全球均可访问的 Arbitrum（以太坊二层网络）上结算。使用本平台，即表示你确认相关信息可能在世界各地处理及存储。',
    },
  ],
  services: {
    heading: '我们使用的服务',
    intro: '本网站使用以下服务。各项服务按照其自身的隐私政策处理所列数据。',
    columns: {
      service: '服务',
      purpose: '用途',
      data: '收到的数据',
      policy: '隐私政策',
    },
    policyLink: '政策',
    ownPolicy: '本政策',
    none: '未列出',
    items: {
      vercel: {
        purpose: '托管并传输网站',
        data: '请求日志中的 IP 地址与浏览器信息',
      },
      vercelAnalytics: {
        purpose: '统计页面浏览量并衡量页面速度，不使用 Cookie',
        data: '浏览的页面、来源网站、国家或地区、浏览器与设备类型',
      },
      googleAnalytics: {
        purpose: '衡量访问者如何使用网站',
        data: '浏览的页面、大致位置、浏览器与设备（通过 Cookie）',
      },
      sentry: {
        purpose: '报告错误以便修复',
        data: '错误本身、所在页面、浏览器信息，以及出错前片刻的回放（所有文字与输入均已遮蔽）',
      },
      api: {
        purpose: '提供页面显示的协议数据',
        data: '你打开的记录，包括你查询的任何钱包地址',
      },
      rpc: {
        purpose: '读取 Arbitrum 上的合约，并转发你签署的交易',
        data: 'IP 地址、被读取的地址以及你发送的交易',
      },
      walletConnect: {
        purpose: '连接移动端钱包与扫码钱包',
        data: '你的钱包地址，以及网站与钱包之间的加密消息',
      },
      coingecko: {
        purpose: '提供以美元计价的 ETH 与 CST 价格',
        data: '页面显示美元价格时的 IP 地址',
      },
    },
  },
  storage: {
    heading: 'Cookie 与浏览器存储',
    intro:
      '网站会在你的设备上存储以下内容，均不包含你的姓名或联系方式。Cookie 会随请求发送；浏览器存储只保留在你的设备上。',
    columns: {
      name: '名称',
      kind: '类型',
      purpose: '用途',
      lifetime: '保留期限',
    },
    kinds: {
      cookie: 'Cookie',
      browser: '浏览器存储',
    },
    lifetimes: {
      oneYear: '1 年',
      twoYears: '2 年',
      untilCleared: '直到你清除为止',
      untilTabClosed: '直到你关闭标签页',
    },
    items: {
      themeCookie: '在两个 Cosmic Signature 网站上记住你的配色',
      localeCookie: '记住你选择的语言',
      gaCookies: '为 Google Analytics 区分重复访问',
      themeStorage: '在本网站记住你的配色',
      attention: '记住你的收官前提醒与声音设置',
      artMotion: '记住你已暂停实验版首页的作品动画',
      quizProgress: '保存进行中的测验，查看参考资料后可以继续作答',
      quizBest: '记住你在每套测验中的最佳成绩',
      wallet: '记住你连接过的钱包，以便应用重新连接',
    },
  },
} as const satisfies PrivacyCopy;
