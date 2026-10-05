import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

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
  eyebrow: '关于 Cosmic Signature',
  heading: '从种子到签名，人人都能重现的艺术',
  body: {
    lede: 'Cosmic Signature 是 Arbitrum 上的程序化链上艺术协议。在每个演绎周期中，参与者以 ETH 或 CST 落笔；每一笔都在塑造最终的签名——一件从链上数据生成、经三体物理模拟渲染而成的确定性 NFT 艺术作品。',
    // lexicon-allow-start: 明确否认投资产品及财务结果承诺。
    denial:
      'Cosmic Signature 并非投资产品。这里介绍的是落笔、分配、锚定和公共物品转拨等协议机制；协议不对代币价格走势或任何财务结果作出承诺。',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: '许可',
    license: 'CC0 作品与代码',
    networkLabel: '网络',
    network: 'Arbitrum One',
    publicGoodsLabel: '公共物品',
    publicGoodsTemplate: '每个周期储备的 {percent}',
  },
  origin: {
    heading: '缘起',
    paragraphs: [
      `Cosmic Signature 由 ${WHITE_PAPER_SHARED.authorName} 设计，白皮书也出自他手。它源于两个信念：其一，生成艺术最有意思的时候，是其中没有任何随意之处——每一幅图像都是一个物理过程的产物，任何人都能用同一颗种子重新运行它；其二，一个替参与者持有 ETH 的协议，应当清楚地回答每一个 wei 的去向。`,
      '因此，这里的艺术来自物理，而非模型：牛顿引力下的三个天体，由链上记录的种子经开源渲染管线生成，并以 CC0 发布。分配是机械的：合约执行每一项分配，没有任何团队钱包从落笔中收取 ETH。团队的角色也是有限的：所有者权限在周期运行期间处于锁定状态，并将在剩余升级完成后彻底移除。',
    ],
  },
  milestones: {
    heading: '从上线到移交',
    items: {
      v1: {
        label: 'V1',
        status: '已上线',
        text: '协议以可升级代理合约的形式在 Arbitrum One 上线：周期、落笔、分配轨道、锚定、宇宙议会与艺术渲染管线。',
      },
      v2: {
        label: 'V2',
        status: '当前版本',
        text: '依据协议的实际使用做出的五项调整，包括随两次落笔间隔而增长的参与 CST，以及收官之笔参与者更长的专属收官窗口。',
      },
      v3: {
        label: 'V3',
        status: '规划中',
        text: '对截止前最后几分钟内的落笔加收溢价，让持续参与比最后一刻的时机更有分量。它正在公开仓库中开发。',
      },
      handover: {
        label: '此后',
        status: '已承诺',
        text: '设计定稿后，所有者控制权将永久离开部署地址：移交给宇宙议会或直接放弃，具体方式会提前公布。',
      },
    },
  },
  clarificationsHeading: '澄清说明',
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
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
