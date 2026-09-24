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
      '各コントラクトの公開ソースコードはSourcifyで完全に一致しているため（{date}に確認）、オンチェーンのバイトコードは読むことのできるコードそのものです。すべてのアドレスは<contracts>コントラクトページ</contracts>にあります。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '{value}をコピー',
    copiedLabel: 'コピーしました',
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
    paragraphs: [
      'コントラクト、アプリ、このウェブサイトに脆弱性を見つけた場合は、件名に「Security」と入れて<support>support@cosmicsignature.com</support>までメールしてください。見つけた内容、再現の手順、影響する範囲を記載してください。',
      '公開する前に、チームが返信して修正するための時間をください。また、稼働中のコントラクトや他の参加者の資金に対して、攻撃手法を試さないでください。同じ連絡先はサイトの<securityTxt>security.txt</securityTxt>ファイルにも記載しています。',
    ],
  },
  verify: {
    heading: '自分で確かめる',
    paragraph:
      '最も強いセキュリティの証しは、アプリの表示、検証済みのコントラクト、ソースコード、Arbitrumのライブデータが一致していることです。いずれも、このサイトを信用しなくても確認できます。',
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
