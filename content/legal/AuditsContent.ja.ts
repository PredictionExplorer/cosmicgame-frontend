import type { TrustPageCopy } from './TrustPageContent';

/** Japanese copy for /audits, rendered by TrustPageContent. */
export const auditsCopyJa: TrustPageCopy = {
  eyebrow: '監査と検証',
  title: 'Cosmic Signature監査',
  intro:
    'Cosmic Signatureの監査報告書と検証資料を紹介します。レビューの対象範囲、指摘事項と対応状況、公開ソースコードを確認できます。',
  sections: [
    {
      heading: 'Hackenによる独立監査',
      paragraphs: [
        '2025年後半、HackenはCosmic Signatureのスマートコントラクトの独立したセキュリティレビューを実施しました。対象は公開リポジトリの本番コントラクトで、各サイクルを動かす中核プロトコルから、CSTトークン、二つのNFTコレクション、係留ウォレット、それらを支えるウォレットとシステム管理のコントラクトまでを含みます。Hackenは2026年1月に最終報告書を公開しました。',
        '報告書には23件の所見が挙げられていますが、重大または高い深刻度のものはありません。中程度が3件、低が8件、情報提供が12件です。ほとんどは、チームが検討して受け入れた設計上のトレードオフを説明するもので、報告書は各所見をその状況とともに解説しています。',
        '手動のレビューに加えて、Hackenは14のシステム不変条件に対してファジングテストを実施しました。たとえば、プロトコルが保持するETHが常に、受け入れた額から支払った額を引いたものに等しいという条件などです。14件すべてが10,000回の実行にわたって成立しました。',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: 'Hackenの監査報告書の全文を読む',
      },
      note: '最終レビュー：2026-08-24。このページは、Cosmic Signatureの監査と検証の状況を公開する正式な場所です。',
    },
    {
      heading: '検証チェックリスト',
      bullets: [
        '公式のコントラクトページでコントラクトアドレスを確認する。',
        'Arbitrumのブロックエクスプローラーで検証済みのソースコードとABIデータを比較する。',
        'Hackenの監査報告書を読み、所見の全文とその状況を確認する。',
        'アプリに見える仕組みが公開コントラクトの振る舞いと一致することを確認する。',
      ],
    },
    {
      heading: '関連する信頼性のリソース',
      links: [
        { kind: 'app', href: '/contracts', label: '検証済みのArbitrumコントラクトアドレス' },
        { kind: 'app', href: '/code', label: 'ソースコードと決定論的レンダリングのリソース' },
        { kind: 'app', href: '/security', label: 'セキュリティの概要' },
      ],
    },
  ],
};
