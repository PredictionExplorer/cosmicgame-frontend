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
      '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
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
        status: '過去の版',
        text: 'V2は過去の版で、現在はV3に置き換わっています。',
      },
      v3: {
        label: 'V3',
        status: 'デプロイ済み',
        text: 'V3はデプロイ済みです。参加CSTの式と受領者、参加者向けETH星選とNFT星選のウェイト、CST費用の下降速度、ETHの割合、シグネチャー配分のNFT数を変更し、終盤の費用加算も導入しています。',
      },
      handover: {
        label: 'その後',
        status: '自動実行されません',
        text: '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
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
        label: 'Arbitrumコントラクト',
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
