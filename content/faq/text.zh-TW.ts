import { protocolFacts } from '@/content/protocol-facts';

import type { FAQText } from './structure';

/** protocolFacts stores the example gaps as English strings; render them in zh. */
const ELAPSED_ZH_TW: Record<
  (typeof protocolFacts.dynamicCstRewardExamples)[number]['elapsed'],
  string
> = {
  '0 seconds': '0 秒',
  '1 second': '1 秒',
  '60 seconds': '60 秒',
  '1 hour': '1 小時',
  '1 day': '1 天',
};

/** 中文 FAQ 文案，以 structure.ts 中的骨架為鍵。 */
export const faqTextZhTw = {
  'getting-started': {
    title: '開始使用',
    description: '了解 Cosmic Signature 的基礎知識與參與方式',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature 是什麼？',
        answer:
          'Cosmic Signature 是 Arbitrum 上的程序化鏈上藝術協議。參與者在演繹週期中落筆，每一筆都會塑造這一週期最終的簽名。週期收官後，協議將儲備分配至十餘條軌道，其中包括支持 170 多位以太坊核心貢獻者的 Protocol Guild。',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature 與生物學領域的 COSMIC 資料庫有關嗎？',
        answer:
          '沒有關係。Cosmic Signature 與 COSMIC 癌症突變資料庫及生物學中的 COSMIC 突變特徵均無關聯。它是鏈上藝術協議及應用程式，聚焦由確定性三體運動生成的 NFT 藝術。',
      },
      'how-does-the-bidding-game-work': {
        question: '演繹週期如何運作？',
        answer: `每個週期都以首筆落筆的 ETH 校準窗口開啟。首筆落筆會啟動週期收官倒數，目前預設約為 24 小時。此後每筆 ETH 或 CST 落筆都會把目前時間增量加到鏈上收官時間；該增量初始為 1 小時，並在每個週期收官後增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。倒數結束後，收官之筆的參與者享有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬收官窗口，可完成週期收官並取回簽名分配；在週期實際收官前，仍可繼續落筆。`,
      },
      'what-type-of-gestures-are-available': {
        question: '可以用哪些方式落筆？',
        answer:
          '落筆可使用 ETH 或 CST 代幣（ERC-20）。每個週期的首筆落筆必須使用 ETH；之後可以自由交替使用 ETH 與 CST。ETH 落筆還可附加一枚 Random Walk NFT，使 ETH 落筆價格降低 50%。Cosmic Signature NFT（ERC-721）用於分配與錨定，不能用來支付落筆。CST 落筆使用獨立的校準窗口：窗口執行期間，CST 落筆價格會逐步下降；每筆 ETH 或 CST 落筆又會改變窗口本身的時長。',
      },
      'can-i-participate-without-nfts': {
        question: '沒有 NFT 也能參與嗎？',
        answer:
          '可以。任何人都能在 Cosmic Signature 的演繹週期中落筆。若擁有尚未使用的 Random Walk NFT，也可將其附加至一筆 ETH 落筆，使落筆價格降低 50%。',
      },
      'how-can-i-get-involved': {
        question: '有哪些參與方式？',
        answer:
          '你可以在演繹週期中落筆，也可以將自己專案的 NFT 貢獻給協議，供參與者隨落筆附加。加入 Discord，即可認識其他參與者。',
      },
      'how-long-does-each-round-last': {
        question: '每個演繹週期會持續多久？',
        answer: `首筆 ETH 落筆會開啟週期，並將收官倒數設為目前時間增量的約 24 倍（協議上線時約為 1 天）。此後每筆落筆都會加入目前時間增量；該增量初始恰為 1 小時，並在每個週期收官後增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。因此，只要在收官前持續有人落筆，一個週期就可能遠超 1 天。`,
      },
      'can-i-place-multiple-gestures': {
        question: '一個週期內可以多次落筆嗎？',
        answer:
          '可以。每筆落筆都會增加週期末星選的資格次數，更新你在堅守冠軍與時之勇士軌道中的堅守時段，並塑造不斷演變的簽名；同時還可能向錢包銘刻參與 CST。參與 CST 的數量並不固定，而取決於距上一筆落筆經過了多久：間隔越長，銘刻量越大；連續快速落筆的銘刻量則較少。',
      },
    },
  },
  'allocations-and-rewards': {
    title: '分配與配發',
    description: '了解週期收官後參與者可能獲得的資產',
    items: {
      'what-is-the-main-allocation': {
        question: '什麼是簽名分配？',
        answer:
          '簽名分配由週期收官之筆的參與者獲得，其中包括 1 枚 Cosmic Signature NFT、1,000 CST 的表彰銘刻、週期儲備中 25% 的 ETH，以及該週期內隨參與者落筆附加的所有代幣或 NFT。',
      },
      'what-rewards-per-bid': {
        question: '每次落筆會帶來什麼？',
        answer: `每筆落筆都會紀錄 1 次週期末星選資格，更新堅守窗口對堅守冠軍和時之勇士軌道的貢獻，並可能銘刻參與 CST。參與 CST 按平方根公式計算：${protocolFacts.dynamicCstRewardFormula}。簡單來說，距上一筆落筆越久，數量越多，但增長速度會逐漸放緩。極短間隔可能得到 0 CST；較長的靜默期則可能產生更多 CST 銘刻。`,
      },
      'how-does-the-stellarSelection-work': {
        question: '星選如何運作？',
        answer: `每筆落筆都會紀錄 1 次星選資格。每個週期結束時，智慧合約會從資格池中進行程序化隨機選擇：${protocolFacts.ethStellarSelectionRecipients} 次選擇共同分得週期儲備中 ${protocolFacts.stellarSelectionEthPercentage}% 的 ETH；${protocolFacts.nftStellarSelectionRecipients} 次選擇各獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT；已錨定 Random Walk NFT 中另有 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次選擇，也各獲得 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。選擇採用放回方式，同一地址在同一週期內可能被選中多次。落筆次數越多，被選中的頻次也會增加。`,
      },
      'how-random-selection-works': {
        question: '程序化隨機選擇是怎樣完成的？',
        answer:
          '星選在週期收官時使用鏈上隨機源，包括 Arbitrum 提供的區塊上下文與備用熵源。參與者星選按資格加權：每筆落筆增加 1 次資格，因此落筆越多，被選中的頻次越高。錨定 NFT 星選則是獨立機制，依據已錨定 Random Walk NFT 的資格，而不是參與者落筆資格池。',
      },
      'how-do-i-claim-my-allocation': {
        question: '成為獲配者後，如何取回分配？',
        answer: `獲配者可透過應用程式與協議合約取回分配。週期收官倒數結束後，收官之筆參與者享有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬時間，可完成週期收官並取回簽名分配。此後進入公開收官窗口：任何人都可發起收官交易，智慧合約會把實際完成收官的人視為週期受益方——收官者將獲得整份簽名分配，包括 ETH 份額、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 銘刻、Cosmic Signature NFT，以及對已附加資產的優先權。次級 ETH、已附加代幣與已附加 NFT 會由分配錢包託管，並採用另一項取回超時設定，目前預設為 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 週；超時後，合約允許任何人為自己取回仍未取回的分配。請及時處理。`,
      },
      'how-does-anchoring-work': {
        question: '錨定如何運作？',
        answer: `Cosmic Signature NFT 可錨定至協議，以獲得 ETH 錨定配發：每個已收官週期會劃出週期儲備的 ${protocolFacts.anchorDistributionPercentage}%，按當時已錨定的 Cosmic Signature NFT 數量平均分配；累積的 ETH 會在解錨時配發。Random Walk NFT 也可以錨定，但只用於取得錨定 NFT 星選資格——被選中的錨定者會獲得 CST 與 Cosmic Signature NFT，而不是 ETH。還需注意兩條規則：每枚 NFT 永遠只能錨定一次（解錨後不可再次錨定）；若週期收官時沒有任何 Cosmic Signature NFT 處於錨定狀態，該週期的 ${protocolFacts.anchorDistributionPercentage}% 會留在週期儲備中。CST（ERC-20）不能錨定。可從帳戶選單進入「我的錨定」頁面管理錨定。`,
      },
      'what-are-marketing-rewards': {
        question: '什麼是推廣儲備？',
        answer: `幫助推廣協議可獲得 CST 代幣（ERC-20）。推廣儲備每個週期銘刻 ${protocolFacts.outreachReserveCst.toLocaleString('zh-TW')} CST，並將其發放給生態貢獻者。具體方式可在 Discord 聯絡推廣託管人。`,
      },
      'how-many-nfts-minted': {
        question: '每個週期會銘刻多少枚 Cosmic Signature NFT？',
        answer: `絕大多數週期會銘刻 ${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT：簽名分配獲配者、CST 收官之筆獲配者、堅守冠軍與時之勇士各 1 枚；參與者 NFT 星選獲配者共 ${protocolFacts.nftStellarSelectionRecipients} 枚；透過錨定 NFT 星選選出的 Random Walk NFT 錨定者共 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 枚。這 ${protocolFacts.typicalNftsPerCycle} 份 NFT 分配還會各附帶 ${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST。若某週期沒有 CST 落筆或沒有已錨定的 Random Walk NFT，對應的銘刻便會在該週期跳過。`,
      },
      'what-happens-to-remaining-eth': {
        question: '週期儲備中剩餘的 ETH 會怎樣處理？',
        answer:
          '約一半的週期儲備會作為滾動儲備進入下一個演繹週期，提高下一週期的起始餘額。協議讓儲備滾動累積，而非將其抽走。',
      },
      'what-happens-to-attached-assets': {
        question: '隨落筆附加的代幣或 NFT 會怎樣處理？',
        answer: `隨落筆附加的 ERC-20 代幣或 ERC-721 NFT 由分配錢包合約託管，不會進入 ETH 週期儲備。週期收官後，週期受益方（通常為收官之筆參與者）享有優先取回權。若超出次級取回期限仍無人取回，目前預設期限為 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 週，合約將允許任何人為自己取回這些資產。`,
      },
      'who-receives-10-percent': {
        question: '週期儲備中的公共財分配會發給誰？',
        answer:
          '週期收官時，週期儲備的 7% 會轉入公共財金庫；此後任何人都可將金庫餘額轉給已配置的公共財受益方。目前受益方為 Protocol Guild，這是支持 170 多位以太坊核心貢獻者的集體資助機制。目前，受益方地址由協議所有者設定；待協議所有權交由宇宙議會後，設計目標是由議會決定受益方。',
      },
    },
  },
  'game-mechanics': {
    title: '週期機制',
    description: '深入了解落筆時機與協議規則',
    items: {
      'how-does-price-increase': {
        question: '一個週期內，落筆價格如何變化？',
        answer:
          'ETH 與 CST 落筆價格各自遵循獨立的鏈上路徑。ETH 落筆價格先經過 ETH 校準窗口，此後每筆 ETH 落筆都會使價格階梯式上調。CST 落筆價格則在目前 CST 校準窗口中逐步下降。CST 窗口並非固定：ETH 落筆會使其略微縮短，CST 落筆會使其略微延長，因此價格路徑會隨兩類參與的比例而變化。',
      },
      'what-is-dutch-auction': {
        question: '什麼是校準窗口？',
        answer: `校準窗口是價格發現時段，落筆價格會在已知時長內從校準上限線性下降。ETH 與 CST 使用彼此獨立、下限不同的窗口：ETH 落筆價格最低約降至上限的 1/${protocolFacts.ethCalibrationFloorDivisor}；CST 落筆價格則可一路降至 ${protocolFacts.cstCalibrationFloorCst}，若窗口完整走完，便可能以 0 CST 落筆。CST 校準窗口目前以 ${protocolFacts.initialCstCalibrationWindowHours} 小時為初始參考，但其時長儲存在鏈上，並會在每筆落筆後改變：每筆 CST 落筆會使窗口增加約 ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%，每筆 ETH 落筆會使其減少約 ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%。`,
      },
      'how-is-participation-cst-calculated': {
        question: '參與 CST 如何計算？',
        answer: `參與 CST 按距上一筆落筆的時間，以平方根公式計算：${protocolFacts.dynamicCstRewardFormula}。採用平方根，是為了讓較長的靜默期獲得更多 CST，同時避免數量永遠線性增長。按協議上線時恰為 1 小時的時間增量計算，示例約為：${protocolFacts.dynamicCstRewardExamples.map((example) => `${ELAPSED_ZH_TW[example.elapsed]}後為 ${example.cst} CST`).join('、')}。每個週期收官後，時間增量會增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，因此即時數量會隨時間逐漸略低於這些示例。落筆實際成交時，應以應用程式中的即時預覽和合約計算為準。`,
      },
      'why-minimum-cst-reward-protection': {
        question: '什麼是最低 CST 銘刻保護？',
        answer:
          '提交落筆前，應用程式會預覽預計獲得的參與 CST，並把你願意接受的最低 CST 數量傳送給合約。若另一筆落筆搶先成交，預計數量可能改變；如果最終銘刻量低於你設定的下限，最低 CST 銘刻保護可以阻止交易。你也可以選擇接受任意數量，包括 0 CST；此時只要價格檢查通過，落筆便可繼續。',
      },
      'how-cst-calibration-window-changes': {
        question: '每筆落筆如何改變 CST 校準窗口？',
        answer: `每筆 ETH 或 CST 落筆都會更新鏈上儲存的 CST 校準窗口。CST 落筆會把窗口延長「目前時長 / ${protocolFacts.cstCalibrationWindowChangeDivisor}」，整數截斷前約為 +${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%；ETH 落筆會把窗口縮短約「目前時長 / ${protocolFacts.cstCalibrationWindowChangeDivisor + 1}」，約為 -${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%。窗口越短，CST 落筆價格下降越快；窗口越長，下降越慢。`,
      },
      'what-is-open-finalization-window': {
        question: '什麼是公開收官窗口？',
        answer: `週期收官倒數結束後，收官之筆參與者享有 ${protocolFacts.finalGestureExclusivityHours} 小時的專屬收官時間。若未在該窗口內完成收官，任何人都可發起收官交易，智慧合約會把實際收官者設為週期受益方。收官者將獲得完整的簽名分配，包括 ETH 份額、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST、Cosmic Signature NFT，以及對已附加資產的優先權。因此，收官之筆參與者應在專屬窗口結束前完成收官。即使該參與者離開，公開收官機制也能讓協議繼續執行。`,
      },
      'what-is-endurance-champion': {
        question: '什麼是堅守冠軍？',
        answer:
          '一個週期內，保持「最近一筆落筆者」身份時間最長的參與者，即下一筆落筆出現前擁有最長連續間隔的人，會成為堅守冠軍。週期收官時，堅守冠軍將獲得 1,000 CST 的表彰銘刻與 1 枚 Cosmic Signature NFT。',
      },
      'what-is-final-cst-gesture': {
        question: '什麼是 CST 收官之筆？',
        answer:
          'CST 收官之筆是一個週期中最後一筆使用 CST 完成的落筆。週期收官時，完成該筆落筆的參與者將獲得 1,000 CST 的表彰銘刻與 1 枚 Cosmic Signature NFT。',
      },
      'what-is-chrono-warrior': {
        question: '什麼是時之勇士？',
        answer: `時之勇士是在堅守冠軍位置上連續保持最久的參與者。堅守冠軍對應保持「最近一筆落筆者」身份最久的人，時之勇士則對應保持堅守冠軍身份最久的人。週期收官時，時之勇士將獲得週期儲備中 ${protocolFacts.chronoWarriorEthPercentage}% 的 ETH、${protocolFacts.specialAllocationCst.toLocaleString('zh-TW')} CST 與 1 枚 Cosmic Signature NFT。`,
      },
      'does-time-per-bid-stay-same': {
        question: '每筆落筆增加的時間始終相同嗎？',
        answer: `不會。協議上線時，每筆落筆增加的時間恰為 1 小時；此後每當一個週期收官，增量都會增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。由於增量變大也會拉長每個週期，按日曆時間看，這種增長會自然放緩。`,
      },
      'why-time-per-bid-increases': {
        question: '為什麼每筆落筆增加的時間會逐步增長？',
        answer:
          '這一機制會限制 Cosmic Signature NFT 的長期銘刻速度。週期越慢，單位時間內進入流通的新 NFT 越少，從而維持稀缺性。',
      },
      'how-time-increase-affects-game': {
        question: '落筆時間增量上升會怎樣影響協議？',
        answer:
          '隨著每筆落筆增加的時間變長，週期的平均持續時間也會延長。這一變化循序漸進，既保持平穩的參與體驗，也限制長期範圍內 Cosmic Signature NFT 的總供應增長。',
      },
      'what-if-two-gestures-same-time': {
        question: '兩筆落筆同時提交會怎樣？',
        answer:
          'Arbitrum 的排序器會決定交易順序。每筆落筆都按執行時的協議狀態檢查；後一筆仍可能成功，但前一筆可能改變落筆價格或參與 CST 銘刻量。若變化超出你設定的保護範圍，交易就會還原。',
      },
      'is-there-game-theory': {
        question: '參與 Cosmic Signature 是否需要策略？',
        answer:
          '需要。落筆時機、頻率和方式（ETH、CST 或附加 Random Walk NFT）都會影響各條分配軌道的結果。協議機制與參與者之間的互動允許多種策略在不同軌道上發揮作用。',
      },
    },
  },
  'tokens-and-nfts': {
    title: '代幣與 Cosmic Signature',
    description: '了解 CST、鏈上藝術與數字資產',
    items: {
      'what-are-cst-and-dao': {
        question: 'CST 代幣與宇宙議會是什麼？',
        answer:
          '每筆落筆都可能銘刻 CST 代幣；CST 用於表達宇宙議會中的協調權重。議會在鏈上協調協議：CST 持有者可以提交協調提案，並表達支持或反對。要啟用權重，需先把 CST 委託給自己或其他地址。待合約所有權交由議會後，議會按設計將管理協議參數，包括決定哪個公共財受益方獲得 7% 的分配；目前這些設定仍由協議所有者管理。',
      },
      'what-can-i-do-with-cst': {
        question: 'CST 代幣有哪些用途？',
        answer:
          'CST 可透過 CST 校準窗口替代 ETH 用於落筆；落筆消耗的 CST 會被銷燬（永久移出供應量），而不會匯入資金池。落筆也可能銘刻參與 CST，但數量會隨距上一筆落筆的時間動態變化。完成委託後（可以委託給自己），CST 還可用於表達宇宙議會中的協調權重。',
      },
      'what-makes-nfts-unique': {
        question: 'Cosmic Signature NFT 有何獨特之處？',
        answer:
          'Cosmic Signature NFT 完全位於鏈上，並可持續獨立生成。每枚 NFT 都銘刻了智慧合約隨機生成並儲存的種子；影像與影片由開源 Rust 流水線根據該種子渲染。種子決定三個天體的初始條件，從而為每枚 NFT 產生獨一無二的混沌軌跡。',
      },
      'how-are-nft-images-created': {
        question: 'NFT 影像是怎樣生成的？',
        answer:
          '每枚 Cosmic Signature NFT 都以牛頓引力下的三體問題為主題。流水線模擬三個天體在引力作用下的運動，並在 380 至 700 奈米範圍內以 64 個波長區間對軌跡進行光譜渲染，為每枚 NFT 生成獨特的混沌圖案。',
      },
      'significance-of-random-seed': {
        question: '為什麼每枚 NFT 都由鏈上種子生成？',
        answer:
          '基於種子的流水線可確保作品長期可復現。有些 NFT 專案的影像依賴中心化伺服器，而每枚 Cosmic Signature NFT 的種子都儲存在 Arbitrum 上。任何人都能隨時使用開源 Rust 流水線獨立重新生成 NFT 影像和影片，逐畫素與原作一致。',
      },
      'is-nft-supply-limited': {
        question: 'Cosmic Signature NFT 的數量有限嗎？',
        answer: `合約沒有硬性供應上限。每個週期收官後，落筆時間增量會增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，通常會使週期變長、NFT 銘刻節奏放緩。實際銘刻速度也取決於參與情況。`,
      },
      'impact-of-limiting-nfts': {
        question: 'NFT 供應增速受限會帶來什麼影響？',
        answer:
          '不斷增長的落筆時間增量與逐步放緩的銘刻速度會維持稀缺性。每一枚新 Cosmic Signature NFT，都是協議累計歷史中愈發少見的一段切片。',
      },
      'connection-with-randomwalknft': {
        question: 'Cosmic Signature 與 Random Walk NFT 有什麼關聯？',
        answer:
          'Random Walk NFT 持有者可將一枚尚未使用的代幣附加至一筆 ETH 落筆，使 ETH 落筆價格降低 50%。Random Walk NFT 錨定者還會在每個週期取得錨定 NFT 星選資格。',
      },
      'how-to-trade-nfts-tokens': {
        question: '如何交易或出售 Cosmic Signature NFT 與 CST？',
        answer:
          'Cosmic Signature NFT 可在 Axiom Zero（axiomzero.market）交易；這是專為 Cosmic Signature 與 Random Walk NFT 打造的零手續費 NFT 市場。CST 則可在 Arbitrum 上的 Uniswap 交易。二者分別是標準 ERC-721 與 ERC-20 資產，因此任何支援相應標準的 Arbitrum 市場或交易平台也可使用，包括 OpenSea。',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: '在哪裡可以買賣 Cosmic Signature NFT？',
        answer:
          '主要平台是 Axiom Zero（https://www.axiomzero.market/cosmic-signature），這是 Arbitrum 上面向公平啟動生成藝術的零手續費 NFT 市場。掛單與成交均直接在鏈上結算，出售方會收到全部成交金額；每個代幣頁面還會即時讀取錨定合約並顯示 NFT 的錨定狀態。未曾錨定的代幣會為下一位持有者保留一次錨定機會。',
      },
      'cosmic-signature-prediction-market': {
        question: 'Cosmic Signature 有預測市場嗎？',
        answer:
          '有。Chaos Zero（https://chaoszero.com）是專為 Cosmic Signature 構建的預測市場。每個演繹週期都會提出一個問題：本週期收官時的落筆次數是否會超過上一週期？所有頭寸以 CST 計價，並按機制完全抵押；市場依據公開的鏈上落筆次數結算，不設所有者或管理金鑰。',
      },
      'participate-dao-without-bidding': {
        question: '不落筆也能參與宇宙議會嗎？',
        answer:
          '可以。你可以在受支援的平台取得 CST，委託給自己或其他地址後，即可在宇宙議會中表達協調權重。落筆仍是銘刻新 CST 的主要方式。',
      },
      'donate-nfts-to-game': {
        question: '其他 NFT 專案如何向某個週期貢獻代幣？',
        answer:
          '專案方可在落筆介面的「進階選項」面板中附加 ERC-721 或 ERC-20 代幣。填寫合約地址、代幣 ID 或數量後提交落筆。附加的代幣會由分配錢包託管，並在週期收官後流向簽名分配獲配者。',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrum 與技術',
    description: '網路設定、錢包與技術細節',
    items: {
      'what-is-arbitrum': {
        question: 'Arbitrum 是什麼？Cosmic Signature 為什麼部署在這裡？',
        answer:
          'Arbitrum 是以太坊 Layer 2 彙總網路，旨在以更低成本處理交易。Cosmic Signature 使用它來支援頻繁的鏈上互動。費用會隨網路狀況變化，Arbitrum 也有自身的執行與結算規則。',
      },
      'why-arbitrum-not-ethereum': {
        question: '為什麼選擇 Arbitrum，而不是以太坊主網？',
        answer:
          '越來越多的鏈上活動正在遷移至 Layer 2。Arbitrum 大幅降低燃料費，同時沿用以太坊 Layer 1 的安全模型，非常適合需要頻繁落筆的 Cosmic Signature 協議。',
      },
      'arbitrum-security': {
        question: 'Arbitrum 為什麼能獲得以太坊 Layer 1 級別的安全性？',
        answer:
          'Arbitrum 是彙總網路，而不是側鏈。每批交易都會發布回以太坊主網，因此 Arbitrum 的安全性錨定在以太坊本身：資料與爭議解決均位於 Layer 1。',
      },
      'how-to-get-eth-on-arbitrum': {
        question: '如何在 Arbitrum 上取得 ETH？',
        answer:
          '可使用 Arbitrum 官方跨鏈橋或其他受支援的跨鏈橋，把 ETH 從以太坊主網轉入 Arbitrum。ETH 會鎖定在以太坊上，並在 Arbitrum 上生成等額可用餘額。跨鏈過程需要支付以太坊 Layer 1 燃料費。',
      },
      'existing-wallet-on-arbitrum': {
        question: '現有的以太坊錢包能在 Arbitrum 上使用嗎？',
        answer:
          '可以。同一組私鑰可在兩個網路上籤署交易，只需把 Arbitrum 新增到錢包的網路列表即可。',
      },
      'view-tokens-on-arbitrum': {
        question: '如何檢視 Arbitrum 上的 CST 與 Cosmic Signature NFT？',
        answer:
          '可以直接在 Cosmic Signature 網站檢視，也可手動把合約地址新增至錢包。所有合約地址都公佈在「合約」頁面與社群 Discord 中。',
      },
      'trade-on-arbitrum': {
        question: '可以在 Arbitrum 上交易 Cosmic Signature NFT 與 CST 嗎？',
        answer:
          '可以。Cosmic Signature NFT 可在該系列的零手續費市場 Axiom Zero 交易，CST 可在 Uniswap 交易。二者分別是 Arbitrum 上的標準 ERC-721 與 ERC-20 資產，因此任何支援這些標準的市場或交易平台也可使用。交易前請務必核對合約地址。',
      },
      'verify-bid-success': {
        question: '如何確認落筆已成功提交？',
        answer:
          '成功的落筆會在 Arbitrum 上得到確認，並顯示在 Arbitrum 區塊瀏覽器 Arbiscan 中。將交易雜湊貼上至瀏覽器，即可驗證這筆落筆。',
      },
      'game-security': {
        question: '協議如何保障安全？',
        answer:
          'Cosmic Signature 公開合約地址、原始碼資源與驗證背景，便於社群獨立檢查協議行為。智慧合約已由獨立安全機構 Hacken 完成審計，完整報告見「審計」頁面。',
      },
      'fees-involved': {
        question: '參與需要支付哪些費用？',
        answer:
          '除落筆價格外，每筆交易還需支付 Arbitrum 網路燃料費。燃料費會隨網路狀況波動，不由 Cosmic Signature 控制。',
      },
    },
  },
  'trust-and-governance': {
    title: '信任與協調',
    description: '了解透明度、團隊權限與開源願景',
    items: {
      'team-controls': {
        question: '團隊對協議擁有哪些控制權限？',
        answer:
          '初期，團隊可以調整部分協議參數，例如落筆時間增量或分配軌道比例。這些權限透過智慧合約的 Ownable 模式實現，並限定在週期間窗口：下一個週期一旦啟用（啟用發生在首筆落筆之前），核心協議參數便會鎖定，直至該週期收官。鎖定期間仍保留少量範圍更窄的權限：所有者可把週期啟用推遲至首筆落筆到來，也可隨時調整下一週期前的延遲，並隨時管理外圍合約（公共財金庫受益方、NFT 後設資料 URI 與分配錢包取回期限）。協議合約還可由所有者透過 UUPS 升級，但只能在週期間進行；目前部署的是已公開驗證的 V2 實現。',
      },
      'will-team-always-have-control': {
        question: '團隊會一直控制協議參數嗎？',
        answer:
          '不會。協議穩定後，所有權將移交宇宙議會。此後，參數只能透過達到協調法定權重的協議協調提案變更。',
      },
      'what-is-renounce-ownership': {
        question: '「放棄所有權」是什麼意思？',
        answer:
          '放棄所有權是 Ownable 合約的一項函式，會永久把控制權從部署者地址移走。呼叫後，任何特權角色都無法再修改合約參數。',
      },
      'why-renounce-ownership': {
        question: '團隊為什麼會放棄所有權？',
        answer:
          '目標是讓協議保持公平與去中心化。放棄所有權可確保協議上線後，規則不能被任意更改，從而增強參與者對協議的信任與可預期性。',
      },
      'how-team-profits': {
        question: 'Cosmic Signature 團隊如何從協議中獲得價值？',
        answer:
          '參與者落筆所支付的 ETH 不會進入任何團隊錢包。所有 ETH 都匯入週期儲備，並按各條分配軌道發放。團隊透過持有 Random Walk NFT 與協議間接保持利益一致；協議成功可能提升這些 NFT 的文化價值。團隊的主要動力是好奇心、創造力，以及為開源公共財作出貢獻。',
      },
      'why-was-cs-created': {
        question: '為什麼要建立 Cosmic Signature？',
        answer:
          'Cosmic Signature 源於對混沌理論與三體問題無解析解特性的著迷。由鏈上種子生成獨特而確定的藝術，既引人入勝，也契合支持公共財的協議理念。',
      },
      'what-if-team-disappears': {
        question: '如果團隊不再維護專案，會怎樣？',
        answer:
          '協議按可持續獨立執行的目標設計。種子儲存在鏈上，任何人都可以使用開源 Rust 流水線重新生成 NFT 影像與影片。無論團隊狀態如何，每枚 Cosmic Signature NFT 都能持續存取。',
      },
      'can-create-competing-site': {
        question: '可以復刻程式碼並搭建自己的網站嗎？',
        answer:
          '當然可以。專案自有的合約、著色器、渲染器、頁面與文件均採用 CC0 1.0，不保留任何權利。第三方依賴、字型與素材仍適用各自的授權條款；詳見 THIRD_PARTY_NOTICES.md。',
      },
      'donate-to-pot': {
        question: '不落筆也能向週期儲備貢獻 ETH 嗎？',
        answer:
          '可以。協議合約提供獨立於落筆的專用貢獻函式，可接收 ETH，也可附加備註並顯示在週期貢獻列表中。請使用應用程式內的貢獻流程，不要直接從錢包向協議地址轉帳：直接傳送至協議地址的 ETH 會被處理為 ETH 落筆，而不是貢獻。詳情可透過 Discord 諮詢。',
      },
      'get-help': {
        question: '遇到問題時，如何獲得幫助？',
        answer: '可使用「關於」頁面列出的官方 Discord、X / Twitter 連結或支援信箱聯絡我們。',
      },
      'stay-updated': {
        question: '如何關注 Cosmic Signature 的最新動態？',
        answer: '關注官方社交媒體並加入 Discord 社群，即可取得最新公告、協議協調提案與週期回顧。',
      },
    },
  },
} satisfies FAQText;
