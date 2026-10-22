import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

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
  eyebrow: '關於 Cosmic Signature',
  heading: '從種子到簽名，人人都能重現的藝術',
  body: {
    lede: 'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。在每個演繹週期中，參與者以 ETH 或 CST 落筆；每一筆都在塑造最終的簽名——一件從鏈上資料生成、經三體物理模擬渲染而成的確定性 NFT 藝術作品。',
    // lexicon-allow-start: 明確否認投資產品及財務結果承諾。
    denial:
      'Cosmic Signature 並非投資產品。這裡介紹的是落筆、分配、錨定和公共財轉撥等協議機制；協議不對代幣價格走勢或任何財務結果作出承諾。',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: '授權',
    license: 'CC0 作品與程式碼',
    networkLabel: '網路',
    network: 'Arbitrum One',
    publicGoodsLabel: '公共財',
    publicGoodsTemplate: '每個週期儲備的 {percent}',
  },
  origin: {
    heading: '緣起',
    paragraphs: [
      `Cosmic Signature 由 ${WHITE_PAPER_SHARED.authorName} 設計，白皮書也出自他手。它源於兩個信念：其一，生成藝術最有意思的時候，是其中沒有任何隨意之處——每一幅圖像都是一個物理過程的產物，任何人都能用同一顆種子重新執行它；其二，一個替參與者持有 ETH 的協議，應當清楚回答每一個 wei 的去向。`,
      '藝術由公開種子與鏈下物理渲染產生，重現作品須使用對應軟體版本與設定。合約依設定執行分配。所有者仍可在合約規定條件下升級及調整參數，部分周邊權限可隨時使用；V3 沒有自動移交或移除權限的機制。',
    ],
  },
  milestones: {
    heading: '從上線到移交',
    items: {
      v1: {
        label: 'V1',
        status: '已上線',
        text: '協議以可升級代理合約的形式在 Arbitrum One 上線：週期、落筆、分配軌道、錨定、宇宙議會與藝術渲染管線。',
      },
      v2: {
        label: 'V2',
        status: '歷史版本',
        text: '依據協議的實際使用所做的五項調整，包括隨兩次落筆間隔而增長的參與 CST，以及收官之筆參與者更長的專屬收官窗口。',
      },
      v3: {
        label: 'V3',
        status: '目前版本',
        text: 'V3 已部署：參與 CST 改由下一筆向上一筆參與者線性發放；參與者星選採基礎價格權重，並加入下降速率調整、臨近收官溢價及新的分配設定。',
      },
      handover: {
        label: '此後',
        status: '尚未執行',
        text: '所有者權限目前仍保留。移交宇宙議會或放棄所有權都須分別透過鏈上交易完成，合約沒有自動執行的時間表。',
      },
    },
  },
  clarificationsHeading: '澄清說明',
  officialResources: {
    heading: '官方資源',
    links: [
      { id: 'app', label: 'Cosmic Signature 應用程式', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Arbitrum 合約與驗證狀態',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '原始碼', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
