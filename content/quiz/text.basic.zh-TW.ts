import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

/**
 * 基礎層文案：協議的整體輪廓。術語與措辭對齊 content/white-paper/text.zh.ts 與
 * docs/i18n/glossary-zh.md；鍵為 structure.ts 中的骨架題目 id。
 */
export const basicQuestionsTextZhTw = {
  'what-is-cosmic-signature': {
    prompt: '朋友問你：Cosmic Signature 到底是什麼？哪個回答是對的？',
    options: {
      a: '部署在 Arbitrum 上的程序化鏈上藝術協議，以一個個限時的演繹週期運轉。',
      b: '一個把文字提示詞變成太空圖片的 AI 影像服務。',
      c: '生物學家使用的癌症突變特徵資料庫。',
      d: '一個預測 NFT 系列價格的服務。',
    },
    explanation:
      'Cosmic Signature 是程序化藝術協議：限時的演繹週期在一次次落筆中延展，收官時銘刻確定性的三體藝術作品。整條管線沒有任何 AI 參與——作品是由種子驅動的物理計算，與文字提示詞式的影像服務恰好相反。',
    funFact: 'COSMIC 也是一個癌症突變資料庫的名稱，兩者沒有關聯。協議文件對此有明確說明。',
    referenceLabel: '學習中心：什麼是 Cosmic Signature？',
  },
  'what-is-a-gesture': {
    prompt: '在協議術語中，「落筆」指什麼？',
    options: {
      a: '一次攜帶 ETH 或 CST 的鏈上行為：延長週期倒數，並計入一次星選資格。',
      b: '為社群請願收集的鏈下簽名。',
      c: '你親手繪製、新增到作品上的一道筆觸。',
      d: '在社群頻道裡發布的一條訊息。',
    },
    explanation:
      '落筆推動演繹週期。每一筆都攜帶 ETH 或 CST，把週期收官時間向後推，在本週期星選池中計入一次資格，還可能銘刻參與 CST。沒有任何東西需要親手去畫——作品在收官時由種子計算而來。',
    referenceLabel: '白皮書 §4 · 落筆',
  },
  'two-currencies': {
    prompt: '落筆可以使用哪些貨幣？',
    options: {
      a: 'ETH 或 CST——協議自己的 ERC-20 代幣。',
      b: '只能用 ETH。',
      c: '只能用 CST。',
      d: '任何 ERC-20，包括穩定幣。',
    },
    explanation:
      '入口恰好兩條：ETH 落筆與 CST 落筆。其他 ERC-20 代幣可以作為附加資產隨落筆一同攜帶，但它們從不支付落筆本身——落筆價格只以 ETH 或 CST 結算。',
    referenceLabel: '白皮書 §4 · 落筆',
  },
  'countdown-extension': {
    prompt: '倒數還很充裕時，Nova 落下一筆。這一筆對時鐘做了什麼？',
    options: {
      a: '把目前時間增量加到鏈上儲存的週期收官時間上。',
      b: `把倒數重置為全新的 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時。`,
      c: '縮短倒數，把週期推向收官。',
      d: '什麼也不做——只有 ETH 落筆才會影響時鐘。',
    },
    explanation: `每一筆落筆，無論 ETH 還是 CST，都會把目前時間增量加到鏈上儲存的收官時間上。時鐘從不會被重置到某個固定窗口——${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時只是上線參數下開場落筆之後的初始倒數。`,
    referenceLabel: '白皮書 §3.2 · 收官倒數',
  },
  'final-gesture-role': {
    prompt: '倒數剛剛歸零。誰最先有資格收官？',
    options: {
      a: '最後落下那一筆的參與者——收官之筆。',
      b: '本週期落筆次數最多的參與者。',
      c: '協議所有者。',
      d: '本週期開場落筆的參與者。',
    },
    explanation:
      '週期收官時間一到，收官之筆參與者即可收官，且起初這項權利專屬於他。落筆數量在這裡毫無作用：一筆恰到好處、堅持到最後的落筆，勝過此前的一百筆。',
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'sleepy-beneficiary': {
    prompt: '倒數兩天前就已歸零，收官之筆參與者卻杳無音訊。你用自己的錢包呼叫收官。會發生什麼？',
    options: {
      a: '週期完成收官，而你成為週期受益方——ETH 份額、CST 與 NFT 都歸你。',
      b: '交易回滾；永遠只有收官之筆參與者才能收官。',
      c: '週期完成收官，但一切仍歸收官之筆參與者。',
      d: '在宇宙議會表決介入之前，什麼也不會發生。',
    },
    explanation: `這項權利在 ${protocolFacts.finalGestureExclusivityHours} 小時內專屬於收官之筆參與者。窗口過後進入公開收官：任何人都可收官，合約會把實際收官者視為週期受益方，該角色的一切隨之歸屬。這條規則刻意不留情面——參與者消失協議照樣前行，疏忽也有價格。`,
    funFact: '協議不為缺席者無限期停留。每一條截止時間，最終都會向第一位來者敞開。',
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'signature-allocation-share': {
    prompt: '收官時，簽名分配佔週期儲備的多大份額？',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `簽名分配為協議 ETH 餘額的 ${protocolFacts.mainEthPercentage}%，餘額在收官那一刻讀取一次。${protocolFacts.compoundingReservePercentage}% 是根本不發放的那部分——它作為滾動儲備滾入下一週期。`,
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'compounding-reserve': {
    prompt: '週期儲備如何延續至下一個演繹週期？',
    options: {
      a: `每週期約 ${protocolFacts.compoundingReservePercentage}% 的儲備從不發放——它滾入下一週期。`,
      b: '團隊在週期之間補充儲備。',
      c: '協議每週期都會銘刻新的 ETH。',
      d: '宇宙議會表決向儲備註入新的 ETH。',
    },
    explanation:
      '五條 ETH 分配軌道合計約佔儲備的一半，其餘會滾入下一週期。這不保證每個週期的儲備都比上一週期更大；儲備規模還取決於週期內新增的 ETH。',
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'art-engine': {
    prompt: '一幅 Cosmic Signature 作品究竟由什麼生成？',
    options: {
      a: '一段對引力三體問題的確定性物理模擬，種子來自鏈上資料。',
      b: '一個在太空攝影上微調過的擴散模型。',
      c: '由藝術家逐幅繪製並上傳。',
      d: '一個套用太空配色的隨機畫素生成器。',
    },
    explanation:
      '三個質量相近的天體在牛頓引力下互繞；種子決定初始條件，物理完成其餘一切。任何階段都沒有生成式模型——沒有訓練資料，沒有采樣，也沒有提示詞。讓每幅簽名獨一無二的是混沌，而非隨機。',
    funFact: '三體問題沒有一般解析解。初始條件的毫釐之差，會演成完全不同的舞步。',
    referenceLabel: '白皮書 §6 · 藝術',
  },
  'same-seed': {
    prompt: '你用編號 42 的 NFT 在鏈上儲存的種子，重跑一遍開源渲染管線。會得到什麼？',
    options: {
      a: '在任何機器上都逐畫素一致的同一幅影像。',
      b: '相似但帶有少量隨機差異的影像。',
      c: '不同硬體上會得到不同的影像。',
      d: '只有低解析度預覽；完整作品需要專案伺服器。',
    },
    explanation:
      '確定性靠機制保證，而非口頭承諾：同一種子在任何機器上都產出逐位元一致的影像。生成幀的 SHA-256 雜湊在持續整合中逐一斷言，輸出一旦漂移，構建立即失敗。',
    referenceLabel: '白皮書 §6.2 · 可復現性與許可',
  },
  'cst-supply-origin': {
    prompt: 'CST 從哪裡來？',
    options: {
      a: '供應量從零起步，僅由協議合約按既定機制銘刻。',
      b: '上線時為團隊預留了一大筆份額。',
      c: '上線前免費發放給了早期錢包。',
      d: '任何人呼叫代幣合約都能銘刻 CST。',
    },
    explanation:
      'CST 供應量從零起步，代幣合約只接受協議合約的銘刻與銷毀指令。新的 CST 來自既定機制：落筆時的參與 CST、週期收官時的表彰 CST，以及推廣儲備。合約沒有硬性供應上限。',
    referenceLabel: '白皮書 §7 · CST 代幣',
  },
  'cst-on-spend': {
    prompt: 'Rio 花了一些 CST 落下一筆。這些 CST 去了哪裡？',
    options: {
      a: '被銷燬——永久移出供應量。',
      b: '進了團隊的金庫。',
      c: '匯入週期儲備，收官時再次發放。',
      d: '週期收官時退還給 Rio。',
    },
    explanation:
      '每筆 CST 落筆支付的全部 CST 都會銷毀，永久移出供應量，不會轉入任何金庫。供應量同時受各項銘刻機制影響，因此既取決於新銘刻的數量，也取決於落筆消耗的數量。',
    referenceLabel: '白皮書 §7.2 · 銷燬與供應動態',
  },
  'public-goods-beneficiary': {
    prompt: `每個週期都將儲備的 ${protocolFacts.publicGoodsPercentage}% 作為公共財分配轉撥出去。目前的受益方是誰？`,
    options: {
      a: 'Protocol Guild——170 餘位以太坊核心貢獻者的資助機制。',
      b: '協議團隊的運營錢包。',
      c: 'Arbitrum 驗證者。',
      d: '隨機選出的一位 NFT 持有者。',
    },
    explanation:
      '公共財金庫把這一份額轉撥給 Protocol Guild，轉撥作為收官的一部分在鏈上強制執行——沒有人逐週期決定是否兌現。道理很簡單：活在公共基礎設施之上的協議，就該機械地、按節奏地、公開地資助這層設施。',
    referenceLabel: '白皮書 §10 · 公共財',
  },
  'anchoring-basic': {
    prompt: 'Mira 把她的 Cosmic Signature NFT 錨定至協議。錨定為她帶來什麼？',
    options: {
      a: `錨定期間，這枚 NFT 按比例累積每週期 ${protocolFacts.anchorDistributionPercentage}% 的錨定配發，累積的 ETH 在解錨時取回。`,
      b: '把 NFT 掛到市場上出售。',
      c: '把 NFT 轉換成 CST。',
      d: '用新的種子重新渲染作品。',
    },
    explanation:
      '錨定是協議的長期對齊方式：已錨定的 Cosmic Signature NFT 按比例分攤錨定配發，累積的 ETH 在解錨時取回。NFT 本身絲毫不變——種子與作品是永久的。',
    referenceLabel: '白皮書 §8 · 錨定',
  },
  'anchor-once-ever': {
    prompt: 'Mira 解錨了一枚 NFT。下個月還能再錨定這枚 NFT 嗎？',
    options: {
      a: '不能——每枚 NFT 一生僅可錨定一次，解錨是永久的。',
      b: '可以，等一段冷卻期就行。',
      c: '可以，額外付費即可。',
      d: '可以，但僅限同一週期內。',
    },
    explanation:
      '一生一次的規則，用一個不可逆的抉擇取代了常見的鎖定時間表，也讓已錨定的集合有了真實的退出成本。要不要繼續錨定，是每個週期都可以重新掂量的活問題；要不要解錨，則是永久的決定。',
    referenceLabel: '白皮書 §8 · 錨定',
  },
  'random-walk-perk': {
    prompt: 'Sol 持有一枚 Random Walk NFT，並把它附加到一筆 ETH 落筆上。會發生什麼？',
    options: {
      a: `這一筆的價格降低 ${protocolFacts.randomWalkDiscountPercentage}%；NFT 留在 Sol 的錢包裡，只被標記為已使用——一生一次。`,
      b: 'NFT 被轉移給協議，以換取降價。',
      c: '這一筆變成免費。',
      d: 'NFT 讓這一筆銘刻的參與 CST 翻倍。',
    },
    explanation: `附加 Random Walk NFT 可使一筆 ETH 落筆的價格降低 ${protocolFacts.randomWalkDiscountPercentage}%。NFT 不會轉移——合約只是將其標記為已使用。每枚 Random Walk NFT 在所有週期中僅可附加一次，降價因此成了一種消耗品。`,
    referenceLabel: '白皮書 §4.2 · 附加 Random Walk NFT',
  },
  'first-gesture-currency': {
    prompt: '新週期剛剛啟用。哪種落筆可以為它開場？',
    options: {
      a: 'ETH 落筆——CST 落筆從第二筆起才可使用。',
      b: 'CST 落筆，因為 CST 是協議自己的代幣。',
      c: '兩種貨幣都可以開場。',
      d: '只有協議所有者能為週期開場。',
    },
    explanation:
      '每個週期的首筆落筆必須使用 ETH，價格由 ETH 校準窗口決定。週期一旦展開，CST 就提供第二條入口。沒有任何特權帳戶負責開場——誰落下開場之筆，誰就開啟了週期。',
    referenceLabel: '白皮書 §4.3 · CST 落筆',
  },
  'message-on-gesture': {
    prompt: '除了價值，一筆落筆還能攜帶什麼？',
    options: {
      a: `一條最長 ${protocolFacts.gestureMessageMaxLength} 位元組、記錄在鏈上的訊息，外加可附加的 ERC-20 代幣或一枚 ERC-721 NFT。`,
      b: '什麼都不能——落筆只是價值轉移。',
      c: '一張儲存在合約裡的圖片。',
      d: '不限長度的文字，儲存在鏈下。',
    },
    explanation: `落筆可攜帶最長 ${protocolFacts.gestureMessageMaxLength} 位元組的訊息，與落筆一同記錄在鏈上；也可附加代幣或 NFT。附加資產由分配錢包託管，週期收官後受益方享有優先取回權。`,
    funFact: '每一條隨落筆留下的訊息都永久可讀地留在 Arbitrum 上——一本穿行於週期之間的公開留言簿。',
    referenceLabel: '白皮書 §4.4 · 訊息與附加資產',
  },
  'who-runs-cycles': {
    prompt: '每個週期的 ETH 如何發放，由誰決定？',
    options: {
      a: '由合約執行——已驗證合約會在收官時按協議規則分配。',
      b: '團隊逐週期審核並簽署發放。',
      c: '由一個預言機服務計算分配。',
      d: '由應用程式的後端伺服器發出轉帳。',
    },
    explanation:
      '機械化發放是協議的三項根本性質之一：參與者與發放規則之間沒有任何自由裁量的帳戶，也沒有團隊錢包從落筆中收取 ETH。應用程式與伺服器只是把合約已經完成的事情展示出來。',
    referenceLabel: '白皮書 §1 · 引言',
  },
  'nft-count-typical': {
    prompt: '典型週期會銘刻多少枚 Cosmic Signature NFT？',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle} 枚`,
      b: '1 枚',
      c: `${protocolFacts.nftStellarSelectionRecipients} 枚`,
      d: '100 枚',
    },
    explanation: `典型週期銘刻 ${protocolFacts.typicalNftsPerCycle} 枚 NFT：${protocolFacts.roleNftsPerCycle} 枚角色 NFT（受益方、時之勇士、堅守冠軍、CST 收官之筆）、${protocolFacts.nftStellarSelectionRecipients} 枚參與者 NFT 星選、${protocolFacts.anchoredRwlkNftSelectionRecipients} 枚錨定 NFT 星選。跳過某條軌道的週期會少銘刻幾枚。`,
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'chrono-endurance-exist': {
    prompt: '堅守冠軍與時之勇士這兩條軌道衡量的是什麼？',
    options: {
      a: '時間維度上的堅持——而非誰落得最後或落得最多。',
      b: '本週期誰花的 ETH 最多。',
      c: '誰的落筆次數最多。',
      d: '週期開啟時誰落筆最早。',
    },
    explanation:
      '兩條軌道衡量的都是堅持，而非位置：堅守冠軍以最近落筆者身份堅守了最長的連續間隔，時之勇士則是連續在位堅守冠軍最久的人。花得多、落得多，都不直接決定這兩個頭銜。',
    referenceLabel: '白皮書 §5.2 · 堅守冠軍與時之勇士',
  },
  'stellar-selection-what': {
    prompt: '星選是什麼？',
    options: {
      a: '週期進行中按筆計入的資格紀錄，收官時由合約從中選出獲配者。',
      b: '按活躍度排名參與者的榜單。',
      c: '賦予 NFT 作品的稀有度等級。',
      d: '為作品中的星座命名的方案。',
    },
    explanation:
      '每筆落筆都在本週期星選池中計入一次資格。收官時，合約為 ETH 星選與 NFT 星選選出資格，入選頻次與參與程度成正比。它是一種發放機制，不是排名。',
    referenceLabel: '白皮書 §5.3 · 星選',
  },
  'ecosystem-optionality': {
    prompt: '應用程式、市場與預測場所同時下線一天。你還能做什麼？',
    options: {
      a: '一切照舊——每項機制都可以直接呼叫合約完成。',
      b: '什麼也做不了，只能等應用程式恢復。',
      c: '只能取回分配，不能落筆。',
      d: '只能用 CST 落筆，不能用 ETH。',
    },
    explanation:
      '合約之外的生態——應用程式、Axiom Zero、Uniswap 流動性、Chaos Zero——是便利，不是依賴。它們都不是必需的：落筆、收官、錨定與取回，都可以直接呼叫已驗證的合約完成。',
    referenceLabel: '白皮書 §2 · 協議概覽',
  },
  'what-it-is-not': {
    prompt: '關於協議的本質，哪種說法與白皮書一致？',
    options: {
      a: '參與者以價值換取參與本身，協議不留任何運營方抽成。',
      b: '取得 CST 是一條憑他人努力取得金錢的可靠途徑。',
      c: '有一個運營方從每個週期中留下一定比例。',
      d: '協議承諾 NFT 的價值會隨時間上漲。',
    },
    explanation:
      '每條分配軌道流向的都是參與者、已錨定的 NFT、滾動儲備或公共財——不存在運營方抽成。白皮書不對價格、流動性或未來價值作任何承諾，並直言任何人都不應帶著「憑他人努力取得金錢」的預期取得 CST 或 NFT。',
    referenceLabel: '白皮書 §14.1 · Cosmic Signature 不是什麼',
  },
  'where-recorded': {
    prompt: '落筆、種子與週期歷史究竟存放在哪裡？',
    options: {
      a: '在鏈上——Arbitrum One，一條以太坊 Layer 2 網路。',
      b: '在專案的私有資料庫裡。',
      c: '只在團隊維護的 IPFS 檔案裡。',
      d: '不作紀錄，只保留彙總資料。',
    },
    explanation:
      '協議執行在 Arbitrum One 上，重要紀錄——每一筆落筆、每一個種子、每一份分配——都在鏈上。正因如此，作品可復現、發放可審計，任何人都無需信任任何伺服器。',
    referenceLabel: '學習中心：Cosmic Signature 與 Arbitrum',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
