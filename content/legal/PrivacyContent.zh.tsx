import { PrivacyContent, type PrivacyCopy } from './PrivacyContent';

export const privacyCopyZh = {
  title: '隐私政策',
  subtitle:
    '我们重视你的隐私。本政策说明你与 Cosmic Signature 去中心化应用交互时，我们如何收集、使用及保护相关信息。',
  homeLabel: '首页',
  lastUpdated: '最后更新：2026年7月20日',
  introductionTitle: '引言',
  introduction: [
    // lexicon-allow-start: 忠实保留英文源文将产品称作区块链游戏的既有表述。
    'Cosmic Signature 是构建在 Arbitrum（以太坊二层网络）上的去中心化区块链游戏。作为去中心化应用（dApp），我们在数据与隐私方面的运作方式不同于传统 Web 应用。',
    // lexicon-allow-end
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
          text: '为改进服务，我们可能收集匿名使用数据，例如访问的页面、在平台停留的时间及总体交互模式。',
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
          text: '我们使用汇总后的匿名数据改进平台、修复缺陷并开发新功能。',
        },
        {
          id: 'communication',
          subtitle: '沟通',
          text: '我们可能使用相关信息发送平台的重要更新，例如安全通知或协议机制的重大变更。',
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
          text: '我们的 Web 基础设施采用行业标准安全措施，包括 HTTPS 加密、安全托管与定期安全审计。',
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
          text: '我们可能使用第三方服务进行分析、托管及基础设施运营。这些服务受其各自隐私政策约束；我们会确保其符合适当的数据保护标准。',
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
          text: '本网站可能使用 Cookie 提供基础功能。你可以通过浏览器管理 Cookie 设置。',
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
      text: '我们可能不时更新本隐私政策。若有变更，我们会在本页面发布新版隐私政策并更新"最后更新"日期，以此通知你。建议定期查看本隐私政策，了解是否发生变更。',
    },
    {
      id: 'contact',
      subtitle: '联系方式',
      text: '如对本隐私政策有任何疑问，请通过官方社区渠道或 GitHub 仓库联系我们。',
    },
    {
      id: 'international',
      subtitle: '国际用户',
      text: 'Cosmic Signature 在全球均可访问的 Arbitrum（以太坊二层网络）上结算。使用本平台，即表示你确认相关信息可能在世界各地处理及存储。',
    },
  ],
  notice: {
    title: '重要说明：区块链透明性',
    text: '区块链交易公开且永久存在。你的钱包地址以及与智能合约的全部交互均公开可见，并且无法删除。这是区块链技术的基本特征，并非我们隐私措施的局限。',
  },
} as const satisfies PrivacyCopy;

export function PrivacyContentZh() {
  return <PrivacyContent copy={privacyCopyZh} />;
}
