import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentJa = {
  metadata: {
    title: 'Cosmic Signatureについて | Arbitrumのオンチェーンアート',
    description:
      'Cosmic Signatureは、パフォーマンス・サイクルの一筆を決定論的な三体NFTアートへ変えるArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'Cosmic Signatureについて',
    description:
      'Cosmic Signatureは、パフォーマンス・サイクルの一筆から決定論的な三体NFTアートを生成するArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。',
  },
  breadcrumbLabel: '概要',
  eyebrow: 'プロトコルの紹介',
  heading: 'Cosmic Signatureについて',
  body: {
    paragraphs: [
      'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。参加者がETHまたはCSTで一筆を入れるたびに、そのサイクルのシグネチャーが形づくられます。シグネチャーは、オンチェーンのデータと三体問題の物理シミュレーションから生まれる決定論的なNFT作品です。',
      'このプロトコルは、公開され検証可能な仕組みを軸に設計されています。Arbitrumのスマートコントラクトが一筆、サイクル、配分トラック、CST、係留、NFTの刻印を記録します。アートワークはシードから再現でき、プロジェクトはオープンソースのコード、CC0のアート、公共財の支援を重視しています。',
      'Cosmic Signatureは、生物学におけるCOSMICがん変異データベースやCOSMIC変異シグネチャーとは関係がありません。オンチェーンアートのプロトコルとアプリです。',
    ],
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signatureは投資商品として提供されるものではありません。このプロトコルは参加、一筆、配分、係留、公共財への送付を説明するものであり、トークン価格の動きや金銭的な結果を約束するものではありません。',
    // lexicon-allow-end
  },
  officialResources: {
    heading: '公式情報',
    links: [
      { id: 'app', label: 'Cosmic Signatureアプリ', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: '検証済みのArbitrumコントラクト',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'ソースコード', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: 'よくある質問', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: '利用規約', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: 'プライバシーポリシー', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
