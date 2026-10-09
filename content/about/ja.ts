import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

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
  eyebrow: 'Cosmic Signatureについて',
  heading: 'シードからシグネチャーまで、誰もが再現できるアート',
  body: {
    lede: 'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。参加者がETHまたはCSTで一筆を入れるたびに、そのサイクルのシグネチャーが形づくられます。シグネチャーは、オンチェーンのデータと三体問題の物理シミュレーションから生まれる決定論的なNFT作品です。',
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signatureは投資商品として提供されるものではありません。このプロトコルは参加、一筆、配分、係留、公共財への送付を説明するものであり、トークン価格の動きや金銭的な結果を約束するものではありません。',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: 'ライセンス',
    license: 'CC0の作品とコード',
    networkLabel: 'ネットワーク',
    network: 'Arbitrum One',
    publicGoodsLabel: '公共財',
    publicGoodsTemplate: '各サイクル準備金の{percent}',
  },
  origin: {
    heading: '成り立ち',
    paragraphs: [
      `Cosmic Signatureを設計したのは、ホワイトペーパーの著者でもある${WHITE_PAPER_SHARED.authorName}です。出発点には二つの確信がありました。一つは、ジェネラティブアートが最も面白いのは、そこに恣意的なものが何一つなく、すべての画像が物理過程の産物で、誰でも同じシードからその過程を再実行できるときだということ。もう一つは、参加者に代わってETHを預かるプロトコルは、すべてのweiの行き先を明快に説明すべきだということです。`,
      'だから、ここでのアートはモデルではなく物理です。ニュートン重力のもとで動く三つの天体を、オンチェーンに記録されたシードからオープンソースのパイプラインが描き、CC0で公開します。配分は機械的です。コントラクトがすべての配分を実行し、チームのウォレットが一筆からETHを受け取ることはありません。チームの役割も限られています。オーナー権限はサイクルの進行中はロックされ、残るアップグレードが終わればすべて取り除かれる予定です。',
    ],
  },
  milestones: {
    heading: 'ローンチから移管まで',
    items: {
      v1: {
        label: 'V1',
        status: 'ローンチ',
        text: 'アップグレード可能なプロキシの背後で、プロトコルがArbitrum One上に公開されました。サイクル、一筆、配分トラック、係留、宇宙評議会、アートのパイプラインを備えています。',
      },
      v2: {
        label: 'V2',
        status: '現行版',
        text: '実際の使われ方から生まれた五つの変更です。一筆の間隔に応じて増える参加CSTや、最後の一筆の参加者がサイクルを確定できる期間の延長などを含みます。',
      },
      v3: {
        label: 'V3',
        status: '予定',
        text: '締め切り直前の数分間の一筆に割増を課し、直前のタイミングよりも継続的な参加が重みを持つようにします。公開リポジトリで開発中です。',
      },
      handover: {
        label: 'その後',
        status: '約束',
        text: '設計が確定したら、オーナーの権限はデプロイしたアドレスから永久に離れます。宇宙評議会への移管か放棄のどちらかで、方法は事前に告知します。',
      },
    },
  },
  clarificationsHeading: '補足',
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
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
