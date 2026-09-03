import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical Japanese terminology (docs/i18n/glossary-ja.md).
 *
 * Variants are matched as substrings (`cjk-substring` in
 * locale-text-matchers.ts): Japanese writes without spaces and particles
 * attach to the noun, so one entry covers 配分, 配分が, 配分された, … A variant
 * must therefore never be contained in ordinary innocent copy — every entry
 * below was checked against the vocabulary the site does need (署名 is not a
 * drift variant of シグネチャー because wallet copy signs transactions with it;
 * 固定 is not a variant of 係留 because layouts have 固定ヘッダー).
 *
 * Keep this list focused on terminology drift. Vocabulary that is banned
 * outright (オークション, 抽選, 投資, ステーキング, 寄付, …) lives only in
 * JA_BANNED_TERMS in lexicon-scan-core.ts so neither gate can silently weaken
 * the other. Katakana spelling drift that is a prefix of the canonical form
 * (ユーザ for ユーザー) cannot be a substring rule and is caught by
 * LOCALE_CONVENTIONS.ja instead.
 */
export const JA_TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  {
    concept: 'Gesture',
    canonical: '一筆',
    // ジェスチャ also covers ジェスチャー.
    variants: ['ジェスチャ', '一手', 'ビッド'],
  },
  {
    concept: 'Gesture Cost',
    canonical: '一筆の費用',
    variants: ['一筆コスト', '一筆価格', '一筆料金', '一筆手数料', '一筆の価格', '一筆の料金'],
  },
  {
    concept: 'Performance Cycle',
    canonical: 'パフォーマンス・サイクル (dense UI: サイクル)',
    variants: [
      'パフォーマンスサイクル',
      '演目サイクル',
      '公演サイクル',
      '演奏サイクル',
      '演目周期',
      '周期',
    ],
  },
  {
    concept: 'Finalize',
    canonical: '確定',
    variants: ['最終化', 'ファイナライズ', '締結', '終了処理'],
  },
  {
    concept: 'Calibration Window',
    canonical: '調律期間',
    variants: [
      '調律ウィンドウ',
      '校正ウィンドウ',
      '較正ウィンドウ',
      '校正期間',
      '較正期間',
      '調整期間',
      'キャリブレーション',
    ],
  },
  {
    concept: 'Allocation',
    canonical: '配分',
    variants: ['アロケーション', '割り当て', '割当'],
  },
  {
    concept: 'Recipient',
    canonical: '受領者',
    variants: ['受取人', '受領人', '受益者', '獲得者', 'レシピエント'],
  },
  {
    concept: 'Stellar Selection',
    canonical: '星選',
    variants: [
      '星の選定',
      'ステラセレクション',
      'ステラ・セレクション',
      '星選抜',
      '星選び',
      '星屑選定',
    ],
  },
  {
    concept: 'Anchoring',
    canonical: '係留',
    variants: ['繋留', 'アンカリング', 'アンカー', '錨定', '停泊'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: '係留配分',
    variants: ['係留分配', '係留派発', '係留の配分', 'アンカー配分'],
  },
  {
    concept: 'Retrieve',
    canonical: '受け取る / 受け取り',
    variants: ['受取り', '回収', '受領する', '引き取り'],
  },
  {
    concept: 'Imprint',
    canonical: '刻印',
    variants: ['インプリント', '刻み込み', '刻み込む'],
  },
  {
    concept: 'Endurance Champion',
    canonical: '持久チャンピオン',
    variants: [
      '耐久チャンピオン',
      'エンデュランスチャンピオン',
      'エンデュランス・チャンピオン',
      '持久王',
      '持久の覇者',
    ],
  },
  {
    concept: 'Chrono-Warrior',
    canonical: '時の戦士',
    variants: ['クロノウォリアー', 'クロノ・ウォリアー', '時間の戦士', '時の勇者', 'クロノ戦士'],
  },
  {
    concept: 'Cosmic Council',
    canonical: '宇宙評議会',
    variants: ['宇宙議会', '宇宙協議会', 'コズミックカウンシル', 'コズミック・カウンシル'],
  },
  {
    concept: 'Public Goods',
    canonical: '公共財',
    variants: ['公共物', '公共善', 'パブリックグッズ', 'パブリック・グッズ'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: '広報準備金',
    variants: ['広報基金', '広報リザーブ', '普及準備金', 'アウトリーチ準備金', '広報積立金'],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: '累積準備金',
    variants: ['複利準備金', '積立準備金', '繰越準備金', 'コンパウンド準備金', '累積リザーブ'],
  },
  {
    concept: 'Signature (the artwork)',
    canonical: 'シグネチャー',
    // シグニチャ also covers シグニチャー; the dropped long vowel (シグネチャ) is a
    // prefix of the canonical form and is caught by LOCALE_CONVENTIONS.ja.
    variants: ['シグニチャ'],
  },
  {
    concept: 'Contribution (ETH / NFT)',
    canonical: '拠出',
    variants: ['コントリビューション', '出資'],
  },
  {
    concept: 'Participant',
    canonical: '参加者',
    variants: ['参加ユーザー', 'パーティシパント'],
  },
  {
    concept: 'Wallet',
    canonical: 'ウォレット',
    variants: ['ワレット', '財布'],
  },
  {
    concept: 'Gallery',
    canonical: 'ギャラリー',
    variants: ['画廊'],
  },
  {
    concept: 'Sign (a transaction)',
    canonical: '署名',
    variants: ['サイン'],
  },
];
