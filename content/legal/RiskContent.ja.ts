import type { TrustPageCopy } from './TrustPageContent';

/** Japanese copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyJa: TrustPageCopy = {
  eyebrow: 'リスクと参加にあたっての注意事項',
  title: 'Cosmic Signatureリスク開示',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。宝くじ、カジノ、ギャンブル商品、投資商品ではなく、金銭的な結果を約束するものでもありません。',
  // lexicon-allow-end
  sections: [
    {
      heading: '主なリスク',
      bullets: [
        'ブロックチェーンのトランザクションは公開され、一般に取り消せません。',
        'ウォレットの安全、秘密鍵、トランザクションの承認は利用者の責任です。',
        'ネットワークの混雑、RPCの障害、データ反映の遅延、アプリの不具合により、表示や操作に支障が出ることがあります。',
        '参加する前に、プロトコルのパラメーター、配分、タイミングを確認するべきです。',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CSTとNFTは、保証されたリターンや金融商品として理解されるべきではありません。',
        // lexicon-allow-end
      ],
    },
    {
      heading: '参加者がすること',
      paragraphs: [
        '参加者はパフォーマンス・サイクルの間に一筆を入れます。一筆はプロトコルの状態に影響し、参加CSTが刻印されることもあります。その記録が、決定論的なCosmic Signature NFT作品の背景を形づくります。結果は公開スマートコントラクトのルールで決まり、オフチェーンでの約束に基づくものではありません。',
      ],
    },
    {
      heading: '関連ページ',
      links: [
        // lexicon-allow-start: link label names the categories denied by the linked page.
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Cosmic Signatureは宝くじ、カジノ、投資ですか？',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: '利用規約' },
        { kind: 'app', href: '/security', label: 'セキュリティの概要' },
      ],
    },
  ],
};
