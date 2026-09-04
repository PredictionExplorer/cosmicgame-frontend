import { protocolFacts } from '@/content/protocol-facts';

import type { LearnText } from './structure';
import type { LearnSection } from './types';

/** 附加在每篇中文文章末尾的共享附錄章節。 */
const answerabilitySections: readonly LearnSection[] = [
  {
    heading: '查閱最新資訊',
    body: [
      '即時週期數據、已驗證合約地址、源代碼和統計均可在官方應用程式中查閱。',
      '會隨時間變化的資訊，請以應用程式中的即時數據為準；協議機制則以學習中心、常見問題、服務條款、安全、審計和風險披露頁面為準。',
    ],
  },
];

/** 中文學習中心文案，以 structure.ts 中的骨架為鍵。 */
export const learnTextZhHk = {
  hub: {
    meta: {
      title: '了解 Cosmic Signature · 鏈上藝術、演繹週期與 Arbitrum',
      description:
        '了解 Cosmic Signature 的運作原理：演繹週期、落筆、CST、三體 NFT 藝術、Arbitrum 合約、錨定、公共物品與風險釋疑。',
    },
    eyebrow: 'Cosmic Signature 學習中心',
    h1: '了解 Cosmic Signature',
    intro:
      '這裏彙集了一組簡明指南，帶你讀懂 Cosmic Signature。這套程序化鏈上藝術協議運行於 Arbitrum；參與者在演繹週期中落筆，共同塑造確定性的三體 NFT 藝術。',
    breadcrumbs: {
      homeLabel: 'Cosmic Signature',
      learnLabel: '學習中心',
    },
    quizCta: {
      heading: '自認已經讀懂協議了？',
      body: '一百道題，三個層級，全部出自白皮書。每道題都附有規則講解與原文章節，方便邊答邊學。',
      linkLabel: '開始知識測驗',
    },
  },
  articleUi: {
    eyebrow: 'Cosmic Signature 學習中心',
    breadcrumbs: {
      ariaLabel: '麵包屑導航',
      homeLabel: 'Cosmic Signature',
      learnLabel: '學習中心',
    },
    lastUpdatedLabel: '最後更新：',
    publisherLabel: '由 Cosmic Signature 發佈',
    relatedResourcesHeading: 'Cosmic Signature 相關資源',
  },
  articles: {
    'what-is-cosmic-signature': {
      title: '什麼是 Cosmic Signature？ · Cosmic Signature',
      description:
        'Cosmic Signature 是運行於 Arbitrum 的程序化鏈上藝術協議；參與者在演繹週期中落筆，共同塑造確定性的三體 NFT 作品。',
      h1: '什麼是 Cosmic Signature？',
      summary:
        'Cosmic Signature 是運行於 Arbitrum 的程序化鏈上藝術協議。參與者在演繹週期中落筆，每一筆都會寫入鏈上記錄，共同塑造由鏈上數據生成的確定性 Cosmic Signature NFT 作品。',
      sections: [
        {
          heading: '簡明定義',
          body: [
            'Cosmic Signature 將鏈上參與、確定性藝術生成與協議分配融為一體。協議運行於 Arbitrum——以太坊 Layer 2 網絡，重要操作和記錄都可在鏈上查驗。',
            '每個演繹週期都會彙集一系列落筆。週期收官後，最終簽名將銘刻為 NFT 作品，週期儲備則按協議規則發放至各條分配軌道，其中包括目前轉撥給 Protocol Guild 的公共物品分配。',
          ],
        },
        {
          heading: '名稱為何重要',
          body: [
            '名稱中的 Signature，指每個週期最終生成的作品。每一筆都會改變週期狀態，並隨最終簽名一同寫入協議歷史。',
            'Cosmic Signature 與生物學中的 COSMIC 癌症突變數據庫或 COSMIC 突變特徵無關。它專注於確定性三體 NFT 藝術，是一套鏈上藝術協議。',
          ],
        },
        {
          heading: '協議有何獨特之處',
          body: [
            'Cosmic Signature 不只是畫廊或智能合約介面。它以演繹週期串聯公開鏈上操作、確定性視覺輸出和分配機制。每個週期的最終簽名都來自公開的共同參與，而非一次孤立的銘刻操作。',
            '理解協議，可以從目前週期、最終簽名、CST、錨定、宇宙議會和公共物品分配這些核心概念入手。所有記錄都可回溯至 Arbitrum。',
          ],
        },
        {
          heading: '如何閱讀公開數據',
          body: [
            '無需連接錢包，也能在應用程式中查看目前週期、統計、分配名錄、合約地址、畫廊和資助記錄。',
            '品牌網站負責解釋機制與術語，應用程式網站提供即時狀態。兩者相互連結，方便讀者從概念說明前往鏈上記錄。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['打開 Cosmic Signature 應用程式', '閱讀常見問題', '查看協議統計'],
    },
    'how-the-performance-cycle-works': {
      title: 'Cosmic Signature 演繹週期如何運作 · Cosmic Signature',
      description:
        '了解 Cosmic Signature 的演繹週期如何在 Arbitrum 上展開，包括校準窗口、落筆、收官和分配軌道。',
      h1: 'Cosmic Signature 演繹週期如何運作',
      summary:
        'Cosmic Signature 的演繹週期是一段開放期：落筆在此彙集，時間機制隨之變化，最終簽名由此誕生，各項分配則由鏈上規則確定。',
      sections: [
        {
          heading: '週期開啟',
          body: [
            `週期以首個 ETH 校準窗口為起點。CST 校準窗口的初始時長為 ${protocolFacts.initialCstCalibrationWindowHours} 小時，之後會隨每次落筆在鏈上動態調整。`,
            `首筆落筆會啟動收官倒數。此後每一筆都會按目前增量延長倒數，並更新週期狀態。ETH 落筆會使 CST 校準窗口縮短約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%；CST 落筆則會使其延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%。`,
          ],
        },
        {
          heading: '週期收官',
          body: [
            '收官倒數結束後，寫下收官之筆的參與者可以收官。專屬窗口結束後，公開收官將向所有人開放。',
            '收官會銘刻週期結果、更新協議歷史，並將週期儲備發放至簽名分配、錨定派發、星選和公共物品分配等軌道。',
          ],
        },
        {
          heading: '為何以週期為核心單位',
          body: [
            '演繹週期讓 Cosmic Signature 形成反覆展開的公共節奏。每一筆都歸入具體週期；每個週期都有開啟狀態、即時倒數、目前價格、參與記錄、收官窗口和分配結果。',
            '這種結構便於驗證。週期尚在推進時，讀者可查看目前狀態；待其收官後，再回來比對分配記錄、畫廊作品與統計。週期編號由此成為連接即時參與和歷史記錄的橋樑。',
          ],
        },
        {
          heading: '週期中會發生哪些變化',
          body: [
            '隨着週期推進，落筆價格、收官倒數、參與 CST 的數量、公共物品記錄和領先狀態都可能變化。目前週期、統計、分配名錄和協調變更等頁面會同步呈現這些記錄。',
            '週期收官後，相關狀態會歸入歷史。最終簽名、獲配記錄、分配取回、已附加 NFT 和公共物品資助也會進入公開檔案，供後續查閱。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['查看目前演繹週期', '查看分配記錄', '閱讀協議常見問題'],
    },
    'how-gestures-work': {
      title: 'Cosmic Signature 的落筆如何運作 · Cosmic Signature',
      description:
        '了解 ETH 落筆、CST 落筆、落筆價格與參與 CST，以及每一筆如何塑造 Cosmic Signature 演繹週期。',
      h1: 'Cosmic Signature 的落筆如何運作',
      summary:
        '落筆是 Cosmic Signature 中的鏈上參與操作，可使用 ETH 或 CST。每一筆都會改變目前演繹週期。',
      sections: [
        {
          heading: '落筆會帶來什麼',
          body: [
            `每一筆都會寫入目前週期，可能銘刻參與 CST，延長收官倒數，併成為最終簽名歷史的一部分。參與 CST 的數量按平方根公式計算：${protocolFacts.dynamicCstRewardFormula}。`,
            `落筆價格會在週期中持續變化。ETH 落筆與 CST 落筆彼此關聯，但各有機制；校準窗口會清楚顯示價格如何變化。每筆 CST 落筆會使 CST 校準窗口延長約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%；每筆 ETH 落筆則會使其縮短約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%。`,
          ],
        },
        {
          heading: '附加 Random Walk NFT',
          body: [
            '參與者可在 ETH 落筆時附加一枚未使用的 Random Walk NFT，以獲得一次落筆價格減免。Random Walk NFT 也可錨定，從而取得錨定 NFT 星選資格。',
            '即使不連接錢包，也能在公共頁面查看這些機制和相關記錄。',
          ],
        },
        {
          heading: '落筆是公開信號',
          body: [
            '落筆是公開的鏈上操作，記錄參與者與目前週期的互動，也會影響這一週期的最終簽名。無論使用 ETH 還是 CST，每一筆都會寫入週期記錄。',
            '每筆記錄都可追溯到參與者地址和發生時間，並顯示參與 CST、附加 NFT、週期延長及後續分配等資訊。',
          ],
        },
        {
          heading: 'ETH、CST 與 Random Walk NFT 的關係',
          body: [
            'ETH 落筆與 CST 落筆相互關聯，但承擔不同作用。ETH 落筆會匯入週期儲備，CST 落筆則透過協議代幣表達參與。應用程式會清楚標註兩條路徑，讓參與者知道目前使用哪種資產，以及它將如何改變週期。',
            '附加 Random Walk NFT 也會寫入公開記錄。未使用的 Random Walk NFT 可在 ETH 落筆時附加，以獲得一次價格減免；已使用的 NFT 會單獨標記，方便事後核對。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['在應用程式中落筆或查看落筆記錄', '了解演繹週期', '查看目前週期數據'],
    },
    'three-body-nft-art': {
      title: 'Cosmic Signature 如何生成三體 NFT 藝術 · Cosmic Signature',
      description:
        '從技術層面了解 Cosmic Signature 如何以鏈上種子與三體物理生成確定性的 NFT 作品。',
      h1: 'Cosmic Signature 如何生成三體 NFT 藝術',
      summary:
        'Cosmic Signature NFT 以鏈上種子為輸入，透過可復現的三體物理渲染管線生成確定性作品。',
      sections: [
        {
          heading: '從鏈上種子到確定性渲染',
          body: [
            '每枚 Cosmic Signature NFT 都保存着可復現作品的種子。渲染管線採用確定性輸入，因此同一種子始終生成相同的簽名作品。',
            '創作過程模擬 3 個天體在牛頓引力下的運動。混沌軌跡化作光譜般的軌道痕跡，由此形成協議鮮明的視覺語言。',
          ],
        },
        {
          heading: '開放且可復現',
          body: [
            '可復現性是這套協議的重要原則。藉助源代碼和渲染管線，任何人都能從種子出發，獨立驗證每件簽名作品。',
            '作品與相關技術均以 CC0 發佈，任何人都可自由使用和改編。',
          ],
        },
        {
          heading: '確定性為何對藝術重要',
          body: [
            '三體系統以運動、引力與不穩定軌跡構成 Cosmic Signature 的視覺語言。確定性至關重要，因為作品必須能從公開輸入復現，而不依賴不透明的託管渲染器。',
            '確定性管線讓收藏者、開發者和研究者能夠驗證簽名圖像是否與種子及渲染代碼一致。源代碼、畫廊、代幣詳情和合約頁面也能相互印證。',
          ],
        },
        {
          heading: '從週期歷史到視覺身份',
          body: [
            '最終簽名不是隨意添加的裝飾。它是演繹週期的視覺終點，週期歷史則賦予圖像文化與協議含義。作品由此成為一段公開過程完成後的可見印記。',
            '藝術作品是協議的一部分，不是脫離協議存在的媒體藏品。週期、代幣、畫廊、渲染管線和公開元數據都指向同一 Cosmic Signature 協議。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['瀏覽 Cosmic Signature 畫廊', '查看源代碼', '閱讀合約與驗證說明'],
    },
    'cosmic-signature-on-arbitrum': {
      title: '運行於 Arbitrum 的 Cosmic Signature · Cosmic Signature',
      description:
        '了解 Cosmic Signature 為何運行於 Arbitrum，以及協議如何藉助以太坊 Layer 2 基礎設施承載鏈上藝術。',
      h1: '運行於 Arbitrum 的 Cosmic Signature',
      summary:
        'Cosmic Signature 運行於 Arbitrum，讓落筆、週期、NFT 記錄與分配都能在以太坊 Layer 2 網絡上完成。',
      sections: [
        {
          heading: '為何選擇 Arbitrum',
          body: [
            'Arbitrum 在承接以太坊安全性的同時，提供成本更低的執行環境。參與者可能反覆落筆並查閱公開狀態，因此這一點對協議尤為重要。',
            '應用程式、合約、統計和畫廊都會明確標註 Arbitrum，方便核對協議所在的網絡。',
          ],
        },
        {
          heading: '為何要明確標註網絡',
          body: [
            'Cosmic Signature 在應用程式各處明確標註 Arbitrum，因為網絡本就是協議身份的一部分。落筆、週期記錄、合約地址、CST、NFT 所有權與分配取回，都需要指向具體網絡，才能獨立查驗。',
            '合約與統計頁面把機制說明連接到鏈上記錄：讀者可以先了解協議，再核實實際數據。',
          ],
        },
        {
          heading: '應用程式頁面如何連接 Arbitrum 記錄',
          body: [
            '應用程式頁面會將原始鏈上記錄和 API 數據整理成易讀資訊。分配頁面說明獲配者與週期結果，錨定頁面說明代幣狀態，公共物品頁面說明資助與取回流向，畫廊則呈現代幣作品。',
            '無需連接錢包或載入完整互動介面，也能了解 Arbitrum 上的協議活動。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['查看已驗證合約', '查看協議統計'],
    },
    'contracts-security-verification': {
      title: 'Cosmic Signature 合約、安全與驗證 · Cosmic Signature',
      description:
        '查閱 Cosmic Signature 智能合約、源代碼、驗證資訊，以及這套 Arbitrum 協議的安全背景。',
      h1: 'Cosmic Signature 合約、安全與驗證',
      summary: 'Cosmic Signature 公開合約與源代碼資訊，便於參與者審視協議機制並驗證鏈上行為。',
      sections: [
        {
          heading: '公開的合約資訊',
          body: [
            '合約頁面是查詢地址、驗證連結、部署詳情和協議資金流向的官方入口。',
            '關鍵資訊會以清晰文字列出，無需連接錢包或打開區塊瀏覽器也能查閱。',
          ],
        },
        {
          heading: '可供驗證的公開入口',
          body: [
            '驗證資訊分佈在多個公開入口。合約頁面列出部署地址與區塊瀏覽器連結，源代碼頁面介紹確定性渲染資源，審計頁面說明審閱狀態，安全頁面則解釋如何查驗官方資源。',
            '核實的時候，應結合這些頁面：合約地址需與部署說明一同查看，安全聲明也應有報告或連結作為依據。站內連結會串聯合約地址、源代碼、風險說明和審計狀態。',
          ],
        },
        {
          heading: '應先核對什麼',
          body: [
            '先在官方應用程式主站打開合約頁面，確認網絡為 Arbitrum；再逐一對照源代碼連結、安全概覽與審計頁面。如尚未發佈審計或形式化驗證報告，頁面會明確標註目前狀態。',
            '已部署事實、已發佈報告、靜態分析、社區審閱和後續工作各有不同，不能混為一談。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['查看合約地址', '打開源代碼資源', '閱讀常見問題'],
    },
    'cst-token-and-cosmic-council': {
      title: 'CST 與宇宙議會 · Cosmic Signature',
      description: '了解 CST 代幣與落筆、協議協調和宇宙議會之間的關係。',
      h1: 'CST 與宇宙議會',
      summary:
        'CST 是 Cosmic Signature 的 ERC-20 代幣。參與落筆時可能銘刻 CST；在宇宙議會中，CST 也可用於協調協議。',
      sections: [
        {
          heading: 'CST 在協議中的作用',
          body: [
            '落筆時可能銘刻參與 CST；CST 也可用於落筆，其價格由專屬校準窗口決定。用於落筆的 CST 會直接銷燬，永久從供應量中移除，不會匯入資金池。',
            '參與 CST 的數量會動態變化：它取決於距上一筆的時間，並採用平方根公式。間隔越久，銘刻量通常越大；連續快速落筆則可能銘刻 0 CST。',
            '完成委託後，CST 可在宇宙議會中用作協調權重；持有者也可將權重委託給自己。參與者依照鏈上規則協調協議變更。',
          ],
        },
        {
          heading: 'CST 如何連接參與與協調',
          body: [
            'CST 用於協議參與和協調。參與者可透過落筆銘刻 CST，也可使用 CST 落筆；完成委託後，CST 則對應宇宙議會中的協調權重。CST 是協議代幣，不代表股權。',
            '在應用程式中，CST 可用於落筆、委託權重和協調協議。相關頁面只說明其協議用途，不暗示價格走勢。',
          ],
        },
        {
          heading: '協調記錄',
          body: [
            '宇宙議會讓 CST 持有者依照鏈上規則協調協議變更。協調變更及相關應用程式頁面會公開參數變更歷史，幫助讀者理解協議如何演進。',
            '為避免相關措辭引發歧義，Cosmic Signature 將這套協調機制稱為「宇宙議會」，並將法律說明與風險披露單獨呈現。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['了解落筆如何運作', '打開應用程式'],
    },
    'anchoring-nfts': {
      title: '錨定 Cosmic Signature NFT · Cosmic Signature',
      description:
        '了解 Cosmic Signature NFT 的錨定機制、ETH 錨定派發，以及 Random Walk NFT 的參與資格。',
      h1: '錨定 Cosmic Signature NFT',
      summary:
        '錨定後，Cosmic Signature NFT 可參與 ETH 錨定派發，Random Walk NFT 則可獲得錨定 NFT 星選資格。',
      sections: [
        {
          heading: '錨定派發',
          body: [
            'Cosmic Signature NFT 可錨定至協議。錨定後，它們會按協議規則參與該週期的 ETH 錨定派發；累積的 ETH 可在解錨時取回。',
            'Random Walk NFT 的錨定用途不同：錨定後可獲得錨定 NFT 星選資格，但不會參與 ETH 錨定派發。',
            '無論 Cosmic Signature 還是 Random Walk，每枚 NFT 都只能錨定一次。解錨時可取回 NFT 和累積的錨定派發，但此後無法再次錨定這枚 NFT。',
          ],
        },
        {
          heading: '錨定公開了什麼',
          body: [
            '無論是剛完成銘刻，還是從其他地址獲得，持有者都可將 NFT 錨定至協議。公開錨定頁面會展示錨定與解錨操作、已錨定代幣數量、派發記錄，以及相關的 Random Walk NFT 活動。',
            '錨定是公開的協議機制。無需連接錢包，也能查看已錨定代幣數量和派發記錄。',
          ],
        },
        {
          heading: 'Cosmic Signature 與 Random Walk NFT 的不同作用',
          body: [
            'Cosmic Signature NFT 錨定後可參與 ETH 錨定派發；Random Walk NFT 錨定後則獲得錨定 NFT 星選資格。未使用的 Random Walk NFT 還可在 ETH 落筆時附加一次，以減免落筆價格。',
            '頁面會清楚標註代幣類型，並連結至統計、畫廊和目前週期頁面，方便核對相關記錄。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['打開錨定工具', '瀏覽畫廊'],
    },
    'protocol-guild-public-goods': {
      title: 'Cosmic Signature 與以太坊公共物品 · Cosmic Signature',
      description:
        '了解 Cosmic Signature 如何將公共物品分配轉撥至 Protocol Guild，為以太坊核心貢獻者提供資助。',
      h1: 'Cosmic Signature 與以太坊公共物品',
      summary:
        'Cosmic Signature 設有公共物品分配軌道，目前會將每個週期的一部分儲備轉撥給 Protocol Guild。',
      sections: [
        {
          heading: 'Protocol Guild 分配',
          body: [
            'Protocol Guild 為 170 多位以太坊核心貢獻者提供資助。Cosmic Signature 目前將公共物品分配轉撥至 Protocol Guild。',
            '這說明公共物品分配是協議設計的一部分，而不是應用程式介面中的附帶說明。',
          ],
        },
        {
          heading: '公共物品為何屬於協議本身',
          body: [
            '公共物品轉撥是協議內的一條固定分配軌道。按現行規則，週期儲備的一部分會轉至公共物品受益方，目前為 Protocol Guild。',
            '公共物品頁面會列出資助、取回和受益方記錄，方便核實資金流向及其與週期參與的關係。',
          ],
        },
        {
          heading: '如何核實公共物品流向',
          body: [
            '公共物品資助頁面記錄存入金額，取回頁面記錄從金庫轉撥的資金；合約頁面提供地址，統計頁面則給出彙總背景。',
            'Cosmic Signature 僅說明公開記錄中的資金流向，不對稅務處理或法律地位作任何暗示。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['查看公共物品資助記錄', '了解週期如何運作'],
    },
    'collecting-and-trading-cosmic-signature': {
      title: '收藏與交易 Cosmic Signature NFT 和 CST · Cosmic Signature',
      description:
        '了解 Cosmic Signature 資產可在哪裏交易：Axiom Zero NFT 市場不收平台費，可在 Arbitrum 上透過 Uniswap 兌換 CST，Chaos Zero 則提供週期預測市場。',
      h1: '收藏與交易 Cosmic Signature',
      summary:
        'Cosmic Signature NFT 可在 Axiom Zero 交易。該市場專注於 Arbitrum 上公平發佈的生成藝術，不收平台費。CST 可在 Uniswap 交易；Chaos Zero 則為每個演繹週期開設預測市場。',
      sections: [
        {
          heading: '資產在哪裏交易',
          body: [
            'Cosmic Signature NFT 是 Arbitrum 上的標準 ERC-721 代幣，主要在 Axiom Zero 交易。Axiom Zero 專注於採用公平發佈機制的生成藝術，不收平台費；每次掛單或成交都透過單筆鏈上交易完成，賣方收到全部成交金額。市場收錄 Cosmic Signature 和 Random Walk 兩個 Axiom Zero 系列，頁面價格均直接來自已驗證的市場合約。',
            'CST 是標準的 ERC-20 代幣，可在 Arbitrum 上透過 Uniswap 交易。兩類資產都採用開放代幣標準，因此任何支援 ERC-721 或 ERC-20 的 Arbitrum 市場或兌換平台都可處理。交易前，務必以官方合約頁面核對地址。',
          ],
        },
        {
          heading: 'Chaos Zero 預測市場',
          body: [
            'Chaos Zero 是專為 Cosmic Signature 構建的預測市場。每個演繹週期只問一件事：這一週期收官時，落筆次數是否會超過上一週期？預測憑證以 CST 計價，並在機制上由 CST 全額覆蓋——每單位 CST 始終可拆分為一枚 YES 代幣和一枚 NO 代幣，一對匹配的代幣也始終可兌換回一單位 CST。',
            '市場根據公開的鏈上落筆次數判定結果。一旦次數超過上一週期總數，結果便已確定；交易會在同一區塊停止，此後只能取回相應資產。Chaos Zero 沒有所有者、管理密鑰或升級路徑。',
          ],
        },
        {
          heading: '錨定狀態如何影響收藏',
          body: [
            '除了作品本身，錨定還為 Cosmic Signature 與 Random Walk NFT 增加了一項會影響收藏判斷的鏈上狀態。每枚 NFT 一生僅可錨定至協議一次，解錨後便永久失去這項資格。尚未錨定的 NFT 仍保留唯一一次錨定機會，收藏者通常會關注這一點。',
            'Axiom Zero 會從錨定合約即時讀取狀態，將每枚代幣標為從未錨定或已錨定；每個系列內也可按該狀態篩選代幣。這樣一來，市場中的代幣說明便與應用程式展示的鏈上錨定記錄保持一致。',
          ],
        },
        {
          heading: '如何核實交易場所與地址',
          body: [
            '交易前，先在應用程式主站的合約頁面確認官方地址，再與市場中的系列地址或兌換平台上的代幣地址逐一比對。應用程式頁眉、頁腳與網站地圖均提供 Axiom Zero、Chaos Zero 和 Uniswap 的官方連結，因此始終可以循着官方導航抵達正確地址。',
            '兌換 CST 與持有預測憑證時也應同樣謹慎：核對代幣地址是否與已公佈的 CST 合約一致。Chaos Zero 會根據協議記錄的公開落筆次數判定預測結果，因此市場的每項輸入都可在 Arbitrum 上獨立查驗。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        '在 Axiom Zero 瀏覽 Cosmic Signature',
        '在 Chaos Zero 研判週期結果',
        '在 Uniswap 用 ETH 兌換 CST',
        '核實合約地址',
        '瀏覽 NFT 畫廊',
      ],
    },
    // lexicon-allow-start: 保留明確的否認措辭。
    'not-a-lottery-not-an-investment': {
      title: 'Cosmic Signature 是彩票、賭場或投資產品嗎？ · Cosmic Signature',
      description: 'Cosmic Signature 是程序化鏈上藝術協議，不是彩票、賭場、賭博產品或投資產品。',
      h1: 'Cosmic Signature 是彩票、賭場或投資產品嗎？',
      summary: 'Cosmic Signature 是程序化鏈上藝術協議。它不是彩票、賭場、賭博產品或投資產品。',
      sections: [
        {
          heading: '直接說明',
          body: [
            '參與者在演繹週期中落筆。週期收官後，協議會按既定軌道發放分配。這裏沒有莊家，沒有荷官，也沒有賭注。',
            'CST 在協議中體現參與和協調權重。它不代表股權、利潤分成、股息或投資合同。Cosmic Signature 不對代幣價格或未來市場走勢作任何陳述。',
          ],
        },
        {
          heading: '為何明確否認',
          body: [
            '本頁直接說明 Cosmic Signature 不屬於彩票、賭場、賭博或投資產品，避免讀者誤解協議性質。',
            '理解 Cosmic Signature，首先要看它是什麼：程序化鏈上藝術協議。參與者落筆，週期收官，確定性作品完成銘刻，分配按公開規則發放。',
          ],
        },
        {
          heading: '如何理解分配措辭',
          body: [
            '這裏所說的分配，是指週期收官後由協議按規則發放的資產，不代表利潤分成、股息權、股權或任何承諾的財務回報。參與前，請閱讀風險披露和服務條款。',
            '無需連接錢包，也能閱讀協議說明、服務條款和風險披露。',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['閱讀服務條款', '閱讀常見問題'],
    },
    // lexicon-allow-end
  },
} satisfies LearnText;
