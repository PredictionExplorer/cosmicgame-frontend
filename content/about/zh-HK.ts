import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentZhHk = {
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
    lede: 'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。在每個演繹週期中，參與者以 ETH 或 CST 落筆；每一筆都在塑造最終的簽名——一件從鏈上數據生成、經三體物理模擬渲染而成的確定性 NFT 藝術作品。',
    // lexicon-allow-start: 明確否認投資產品及財務結果承諾。
    denial:
      'Cosmic Signature 並非投資產品。這裏介紹的是落筆、分配、錨定和公共物品轉撥等協議機制；協議不對代幣價格走勢或任何財務結果作出承諾。',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: '授權',
    license: 'CC0 作品與程式碼',
    networkLabel: '網絡',
    network: 'Arbitrum One',
    publicGoodsLabel: '公共物品',
    publicGoodsTemplate: '每個週期儲備的 {percent}',
  },
  origin: {
    heading: '緣起',
    paragraphs: [
      `Cosmic Signature 由 ${WHITE_PAPER_SHARED.authorName} 設計，白皮書也出自他手。它源於兩個信念：其一，生成藝術最有意思的時候，是其中沒有任何隨意之處——每一幅圖像都是一個物理過程的產物，任何人都能用同一顆種子重新執行它；其二，一個替參與者持有 ETH 的協議，應當清楚回答每一個 wei 的去向。`,
      '因此，這裏的藝術來自物理，而非模型：牛頓引力下的三個天體，由鏈上記錄的種子經開源渲染管線生成，並以 CC0 發佈。分配是機械的：合約執行每一項分配，沒有任何團隊錢包從落筆中收取 ETH。團隊的角色也是有限的：擁有者權限在週期運行期間處於鎖定狀態，並將在餘下升級完成後徹底移除。',
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
        status: '目前版本',
        text: '依據協議的實際使用所做的五項調整，包括隨兩次落筆間隔而增長的參與 CST，以及收官之筆參與者更長的專屬收官窗口。',
      },
      v3: {
        label: 'V3',
        status: '規劃中',
        text: '對截止前最後幾分鐘內的落筆加收溢價，讓持續參與比最後一刻的時機更有分量。它正在公開儲存庫中開發。',
      },
      handover: {
        label: '此後',
        status: '已承諾',
        text: '設計定案後，擁有者控制權將永久離開部署地址：移交給宇宙議會或直接放棄，具體方式會提前公佈。',
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
        label: '已驗證的 Arbitrum 合約',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: '源代碼', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
