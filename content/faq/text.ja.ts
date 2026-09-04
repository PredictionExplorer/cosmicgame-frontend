import { protocolFacts } from '@/content/protocol-facts';

import type { FAQText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString();

const ELAPSED_JA: Record<
  (typeof protocolFacts.dynamicCstRewardExamples)[number]['elapsed'],
  string
> = {
  '0 seconds': '0秒',
  '1 second': '1秒',
  '60 seconds': '60秒',
  '1 hour': '1時間',
  '1 day': '1日',
};

/** Japanese FAQ copy, keyed by the skeleton in structure.ts. */
export const faqTextJa = {
  'getting-started': {
    title: 'はじめに',
    description: 'Cosmic Signatureの基本と参加の仕方',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signatureとは何ですか？',
        answer:
          'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。参加者はパフォーマンス・サイクルの間に一筆を入れ、その一つひとつがサイクルの最終シグネチャーを形づくります。サイクルが確定すると、プロトコルは準備金を10を超える配分トラックへ配ります。その中には、170人以上のEthereumコア貢献者の資金支援メカニズムであるProtocol Guildも含まれます。',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signatureは生物学のCOSMICデータベースと関係がありますか？',
        answer:
          'いいえ。Cosmic Signatureは、生物学におけるCOSMICがん変異データベースやCOSMIC変異シグネチャーとは関係がありません。決定論的な三体NFTアートに焦点を当てたオンチェーンアートのプロトコルとアプリです。',
      },
      'how-does-the-bidding-game-work': {
        question: 'パフォーマンス・サイクルはどのように進みますか？',
        answer: `各サイクルは、最初の一筆のためのETH調律期間で始まります。その最初の一筆がサイクル確定時刻を動かします。現在の既定はおよそ24時間です。その後のETHまたはCSTの一筆は、保存された確定時刻に現在の時間増分を加えます。増分はちょうど一時間から始まり、確定したサイクルごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなります。サイクル確定時刻を過ぎると、最後の一筆を入れた参加者には、サイクルを確定してシグネチャー配分を受け取るための${protocolFacts.finalGestureExclusivityHours}時間の優先期間があります。サイクルが実際に確定するまで、一筆は引き続き入れられます。`,
      },
      'what-type-of-gestures-are-available': {
        question: 'どんな種類の一筆がありますか？',
        answer:
          '一筆はETHまたはCSTトークン（ERC-20）で入れられます。各サイクルの最初の一筆はETH一筆でなければなりません。その後はETH一筆とCST一筆を自由に混ぜられます。Random Walk NFTをETH一筆に添付すると、ETH一筆の費用が50%引き下げられます。Cosmic Signature NFT（ERC-721）は配分と係留のためのアセットで、一筆の支払いには使えません。CST一筆には固有の調律期間があります。期間が進む間にCST一筆の費用は下がり、期間の長さ自体もETHまたはCSTの一筆ごとに変わります。',
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
        answer: `各サイクルは最初のETH一筆が入れられたときに始まり、その時点でサイクル確定時刻は現在の時間増分のおよそ24倍（開始時はおよそ一日）に設定されます。その後の一筆はそれぞれ現在の時間増分を加えます。増分はちょうど一時間から始まり、確定したサイクルごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなります。確定の前に一筆が届き続ければ、サイクルは一日よりずっと長く続くこともあります。`,
      },
      'can-i-place-multiple-gestures': {
        question: '一つのサイクルで複数の一筆を入れられますか？',
        answer:
          'はい。各一筆はウォレットに参加CSTを刻印することがあり、星選の対象件数を増やし、変化し続けるサイクルのシグネチャーを形づくります。参加CSTの量は動的で、前の一筆からどれだけ時間が経ったかに依存します。静かな時間が長いほど、続けざまの一筆より大きなCSTの刻印になります。',
      },
    },
  },
  'allocations-and-rewards': {
    title: '配分',
    description: 'サイクルが確定したときに参加者が受け取れるもの',
    items: {
      'what-is-the-main-allocation': {
        question: 'シグネチャー配分とは何ですか？',
        answer:
          'シグネチャー配分は、サイクルで最後の一筆を入れた参加者が受け取ります。Cosmic Signature NFT 1点、1,000 CSTの功労CST、サイクル準備金の25%のETH、そしてサイクル中に参加者の一筆に添付されたトークンやNFTが含まれます。',
      },
      'what-rewards-per-bid': {
        question: '一筆ごとに何を受け取れますか？',
        answer: `すべての一筆は、サイクル終了時の星選の対象を1件記録し、持久チャンピオンと時の戦士のトラックに向けた持久の期間への寄与を更新し、参加CSTを刻印することがあります。参加CSTは平方根の式で計算されます：${protocolFacts.dynamicCstRewardFormula}。平たく言えば、量は前の一筆からの時間とともに増えますが、増え方は緩やかになっていきます。ごく短い間隔の一筆は0 CSTになることがあり、間隔が長ければずっと大きなCSTの刻印になります。`,
      },
      'how-does-the-stellarSelection-work': {
        question: '星選はどのような仕組みですか？',
        answer: `一筆ごとに星選の対象が1件記録されます。各サイクルの終わりに、スマートコントラクトがプールから無作為に対象を選びます。${protocolFacts.ethStellarSelectionRecipients}件の選定がサイクル準備金の${protocolFacts.stellarSelectionEthPercentage}%をETHで分け合い、${protocolFacts.nftStellarSelectionRecipients}件の選定がそれぞれ${cst} CSTとCosmic Signature NFTを受け取り、係留中のRandom Walk NFTの中からの${protocolFacts.anchoredRwlkNftSelectionRecipients}件の選定も${cst} CSTとCosmic Signature NFTを受け取ります。選定は復元抽出で行われるため、同じアドレスが一つのサイクルで複数回選ばれることもあります。選ばれる頻度は入れた一筆の数に応じて高まります。`,
      },
      'how-random-selection-works': {
        question: '無作為な選定はどのように行われますか？',
        answer:
          '星選は、サイクル確定時のオンチェーンの乱数源——Arbitrumが提供するブロックの文脈と予備のエントロピー源——を使います。参加者の星選は対象件数で重み付けされます。一筆ごとに対象が1件加わるので、一筆が多いほど選ばれる頻度が高まります。係留NFT星選は別のもので、参加者の一筆による対象プールではなく、係留中のRandom Walk NFTの対象資格に基づきます。',
      },
      'how-do-i-claim-my-allocation': {
        question: '受領者になったら、配分はどう受け取りますか？',
        answer: `受領者はアプリとプロトコルのコントラクトを通じて配分を受け取ります。最後の一筆の参加者には、サイクル確定時刻の後、サイクルを確定してシグネチャー配分を受け取るための${protocolFacts.finalGestureExclusivityHours}時間の優先時間があります。その後は公開確定期間が始まります。誰でもサイクルを確定でき、スマートコントラクトは確定した人をサイクル受領者として扱います。確定実行者がシグネチャー配分全体（ETHの分、${cst} CSTの刻印、Cosmic Signature NFT、添付されたアセットへの優先権）を受け取ります。二次的なETHや、添付されたトークン・NFTの配分は配分ウォレットのエスクローに置かれ、既定で${protocolFacts.secondaryRetrievalTimeoutWeeks}週間の別の受け取りタイムアウトがあります。それが切れると、コントラクトは未受け取りの配分を誰でも自分のものとして受け取ることを許します。早めに受け取ってください。`,
      },
      'how-does-anchoring-work': {
        question: '係留はどのような仕組みですか？',
        answer: `Cosmic Signature NFTはプロトコルに係留してETHの係留配分を受け取れます。確定したサイクルごとにサイクル準備金の${protocolFacts.anchorDistributionPercentage}%が配分され、係留中のCosmic Signature NFT 1点ごとに等分され、累積したETHは係留を解除したときに支払われます。Random Walk NFTも係留できますが、係留NFT星選の対象になるためだけです。選ばれた係留者はETHではなく、CSTとCosmic Signature NFTを受け取ります。知っておきたい二つのルール：すべてのNFTを係留できるのは生涯で一度だけ（係留を解除すると、そのNFTは二度と係留できません）、そしてサイクルが確定した時点でCosmic Signature NFTが一つも係留されていなければ、そのサイクルの${protocolFacts.anchorDistributionPercentage}%はサイクル準備金に残ります。CST（ERC-20）は係留できません。係留の管理は、アカウントメニューの「自分の係留」ページで行います。`,
      },
      'what-are-marketing-rewards': {
        question: '広報準備金とは何ですか？',
        answer: `プロトコルを広める手助けをすると、CSTトークン（ERC-20）を受け取れます。広報準備金はサイクルごとに${protocolFacts.outreachReserveCst.toLocaleString()} CSTを刻印し、エコシステムの貢献者へ配ります。案内が必要な場合は、Discordで広報の管理者に連絡してください。`,
      },
      'how-many-nfts-minted': {
        question: '各サイクルで刻印されるCosmic Signature NFTはいくつですか？',
        answer: `大多数のサイクルでは${protocolFacts.typicalNftsPerCycle}点のCosmic Signature NFTが刻印されます。シグネチャー配分の受領者に1点、最後のCST一筆の受領者に1点、持久チャンピオンに1点、時の戦士に1点、NFT星選の受領者に${protocolFacts.nftStellarSelectionRecipients}点、そして係留NFT星選で選ばれたRandom Walk NFT係留者に${protocolFacts.anchoredRwlkNftSelectionRecipients}点です。これら${protocolFacts.typicalNftsPerCycle}件のNFT配分にはそれぞれ${cst} CSTも含まれます。サイクルにCST一筆がなかったり、係留中のRandom Walk NFTがなかったりすると、そのサイクルでは該当する刻印は行われません。`,
      },
      'what-happens-to-remaining-eth': {
        question: 'サイクル準備金に残ったETHはどうなりますか？',
        answer:
          'サイクル準備金のおよそ半分は、累積準備金として次のパフォーマンス・サイクルへ持ち越され、次のサイクルの開始残高を増やします。プロトコルは引き出すのではなく、蓄えていきます。',
      },
      'what-happens-to-attached-assets': {
        question: '一筆に添付されたトークンやNFTはどうなりますか？',
        answer: `一筆に添付されたERC-20トークンやERC-721 NFTは配分ウォレットコントラクトがエスクローで保管し、ETHのサイクル準備金には加わりません。確定後、サイクル受領者（通常は最後の一筆の参加者）がそれらを受け取る優先権を持ちます。添付されたアセットが二次的な受け取りタイムアウト（現在の既定は${protocolFacts.secondaryRetrievalTimeoutWeeks}週間）を過ぎても受け取られなければ、コントラクトは誰でもそれらを自分のものとして受け取ることを許します。`,
      },
      'who-receives-10-percent': {
        question: 'サイクル準備金からの公共財配分は誰が受け取りますか？',
        answer:
          'サイクル準備金の7%は確定時に公共財金庫へ送られ、その後は誰でも金庫の残高を設定済みの公共財の受け手へ送ることができます。現在の受け手はProtocol Guild——170人以上のEthereumコア貢献者の共同資金支援メカニズムです。現在、受け手のアドレスはプロトコルの所有者が設定していますが、所有権が評議会の管理下に移った後は、宇宙評議会がそれを決める構想です。',
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
          'ETHとCSTの一筆の費用は、オンチェーンで別々の道筋をたどります。ETH一筆の費用はETH調律期間を使い、その後はETH一筆ごとに段階的に上がります。CST一筆の費用は現在のCST調律期間を通じて下がります。このCSTの期間は固定ではありません。ETH一筆はわずかに短くし、CST一筆はわずかに長くするので、費用の道筋はETHとCSTの参加のバランスに反応します。',
      },
      'what-is-dutch-auction': {
        question: '調律期間とは何ですか？',
        answer: `調律期間とは、一筆の費用が調律上限から既知の長さの間に線形に下がっていく、費用決定の期間です。ETH一筆とCST一筆は、下限の異なる別々の期間を使います。ETH一筆の費用は上限の約1/${protocolFacts.ethCalibrationFloorDivisor}の下限まで下がり、CST一筆の費用は${protocolFacts.cstCalibrationFloorCst}まで下がりきります。期間が完全に経過すれば、費用なしのCST一筆も可能です。CST調律期間は現在${protocolFacts.initialCstCalibrationWindowHours}時間の基準から始まりますが、オンチェーンに保存され、一筆ごとに変わります。CST一筆はそれぞれ期間を約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%増やし、ETH一筆はそれぞれ約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%減らします。`,
      },
      'how-is-participation-cst-calculated': {
        question: '参加CSTはどのように計算されますか？',
        answer: `参加CSTは、前の一筆からの経過時間に基づく平方根の式を使います：${protocolFacts.dynamicCstRewardFormula}。平方根を使うため、前の一筆から時間が空くほど数量は増えますが、増加のペースは次第に緩やかになります。開始時のパラメーター（時間増分がちょうど一時間）では、例はおよそ${protocolFacts.dynamicCstRewardExamples.map((example) => `${ELAPSED_JA[example.elapsed]}後に${example.cst} CST`).join('、')}です。増分は確定したサイクルごとに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなるので、実際の量は時間とともにこれらよりわずかに下へずれていきます。一筆が届いた瞬間の正確な量は、アプリのライブプレビューとコントラクトが基準です。`,
      },
      'why-minimum-cst-reward-protection': {
        question: '最低参加CST保護とは何ですか？',
        answer:
          '一筆を送信する前に、アプリは見込みの参加CSTの量をプレビューし、受け入れてもよい最小のCST量を送ります。別の一筆が先に届くと、見込みの量が変わることがあります。最低参加CST保護は、結果として刻印されるCSTが選んだ最小値を下回る場合にトランザクションを止めることができます。費用の確認が通れば一筆を進めたい場合は、0 CSTを含むどの量でも受け入れることも選べます。',
      },
      'how-cst-calibration-window-changes': {
        question: '各一筆はCST調律期間をどう変えますか？',
        answer: `ETHまたはCSTの一筆はすべて、保存されたCST調律期間を更新します。CST一筆は期間を長さ / ${protocolFacts.cstCalibrationWindowChangeDivisor}だけ長くします。整数への切り捨て前でおよそ+${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%です。ETH一筆はおよそ長さ / ${protocolFacts.cstCalibrationWindowChangeDivisor + 1}だけ短くします。約-${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%です。期間が短いほどCST一筆の費用は速く下がり、長いほど緩やかに下がります。`,
      },
      'what-is-open-finalization-window': {
        question: '公開確定期間とは何ですか？',
        answer: `サイクル確定時刻を過ぎると、最後の一筆の参加者にはサイクルを確定するための${protocolFacts.finalGestureExclusivityHours}時間の優先時間があります。その優先期間の間に確定しなければ、誰でも確定のトランザクションを呼び出せます。そしてスマートコントラクトは、確定した人をサイクル受領者にします。確定実行者はシグネチャー配分の全体（ETHの分、${cst} CST、Cosmic Signature NFT、添付されたアセットへの優先権）を受け取るので、最後の一筆の参加者は期間が終わる前に確定するべきです。公開確定は、最後の一筆の参加者がいなくなってもプロトコルが止まらないようにします。`,
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
          'この仕組みは、Cosmic Signature NFTが刻印される長期的な速度を抑えます。サイクルが遅くなるほど、単位時間あたりに流通に入る新しいNFTは少なくなり、希少性が保たれます。',
      },
      'how-time-increase-affects-game': {
        question: '一筆ごとの時間の増加はプロトコルにどう影響しますか？',
        answer:
          '一筆ごとに加わる時間が増えるにつれて、サイクルは平均して長く続くようになります。変化は緩やかで、滑らかな参加体験を保ちながら、長い時間軸でのCosmic Signature NFTの総供給量を抑えます。',
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
          'すべての一筆はCSTトークンを刻印することがあり、CSTは宇宙評議会で調整ウェイトを表します。評議会はプロトコルをオンチェーンで調整します。CST保有者は調整提案を提出し、支持または反対を表明します（CSTを自分または別のアドレスへ委任すると、そのウェイトが有効になります）。評議会は、コントラクトの所有権が評議会の管理下に移った後、7%の配分を受け取る公共財の受け手を含むプロトコルのパラメーターを決めるよう設計されています。現在、それらの設定はまだプロトコルの所有者が管理しています。',
      },
      'what-can-i-do-with-cst': {
        question: 'CSTトークンで何ができますか？',
        answer:
          'CSTトークンはCST調律期間を通じて、一筆のETHの代わりとして使えます。一筆に使われたCSTはプールされるのではなく焼却（供給量から永久に除去）されます。一筆は参加CSTを刻印することもありますが、その量は動的で、前の一筆からどれだけ時間が経ったかに依存します。CSTは委任すると（自分への委任も可能です）、宇宙評議会で調整ウェイトも表します。',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFTの何がユニークなのですか？',
        answer:
          'Cosmic Signature NFTはオンチェーンで自立しています。各NFTは、スマートコントラクトに保存された無作為に生成されたシードとともに刻印されます。画像と動画は、オープンソースのRustパイプラインを使ってこのシードからレンダリングされます。シードが三つの天体の初期条件を決め、NFTごとに唯一のカオスな軌跡を生み出します。',
      },
      'how-are-nft-images-created': {
        question: 'NFTの画像はどのように作られますか？',
        answer:
          '各Cosmic Signature NFTは、ニュートン重力における三体問題を可視化したものです。パイプラインは重力のもとで三つの天体をシミュレーションし、380〜700ナノメートルにわたる64の波長ビンでその軌跡をスペクトルレンダリングして、NFTごとに唯一のカオスな模様を生み出します。',
      },
      'significance-of-random-seed': {
        question: 'なぜ各NFTはオンチェーンのシードから生成されるのですか？',
        answer:
          'シードに基づくパイプラインは、長期的な再現性を保証します。画像を中央のサーバーに頼るNFTプロジェクトとは異なり、すべてのCosmic Signature NFTのシードはArbitrumに保存されています。誰でもいつでも、オープンソースのRustパイプラインを使ってNFTの画像と動画を独立に再生成できます。元とピクセル単位で同一です。',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFTの数には上限がありますか？',
        answer: `コントラクトに固定の供給上限はありません。一筆ごとに加わる時間は、サイクルが確定するたびに${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%ずつ大きくなります。この仕組みによりサイクルは長くなる傾向があり、NFTの刻印ペースが抑えられます。実際のペースは参加状況によっても変わります。`,
      },
      'impact-of-limiting-nfts': {
        question: 'NFTの供給が限られることの影響は何ですか？',
        answer:
          '一筆ごとの時間増分が大きくなり、刻印のペースが遅くなることで希少性が保たれます。新しいCosmic Signature NFTはそれぞれ、プロトコルの累積した歴史のますます希少な一片を表します。',
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
          'Cosmic Signatureはコントラクトアドレス、ソースコードのリソース、検証の背景を公開しているので、コミュニティは振る舞いを独立に調べられます。スマートコントラクトは独立したセキュリティ企業Hackenの監査を受けており、報告書の全文は監査ページからリンクしています。',
      },
      'fees-involved': {
        question: '手数料はかかりますか？',
        answer:
          '一筆の費用そのものに加えて、トランザクションごとにArbitrumネットワークのガス代を支払います。ガス代はネットワークの状況によって変動し、Cosmic Signatureが管理するものではありません。',
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
          '当初、チームは一筆ごとの時間増分や配分トラックの割合など、プロトコルの一部のパラメーターを調整できます。この権限はスマートコントラクトの「Ownable」パターンで実装され、サイクル間の期間に限られます。次のサイクルが有効になると——これはその最初の一筆の前に起こります——中核となるプロトコルのパラメーターはそのサイクルが確定するまでロックされます。このロックの外でも、より狭い権限がいくつか残ります。所有者は、最初の一筆が届くまでサイクルの有効化を延期でき、次のサイクルまでの遅延をいつでも調整でき、周辺のコントラクト（公共財金庫の受け手、NFTメタデータのURI、配分ウォレットの受け取りタイムアウト）をいつでも管理できます。プロトコルのコントラクトは所有者によってアップグレード可能（UUPS）でもありますが、サイクルの間だけです。現在デプロイされている実装は、公開検証済みのV2です。',
      },
      'will-team-always-have-control': {
        question: 'チームは常にプロトコルのパラメーターを管理し続けるのですか？',
        answer:
          'いいえ。プロトコルが安定したら、所有権は宇宙評議会へ移ります。それ以降のパラメーターの変更は、調整定足数を満たしたプロトコル調整提案を通じてのみ行われます。',
      },
      'what-is-renounce-ownership': {
        question: '「所有権の放棄」とはどういう意味ですか？',
        answer:
          '所有権の放棄はOwnableコントラクトの関数で、デプロイしたアドレスから管理権限を永久に手放します。一度呼び出されると、どの特権ロールもコントラクトのパラメーターを変更できなくなります。',
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
          'Discord、X / Twitter、サポートメールで問い合わせできます。公式リンクとメールアドレスは「Cosmic Signatureについて」ページで確認してください。',
      },
      'stay-updated': {
        question: 'Cosmic Signatureの最新情報はどう追えますか？',
        answer:
          '公式のソーシャルメディアチャンネルをフォローし、Discordコミュニティに参加すると、最新の発表、プロトコル調整提案、サイクルの振り返りを受け取れます。',
      },
    },
  },
} satisfies FAQText;
