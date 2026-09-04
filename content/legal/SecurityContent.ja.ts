import type { TrustPageCopy } from './TrustPageContent';

/** Japanese copy for /security, rendered by TrustPageContent. */
export const securityCopyJa: TrustPageCopy = {
  eyebrow: '信頼とセキュリティ',
  title: 'Cosmic Signatureセキュリティ',
  intro:
    'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。そのセキュリティは、公開されたスマートコントラクト、透明なプロトコルデータ、慎重なウォレットの操作、そして参加者への明確な説明に支えられています。',
  sections: [
    {
      heading: 'セキュリティモデル',
      paragraphs: [
        'プロトコルの操作はArbitrumのスマートコントラクトに記録されます。ウォレットを接続して一筆を入れる前に、公開ページでコントラクトアドレス、ソースコード、検証範囲、運用上の前提を確認できます。',
      ],
      bullets: [
        '公式アプリ`https://app.cosmicsignature.com/`を使う。',
        'オンチェーンでやり取りする前に、コントラクトページでコントラクトアドレスを確認する。',
        'ウォレットの確認画面を注意深く読む。ブロックチェーンのトランザクションは取り消せない。',
        'CST、NFT、一筆、配分を、保証された金銭的な結果として扱わない。',
      ],
    },
    {
      heading: '検証のリソース',
      paragraphs: [
        '最も強いセキュリティの証しは、目に見えるアプリの内容、検証済みのコントラクト、ソースコード、そしてArbitrumのライブデータが一貫していることです。',
      ],
      links: [
        {
          kind: 'app',
          href: '/contracts',
          label: 'Cosmic SignatureのコントラクトとArbitrumアドレス',
        },
        {
          kind: 'app',
          href: '/code',
          label: 'Cosmic Signatureのソースコードとレンダリングパイプライン',
        },
        { kind: 'app', href: '/audits', label: '監査と形式検証の注記' },
        {
          kind: 'app',
          href: '/risk-disclosures',
          label: 'リスク開示と参加にあたっての注意事項',
        },
      ],
    },
  ],
};
