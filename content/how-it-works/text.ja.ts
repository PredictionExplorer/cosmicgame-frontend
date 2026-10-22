import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { HowItWorksText } from './structure';

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
          'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
      },
      {
        title: '星選の対象',
        description:
          '一筆の時点における、割引も終盤の加算もないETH基本費用をウェイトとして選びます。同じアドレスを複数回選ぶことがあります。',
      },
      {
        title: 'Cosmic Signature NFTの選定',
        description:
          '一筆の時点における、割引も終盤の加算もないETH基本費用をウェイトとして選びます。同じアドレスを複数回選ぶことがあります。',
      },
      {
        title: 'シグネチャー配分',
        description: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。`,
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
        body: `ETH一筆ごとに、整数処理した${protocolFacts.ethGestureCostStepUpPercent}%と1 weiを次のETH基本費用に加えます。終盤の加算や保持された過払いはこの基本費用に含めません。ETHとCSTの基本費用は別々のルールに従います。開始時のETH費用は調律期間中に下がり、ETH一筆ごとに次の基本費用が上がります。CST費用は保存された下降速度で下がります。確定時刻が近づくと両方に終盤の加算が付きますが、次の基本費用や星選のウェイトは増やしません。`,
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
        description:
          'サイクル最初の一筆はETHで入れ、確定時計を始めます。以降の一筆は、時刻を過ぎた後も保存済みの確定時刻に現在の加算時間を足します。現在時刻から時計を再開するわけではありません。確定処理が成功するまでは一筆を入れられます。',
      },
      {
        label: '参加者が一筆を入れる',
        description:
          'V3が保存するのはCST費用の下降速度で、期間の長さは速度と上限から求めます。ETH一筆はrate + floor(rate / 100)への増加を試み、CST一筆はrate - floor(rate / 101)へ減少させます。最短期間の条件に反する増加は行いません。CST一筆の後の上限は、加算前のCST基本費用の2倍、設定された最小値、新しい速度と180秒の積のうち最大の値です。次の一筆をすぐに入れることはできます。',
      },
      {
        label: 'サイクル確定時刻を迎える',
        description: `カウントダウンがゼロになると、最後の一筆を入れた参加者は${protocolFacts.finalGestureExclusivityHours}時間のうちにサイクルを確定できます。その後は誰でも確定でき、確定した人がシグネチャー配分を受け取ります。確定が実行されるまでは新しい一筆を入れられ、その一筆が時刻を延ばして最後の一筆になります。`,
      },
      {
        label: 'サイクル確定',
        description: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。`,
      },
      {
        label: '星選',
        description: `確定時にウェイト付きの${protocolFacts.ethStellarSelectionRecipients}回の選定で準備金のETH${protocolFacts.stellarSelectionEthPercentage}%を分けます。別に参加者NFTの${protocolFacts.nftStellarSelectionRecipients}回と係留中のRandom Walk NFTの最大${protocolFacts.anchoredRwlkNftSelectionRecipients}回の選定にNFTとCSTを配ります。参加者向けのETH星選とNFT星選は、どちらも一筆ごとのウェイトを使います。ウェイトは、その時点のETH基本費用からRandom Walk NFTによる割引と終盤の加算を除いた値です。CST一筆にも同時点のETH基本費用を使います。復元を伴う選定なので、同じアドレスが複数回選ばれることがあります。係留NFT星選は、係留中のRandom Walk NFTを別に対象とします。`,
      },
      {
        label: '次のサイクル',
        description:
          'ETHのおよそ半分が次のサイクルへ持ち越されます。整数の丸め、省略されたトラック、送付失敗により残高が増える場合があります。次の開始準備金が前より大きくなる保証はありません。',
      },
    ],
  },
  payoff: {
    heading: 'すべてのサイクルはシグネチャーで締めくくられます',
    body: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。`,
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
          '参加CSTの最小値は、次の一筆が直前の参加者へ刻印する数量を制限します。送信者への支払いを保証する値ではありません。両者が同じアドレスなら送信者自身が受け取ります。0はこの制限を無効にし、サイクル最初のETH一筆はこの確認を省略します。最大費用とネットワーク手数料は別の条件です。',
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
        body: 'V3が保存するのはCST費用の下降速度で、期間の長さは速度と上限から求めます。ETH一筆はrate + floor(rate / 100)への増加を試み、CST一筆はrate - floor(rate / 101)へ減少させます。最短期間の条件に反する増加は行いません。CST一筆の後の上限は、加算前のCST基本費用の2倍、設定された最小値、新しい速度と180秒の積のうち最大の値です。次の一筆をすぐに入れることはできます。',
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
    body: 'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
    primaryCtaLabel: '一筆を入れる',
    faqCtaLabel: 'よくある質問を見る',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X（Twitter）',
  },
} satisfies HowItWorksText;
