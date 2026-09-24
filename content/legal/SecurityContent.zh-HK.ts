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
      '每個合約公開的源代碼在 Sourcify 上均為完全相符，因此鏈上的字節碼就是你能讀到的代碼。<contracts>合約頁面</contracts>列出了所有地址。',
    sourcifyMatch: '完全相符',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: '複製 {value}',
    copiedLabel: '已複製',
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
    paragraphs: [
      '如果你在合約、應用程式或本網站中發現漏洞，請電郵至 <support>support@cosmicsignature.com</support>，並在主旨中註明「Security」。請說明你發現的問題、重現方法以及影響範圍。',
      '請在公開披露前給團隊預留回覆與修正的時間，也不要針對線上合約或其他參與者的資金測試漏洞利用。同一聯絡方式亦公佈於本網站的 <securityTxt>security.txt</securityTxt> 檔案。',
    ],
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
