import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('en-US');

/** Japanese landing copy, keyed by the skeleton in structure.ts. */
export const landingTextJa = {
  meta: {
    title: 'Cosmic Signature：Arbitrum上のプロシージャル・オンチェーンアート・プロトコル',
    description:
      'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。一筆を重ねることでサイクルのシグネチャーが生まれ、準備金は参加者やEthereumを支えるインフラへ配分されます。',
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
      '形式検証済み',
    ],
  },

  hero: {
    eyebrow: 'プロシージャル・オンチェーンアート・プロトコル · Arbitrum',
    headline: 'Cosmic Signature：プロシージャル・オンチェーンアート · Arbitrum',
    headlineLead: 'Cosmic Signature：プロシージャル・オンチェーンアート ·',
    headlineAccent: 'Arbitrum',
    subhead:
      '一筆を重ねるたびに、シグネチャーが形づくられます。サイクルが確定すると、準備金は10を超える配分トラックへ。参加者に加え、Ethereumを支えるインフラにも届けられます。',
    biologyDisclaimer:
      'Cosmic Signatureは、生物学におけるCOSMICがん変異データベースやCOSMIC変異シグネチャーとは関係がありません。オンチェーンアートのプロトコルとアプリです。',
    primaryCtaLabel: 'アプリを開く',
    secondaryCtaLabel: 'サイクルを探索',
    statisticsCtaLabel: 'プロトコル統計',
    galleryCtaLabel: 'NFTギャラリー',
    scrollAriaLabel: 'サイクルのセクションへスクロール',
    marqueeChips: [
      '検証済みコントラクト',
      'CC0',
      'オープンソース',
      '決定論的アート',
      'Protocol Guildへ7%',
      '宇宙評議会',
      'Arbitrum One',
    ],
    art: {
      eyebrow: 'コレクションの作品',
      caption: 'オンチェーンに刻印 · CC0',
      cstNote: `刻印されたシグネチャーにはそれぞれ${cst} CSTが添えられています。`,
      formingLabel: '作品を読み込み中',
      formingBody: 'ネットワークが応答すると、コレクションのシグネチャーがここに表示されます。',
      viewAriaLabel: 'Cosmic Signature {tokenLabel}をアプリで見る',
      artworkAlt: 'Cosmic Signature {tokenLabel}——決定論的な三体ジェネラティブアートワーク',
      galleryCta: 'ギャラリー全体を見る',
    },
  },

  cycle: {
    eyebrow: 'サイクル',
    heading: 'パフォーマンス・サイクル、開始から確定まで。',
    description:
      'サイクルは調律期間から始まり、一筆を重ねながら続いていきます。確定時刻を過ぎると、サイクルを確定できます。進行を取り仕切る人や仲介者はおらず、プロトコルのルールに従って動きます。',
    stages: {
      opening: {
        title: 'サイクル開始',
        body: `新しいパフォーマンス・サイクルが始まります。最初のETH調律期間が開き、CST調律期間はオンチェーンに保存された長さを使います。現在は${protocolFacts.initialCstCalibrationWindowHours}時間の基準から始まります。`,
      },
      gestures: {
        title: '一筆',
        body: `参加者はETHまたはCSTで一筆を入れます。すべての一筆はサイクル確定時刻を延ばし、星選の対象を記録し、前の一筆からの経過時間の平方根に基づいて動的な参加CSTを刻印することがあります。ETH一筆はCST調律期間を約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短くし、CST一筆は約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くします。`,
      },
      finalization: {
        title: '確定',
        body: 'サイクル確定時刻を過ぎると、最後に一筆を入れた参加者がサイクルを確定できます。優先確定期間が過ぎると公開確定期間に入り、誰でも確定できます。',
      },
      allocations: {
        title: '配分',
        body: 'プロトコルはサイクル準備金を10を超える配分トラックへ配ります。ETH準備金のおよそ半分は、次のサイクルの累積準備金へ持ち越されます。',
      },
    },
  },

  art: {
    eyebrow: 'アート',
    heading: 'オンチェーンのシードから描く、三体問題。',
    description:
      'Cosmic Signature NFTは、ニュートン重力のもとで動く三つの天体の軌跡を描きます。その複雑な模様は、AIや学習データを使わず、決定論的な物理計算から生まれます。同じシードからは、ピクセル単位で同じ作品を再現できます。',
    loading: {
      label: 'ライブアーカイブを同期中',
      description:
        'インデックス済みのトークンメタデータが利用できるようになると、実際に生成されたNFTがここに表示されます。',
    },
    showcase: {
      liveLabel: 'ライブのシグネチャー',
      signalLabel: 'シグナル',
      awaitingMetadataLabel: 'メタデータ待ち',
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
        body: 'ボルダ集計（カオス × 正三角形度）が、候補の中から最も視覚的に興味深い軌道を選びます。',
      },
      camera: {
        title: 'カメラ',
        body: 'カメラがゆっくりと楕円軌道を巡り、三つの天体の動きを捉えます。視点の変化が、作品に映画のような奥行きを生みます。',
      },
      color: {
        title: '色',
        body: '人の色の知覚に合わせたOKLab空間で色を混ぜます。天体ごとに色相を120°ずつずらし、緩やかな変化と正弦波で色を変調します。',
      },
      'spectral-render': {
        title: 'スペクトルレンダリング',
        body: '380から700ナノメートルの波長を64のビンに分けて軌跡を描きます。線の太さは天体の速度に応じて変わり、被写界深度が奥行きを添えます。',
      },
      signature: {
        title: 'シグネチャー',
        body: 'AgXトーンマッピング、ブルーム、OpenSimplexの星雲レイヤー、カラーグレーディングがフレームを仕上げます。その結果が、16ビットPNGと30秒のH.265動画です。',
      },
    },
    facts: {
      'wavelength-bins': { label: '波長ビン' },
      'physics-steps': { label: '候補あたりの物理ステップ', value: '1,000,000' },
      'candidate-orbits': { label: '候補軌道', value: '100,000' },
      license: { label: 'ライセンス' },
    },
  },

  tracks: {
    eyebrow: '配分トラック',
    heading: 'プロトコルがサイクル準備金を配る、10を超える道筋。',
    description:
      'サイクルが確定すると、プロトコルはETHとCSTの準備金を、継続の長さ、タイミング、関わり方、参加を反映する配分トラックへ配ります。ETH準備金のおよそ半分は次のサイクルへ累積します。',
    cardLabel: '配分',
    items: {
      'signature-allocation': {
        title: 'シグネチャー配分',
        body: '最後の一筆を入れた参加者へ。1,000 CSTとCosmic Signature NFT 1点を含みます。',
      },
      'compounding-reserve': {
        percent: '約50%',
        title: '累積準備金',
        body: '次のパフォーマンス・サイクルへ持ち越されます。プロトコルは引き出すのではなく、蓄えていきます。',
      },
      'chrono-warrior': {
        title: '時の戦士配分',
        body: `持久チャンピオンの称号を最も長く連続して保持した参加者へ。${cst} CSTとCosmic Signature NFT 1点を含みます。`,
      },
      'public-goods': {
        title: '公共財配分',
        body: '170人以上のEthereumコア貢献者の資金支援メカニズムであるProtocol Guildへ送られます。',
      },
      'anchor-distribution': {
        title: '係留配分',
        body: 'このサイクルでプロトコルに係留されているすべてのCosmic Signature NFTへ比例して配られます。',
      },
      'eth-stellar-selection': {
        title: 'ETH星選',
        body: '無作為に選ばれた3人の参加者で分け合います。選ばれる頻度は入れた一筆の数に応じて高まります。',
      },
      'participant-nft-stellar-selection': {
        percent: 'NFT 10点',
        title: 'NFT星選——参加者',
        body: `無作為に選ばれた10人の参加者が、それぞれ${cst} CSTとCosmic Signature NFT 1点を受け取ります。`,
      },
      'anchored-nft-stellar-selection': {
        percent: 'NFT 10点',
        title: '係留NFT星選',
        body: `無作為に選ばれた10人のRandom Walk NFT係留者が、それぞれ${cst} CSTとCosmic Signature NFT 1点を受け取ります。`,
      },
      'endurance-champion': {
        percent: `${cst} CST`,
        title: '持久チャンピオン配分',
        body: '最新の一筆を入れた参加者として最も長く先頭を保持した参加者に、1,000 CSTの功労CSTとCosmic Signature NFT 1点が配分されます。',
      },
      'final-cst-gesture': {
        percent: `${cst} CST`,
        title: '最後のCST一筆配分',
        body: 'サイクルで最後のCST一筆を入れた参加者に、1,000 CSTの功労CSTとCosmic Signature NFT 1点が配分されます。',
      },
    },
  },

  anchoring: {
    eyebrow: '係留',
    heading: 'Cosmic Signature NFTをプロトコルに係留する。',
    body: `係留中のCosmic Signature NFTは、サイクルごとに${protocolFacts.anchorDistributionPercentage}%の係留配分を比例して受け取り、係留を解除したときに支払われます。係留はいつでも解除できますが、各NFTを係留できるのは一度だけなので、解除するとそのNFTの係留資格は永久に終わります。係留中のRandom Walk NFTは係留NFT星選の対象となり、選ばれた係留者は${cst} CSTとCosmic Signature NFTを受け取ります（ETHはありません）。`,
    bullets: [
      'サイクルごとにETHが積み上がり、係留解除時に受け取ります',
      '係留はいつでも解除できます。各NFTの係留は一度だけです',
      'Random Walkの係留は星選の対象になります',
      'ロック期間やペナルティはありません。一度解除したNFTは再び係留できません',
    ],
    ctaLabel: 'アプリで係留する',
  },

  publicGoods: {
    eyebrow: '公共財',
    heading: 'すべてのサイクルの7%が、Ethereumのコア貢献者を支えます。',
    body: 'すべてのパフォーマンス・サイクルは、ETH準備金の7%を、170人以上のEthereumコア貢献者の共同資金支援メカニズムであるProtocol Guildへ送ります。プロトコルの利用が増えるほど、Ethereumを支えるインフラへ届く資金も増えます。',
    disclaimerHeading: '免責事項',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'これは公共財のアドレス（現在はProtocol Guild）へのETHの送付です。米国の税法上の慈善寄付ではなく、Cosmic Signatureはその税務上の扱いについて何も表明しません。',
    // lexicon-allow-end
    card: {
      label: 'サイクル配分',
      description: '各サイクルのETH準備金からProtocol Guildへ送られる割合です。',
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
    body: '宇宙評議会はプロトコルをオンチェーンで調整します。CST保有者はウェイトを（自分または別のアドレスへ）委任し、調整提案を提出し、支持または反対を表明します。調整定足数は、支持と棄権のウェイトの合計がCST供給量の3%に達したときに満たされます。提案のしきい値：100 CST。',
    columns: [
      {
        title: '調整提案',
        body: '委任されたウェイトが100 CST以上あるアドレスは誰でも提案を提出できます。調整の遅延は2日、調整の実施期間は2週間です。',
      },
      {
        title: '調整ウェイト',
        body: '各CSTは委任されると1単位のウェイトを表します。表明は暗号学的な署名であり、株式や持分の証書ではありません。',
      },
      {
        title: '調整定足数',
        body: '支持が反対を上回り、支持と棄権のウェイトの合計がCST総供給量の3%に達すれば提案は成立します。反対のウェイトは定足数に数えられません。',
      },
    ],
  },

  verifiability: {
    eyebrow: '検証可能性',
    heading: 'オープンで、検証済みで、再現可能。',
    body: 'シグネチャーはシードから再生成することで誰でも検証できます。コントラクトの検証、静的解析の注記、監査の状況は、報告書が利用できるようになるにつれてアプリを通じて公開されます。このリポジトリのプロジェクト所有の素材はCC0 1.0で提供されます。第三者の依存関係、フォント、アセットはそれぞれのライセンスを保持します。',
    pillars: [
      {
        title: 'CC0 1.0',
        body: 'プロジェクト所有のコントラクト、シェーダー、レンダリングパイプライン。権利は一切留保しません。第三者の素材は除きます。',
      },
      {
        title: '検証状況',
        body: '公開コントラクトのアドレス、ソースコード、検証の範囲、監査報告書の公開状況をアプリで確認できます。',
      },
      {
        title: '再現可能なアート',
        body: '生成されたフレームのSHA-256ハッシュを継続的インテグレーションで検証します。同じシード → 同一の出力。',
      },
    ],
  },

  faq: {
    eyebrow: 'よくある質問',
    heading: 'よく寄せられる疑問に答えます。',
    items: [
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'これは宝くじ、カジノ、ギャンブル商品ですか？',
        answer:
          'いいえ。Cosmic Signatureはプロシージャル・オンチェーンアート・プロトコルです。参加者はパフォーマンス・サイクルの間に一筆を入れ、サイクルが確定するとプロトコルは10を超えるトラックへ配分を配ります。胴元も、ディーラーも、賭けもありません。配分は持久、タイミング、参加を認めるものです。唯一の無作為な配分トラックである星選は、プロトコルレベルの手続き的な分配です。',
      },
      // lexicon-allow-end
      {
        question: '参加者として、実際には何をするのですか？',
        answer:
          '一筆を入れます。各一筆はETHまたはCSTのトランザクションで、サイクル確定時刻を延ばし、星選の対象を記録し、動的な参加CSTを刻印することがあり、サイクルのシグネチャーを形づくります。Cosmic Signature NFTを係留すると、係留配分の対象にもなります。100 CST以上を保有していれば、宇宙評議会を通じて調整提案を提出することもできます。',
      },
      {
        question: '参加CSTの量はなぜ変わるのですか？',
        answer:
          '参加CSTの刻印は、前の一筆からの経過時間に基づく平方根の式を使います。前の一筆から時間が空くほど刻印されるCSTは増えますが、平方根を使うため、増加のペースは次第に緩やかになります。ごく短い間隔の一筆は0 CSTを刻印することがあります。送信前にアプリが現在の量をプレビューします。',
      },
      {
        question: 'ETH一筆とCST一筆はCST調律期間にどう影響しますか？',
        answer: `CST調律期間はオンチェーンに保存され、一筆ごとに変わります。CST一筆は期間を約${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%長くし、CST一筆の費用がより緩やかに下がるようにします。ETH一筆は期間を約${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%短くし、CST一筆の費用がより速く下がるようにします。`,
      },
      {
        question: 'ETHの配分はどこから来るのですか？',
        answer:
          'サイクル準備金からです。準備金は参加者が一筆を入れるにつれて育ちます。サイクルが確定すると、およそ半分は次のサイクルの累積準備金へ持ち越され、残りはオンチェーンのパラメーターに従って配分トラック（シグネチャー配分、時の戦士、係留配分、星選、公共財）へ配られます。',
      },
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: 'これは投資ですか？',
        answer:
          'いいえ。CSTトークンはプロトコル内での参加と調整のウェイトを表すものであり、株式、利益の分配、配当、投資契約ではありません。参加者の一筆からETHを受け取るチームのウォレットは存在しません。Cosmic Signatureはトークンの価格や将来の動きについて何も表明せず、投資として参加を勧誘することもありません。',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: '公共財とは、正確には何ですか？',
        answer:
          '各サイクルのETH準備金の7%が、公共財のアドレス——現在はProtocol Guild——へ送られます。Protocol Guildは170人以上のEthereumコア貢献者の共同資金支援メカニズムです。これは公共財のアドレスへのETHの送付であり、米国の税法上の慈善寄付ではなく、Cosmic Signatureはその税務上の扱いについて何も表明しません。',
      },
      // lexicon-allow-end
      {
        question: '作品はどのような技術で作られていますか？',
        answer:
          '各Cosmic Signature NFTは、ニュートン力学による三体シミュレーションの決定論的なレンダリングです。オンチェーンのシードが候補軌道（4次ヨシダ・シンプレクティック積分器でシミュレーションした10万通りの中から）を選び、それがOKLabの色の混合とともに64の波長ビンでスペクトルレンダリングされます。パイプラインはCC0のもとで完全にオープンソースで、誰でもシードからシグネチャーを再現できます。',
      },
      {
        question: 'フォークしてもいいですか？',
        answer:
          'はい。プロジェクト所有のコントラクト、シェーダー、レンダラー、広報ページ、ドキュメントはCC0 1.0で提供され、権利は一切留保しません。第三者の依存関係、フォント、アセットはそれぞれのライセンスのままです。THIRD_PARTY_NOTICES.mdをご覧ください。',
      },
    ],
  },

  footer: {
    brandName: 'Cosmic Signature',
    logoAlt: 'Cosmic Signature',
    tagline: 'Arbitrum上のプロシージャル・オンチェーンアート・プロトコル。',
    columns: {
      protocol: {
        heading: 'プロトコル',
        links: {
          app: 'アプリを開く',
          about: '概要',
          learn: '学ぶ',
          quiz: 'クイズ',
          'how-it-works': 'ドキュメント',
          contracts: 'コントラクト',
          code: 'ソースコード',
          audits: 'セキュリティ監査',
        },
      },
      ecosystem: {
        heading: 'エコシステム',
        links: {
          marketplace: 'Axiom Zeroマーケットプレイス',
          predictions: 'Chaos Zeroの予測',
          uniswap: 'UniswapでCSTを取引',
          geckoterminal: 'GeckoTerminalでCSTプールを見る',
        },
      },
      community: {
        heading: 'コミュニティ',
        links: {
          twitter: 'X / Twitter',
          discord: 'Discord',
          github: 'GitHub',
          'protocol-guild': 'Protocol Guild',
        },
      },
      legal: {
        heading: '法的情報',
        links: {
          terms: '利用規約',
          privacy: 'プライバシー',
          faq: 'よくある質問',
        },
      },
    },
    copyright: '© {year} Cosmic Signature. プロジェクト所有の素材：CC0 1.0。',
    colophon: 'CC0 1.0 · 公開検証可能 · 再現可能なアート',
  },

  notFound: {
    heading: '星図の外へ。',
    description: 'お探しのページは見つかりませんでした。シグネチャーの世界へ戻りましょう。',
    ctaLabel: 'シグネチャーへ戻る',
  },
} satisfies LandingText;
