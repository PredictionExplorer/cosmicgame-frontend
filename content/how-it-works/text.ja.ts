import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('en-US');

/** Japanese how-it-works copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextJa = {
  metadata: {
    title: 'Cosmic Signatureの仕組み | パフォーマンス・サイクル、一筆、NFT',
    description:
      'Cosmic Signatureのパフォーマンス・サイクルがどう進むかを学ぶ——調律期間から一筆、そして最終的な配分の分配まで。',
  },
  jsonLd: {
    name: 'Cosmic Signatureの仕組み',
    description:
      'Cosmic Signatureのパフォーマンス・サイクルがどう進むかを学ぶ——調律期間から一筆、そして最終的な配分の分配まで。',
  },
  breadcrumbs: {
    homeLabel: 'ホーム',
    pageLabel: '仕組み',
  },
  hero: {
    badge: 'プロシージャル・オンチェーンアート・プロトコル',
    headingLead: 'Cosmic Signatureの',
    headingAccent: '仕組み',
    paragraph:
      '一筆を入れる。持ちこたえる。シグネチャーを形づくる。参加者はパフォーマンス・サイクルの間に一筆を入れます。サイクル確定時刻が切れるとサイクルは確定でき、配分はシグネチャー配分、係留配分、Protocol Guildを含む10を超えるトラックへ配られます。',
    primaryCtaLabel: 'プロトコルを開く',
    secondaryCtaLabel: '詳しく知る',
  },
  overview: {
    heading: '仕組み',
    subhead: '参加してサイクル準備金を形づくる三つのステップ',
    cards: [
      {
        title: '一筆を入れる',
        description:
          'ETHまたはCST（ERC-20）で一筆を入れます。一筆ごとにサイクル確定時刻が延び、星選の対象が記録され、変化し続けるシグネチャーが形づくられます。',
        tooltip: `一筆はETHまたはCSTトークン（ERC-20）で入れられます。Random Walk NFTをETH一筆に添付すると、一度だけETH一筆の費用が${protocolFacts.randomWalkDiscountPercentage}%引き下げられます。`,
      },
      {
        title: '持ちこたえる',
        description:
          'サイクルはサイクル確定時刻が切れるまで続きます。新しい一筆はそれぞれ、保存された確定時刻に現在の時間増分を加えます。',
        tooltip:
          '時間増分はおよそ1時間から始まり、サイクルを重ねるごとに徐々に大きくなります。CST一筆の費用は動的な調律期間に従い、ETH一筆とCST一筆はその期間を反対の方向へ動かします。',
      },
      {
        title: '受け取る',
        description:
          'サイクルが確定すると、配分に参加します——シグネチャー配分、星選、係留配分、その他。',
        tooltip: `最後の一筆を入れた参加者は、サイクル準備金の${protocolFacts.mainEthPercentage}%、${cst} CST、Cosmic Signature NFTを受け取ります。星選の受領者、係留者、その他の参加者も配分を受け取ります。`,
      },
    ],
  },
  rewardBreakdown: {
    heading: 'すべての一筆が刻印するもの',
    subhead: '参加は、サイクルごとに複数の配分トラックを刻印します。',
    items: [
      {
        title: '動的な参加CST',
        description:
          '一筆はそれぞれ、前の一筆からの経過時間に基づいてCSTを刻印することがあります。',
        tooltip: `参加CSTは平方根の式を使います：${protocolFacts.dynamicCstRewardFormula}。連続する一筆は0 CSTになることがあり、静かな時間が長いほど刻印は大きくなります。`,
      },
      {
        title: '星選の対象',
        description: '一筆ごとに、サイクル終了時の配分のための星選の対象が1件記録されます。',
        tooltip: `サイクルが確定すると、対象の中から無作為に選ばれます。3人の参加者がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%をETHで分け合います。`,
      },
      {
        title: 'Cosmic Signature NFTの選定',
        description: `サイクルごとに10人の参加者が、星選を通じて${cst} CSTと唯一のCosmic Signature NFTを受け取ります。`,
        tooltip: `サイクルごとに、10人の星選受領者と10人のRandom Walk NFT係留者が、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。`,
      },
      {
        title: 'シグネチャー配分',
        description: `最後の一筆を入れた参加者は、サイクル準備金の${protocolFacts.mainEthPercentage}%をETHで、${cst} CST、そしてCosmic Signature NFTを受け取れます。`,
        tooltip:
          'サイクル準備金はすべての一筆から育ちます。最後の一筆を入れた参加者は、プロトコルのコントラクトを通じてシグネチャー配分を受け取ります。',
      },
    ],
  },
  gameCycle: {
    heading: 'パフォーマンス・サイクルのライフサイクル',
    subhead: 'すべてのサイクルは、開始から確定までこの順序で進みます。',
    phases: [
      {
        label: 'サイクル開始',
        description: `新しいパフォーマンス・サイクルが始まります。最初のETH調律期間が開き、CST調律期間は${protocolFacts.initialCstCalibrationWindowHours}時間の基準から始まって、参加に応じて変化します。`,
        tooltip:
          '調律期間があるので、参加者は下がっていく費用で一筆を入れられます。サイクル準備金はゼロに前のサイクルからの累積準備金を加えたところから始まります。',
      },
      {
        label: '参加者が一筆を入れる',
        description: `一筆ごとに、現在の時間増分がサイクル確定時刻に加わります。参加CSTは動的で、ETH一筆とCST一筆はCST調律期間を約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短く、または約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長く動かします。`,
        tooltip:
          '参加CSTは、前の一筆からの経過時間に基づく平方根の式に従います。正確なCSTの量は、アプリの現在のプレビューが基準です。',
      },
      {
        label: 'サイクル確定時刻が切れる',
        description:
          'カウントダウンがゼロになると、最後の一筆を入れた参加者がサイクルを確定できるようになります。',
        tooltip: `確定が実際に実行されるまで、一筆は引き続き入れられます。遅れて入った一筆は保存された時刻を延ばし、最後の一筆の位置を引き継ぎます。最後の一筆の参加者には${protocolFacts.finalGestureExclusivityHours}時間の優先確定期間があり、その後は誰でも確定でき、シグネチャー配分を受け取ります。`,
      },
      {
        label: 'サイクル確定',
        description: `最後の一筆を入れた参加者がシグネチャー配分を受け取ります：サイクル準備金の${protocolFacts.mainEthPercentage}%、${cst} CST、そしてCosmic Signature NFT。`,
        tooltip:
          'シグネチャー配分の受け取りはプロトコルのコントラクトを通じて行われます。CSTとCosmic Signature NFTは自動的に刻印されます。',
      },
      {
        label: '星選',
        description: `3人のETH星選受領者がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%を分け合います。10人のNFT星選受領者と10人の係留NFT星選受領者が、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。`,
        tooltip:
          '対象は一筆ごとに記録されます。一筆が多いほど選ばれる頻度は高くなります。Random Walk NFTの係留者には別の星選があります。',
      },
      {
        label: '次のサイクル',
        description:
          'サイクル準備金のおよそ半分が累積準備金として次へ持ち越され、次のサイクルは新しい調律期間とともに始まります。',
        tooltip:
          '累積準備金があるということは、プロトコルが価値を引き出すのではなく蓄えていくということです。現在の期間の長さと費用はライブのコントラクトが報告します。',
      },
    ],
  },
  stepByStep: {
    heading: 'はじめに',
    subhead: 'ウォレットの接続から最初の一筆まで、三つのステップで。',
    stepLabel: 'ステップ',
    steps: [
      {
        title: 'ウォレットを接続する',
        tooltip:
          'ArbitrumはEthereum上のレイヤー2ブロックチェーンで、ガス代が安く、トランザクションが速いのが特徴です。',
        highlights: [
          'ページ上部の「ウォレットを接続」ボタンをクリックします。',
          'MetaMaskなど、Arbitrumブロックチェーンに対応したウォレットを使います。',
          '求められたらネットワークをArbitrumに切り替え、権限を承認します。',
          '接続が完了すると、ヘッダーにウォレットアドレスが表示されます。',
        ],
      },
      {
        title: '一筆の費用を確認する',
        tooltip: 'Arbitrumのガス代は通常数セント程度で、Ethereumメインネットよりずっと安価です。',
        highlights: [
          'サイクル確定時刻を確認します。一筆ごとに、保存された確定時刻に現在の時間増分が加わります。',
          '決める前に、ETHまたはCSTでの現在の一筆の費用を確認します。',
          'ライブの参加CSTのプレビューを確認します。量は前の一筆からの経過時間で変わります。',
          'シグネチャー配分の金額を見て、ETH配分の見込みを把握します。',
          'ウォレットに一筆の費用と、ガス代のための少額があることを確かめます。',
        ],
      },
      {
        title: '一筆を入れる',
        tooltip: `各Random Walk NFTは${protocolFacts.randomWalkDiscountPercentage}%のETH一筆の費用の引き下げに一度だけ使えます。使う瞬間は慎重に選んでください。`,
        highlights: [
          `ETHを選び、任意でRandom Walk NFTを添付して${protocolFacts.randomWalkDiscountPercentage}%のETH一筆の費用の引き下げを受けるか、CST（ERC-20）で一筆を入れます。`,
          '「今すぐ一筆」をクリックし、ウォレットでトランザクションを確認します。',
          '一筆はサイクル確定時刻を延ばし、ETH/CSTの費用の状態を更新します。',
          'すべての一筆は星選の対象を記録し、動的な参加CSTを自動的に刻印することがあります。',
        ],
      },
    ],
  },
  proTips: {
    heading: 'コツと戦略',
    subhead: '配分トラック全体で参加を最大限に活かすための実践的な手引き。',
    tips: [
      {
        title: '二つの調律期間を見守る',
        description:
          'ETHとCSTの一筆の費用は別々のライブの期間に従い、一筆ごとにCSTの期間が変わります。',
        tooltip:
          'ETH一筆はCST調律期間をわずかに短くし、CST一筆はわずかに長くします。アプリのライブパネルが現在の費用の推移を示します。',
      },
      {
        title: 'Random Walk NFTを添付する',
        description: `Random Walk NFTを保有していると、一度だけETH一筆の費用が${protocolFacts.randomWalkDiscountPercentage}%引き下げられます。`,
        tooltip:
          '各Random Walk NFTは費用の引き下げに一度しか使えません。効果を最大にするため、費用の高い一筆のために取っておきましょう。',
      },
      {
        title: '星選の対象を積み重ねる',
        description:
          '一筆ごとに星選の対象が1件記録されます。一筆が多いほど選ばれる頻度は高くなります。',
        tooltip: `3人のETH星選受領者がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%を分け合います。10人の参加者NFT受領者と10人のRandom Walk NFT係留者が、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。`,
      },
      {
        title: '使い捨てウォレットを使う',
        description:
          'スマートコントラクトはオンチェーンで公開のソース検証を受けていますが、参加専用のウォレットを使うと安全性がもう一段高まります。',
        tooltip:
          '使い捨てウォレットは、プロトコルでの活動を主な保有資産から切り離し、さらなる安全性を加えます。監査と検証の状況は監査ページで公開しています。',
      },
      {
        title: '確定時刻を見守る',
        description: '一筆ごとに、保存されたサイクル確定時刻に現在の時間増分が加わります。',
        tooltip:
          '期限の近くで一筆を入れると最後の一筆に最も近い位置に立てますが、サイクルが確定するまでは他の参加者が後から一筆を入れることもできます。',
      },
      {
        title: 'CSTで一筆を入れる',
        description: 'CST調律期間を通じて、CSTを一筆の代替通貨として使います。',
        tooltip: `CST一筆は星選の対象を記録し、タイマーを延ばし、動的な参加CSTを刻印することがあり、CST調律期間を約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くします。`,
      },
    ],
  },
  faqCallout: {
    heading: '質問がありますか？',
    body: 'サイクルの仕組み、配分トラック、トークンなど、Cosmic Signatureに関するあらゆることの詳しい回答は、よくある質問をご覧ください。',
    ctaLabel: 'よくある質問を見る',
  },
  callToAction: {
    heading: '最初の一筆を入れる準備はできましたか？',
    body: '進行中のパフォーマンス・サイクルに参加しましょう。ウォレットを接続して最初の一筆を入れ、CSTを刻印し、サイクルのシグネチャーを形づくり始めてください。',
    primaryCtaLabel: 'プロトコルを開く',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
