import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyJa = {
  title: 'プライバシーポリシー',
  subtitle:
    'アプリとプロジェクトサイトを利用するときに、Cosmic Signatureが情報をどう扱うかを説明します。オンチェーンで公開されるもの、サイトが計測・保存するもの、どのサービスが何を受け取るかをまとめています。',
  inShort: {
    title: '要点',
    points: [
      'ウォレットアドレスとオンチェーンでの操作はすべて公開され、残り続けます。誰でもArbitrum上で読むことができ、誰も削除できません。',
      'ウォレットの接続で共有されるのは公開アドレスだけです。シードフレーズ、秘密鍵、パスワードを求めることはなく、氏名やメールアドレスも収集しません。',
      'サイトは、下に記載したサービスを通じて訪問を計測し、エラーを報告します。設定するCookieは下に記載したものだけです。',
    ],
  },
  introductionTitle: 'はじめに',
  introduction: [
    'Cosmic Signatureは、Ethereumのレイヤー2ネットワークであるArbitrum上に築かれた分散型のブロックチェーンプロトコルです。分散型アプリケーション（dApp）として、データとプライバシーに関しては従来のウェブアプリケーションとは異なる方法で扱います。',
    '本プライバシーポリシーは、Cosmic Signatureの利用に関連して情報をどのように取り扱うかを説明します。当プラットフォームを利用することで、本ポリシーに従った情報の収集と利用に同意したものとみなされます。',
  ],
  sections: [
    {
      id: 'collection',
      title: '収集する情報',
      content: [
        {
          id: 'wallet',
          subtitle: 'ウォレット情報',
          text: 'Cosmic Signatureを利用するためにWeb3ウォレットを接続すると、公開のウォレットアドレスを収集します。これはトランザクションの処理、NFTの表示、一筆の追跡、配分の分配に必要です。',
        },
        {
          id: 'transactions',
          subtitle: 'トランザクションデータ',
          text: '入れた一筆、受け取ったNFT、係留の活動、配分の受け取りなど、スマートコントラクトとのやり取りに関する情報を収集します。これらのデータはすべてブロックチェーン上で公開されています。',
        },
        {
          id: 'usage',
          subtitle: '利用データ',
          text: 'サイトの利用状況を計測しています。閲覧されたページ、ページの読み込み速度、参照元のサイト、訪問元の国、ブラウザー、デバイスの種類です。計測を行う分析サービスは<privacyServices>利用しているサービス</privacyServices>に記載しています。',
        },
      ],
    },
    {
      id: 'use',
      title: '情報の利用方法',
      content: [
        {
          id: 'delivery',
          subtitle: 'サービスの提供',
          text: 'ウォレットアドレスとトランザクションデータは、一筆の処理、NFTの管理、配分の分配、プロトコル統計の表示を含むプロトコルのサービスを提供するために使われます。',
        },
        {
          id: 'improvement',
          subtitle: 'プラットフォームの改善',
          text: '集計した利用データとエラーレポートを使って、不具合を修正し、サイトを改善します。',
        },
        {
          id: 'communication',
          subtitle: '連絡',
          text: 'メールアドレスなどの連絡先は収集しないため、個別に連絡することはありません。セキュリティに関するお知らせやプロトコルの変更などの告知は、<x>X</x>と<discord>Discord</discord>に掲載します。',
        },
      ],
    },
    {
      id: 'security',
      title: 'データのセキュリティ',
      content: [
        {
          id: 'blockchain',
          subtitle: 'ブロックチェーンのセキュリティ',
          text: 'プロトコルの決済は、Ethereumのレイヤー2ネットワークであるArbitrum上で行われます。ウォレットを接続しただけでは管理権限は移らず、アセットも移転しません。ただし、スマートコントラクトの操作を明示的に承認して署名すると、そのトランザクションはアセットをプロトコルのコントラクトへ移転したり、該当する解除または受け取りの条件が満たされるまでそこにロックしたりすることがあります。',
        },
        {
          id: 'infrastructure',
          subtitle: 'インフラのセキュリティ',
          text: 'サイトはHTTPSでのみ配信され、Vercelのホスティング基盤で運用されています。スマートコントラクトは独立した監査を受けています。詳しくは<audits>監査</audits>をご覧ください。',
        },
        {
          id: 'passwords',
          subtitle: 'パスワードは不要',
          text: 'パスワードを求めたり保存したりすることは決してありません。認証はすべてWeb3ウォレットを通じて行われます。',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'データの共有と開示',
      content: [
        {
          id: 'public-chain',
          subtitle: '公開ブロックチェーンのデータ',
          text: 'ブロックチェーンのトランザクションは本質的にすべて公開されています。ウォレットアドレス、一筆、NFTの所有、配分は、ブロックチェーン上と当プラットフォームを通じて誰でも確認できます。',
        },
        {
          id: 'third-party',
          subtitle: '第三者のサービス',
          text: '<privacyServices>利用しているサービス</privacyServices>に記載したサービスは、そこに記載したデータを受け取り、それぞれのプライバシーポリシーに従って処理します。各ポリシーへのリンクは表にあります。',
        },
        {
          id: 'legal',
          subtitle: '法的な要請',
          text: '法律、裁判所の命令、または政府の規制によって求められた場合、情報を開示することがあります。',
        },
      ],
    },
    {
      id: 'rights',
      title: '利用者の権利と選択',
      content: [
        {
          id: 'wallet',
          subtitle: 'ウォレットの管理',
          text: '利用者はウォレットを完全に管理し、いつでも当プラットフォームから接続を解除できます。',
        },
        {
          id: 'permanence',
          subtitle: 'ブロックチェーンの永続性',
          text: 'ブロックチェーンのトランザクションは永続的で、削除できないことにご注意ください。一筆が入れられたりNFTが移転されたりすると、その情報はブロックチェーン上に永久に残ります。',
        },
        {
          id: 'cookies',
          subtitle: 'Cookieの設定',
          text: 'サイトが設定するCookieは、<privacyStorage>Cookieとブラウザーストレージ</privacyStorage>に記載したものだけです。ブラウザーの設定で削除やブロックができます。その場合もサイトは使えますが、カラーテーマと言語の選択は保持されません。',
        },
      ],
    },
  ],
  additionalTitle: '追加情報',
  additional: [
    {
      id: 'children',
      subtitle: '子どものプライバシー',
      text: '当サービスは18歳未満の利用者を対象としていません。子どもの個人情報を故意に収集することはありません。保護者の方で、お子さまが当方に個人情報を提供したとお考えの場合は、ご連絡ください。',
    },
    {
      id: 'changes',
      subtitle: '本ポリシーの変更',
      text: '本プライバシーポリシーは随時更新することがあります。変更はすべてこのページに掲載し、冒頭の「最終更新」の日付を更新します。各変更は本ポリシーの<privacyHistory>改訂履歴</privacyHistory>でも確認できます。',
    },
    {
      id: 'contact',
      subtitle: '連絡先',
      text: '本プライバシーポリシーについてのご質問は、<support>support@cosmicsignature.com</support>、<discord>Discord</discord>、<x>X</x>のいずれかでお問い合わせください。',
    },
    {
      id: 'international',
      subtitle: '国外の利用者',
      text: 'Cosmic Signatureは、世界中からアクセスできるEthereumのレイヤー2ネットワークであるArbitrum上で決済されます。当プラットフォームを利用することで、利用者は自身の情報が世界のさまざまな場所で処理・保存される可能性があることを認識します。',
    },
  ],
  services: {
    heading: '利用しているサービス',
    intro:
      'このサイトは次のサービスを利用しています。各サービスは、記載したデータをそれぞれのプライバシーポリシーに従って処理します。',
    columns: {
      service: 'サービス',
      purpose: '目的',
      data: '受け取るデータ',
      policy: 'プライバシーポリシー',
    },
    policyLink: 'ポリシー',
    ownPolicy: '本ポリシー',
    none: '記載なし',
    items: {
      vercel: {
        purpose: 'サイトのホスティングと配信',
        data: 'リクエストログに残るIPアドレスとブラウザーの情報',
      },
      vercelAnalytics: {
        purpose: 'Cookieを使わずにページビューを数え、表示速度を計測',
        data: '閲覧ページ、参照元サイト、国、ブラウザー、デバイスの種類',
      },
      googleAnalytics: {
        purpose: '訪問者によるサイトの利用状況の計測',
        data: '閲覧ページ、おおよその位置、ブラウザーとデバイス（Cookieを使用）',
      },
      sentry: {
        purpose: '修正のためのエラー報告',
        data: 'エラーの内容、ページ、ブラウザー、エラー直前の様子の再現（テキストと入力内容はすべてマスク）',
      },
      api: {
        purpose: '各ページに表示するプロトコルデータの提供',
        data: '開いた記録（調べたウォレットアドレスを含む）',
      },
      rpc: {
        purpose: 'Arbitrum上のコントラクトの読み取りと、署名したトランザクションの中継',
        data: 'IPアドレス、読み取ったアドレス、送信したトランザクション',
      },
      walletConnect: {
        purpose: 'モバイルウォレットやQRコードで接続するウォレットとの連携',
        data: 'ウォレットアドレスと、サイトとウォレットの間の暗号化されたメッセージ',
      },
      coingecko: {
        purpose: '米ドル建てのETHとCSTの価格の提供',
        data: '米ドル価格を表示するページでのIPアドレス',
      },
    },
  },
  storage: {
    heading: 'Cookieとブラウザーストレージ',
    intro:
      'サイトは次のものを端末に保存します。氏名や連絡先を含むものはありません。Cookieはリクエストとともに送信され、ブラウザーストレージは端末の中にとどまります。',
    columns: {
      name: '名前',
      kind: '種類',
      purpose: '目的',
      lifetime: '保存期間',
    },
    kinds: {
      cookie: 'Cookie',
      browser: 'ブラウザーストレージ',
    },
    lifetimes: {
      oneYear: '1年',
      twoYears: '2年',
      untilCleared: '削除するまで',
      untilTabClosed: 'タブを閉じるまで',
    },
    items: {
      themeCookie: 'Cosmic Signatureの両サイトで選んだカラーテーマを記憶',
      localeCookie: '選んだ言語を記憶',
      gaCookies: 'Google Analyticsで再訪問を区別',
      themeStorage: 'このサイトで選んだカラーテーマを記憶',
      attention: '確定前の通知とサウンドの設定を記憶',
      artMotion: '実験版ホームで作品の動きを止めたことを記憶',
      quizProgress: '解答中のクイズを保持し、参考資料を読んだあとに続きから再開できるようにする',
      quizBest: 'クイズごとの最高記録を記憶',
      wallet: '接続したウォレットを記憶し、アプリが再接続できるようにする',
    },
  },
} as const satisfies PrivacyCopy;
