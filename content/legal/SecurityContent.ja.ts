import type { SecurityCopy } from './SecurityContent';

/** Japanese copy for /security, rendered by SecurityContent. */
export const securityCopyJa: SecurityCopy = {
  title: 'セキュリティ',
  intro:
    'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。そのセキュリティは、公開されたスマートコントラクト、透明なプロトコルデータ、慎重なウォレットの操作、そして参加者への明確な説明に支えられています。',
  official: {
    heading: '公式のアドレス',
    intro:
      'Cosmic Signatureは、以下のウェブサイトからのみ開いてください。ウォレットを接続する前や、トランザクションを承認する前には、アドレスを一文字ずつ確認してください。Cosmic Signatureを名乗るそれ以外のサイトやアカウントは、公式のものではありません。',
    websitesHeading: 'ウェブサイト',
    websites: {
      app: 'アプリ：一筆、配分、係留、公開記録',
      landing: 'プロジェクトサイト：作品、ホワイトペーパー、ガイド',
    },
    communityHeading: 'コミュニティ',
    community: {
      x: 'お知らせ',
      discord: 'コミュニティでの交流とサポート',
    },
    contractsHeading: 'Arbitrum Oneのコアコントラクト',
    contractsIntro:
      '現在のプロトコル実装はV3です。実装アドレスはプロキシのEIP-1967スロットと照合してください。V3の公開ソース検証はまだ確認されておらず、過去のV2の検証は新しい実装には適用されません。詳細：<contracts>コントラクトページ</contracts>。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '{value}をコピー',
    copiedLabel: 'コピーしました',
  },
  controls: {
    heading: '所有者の権限とアップグレード',
    paragraph:
      'Cosmic Signatureプロトコルのコントラクトには所有者がいます。下記の範囲で一部のパラメーターを変更し、コントラクトのコードをアップグレードできる一つのアカウントです。すべての変更はオンチェーンに記録され、<coordination>調整の変更履歴</coordination>に一覧されます。',
    ownerLabel: '所有者',
    ownerUnavailable:
      '現在、所有者を読み取れません。Arbiscanでコントラクトのowner()関数を呼び出すと確認できます。',
    account: {
      singleKey:
        '単一の鍵で管理するウォレット（外部所有アカウント）で、マルチシグでもタイムロックでもありません。',
      contract: 'マルチシグやタイムロックなどのスマートコントラクトのアカウントです。',
      renounced:
        '所有権は放棄されています。パラメーターの変更やコードのアップグレードができるアカウントはありません。',
    },
    rows: [
      {
        term: 'サイクル間',
        detail:
          '所有者は、一筆ごとに加わる時間や配分トラックの割合など、プロトコルのパラメーターを変更できます。',
      },
      {
        term: 'サイクル中',
        detail:
          '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
      },
      {
        term: 'いつでも',
        detail:
          '所有者は、最初の一筆が届くまでサイクルの有効化を延期でき、次のサイクルまでの遅延を変更でき、周辺のコントラクト（公共財の受け手、NFTメタデータのリンク、配分ウォレットの受け取りタイムアウト）を管理できます。',
      },
      {
        term: 'アップグレード',
        detail:
          '現在のプロトコル実装はV3です。実装アドレスはプロキシのEIP-1967スロットと照合してください。V3の公開ソース検証はまだ確認されておらず、過去のV2の検証は新しい実装には適用されません。',
      },
      {
        term: '宇宙評議会',
        detail:
          '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
      },
    ],
  },
  model: {
    heading: 'セキュリティモデル',
    paragraph:
      'プロトコルの操作はすべてArbitrumのスマートコントラクトに記録されます。ウォレットを接続して一筆を入れる前に、公開されたコントラクトアドレス、ソースコード、監査、リスクを確認してください。',
    bullets: [
      'アプリは上記の公式アドレスからのみ開き、ウォレットを接続する前にアドレスバーを確認してください。',
      'オンチェーンでコントラクトとやり取りする前に、<contracts>コントラクトページ</contracts>でアドレスを確認してください。',
      'ウォレットの確認画面は、承認する前にすべて読んでください。ブロックチェーンのトランザクションは取り消せません。',
      'Cosmic Signatureがシードフレーズや秘密鍵を求めることはありません。求めてくる相手はCosmic Signatureではありません。',
      'CST、NFT、一筆、配分を、保証された金銭的な結果として扱わないでください。詳しくは<risk>リスク開示</risk>をご覧ください。',
    ],
  },
  report: {
    heading: '脆弱性の報告',
    lead: 'Cosmic Signatureのコントラクト、アプリ、このウェブサイトに脆弱性を見つけた場合は、件名に「Security」と入れて<support>support@cosmicsignature.com</support>までメールしてください。役に立つ報告には、次の内容が含まれます。',
    include: [
      '見つけた内容と、影響するコントラクト、ページ、アドレス。',
      '再現の手順。',
      'それによって何ができるか、誰の資金に関わるか。',
      'チームからの連絡方法。',
    ],
    scopeHeading: '対象範囲',
    scope: [
      {
        term: '対象',
        detail:
          '<securityOfficial>公式のアドレス</securityOfficial>に記載したコントラクト、app.cosmicsignature.com、cosmicsignature.com。',
      },
      {
        term: '対象外',
        detail:
          'ウォレット、マーケットプレイス、ブリッジ、Arbitrumネットワーク自体など、Cosmic Signatureが運営していないサービス。それぞれのチームに報告してください。',
      },
    ],
    closing:
      '公開する前に、チームが返信して修正するための時間をください。また、稼働中のコントラクトや他の参加者の資金に対して、攻撃手法を試さないでください。同じ連絡先はサイトの<securityTxt>security.txt</securityTxt>ファイルにも記載しています。',
  },
  verify: {
    heading: '自分で確かめる',
    paragraph:
      '公開監査は、確認された過去のコントラクト版を対象としています。その後のV2やV3の全変更を独立に監査したことにはなりません。公開ソースとデプロイ済みコードの一致確認も、安全性評価とは別です。 現在のプロトコル実装はV3です。実装アドレスはプロキシのEIP-1967スロットと照合してください。V3の公開ソース検証はまだ確認されておらず、過去のV2の検証は新しい実装には適用されません。',
    resources: [
      {
        link: 'contracts',
        label: 'コントラクトアドレス',
        description:
          'Arbitrum上のすべてのCosmic Signatureコントラクトと、エクスプローラーとSourcifyへのリンク',
      },
      {
        link: 'audits',
        label: '監査',
        description: 'Hackenによる監査：深刻度別の指摘事項、ファジングした不変条件、報告書の全文',
      },
      {
        link: 'code',
        label: 'ソースコード',
        description: '各リポジトリと、シードを作品に変えるレンダラー',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: '任意のコントラクトのバイトコードを公開ソースと照合',
      },
    ],
  },
};
