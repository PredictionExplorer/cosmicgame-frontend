import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentZhTw = {
  metadata: {
    title: '關於 Cosmic Signature · Arbitrum 鏈上藝術',
    description:
      'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議，將演繹週期中的落筆化為確定性的三體 NFT 藝術。',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: '關於 Cosmic Signature',
    description:
      'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議，以演繹週期中的落筆生成確定性的三體 NFT 藝術。',
  },
  breadcrumbLabel: '關於',
  eyebrow: '關於協議',
  heading: '關於 Cosmic Signature',
  body: {
    paragraphs: [
      'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。在每個演繹週期中，參與者以 ETH 或 CST 落筆；每一筆都在塑造最終的簽名——一件從鏈上資料生成、經三體物理模擬渲染而成的確定性 NFT 藝術作品。',
      '協議機制公開且可驗證。Arbitrum 智慧合約紀錄落筆、週期、分配軌道、CST、錨定和 NFT 銘刻。每件作品都能從種子復現。專案開放全部原始碼，以 CC0 發布藝術作品，並將公共財資助寫入協議機制。',
      'Cosmic Signature 與 COSMIC 癌症突變資料庫及生物學中的 COSMIC 突變特徵沒有關聯。本專案是鏈上藝術協議及應用程式。',
    ],
    // lexicon-allow-start: 明確否認投資產品及財務結果承諾。
    denial:
      'Cosmic Signature 並非投資產品。這裡介紹的是落筆、分配、錨定和公共財轉撥等協議機制；協議不對代幣價格走勢或任何財務結果作出承諾。',
    // lexicon-allow-end
  },
  officialResources: {
    heading: '官方資源',
    links: [
      { id: 'app', label: 'Cosmic Signature 應用程式', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: '已驗證的 Arbitrum 合約',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '原始碼', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: '常見問題', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: '服務條款', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: '隱私權政策', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
