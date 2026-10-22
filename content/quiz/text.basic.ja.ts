import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { QuizTierQuestionsText } from './structure';

/**
 * Basic tier: the shape of the protocol. Scenario-first where possible;
 * every distractor is a misconception someone actually holds. Facts and
 * numbers interpolate from protocolFacts and match the white paper.
 */
export const basicQuestionsTextJa = {
  'what-is-cosmic-signature': {
    prompt: '友人から「Cosmic Signatureって結局何なの？」と聞かれました。正しい答えはどれですか？',
    options: {
      a: 'Arbitrum上のプロシージャル・オンチェーンアート・プロトコルで、時間制限のあるパフォーマンス・サイクルの連なりとして動く。',
      b: 'テキストのプロンプトを宇宙の絵に変えるAI画像サービス。',
      c: '生物学者が使うがん変異シグネチャーのデータベース。',
      d: 'NFTコレクションの価格予測サービス。',
    },
    explanation:
      'Cosmic Signatureはプロシージャルアートのプロトコルです。時間制限のあるパフォーマンス・サイクルが一筆で満たされ、確定が決定論的な三体アートワークを刻印します。パイプラインのどこにもAIは関わっていません。アートはシードから計算された物理であり、テキストプロンプトの画像サービスとは正反対です。',
    funFact:
      'この名前は、よく知られたがん変異データベースCOSMICと重なります。プロトコルはそれとは何の関係もなく、ドキュメントはその区別をはっきりと述べています。',
    referenceLabel: '学ぶ：Cosmic Signatureとは？',
  },
  'what-is-a-gesture': {
    prompt: 'プロトコルの言葉で、一筆とは何ですか？',
    options: {
      a: 'ETHまたはCSTを携えた小さなオンチェーンの行為で、サイクルのカウントダウンを延ばし、星選の対象を記録する。',
      b: 'コミュニティの請願のために集められるオフチェーンの署名。',
      c: '手で描いてアートワークに加えられる筆致。',
      d: 'コミュニティのチャンネルに投稿されるメッセージ。',
    },
    explanation:
      '一筆はサイクルを進める基本的な参加行為です。それぞれがETHまたはCSTを携え、サイクル確定時刻をさらに先へ押し出し、サイクルの星選に1件の対象を記録し、参加CSTを刻印することがあります。何かを手で描くことは決してありません。アートワークは確定時にシードから計算されます。',
    referenceLabel: 'ホワイトペーパー §4——一筆',
  },
  'two-currencies': {
    prompt: '一筆の費用に使える通貨はどれですか？',
    options: {
      a: 'ETH、またはプロトコル独自のERC-20トークンであるCST。',
      b: 'ETHのみ。',
      c: 'CSTのみ。',
      d: 'ステーブルコインを含む任意のERC-20。',
    },
    explanation:
      '入り口はちょうど二つ：ETH一筆とCST一筆です。他のERC-20トークンは携えるアセットとして一筆に添付できますが、一筆そのものの支払いには決して使われません。一筆の費用はETHまたはCSTだけで決済されます。',
    referenceLabel: 'ホワイトペーパー §4——一筆',
  },
  'countdown-extension': {
    prompt:
      'サイクルのカウントダウンにまだ十分な時間が残っているとき、Novaが一筆を入れました。その一筆は時計に何をしますか？',
    options: {
      a: '保存されたサイクル確定時刻に現在の時間増分を加える。',
      b: `カウントダウンを新たに${protocolFacts.initialCycleFinalizationHoursAtLaunch}時間にリセットする。`,
      c: 'カウントダウンを短くし、サイクルを確定へ押し進める。',
      d: '何もしない。時計を動かすのはETH一筆だけ。',
    },
    explanation: `ETHであれCSTであれ、すべての一筆は保存された確定時刻に現在の時間増分を加えます。時計が固定の期間にリセットされることは決してありません。${protocolFacts.initialCycleFinalizationHoursAtLaunch}時間という数字は、開始時のパラメーターにおける、サイクルの最初の一筆の後の初期カウントダウンにすぎません。`,
    referenceLabel: 'ホワイトペーパー §3.2——カウントダウン',
  },
  'final-gesture-role': {
    prompt: 'カウントダウンがちょうど切れました。最初にサイクルを確定できるのは誰ですか？',
    options: {
      a: '最後に一筆を入れた参加者。',
      b: 'サイクル中に最も多く一筆を入れた参加者。',
      c: 'プロトコルの所有者。',
      d: 'サイクルの最初の一筆を入れた参加者。',
    },
    explanation:
      '確定時刻を過ぎると、最後に一筆を入れた参加者が優先的にサイクルを確定できます。この権利は筆数ではなく、誰が最後に一筆を入れたかで決まります。',
    referenceLabel: 'ホワイトペーパー §3.3——確定',
  },
  'sleepy-beneficiary': {
    prompt:
      'カウントダウンは二日前に切れ、最後の一筆の参加者は沈黙しています。自分のウォレットからfinalizeを呼び出すと、何が起こりますか？',
    options: {
      a: 'サイクルは確定し、自分がその受領者になる。ETHの分も、CSTも、NFTも自分のもの。',
      b: 'トランザクションは取り消される。確定できるのは永遠に最後の一筆の参加者だけ。',
      c: 'サイクルは確定するが、最後の一筆の参加者がすべてを受け取る。',
      d: '宇宙評議会が介入を決めるまで何も起こらない。',
    },
    explanation: `最後の一筆の参加者が権利を独占的に持つのは${protocolFacts.finalGestureExclusivityHours}時間です。その後は公開確定期間が始まります。誰でも確定でき、コントラクトは確定した人を、その役割が携えるすべてとともにサイクルの受領者として扱います。このルールにより、最後の参加者が手続きしなくてもプロトコルを進められます。`,
    funFact:
      'プロトコルの中に、不在の参加者を永遠に待つものはありません。すべての期限は、いずれ最初に呼び出す人に開かれます。',
    referenceLabel: 'ホワイトペーパー §3.3——確定',
  },
  'signature-allocation-share': {
    prompt: '確定時、シグネチャー配分はサイクル準備金のどの割合を携えますか？',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `シグネチャー配分は、確定の瞬間に一度だけ読み取られるプロトコルのETH残高の${protocolFacts.mainEthPercentage}%です。${protocolFacts.compoundingReservePercentage}%という数字は、まったく配られない分——累積準備金として次へ持ち越される分です。`,
    referenceLabel: 'ホワイトペーパー §5.1——確定時の分配',
  },
  'compounding-reserve': {
    prompt: '配分後に残ったサイクル準備金はどうなりますか？',
    options: {
      a: `サイクル準備金の約${protocolFacts.compoundingReservePercentage}%は次のサイクルへ持ち越されます。`,
      b: 'チームが受け取り、次のサイクルの開始前に補充します。',
      c: '次のサイクルで刻印される新しいETHに置き換わります。',
      d: '宇宙評議会が選んだウォレットへ送られます。',
    },
    explanation:
      '五つのETHトラックに準備金の半分が配分され、残りは次のサイクルへ持ち越されます。プロトコルが新しいETHを作るわけではありません。準備金が毎回増えるとは限らず、その規模は参加状況と配分によって変わります。',
    referenceLabel: 'ホワイトペーパー §5.1——確定時の分配',
  },
  'art-engine': {
    prompt: 'Cosmic Signatureのアートワークを実際に生成しているのは何ですか？',
    options: {
      a: 'オンチェーンのデータからシードを得た、重力三体問題の決定論的な物理シミュレーション。',
      b: '宇宙写真で微調整された拡散モデル。',
      c: '各作品を描いてアップロードするアーティスト。',
      d: '宇宙風の配色を持つランダムなピクセル生成器。',
    },
    explanation:
      '同程度の質量を持つ三つの天体がニュートン重力のもとで軌道を描きます。シードが初期条件を決め、残りは物理が行います。どの段階にも生成モデルは関わっていません。学習データも、サンプリングも、プロンプトもありません。すべてのシグネチャーを唯一のものにしているのは、ランダム性ではなくカオス理論です。',
    funFact:
      '三体問題には一般的な閉形式の解がありません。初期条件の知覚できないほどの違いが、まったく異なる舞を生みます。',
    referenceLabel: 'ホワイトペーパー §6——アート',
  },
  'same-seed': {
    prompt:
      'トークン #42のためにオンチェーンに保存されている正確なシードで、オープンソースのアートパイプラインを再実行します。何が出てきますか？',
    options: {
      a: 'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
      b: '小さなランダムな違いを持つ似た画像。',
      c: 'ハードウェアが違えば違う画像。',
      d: '低解像度のプレビューだけ。完全なアートにはプロジェクトのサーバーが必要。',
    },
    explanation:
      'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。 リポジトリには手動で実行する画像の再現性確認があります。現在の継続的インテグレーションは、生成フレームのハッシュを比較していません。',
    referenceLabel: 'ホワイトペーパー §6.2——再現性とライセンス',
  },
  'cst-supply-origin': {
    prompt: 'CSTはどこから来るのですか？',
    options: {
      a: '供給量はゼロから始まり、定められた仕組みに従ってプロトコルのコントラクトだけが刻印します。',
      b: 'ローンチ時にチーム向けの大きな配分が作られた。',
      c: 'ローンチ前に初期のウォレットへ無償で配られた。',
      d: 'トークンコントラクトを呼び出せば誰でもCSTを刻印できる。',
    },
    explanation:
      'CSTの供給量はゼロから始まり、刻印と焼却を指示できるのはプロトコルのコントラクトだけです。参加CST、功労CST、広報準備金への配分など、定められた仕組みに従って新しいCSTが刻印されます。',
    referenceLabel: 'ホワイトペーパー §7——CSTトークン',
  },
  'cst-on-spend': {
    prompt: 'Rioが一筆にひと握りのCSTを使いました。そのCSTはどこへ行きますか？',
    options: {
      a: '焼却される——供給量から永久に除去される。',
      b: 'チームの金庫へ行く。',
      c: 'サイクル準備金に加わり、確定時に再分配される。',
      d: 'サイクルが確定したときにRioへ戻される。',
    },
    explanation:
      '一筆の費用として使われたCSTは全額が焼却され、供給量から除かれます。このCSTが準備金や別のウォレットへ送られることはありません。',
    referenceLabel: 'ホワイトペーパー §7.2——焼却と供給量の動態',
  },
  'public-goods-beneficiary': {
    prompt: '現在の公共財金庫の受け手は誰ですか？',
    options: {
      a: 'Protocol Guild——170人以上のEthereumコア貢献者の資金支援メカニズム。',
      b: 'プロトコルチームの運営ウォレット。',
      c: 'Arbitrumのバリデーター。',
      d: '無作為に選ばれたNFT保有者。',
    },
    explanation: `確定時に、プロトコルはサイクル準備金の${protocolFacts.publicGoodsPercentage}%を公共財金庫へ送ろうとします。その後、誰でも別のトランザクションで残高を現在の受け手であるProtocol Guildへ送れます。所有者は受け手を変更できます。プロトコルから金庫への送付が失敗しても、確定を取り消さずにその分を準備金へ残す場合があります。`,
    referenceLabel: 'ホワイトペーパー §10——公共財',
  },
  'anchoring-basic': {
    prompt:
      'MiraがCosmic Signature NFTをプロトコルに係留しました。係留は彼女に何をもたらしますか？',
    options: {
      a: `係留中、NFTは各サイクルの${protocolFacts.anchorDistributionPercentage}%の係留配分の比例した分け前を積み上げ、係留を解除したときに受け取れる。`,
      b: 'NFTをマーケットプレイスに出品する。',
      c: 'NFTをCSTに変換する。',
      d: '新しいシードでアートワークを再レンダリングする。',
    },
    explanation:
      '係留は、プロトコルにおける長期的な結びつきの形です。係留中のCosmic Signature NFTは係留配分を比例して分け合い、積み上がったETHは解除時に受け取ります。NFTそのものは決して変わりません。そのシードとアートワークは永久です。',
    referenceLabel: 'ホワイトペーパー §8——係留',
  },
  'anchor-once-ever': {
    prompt: 'Miraは係留中のNFTを解除しました。来月、そのNFTをもう一度係留できますか？',
    options: {
      a: 'できない。各NFTを係留できるのは生涯で一度だけ。解除は取り消せない。',
      b: 'できる。短い待機期間の後で。',
      c: 'できる。追加の費用を払えば。',
      d: 'できる。ただし同じサイクルの間だけ。',
    },
    explanation:
      '「一度だけ」のルールは、通常のロックのスケジュールを一回限りの取り消せない選択に置き換え、係留された集合に本物の退出コストを与えます。NFTを係留し続けるかどうかはサイクルごとの生きた判断であり、解除するかどうかは永久の判断です。',
    referenceLabel: 'ホワイトペーパー §8——係留',
  },
  'random-walk-perk': {
    prompt: 'SolはRandom Walk NFTを持っていて、それをETH一筆に添付しました。何が起こりますか？',
    options: {
      a: `その一筆の費用が${protocolFacts.randomWalkDiscountPercentage}%下がる。NFTはSolのウォレットに残るが、生涯で一度きりの「使用済み」の印が付く。`,
      b: '引き下げと引き換えに、NFTはプロトコルへ移転される。',
      c: '一筆が費用なしになる。',
      d: 'NFTが、その一筆が刻印する参加CSTを2倍にする。',
    },
    explanation: `Random Walk NFTを添付すると、1回のETH一筆の費用が${protocolFacts.randomWalkDiscountPercentage}%下がります。NFTは移転されません。コントラクトが単に使用済みの印を付けるだけです。各Random Walk NFTはすべてのサイクルを通じてちょうど一度だけ添付できるので、この引き下げは消費される資源です。`,
    referenceLabel: 'ホワイトペーパー §4.2——Random Walk NFTの添付',
  },
  'first-gesture-currency': {
    prompt: '新しいサイクルがちょうど有効になりました。それを開けるのはどの一筆ですか？',
    options: {
      a: 'ETH一筆。CST一筆は二つ目の一筆から使えるようになる。',
      b: 'CSTはプロトコル独自のトークンなので、CST一筆。',
      c: '最初の一筆にはどちらの通貨でも使える。',
      d: 'サイクルを開けるのはプロトコルの所有者だけ。',
    },
    explanation:
      'すべてのサイクルは、ETH調律期間で価格が決まるETH一筆で開かなければなりません。サイクルが動き始めれば、CSTが二つ目の入り口になります。特権のあるアカウントがサイクルを開けるのではありません。最初の一筆を入れた人が開けるのです。',
    referenceLabel: 'ホワイトペーパー §4.3——CST一筆',
  },
  'message-on-gesture': {
    prompt: '価値のほかに、一筆は何を携えられますか？',
    options: {
      a: `オンチェーンに記録される最大${protocolFacts.gestureMessageMaxLength}バイトのメッセージと、添付されたERC-20トークンまたはERC-721 NFT。`,
      b: '何も。一筆は価値の移転だけ。',
      c: 'コントラクトに保存される画像ファイル。',
      d: 'オフチェーンに保存される無制限のテキスト。',
    },
    explanation: `一筆は、それとともにオンチェーンに記録される最大${protocolFacts.gestureMessageMaxLength}バイトのメッセージを携えることができ、トークンやNFTを添付することもできます。添付されたアセットは配分ウォレットに保管され、確定後にサイクルの受領者がそれらを受け取る優先権を持ちます。`,
    funFact:
      'これまでに一筆に添えられたすべてのメッセージは、Arbitrum上で永久に読めます。サイクルを縫って織り込まれた、公開のゲストブックです。',
    referenceLabel: 'ホワイトペーパー §4.4——メッセージと添付されたアセット',
  },
  'who-runs-cycles': {
    prompt: '各サイクルのETHがどう配られるかを決めるのは誰ですか？',
    options: {
      a: '検証済みのコントラクトに定められた配分ルールが、確定時に実行されます。',
      b: 'チームが各サイクルを審査し、分配に署名する。',
      c: 'オラクルサービスが分割を計算する。',
      d: 'アプリのバックエンドサーバーが送金を発行する。',
    },
    explanation:
      '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
    referenceLabel: 'ホワイトペーパー §1——はじめに',
  },
  'nft-count-typical': {
    prompt: '標準的なサイクルはCosmic Signature NFTをいくつ刻印しますか？',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle}`,
      b: '1',
      c: `${protocolFacts.nftStellarSelectionRecipients}`,
      d: '100',
    },
    explanation: `すべてのトラックがある場合、サイクルはCosmic Signature NFT${protocolFacts.typicalNftsPerCycle}点と固定配分の${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ja')} CSTを刻印します。シグネチャー配分はNFT${protocolFacts.mainPrizeNftsPerCycle}点に対して、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CSTを一度だけ受け取ります。時の戦士、持久チャンピオン、最後のCST一筆には各1点と対応するCSTがあり、二つのNFT星選が残りを加えます。CST一筆や係留中のRandom Walk NFTがなければ該当トラックは省略されます。参加CSTは別です。`,
    referenceLabel: 'ホワイトペーパー §5.1——確定時の分配',
  },
  'chrono-endurance-exist': {
    prompt: '持久チャンピオンと時の戦士のトラックは何を測っていますか？',
    options: {
      a: '時間にわたる持続——誰が最後に、あるいは最も多く一筆を入れたかではない。',
      b: 'サイクル中に最も多くETHを使ったのは誰か。',
      c: '最も多くの一筆を入れたのは誰か。',
      d: 'サイクルが開いたとき最初に一筆を入れたのは誰か。',
    },
    explanation:
      'どちらのトラックも、位置ではなく持続を測ります。持久チャンピオンは最新の一筆の位置を最も長く途切れずに保った参加者で、時の戦士は持久チャンピオンの称号そのものを最も長く保った参加者です。より多く使うことや、より多く一筆を入れることは、どちらも直接には決めません。',
    referenceLabel: 'ホワイトペーパー §5.2——持久チャンピオンと時の戦士',
  },
  'stellar-selection-what': {
    prompt: '星選とは何ですか？',
    options: {
      a: '一筆の時点における、割引も終盤の加算もないETH基本費用をウェイトとして選びます。同じアドレスを複数回選ぶことがあります。',
      b: '参加者を活動量で並べる順位表。',
      c: 'NFTのアートワークに付けられる希少度の階級。',
      d: 'アートの中の星座に名前を付ける仕組み。',
    },
    explanation:
      '参加者向けのETH星選とNFT星選は、どちらも一筆ごとのウェイトを使います。ウェイトは、その時点のETH基本費用からRandom Walk NFTによる割引と終盤の加算を除いた値です。CST一筆にも同時点のETH基本費用を使います。復元を伴う選定なので、同じアドレスが複数回選ばれることがあります。係留NFT星選は、係留中のRandom Walk NFTを別に対象とします。',
    referenceLabel: 'ホワイトペーパー §5.3——星選',
  },
  'ecosystem-optionality': {
    prompt:
      'アプリ、マーケットプレイス、予測の場がすべて一日オフラインになりました。それでもできることは何ですか？',
    options: {
      a: 'すべて。どの仕組みもコントラクトに対して直接実行できる。',
      b: 'アプリが戻るまで何もできない。',
      c: '配分の受け取りだけで、一筆は入れられない。',
      d: 'CSTでの一筆だけで、ETHでは入れられない。',
    },
    explanation:
      'コントラクトを取り巻くエコシステム——アプリ、Axiom Zero、Uniswapの流動性、Chaos Zero——は便宜であって依存ではありません。どれも必須ではなく、一筆、確定、係留、受け取りはすべて、検証済みのコントラクトを直接呼び出すことで動きます。',
    referenceLabel: 'ホワイトペーパー §2——プロトコルの概要',
  },
  'what-it-is-not': {
    prompt: 'ホワイトペーパーがプロトコルの性質を説明する仕方に合う記述はどれですか？',
    options: {
      a: '参加者は参加そのものと価値を交換し、プロトコルはいかなる種類の運営者の取り分も持たない。',
      b: 'CSTを取得することは、他人の努力から金銭的な利得を得る確実な道である。',
      c: '運営者がすべてのサイクルの一定割合を自分のものにする。',
      d: 'プロトコルはNFTの価値が時間とともに上がることを約束する。',
    },
    explanation:
      'すべての配分トラックは、参加者、係留中のNFT、累積準備金、または公共財へ流れます。運営者の取り分はありません。ホワイトペーパーは価格、流動性、将来の価値について何も約束せず、他人の努力から金銭的な利得を期待してCSTやNFTを取得するべきではないとはっきり述べています。',
    referenceLabel: 'ホワイトペーパー §14.1——Cosmic Signatureではないもの',
  },
  'where-recorded': {
    prompt: '一筆、シード、サイクルの歴史は実際にはどこにありますか？',
    options: {
      a: 'オンチェーン、Arbitrum One——Ethereumのレイヤー2ネットワーク——の上。',
      b: 'プロジェクトの非公開データベースの中。',
      c: 'チームがピンしたIPFSファイルの中だけ。',
      d: '記録されていない。合計だけが保たれる。',
    },
    explanation:
      'プロトコルはArbitrum One上で動き、重要な記録——すべての一筆、すべてのシード、すべての配分——はオンチェーンにあります。これが、どのサーバーも信頼せずに、誰でもアートを再現でき、分配を監査できる理由です。',
    referenceLabel: '学ぶ：Arbitrum上のCosmic Signature',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
