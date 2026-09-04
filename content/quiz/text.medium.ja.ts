import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('en-US');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * Medium tier: the live mechanics. Calibration Windows, the CST feedback
 * loop, persistence tracks, Selection math, Council parameters. Numbers
 * interpolate from protocolFacts.
 */
export const mediumQuestionsTextJa = {
  'eth-opening-price-discovery': {
    prompt: '新しいサイクルは、開始時のETH一筆の費用をどのように見つけますか？',
    options: {
      a: `ETH調律期間は、前のサイクルで支払われた開始時の費用の${protocolFacts.ethCalibrationCeilingMultiplier}倍から始まり、その200分の1に1 weiを加えた下限へ向かって線形に下がる。`,
      b: `すべてのサイクルは固定の${protocolFacts.initialGestureCostEth} ETHで開く。`,
      c: '宇宙評議会が各サイクルの開始時の費用を決める。',
      d: '誰かが一筆を入れるまで、費用は1時間ごとに倍になる。',
    },
    explanation: `これは注文板のない価格の発見です。前のサイクルの開始が安すぎたなら、倍にすることで余地が戻ります。倍にした値が高すぎると分かれば、下降が誰かが始めてもよいと思う水準を見つけます。固定の${protocolFacts.initialGestureCostEth} ETHを使ったのは最初のサイクルだけで、それ以降のすべてのサイクルは前のサイクルから調律されます。`,
    referenceLabel: 'ホワイトペーパー §3.1——ETH調律期間',
  },
  'eth-step-up': {
    prompt: 'PaxがETH一筆を入れました。次のETH一筆の費用はどうなりますか？',
    options: {
      a: `${protocolFacts.ethGestureCostStepUpPercent}%に1 weiを加えた分だけ上がる。この数列は公開されていて正確。`,
      b: '倍になる。',
      c: 'サイクルが確定するまで同じまま。',
      d: `活動を促すために${protocolFacts.ethGestureCostStepUpPercent}%下がる。`,
    },
    explanation: `最初の一筆の後、ETH一筆はそれぞれ次のETH一筆の費用を${protocolFacts.ethGestureCostStepUpPercent}%と1 weiだけ上げるので、費用は常に増えます。誰でも動く前にコントラクトから現在の費用を読み取れます。費用の上がり方はルールで決まっており、事前に確認できます。`,
    funFact:
      '追加の1 weiには意味があります。費用が小さすぎて、その一定割合がゼロに丸められる場合でも、厳密な増加を保証します。',
    referenceLabel: 'ホワイトペーパー §4.1——ETH一筆',
  },
  'overpay-refund': {
    prompt:
      'Vegaがうっかり、現在の一筆の費用よりかなり多くのETHを送りました。余分はどうなりますか？',
    options: {
      a: '同じトランザクションの中で彼女に返される。',
      b: '金額にかかわらず準備金に取られる。',
      c: '次の一筆の分として充当される。',
      d: '公共財へ送られる。',
    },
    explanation:
      'ダスト閾値を超える過払いは、同じトランザクションの中で返されます。その閾値より下では、返金は戻す額よりガス代のほうが高くつくので、差額は準備金に残ります。少額の返金でガス代が返金額を上回らないよう、閾値を設けています。',
    referenceLabel: 'ホワイトペーパー §4.1——ETH一筆',
  },
  'cst-window-restart': {
    prompt: 'LyraがCST一筆を入れました。CST調律期間はどう変わりますか？',
    options: {
      a: `彼女が支払った費用の${protocolFacts.cstCalibrationCeilingMultiplier}倍——ただし${cst(protocolFacts.cstCalibrationCeilingMinCst)} CSTを下回らない——から期間をやり直し、再びゼロへ向かって線形に下がる。`,
      b: '何もしない。期間はそのまま下がり続ける。',
      c: `費用はサイクルの残りの間${cst(protocolFacts.cstCalibrationCeilingMinCst)} CSTに固定される。`,
      d: '期間は閉じ、CST一筆は次のサイクルまで止まる。',
    },
    explanation: `すべてのCST一筆は、新しい開始値から期間をやり直します。最後に支払われた費用の${protocolFacts.cstCalibrationCeilingMultiplier}倍で、開始点には${cst(protocolFacts.cstCalibrationCeilingMinCst)} CSTの下限があります。そこから費用は期間の長さをかけてゼロへ線形に下がります。使われたCSTは、その途中で焼却されます。`,
    referenceLabel: 'ホワイトペーパー §4.3——CST一筆',
  },
  'cst-free-quiet': {
    prompt:
      'プロトコルが長い間静かで、CST調律期間は完全に経過しました。いま何が成り立っていますか？',
    options: {
      a: 'CST一筆の費用はゼロ。実行には現在のサイクルのルールが適用され、ガス代も別途必要。',
      b: 'サイクルは自動的に確定する。',
      c: 'ETH一筆が届くまでCST一筆は無効になる。',
      d: 'CSTの費用は上限まで上がっている。',
    },
    explanation:
      'CST調律期間が完全に過ぎると、CST一筆の費用はゼロになります。それでも現在のサイクルの実行条件を満たす必要があり、ガス代は別途かかります。費用がゼロでも、一筆の実行や時間延長が必ず成立するとは限りません。サイクルの確定には、別のトランザクションが必要です。',
    referenceLabel: 'ホワイトペーパー §4.3——CST一筆',
  },
  'window-feedback-loop': {
    prompt: 'ETH一筆が続けて入りました。CST調律期間の長さはどう変わりますか？',
    options: {
      a: `ETH一筆はそれぞれ約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短くするので、CSTの費用はより速く下がり、CST一筆はより早く魅力的になる。`,
      b: `ETH一筆はそれぞれ約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くし、CSTの下降を遅くする。`,
      c: '何もしない。二つの通貨は独立している。',
      d: '期間は元の長さにリセットされる。',
    },
    explanation: `期間の長さは参加状況に応じて変わり、ETHとCSTの利用を調整します。ETH一筆はそれぞれ約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短くし、CST一筆はそれぞれ約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くします。ETHの活動が盛んならCSTの下降は速まり、CSTの活動が盛んならまた遅くなります。こうしてETHとCSTの利用状況が互いの費用に反映されます。`,
    referenceLabel: 'ホワイトペーパー §4.3——CST一筆',
  },
  'participation-cst-timing': {
    prompt:
      '開始時のパラメーターで、二つの一筆が参加CSTを刻印します。一つは前の一筆の1秒後に届き、もう一つはまる一日の沈黙を終わらせます。それぞれ、おおよそどれだけ刻印しますか？',
    options: {
      a: `約${oneSecondExample.cst} CSTと約${oneDayExample.cst} CST。量は経過時間の平方根とともに増える。`,
      b: `タイミングにかかわらず、それぞれ一律${cst(100)} CST。`,
      c: '同じ量。タイミングは決して関係ない。',
      d: 'どちらもゼロ。CSTを刻印するのは確定だけ。',
    },
    explanation: `参加CSTは前の一筆からの時間の平方根とともに増えます。1秒後に届く一筆はほとんど何も刻印しません（約${oneSecondExample.cst} CST）が、一日の沈黙を終わらせる一筆は数百を刻印します（約${oneDayExample.cst} CST）。一筆あたり一律${cst(100)} CSTは元のV1のルールでした。それは機械の速さの連続を無償のCSTに変えてしまい、まさにそれがV2が置き換えた理由です。`,
    funFact:
      '参加CSTは、前の一筆から時間が空くほど多くなります。ごく短い間隔で一筆を繰り返しても、各回の参加CSTはほぼゼロです。功労CSTと広報準備金には別の刻印ルールがあります。',
    referenceLabel: 'ホワイトペーパー §7.1——刻印のルール',
  },
  'cst-max-cost-protection': {
    prompt:
      'CST一筆を送信するとき、トランザクションが遅れて届いても想定より多く支払わないよう、Kestrelを守っているものは何ですか？',
    options: {
      a: '彼女が受け入れる最大の費用を指定する。一筆は承認された額より多くは使えない。',
      b: '何もない。実行時の価格が彼女の支払う額。',
      c: 'サイクルの後で宇宙評議会が過剰請求を返す。',
      d: 'CSTの費用は署名と実行の間で決して変わらない。',
    },
    explanation:
      'CST一筆を送信する参加者は受け入れる最大の費用を指定するので、想定より遅れて届いた一筆が承認された額より多く使うことはありません。これが最も重要になるのは、別のCST一筆がより高い値で期間をやり直した直後です。',
    referenceLabel: 'ホワイトペーパー §4.3——CST一筆',
  },
  'endurance-definition': {
    prompt:
      'Ariは静かな午後に一筆を入れ、十時間続けて誰にも追い落とされませんでした。サイクルで最も長い静かな間隔です。彼が受け取る位置にいる称号はどれですか？',
    options: {
      a: '持久チャンピオン。最新の一筆を入れた参加者として最も長く連続して先頭を保持した。',
      b: '時の戦士。称号を最も長い時間保った。',
      c: 'どちらでもない。称号は入れた一筆の数で決まる。',
      d: '自動的に最後の一筆の役割。',
    },
    explanation:
      '持久チャンピオンは、最新の一筆を入れた参加者として最も長く連続して先頭を保持した参加者です。一つの一筆が持ちこたえた、最も長い静かな間隔です。時の戦士のトラックは一段上にあり、別のものを測ります：持久チャンピオンの称号そのものがどれだけ長く保たれたかです。',
    referenceLabel: 'ホワイトペーパー §5.2——持久チャンピオンと時の戦士',
  },
  'chrono-definition': {
    prompt:
      'Ariは十時間の先頭保持記録を作り、Beaが更新するまで二日間、持久チャンピオンの称号を保持しました。時の戦士のトラックは何を測りますか？',
    options: {
      a: '持久チャンピオンの称号を最も長く途切れずに保った人。Ariが記録を保った二日間は彼のものとして数えられる。',
      b: '他の参加者の一筆の後、最も速く反応した人。',
      c: '全体で最も多くのサイクルに参加した人。',
      d: 'サイクルの最後の一筆を入れた人。',
    },
    explanation:
      '持久は自分が作った間隔を測り、時の戦士のトラックは自分の記録がどれだけ長く持ちこたえたかを測ります。Ariの持久の間隔は十時間でしたが、持久チャンピオンとしての彼の在位は二日間続きました。時の戦士のトラックが採点するのは、その在位です。どちらも確定時にだけ決着します。',
    referenceLabel: 'ホワイトペーパー §5.2——持久チャンピオンと時の戦士',
  },
  'eth-selection-count': {
    prompt: '確定時、ETH星選はその分をどのように配りますか？',
    options: {
      a: `サイクルの一筆のプールから${protocolFacts.ethStellarSelectionRecipients}件の対象が選ばれ、準備金の${protocolFacts.stellarSelectionEthPercentage}%を等しく分け合う。`,
      b: `${protocolFacts.nftStellarSelectionRecipients}件の対象が選ばれ、それぞれETHとNFTを受け取る。`,
      c: '1件の対象が選ばれ、全額を受け取る。',
      d: 'すべての参加者が等しい分を受け取る。',
    },
    explanation: `ETH星選は${protocolFacts.ethStellarSelectionRecipients}件の対象を選び、それらが準備金の${protocolFacts.stellarSelectionEthPercentage}%を等しく分け合います。${protocolFacts.nftStellarSelectionRecipients}件という数字は別のNFT星選のもので、こちらはETHではなくCSTとNFTを携えます。`,
    referenceLabel: 'ホワイトペーパー §5.3——星選',
  },
  'nft-selection-count': {
    prompt: 'NFT星選の受領者はそれぞれ何を受け取り、何件が選ばれますか？',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CSTとCosmic Signature NFT 1点。一筆のプールから${protocolFacts.nftStellarSelectionRecipients}回選ばれる。`,
      b: `ETHの分け前。${protocolFacts.ethStellarSelectionRecipients}回選ばれる。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST。1回選ばれる。`,
      d: `NFT 1点のみ。${protocolFacts.typicalNftsPerCycle}回選ばれる。`,
    },
    explanation: `NFT星選は${protocolFacts.nftStellarSelectionRecipients}件の対象を選び、それぞれが${cst(protocolFacts.specialAllocationCst)} CSTとNFT 1点を携えます。功労CSTはそのNFTとあわせて配分されます。確定時のすべてのNFTの分配は、この二つを対にします。`,
    referenceLabel: 'ホワイトペーパー §5.1——確定時の分配',
  },
  'draws-with-replacement': {
    prompt: '同じ参加者が、一つのサイクルの星選で複数回選ばれることはありますか？',
    options: {
      a: 'ある。選定は復元抽出で行われ、対象は入れた一筆の数に応じて増える。',
      b: 'ない。各参加者は最大1回しか選ばれない。',
      c: '一筆が10以上の参加者だけが繰り返し選ばれうる。',
      d: '宇宙評議会が繰り返しを承認した場合だけ。',
    },
    explanation:
      '選定は復元抽出で行われるので、同じ参加者が複数回選ばれることがあります。各一筆は1件の対象を記録するので、選ばれる頻度は参加に比例します。この仕組みは、アドレスごとに1回の選定を配給するのではなく、活動に応じて広がります。',
    referenceLabel: 'ホワイトペーパー §5.3——星選',
  },
  'anchored-rwlk-track': {
    prompt: '係留中のRandom Walk NFTはサイクルから何を受け取りますか？',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CSTとCosmic Signature NFT 1点を携えた${protocolFacts.anchoredRwlkNftSelectionRecipients}回の選定。係留したNFTの数で重み付けされ、ETHはない。`,
      b: `${protocolFacts.anchorDistributionPercentage}%のETH係留配分の比例した分け前。`,
      c: '何もない。係留できるのはCosmic Signature NFTだけ。',
      d: '係留を解除したときの一度きりのCSTの支払い。',
    },
    explanation: `Random Walk NFTの係留には、別の役割があります。係留NFT星選で選定を受け、サイクルごとに${protocolFacts.anchoredRwlkNftSelectionRecipients}回、それぞれがCSTとCosmic Signature NFTを携えます。ETHの係留配分は係留中のCosmic Signature NFTだけのものです。Random Walkの係留にETH配分はありません。`,
    referenceLabel: 'ホワイトペーパー §8——係留',
  },
  'exclusivity-window': {
    prompt: '最後の一筆の参加者は、確定する独占的な権利をどれだけの間保ちますか？',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours}時間`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch}時間`,
      c: `${protocolFacts.initialCycleTimeIncrementHours}時間`,
      d: `${protocolFacts.initialCstCalibrationWindowHours}時間`,
    },
    explanation: `独占的な期間は${protocolFacts.finalGestureExclusivityHours}時間です。その後は誰でも確定でき、受領者の役割を引き継げます。${protocolFacts.initialCycleFinalizationHoursAtLaunch}時間という数字は、サイクルの最初の一筆の後の初期カウントダウンで、まったく別の時計です。`,
    funFact: `V1が最後の一筆の参加者に与えた優先期間は${protocolFacts.initialCycleFinalizationHoursAtLaunch}時間だけでした。実際のサイクルで人が本当に期限を寝過ごすことが分かり、V2はそれを倍にしました。`,
    referenceLabel: 'ホワイトペーパー §3.3——確定',
  },
  'escrow-timeout': {
    prompt:
      'JunoはETH星選で選ばれましたが、エスクローにあるETHを一度も受け取りません。タイムアウトの後、何が起こりますか？',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks}週間後、未受け取りの配分を誰でも自分のものとして受け取れる。`,
      b: 'サイクル準備金に戻る。',
      c: '焼却される。',
      d: 'Junoが現れるまで無期限にエスクローで待つ。',
    },
    explanation: `エスクローされた配分と添付されたアセットは${protocolFacts.secondaryRetrievalTimeoutWeeks}週間待ちます。その後、コントラクトは未受け取りの配分を誰でも自分のものとして受け取ることを許します。このルールは公開確定期間と対になっています。すべての分配は、いずれそれを望む手に届きます。早めに受け取ってください。`,
    referenceLabel: 'ホワイトペーパー §5.4——配送、エスクロー、タイムアウト',
  },
  'push-vs-pull': {
    prompt: '確定の間に直接送り出されるETHはどれで、エスクローで待つのはどれですか？',
    options: {
      a: 'シグネチャー配分と公共財への送付は直接送られ、時の戦士のETHとETH星選の分け前は配分ウォレットで待つ。',
      b: 'すべてがすべての受領者へ直接送られる。',
      c: '受領者の分を含め、すべてがエスクローで待つ。',
      d: 'エスクローされるのはCSTだけで、ETHはすべて直接送られる。',
    },
    explanation:
      '分配は意図的にプッシュとプルに分けられています。受領者のETHと公共財への送付は確定の間にプッシュされ、二次的なETH配分は各受領者が受け取るために配分ウォレットに置かれます。CSTとNFTは受領者へ直接刻印されます。',
    referenceLabel: 'ホワイトペーパー §5.4——配送、エスクロー、タイムアウト',
  },
  'council-proposal-threshold': {
    prompt: '調整提案を提出するには、アドレスにどれだけの委任されたCSTのウェイトが必要ですか？',
    options: {
      a: `少なくとも${protocolFacts.councilProposalThresholdCst} CST。`,
      b: `少なくとも${cst(protocolFacts.specialAllocationCst)} CST。`,
      c: `少なくとも${cst(protocolFacts.outreachReserveCst)} CST。`,
      d: 'いくらでも。しきい値はない。',
    },
    explanation: `提案のしきい値は、委任されたウェイト${protocolFacts.councilProposalThresholdCst} CSTです。提案が身近なものであるよう、意図的に控えめにしてあります。${cst(protocolFacts.specialAllocationCst)} CSTという数字は各NFTの分配に伴う功労CSTで、混同しやすい別の定数です。`,
    referenceLabel: 'ホワイトペーパー §9——宇宙評議会',
  },
  'council-timeline': {
    prompt: '調整提案が今日提出されました。どんな時間の流れが続きますか？',
    options: {
      a: `${protocolFacts.councilVotingDelayDays}日間の調整の遅延、その後${protocolFacts.councilVotingPeriodWeeks}週間の調整の期間。`,
      b: '提案者が十分なCSTを持っていれば、すぐに効力を生じる。',
      c: `${protocolFacts.secondaryRetrievalTimeoutWeeks}週間の遅延、その後${protocolFacts.councilVotingDelayDays}日間の調整の期間。`,
      d: `${protocolFacts.finalGestureExclusivityHours}時間の遅延、その後自動的に実行される。`,
    },
    explanation: `提案は${protocolFacts.councilVotingDelayDays}日間の調整の遅延を待ち、その後${protocolFacts.councilVotingPeriodWeeks}週間の調整の期間の間、開かれたままになります。遅延は、スナップショットの前に保有者が委任を調整する時間を与えます。すぐに効力を生じるものは何もありません。`,
    referenceLabel: 'ホワイトペーパー §9——宇宙評議会',
  },
  'quorum-rule': {
    prompt: '調整提案はいつ成立しますか？',
    options: {
      a: `支持が反対を上回り、支持と棄権のウェイトの合計が${protocolFacts.councilQuorumPercent}%の調整定足数に達したとき。`,
      b: '支持だけで総CST供給量の半分に達したとき。',
      c: `支持、反対、棄権の合計が${protocolFacts.councilQuorumPercent}%に達したとき。`,
      d: 'プロトコルの所有者が結果に副署したとき。',
    },
    explanation: `二つの条件が成り立たなければなりません。支持が反対を上回ること、そして支持と棄権の合計が総CST供給量の${protocolFacts.councilQuorumPercent}%という調整定足数に達することです。反対のウェイトは意図的に定足数に数えられません。提案に反対することが、うっかりそれを基準に届かせることはないのです。`,
    referenceLabel: 'ホワイトペーパー §9——宇宙評議会',
  },
  'weight-activation': {
    prompt:
      'RookはウォレットにCSTを持っていますが、評議会に触れたことはありません。彼のCSTはどれだけの調整ウェイトを表しますか？',
    options: {
      a: 'ゼロ。ウェイトは自分または別のアドレスへの委任によってのみ有効になる。',
      b: 'CSTごとに1単位、自動的に。',
      c: 'CSTをどれだけ長く保有しているかによる。',
      d: 'ウェイトはCSTではなく係留中のNFTから来る。',
    },
    explanation:
      '調整ウェイトは委任によって有効になります。保有者は自分または別のアドレスへ委任し、それから各CSTは1単位のウェイトを表します。委任されていないCSTはまったくウェイトを持ちません。保有しているだけでは、調整への参加にはなりません。',
    referenceLabel: 'ホワイトペーパー §7.3——調整ウェイト',
  },
  'time-increment-growth': {
    prompt:
      '各一筆が加える時間増分は、ちょうど一時間から始まりました。それはどう変わっていきますか？',
    options: {
      a: `確定したサイクルごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなるので、サイクルは年月をかけて徐々に長くなる。`,
      b: '永遠に一時間に固定されている。',
      c: 'サイクルごとに倍になる。',
      d: '参加者が増えるほど縮む。',
    },
    explanation: `増分は確定したサイクルごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなります。この増加がサイクルごとに積み重なります。サイクルは長くなり、NFTの刻印のペースは遅くなり、プロトコルのテンポは年を重ねるにつれて設計どおりに伸びていきます。`,
    referenceLabel: 'ホワイトペーパー §3.2——カウントダウン',
  },
  'typical-cst-fixed': {
    prompt: '標準的なサイクルはどれだけの固定CSTを刻印し、その内訳はどうなっていますか？',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST——${protocolFacts.typicalNftsPerCycle}件のNFTの分配それぞれに伴う${cst(protocolFacts.specialAllocationCst)} CSTと、広報準備金への${cst(protocolFacts.outreachReserveCst)} CST。`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST、すべてサイクルの受領者へ。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST、すべてコミュニティの広報へ。`,
      d: 'サイクルごとに予測できない形で変わる。',
    },
    explanation: `固定の流れは正確です。${protocolFacts.typicalNftsPerCycle}件のNFTに伴う${cst(protocolFacts.specialAllocationCst)} CSTの刻印と、${cst(protocolFacts.outreachReserveCst)} CSTの広報分で、標準的なサイクルの合計は${cst(protocolFacts.typicalCstImprintsPerCycle)} CSTです。個々の一筆からの動的な参加CSTはこれに加わるもので、タイミングに依存します。`,
    referenceLabel: 'ホワイトペーパー §7.1——刻印のルール',
  },
  'attached-assets-destination': {
    prompt: 'WrenがERC-20トークンを一筆に添付しました。添付されたアセットはどこへ行きますか？',
    options: {
      a: '配分ウォレットのエスクローへ。確定後、サイクルの受領者がそれを受け取る優先権を持つ。',
      b: '一筆のETHとともにサイクル準備金へ。',
      c: 'サイクルが確定したときにWrenへ戻る。',
      d: '確定時に焼却される。',
    },
    explanation:
      '添付されたアセットは決してETHの準備金に加わりません。配分ウォレットが保管し、確定後はサイクルの受領者がそれらを受け取る優先権を持ちます。他のすべてのエスクローされた配分と同じ、公開の受け取りタイムアウトに従います。',
    referenceLabel: 'ホワイトペーパー §4.4——メッセージと添付されたアセット',
  },
  'next-cycle-delay': {
    prompt: 'サイクルがちょうど確定しました。次のサイクルはいつ有効になりますか？',
    options: {
      a: `短い遅延の後——既定では${protocolFacts.defaultNextCycleDelayMinutes}分。ただし、オンチェーンのライブの値は調整可能で、それが基準になる。`,
      b: '同じトランザクションの中で、すぐに。',
      c: `ちょうど${protocolFacts.finalGestureExclusivityHours}時間後。`,
      d: '所有者が手動で始めたときだけ。',
    },
    explanation: `確定の後、次のサイクルは短い遅延——既定では${protocolFacts.defaultNextCycleDelayMinutes}分——を経て有効になります。ライブの遅延はオンチェーンに保存され、所有者が設定できるので、既定値ではなくコントラクトが基準です。有効になると、新しいサイクルの調律期間が開きます。`,
    referenceLabel: 'ホワイトペーパー §3.3——確定',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
