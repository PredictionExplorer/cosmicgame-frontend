import { protocolFacts } from '@/content/protocol-facts';

import type { TermsCopy } from './TermsContent';

const cst = protocolFacts.specialAllocationCst.toLocaleString();

export const termsCopyJa = {
  title: '利用規約',
  subtitle:
    'Cosmic Signatureをご利用になる前に、本規約をよくお読みください。当プラットフォームを利用することで、本規約に拘束されることに同意したものとみなされます。',
  homeLabel: 'ホーム',
  lastUpdated: '最終更新：2026年7月20日',
  sections: [
    {
      id: 'acceptance',
      title: '規約の承諾',
      content: [
        {
          id: 'acceptance',
          text: 'Cosmic Signatureにアクセスし利用することにより、利用者は本利用規約に拘束されることを承諾し、同意します。本規約に同意しない場合は、当プラットフォームを利用しないでください。',
        },
        {
          id: 'binding-agreement',
          text: '本規約は、利用者とCosmic Signatureとの間の法的に拘束力のある合意を構成します。当方はいつでも本規約を変更する権利を留保し、変更は掲載と同時に効力を生じます。',
        },
      ],
    },
    {
      id: 'eligibility',
      title: '利用資格とアカウントの要件',
      content: [
        {
          id: 'age',
          subtitle: '年齢要件',
          text: 'Cosmic Signatureを利用するには18歳以上でなければなりません。当プラットフォームを利用することで、利用者はこの年齢要件を満たしていることを表明し保証します。',
        },
        {
          id: 'wallet',
          subtitle: 'ウォレットに関する責任',
          text: 'Web3ウォレットと秘密鍵の安全を保つ責任は、利用者のみが負います。Cosmic Signatureが秘密鍵やシードフレーズを求めることは決してありません。ウォレットへのアクセスを失うと、NFTや資金を永久に失うことがあります。',
        },
        {
          id: 'compliance',
          subtitle: '法令の遵守',
          text: '利用者は、Cosmic Signatureを利用するにあたり、暗号資産とブロックチェーン技術に関するものを含め、自身の法域で適用されるすべての法令を遵守することに同意します。',
        },
      ],
    },
    {
      id: 'mechanics',
      title: 'プロトコルの仕組みとスマートコントラクト',
      content: [
        {
          id: 'protocol',
          subtitle: 'プロトコルの仕組み',
          text: 'Cosmic Signatureは分散型のプロシージャル・オンチェーンアート・プロトコルで、参加者はパフォーマンス・サイクルの間にETHまたはCSTトークンで一筆を入れます。一筆はサイクル確定時刻を延ばし、プロトコルの対象を記録し、スマートコントラクトの式に従って動的な参加CSTを刻印することがあります。サイクル確定時刻を過ぎると、最後の一筆を入れた参加者がシグネチャー配分を受け取れます。追加の配分は、公開されている配分トラックの構成に従って配られます。',
        },
        {
          id: 'dynamic-cst',
          subtitle: '動的なCSTの刻印',
          text: '一筆が刻印する参加CSTは固定ではありません。その量は前の一筆からの経過時間に依存し、平方根の式で計算されます。ごく短い間隔の一筆は0 CSTを刻印することがあります。',
        },
        {
          id: 'cst-window',
          subtitle: 'CST調律期間',
          text: `CST一筆の費用は、オンチェーンに保存された調律期間を通じて下がります。CST一筆はそれぞれその期間を約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%増やし、ETH一筆はそれぞれ約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%減らします。`,
        },
        {
          id: 'smart-contract',
          subtitle: 'スマートコントラクトとのやり取り',
          text: 'プロトコルのすべての操作は、Arbitrumネットワーク上のスマートコントラクトを通じて実行されます。トランザクションがオンチェーンで確認されると、取り消すことはできません。利用者は、ブロックチェーンのトランザクションが最終的で取り消せないものであることを認識します。',
        },
        {
          id: 'gas',
          subtitle: 'ガス代',
          text: '利用者は、自身のトランザクションに伴うArbitrumネットワークのガス代をすべて支払う責任を負います。ガス代は一筆の費用とは別で、Cosmic Signatureではなくネットワークに支払われます。',
        },
        {
          id: 'random-walk',
          subtitle: 'Random Walk NFTによる費用の引き下げ',
          text: 'Random Walk NFTはETH一筆に一度だけ添付でき、ETH一筆の費用が50%引き下げられます。この操作は取り消せません。一度使ったRandom Walk NFTを、再び費用の引き下げに使うことはできません。',
        },
      ],
    },
    {
      id: 'allocations',
      title: '配分',
      content: [
        {
          id: 'distribution',
          subtitle: '配分の実行',
          text: `配分はスマートコントラクトのルールに従って自動的に配られます。標準的なサイクルでは、以下の配分トラック全体で${protocolFacts.typicalNftsPerCycle}点のCosmic Signature NFTと${protocolFacts.typicalCstImprintsPerCycle.toLocaleString()} CSTが刻印されます。`,
        },
        {
          id: 'signature',
          subtitle: 'シグネチャー配分',
          text: `最後の一筆を入れた参加者は、${protocolFacts.mainEthPercentage}%のETH、${cst} CSTの功労CST、Cosmic Signature NFT 1点、そしてサイクルで添付されたトークン（あれば）を受け取れます。`,
        },
        {
          id: 'chrono',
          subtitle: '時の戦士',
          text: `持久チャンピオンの称号を最も長く連続して保持した参加者は、${protocolFacts.chronoWarriorEthPercentage}%のETH、${cst} CSTの功労CST、Cosmic Signature NFT 1点を受け取ります。`,
        },
        {
          id: 'endurance',
          subtitle: '持久チャンピオン',
          text: `最新の一筆を入れた参加者として最も長く先頭を保持した参加者は、${cst} CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。`,
        },
        {
          id: 'final-cst',
          subtitle: '最後のCST一筆',
          text: `サイクルで最後のCST一筆を入れた参加者は、${cst} CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。`,
        },
        {
          id: 'eth-selection',
          subtitle: 'ETH星選',
          text: `選ばれた${protocolFacts.ethStellarSelectionRecipients}人の参加者が、サイクル準備金から${protocolFacts.stellarSelectionEthPercentage}%のETHを分け合います。`,
        },
        {
          id: 'nft-selection',
          subtitle: 'NFT星選',
          text: `選ばれた${protocolFacts.nftStellarSelectionRecipients}人の参加者が、それぞれ${cst} CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。`,
        },
        {
          id: 'anchored-selection',
          subtitle: '係留NFT星選',
          text: `選ばれた${protocolFacts.anchoredRwlkNftSelectionRecipients}人のRandomWalk NFT係留者が、それぞれ${cst} CSTの功労CSTとCosmic Signature NFT 1点を受け取ります。`,
        },
        {
          id: 'anchor-distribution',
          subtitle: '係留配分',
          text: `${protocolFacts.anchorDistributionPercentage}%のETHが、係留中のすべてのCosmic Signature NFTへ比例して配られます。`,
        },
        {
          id: 'public-goods',
          subtitle: '公共財',
          text: `${protocolFacts.publicGoodsPercentage}%のETHが、現在の公共財の受け手であるProtocol Guildへ送られます。`,
        },
        {
          id: 'compounding',
          subtitle: '累積準備金',
          text: `サイクル準備金の約${protocolFacts.compoundingReservePercentage}%が、次のパフォーマンス・サイクルへ持ち越されます。`,
        },
        {
          id: 'outreach',
          subtitle: '広報準備金',
          text: `サイクルごとに${protocolFacts.outreachReserveCst.toLocaleString()} CSTが、広報配分とエコシステムの貢献者のために刻印されます。`,
        },
        {
          id: 'retrieval',
          subtitle: '配分の受け取り',
          text: `一部の配分は、プラットフォームを通じて手動で受け取る必要があります。シグネチャー配分の対象となる参加者には、サイクル確定時刻の後、サイクルを優先的に確定できる${protocolFacts.finalGestureExclusivityHours}時間があります。その期間が過ぎると誰でもサイクルを確定でき、スマートコントラクトのルールのもとでは確定実行者がサイクル受領者となり、シグネチャー配分を受け取ります。二次的なETHや、添付されたトークン・NFTの配分には別の受け取りタイムアウトがあり、既定は${protocolFacts.secondaryRetrievalTimeoutWeeks}週間です。それが切れると、スマートコントラクトは未受け取りの配分を誰でも自分のものとして受け取ることを許します。これらのタイムアウトが切れる前に配分を受け取る責任は利用者にあります。`,
        },
        {
          id: 'no-guarantee',
          subtitle: '結果の保証はありません',
          text: 'Cosmic Signatureへの参加は、いかなる結果も保証しません。すべての一筆は最終的なものとみなされ、一筆の費用の全額が戻らないことがあります。失っても生活に支障のない範囲で参加してください。',
        },
      ],
    },
    {
      id: 'risks',
      title: 'リスクと免責事項',
      content: [
        {
          id: 'blockchain-risk',
          subtitle: 'ブロックチェーン技術のリスク',
          text: '利用者は、ブロックチェーン技術に固有のリスクを認識します。これには、スマートコントラクトの脆弱性、ネットワークの混雑、ガス価格の変動、規制の変更、技術的な問題による資金の損失の可能性が含まれますが、これらに限られません。',
        },
        {
          id: 'warranties',
          subtitle: '無保証',
          text: 'Cosmic Signatureは、明示か黙示かを問わず、いかなる種類の保証もなく「現状のまま」提供されます。当方は、プラットフォームが中断されないこと、エラーがないこと、有害な要素を含まないことを保証しません。',
        },
        {
          id: 'volatility',
          subtitle: '市場の変動',
          text: '暗号資産とNFTの市場は非常に変動が大きいものです。ETH、CSTトークン、NFTの価値は大きく変動することがあります。過去の推移は将来の結果を示すものではありません。',
        },
        {
          id: 'audits',
          subtitle: 'スマートコントラクトの監査',
          text: '当方はスマートコントラクトの安全性の確保に努めていますが、いかなる監査も完全な安全性を保証することはできません。プラットフォームの利用は利用者自身のリスクで行われます。',
        },
      ],
    },
    {
      id: 'prohibited',
      title: '禁止行為',
      content: [
        {
          id: 'intro',
          text: '利用者は、以下の禁止行為のいずれにも関与しないことに同意します：',
        },
        {
          id: 'exploit',
          text: '• バグ、不具合、脆弱性を通じてプロトコルの仕組みを操作または悪用しようとすること',
        },
        {
          id: 'automation',
          text: '• ボット、スクリプト、自動化ツールを使ってプラットフォームとやり取りすること',
        },
        {
          id: 'collusion',
          text: '• いかなる形の市場操作や、他の利用者との共謀に関与すること',
        },
        {
          id: 'security',
          text: '• プラットフォームのセキュリティをハッキング、リバースエンジニアリング、または侵害しようとすること',
        },
        {
          id: 'law',
          text: '• 適用される法令に違反すること',
        },
        {
          id: 'accounts',
          text: '• 不公正な優位を得るために複数のアカウントを作成すること',
        },
        {
          id: 'malicious',
          text: '• 悪意のあるコンテンツをアップロードしたり、サービス拒否攻撃を試みたりすること',
        },
      ],
    },
  ],
  additionalTitle: '追加条項',
  additional: [
    {
      id: 'intellectual-property',
      subtitle: '知的財産',
      text: 'リポジトリのルートLICENSEの対象となるプロジェクト所有の素材は、CC0 1.0で提供されます。第三者の依存関係、フォント、アセット、その他の第三者の素材はそれぞれのライセンスを保持し、この提供には含まれません。THIRD_PARTY_NOTICES.mdをご覧ください。CC0は商標権や特許権を放棄するものではありません。CC0または明示されたオープンソースライセンスの対象でない素材は、それぞれの権利者の財産のままであり、適用される知的財産法によって保護されます。プロトコルを通じて受け取ったNFTは、その特定のトークンの所有権を与えますが、明示されている場合を除き、基礎となる知的財産の所有権を与えるものではありません。',
    },
    // lexicon-allow-start: boilerplate limitation-of-liability language must preserve "profits".
    {
      id: 'liability',
      subtitle: '責任の制限',
      text: '法律で許される最大限の範囲で、Cosmic Signatureとその関係会社は、間接的、付随的、特別、結果的、または懲罰的な損害、利益や収入の損失（直接的か間接的かを問わず）、あるいはプラットフォームの利用に起因するデータ、使用、信用、その他の無形の損失について、一切の責任を負いません。',
    },
    // lexicon-allow-end
    {
      id: 'indemnification',
      subtitle: '補償',
      text: '利用者は、プラットフォームの利用、本規約への違反、または他者の権利の侵害から生じる一切の請求、損失、損害、責任、費用（弁護士費用を含む）について、Cosmic Signatureとその関係会社を補償し、免責することに同意します。',
    },
    {
      id: 'disputes',
      subtitle: '紛争の解決',
      text: '本規約またはCosmic Signatureの利用から生じる紛争は、米国仲裁協会の規則に従った拘束力のある仲裁によって解決されます。利用者は、陪審裁判を受ける権利および集団訴訟に参加する権利を放棄します。',
    },
    {
      id: 'law',
      subtitle: '準拠法',
      text: '本規約は、法の抵触に関する規定にかかわらず、Cosmic Signatureが事業を行う法域の法律に準拠し、それに従って解釈されます。',
    },
    {
      id: 'severability',
      subtitle: '分離可能性',
      text: '本規約のいずれかの条項が無効または執行不能と判断された場合でも、残りの条項は引き続き完全な効力を保ちます。',
    },
    {
      id: 'agreement',
      subtitle: '完全合意',
      text: '本規約は、プラットフォームの利用に関する利用者とCosmic Signatureとの間の完全な合意を構成し、それ以前のいかなる合意にも優先します。',
    },
    {
      id: 'contact',
      subtitle: '連絡先',
      text: '本利用規約についてご質問がある場合は、公式のコミュニティチャンネルまたはGitHubリポジトリを通じてお問い合わせください。',
    },
  ],
  // lexicon-allow-start: Howey-test denial copy must explicitly negate an investment framing.
  warning: {
    title: '重要な注意',
    text: 'Cosmic Signatureへの参加には金銭的なリスクが伴います。暗号資産とNFTの市場は非常に変動が大きく、一筆の価値が戻らないことがあります。失っても生活に支障のない範囲で参加してください。Cosmic Signatureは投資商品ではなく、トークンの価格や将来の動きについて何も表明せず、投資として参加を勧誘することもありません。参加する前に、必ず自身で調べ、自身の経済状況を慎重に検討してください。',
  },
  // lexicon-allow-end
  acknowledgment: {
    title: '確認',
    text: 'Cosmic Signatureを利用することにより、利用者は本利用規約を読み、理解し、これに拘束されることに同意したことを確認します。また、ブロックチェーン技術、暗号資産、NFTに関わるリスクを理解していることを確認します。',
  },
} as const satisfies TermsCopy;
