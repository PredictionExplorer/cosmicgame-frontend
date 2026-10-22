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
      '核心合約轉入金庫失敗時，會記錄失敗並可將份額留在儲備，不必回退整個收官，也沒有自動重試。已在金庫的 ETH 仍須另一筆無須許可的交易轉出。其他必要轉帳失敗仍可能讓收官回退。',
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
      a: '一個鏈上構造：摺疊上一區塊雜湊、目前基礎費與來自 Arbitrum 預編譯合約的熵，再以 keccak256 逐個衍生隨機值。',
      b: '一份 Chainlink VRF 預言機訂閱。',
      c: '週期參與者之間的提交-揭示儀式。',
      d: '每次收官前由團隊提交的種子。',
    },
    explanation:
      '種子把上一區塊雜湊、目前基礎費與來自 ArbSys 和 ArbGasInfo 預編譯合約的 Arbitrum 專屬熵（上一 Arbitrum 區塊雜湊、gas 積壓量與 L1 計價計數器）摺疊在一起。這是有意的極簡：不引入預言機，不依賴外部委員會，也沒有任何可能讓週期擱淺的回呼。',
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
      '參與 CST 取決於距上一筆的時間。在簽名與交易執行之間，若他人先落筆，這段間隔就會縮短。最低銘刻保護讓參與者事先設定下限：實際銘刻量低於下限時，交易會還原。',
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
    prompt: '已部署的 V3 調整了哪些機制？',
    options: {
      a: '參與 CST 的公式與收取對象、參與者星選權重、CST 下降速率、臨近收官溢價，以及分配比例和主要 NFT 數量。',
      b: '藝術管線換用新的渲染器。',
      c: '移除 CST 落筆。',
      d: '只有分配比例改變，其他機制完全不變。',
    },
    explanation:
      'V3 已部署：參與 CST 改由下一筆向上一筆參與者線性發放；參與者星選採基礎價格權重，並加入下降速率調整、臨近收官溢價及新的分配設定。',
    referenceLabel: '白皮書 §12.3 · 已部署的 V3',
  },
  'v3-shape': {
    prompt: 'V3 臨近收官溢價為何採用八次方曲線？',
    options: {
      a: '讓漲幅集中在窗口後段，目前參數下最終總價最高約為基礎價格的 5 倍。',
      b: '它讓溢價在整個窗口內線性上升。',
      c: '整個窗口從開始就統一採用最高總價。',
      d: '它隻影響 CST 落筆。',
    },
    explanation:
      '溢價在目前時間增量的最後三分之一逐步增加，八次方讓大部分漲幅集中在接近截止時。實際計算包含整數截斷，目前最大溢價約為基礎價格的 4 倍，加上基礎價格後合計約 5 倍。',
    referenceLabel: '白皮書 §12.3 · 已部署的 V3',
  },
  'v3-overtime': {
    prompt: 'V3 之下，Zed 等到截止時間過後才在超時階段落筆。適用什麼溢價？',
    options: {
      a: '維持截止時的封頂溢價，目前參數下總價約為基礎價格的 5 倍；零 CST 基礎價格仍為零。',
      b: '沒有溢價——超時落筆回到 1 倍。',
      c: '超過截止時間後，價格繼續無限成長。',
      d: 'V3 之下超時落筆被完全禁止。',
    },
    explanation:
      '截止時間之後，溢價維持封頂值。落筆仍可執行，並把目前增量加到舊的收官時間，不會從現在重新計時；延長後時間仍可能已過。',
    referenceLabel: '白皮書 §12.3 · 已部署的 V3',
  },
  'owner-mid-cycle': {
    prompt: '週期進行中，所有者想改一個比例、再升級合約。此刻所有者究竟能做什麼？',
    options: {
      a: '比例調整與升級都必須等到週期間進行；週期運作期間，核心參數保持鎖定。',
      b: '可以立即改比例，但不能改程式碼。',
      c: '可以升級合約，但不能改參數。',
      d: '有宇宙議會會籤就都可以。',
    },
    explanation:
      '週期運作期間，所有者不能更改核心分配比例、時間增量或落筆價格，也不能升級協議合約。部分外圍設定等較窄權限，則有各自的適用條件。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'owner-cannot-reach': {
    prompt: '下列哪些是所有者即使在週期之間也能觸碰的？',
    options: {
      a: '文件所列的管理函式都不能直接改動這些資產的歸屬或重寫這些紀錄。',
      b: '託管中的分配可以，其餘不行。',
      c: '已紀錄的種子可以，用於修復有問題的作品。',
      d: '緊急情況下可以動 CST 餘額。',
    },
    explanation:
      '文件所列的管理函式不會直接改動託管分配、已銘刻 NFT 的歸屬、已紀錄的種子或 CST 餘額。在交出特權控制前，所有者仍保有另行揭露的週期間升級權限。',
    referenceLabel: '白皮書 §13 · 全面去中心化之路',
  },
  'owner-endgame': {
    prompt: 'V3 會自動移交或移除所有者權限嗎？',
    options: {
      a: '不會。每個所有者角色都須分別執行鏈上移交或放棄操作，沒有自動期限。',
      b: '首個 V3 週期結束後，所有權限自動消失。',
      c: '出售給權重最高的議會委託人。',
      d: '永久移交給一個公司多籤。',
    },
    explanation:
      '所有者權限目前仍保留。移交宇宙議會或放棄所有權都須分別透過鏈上交易完成，合約沒有自動執行的時間表。',
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
      a: '推廣儲備按設定接收 CST，目前 ETH 分配沒有獨立團隊份額。',
      b: '每筆落筆中的一小部分 ETH。',
      c: '每第十個週期的簽名分配。',
      d: '什麼都沒有，包括 CST。',
    },
    explanation:
      '目前 ETH 分配沒有獨立團隊份額。推廣儲備的 CST 由任命的託管人發放，團隊相關地址仍可依相同規則參與。沒有獨立 ETH 份額不代表沒有管理權限，也不保證任何財務結果。',
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
      '辛積分器保持哈密頓系統的幾何結構，適合維持長時間模擬中的能量穩定性，但不保證每一步都精確滿足能量守恆。三體問題沒有一般解析解，因此管線採用數值積分。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-candidates': {
    prompt: '管線如何挑出最終成為簽名的那條軌道？',
    options: {
      a: '依設定模擬候選軌道，由 Borda 排序建立候選清單，再透過影像層面的審美檢查。',
      b: '用第一條隨機生成的軌道，原樣上陣。',
      c: '由團隊逐週期人工挑選。',
      d: '銘刻後由 NFT 持有者表決選定。',
    },
    explanation:
      '預設設定模擬十萬組候選軌道，每組推進一百萬步，再結合排名與影像層面檢查篩選。重現須固定渲染器版本與設定，這些預設值不是不可變的合約參數。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-color': {
    prompt: '三個天體的色彩如何確定？',
    options: {
      a: '連續的感知調色方案調整色相與其他屬性，不固定為等間隔色相。',
      b: '每幅簽名固定使用紅、綠、藍三色。',
      c: '從真實星雲照片中取樣。',
      d: '銘刻時由 NFT 的第一位所有者挑選。',
    },
    explanation: '連續的 OKLCh 感知調色方案調整色相與其他色彩屬性，不把三個天體固定為等間隔色相。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-spectral': {
    prompt: '軌跡為何呈現出那樣的質感？',
    options: {
      a: '光譜渲染：從 380 至 700 奈米劃分 64 個波長區間，以隨速度變化的線寬和景深渲染軌跡。',
      b: '加了輝光濾鏡的扁平向量筆畫。',
      c: '物理模擬器的截圖，再交給 AI 放大。',
      d: '在模擬之上手工調校的樣條曲線。',
    },
    explanation:
      '渲染器使用光譜波長區間、隨速度變化的軌跡與景深，再作色調映射、輝光和色彩調整。這些屬於渲染器設定，鏈上保存的是種子，不是成品像素。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-output': {
    prompt: '管線為每枚 NFT 輸出什麼檔案？',
    options: {
      a: '依渲染器設定生成高解析度影像與動畫。',
      b: '只有一張 JPEG 縮圖。',
      c: '一張動態 GIF。',
      d: '一個 SVG 向量檔案。',
    },
    explanation:
      '影像和影片的格式、解析度與時長由渲染器設定決定。重現需要鏈上種子、對應版本、設定與相容工具鏈，這些輸出選項不是不可變的合約參數。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'art-server-death': {
    prompt: '與專案相關的所有伺服器明天全部消失。作品會怎樣？',
    options: {
      a: '鏈上種子仍可取得，搭配對應渲染器版本、設定與相容工具鏈，可重新生成作品。',
      b: '藝術丟失；只有後設資料倖存。',
      c: '只有錢包裡的縮圖倖存。',
      d: '取決於 IPFS 固定是否有人維護。',
    },
    explanation:
      '鏈上種子提供可查證的生成起點。搭配對應渲染器版本、設定與相容工具鏈，任何人都能嘗試重新生成作品。種子本身不保證跨版本、跨機器逐像素一致，也不保證託管影像與影片的服務隨時可用。',
    funFact:
      '倉庫提供手動執行的參考影像檢查。重現作品須固定種子、渲染器版本、設定與相容工具鏈；目前持續整合不會比較生成畫面的雜湊。',
    referenceLabel: '白皮書 §6.2 · 可復現性與許可',
  },
  'art-naming': {
    prompt: '所有者對自己的 Cosmic Signature NFT 有哪些自定義空間？',
    options: {
      a: '可在鏈上記錄最長 32 位元組的名稱，但不改變已記錄的種子。',
      b: '可以重擲一次種子。',
      c: '可以調整配色。',
      d: '可以延長影片時長。',
    },
    explanation:
      '命名操作記錄文字，不改變鏈上種子。NFT 後設資料的位置仍受合約所有者權限控制，顯示的媒體內容與鏈上種子是不同事項。',
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
      a: '合約在銘刻時衍生並記錄 32 位元組種子，渲染器再搭配其版本與設定使用該種子。',
      b: '收官前由藝術家為每枚 NFT 上傳種子。',
      c: '種子就是所有者的錢包地址。',
      d: '每次渲染都會重新取一個種子。',
    },
    explanation:
      '鏈上種子提供可查證的生成起點。搭配對應渲染器版本、設定與相容工具鏈，任何人都能嘗試重新生成作品。種子本身不保證跨版本、跨機器逐像素一致，也不保證託管影像與影片的服務隨時可用。',
    referenceLabel: '白皮書 §6.1 · 渲染管線',
  },
  'hacken-findings': {
    prompt: 'Hacken 對合約的獨立安全審查結論是什麼？',
    options: {
      a: '共 23 項發現：無嚴重級，無高危級，中危 3 項、低危 8 項、資訊級 12 項——多數是附書面理由接受的設計取捨。',
      b: '數項嚴重級發現至今未修復。',
      c: '零發現，任何級別都沒有。',
      d: '報告從未發布。',
    },
    explanation:
      '最終報告於2026年1月發布，涵蓋核心協議、CST 代幣、兩個 NFT 整合、錨定錢包與配套合約。閱讀時應一併查看問題嚴重度、處理狀態和審查範圍。報告沒有嚴重或高危級別發現，但這不等於協議不存在風險。',
    referenceLabel: '白皮書 §11.1 · 獨立審查',
  },
  'hacken-invariants': {
    prompt: '人工審查之外，Hacken 的模糊測試檢驗了什麼？',
    options: {
      a: '14 項系統不變量——例如協議持有的 ETH 總額必須始終等於存入減去發放——全部在 10,000 次執行中保持成立。',
      b: '常見交易的 gas 消耗。',
      c: '藝術管線的確定性。',
      d: '前端渲染效能。',
    },
    explanation:
      '模糊測試用生成的輸入反覆衝擊系統，同時斷言必須永遠成立的性質。Hacken 形式化了 14 項這樣的不變量，全部在 10,000 次執行中保持成立——這與逐行審查是兩種不同的證據，專門瞄準沒有人想到要試的狀態。',
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
      'Certora 規範、SMTChecker、Slither 與覆蓋率導向的測試，分別檢查不同性質與缺陷類型。它們與 Hacken 審查和模糊測試互為補充；任何單項檢查都不能證明系統完全正確。',
    referenceLabel: '白皮書 §11.1 · 獨立審查',
  },
  'sourcify-status': {
    prompt: '已部署合約的原始碼驗證狀態如何？',
    options: {
      a: '須逐一核對目前實作的驗證紀錄；V3 尚未在 Sourcify 驗證，舊版本完全匹配不能證明新實作。',
      b: '原始碼驗證可以保證每一版實作都絕對安全。',
      c: 'V2 的原始碼匹配會自動驗證 V3。',
      d: '只在測試網上驗證過，主網沒有。',
    },
    explanation:
      '代理與實作使用不同地址。目前實作可從代理的 EIP-1967 槽位讀取，驗證紀錄也須對應該實作。原始碼匹配只說明位元組碼與提交原始碼相符，不等於獨立安全審計。',
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
      '重入防護會阻止受保護入口在同一筆尚未完成的交易中被再次呼叫。次級分配採用託管取回方式，也避免在收官期間直接向獲配者轉帳。這些防護針對特定風險，不代表所有攻擊都已被排除。',
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
      'Random Walk NFT 從不移動：合約記下「已使用」，並套用價格減免。被消耗的是這個標記——每枚一生一次，橫跨所有週期——一個數量固定的外部系列由此融入協議經濟，而協議不必保管任何東西。',
    referenceLabel: '白皮書 §4.2 · 附加 Random Walk NFT',
  },
  'open-finalization-carries': {
    prompt: '公開收官窗口期間，從未落過一筆的 Quill 完成了收官。她究竟得到什麼？',
    options: {
      a: '完整簽名分配：ETH 份額、一次固定 CST 數額、目前 V3 的三枚連續編號 NFT，以及附加資產受益權。',
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
    prompt: '本週期 Bea 落筆 30 次，Cal 落筆 3 次。關於 ETH 星選，下列哪項為真？',
    options: {
      a: '相對比例由累積的無溢價 ETH 基礎價格權重決定，落筆次數本身不能證明十比一。',
      b: 'Bea 保底至少被選中一次。',
      c: 'Cal 被排除在外；只有頭部參與者才有資格。',
      d: '兩人機會完全相同——每個地址一次資格。',
    },
    explanation:
      '參與者 ETH 與 NFT 星選都依未減免、未含溢價的 ETH 基礎價格加權，CST 落筆採當時的 ETH 基礎價格。不同落筆的權重可以不同，選取可重複，也不保證任何地址獲配。',
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
    explanation:
      '參與 CST 在下一筆執行時向上一筆參與者銘刻；表彰 CST 於收官時依軌道發放，簽名分配的三枚 NFT 合計只對應一次 1,000 CST；推廣儲備另獲每週期 3,000 CST。三條路徑的時間、收取對象和條件各不相同。',
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
      '收官會計算設定的 ETH 份額、發放或登記各軌道、銘刻 NFT 與固定 CST，並安排下一週期。公共財僅先進入金庫，轉給受益方須另發一筆交易；這條軌道特定的轉帳失敗可被容許。收官不結算最後一筆之後的動態參與 CST。',
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
