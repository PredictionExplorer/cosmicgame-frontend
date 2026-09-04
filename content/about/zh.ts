import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentZh = {
  metadata: {
    title: '关于 Cosmic Signature · Arbitrum 链上艺术',
    description:
      'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议，将演绎周期中的落笔化为确定性的三体 NFT 艺术。',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: '关于 Cosmic Signature',
    description:
      'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议，以演绎周期中的落笔生成确定性的三体 NFT 艺术。',
  },
  breadcrumbLabel: '关于',
  eyebrow: '关于协议',
  heading: '关于 Cosmic Signature',
  body: {
    paragraphs: [
      'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。在每个演绎周期中，参与者以 ETH 或 CST 落笔；每一笔都在塑造最终的签名——一件从链上数据生成、经三体物理模拟渲染而成的确定性 NFT 艺术作品。',
      '协议机制公开且可验证。Arbitrum 智能合约记录落笔、周期、分配轨道、CST、锚定和 NFT 铭刻。每件作品都能从种子复现。项目开放全部源代码，以 CC0 发布艺术作品，并将公共物品资助写入协议机制。',
      'Cosmic Signature 与 COSMIC 癌症突变数据库及生物学中的 COSMIC 突变特征没有关联。本项目是链上艺术协议及应用。',
    ],
    // lexicon-allow-start: 明确否认投资产品及财务结果承诺。
    denial:
      'Cosmic Signature 并非投资产品。这里介绍的是落笔、分配、锚定和公共物品转拨等协议机制；协议不对代币价格走势或任何财务结果作出承诺。',
    // lexicon-allow-end
  },
  officialResources: {
    heading: '官方资源',
    links: [
      { id: 'app', label: 'Cosmic Signature 应用', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: '已验证的 Arbitrum 合约',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '源代码', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: '常见问题', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: '服务条款', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: '隐私政策', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
