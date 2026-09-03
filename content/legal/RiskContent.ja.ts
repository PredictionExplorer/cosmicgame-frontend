import type { TrustPageCopy } from './TrustPageContent';

/** Japanese copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyJa: TrustPageCopy = {
  eyebrow: 'リスクと参加者向けの明確化',
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
        'ネットワークの混雑、RPCの障害、インデクサーの遅延、アプリの問題がUXに影響することがあります。',
        '参加する前に、プロトコルのパラメーター、配分、タイミングを確認するべきです。',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CSTとNFTは、保証されたリターンや金融商品として理解されるべきではありません。',
        // lexicon-allow-end
      ],
    },
    {
      heading: '参加者がすること',
      paragraphs: [
        '参加者はパフォーマンス・サイクルの間に一筆を入れます。一筆は変化し続けるプロトコルの状態に影響し、参加CSTを刻印し、決定論的なCosmic Signature NFTアートの文脈に寄与します。結果は公開されたスマートコントラクトの仕組みによって定まり、オフチェーンの約束によるものではありません。',
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
