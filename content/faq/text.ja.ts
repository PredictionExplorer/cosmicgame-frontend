import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { FAQText } from './structure';

const cst = formatCount(protocolFacts.specialAllocationCst, 'ja');
const outreachCst = formatCount(protocolFacts.outreachReserveCst, 'ja');

/** Japanese FAQ copy, keyed by the skeleton in structure.ts. */
export const faqTextJa = {
  'getting-started': {
    title: 'はじめに',
    description: 'Cosmic Signatureの基本と参加の仕方',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signatureとは何ですか？',
        answer:
          'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。参加者はパフォーマンス・サイクルの間に一筆を入れ、その一つひとつがサイクルの最終シグネチャーを形づくります。サイクルが確定すると、プロトコルは準備金を定められた配分トラックへ配ります。その中には、170人以上のEthereumコア貢献者の資金支援メカニズムであるProtocol Guildも含まれます。',
      },
      'how-does-the-bidding-game-work': {
        question: 'パフォーマンス・サイクルはどのように進みますか？',
        answer:
          'サイクル最初の一筆はETHで入れ、確定時計を始めます。以降の一筆は、時刻を過ぎた後も保存済みの確定時刻に現在の加算時間を足します。現在時刻から時計を再開するわけではありません。確定処理が成功するまでは一筆を入れられます。',
      },
      'what-type-of-gestures-are-available': {
        question: 'どんな種類の一筆がありますか？',
        answer:
          'ETHとCSTの基本費用は別々のルールに従います。開始時のETH費用は調律期間中に下がり、ETH一筆ごとに次の基本費用が上がります。CST費用は保存された下降速度で下がります。確定時刻が近づくと両方に終盤の加算が付きますが、次の基本費用や星選のウェイトは増やしません。サイクル最初の一筆はETHで入れ、確定時計を始めます。以降の一筆は、時刻を過ぎた後も保存済みの確定時刻に現在の加算時間を足します。現在時刻から時計を再開するわけではありません。確定処理が成功するまでは一筆を入れられます。各Random Walk NFTはETH費用の割引に一度だけ使えます。コントラクトは所有権を確認して使用済みと記録し、NFT自体は移しません。係留とは別の権利です。',
      },
      'can-i-participate-without-nfts': {
        question: 'NFTを一つも持っていなくても参加できますか？',
        answer:
          'はい。一筆を入れれば、誰でもCosmic Signatureのパフォーマンス・サイクルに参加できます。未使用のRandom Walk NFTをETH一筆に添付すると、一筆の費用が50%引き下げられます。',
      },
      'how-can-i-get-involved': {
        question: 'どのように参加できますか？',
        answer:
          'パフォーマンス・サイクルの間に一筆を入れることで参加できます。あるいは、自分のプロジェクトのNFTを、参加者の一筆に添付されるものとして提供することもできます。Discordに参加して、他の参加者と交流できます。',
      },
      'how-long-does-each-round-last': {
        question: '各パフォーマンス・サイクルはどれくらい続きますか？',
        answer:
          'サイクル最初の一筆はETHで入れ、確定時計を始めます。以降の一筆は、時刻を過ぎた後も保存済みの確定時刻に現在の加算時間を足します。現在時刻から時計を再開するわけではありません。確定処理が成功するまでは一筆を入れられます。',
      },
      'can-i-place-multiple-gestures': {
        question: '一つのサイクルで複数の一筆を入れられますか？',
        answer:
          'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
      },
    },
  },
  'allocations-and-rewards': {
    title: '配分',
    description: 'サイクルが確定したときに参加者が受け取れるもの',
    items: {
      'what-is-the-main-allocation': {
        question: 'シグネチャー配分とは何ですか？',
        answer: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。`,
      },
      'what-rewards-per-bid': {
        question: '一筆ごとに何を受け取れますか？',
        answer:
          'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
      },
      'how-does-the-stellarSelection-work': {
        question: '星選はどのような仕組みですか？',
        answer:
          '参加者向けのETH星選とNFT星選は、どちらも一筆ごとのウェイトを使います。ウェイトは、その時点のETH基本費用からRandom Walk NFTによる割引と終盤の加算を除いた値です。CST一筆にも同時点のETH基本費用を使います。復元を伴う選定なので、同じアドレスが複数回選ばれることがあります。係留NFT星選は、係留中のRandom Walk NFTを別に対象とします。',
      },
      'how-random-selection-works': {
        question: '無作為な選定はどのように行われますか？',
        answer:
          '参加者向けのETH星選とNFT星選は、どちらも一筆ごとのウェイトを使います。ウェイトは、その時点のETH基本費用からRandom Walk NFTによる割引と終盤の加算を除いた値です。CST一筆にも同時点のETH基本費用を使います。復元を伴う選定なので、同じアドレスが複数回選ばれることがあります。係留NFT星選は、係留中のRandom Walk NFTを別に対象とします。',
      },
      'how-do-i-claim-my-allocation': {
        question: '受領者になったら、配分はどう受け取りますか？',
        answer: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。

確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。

二次ETH配分と添付資産は配分ウォレットから別に受け取ります。現在の期限である${protocolFacts.secondaryRetrievalTimeoutWeeks}週間を過ぎると、未受領の資産を誰でも自分のために受け取れます。期限だけで自動送付されるわけではありません。`,
      },
      'how-does-anchoring-work': {
        question: '係留はどのような仕組みですか？',
        answer: `Cosmic Signature NFTはプロトコルに係留してETHの係留配分を受け取れます。確定したサイクルごとにサイクル準備金の${protocolFacts.anchorDistributionPercentage}%が配分され、係留中のCosmic Signature NFT 1点ごとに等分され、累積したETHは係留を解除したときに支払われます。\n\nRandom Walk NFTも係留できますが、係留NFT星選の対象になるためだけです。選ばれた係留者はETHではなく、CSTとCosmic Signature NFTを受け取ります。\n\n知っておきたい二つのルール：すべてのNFTを係留できるのは生涯で一度だけ（係留を解除すると、そのNFTは二度と係留できません）、そしてサイクルが確定した時点でCosmic Signature NFTが一つも係留されていなければ、そのサイクルの${protocolFacts.anchorDistributionPercentage}%はサイクル準備金に残ります。CST（ERC-20）は係留できません。係留の管理は、アカウントメニューの「自分の係留」ページで行います。`,
      },
      'what-are-marketing-rewards': {
        question: '広報準備金とは何ですか？',
        answer: `プロトコルを広める手助けをすると、CSTトークン（ERC-20）を受け取れます。広報準備金はサイクルごとに${outreachCst} CSTを刻印し、エコシステムの貢献者へ配ります。案内が必要な場合は、Discordで広報の管理者に連絡してください。`,
      },
      'how-many-nfts-minted': {
        question: '各サイクルで刻印されるCosmic Signature NFTはいくつですか？',
        answer: `すべてのトラックがある場合、サイクルは${protocolFacts.typicalNftsPerCycle}枚のCosmic Signature NFTと固定配分の${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ja')} CSTを刻印します。シグネチャー配分はNFT${protocolFacts.mainPrizeNftsPerCycle}点に対して、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CSTを一度だけ受け取ります。時の戦士、持久チャンピオン、最後のCST一筆には各1点と対応するCSTがあり、二つのNFT星選が残りを加えます。CST一筆や係留中のRandom Walk NFTがなければ該当トラックは省略されます。参加CSTは別です。`,
      },
      'what-happens-to-remaining-eth': {
        question: 'サイクル準備金に残ったETHはどうなりますか？',
        answer:
          'ETHのおよそ半分が次のサイクルへ持ち越されます。整数の丸め、省略されたトラック、送付失敗により残高が増える場合があります。次の開始準備金が前より大きくなる保証はありません。',
      },
      'what-happens-to-attached-assets': {
        question: '一筆に添付されたトークンやNFTはどうなりますか？',
        answer: `一筆に添付されたERC-20トークンやERC-721 NFTは配分ウォレットコントラクトがエスクローで保管し、ETHのサイクル準備金には加わりません。確定後、サイクル受領者（通常は最後の一筆の参加者）がそれらを受け取る優先権を持ちます。添付されたアセットが二次的な受け取りタイムアウト（現在の既定は${protocolFacts.secondaryRetrievalTimeoutWeeks}週間）を過ぎても受け取られなければ、コントラクトは誰でもそれらを自分のものとして受け取ることを許します。`,
      },
      'who-receives-10-percent': {
        question: 'サイクル準備金からの公共財配分は誰が受け取りますか？',
        answer: `確定時に、プロトコルはサイクル準備金の${protocolFacts.publicGoodsPercentage}%を公共財金庫へ送ろうとします。その後、誰でも別のトランザクションで残高を現在の受け手であるProtocol Guildへ送れます。所有者は受け手を変更できます。プロトコルから金庫への送付が失敗しても、確定を取り消さずにその分を準備金へ残す場合があります。`,
      },
    },
  },
  'game-mechanics': {
    title: 'サイクルの仕組み',
    description: '一筆のタイミングとプロトコルのルールを深く知る',
    items: {
      'how-does-price-increase': {
        question: '一筆の費用はサイクルの中でどう変わりますか？',
        answer:
          'ETHとCSTの基本費用は別々のルールに従います。開始時のETH費用は調律期間中に下がり、ETH一筆ごとに次の基本費用が上がります。CST費用は保存された下降速度で下がります。確定時刻が近づくと両方に終盤の加算が付きますが、次の基本費用や星選のウェイトは増やしません。',
      },
      'what-is-dutch-auction': {
        question: '調律期間とは何ですか？',
        answer:
          'V3が保存するのはCST費用の下降速度で、期間の長さは速度と上限から求めます。ETH一筆はrate + floor(rate / 100)への増加を試み、CST一筆はrate - floor(rate / 101)へ減少させます。最短期間の条件に反する増加は行いません。CST一筆の後の上限は、加算前のCST基本費用の2倍、設定された最小値、新しい速度と180秒の積のうち最大の値です。次の一筆をすぐに入れることはできます。',
      },
      'how-is-participation-cst-calculated': {
        question: '参加CSTはどのように計算されますか？',
        answer: `参加CSTの最小単位での数量は${protocolFacts.dynamicCstRewardFormula}です。経過時間は秒、サイクルの加算時間はマイクロ秒で扱います。CST数量で表示するには結果を10^18で割ります。

次の一筆が直前の参加者へ全額を刻印します。最初の一筆では発生せず、確定時にも最後の区間は追加精算されません。`,
      },
      'why-minimum-cst-reward-protection': {
        question: '最低参加CST保護とは何ですか？',
        answer:
          '参加CSTの最小値は、次の一筆が直前の参加者へ刻印する数量を制限します。送信者への支払いを保証する値ではありません。両者が同じアドレスなら送信者自身が受け取ります。0はこの制限を無効にし、サイクル最初のETH一筆はこの確認を省略します。最大費用とネットワーク手数料は別の条件です。',
      },
      'how-cst-calibration-window-changes': {
        question: '各一筆はCST調律期間をどう変えますか？',
        answer:
          'V3が保存するのはCST費用の下降速度で、期間の長さは速度と上限から求めます。ETH一筆はrate + floor(rate / 100)への増加を試み、CST一筆はrate - floor(rate / 101)へ減少させます。最短期間の条件に反する増加は行いません。CST一筆の後の上限は、加算前のCST基本費用の2倍、設定された最小値、新しい速度と180秒の積のうち最大の値です。次の一筆をすぐに入れることはできます。',
      },
      'what-is-open-finalization-window': {
        question: '公開確定期間とは何ですか？',
        answer: `確定処理を成功させたアドレスが、サイクル準備金の${protocolFacts.mainEthPercentage}%、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CST、連続したIDのCosmic Signature NFT${protocolFacts.mainPrizeNftsPerCycle}点を受け取ります。確定時刻後の最初の${protocolFacts.finalGestureExclusivityHours}時間は最後の一筆の参加者だけが実行でき、その後は誰でも実行して自分で受け取れます。`,
      },
      'what-is-endurance-champion': {
        question: '持久チャンピオンとは何ですか？',
        answer:
          'サイクルの中で、最新の一筆を入れた参加者として、次の一筆が入るまで最も長く先頭を保持した参加者です。サイクルが確定すると、持久チャンピオンは1,000 CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。',
      },
      'what-is-final-cst-gesture': {
        question: '最後のCST一筆とは何ですか？',
        answer:
          '最後のCST一筆とは、サイクル中にCSTトークンで入れられた最後の一筆です。サイクルが確定すると、それを入れた参加者は1,000 CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。',
      },
      'what-is-chrono-warrior': {
        question: '時の戦士とは何ですか？',
        answer: `持久チャンピオンの称号を最も長く連続して保持した参加者です。持久チャンピオンが一筆を入れた後の先頭保持時間で決まるのに対し、時の戦士はその称号の保持時間で決まります。サイクルが確定すると、時の戦士はサイクル準備金の${protocolFacts.chronoWarriorEthPercentage}%のETH、${cst} CST、Cosmic Signature NFT 1点を受け取ります。`,
      },
      'does-time-per-bid-stay-same': {
        question: '一筆ごとに加わる時間は常に同じですか？',
        answer: `いいえ。各一筆の後に加わる時間は、開始時にはちょうど一時間でしたが、サイクルが確定するごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなります。増分が大きくなると各サイクルも長く続くので、暦の上での成長は自然に緩やかになります。`,
      },
      'why-time-per-bid-increases': {
        question: '一筆ごとに加わる時間はなぜ増えていくのですか？',
        answer:
          'この仕組みは、Cosmic Signature NFTが刻印される長期的なペースを決めます。サイクルが長くなるほど、同じ期間に刻印される新しいNFTは少なくなります。',
      },
      'how-time-increase-affects-game': {
        question: '一筆ごとの時間の増加はプロトコルにどう影響しますか？',
        answer:
          '加算時間が増えると確定頻度に影響しますが、NFT供給の固定上限や一定期間の新作数を保証するものではありません。',
      },
      'what-if-two-gestures-same-time': {
        question: '二つの一筆が同時に送信されたらどうなりますか？',
        answer:
          'Arbitrumのトランザクションは、シーケンサーが取り込んだ順に処理されます。後の一筆は、先の一筆が反映された状態で実行されます。費用の上限と最低参加CSTの条件を満たせば、後の一筆も成立します。条件を満たさなければ取り消されるため、プレビューを更新してから再度お試しください。',
      },
      'is-there-game-theory': {
        question: 'Cosmic Signatureに戦略的な要素はありますか？',
        answer:
          'はい。参加者のタイミング、一筆の頻度、方法（ETHか、CSTか、Random Walkの添付か）のすべてが、配分がどう配られるかを形づくります。社会的な力学とプロトコルの設計は、異なる配分トラックで複数の戦略が成り立つように作られています。',
      },
    },
  },
  'tokens-and-nfts': {
    title: 'トークンとCosmic Signature',
    description: 'CST、オンチェーンアート、デジタルアセット',
    items: {
      'what-are-cst-and-dao': {
        question: 'CSTトークンと宇宙評議会とは何ですか？',
        answer:
          'CSTは一筆に使えるほか、委任後は宇宙評議会の調整ウェイトになります。評議会が扱えるのは実際に持つ資産と権限だけです。現在は主要プロトコルの所有者ではなく、移管や放棄には別のオンチェーン操作が必要です。',
      },
      'what-can-i-do-with-cst': {
        question: 'CSTトークンで何ができますか？',
        answer:
          'CSTトークンはCST調律期間を通じて、一筆のETHの代わりとして使えます。一筆に使われたCSTはプールされるのではなく焼却（供給量から永久に除去）されます。一筆は参加CSTを刻印することもありますが、その量は動的で、前の一筆からどれだけ時間が経ったかに依存します。CSTは委任すると（自分への委任も可能です）、宇宙評議会で調整ウェイトも表します。',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFTの何がユニークなのですか？',
        answer:
          'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
      },
      'how-are-nft-images-created': {
        question: 'NFTの画像はどのように作られますか？',
        answer:
          '各Cosmic Signature NFTは、ニュートン重力における三体問題を可視化したものです。パイプラインは重力のもとで三つの天体をシミュレーションし、380〜700ナノメートルにわたる64の波長ビンでその軌跡をスペクトルレンダリングして、NFTごとに唯一のカオスな模様を生み出します。',
      },
      'significance-of-random-seed': {
        question: 'なぜ各NFTはオンチェーンのシードから生成されるのですか？',
        answer:
          'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFTの数には上限がありますか？',
        answer:
          '加算時間が増えると確定頻度に影響しますが、NFT供給の固定上限や一定期間の新作数を保証するものではありません。',
      },
      'impact-of-limiting-nfts': {
        question: 'サイクルの長さは、新しく刻印されるNFTの数にどう影響しますか？',
        answer:
          '加算時間が増えると確定頻度に影響しますが、NFT供給の固定上限や一定期間の新作数を保証するものではありません。',
      },
      'connection-with-randomwalknft': {
        question: 'Random Walk NFTとの関係は何ですか？',
        answer:
          'Random Walk NFTの保有者は、未使用のトークンを1回のETH一筆に添付して、ETH一筆の費用を50%引き下げられます。Random Walk NFTの係留者は、サイクルごとに係留NFT星選の対象にもなります。',
      },
      'how-to-trade-nfts-tokens': {
        question: 'Cosmic Signature NFTやCSTを取引したり売ったりするには？',
        answer:
          'Cosmic Signature NFTは、Cosmic SignatureとRandom Walk NFTのために作られた手数料ゼロのNFTマーケットプレイスAxiom Zero（axiomzero.market）で、CSTはArbitrum上のUniswapで取引されています。どちらも標準的なERC-721とERC-20のアセットなので、OpenSeaを含め、それらの規格に対応した他のArbitrumのマーケットプレイスや取引所でも扱えます。',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: 'Cosmic Signature NFTはどこで売買できますか？',
        answer:
          '主な場はAxiom Zero（https://www.axiomzero.market/cosmic-signature）です。公正なローンチのジェネラティブアートのために作られた、Arbitrum上の手数料ゼロのNFTマーケットプレイスです。出品と売却はオンチェーンで直接決済され、売り手は売却額の全額を受け取り、すべてのトークンページには係留コントラクトからライブで読み取ったNFTの係留状態が表示されます。一度も係留されていないトークンは、次の所有者のために一度だけの係留の選択肢を残しています。',
      },
      'cosmic-signature-prediction-market': {
        question: 'Cosmic Signatureの予測市場はありますか？',
        answer:
          'はい。Chaos Zero（https://chaoszero.com）はCosmic Signatureのために作られた予測市場です。パフォーマンス・サイクルごとに一つの問いを開きます：このサイクルは前のサイクルより多い筆数で確定するか？ ポジションはCST建てで、構造上完全に担保されており、市場は所有者や管理者の鍵なしに、公開のオンチェーンの筆数から決着します。',
      },
      'participate-dao-without-bidding': {
        question: '一筆を入れずに宇宙評議会に参加できますか？',
        answer:
          'はい。対応する取引所でCSTを取得し、委任した後（自分または別のアドレスへ）、宇宙評議会で調整ウェイトを表すために使えます。新しいCSTを刻印する主な方法は、引き続き一筆を入れることです。',
      },
      'donate-nfts-to-game': {
        question: '他のNFTプロジェクトは、どうすれば自分たちのトークンをサイクルに提供できますか？',
        answer:
          'プロジェクトは「詳細設定」パネルを使って、自分たちのトークン（ERC-721またはERC-20）を一筆に添付できます。コントラクトアドレスと、トークンIDまたは数量を入力して一筆を送信します。添付されたトークンは配分ウォレットのエスクローに保管され、確定後にシグネチャー配分の受領者へ流れます。',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrumと技術',
    description: 'ネットワークの設定、ウォレット、技術的な詳細',
    items: {
      'what-is-arbitrum': {
        question:
          'Arbitrumとは何ですか？なぜCosmic SignatureはArbitrumにデプロイされているのですか？',
        answer:
          'ArbitrumはEthereumを基盤とするレイヤー2ロールアップです。処理費用を抑え、トランザクションを効率よく処理できる設計が、一筆を重ねるCosmic Signatureの仕組みに適しています。ガス代はネットワークの混雑状況や操作内容によって変わります。',
      },
      'why-arbitrum-not-ethereum': {
        question: 'なぜEthereumメインネットではなくArbitrumなのですか？',
        answer:
          'オンチェーンの活動の多くはレイヤー2へ移りつつあります。ArbitrumはEthereumレイヤー1と同じセキュリティモデルを保ちながら、劇的に低いガス代を提供します。Cosmic Signatureのように一筆の多いプロトコルには、ふさわしい住まいです。',
      },
      'arbitrum-security': {
        question: 'ArbitrumはなぜEthereumレイヤー1と同じくらい安全なのですか？',
        answer:
          'Arbitrumはサイドチェーンではなくロールアップです。トランザクションのすべてのバッチはEthereumメインネットに書き戻されます。これによりArbitrumのセキュリティはEthereum自身に根ざします。データと紛争の解決はレイヤー1にあります。',
      },
      'how-to-get-eth-on-arbitrum': {
        question: 'Arbitrum上のETHはどうやって入手しますか？',
        answer:
          '公式のArbitrumブリッジや、その他の対応ブリッジを使ってEthereumメインネットからETHをブリッジします。ETHはEthereum上でロックされ、同額がArbitrum上で使えるようになります。ブリッジにはEthereumレイヤー1のガス代の支払いが必要です。',
      },
      'existing-wallet-on-arbitrum': {
        question: '今使っているEthereumウォレットをArbitrumでも使えますか？',
        answer:
          'はい。同じ秘密鍵が両方のネットワークでトランザクションに署名します。ウォレットのネットワーク一覧にArbitrumネットワークを追加するだけです。',
      },
      'view-tokens-on-arbitrum': {
        question: 'Arbitrum上のCSTトークンとCosmic Signature NFTはどう確認しますか？',
        answer:
          'Cosmic Signatureのウェブサイトで直接確認するか、コントラクトアドレスを手動でウォレットに追加してください。コントラクトアドレスはコントラクトページとコミュニティのDiscordで公開しています。',
      },
      'trade-on-arbitrum': {
        question: 'Arbitrum上でCosmic Signature NFTとCSTを取引できますか？',
        answer:
          'はい。Cosmic Signature NFTはコレクションのための手数料ゼロのマーケットプレイスAxiom Zeroで、CSTはUniswapで取引されています。どちらもArbitrum上の標準的なERC-721とERC-20のアセットなので、それらの規格に対応したマーケットプレイスや取引所であれば扱えます。取引の前には必ずコントラクトアドレスを確認してください。',
      },
      'verify-bid-success': {
        question: '一筆が正しく送信されたことはどう確認できますか？',
        answer:
          '成功した一筆はArbitrumで確認され、Arbitrumのブロックエクスプローラー（Arbiscan）で見られます。トランザクションハッシュをエクスプローラーに貼り付けると、一筆を検証できます。',
      },
      'game-security': {
        question: 'プロトコルのセキュリティはどう確保されていますか？',
        answer:
          '公開監査は、確認された過去のコントラクト版を対象としています。その後のV2やV3の全変更を独立に監査したことにはなりません。公開ソースとデプロイ済みコードの一致確認も、安全性評価とは別です。 現在のプロトコル実装はV3です。実装アドレスはプロキシのEIP-1967スロットと照合してください。V3の公開ソース検証はまだ確認されておらず、過去のV2の検証は新しい実装には適用されません。',
      },
      'fees-involved': {
        question: '手数料はかかりますか？',
        answer:
          '一筆の費用そのものに加えて、トランザクションごとにArbitrumネットワークのガス代を支払います。ガス代はネットワークの状況によって変動し、Cosmic Signatureが管理するものではありません。',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signatureは生物学のCOSMICデータベースと関係がありますか？',
        answer:
          'いいえ。Cosmic Signatureは、生物学におけるCOSMICがん変異データベースやCOSMIC変異シグネチャーとは関係がありません。決定論的な三体NFTアートに焦点を当てたオンチェーンアートのプロトコルとアプリです。',
      },
    },
  },
  'trust-and-governance': {
    title: '信頼と調整',
    description: '透明性、チームの権限、オープンソースの構想',
    items: {
      'team-controls': {
        question: 'チームはプロトコルに対してどんな権限を持っていますか？',
        answer:
          '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。\n\n主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。\n\nV3は宇宙評議会への移管や権限放棄を自動実行しません。',
      },
      'will-team-always-have-control': {
        question: 'チームは常にプロトコルのパラメーターを管理し続けるのですか？',
        answer:
          '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
      },
      'what-is-renounce-ownership': {
        question: '「所有権の放棄」とはどういう意味ですか？',
        answer:
          '所有者は、コントラクトの条件に従ってパラメーターと実装を変更する権限を保持します。主要な変更はサイクル非稼働時に制限されますが、開始時刻、次の待機時間、周辺コントラクトには別の権限があります。V3は宇宙評議会への移管や権限放棄を自動実行しません。',
      },
      'why-renounce-ownership': {
        question: 'チームはなぜ所有権を放棄するのですか？',
        answer:
          '目指すのは公正で分散化されたプロトコルです。所有権を放棄することで、稼働後にプロトコルのルールが恣意的に変更されないことが保証され、参加者にとっての信頼と予測可能性が高まります。',
      },
      'how-team-profits': {
        question: 'Cosmic Signatureのチームはプロトコルからどのように価値を受け取るのですか？',
        answer:
          '参加者の一筆からETHを受け取るチームのウォレットは存在しません。すべてのETHはサイクル準備金へ流れ、配分トラックに従って配られます。チームとプロトコルの結びつきは、Random Walk NFTを通じて間接的に保たれています。プロトコルの成功は、それらのNFTの文化的な価値を高めるかもしれません。主な動機は好奇心、創造性、そしてオープンソースの公共財への貢献です。',
      },
      'why-was-cs-created': {
        question: 'Cosmic Signatureはなぜ作られたのですか？',
        answer:
          'Cosmic Signatureは、カオス理論と三体問題の複雑さへの関心から生まれました。オンチェーンのシードから生成される唯一で決定論的なアートという発想は、興味をそそると同時に、公共財を志向するプロトコルにふさわしいものでした。',
      },
      'what-if-team-disappears': {
        question: 'チームがいなくなったらどうなりますか？',
        answer:
          'プロトコルは自立するように設計されています。シードはオンチェーンに保存され、誰でもオープンソースのRustパイプラインを使ってNFTの画像と動画を再生成できます。これにより、チームの状況にかかわらず、すべてのCosmic Signature NFTが引き続き利用できることが保証されます。',
      },
      'can-create-competing-site': {
        question: 'これをフォークして自分のサイトを作ってもいいですか？',
        answer:
          'もちろんです。プロジェクト所有のコントラクト、シェーダー、レンダラー、ページ、ドキュメントはCC0 1.0で提供され、権利は一切留保しません。第三者の依存関係、フォント、アセットはそれぞれのライセンスを保持します。THIRD_PARTY_NOTICES.mdをご覧ください。',
      },
      'donate-to-pot': {
        question: '一筆を入れずにサイクル準備金へETHを拠出できますか？',
        answer:
          'はい。プロトコルのコントラクトは、一筆とは独立にETHを受け付ける専用の拠出関数を公開しており、サイクルの拠出一覧に表示されるメモを添えることもできます。単純なウォレット送金ではなく、アプリの拠出フローを使ってください。プロトコルのアドレスへ直接送られたETHは、拠出ではなくETH一筆として処理されます。詳しくはDiscordでお問い合わせください。',
      },
      'get-help': {
        question: '質問があるとき、どこで助けを得られますか？',
        answer:
          'Discord、X（Twitter）、サポートメールで問い合わせできます。公式リンクとメールアドレスは「Cosmic Signatureについて」ページで確認してください。',
      },
      'stay-updated': {
        question: 'Cosmic Signatureの最新情報はどう追えますか？',
        answer:
          '公式のソーシャルメディアチャンネルをフォローし、Discordコミュニティに参加すると、最新の発表、プロトコル調整提案、サイクルの振り返りを受け取れます。',
      },
    },
  },
} satisfies FAQText;
