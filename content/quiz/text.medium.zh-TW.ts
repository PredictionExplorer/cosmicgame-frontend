import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('zh-TW');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * 進階層文案：運轉中的機制。校準窗口、CST 回饋迴路、堅守軌道、星選算術與
 * 議會參數。鍵為 structure.ts 中的骨架題目 id。
 */
export const mediumQuestionsTextZhTw = {
  'eth-opening-price-discovery': {
    prompt: '新週期如何找到自己的開場 ETH 落筆價格？',
    options: {
      a: '從上一週期開場時未減免、未含溢價的 ETH 基礎價格兩倍起步，線性下降到上限除以 200 後取整再加 1 wei。',
      b: `每個週期都固定以 ${protocolFacts.initialGestureCostEth} ETH 開場。`,
      c: '每個週期的開場價格由宇宙議會表決決定。',
      d: '價格每小時翻倍，直到有人落筆。',
    },
    explanation: `這是不依賴訂單簿的價格發現：上一週期若開得太便宜，翻倍先恢復上行空間；翻倍後若顯得偏高，緩慢下行總會停在有人願意開場的位置。只有第一個週期使用了固定的 ${protocolFacts.initialGestureCostEth} ETH——此後每個週期都從前一個週期校準而來。`,
    referenceLabel: '白皮書 §3.1 · 開場與 ETH 校準窗口',
  },
  'eth-step-up': {
    prompt: 'Pax 以 ETH 落筆後，下一筆不含溢價的 ETH 基礎價格如何變化？',
    options: {
      a: `上調 ${protocolFacts.ethGestureCostStepUpPercent}%，再加 1 wei——這條序列公開而精確。`,
      b: '翻倍。',
      c: '在週期收官前保持不變。',
      d: `下調 ${protocolFacts.ethGestureCostStepUpPercent}%，以吸引更多落筆。`,
    },
    explanation:
      '每筆 ETH 落筆會把下一筆基礎價格設為目前基礎價格加上其百分之一的整數部分，再加 1 wei。臨近收官溢價另行計算，不計入這條基礎價格序列，因此最終報價不一定只會上升。',
    funFact: '那 1 wei 並非可有可無：當價格小到百分比部分四捨五入為零時，它保證價格仍嚴格增長。',
    referenceLabel: '白皮書 §4.1 · ETH 落筆',
  },
  'overpay-refund': {
    prompt: 'Vega 不小心多付了明顯超出目前落筆價格的 ETH。多出的部分怎麼辦？',
    options: {
      a: '在同一筆交易中退回給她。',
      b: '無論金額多少，都留給儲備。',
      c: '記入她的下一筆落筆。',
      d: '轉撥給公共財。',
    },
    explanation:
      '超出灰塵閾值的超付會在同一筆交易中退回；只有當退款連 gas 都不夠抵時，差額才留在儲備中——這是一條為你省錢的分界線，不是罰則。',
    referenceLabel: '白皮書 §4.1 · ETH 落筆',
  },
  'cst-window-restart': {
    prompt: 'Lyra 落下一筆 CST 落筆。這對 CST 校準窗口意味著什麼？',
    options: {
      a: '以不含溢價的基礎花費兩倍、設定下限與新下降速率乘以 180 秒三者最大值，重設窗口上限。',
      b: '沒有影響——窗口繼續原來的下行。',
      c: `價格鎖定在 ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST，直到週期結束。`,
      d: '窗口關閉，CST 落筆暫停到下一週期。',
    },
    explanation:
      'CST 基礎價格隨時間下降。CST 落筆後，上限重設為不含溢價的基礎花費兩倍、設定下限及新下降速率乘以 180 秒三者最大值。臨近收官溢價另計，可能使最終價格上升。',
    referenceLabel: '白皮書 §4.3 · CST 落筆',
  },
  'cst-free-quiet': {
    prompt: '協議沉寂了很久，CST 校準窗口已經走完。現在的事實是什麼？',
    options: {
      a: 'CST 落筆價格已降至零，無需支付 CST，但仍需支付網路燃料費。',
      b: '週期自動完成收官。',
      c: '在 ETH 落筆到來之前，CST 落筆被停用。',
      d: 'CST 價格已升至上限。',
    },
    explanation:
      '校準窗口完整走完後，CST 落筆價格可降至零。落筆仍需支付網路燃料費，並滿足目前週期規則。收官也需要有人提交交易，週期不會自動收官。',
    referenceLabel: '白皮書 §4.3 · CST 落筆',
  },
  'window-feedback-loop': {
    prompt: '連續 ETH 落筆如何影響 CST 的下降速率？',
    options: {
      a: '每筆嘗試把下降速率提高百分之一，但只有通過最短窗口檢查才採用。',
      b: '每筆都把下降速率降低百分之一。',
      c: '毫無影響——兩種貨幣互不相干。',
      d: '窗口重置回初始時長。',
    },
    explanation:
      'V3 在鏈上保存 CST 價格下降速率，再由上限與速率推算窗口時長。依目前除數，ETH 落筆會嘗試將速率增加百分之一，但須通過最短窗口檢查；CST 落筆則將速率減去其 1/101。CST 落筆也會重設上限，取不含溢價的基礎花費兩倍、設定下限與新速率乘以 180 秒三者最大值。這項檢查不是落筆冷卻期。',
    referenceLabel: '白皮書 §4.3 · CST 落筆',
  },
  'participation-cst-timing': {
    prompt:
      '按上線參數，兩筆落筆分別銘刻參與 CST：一筆落在上一筆之後 1 秒，另一筆終結了一整天的沉默。兩者大約各銘刻多少？',
    options: {
      a: `約 ${oneSecondExample.cst} CST 與 ${oneDayExample.cst} CST，依間隔線性計算，並發給上一筆參與者。`,
      b: `每筆固定 ${cst(100)} CST，與時機無關。`,
      c: '兩筆相同——時機從不重要。',
      d: '都是零——只有收官才銘刻 CST。',
    },
    explanation:
      'V3 依經過秒數線性計算參與 CST：秒數乘上鏈上乘數，再除以微秒計的週期增量，向下取整到 CST 最小單位。以原始一小時增量計，約每分鐘 1 CST；週期增量變大後，速率會略降。下一筆會把全額銘刻給上一筆參與者；首筆不發放，收官也不結算最後一筆之後的累積量。',
    funFact:
      '可以。每筆落筆都會增加星選權重，並更新堅守紀錄。下一筆執行時，會依間隔時長向上一筆的參與者銘刻參與 CST，通常不是發給這次提交者。首筆不銘刻參與 CST，收官也不會結算最後一筆之後的這項累積量。',
    referenceLabel: '白皮書 §7.1 · 銘刻規則',
  },
  'cst-max-cost-protection': {
    prompt: '提交 CST 落筆時，是什麼保護 Kestrel 在交易落地偏晚時不至於多花？',
    options: {
      a: '她指定可接受的最高價格；這一筆花費絕不會超過授權。',
      b: '沒有保護——執行時是什麼價就付什麼價。',
      c: '宇宙議會會在週期結束後退還多收部分。',
      d: 'CST 價格在簽名與執行之間從不變化。',
    },
    explanation:
      '提交 CST 落筆時需指定可接受的最高價格，交易落地晚於預期也不會多花一分。它在另一筆 CST 落筆剛剛以更高起始價重啟窗口時最有價值。',
    referenceLabel: '白皮書 §4.3 · CST 落筆',
  },
  'endurance-definition': {
    prompt:
      'Ari 在一個慵懶的午後落下一筆，十個小時無人打破——這是本週期最長的靜默間隔。他有望摘得哪個頭銜？',
    options: {
      a: '堅守冠軍——他以最近落筆者的身份堅守了最長的連續間隔。',
      b: '時之勇士——他把一個頭銜保持了最久。',
      c: '都不是；頭銜取決於落筆次數。',
      d: '自動成為收官之筆。',
    },
    explanation:
      '堅守冠軍是以最近落筆者身份堅守最久的參與者——單筆落筆撐過的最長靜默間隔。時之勇士再上一層，衡量的是另一回事：堅守冠軍這個頭銜本身被保持了多久。',
    referenceLabel: '白皮書 §5.2 · 堅守冠軍與時之勇士',
  },
  'chrono-definition': {
    prompt:
      'Ari 創下十小時的堅守紀錄，連續保持堅守冠軍身分兩天後，紀錄才被 Bea 刷新。時之勇士衡量的是什麼？',
    options: {
      a: '誰連續在位堅守冠軍最久——Ari 保持紀錄的那兩天都算在他頭上。',
      b: '誰在他人落筆後反應最快。',
      c: '誰總共參與的週期最多。',
      d: '誰落下本週期的收官之筆。',
    },
    explanation:
      '堅守衡量你創造的間隔，時之勇士衡量紀錄存活的時長。Ari 的堅守間隔是十小時，但他以堅守冠軍身份在位了兩天——時之勇士軌道計量的正是這段在位。兩者都要到收官那一刻才塵埃落定。',
    referenceLabel: '白皮書 §5.2 · 堅守冠軍與時之勇士',
  },
  'eth-selection-count': {
    prompt: '收官時，ETH 星選如何發放它的份額？',
    options: {
      a: `從本週期落筆資格池中選出 ${protocolFacts.ethStellarSelectionRecipients} 次，均分儲備的 ${protocolFacts.stellarSelectionEthPercentage}%。`,
      b: `選出 ${protocolFacts.nftStellarSelectionRecipients} 次，每次都發放 ETH 和一枚 NFT。`,
      c: '只選出一次，獨得全部份額。',
      d: '每位參與者平分。',
    },
    explanation: `ETH 星選選出 ${protocolFacts.ethStellarSelectionRecipients} 次資格，均分儲備的 ${protocolFacts.stellarSelectionEthPercentage}%。${protocolFacts.nftStellarSelectionRecipients} 次是另一條軌道——參與者 NFT 星選的數字，它發放的是 CST 與 NFT，不含 ETH。`,
    referenceLabel: '白皮書 §5.3 · 星選',
  },
  'nft-selection-count': {
    prompt: '參與者 NFT 星選每次發放什麼？共選出多少次？',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST 與 1 枚 Cosmic Signature NFT，從落筆資格池中共選出 ${protocolFacts.nftStellarSelectionRecipients} 次。`,
      b: `一份 ETH 份額，共選出 ${protocolFacts.ethStellarSelectionRecipients} 次。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST，只選出一次。`,
      d: `只有 NFT，共選出 ${protocolFacts.typicalNftsPerCycle} 次。`,
    },
    explanation:
      '參與者 NFT 星選每次分配一枚 NFT 與一次表彰 CST，採基礎 ETH 價格權重並允許重複選取。簽名分配的規則不同：三枚 NFT 合計對應一次 1,000 CST，並非每枚都有 1,000 CST。',
    referenceLabel: '白皮書 §5.1 · 收官時的發放',
  },
  'draws-with-replacement': {
    prompt: '同一位參與者可能在一個週期的星選中被選中多次嗎？',
    options: {
      a: '可能——選擇採用放回方式，資格隨落筆累積。',
      b: '不可能——每位參與者至多被選中一次。',
      c: '只有落筆十次以上的參與者才可能重複。',
      d: '需經宇宙議會批准方可重複。',
    },
    explanation:
      '參與者的 ETH 與 NFT 星選都依累積權重選取，並非單純按落筆次數計算。權重取每筆發生時未減免、未含溢價的 ETH 基礎價格，CST 落筆也相同。隨機輸入來自鏈上區塊背景，並非獨立的可驗證隨機服務，不保證完全無偏。Random Walk NFT 錨定星選使用獨立的已錨定 NFT 資格池。',
    referenceLabel: '白皮書 §5.3 · 星選',
  },
  'anchored-rwlk-track': {
    prompt: '已錨定的 Random Walk NFT 能從週期中得到什麼？',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} 次選出，每次 ${cst(protocolFacts.specialAllocationCst)} CST 加一枚 Cosmic Signature NFT，權重按錨定數量計——不含 ETH。`,
      b: `按比例分攤 ${protocolFacts.anchorDistributionPercentage}% 的 ETH 錨定配發。`,
      c: '什麼也沒有——只有 Cosmic Signature NFT 才能錨定。',
      d: '解錨時的一次性 CST 發放。',
    },
    explanation: `Random Walk NFT 的錨定自成一線，目的也不同：它們參與錨定 NFT 星選，每週期 ${protocolFacts.anchoredRwlkNftSelectionRecipients} 次，每次攜帶 CST 與一枚 Cosmic Signature NFT。ETH 錨定配發專屬於已錨定的 Cosmic Signature NFT——Random Walk 錨定不含 ETH。`,
    referenceLabel: '白皮書 §8 · 錨定',
  },
  'exclusivity-window': {
    prompt: '收官之筆參與者的專屬收官權持續多久？',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours} 小時`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時`,
      c: `${protocolFacts.initialCycleTimeIncrementHours} 小時`,
      d: `${protocolFacts.initialCstCalibrationWindowHours} 小時`,
    },
    explanation: `專屬窗口為 ${protocolFacts.finalGestureExclusivityHours} 小時；窗口過後，任何人都可收官並接過受益方角色。${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時是開場落筆之後的初始倒數——完全是另一座時鐘。`,
    funFact: `V1 只給收官之筆參與者 ${protocolFacts.initialCycleFinalizationHoursAtLaunch} 小時的專屬期。線上週期證明人真的會睡過截止時間，V2 於是把它翻倍。`,
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
  'escrow-timeout': {
    prompt: 'Juno 在 ETH 星選中被選中，卻一直沒有取回託管中的 ETH。期限過後會怎樣？',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} 週之後，任何人都可以為自己取回這份未取回的分配。`,
      b: '它回到週期儲備。',
      c: '它被銷燬。',
      d: '它無限期留在託管中等待 Juno。',
    },
    explanation: `託管中的分配與附加資產會等待 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 週；期限一過，合約允許任何人為自己取回仍未取回的分配。這條規則與公開收官窗口一脈相承：每份發放終會到達想要它的人手中。請及時取回。`,
    referenceLabel: '白皮書 §5.4 · 發放、託管與期限',
  },
  'push-vs-pull': {
    prompt: '收官時哪些 ETH 直接送達，哪些進入托管？',
    options: {
      a: '簽名分配的 ETH 直接送達收官者，公共財份額先進入金庫，次級 ETH 進入分配錢包。',
      b: '全部直接傳送給每位獲配者。',
      c: '全部進入托管，包括受益方的份額。',
      d: '只有 CST 進入托管；ETH 全部直接送達。',
    },
    explanation:
      '主 ETH 份額直接轉給收官者，次級 ETH 留在分配錢包等待取回。公共財份額先轉入金庫，轉給最終受益方還須另一筆交易。CST 與 NFT 依各軌道直接銘刻，相關失敗條件由合約規定。',
    referenceLabel: '白皮書 §5.4 · 發放、託管與期限',
  },
  'council-proposal-threshold': {
    prompt: '一個地址需要多少委託 CST 權重才能提交協調提案？',
    options: {
      a: `至少 ${protocolFacts.councilProposalThresholdCst} CST。`,
      b: `至少 ${cst(protocolFacts.specialAllocationCst)} CST。`,
      c: `至少 ${cst(protocolFacts.outreachReserveCst)} CST。`,
      d: '任意數量——沒有門檻。',
    },
    explanation: `門檻為 ${protocolFacts.councilProposalThresholdCst} CST 的歷史委託權重。${cst(protocolFacts.specialAllocationCst)} CST 是固定表彰分配，不能當作提案門檻；簽名分配的多枚 NFT 合計只對應一次這個 CST 數額。`,
    referenceLabel: '白皮書 §9 · 宇宙議會',
  },
  'council-timeline': {
    prompt: '一份協調提案在今天提交。接下來的時間線是什麼？',
    options: {
      a: `先經過 ${protocolFacts.councilVotingDelayDays} 天協調延遲，再進入 ${protocolFacts.councilVotingPeriodWeeks} 週的協調期。`,
      b: '只要提案者持有足夠 CST，立即生效。',
      c: `先等 ${protocolFacts.secondaryRetrievalTimeoutWeeks} 週，再進入 ${protocolFacts.councilVotingDelayDays} 天的協調期。`,
      d: `${protocolFacts.finalGestureExclusivityHours} 小時延遲後自動執行。`,
    },
    explanation: `提案先經過 ${protocolFacts.councilVotingDelayDays} 天協調延遲，再進入 ${protocolFacts.councilVotingPeriodWeeks} 週的協調期。延遲給了持有者在快照前調整委託的時間；沒有任何提案會立即生效。`,
    referenceLabel: '白皮書 §9 · 宇宙議會',
  },
  'quorum-rule': {
    prompt: '協調提案何時透過？',
    options: {
      a: `支持權重高於反對權重，且支持與棄權權重之和達到 ${protocolFacts.councilQuorumPercent}% 的協調法定權重。`,
      b: '僅支持權重達到總供應量的一半即可。',
      c: `支持、反對與棄權合計達到 ${protocolFacts.councilQuorumPercent}% 即可。`,
      d: '需協議所有者會簽結果。',
    },
    explanation: `兩個條件須同時成立：支持權重高於反對權重，且支持與棄權之和達到 CST 總供應量 ${protocolFacts.councilQuorumPercent}% 的協調法定權重。反對權重刻意不計入法定權重——反對一份提案，絕不會反而幫它湊夠門檻。`,
    referenceLabel: '白皮書 §9 · 宇宙議會',
  },
  'weight-activation': {
    prompt: 'Rook 錢包裡有 CST，卻從未碰過議會。他的 CST 表達多少協調權重？',
    options: {
      a: '零——權重只在完成委託後生效，委託給自己或其他地址都可以。',
      b: '每枚 CST 自動錶達一個單位。',
      c: '取決於他持有 CST 的時長。',
      d: '權重來自已錨定的 NFT，而非 CST。',
    },
    explanation:
      '協調權重在委託後生效：持有者把權重委託給自己或其他地址，此後每枚 CST 表達一個單位。未委託的 CST 不攜帶任何權重——僅僅持有，並不構成對協調的參與。',
    referenceLabel: '白皮書 §7.3 · 協調權重',
  },
  'time-increment-growth': {
    prompt: '每筆落筆所加的時間增量上線時恰為一小時。它如何演變？',
    options: {
      a: `每個週期收官後增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%，週期因此逐年變長。`,
      b: '永遠固定在一小時。',
      c: '每個週期翻倍。',
      d: '參與者越多，它越短。',
    },
    explanation: `增量在每個週期收官後增長 ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}%。增量逐週期累積，使週期逐漸變長，NFT 的銘刻節奏也隨之放緩。`,
    referenceLabel: '白皮書 §3.2 · 收官倒數',
  },
  'typical-cst-fixed': {
    prompt: '典型週期銘刻多少固定 CST？如何構成？',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST：固定表彰分配加上推廣儲備，簽名分配的多枚 NFT 只對應一次 CST 數額。`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST，全部歸週期受益方。`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST，全部用於社群推廣。`,
      d: '每個週期都無法預測。',
    },
    explanation: `完整軌道合計銘刻 ${protocolFacts.typicalNftsPerCycle} 枚 NFT 和 ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST 固定分配。簽名分配有 ${protocolFacts.mainPrizeNftsPerCycle} 枚 NFT，但只發放一次 ${cst(protocolFacts.specialAllocationCst)} CST；動態參與 CST 另計。條件軌道缺席時，總額會減少。`,
    referenceLabel: '白皮書 §7.1 · 銘刻規則',
  },
  'attached-assets-destination': {
    prompt: 'Wren 在落筆時附加了一種 ERC-20 代幣。附加資產去了哪裡？',
    options: {
      a: '進入分配錢包託管——週期收官後，受益方享有優先取回權。',
      b: '與落筆的 ETH 一道匯入週期儲備。',
      c: '週期收官時退回給 Wren。',
      d: '收官時被銷燬。',
    },
    explanation:
      '附加資產從不進入 ETH 儲備。它們由分配錢包託管，週期收官後受益方享有優先取回權——並與其他託管分配一樣，受同一公開取回期限約束。',
    referenceLabel: '白皮書 §4.4 · 訊息與附加資產',
  },
  'next-cycle-delay': {
    prompt: '一個週期剛剛完成收官。下一個週期何時啟用？',
    options: {
      a: `經過鏈上設定的延遲後開啟，目前為 ${protocolFacts.currentNextCycleDelayDays} 天，所有者可以調整。`,
      b: '同一筆交易內立即啟用。',
      c: `正好 ${protocolFacts.finalGestureExclusivityHours} 小時之後。`,
      d: '只有所有者手動開啟後才啟用。',
    },
    explanation: `下一週期的啟用時間由成功收官時間加上設定延遲決定。目前為 ${protocolFacts.currentNextCycleDelayDays} 天；${protocolFacts.defaultNextCycleDelayMinutes} 分鐘是歷史 Solidity 預設值，不是目前延遲。`,
    referenceLabel: '白皮書 §3.3 · 收官與公開收官窗口',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
