import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('zh-TW');

/**
 * 高階層文案：邊界情形、對抗性推演、升級歷史、渲染管線與安全設計。
 * 鍵為 structure.ts 中的骨架題目 id。
 */
export const hardQuestionsTextZhTw = {
  'late-gesture-semantics': {
    prompt: '倒數一分鐘前已經歸零，但還沒有人收官。Fen 悄悄落下一筆。這一筆究竟做了什麼？',
    options: {
      a: '把一個增量加到鏈上儲存的收官時間上，並接任收官之筆——但不會讓時鐘從頭再來。',
      b: '從當下時刻起完整重啟倒數。',
      c: '交易回滾——到期後不可能再落筆。',
      d: '這一筆計入下一個週期。',
    },
    explanation:
      '延長作用於鏈上儲存的收官時間，而非當下時刻。倒數已過、收官尚未執行時，落筆依然有效：它把儲存值再推一個增量，並接任收官之筆。時鐘永不重啟——這正是到期後的接任始終如履薄冰的原因。',
    referenceLabel: '白皮書 §3.2 · 收官倒數',
  },
  'refusing-beneficiary': {
    prompt: '一個自動化合約錢包握有收官之筆，卻被寫成拒收一切 ETH。它呼叫收官。會發生什麼？',
    options: {
      a: `簽名分配轉帳失敗，它自己的交易回滾——${protocolFacts.finalGestureExclusivityHours} 小時後，其他任何人都可收官並接過受益方角色。`,
      b: '收官成功，ETH 悄然丟失。',
      c: '收官成功，它的 ETH 份額滾入下一週期。',
      d: '協議暫停，等待所有者介入。',
    },
    explanation:
      '簽名分配在收官時直接送達受益方，拒收 ETH 的受益方只會讓自己的收官交易回滾。協議毫不在意：專屬窗口一過，公開收官窗口開啟，任何人都可收官並親自成為受益方。惡意錢包只能破壞自己的位置。',
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'refusing-chrono': {
    prompt: '一個拒收一切 ETH 的合約以時之勇士的身份走完了週期。它為什麼無法阻塞週期收官？',
    options: {
      a: '它的 ETH 存入分配錢包託管，收官從不依賴這位獲配方接受轉帳。',
      b: '收官會反覆重試轉帳，直到被接受。',
      c: '它的份額被跳過，滾入下一週期。',
      d: '宇宙議會把這份額改道給其他地址。',
    },
    explanation:
      '取回優先於送達：次級 ETH 分配存入托管，而非在收官時直接傳送，任何獲配方合約都無法藉此阻塞週期落幕。這個惡意錢包的 ETH 在分配錢包裡等著——若長期無人取回，最終會成為任何人都可取回的分配。',
    referenceLabel: '白皮書 §11.2 · 防禦式設計',
  },
  'public-goods-transfer-fails': {
    prompt: '收官過程中，公共財轉撥無法完成。協議怎麼辦？',
    options: {
      a: '收官照常進行，事件記錄在案，留待後續處理。',
      b: '整個收官回滾，直到轉帳成功。',
      c: '這份額被銷燬。',
      d: '這份額被悄悄併入受益方的分配。',
    },
    explanation:
      '容錯轉撥是刻意的設計選擇：公共財金庫出問題，絕不能讓週期擱淺。收官照常完成，失敗記錄在鏈上，轉撥事後處理。對比受益方的直接送達——那筆轉帳確實會回滾，但只回滾呼叫者自己的交易。',
    referenceLabel: '白皮書 §11.2 · 防禦式設計',
  },
  'no-anchored-nfts': {
    prompt: '某週期收官時，沒有任何已錨定的 Cosmic Signature NFT。錨定配發怎麼辦？',
    options: {
      a: `該週期的 ${protocolFacts.anchorDistributionPercentage}% 被跳過，這部分份額滾入下一週期。`,
      b: '改為轉撥給公共財。',
      c: '先留存，待有人錨定後補發。',
      d: '在星選獲配者之間分攤。',
    },
    explanation:
      '收官時若沒有任何已錨定的 Cosmic Signature NFT，錨定配發將跳過，這部分份額隨滾動儲備滾入下一週期。不為未來的錨定者留存任何東西——每個週期的發放只看收官那一刻的錨定集合。',
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'no-cst-gestures': {
    prompt: '某週期結束時沒有一筆 CST 落筆。哪條分配軌道受影響？如何處理？',
    options: {
      a: '該週期完全跳過 CST 收官之筆軌道。',
      b: '它的 CST 與 NFT 轉給最後一筆 ETH 落筆的參與者。',
      c: '在有人用 CST 落筆之前，週期無法收官。',
      d: `它的 ${cst(protocolFacts.specialAllocationCst)} CST 被銷燬以示抗議。`,
    },
    explanation:
      '沒有 CST 落筆的週期直接跳過 CST 收官之筆軌道——不會另立替補獲配者，收官照常進行。同樣的「跳過而不替補」原則也適用於沒有錨定的週期裡的錨定 NFT 星選。',
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'randomness-sources': {
    prompt: '星選與藝術種子背後的隨機性來自哪裡？',
    options: {
      a: '一個鏈上構造：摺疊上一區塊雜湊、目前基礎費與來自 Arbitrum 預編譯合約的熵，再以 keccak256 逐個匯出隨機值。',
      b: '一份 Chainlink VRF 預言機訂閱。',
      c: '週期參與者之間的提交-揭示儀式。',
      d: '每次收官前由團隊提交的種子。',
    },
    explanation:
      '種子把上一區塊雜湊、目前基礎費與來自 ArbSys 和 ArbGasInfo 預編譯合約的 Arbitrum 專屬熵（上一 Arbitrum 區塊雜湊、gas 積壓量與 L1 計價計數器）摺疊在一起。這是有意的極簡：不引入預言機，不依賴外部委員會，也沒有任何可能讓週期擱淺的回撥。',
    referenceLabel: '白皮書 §11.3 · 隨機性',
  },
  'randomness-limits': {
    prompt: '關於這種隨機性的侷限，白皮書明確承認了什麼？',
    options: {
      a: '排序器理論上可以影響區塊級輸入；設計限定了這種影響所能觸及的範圍。',
      b: '沒有侷限——這個構造對所有人都可證明不可預測。',
      c: '隨機性偶爾會失敗，導致週期作廢。',
      d: '落筆多的參與者能夠預測選擇結果。',
    },
    explanation:
      '取捨擺在明處：排序器理論上可以影響區塊級輸入。設計限定了影響的邊界——隨機性的消費者只有星選與藝術種子，整個構造每次收官只使用一次，而收官本身是任何人都能提交的公開交易。',
    referenceLabel: '白皮書 §11.3 · 隨機性',
  },
  'precompile-unavailable': {
    prompt: '收官那一刻，某個 Arbitrum 預編譯合約不可用。隨機性構造會怎樣？',
    options: {
      a: '預編譯呼叫具備容錯性；構造退回其餘來源繼續。',
      b: '收官回滾，直到預編譯恢復。',
      c: '週期每小時重試一次，直到成功。',
      d: '由所有者提供替代種子。',
    },
    explanation:
      '每個熵來源在設計上都是可選的：某個預編譯呼叫不可用時，構造就摺疊其餘來源。這一主題貫穿協議——任何外部事物，哪怕是 Arbitrum 自己的預編譯合約，都不得挾持收官。',
    referenceLabel: '白皮書 §11.3 · 隨機性',
  },
  'v2-flat-cst-problem': {
    prompt: `V1 每筆固定銘刻 ${cst(100)} CST。V2 為什麼要改用平方根公式？`,
    options: {
      a: '固定銘刻讓機器速度的連續落筆淪為憑空生成 CST 的手段；新規則按耐心銘刻，而非按頻次。',
      b: '參與者抱怨固定數額太少。',
      c: '簡化公式是為了節省 gas。',
      d: '為了給團隊做一次性分配。',
    },
    explanation:
      '固定銘刻之下，一串急促的落筆僅憑速度就能憑空造出 CST。平方根規則之下，這樣的連擊幾乎什麼都銘刻不到，創造供應的是耐心的參與——這個公式本身就是一道供應閘門，而不只是一條定價曲線。',
    referenceLabel: '白皮書 §12.2 · V2 升級',
  },
  'v2-min-imprint-guard': {
    prompt: 'V2 給每個落筆方法加了一項參數：參與者可接受的最低參與 CST 數額。它是幹什麼用的？',
    options: {
      a: '避免簽名與執行之間的時間差造成損失——若銘刻量將低於這個下限，這一筆直接回滾。',
      b: '讓參與者付費索取額外 CST。',
      c: '限定一個週期能銘刻的 CST 總量。',
      d: '這是議會控制的一項落筆稅。',
    },
    explanation:
      '參與 CST 取決於距上一筆的時間——而在你簽名與交易執行之間，若他人搶先落筆，這段間隔會驟然縮短。最低銘刻保護讓參與者說出自己的下限，把一次無聲的失望變成一次乾淨的回滾。',
    referenceLabel: '白皮書 §12.2 · V2 升級',
  },
  'v2-exclusivity-change': {
    prompt: 'V2 對收官之筆參與者的專屬收官窗口做了什麼？',
    options: {
      a: `由 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時延長至 ${protocolFacts.finalGestureExclusivityHours} 小時。`,
      b: `縮短到 ${protocolFacts.initialCycleTimeIncrementHours} 小時，加快週期節奏。`,
      c: '取消了——收官立即向所有人開放。',
      d: '改為無限期——永遠只有收官之筆參與者能收官。',
    },
    explanation: `V2 把專屬窗口從 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時翻倍至 ${protocolFacts.finalGestureExclusivityHours} 小時——這是對真實行為的回應：人會睡覺、出行、忘記截止時間。窗口依然有限，因為協議不為任何人無限期停留。`,
    referenceLabel: '白皮書 §12.2 · V2 升級',
  },
  'v2-timing-loophole': {
    prompt: 'V2 的時序加固堵住了一個漏洞。是什麼漏洞？',
    options: {
      a: '到期後近乎免費的 CST 落筆可以反覆外推截止時間；如今延長一律作用於鏈上儲存的收官時間。',
      b: 'ETH 落筆可以跨週期重放。',
      c: '所有者可以在週期中途暫停倒數。',
      d: '已錨定的 NFT 可以在一筆交易裡解錨再錨定。',
    },
    explanation:
      'CST 價格降到近零時，到期後的落筆幾乎不要錢——若每一筆都從當下時刻起延長，幾個小錢就能把週期無限拖下去。把延長錨定在鏈上儲存的時間堵住了這個漏洞；同一次升級還加固了排定下一週期的算術，任何參數組合都無法阻止週期收官。',
    referenceLabel: '白皮書 §12.2 · V2 升級',
  },
  'v3-what-changes': {
    prompt: '規劃中的 V3 升級只改一件事。是什麼？',
    options: {
      a: '晚出手的代價：最後 20 分鐘內，一切落筆價格都乘上一個從 1 倍攀升至 10 倍的溢價係數。',
      b: '藝術管線換用新的渲染器。',
      c: '移除 CST 落筆。',
      d: '重新調整各分配比例。',
    },
    explanation:
      'V3 只動終局：週期收官時間前的最後 20 分鐘內，一切落筆價格——ETH、附加 Random Walk NFT 的 ETH、CST——都乘上一個按多項式從 1 倍攀升至 10 倍的溢價係數。協議的其餘部分保持 V2 的定義不變。',
    referenceLabel: '白皮書 §12.3 · 規劃中的 V3 升級',
  },
  'v3-shape': {
    prompt: 'V3 的溢價是 m(t) = 1 + 9·(t/T)⁸。八次方的指數為什麼重要？',
    options: {
      a: '溢價在窗口的大部分時間裡幾乎無感，只在最後陡然直立——距收官 10 分鐘約 1.04 倍，5 分鐘約 1.9 倍，1 分鐘約 7 倍，到點 10 倍。',
      b: '它讓溢價在整個窗口內線性上升。',
      c: '它讓整個窗口都按 10 倍計價。',
      d: '它隻影響 CST 落筆。',
    },
    explanation:
      '八次方曲線把幾乎全部漲幅壓縮到最後幾分鐘：貫穿窗口的普通參與幾乎無感，壓哨突襲卻要付出高價。線性曲線會向整個窗口徵價，固定 10 倍會一視同仁——正是這個指數，讓溢價精確瞄準卡點者。',
    referenceLabel: '白皮書 §12.3 · 規劃中的 V3 升級',
  },
  'v3-overtime': {
    prompt: 'V3 之下，Zed 等到截止時間過後才在超時階段落筆。適用什麼溢價？',
    options: {
      a: '足額 10 倍——溢價到點即達 10 倍，超時落筆一律按 10 倍計。',
      b: '沒有溢價——超時落筆回到 1 倍。',
      c: '最高值的一半，5 倍。',
      d: 'V3 之下超時落筆被完全禁止。',
    },
    explanation:
      '溢價攀升到 10 倍後便停在那裡，超時落筆一律按 10 倍計。到期後的接任依然可行——V2 的儲存時間規則仍然管轄時鐘——但在 V3 之下，它們是昂貴的表態，而非免費的偷襲。',
    referenceLabel: '白皮書 §12.3 · 規劃中的 V3 升級',
  },
  'owner-mid-cycle': {
    prompt: '週期進行中，所有者想改一個比例、再升級合約。此刻所有者究竟能做什麼？',
    options: {
      a: '什麼也做不了——週期執行期間核心參數全部鎖定，合約不可升級；所有者的操作只存在於週期之間的縫隙裡。',
      b: '可以立即改比例，但不能改程式碼。',
      c: '可以升級合約，但不能改參數。',
      d: '有宇宙議會會籤就都可以。',
    },
    explanation:
      '週期執行期間，所有者不能更改比例、增量或價格，也不能升級合約。協議刻意不設任何在週期進行中修改合約的機制，無論情形如何——參與者行動時所見的規則，就是結算週期的規則。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'owner-cannot-reach': {
    prompt: '下列哪些是所有者即使在週期之間也能觸碰的？',
    options: {
      a: '都不能：託管中的分配、已銘刻的 NFT、已紀錄的種子與 CST 餘額，全部超出一切所有者權限。',
      b: '託管中的分配可以，其餘不行。',
      c: '已紀錄的種子可以，用於修復有問題的作品。',
      d: '緊急情況下可以動 CST 餘額。',
    },
    explanation:
      '任何所有者權限都觸不到託管中的分配、已銘刻的 NFT、已紀錄的種子或任何人的 CST 餘額——也沒有任何團隊錢包從落筆中收取 ETH。所有者真正的權限很窄：週期之間的時間調整，以及後設資料 URI、金庫受益方這類外圍管理。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'owner-endgame': {
    prompt: '按白皮書的承諾，所有者角色如何謝幕？',
    options: {
      a: '剩餘升級完成後，特權控制將永久離開部署者地址——或轉交宇宙議會，或直接放棄所有權，具體方式提前公佈。',
      b: '永不謝幕；團隊無限期保留維護角色。',
      c: '出售給權重最高的議會委託人。',
      d: '永久移交給一個公司多籤。',
    },
    explanation:
      '承諾是明確的：以 V3 為首的剩餘升級完成後，所有者角色將永久離開部署者，具體方式提前公佈。自那時起，任何私人主體都無法再升級協議或更改參數——而這一程序的每一步都在鏈上公開可見，包括最後一步。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'postpone-activation-limit': {
    prompt: '所有者想把下一週期的啟用時間向後推。這項權限的邊界在哪裡？',
    options: {
      a: '只在該週期的首筆落筆到來之前有效——首筆一落，這項權限即告失效。',
      b: '任何時刻都能暫停週期，包括進行中。',
      c: '需要一份議會提案先行透過。',
      d: '根本不存在這樣的權限。',
    },
    explanation:
      '推遲下一週期啟用是隨時可用的三項窄權限之一——但僅限其首筆落筆到來之前。有人落筆的那一刻，週期便已啟程，所有者手裡的時間槓桿隨之消失。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'no-team-eth': {
    prompt: '團隊經手的唯一固定流是什麼？團隊又從落筆中收取多少 ETH？',
    options: {
      a: `每週期進入推廣儲備的 ${cst(protocolFacts.outreachReserveCst)} CST——而且沒有任何團隊錢包從落筆中收取 ETH，一分也沒有。`,
      b: '每筆落筆中的一小部分 ETH。',
      c: '每第十個週期的簽名分配。',
      d: '什麼都沒有，包括 CST。',
    },
    explanation: `推廣儲備每週期接收 ${cst(protocolFacts.outreachReserveCst)} CST 用於社群推廣——這是團隊經手的唯一一條固定流，且不附帶任何特殊權限。至於 ETH，白皮書說得斬釘截鐵：沒有團隊錢包從落筆中收取 ETH。`,
    referenceLabel: '白皮書 §7.1 · 銘刻規則',
  },
  'art-integrator': {
    prompt: '三體模擬用什麼數值方法積分？這個選擇為何重要？',
    options: {
      a: '四階 Yoshida 辛積分器——它能在長時間尺度上保持系統的能量行為。',
      b: '簡單的 Euler 步進——夠快，畫畫足夠了。',
      c: '一個近似軌道的神經網路。',
      d: '三體方程的解析解。',
    },
    explanation:
      '辛積分器尊重哈密頓系統的幾何結構，能量在上百萬步中不會漂移——軌道在整段模擬裡保持物理上的誠實。也不存在解析解可以抄近路：三體問題沒有一般解析解，而這正是整件藝術的立足點。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-candidates': {
    prompt: '管線如何挑出最終成為簽名的那條軌道？',
    options: {
      a: '十萬組候選構型各推進一百萬個物理步，再由 Borda 排序聚合按混沌程度與三角形等邊程度打分，選出視覺上最有意味的一條。',
      b: '用第一條隨機生成的軌道，原樣上陣。',
      c: '由團隊逐週期人工挑選。',
      d: '銘刻後由 NFT 持有者表決選定。',
    },
    explanation:
      '種子生成十萬組候選構型；每組推進一百萬個物理步；Borda 排序聚合按混沌與等邊兩項指標選出最出挑的一條。每個階段都是種子的純函式——遴選由演算法完成，任何人都能一模一樣地復現。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-color': {
    prompt: '三個天體的色彩如何確定？',
    options: {
      a: '在 OKLab 感知色彩空間中混合，各天體色相相隔 120°，並由漂移與正弦波調變。',
      b: '每幅簽名固定使用紅、綠、藍三色。',
      c: '從真實星雲照片中取樣。',
      d: '銘刻時由 NFT 的第一位所有者挑選。',
    },
    explanation:
      '色彩在 OKLab 中混合——在這個感知色彩空間裡，數值上等距的顏色在人眼看來差異也相等——各天體色相相隔 120°，彼此始終分明。與種子之後的一切一樣，配色是確定性的。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-spectral': {
    prompt: '軌跡為何呈現出那樣的質感？',
    options: {
      a: '光譜渲染：從 380 至 700 奈米劃分 64 個波長區間，以隨速度變化的線寬和景深渲染軌跡。',
      b: '加了輝光濾鏡的扁平向量筆畫。',
      c: '物理模擬器的截圖，再交給 AI 放大。',
      d: '在模擬之上手工調校的樣條曲線。',
    },
    explanation:
      '渲染器把光當作光譜，而非三條顏色通道：可見光範圍內的 64 個波長區間、隨速度變化的線寬、營造縱深的景深。AgX 色調對映、輝光、OpenSimplex 星雲層與色彩分級共同完成畫面。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-output': {
    prompt: '管線為每枚 NFT 輸出什麼檔案？',
    options: {
      a: '一張 16 位元 PNG 與一段 30 秒 H.265 影片。',
      b: '只有一張 JPEG 縮圖。',
      c: '一張動態 GIF。',
      d: '一個 SVG 向量檔案。',
    },
    explanation:
      '每幅簽名交付一張 16 位元 PNG——每通道色深是常規的兩倍——外加一段 30 秒的 H.265 軌道運動影片。兩者都可以由任何人用鏈上種子跑一遍開源管線重新生成。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-server-death': {
    prompt: '與專案相關的所有伺服器明天全部消失。作品會怎樣？',
    options: {
      a: '每幅簽名都能從鏈上重生——種子在鏈上，管線是公開的。',
      b: '藝術丟失；只有後設資料倖存。',
      c: '只有錢包裡的縮圖倖存。',
      d: '取決於 IPFS 固定是否有人維護。',
    },
    explanation:
      '種子全部在鏈上，渲染管線開源且確定，這個系列因此不依賴任何伺服器。任何人都能僅憑鏈上資料逐畫素重新生成任何一幅簽名——這是一個 NFT 系列所能給出的最強存續承諾。',
    funFact: '持續整合逐幀斷言渲染結果的 SHA-256 雜湊——管線哪怕意外漂移一個畫素，構建都會失敗。',
    referenceLabel: '白皮書 §6.2 · 可復現性與許可',
  },
  'art-naming': {
    prompt: '所有者對自己的 Cosmic Signature NFT 有哪些自定義空間？',
    options: {
      a: '可在鏈上為它命名，最長 32 位元組——作品本身永不改變。',
      b: '可以重擲一次種子。',
      c: '可以調整配色。',
      d: '可以延長影片時長。',
    },
    explanation:
      '所有者可在鏈上紀錄一個最長 32 位元組的名字。自定義空間到此為止：種子、軌道、配色與影片在銘刻那一刻永久固定——確定性是這個系列的核心承諾，重擲種子會將其擊碎。',
    referenceLabel: '白皮書 §6.2 · 可復現性與許可',
  },
  'art-license': {
    prompt: '專案自有的合約、著色器與渲染管線以什麼授權發布？',
    options: {
      a: 'CC0 1.0——獻入公有領域，不保留任何權利。',
      b: '團隊持有的專有授權。',
      c: 'GPL-3.0，衍生作品必須開源。',
      d: '每枚 NFT 各自持有的單獨授權。',
    },
    explanation:
      '專案自有程式碼均以 CC0 1.0 獻入公有領域，不保留任何權利：任何人都可以復刻合約、渲染器或網站。第三方依賴保留各自的授權。就連白皮書本身也是 CC0。',
    referenceLabel: '白皮書 §6.2 · 可復現性與許可',
  },
  'seed-derivation': {
    prompt: 'NFT 的藝術種子在何時、如何產生？',
    options: {
      a: '銘刻時由合約從鏈上資料匯出 32 位元組種子，與 NFT 一同儲存；一個 SHA3-256 生成器讓此後的一切都是它的純函式。',
      b: '收官前由藝術家為每枚 NFT 上傳種子。',
      c: '種子就是所有者的錢包地址。',
      d: '每次渲染都會重新取一個種子。',
    },
    explanation:
      '種子在銘刻時於鏈上匯出，並與 NFT 永久儲存。它初始化一個 SHA3-256 隨機數生成器，此後的每個選擇——候選軌道、鏡頭、色彩——都是它的純函式。今天渲染，或十年後渲染：同一種子，同一幅簽名。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'hacken-findings': {
    prompt: 'Hacken 對合約的獨立安全審查結論是什麼？',
    options: {
      a: '共 23 項發現：無嚴重級，無高危級，中危 3 項、低危 8 項、資訊級 12 項——多數是附書面理由接受的設計取捨。',
      b: '數項嚴重級發現至今未修復。',
      c: '零發現，任何級別都沒有。',
      d: '報告從未發布。',
    },
    explanation:
      '這次審查於2026年1月發布，覆蓋核心協議、CST 代幣、兩個 NFT 整合、錨定錢包與配套合約。對這種規模的系統，「零發現」本身才是危險訊號；真正重要的是嚴重度分佈——無嚴重級、無高危級——以及報告全文公開這一事實。',
    referenceLabel: '白皮書 §11.1 · 獨立審查',
  },
  'hacken-invariants': {
    prompt: '人工審查之外，Hacken 的模糊測試檢驗了什麼？',
    options: {
      a: '14 項系統不變數——例如協議持有的 ETH 總額必須始終等於存入減去發放——全部在 10,000 次執行中保持成立。',
      b: '常見交易的 gas 消耗。',
      c: '藝術管線的確定性。',
      d: '前端渲染效能。',
    },
    explanation:
      '模糊測試用生成的輸入反覆衝擊系統，同時斷言必須永遠成立的性質。Hacken 形式化了 14 項這樣的不變數，全部在 10,000 次執行中保持成立——這與逐行審查是兩種不同的證據，專門瞄準沒有人想到要試的狀態。',
    referenceLabel: '白皮書 §11.1 · 獨立審查',
  },
  'verification-tooling': {
    prompt: '外部審查之外，程式碼儲存庫還帶有哪些驗證工具？',
    options: {
      a: 'Certora 形式化驗證規範、Solidity SMTChecker 配置、Slither 靜態分析，以及一套以全覆蓋為目標的測試。',
      b: '什麼都沒有——外部審查是唯一的檢查。',
      c: '一套私下執行的閉源測試。',
      d: '每次發布前的人工測試。',
    },
    explanation:
      '這些層層疊加：形式化驗證規範（Certora）、SMT 檢查、靜態分析（Slither）、覆蓋率導向的測試——再加上 Hacken 的審查與模糊測試。沒有哪個工具能證明一切，這正是嚴肅專案全都要跑一遍的原因。',
    referenceLabel: '白皮書 §11.1 · 獨立審查',
  },
  'sourcify-status': {
    prompt: '已部署合約的原始碼驗證狀態如何？',
    options: {
      a: '已在 Sourcify 上以精確匹配狀態完成驗證（鏈 ID 42161），地址固定於白皮書附錄。',
      b: '未驗證——只能信任位元組碼。',
      c: '只驗證了代理，沒有驗證實現。',
      d: '只在測試網上驗證過，主網沒有。',
    },
    explanation:
      '全部合約都在 Sourcify 上以精確匹配狀態完成驗證（鏈 ID 42161）——這是最嚴格的驗證等級：鏈上位元組碼與公開原始碼逐位元組一致，連後設資料也不例外。代理地址是協議的永久地址，實現只會經由公開升級流程更替。',
    referenceLabel: '白皮書 §11.4 · 公開驗證',
  },
  reentrancy: {
    prompt: '一個惡意合約試圖借回調在交易中途重入協議。擋住它的是什麼？',
    options: {
      a: '重入防護覆蓋核心合約的每個外部入口。',
      b: '什麼也沒有——協議指望獲配方守規矩。',
      c: '一份由議會管理的可信合約名單。',
      d: '僅憑 gas 上限就讓重入不可能發生。',
    },
    explanation:
      '核心合約的每個外部入口都有重入防護——這是防禦式設計清單上的第一條。再加上次級分配的託管取回模式，價值合約那條經典攻擊面被關上了兩次。',
    referenceLabel: '白皮書 §11.2 · 防禦式設計',
  },
  'intercycle-locks-why': {
    prompt: '為什麼週期執行期間合約不可升級——哪怕出了緊急情況？',
    options: {
      a: '刻意如此：協議不設任何在週期進行中修改合約的機制，無論情形如何——參與者行動時所見的規則永遠可查。',
      b: '週期中途升級的 gas 太貴。',
      c: '這是代理模式的技術限制。',
      d: '議會一致同意即可升級。',
    },
    explanation:
      '週期間鎖定是寫進合約的準則，不是技術上的偶然——UUPS 代理在技術上隨時可以升級。協議選擇讓週期中途的修改不可能發生：參與者落筆時看到的規則，就是結算這個週期的規則。',
    referenceLabel: '白皮書 §12.1 · V1：上線',
  },
  'cst-checkpoints': {
    prompt: 'CST 如何為提案快照協調權重？',
    options: {
      a: '基於時間戳的檢查點——提案快照對應鐘表時間，而非區塊高度。',
      b: '基於區塊高度的檢查點，和多數 Governor 部署一樣。',
      c: '在每次表達權重的當下即時讀取。',
      d: '每個週期收官時統一快照一次。',
    },
    explanation:
      '代幣採用基於時間戳的檢查點，提案快照對應的是鐘錶時間。在區塊節奏與以太坊主網不同的 L2 上，時間戳是更穩的參照——一個讓協調時間線保持可預期的細微抉擇。',
    referenceLabel: '白皮書 §7.3 · 協調權重',
  },
  'dust-refund': {
    prompt: 'Pia 的 ETH 落筆多付了幾 wei——低於灰塵閾值。差額怎麼辦？',
    options: {
      a: '留在儲備中：這麼小的退款，gas 都不夠抵。',
      b: '出於原則，照樣退回。',
      c: '累積到一個個人餘額裡。',
      d: '為保護她，這一筆直接回滾。',
    },
    explanation:
      '超出灰塵閾值的超付在同一筆交易中退回；低於閾值時，差額留在儲備中，因為退款本身燒掉的 gas 比退回的錢還多。一處微小而誠實的不對稱——寫在明處，而非藏起來。',
    referenceLabel: '白皮書 §4.1 · ETH 落筆',
  },
  'rwlk-not-transferred': {
    prompt: 'Sol 為降價附加了他的 Random Walk NFT。之後這枚 NFT 在哪裡？',
    options: {
      a: '仍在他的錢包裡——合約只是將其標記為已使用；它從未被轉移或託管。',
      b: '託管在分配錢包裡，直到週期結束。',
      c: '被銷燬，換取降價。',
      d: '轉移給協議，收官後歸還。',
    },
    explanation:
      'Random Walk NFT 從不移動：合約記下「已使用」，並應用程式降價。被消耗的是這個標記——每枚一生一次，橫跨所有週期——一個數量固定的外部系列由此融入協議經濟，而協議不必保管任何東西。',
    referenceLabel: '白皮書 §4.2 · 附加 Random Walk NFT',
  },
  'open-finalization-carries': {
    prompt: '公開收官窗口期間，從未落過一筆的 Quill 完成了收官。她究竟得到什麼？',
    options: {
      a: '受益方角色的一切：簽名分配的 ETH 份額、CST 銘刻、NFT，以及對已附加資產的優先權。',
      b: '一筆固定的收官款項，分配仍歸收官之筆參與者。',
      c: '只有 NFT；ETH 滾入下一週期。',
      d: '什麼也沒有——收官是義務勞動。',
    },
    explanation:
      '公開收官窗口內，合約把實際收官者視為週期受益方，一步到位——ETH 份額、CST 銘刻、NFT，以及對附加資產的優先權。Quill 從頭到尾無需落過一筆。缺席的收官之筆參與者失去的是整個角色，而非其中一角。',
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'attached-priority-timeout': {
    prompt: '受益方對已附加資產的優先權能持續多久？',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} 週——公開取回期限一過，任何人都可取回。`,
      b: '永久——附加資產無限期等待受益方。',
      c: `${protocolFacts.finalGestureExclusivityHours} 小時，與收官窗口一致。`,
      d: '直到下一個週期收官。',
    },
    explanation: `附加資產在分配錢包中的期限與其他託管分配相同：${protocolFacts.secondaryRetrievalTimeoutWeeks} 週。窗口內受益方優先；窗口過後，資產向第一位來者開放。${protocolFacts.finalGestureExclusivityHours} 小時管的是收官權，不是託管。`,
    referenceLabel: '白皮書 §5.4 · 發放、託管與期限',
  },
  'eth-window-duration-drift': {
    prompt: 'ETH 校準窗口的下行需要多久？這個時長是固定的嗎？',
    options: {
      a: '按上線參數約兩天——但時長與週期時間增量掛鉤，會隨協議年歲緩慢拉長。',
      b: `永遠固定 ${protocolFacts.finalGestureExclusivityHours} 小時。`,
      c: `固定 ${protocolFacts.initialCstCalibrationWindowHours} 小時，與 CST 窗口的基準一致。`,
      d: '活躍度越高，每個週期越短。',
    },
    explanation: `按上線參數，整段下行約需兩天；若窗口走完仍無人落筆，價格便停在底價等待。時長與時間增量掛鉤——增量每週期增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%——窗口因此隨協議逐漸舒展的節拍一同拉長，而非一成不變。`,
    referenceLabel: '白皮書 §3.1 · 開場與 ETH 校準窗口',
  },
  'first-cycle-opening': {
    prompt: '第一個週期沒有前任可供校準。它如何開場？',
    options: {
      a: `以固定的 ${protocolFacts.initialGestureCostEth} ETH。`,
      b: '以議會選定的 1 ETH。',
      c: '免費——第一筆什麼都不用付。',
      d: '按部署 gas 費用的兩倍。',
    },
    explanation: `沒有上一週期的開場價可以翻倍，第一個週期便以固定的 ${protocolFacts.initialGestureCostEth} ETH 開場——刻意定得極小，讓市場透過 ${protocolFacts.ethGestureCostStepUpPercent}% 的步進與週期間校準自己把價格走出來，而不是由誰來猜一個發行價。`,
    referenceLabel: '白皮書 §3.1 · 開場與 ETH 校準窗口',
  },
  'selection-entry-scaling': {
    prompt: '本週期 Bea 落筆 30 次，Cal 落筆 3 次。關於 ETH 星選，下列哪項為真？',
    options: {
      a: 'Bea 的資格在池中出現的頻次是 Cal 的十倍，放回方式下她甚至可能被選中多次——但 Cal 完全可能被選中。',
      b: 'Bea 保底至少被選中一次。',
      c: 'Cal 被排除在外；只有頭部參與者才有資格。',
      d: '兩人機會完全相同——每個地址一次資格。',
    },
    explanation:
      '資格隨落筆累積——入選頻次與參與程度成正比——且選擇採用放回方式。沒有人有保底，也沒有落過筆的人會被排除：星選池按活躍度加權，不設門檻，也不搞配給。',
    referenceLabel: '白皮書 §5.3 · 星選',
  },
  'recognition-vs-participation': {
    prompt: 'CST 經三條途徑進入流通。哪一條由團隊經手？它附帶什麼權限？',
    options: {
      a: `只有推廣儲備每週期的 ${cst(protocolFacts.outreachReserveCst)} CST——而且不附帶任何特殊權限。`,
      b: '表彰 CST，由團隊指定給偏愛的參與者。',
      c: '參與 CST，團隊可逐筆調整。',
      d: '三條途徑都由團隊經手。',
    },
    explanation: `三條途徑是：參與 CST（落筆時按公式銘刻）、表彰 CST（收官時隨每份 NFT 發放 ${cst(protocolFacts.specialAllocationCst)} CST），以及推廣儲備（每週期 ${cst(protocolFacts.outreachReserveCst)} CST）。只有最後一條由團隊經手——而它只是普通 CST，不附帶任何特殊權限，用於社群推廣。`,
    referenceLabel: '白皮書 §7.1 · 銘刻規則',
  },
  'finalization-actions': {
    prompt: '收官是一筆交易。它究竟做了什麼？',
    options: {
      a: '讀取一次協議的 ETH 餘額，發放各分配軌道，銘刻本週期的 NFT 與 CST，為每件作品紀錄種子，並排定下一週期。',
      b: '只轉出受益方的 ETH；其餘事後處理。',
      c: '只銘刻 NFT；ETH 發放分成多筆交易陸續完成。',
      d: '啟動一個由團隊經手、歷時數日的結算流程。',
    },
    explanation:
      '一筆交易結清整個週期：讀取一次 ETH 餘額，發放第 5 節的各條軌道（受益方與公共財直接送達，其餘託管），銘刻 NFT 與 CST 並紀錄種子，排定下一週期。原子性正是要點——不存在「收官到一半」的狀態。',
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'chrono-vs-endurance-trap': {
    prompt:
      '週期前段，Nyx 以最近落筆者身份堅守了六小時。隨後 Orin 堅守了九小時，但他的紀錄在收官前只保持了片刻，而 Nyx 的紀錄曾保持兩天。兩個頭銜各歸誰？',
    options: {
      a: 'Orin 是堅守冠軍（單段間隔最長）；Nyx 長時間保持紀錄，很可能拿下時之勇士。',
      b: 'Nyx 雙冠——兩天勝過一切。',
      c: 'Orin 雙冠——更大的間隔通吃。',
      d: '兩個頭銜都歸收官之筆參與者。',
    },
    explanation:
      '堅守衡量你創造的間隔——Orin 的九小時勝過 Nyx 的六小時。時之勇士衡量堅守冠軍頭銜被保持的時長：Nyx 在位兩天才被 Orin 刷新，而 Orin 的在位只延續到收官。兩條軌道刻意褒揚不同形態的堅持，並且都要到收官那一刻才塵埃落定。',
    referenceLabel: '白皮書 §5.2 · 堅守冠軍與時之勇士',
  },
  'anchored-rwlk-weighting': {
    prompt: 'Vale 錨定了五枚 Random Walk NFT，Wynn 錨定了一枚。錨定 NFT 星選如何對待他們？',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 次選出按各錨定者錨定的 NFT 數量加權——Vale 的權重是 Wynn 的五倍。`,
      b: '每位錨定者恰好一次，與數量無關。',
      c: '按各枚 NFT 錨定的先後加權。',
      d: 'Vale 與 Wynn 平分這些選出。',
    },
    explanation: `錨定 NFT 星選每週期在已錨定的 Random Walk NFT 中選出 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，權重按各錨定者錨定的數量計。每次攜帶 ${cst(protocolFacts.specialAllocationCst)} CST 與一枚 Cosmic Signature NFT——不含 ETH，ETH 配發專屬於已錨定的 Cosmic Signature NFT。`,
    referenceLabel: '白皮書 §5.3 · 星選',
  },
  'voluntary-vault-contributions': {
    prompt: '除了每週期的轉撥，ETH 還能透過別的途徑進入公共財金庫嗎？',
    options: {
      a: '能——金庫也接受週期之外的自願 ETH 貢獻。',
      b: '不能——只有收官能向金庫轉入 ETH。',
      c: '只有所有者能為金庫注資。',
      d: '自願貢獻只能用 CST。',
    },
    explanation: `在鏈上強制執行的每週期 ${protocolFacts.publicGoodsPercentage}% 之外，金庫也直接接受自願 ETH 貢獻。機械轉撥定下底線；有心多出一份力的人，不必等待任何一次收官。`,
    referenceLabel: '白皮書 §10 · 公共財',
  },
  'risk-honesty': {
    prompt: '下列哪一條是白皮書自己的風險章節所承認的？',
    options: {
      a: '審查與形式化分析都不構成保證——任何持有價值的軟體都可能存在未知缺陷。',
      b: '合約已被數學證明不含任何缺陷。',
      c: '風險只存在到 V3 升級上線為止。',
      d: '唯一真正的風險是以太坊本身失敗。',
    },
    explanation:
      '風險因素毫不粉飾：智慧合約風險在每一輪審查之後依然存在；隨機性有明說的邊界；期限是真實的截止時間；去中心化完成之前，參數仍可能在週期間調整；資產價值會波動。應把落筆當作為參與和藝術付出的花費——這是白皮書自己的措辭。',
    referenceLabel: '白皮書 §14.2 · 風險因素',
  },
} as const satisfies QuizTierQuestionsText<'hard'>;
