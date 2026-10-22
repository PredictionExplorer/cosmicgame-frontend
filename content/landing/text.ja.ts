import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { LandingText } from './structure';

const cst = formatCount(protocolFacts.specialAllocationCst, 'ja');

/** Japanese landing copy, keyed by the skeleton in structure.ts. */
export const landingTextJa = {
  meta: {
    title: 'Cosmic Signature：Arbitrum上のプロシージャル・オンチェーンアート・プロトコル',
    description:
      'V3はデプロイ済みです。参加CSTの式と受領者、参加者向けETH星選とNFT星選のウェイト、CST費用の下降速度、ETHの割合、シグネチャー配分のNFT数を変更し、終盤の費用加算も導入しています。',
    keywords: [
      'Cosmic Signature',
      'プロシージャルアート・プロトコル',
      'オンチェーンアート',
      'Arbitrum',
      '三体問題',
      'ジェネラティブアート',
      '公共財',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: 'プロシージャル・オンチェーンアート・プロトコル · Arbitrum',
    headlineLead: '一筆ごとに、',
    headlineAccent: 'アートが生まれます。',
    subhead:
      'サイクル最初の一筆はETHで入れ、確定時計を始めます。以降の一筆は、時刻を過ぎた後も保存済みの確定時刻に現在の加算時間を足します。現在時刻から時計を再開するわけではありません。確定処理が成功するまでは一筆を入れられます。 該当額は公共財金庫に入ります。誰でも別のトランザクションで、現在の受け手であるProtocol Guildへ金庫の残高を送れます。',
    secondaryCtaLabel: 'サイクルの仕組み',
    art: {
      viewAriaLabel: 'Cosmic Signature {tokenLabel}をアプリで見る',
      artworkAlt: 'Cosmic Signature {tokenLabel}——決定論的な三体ジェネラティブアートワーク',
      galleryCta: 'ギャラリー全体を見る',
    },
  },

  cycle: {
    eyebrow: 'サイクル',
    heading: 'パフォーマンス・サイクル、開始から確定まで。',
    steps: {
      gesture: {
        title: '一筆を入れる',
        body: 'ETHまたはCSTで参加します。すべての一筆はオンチェーンに記録され、そのサイクルの星選の対象になります。',
      },
      extend: {
        title: '確定時刻を延ばす',
        body: '一筆ごとにサイクル確定時刻が延びるため、参加が続くかぎりサイクルも続きます。',
      },
      finalize: {
        title: '確定と配分',
        body: '時計がゼロになるとサイクルを確定できます。確定すると新しいシグネチャーが刻印され、サイクル準備金が下の配分トラックへ配られます。',
      },
    },
    gestureCtaLabel: '一筆を入れる',
    guideCtaLabel: '仕組みを順を追って見る',
  },

  art: {
    eyebrow: 'アート',
    heading: 'オンチェーンのシードから描く、三体問題。',
    description:
      'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
    showcase: {
      viewAriaLabel: 'Cosmic Signature {tokenLabel}を見る',
      artworkAlt: 'Cosmic Signatureのアートワーク{tokenLabel}',
    },
    stageLabel: 'ステージ',
    stages: {
      seed: {
        title: 'シード',
        body: 'オンチェーンのデータ——ブロック情報とArbSysプリコンパイル——から32バイトのハッシュを導き、SHA3-256乱数生成器に入力します。',
      },
      simulation: {
        title: 'シミュレーション',
        body: '10万通りの候補配置を、4次ヨシダ・シンプレクティック積分器でそれぞれ100万ステップの物理計算にかけます。',
      },
      selection: {
        title: '選抜',
        body: '軌道の性質を使ったボルダ順位で候補を絞り、その後に画像の美的な性質を確認する段階を通じて結果を選びます。',
      },
      camera: {
        title: 'カメラ',
        body: 'カメラがゆっくりと楕円軌道を巡り、三つの天体の動きを捉えます。視点の変化が、作品に映画のような奥行きを生みます。',
      },
      color: {
        title: '色',
        body: 'パレットは知覚色空間OKLChで色相や色の間隔を変化させます。現在のレンダラーは三つの天体の色相を等間隔の角度に固定していません。',
      },
      'spectral-render': {
        title: 'スペクトルレンダリング',
        body: '380から700ナノメートルの波長を64のビンに分けて軌跡を描きます。線の太さは天体の速度に応じて変わり、被写界深度が奥行きを添えます。',
      },
      signature: {
        title: 'シグネチャー',
        body: 'トーンマッピング、ブルーム、色処理で画像を仕上げます。解像度、動画の長さ、形式はレンダラーの版と設定によって変わります。',
      },
    },
    facts: {
      imprinted: { label: 'これまでの刻印数' },
      resolution: { label: 'ネイティブ解像度' },
      animation: { label: 'アニメーション', value: '30秒、60fps' },
      license: { label: 'ライセンス' },
    },
  },

  tracks: {
    eyebrow: '配分トラック',
    heading: 'サイクル準備金は、すべてルールどおりに配分されます。',
    description: `すべてのトラックがある場合、サイクルはCosmic Signature NFT${protocolFacts.typicalNftsPerCycle}点と固定配分の${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'ja')} CSTを刻印します。シグネチャー配分はNFT${protocolFacts.mainPrizeNftsPerCycle}点に対して、合計${formatCount(protocolFacts.specialAllocationCst, 'ja')} CSTを一度だけ受け取ります。時の戦士、持久チャンピオン、最後のCST一筆には各1点と対応するCSTがあり、二つのNFT星選が残りを加えます。CST一筆や係留中のRandom Walk NFTがなければ該当トラックは省略されます。参加CSTは別です。`,
    ethLabel: '各サイクル準備金のETH',
    fixedLabel: 'サイクルごとのCSTとNFT',
    fixedEach: `受領者はそれぞれ${cst} CSTとCosmic Signature NFT 1点を受け取ります。`,
    recipients: { other: '受領者{count}人' },
    items: {
      'signature-allocation': {
        title: 'シグネチャー配分',
        body: '確定の受領者に連続IDのCosmic Signature NFT3点と合計1,000 CSTを配分します。確定権には優先期間と公開期間があります。',
      },
      'compounding-reserve': {
        percent: '約50%',
        title: '累積準備金',
        body: 'ETHのおよそ半分が次のサイクルへ持ち越されます。整数の丸め、省略されたトラック、送付失敗により残高が増える場合があります。次の開始準備金が前より大きくなる保証はありません。',
      },
      'chrono-warrior': {
        title: '時の戦士配分',
        body: `持久チャンピオンの称号を最も長く連続して保持した参加者へ。${cst} CSTとCosmic Signature NFT 1点を含みます。`,
      },
      'public-goods': {
        title: '公共財配分',
        body: '該当額は公共財金庫に入ります。誰でも別のトランザクションで、現在の受け手であるProtocol Guildへ金庫の残高を送れます。',
      },
      'anchor-distribution': {
        title: '係留配分',
        body: 'このサイクルでプロトコルに係留されているすべてのCosmic Signature NFTへ比例して配られます。',
      },
      'eth-stellar-selection': {
        title: 'ETH星選',
        body: `ウェイト付きの${protocolFacts.ethStellarSelectionRecipients}回の選定でETHの該当額を分けます。一筆の時点における、割引も終盤の加算もないETH基本費用をウェイトとして選びます。同じアドレスを複数回選ぶことがあります。`,
      },
      'participant-nft-stellar-selection': {
        title: 'NFT星選——参加者',
        body: '一筆の時点における、割引も終盤の加算もないETH基本費用をウェイトとして選びます。同じアドレスを複数回選ぶことがあります。',
      },
      'anchored-nft-stellar-selection': {
        title: '係留NFT星選',
        body: 'Random Walk NFTの係留者から無作為に選ばれます。',
      },
      'endurance-champion': {
        title: '持久チャンピオン配分',
        body: '最新の一筆を入れた参加者として、最も長く途切れずに先頭を保持した参加者です。',
      },
      'final-cst-gesture': {
        title: '最後のCST一筆配分',
        body: 'サイクルで最後のCST一筆を入れた参加者です。',
      },
    },
  },

  anchoring: {
    eyebrow: '係留',
    heading: 'Cosmic Signature NFTをプロトコルに係留する。',
    body: `Cosmic Signature NFTを係留すると、サイクルごとに${protocolFacts.anchorDistributionPercentage}%の係留配分を比例して受け取り、係留を解除したときに支払われます。係留はいつでも解除できますが、各NFTを係留できるのは一度だけです。`,
    bullets: [
      'サイクルごとにETHが積み上がり、係留解除時に受け取ります',
      'ロック期間やペナルティはありません。一度解除したNFTは再び係留できません',
      '姉妹コレクションのRandom Walk NFTも係留できます',
      `係留中のRandom Walk NFTは係留NFT星選の対象です。${cst} CSTとCosmic Signature NFTを受け取り、ETHはありません`,
    ],
    ctaLabel: 'アプリで係留する',
  },

  publicGoods: {
    eyebrow: '公共財',
    heading: 'すべてのサイクルが、Ethereumのコア貢献者を支えます。',
    body: '確定時に、プロトコルはサイクル準備金の設定された割合を公共財金庫へ送ろうとします。その後、誰でも別のトランザクションで残高を現在の受け手であるProtocol Guildへ送れます。所有者は受け手を変更できます。プロトコルから金庫への送付が失敗しても、確定を取り消さずにその分を準備金へ残す場合があります。',
    disclaimerHeading: '免責事項',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'これは公共財のアドレス（現在はProtocol Guild）へのETHの送付です。米国の税法上の慈善寄付ではなく、Cosmic Signatureはその税務上の扱いについて何も表明しません。',
    // lexicon-allow-end
    card: {
      label: 'サイクル配分',
      description:
        '該当額は公共財金庫に入ります。誰でも別のトランザクションで、現在の受け手であるProtocol Guildへ金庫の残高を送れます。',
      tableRows: {
        contributors: { label: 'Protocol Guildの貢献者' },
        enforcement: { label: '執行', value: 'オンチェーン' },
        recipient: { label: '受け手' },
      },
    },
    ctaLabel: 'Protocol Guildについて知る',
  },

  council: {
    eyebrow: '宇宙評議会',
    heading: 'プロトコルの調整を、オンチェーンで。',
    body: 'CST保有者はプロトコルをオンチェーンで調整します。ウェイトを委任し、調整提案を提出し、支持または反対を表明します。',
    columns: {
      proposal: {
        title: '調整提案',
        body: `委任されたウェイトが${protocolFacts.councilProposalThresholdCst} CST以上あるアドレスは誰でも提案を提出できます。調整の遅延は${protocolFacts.councilVotingDelayDays}日、調整の実施期間は${protocolFacts.councilVotingPeriodWeeks}週間です。`,
      },
      weight: {
        title: '調整ウェイト',
        body: '各CSTは委任されると1単位のウェイトを表します。表明は暗号学的な署名であり、株式や持分の証書ではありません。',
      },
      quorum: {
        title: '調整定足数',
        body: `支持が反対を上回り、支持と棄権のウェイトの合計がCST総供給量の${protocolFacts.councilQuorumPercent}%に達すれば提案は成立します。反対のウェイトは定足数に数えられません。`,
      },
    },
  },

  verifiability: {
    eyebrow: '検証可能性',
    heading: 'オープンで、検証済みで、再現可能。',
    body: 'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Cosmic Signatureの各リポジトリにあるプロジェクト所有の素材（コントラクト、シェーダー、レンダリングパイプライン）はCC0 1.0で提供され、権利は一切留保しません。第三者の依存関係、フォント、アセットはそれぞれのライセンスを保持します。',
      },
      verification: {
        title: '検証状況',
        body: '公開コントラクトのアドレス、ソースコード、検証の範囲、監査報告書の公開状況をアプリで確認できます。',
      },
      reproducible: {
        title: '再現可能なアート',
        body: 'リポジトリには手動で実行する画像の再現性確認があります。現在の継続的インテグレーションは、生成フレームのハッシュを比較していません。',
      },
    },
    evidenceLabel: '自分で確かめる',
  },

  faq: {
    eyebrow: 'よくある質問',
    heading: 'よく寄せられる疑問に答えます。',
    moreLabel: 'よくある質問でさらに詳しく',
    items: [
      {
        question: '参加者として、実際には何をするのですか？',
        answer:
          'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
      },
      {
        question: '作品はどのような技術で作られていますか？',
        answer:
          'NFTのシードはオンチェーンに保存され、画像と動画はオフチェーンで生成されます。再現には同じシード、適切なレンダラーの版と設定、互換性のあるツールが必要です。シードだけで異なる版の出力まで一致するとは限りません。',
      },
      {
        question: 'ETHの配分はどこから来るのですか？',
        answer:
          'サイクル準備金からです。準備金は参加者が一筆を入れるにつれて育ちます。サイクルが確定すると、およそ半分は次のサイクルの累積準備金へ持ち越され、残りはオンチェーンのパラメーターに従って配分トラック（シグネチャー配分、時の戦士、係留配分、星選、公共財）へ配られます。',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: '公共財とは、正確には何ですか？',
        answer: `確定時に、プロトコルはサイクル準備金の${protocolFacts.publicGoodsPercentage}%を公共財金庫へ送ろうとします。その後、誰でも別のトランザクションで残高を現在の受け手であるProtocol Guildへ送れます。所有者は受け手を変更できます。プロトコルから金庫への送付が失敗しても、確定を取り消さずにその分を準備金へ残す場合があります。`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'これは宝くじ、カジノ、ギャンブル商品ですか？',
        answer:
          'いいえ。Cosmic Signatureはプロシージャル・オンチェーンアート・プロトコルです。参加者はパフォーマンス・サイクルの間に一筆を入れ、サイクルが確定するとプロトコルは各配分トラックへ配分を配ります。胴元も、ディーラーも、賭けもありません。配分は持久、タイミング、参加を認めるものです。唯一の無作為な配分トラックである星選は、プロトコルレベルの手続き的な分配です。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: 'これは投資ですか？',
        answer:
          'いいえ。CSTトークンはプロトコル内での参加と調整のウェイトを表すものであり、株式、利益の分配、配当、投資契約ではありません。参加者の一筆からETHを受け取るチームのウォレットは存在しません。Cosmic Signatureはトークンの価格や将来の動きについて何も表明せず、投資として参加を勧誘することもありません。',
      },
      // lexicon-allow-end
      {
        question: '参加CSTの量はなぜ変わるのですか？',
        answer:
          'V3では、次の一筆が直前の一筆を入れた参加者に参加CSTの全額を刻印します。数量は二つの一筆の間の時間に比例します。サイクル最初の一筆ではこのCSTは発生せず、確定時にも最後の参加者の未精算区間へ追加の参加CSTは支払われません。両方の一筆が同じアドレスなら、そのアドレス自身が受け取ります。',
      },
      {
        question: 'ETH一筆とCST一筆はCST調律期間にどう影響しますか？',
        answer:
          'V3が保存するのはCST費用の下降速度で、期間の長さは速度と上限から求めます。ETH一筆はrate + floor(rate / 100)への増加を試み、CST一筆はrate - floor(rate / 101)へ減少させます。最短期間の条件に反する増加は行いません。CST一筆の後の上限は、加算前のCST基本費用の2倍、設定された最小値、新しい速度と180秒の積のうち最大の値です。次の一筆をすぐに入れることはできます。',
      },
      {
        question: 'フォークしてもいいですか？',
        answer:
          'はい。プロジェクト所有のコントラクト、シェーダー、レンダラー、広報ページ、ドキュメントはCC0 1.0で提供され、権利は一切留保しません。第三者の依存関係、フォント、アセットはそれぞれのライセンスのままです。THIRD_PARTY_NOTICES.mdをご覧ください。',
      },
    ],
  },
  closing: {
    eyebrow: 'コレクション',
    heading: 'サイクルごとに、コレクションが育ちます。',
    body: 'ライブのサイクルを見る、一筆を入れる、これまでに刻印されたシグネチャーを眺める。どこからでも始められます。',
  },
} satisfies LandingText;
