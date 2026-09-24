import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyZhTw = {
  title: '隱私權政策',
  subtitle:
    'Cosmic Signature 如何處理你使用應用程式與專案網站時的資訊：哪些內容在鏈上公開、網站統計與儲存哪些資料，以及各項服務會收到哪些資料。',
  inShort: {
    title: '重點',
    points: [
      '你的錢包地址以及你在鏈上的一切操作都公開且永久：任何人都能在 Arbitrum 上讀取，也沒有人能刪除。',
      '連接錢包只會分享公開地址。我們絕不會索取你的助記詞、私鑰或密碼，也不會收集你的姓名或電子郵件地址。',
      '網站透過下方列出的服務統計造訪並回報錯誤，而且只設定下方列出的 Cookie。',
    ],
  },
  introductionTitle: '引言',
  introduction: [
    'Cosmic Signature 是建構在 Arbitrum（以太坊二層網路）上的程序化鏈上藝術協議。作為去中心化應用程式（dApp），我們在資料與隱私權方面的運作方式不同於傳統 Web 應用程式。',
    '本隱私權政策說明我們如何處理與你使用 Cosmic Signature 有關的資訊。使用本平台，即表示你同意我們按照本政策收集及使用資訊。',
  ],
  sections: [
    {
      id: 'collection',
      title: '我們收集的資訊',
      content: [
        {
          id: 'wallet',
          subtitle: '錢包資訊',
          text: '連接 Web3 錢包使用 Cosmic Signature 時，我們會收集你的公開錢包地址。處理交易、顯示 NFT、紀錄落筆及發放分配均需要該地址。',
        },
        {
          id: 'transactions',
          subtitle: '交易資料',
          text: '我們會收集你與智慧合約互動的資訊，包括落筆、獲得 NFT、錨定操作及分配取回紀錄。所有這些資料都已在區塊鏈上公開。',
        },
        {
          id: 'usage',
          subtitle: '使用資料',
          text: '我們統計網站的使用情形：瀏覽的頁面、頁面載入速度、來源網站，以及造訪所在的國家或地區、瀏覽器與裝置類型。執行這些統計的分析服務列在<privacyServices>我們使用的服務</privacyServices>中。',
        },
      ],
    },
    {
      id: 'use',
      title: '我們如何使用資訊',
      content: [
        {
          id: 'delivery',
          subtitle: '提供服務',
          text: '我們使用錢包地址與交易資料提供協議服務，包括處理落筆、管理 NFT、發放分配及顯示協議統計。',
        },
        {
          id: 'improvement',
          subtitle: '改進平台',
          text: '我們使用彙總後的使用資料與錯誤報告修正錯誤、改善網站。',
        },
        {
          id: 'communication',
          subtitle: '溝通',
          text: '我們不收集電子郵件地址或其他聯絡方式，因此不會直接聯絡你。公告（包括安全通知與協議變更）會發布在 <x>X</x> 與 <discord>Discord</discord> 上。',
        },
      ],
    },
    {
      id: 'security',
      title: '資料安全',
      content: [
        {
          id: 'blockchain',
          subtitle: '區塊鏈安全',
          text: '協議結算發生在 Arbitrum（以太坊二層網路）上。僅連接錢包屬於非託管操作，不會轉移資產；但當你明確批准並簽署智慧合約操作時，相關交易可能把資產轉入協議合約，或將資產鎖定在其中，直至滿足相應的釋放或取回條件。',
        },
        {
          id: 'infrastructure',
          subtitle: '基礎設施安全',
          text: '本網站只透過 HTTPS 提供，託管於 Vercel 平台。智慧合約已接受獨立審計，詳見<audits>審計</audits>。',
        },
        {
          id: 'passwords',
          subtitle: '不使用密碼',
          text: '我們絕不會索取或儲存密碼。身份驗證完全透過 Web3 錢包完成。',
        },
      ],
    },
    {
      id: 'sharing',
      title: '資訊共享與披露',
      content: [
        {
          id: 'public-chain',
          subtitle: '公開區塊鏈資料',
          text: '區塊鏈交易天然公開。你的錢包地址、落筆、NFT 所有權及分配均可在區塊鏈與本平台上檢視。',
        },
        {
          id: 'third-party',
          subtitle: '第三方服務',
          text: '<privacyServices>我們使用的服務</privacyServices>中列出的服務會收到該處所述的資料，並依各自的隱私權政策處理；表格中附有連結。',
        },
        {
          id: 'legal',
          subtitle: '法律要求',
          text: '若法律、法院命令或政府法規要求，我們可能披露相關資訊。',
        },
      ],
    },
    {
      id: 'rights',
      title: '你的權利與選擇',
      content: [
        {
          id: 'wallet',
          subtitle: '錢包控制權',
          text: '你始終完全控制自己的錢包，並可隨時斷開錢包與本平台的連線。',
        },
        {
          id: 'permanence',
          subtitle: '區塊鏈永久性',
          text: '區塊鏈交易永久存在且無法刪除。完成落筆或轉移 NFT 後，相關資訊將永久保留在區塊鏈上。',
        },
        {
          id: 'cookies',
          subtitle: 'Cookie 偏好',
          text: '本網站只設定<privacyStorage>Cookie 與瀏覽器儲存空間</privacyStorage>中列出的 Cookie。你可以在瀏覽器設定中刪除或封鎖它們；網站仍可正常使用，只是不會記住你的配色與語言。',
        },
      ],
    },
  ],
  additionalTitle: '其他資訊',
  additional: [
    {
      id: 'children',
      subtitle: '未成年人隱私',
      text: '本服務不面向未滿 18 週歲的使用者。我們不會在明知的情況下收集未成年人的個人資訊。如果你是父母或監護人，並認為孩子向我們提供了個人資訊，請聯絡我們。',
    },
    {
      id: 'changes',
      subtitle: '政策變更',
      text: '我們可能不時更新本隱私權政策。每次變更都會發布在本頁，並更新頁首的「最後更新」日期；每項變更也可在本政策的<privacyHistory>修訂紀錄</privacyHistory>中查看。',
    },
    {
      id: 'contact',
      subtitle: '聯絡方式',
      text: '如對本隱私權政策有任何疑問，請寄信至 <support>support@cosmicsignature.com</support>，或透過 <discord>Discord</discord>、<x>X</x> 聯絡我們。',
    },
    {
      id: 'international',
      subtitle: '國際使用者',
      text: 'Cosmic Signature 在全球均可存取的 Arbitrum（以太坊二層網路）上結算。使用本平台，即表示你確認相關資訊可能在世界各地處理及儲存。',
    },
  ],
  services: {
    heading: '我們使用的服務',
    intro: '本網站使用以下服務。各項服務依其隱私權政策處理所列資料。',
    columns: {
      service: '服務',
      purpose: '用途',
      data: '收到的資料',
      policy: '隱私權政策',
    },
    policyLink: '政策',
    ownPolicy: '本政策',
    none: '未列出',
    items: {
      vercel: {
        purpose: '託管並傳送網站',
        data: '請求紀錄中的 IP 位址與瀏覽器資訊',
      },
      vercelAnalytics: {
        purpose: '統計頁面瀏覽次數並衡量頁面速度，不使用 Cookie',
        data: '瀏覽的頁面、來源網站、國家或地區、瀏覽器與裝置類型',
      },
      googleAnalytics: {
        purpose: '衡量訪客如何使用網站',
        data: '瀏覽的頁面、大致位置、瀏覽器與裝置（透過 Cookie）',
      },
      sentry: {
        purpose: '回報錯誤以便修正',
        data: '錯誤本身、所在頁面、瀏覽器資訊，以及出錯前片刻的重播（所有文字與輸入皆已遮蔽）',
      },
      api: {
        purpose: '提供頁面顯示的協議資料',
        data: '你開啟的紀錄，包括你查詢的任何錢包地址',
      },
      rpc: {
        purpose: '讀取 Arbitrum 上的合約，並轉送你簽署的交易',
        data: 'IP 位址、被讀取的地址以及你送出的交易',
      },
      walletConnect: {
        purpose: '連接行動裝置錢包與掃碼錢包',
        data: '你的錢包地址，以及網站與錢包之間的加密訊息',
      },
      coingecko: {
        purpose: '提供以美元計價的 ETH 與 CST 價格',
        data: '頁面顯示美元價格時的 IP 位址',
      },
    },
  },
  storage: {
    heading: 'Cookie 與瀏覽器儲存空間',
    intro:
      '網站會在你的裝置上儲存以下內容，都不包含你的姓名或聯絡方式。Cookie 會隨請求傳送；瀏覽器儲存空間只保留在你的裝置上。',
    columns: {
      name: '名稱',
      kind: '類型',
      purpose: '用途',
      lifetime: '保留期限',
    },
    kinds: {
      cookie: 'Cookie',
      browser: '瀏覽器儲存空間',
    },
    lifetimes: {
      oneYear: '1 年',
      twoYears: '2 年',
      untilCleared: '直到你清除為止',
    },
    items: {
      themeCookie: '在兩個 Cosmic Signature 網站上記住你的配色',
      localeCookie: '記住你選擇的語言',
      gaCookies: '為 Google Analytics 區分重複造訪',
      themeStorage: '在本網站記住你的配色',
      attention: '記住你的收官前提醒與聲音設定',
      explainer: '記住你已關閉週期說明',
      observatory: '記住你曾造訪實驗版首頁，再次造訪時其介紹預設收合',
      wallet: '記住你連接過的錢包，讓應用程式可以重新連接',
    },
  },
} as const satisfies PrivacyCopy;
