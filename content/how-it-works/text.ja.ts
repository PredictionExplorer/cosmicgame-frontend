import { protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('ja');
const cst = numbers.specialAllocationCst;
const eth = numbers.count(numbers.ethRecipients);
const nft = numbers.count(numbers.nftRecipients);
const anchored = numbers.count(numbers.anchoredRecipients);

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
      'パフォーマンス・サイクルの間に参加者が一筆を入れ、その一筆一筆がサイクルのシグネチャーを形づくります。確定時刻を過ぎるとサイクルを確定でき、準備金はシグネチャー配分、係留配分、Protocol Guildなど、定められたトラックへ配分されます。',
    primaryCtaLabel: '一筆を入れる',
    secondaryCtaLabel: '現在のサイクルを見る',
  },
  rewardBreakdown: {
    heading: '一筆からつながるもの',
    subhead: '一筆はそれぞれ、そのサイクルの複数の配分トラックに関わります。',
    items: [
      {
        title: '動的な参加CST',
        description:
          '一筆はCSTを刻印することがあります。量は前の一筆からの経過時間の平方根に従うため、直前の一筆のすぐ後では0 CSTになることもあり、静かな時間が長いほど多く刻印されます。',
      },
      {
        title: '星選の対象',
        description: `一筆ごとに対象が1件記録されます。サイクルが確定すると無作為に${eth}件が選ばれ、サイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%をETHで分け合います。`,
      },
      {
        title: 'Cosmic Signature NFTの選定',
        description: `さらに${nft}件が選ばれ、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。同じアドレスが複数回選ばれることもあり、対象が何件あっても選ばれる保証はありません。`,
      },
      {
        title: 'シグネチャー配分',
        description: `最後の一筆を入れた参加者はサイクルを確定でき、サイクル準備金の${protocolFacts.mainEthPercentage}%をETHで、${cst} CST、そしてCosmic Signature NFTを受け取れます。`,
      },
    ],
  },
  costs: {
    heading: '一筆にかかる費用',
    subhead: 'ETHまたはCSTで一筆を入れる前に、次の点を確認してください。',
    items: [
      {
        title: '支払った費用は戻りません',
        body: '一筆に支払ったETHはサイクル準備金に加わり、支払ったCSTは焼却されます。後から誰かが一筆を入れても、どちらも戻りません。',
      },
      {
        title: 'ETHの費用は一筆ごとに上がります',
        body: `ETH一筆のたびに、次のETH一筆の費用が${protocolFacts.ethGestureCostStepUpPercent}%上がります。費用が下がるのは、各サイクルの開始時に開くETH調律期間だけです。`,
      },
      {
        title: 'ガス代は別にかかります',
        body: '一筆はArbitrumのトランザクションなので、ネットワーク手数料もETHで支払います。金額は確認前にウォレットに表示されます。',
      },
    ],
    note: '失っても差し支えない資金の範囲で一筆を入れてください。',
    riskLinkLabel: 'リスク開示を読む',
  },
  gameCycle: {
    heading: 'パフォーマンス・サイクルのライフサイクル',
    subhead: 'すべてのサイクルは、開始から確定までこの順序で進みます。',
    legend: {
      gestures: '一筆',
      finalization: '確定',
      exclusiveWindow: `最後の一筆の参加者だけが確定できる${protocolFacts.finalGestureExclusivityHours}時間`,
      allocations: '配分トラック',
    },
    phases: [
      {
        label: 'サイクル開始',
        description: `新しいパフォーマンス・サイクルが始まります。ETHとCSTの一筆の費用はそれぞれ調律期間の中で下がり、CST調律期間は${protocolFacts.initialCstCalibrationWindowHours}時間の基準から始まって参加に応じて変化します。サイクル準備金は、前のサイクルから持ち越された分から始まります。`,
      },
      {
        label: '参加者が一筆を入れる',
        description: `一筆ごとに、現在の時間増分がサイクル確定時刻に加わります。ETH一筆はCST調律期間を約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短くし、CST一筆は約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くします。`,
      },
      {
        label: 'サイクル確定時刻を迎える',
        description: `カウントダウンがゼロになると、最後の一筆を入れた参加者は${protocolFacts.finalGestureExclusivityHours}時間のうちにサイクルを確定できます。その後は誰でも確定でき、確定した人がシグネチャー配分を受け取ります。確定が実行されるまでは新しい一筆を入れられ、その一筆が時刻を延ばして最後の一筆になります。`,
      },
      {
        label: 'サイクル確定',
        description: `確定によってすべての配分が行われます。確定した参加者は、サイクル準備金の${protocolFacts.mainEthPercentage}%、${cst} CST、Cosmic Signature NFTからなるシグネチャー配分を受け取ります。`,
      },
      {
        label: '星選',
        description: `${eth}人のETH星選受領者がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%を分け合います。${nft}人のNFT星選受領者と、係留されたRandom Walk NFTから選ばれる${anchored}人の係留NFT星選受領者が、それぞれ${cst} CSTとCosmic Signature NFTを受け取ります。対象は一筆ごとに1件記録され、ETHとNFTの星選はサイクルの対象全体から復元抽出で選ばれます。`,
      },
      {
        label: '次のサイクル',
        description: `サイクル準備金の残り${protocolFacts.compoundingReservePercentage}%が累積準備金として持ち越され、次のサイクルは新しい調律期間とともに始まります。`,
      },
    ],
  },
  payoff: {
    heading: 'すべてのサイクルはシグネチャーで締めくくられます',
    body: `一筆ごとにサイクルの作品が形づくられます。サイクルが確定すると、そのシグネチャーはCosmic Signature NFTとして刻印され、シグネチャー配分とともにサイクルを確定した参加者に渡ります。カウントダウンがゼロになってから${protocolFacts.finalGestureExclusivityHours}時間は、最後の一筆を入れた参加者だけが確定でき、その後は誰でも確定できます。`,
    linkLabel: 'このシグネチャーを見る',
  },
  stepByStep: {
    heading: 'はじめに',
    subhead: 'ウォレットの接続から最初の一筆まで、三つのステップで。',
    stepLabel: 'ステップ{n}',
    steps: [
      {
        title: 'ウォレットを接続する',
        highlights: [
          'ページ右上の接続ボタンを押します。',
          'MetaMaskなど、Arbitrumに対応したウォレットを使います。ArbitrumはEthereumのレイヤー2で、手数料が安く、トランザクションが速いのが特徴です。',
          '求められたらネットワークをArbitrumに切り替え、接続を承認します。',
          '接続が完了すると、ヘッダーにウォレットアドレスが表示されます。',
        ],
      },
      {
        title: '一筆の費用を確認する',
        highlights: [
          '決める前に、ETHまたはCSTでの現在の一筆の費用を確認します。',
          '参加CSTのプレビューを確認します。量は前の一筆からの経過時間で変わります。',
          'ウォレットに一筆の費用と、ネットワーク手数料のための少額のETHがあることを確かめます。手数料は確認前にウォレットに表示されます。',
        ],
      },
      {
        title: '一筆を入れる',
        highlights: [
          `ETHかCSTを選びます。ETH一筆にはRandom Walk NFTを添付でき、${protocolFacts.randomWalkDiscountPercentage}%のETH一筆の費用の引き下げを受けられます。引き下げは1つのNFTにつき一度だけです。`,
          '方法と費用が書かれた一筆のボタン（例：「ETHで一筆」）を押し、ウォレットでトランザクションを確認します。',
        ],
      },
    ],
    fundingText: 'ArbitrumのETHがまだありませんか？',
    fundingLinkLabel: 'ArbitrumでETHを用意する方法',
  },
  proTips: {
    heading: '知っておきたいこと',
    subhead: '見落としやすい点をまとめました。',
    tips: [
      {
        title: '二つの調律期間',
        body: `ETHの一筆の費用が調律期間で下がるのは、各サイクルの開始時の一度だけです。CSTの一筆の費用は、CST一筆のたびに新しい期間が始まり、直前に支払われた費用の2倍（最低${protocolFacts.cstCalibrationCeilingMinCst} CST）からゼロまで下がります。`,
      },
      {
        title: 'Random Walk NFTは一度だけ',
        body: `Random Walk NFTは1回のETH一筆の費用を${protocolFacts.randomWalkDiscountPercentage}%引き下げ、その後はほかの一筆には使えません。使うことと係留することは別です。`,
      },
      {
        title: '参加専用のウォレットを使う',
        body: '参加専用のウォレットは、プロトコルでの活動を主な保有資産から切り離します。レビューと検証の状況は監査ページで確認できます。',
      },
    ],
  },
  callToAction: {
    heading: '最初の一筆を入れる準備はできましたか？',
    body: 'ウォレットを接続して、進行中のサイクルに最初の一筆を入れられます。一筆がシグネチャーを形づくり、経過時間に応じて参加CSTが刻印されることもあります。',
    primaryCtaLabel: '一筆を入れる',
    faqCtaLabel: 'よくある質問を見る',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X（Twitter）',
  },
} satisfies HowItWorksText;
