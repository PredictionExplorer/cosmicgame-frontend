import type { SecurityCopy } from './SecurityContent';

/** Traditional Chinese (Hong Kong) copy for /security, rendered by SecurityContent. */
export const securityCopyZhHk: SecurityCopy = {
  title: '安全',
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。其安全體系依靠公開的智能合約、透明的協議數據、審慎的錢包互動，以及清晰的參與者教育。',
  official: {
    heading: '官方地址',
    intro:
      '請只從以下網站開啟 Cosmic Signature，並在連接錢包或批准交易前逐字核對地址。任何其他自稱 Cosmic Signature 的網站或帳戶都不是官方渠道。',
    websitesHeading: '網站',
    websites: {
      app: '應用程式：落筆、分配、錨定與公開記錄',
      landing: '項目網站：藝術作品、白皮書與指南',
    },
    communityHeading: '社群',
    community: {
      x: '公告',
      discord: '社群交流與支援',
    },
    contractsHeading: 'Arbitrum One 上的核心合約',
    contractsIntro:
      '每個合約公開的源代碼在 Sourcify 上均為完全相符（核對日期：{date}），因此鏈上的字節碼就是你能讀到的代碼。<contracts>合約頁面</contracts>列出了所有地址。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '複製 {value}',
    copiedLabel: '已複製',
  },
  controls: {
    heading: '所有者權限與升級',
    paragraph:
      'Cosmic Signature 協議合約設有一個所有者：一個可在下列限度內調整部分參數並升級合約代碼的帳戶。每一次變更都記錄在鏈上，並列於<coordination>協調變更</coordination>。',
    ownerLabel: '所有者',
    ownerUnavailable: '暫時無法讀取所有者。可在 Arbiscan 上調用該合約的 owner() 函數查看。',
    account: {
      singleKey: '單一私鑰錢包（外部帳戶），並非多簽錢包，亦非時間鎖。',
      contract: '智能合約帳戶，例如多簽錢包或時間鎖。',
      renounced: '所有權已放棄：再沒有任何帳戶可以調整參數或升級代碼。',
    },
    rows: [
      {
        term: '週期之間',
        detail: '所有者可以調整協議參數，例如每次落筆增加的時間或分配軌道比例。',
      },
      {
        term: '週期進行中',
        detail: '由週期啟用（發生於首筆落筆之前）至該週期收官，核心參數均處於鎖定狀態。',
      },
      {
        term: '任何時候',
        detail:
          '所有者可把週期啟用推遲至首筆落筆到來，調整下一週期前的延遲，並管理外圍合約：公共物品受益方、NFT 元數據連結及分配錢包取回期限。',
      },
      {
        term: '升級',
        detail:
          '協議運行於 UUPS 代理之後，因此地址始終不變。所有者只能在週期之間將其指向新代碼；目前使用的是上方列出、已公開驗證的 V2 實現。',
      },
      {
        term: '宇宙議會',
        detail:
          '計劃在協議穩定後將所有權移交宇宙議會。此後，參數只能透過達到協調法定權重的協議協調提案變更。',
      },
    ],
  },
  model: {
    heading: '安全模型',
    paragraph:
      '協議的每一項操作都由 Arbitrum 智能合約記錄。連接錢包或落筆前，請查看公開的合約地址、源代碼、審計與風險。',
    bullets: [
      '只從上方的官方地址開啟應用程式，並在連接錢包前檢查網址列。',
      '在鏈上與合約互動前，先在<contracts>合約頁面</contracts>核對合約地址。',
      '批准前請閱讀每一個錢包提示：區塊鏈交易無法撤銷。',
      'Cosmic Signature 絕不會索取你的助記詞或私鑰。任何索取者都不是 Cosmic Signature。',
      '不得將 CST、NFT、落筆或分配視為有保證的財務結果；詳見<risk>風險披露</risk>。',
    ],
  },
  report: {
    heading: '報告漏洞',
    lead: '如果你在 Cosmic Signature 合約、應用程式或本網站中發現漏洞，請電郵至 <support>support@cosmicsignature.com</support>，並在主旨中註明「Security」。一份有用的報告應說明：',
    include: [
      '你發現了甚麼，以及影響的是哪個合約、頁面或地址。',
      '如何逐步重現。',
      '它會讓他人可以做甚麼，涉及誰的資金。',
      '團隊如何聯絡你。',
    ],
    scopeHeading: '範圍',
    scope: [
      {
        term: '範圍內',
        detail:
          '<securityOfficial>官方地址</securityOfficial>所列的合約、app.cosmicsignature.com 及 cosmicsignature.com。',
      },
      {
        term: '範圍外',
        detail:
          '並非由 Cosmic Signature 營運的服務，例如錢包、NFT 市場、跨鏈橋及 Arbitrum 網絡本身。請向其各自的團隊報告。',
      },
    ],
    closing:
      '請在公開披露前給團隊預留回覆與修正的時間，也不要針對線上合約或其他參與者的資金測試漏洞利用。同一聯絡方式亦公佈於本網站的 <securityTxt>security.txt</securityTxt> 檔案。',
  },
  verify: {
    heading: '自行驗證',
    paragraph:
      '最有力的安全訊號，是應用程式顯示的內容、已驗證合約、源代碼與 Arbitrum 即時數據彼此一致。這些都可以在不依賴本網站的情況下自行核對。',
    resources: [
      {
        link: 'contracts',
        label: '合約地址',
        description: '所有 Cosmic Signature 合約在 Arbitrum 上的地址，附區塊瀏覽器與 Sourcify 連結',
      },
      {
        link: 'audits',
        label: '審計',
        description: 'Hacken 審計：按嚴重程度劃分的問題、模糊測試的不變量與完整報告',
      },
      {
        link: 'code',
        label: '源代碼',
        description: '各代碼庫，以及把每個種子化為作品的渲染器',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: '將任何合約的字節碼與其公開源代碼比對',
      },
    ],
  },
};
