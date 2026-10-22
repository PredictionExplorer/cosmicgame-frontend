import type { SecurityCopy } from './SecurityContent';

/** Traditional Chinese (Taiwan) copy for /security, rendered by SecurityContent. */
export const securityCopyZhTw: SecurityCopy = {
  title: '安全',
  intro:
    'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。其安全體系依靠公開的智慧合約、透明的協議資料、審慎的錢包互動，以及清晰的參與者教育。',
  official: {
    heading: '官方地址',
    intro:
      '請只從以下網站開啟 Cosmic Signature，並在連接錢包或核准交易前逐字核對地址。任何其他自稱 Cosmic Signature 的網站或帳號都不是官方管道。',
    websitesHeading: '網站',
    websites: {
      app: '應用程式：落筆、分配、錨定與公開紀錄',
      landing: '專案網站：藝術作品、白皮書與指南',
    },
    communityHeading: '社群',
    community: {
      x: '公告',
      discord: '社群交流與支援',
    },
    contractsHeading: 'Arbitrum One 上的核心合約',
    contractsIntro:
      '周邊合約與歷史 V2 實作的公開匹配紀錄於 {date} 核對。目前 V3 尚未在 Sourcify 驗證，舊版本紀錄不能代替目前實作的證據。<contracts>合約頁面</contracts>列出各地址及狀態。',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '複製 {value}',
    copiedLabel: '已複製',
  },
  controls: {
    heading: '所有者權限與升級',
    paragraph:
      'Cosmic Signature 協議合約設有一個所有者：一個可以在下列限度內調整部分參數並升級合約程式碼的帳戶。每一次變更都記錄在鏈上，並列在<coordination>協調變更</coordination>中。',
    ownerLabel: '所有者',
    ownerUnavailable: '暫時無法讀取所有者。可在 Arbiscan 上呼叫該合約的 owner() 函式查看。',
    account: {
      singleKey: '單一私鑰錢包（外部帳戶），不是多簽錢包，也不是時間鎖。',
      contract: '智慧合約帳戶，例如多簽錢包或時間鎖。',
      renounced: '所有權已放棄：沒有任何帳戶可以再調整參數或升級程式碼。',
    },
    rows: [
      {
        term: '週期之間',
        detail: '所有者可以調整協議參數，例如每次落筆增加的時間或分配軌道比例。',
      },
      {
        term: '週期進行中',
        detail:
          '核心設定與升級要求目前時間早於週期啟用時間。只要首筆尚未執行，所有者仍可延後啟用時間，重新進入可維護窗口。周邊權限另有各自規則。',
      },
      {
        term: '任何時候',
        detail:
          '所有者可把週期啟用推遲至首筆落筆到來，調整下一週期前的延遲，並管理外圍合約：公共財受益方、NFT 後設資料連結與分配錢包取回期限。',
      },
      {
        term: '升級',
        detail:
          '協議使用 UUPS 代理，升級會更換實作並保留代理地址。目前實作為 V3；升級須由所有者在合約允許的未啟用狀態下執行。原始碼驗證與安全審計是不同事項，須分別核對。',
      },
      {
        term: '宇宙議會',
        detail:
          '宇宙議會只能行使實際授予的權限，目前不擁有核心協議。V3 不會自動移交或放棄所有權，每個所有者角色都須分別執行鏈上操作。',
      },
    ],
  },
  model: {
    heading: '安全模型',
    paragraph:
      '協議的每一項操作都由 Arbitrum 智慧合約記錄。連接錢包或落筆前，請查看公開的合約地址、原始碼、審計與風險。',
    bullets: [
      '只從上方的官方地址開啟應用程式，並在連接錢包前檢查網址列。',
      '在鏈上與合約互動前，先在<contracts>合約頁面</contracts>核對合約地址。',
      '核准前請閱讀每一個錢包提示：區塊鏈交易無法撤銷。',
      'Cosmic Signature 絕不會索取你的助記詞或私鑰。任何索取者都不是 Cosmic Signature。',
      '不得將 CST、NFT、落筆或分配視為有保證的財務結果；詳見<risk>風險揭露</risk>。',
    ],
  },
  report: {
    heading: '回報漏洞',
    lead: '如果你在 Cosmic Signature 合約、應用程式或本網站中發現漏洞，請寄信至 <support>support@cosmicsignature.com</support>，並在主旨中註明「Security」。一份有用的回報應說明：',
    include: [
      '你發現了什麼，以及影響的是哪個合約、頁面或地址。',
      '如何一步步重現。',
      '它會讓他人能做什麼，涉及誰的資金。',
      '團隊如何聯絡你。',
    ],
    scopeHeading: '範圍',
    scope: [
      {
        term: '範圍內',
        detail:
          '<securityOfficial>官方地址</securityOfficial>中列出的合約、app.cosmicsignature.com 與 cosmicsignature.com。',
      },
      {
        term: '範圍外',
        detail:
          '並非由 Cosmic Signature 營運的服務，例如錢包、NFT 市集、跨鏈橋以及 Arbitrum 網路本身。請向它們各自的團隊回報。',
      },
    ],
    closing:
      '請在公開揭露前給團隊留出回覆與修正的時間，也不要針對線上合約或其他參與者的資金測試漏洞利用。同一聯絡方式也公佈在本網站的 <securityTxt>security.txt</securityTxt> 檔案中。',
  },
  verify: {
    heading: '自行驗證',
    paragraph:
      '請將應用程式顯示與 Arbitrum 即時狀態、目前安裝的實作、原始碼及驗證範圍交叉核對。歷史版本的匹配或審計紀錄不會自動涵蓋升級後的實作。',
    resources: [
      {
        link: 'contracts',
        label: '合約地址',
        description: '所有 Cosmic Signature 合約在 Arbitrum 上的地址，附區塊瀏覽器與 Sourcify 連結',
      },
      {
        link: 'audits',
        label: '審計',
        description: 'Hacken 審計：依嚴重程度分類的問題、模糊測試的不變量與完整報告',
      },
      {
        link: 'code',
        label: '原始碼',
        description: '各程式碼儲存庫，以及把每個種子化為作品的渲染器',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: '將任一合約的位元組碼與其公開原始碼比對',
      },
    ],
  },
};
