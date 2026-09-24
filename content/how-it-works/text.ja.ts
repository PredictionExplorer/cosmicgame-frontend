import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('en-US');

/** Japanese how-it-works copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextJa = {
  metadata: {
    title: 'Cosmic Signatureの仕組み | パフォーマンス・サイクル、一筆、NFT',
    description:
      '調律期間から一筆、確定と配分まで、Cosmic Signatureのパフォーマンス・サイクルを順に解説します。',
  },
  jsonLd: {
    name: 'Cosmic Signatureの仕組み',
    description:
      '調律期間から一筆、確定と配分まで、Cosmic Signatureのパフォーマンス・サイクルを順に解説します。',
  },
  breadcrumbs: {
    homeLabel: 'ホーム',
    pageLabel: '仕組み',
  },
  hero: {
    heading: 'Cosmic Signatureの仕組み',
    paragraph:
      '一筆を重ね、時間を見守り、シグネチャーを形づくります。確定時刻を過ぎるとサイクルを確定でき、準備金はシグネチャー配分、係留配分、Protocol Guildなど、10を超えるトラックへ配分されます。',
    primaryCtaLabel: '一筆を入れる',
    secondaryCtaLabel: '現在のサイクルを見る',
  },
  rewardBreakdown: {
    heading: '一筆からつながるもの',
    subhead: '一筆を入れることで、サイクルごとの複数の配分トラックに関わります。',
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
          'サイクル準備金はETH一筆から積み立てられます。最後の一筆を入れた参加者は、プロトコルのコントラクトを通じてシグネチャー配分を受け取ります。',
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
        label: 'サイクル確定時刻を迎える',
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
          '対象は一筆ごとに1件記録され、すべての星選はサイクルの対象全体から復元抽出で選ばれます。Random Walk NFTの係留者には別の星選があります。',
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
  payoff: {
    heading: 'すべてのサイクルはシグネチャーで締めくくられます',
    body: '一筆ごとにサイクルの作品が形づくられます。サイクルが確定すると、そのシグネチャーはCosmic Signature NFTとして刻印され、シグネチャー配分とともに最後の一筆を入れた参加者に渡ります。',
    caption: 'サイクル{cycle}のシグネチャー',
    linkLabel: 'このシグネチャーを見る',
  },
  stepByStep: {
    heading: 'はじめに',
    subhead: 'ウォレットの接続から最初の一筆まで、三つのステップで。',
    stepLabel: 'ステップ{n}',
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
        tooltip:
          'ガス代はネットワークの状況や操作内容によって変わります。一筆の費用とは別に必要なため、送信前にウォレットの見積もりを確認してください。',
        highlights: [
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
          '方法と費用が書かれた一筆のボタン（例：「ETHで一筆」）を押し、ウォレットでトランザクションを確認します。',
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
        body: 'ETH一筆はCST調律期間をわずかに短くし、CST一筆はわずかに長くします。アプリのライブパネルが現在の費用の推移を示します。',
      },
      {
        title: 'Random Walk NFTを添付する',
        body: '各Random Walk NFTは費用の引き下げに一度しか使えません。効果を最大にするため、費用の高い一筆のために取っておきましょう。',
      },
      {
        title: '一筆ごとに星選の対象を1件記録',
        body: `3人のETH星選受領者がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%を分け合います。10人の参加者NFT受領者と10人のRandom Walk NFT係留者が、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。`,
      },
      {
        title: '参加専用のウォレットを使う',
        body: '参加専用のウォレットは、プロトコルでの活動を主な保有資産から切り離し、さらなる安全性を加えます。監査と検証の状況は監査ページで公開しています。',
      },
      {
        title: '確定時刻を見守る',
        body: '期限の近くで一筆を入れると最後の一筆に最も近い位置に立てますが、サイクルが確定するまでは他の参加者が後から一筆を入れることもできます。',
      },
      {
        title: 'CSTで一筆を入れる',
        body: `CST一筆は星選の対象を記録し、タイマーを延ばし、動的な参加CSTを刻印することがあり、CST調律期間を約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くします。`,
      },
    ],
  },
  callToAction: {
    heading: '最初の一筆を入れる準備はできましたか？',
    body: 'ウォレットを接続して、進行中のサイクルに最初の一筆を入れられます。一筆がシグネチャーを形づくり、経過時間に応じて参加CSTが刻印されることもあります。',
    primaryCtaLabel: '一筆を入れる',
    faqCtaLabel: 'よくある質問を見る',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
