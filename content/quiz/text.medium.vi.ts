import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('vi-VN');
const percent = (value: number): string => value.toLocaleString('vi-VN');
/** Vietnamese decimal mark for a protocol figure quoted in English notation ("1.73"). */
const viDecimal = (value: string): string => value.replace('.', ',');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * Medium tier: the live mechanics. Calibration Windows, the CST feedback
 * loop, persistence tracks, Selection math, Council parameters. Numbers
 * interpolate from protocolFacts.
 */
export const mediumQuestionsTextVi = {
  'eth-opening-price-discovery': {
    prompt: 'Một chu kỳ mới khám phá chi phí nét bút ETH mở đầu của mình như thế nào?',
    options: {
      a: `Cửa sổ hiệu chỉnh ETH bắt đầu ở ${protocolFacts.ethCalibrationCeilingMultiplier} lần chi phí mở đầu đã trả của chu kỳ trước và giảm tuyến tính về sàn bằng một phần hai trăm của mức đó, cộng một wei.`,
      b: `Mỗi chu kỳ mở ở mức cố định ${viDecimal(String(protocolFacts.initialGestureCostEth))} ETH.`,
      c: 'Hội đồng Vũ trụ biểu quyết chi phí mở đầu của mỗi chu kỳ.',
      d: 'Chi phí gấp đôi mỗi giờ cho đến khi có người đặt nét bút.',
    },
    explanation: `Đây là khám phá giá không cần sổ lệnh: nếu chu kỳ trước mở quá rẻ, việc gấp đôi khôi phục biên độ; nếu mức gấp đôi lại quá cao, đường giảm tìm ra mức mà ai đó sẵn lòng bắt đầu. Chỉ chu kỳ đầu tiên dùng mức cố định ${viDecimal(String(protocolFacts.initialGestureCostEth))} ETH \u2014 mọi chu kỳ sau đều hiệu chỉnh từ chu kỳ trước nó.`,
    referenceLabel: 'Sách trắng \u00a73.1 \u2014 Cửa sổ hiệu chỉnh ETH',
  },
  'eth-step-up': {
    prompt: 'Pax đặt một nét bút ETH. Điều gì xảy ra với chi phí của nét bút ETH tiếp theo?',
    options: {
      a: `Nó tăng ${protocolFacts.ethGestureCostStepUpPercent}%, cộng một wei \u2014 chuỗi số là công khai và chính xác.`,
      b: 'Nó gấp đôi.',
      c: 'Nó giữ nguyên cho đến khi chu kỳ hoàn tất.',
      d: `Nó giảm ${protocolFacts.ethGestureCostStepUpPercent}% để mời gọi thêm hoạt động.`,
    },
    explanation: `Sau nét bút mở, mỗi nét bút ETH nâng chi phí nét bút ETH tiếp theo lên ${protocolFacts.ethGestureCostStepUpPercent}%, cộng một wei, nên chi phí luôn tăng. Bất kỳ ai cũng có thể đọc chi phí hiện tại từ hợp đồng trước khi hành động \u2014 không có bất ngờ, chỉ có một bậc thang đi lên.`,
    funFact:
      'Một wei thêm vào rất quan trọng: nó bảo đảm tăng trưởng nghiêm ngặt ngay cả khi chi phí nhỏ đến mức phần trăm của nó làm tròn về không.',
    referenceLabel: 'Sách trắng \u00a74.1 \u2014 Nét bút ETH',
  },
  'overpay-refund': {
    prompt: 'Vega vô tình gửi nhiều ETH hơn hẳn chi phí nét bút hiện tại. Phần dư sẽ thế nào?',
    options: {
      a: 'Nó được hoàn lại cho cô trong cùng giao dịch.',
      b: 'Nó mất vào dự trữ, bất kể số lượng.',
      c: 'Nó được ghi có cho nét bút tiếp theo của cô.',
      d: 'Nó được chuyển đến Hàng hóa công.',
    },
    explanation:
      'Phần trả dư vượt ngưỡng vụn được hoàn lại trong cùng giao dịch. Dưới ngưỡng đó, việc hoàn lại tốn nhiều gas hơn số tiền trả về, nên phần chênh ở lại trong dự trữ \u2014 một điểm cắt lịch thiệp có chủ đích, không phải hình phạt.',
    referenceLabel: 'Sách trắng \u00a74.1 \u2014 Nét bút ETH',
  },
  'cst-window-restart': {
    prompt: 'Lyra đặt một nét bút CST. Điều đó làm gì với cửa sổ hiệu chỉnh CST?',
    options: {
      a: `Nó khởi động lại cửa sổ từ ${protocolFacts.cstCalibrationCeilingMultiplier} lần chi phí cô vừa trả \u2014 không bao giờ dưới ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST \u2014 rồi lại giảm tuyến tính về không.`,
      b: 'Không gì cả \u2014 cửa sổ tiếp tục giảm từ chỗ đang đứng.',
      c: `Chi phí khóa ở ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST cho phần còn lại của chu kỳ.`,
      d: 'Cửa sổ đóng và nét bút CST tạm dừng đến chu kỳ sau.',
    },
    explanation: `Mỗi nét bút CST khởi động lại cửa sổ từ giá trị khởi điểm mới: ${protocolFacts.cstCalibrationCeilingMultiplier} lần chi phí trả gần nhất, với sàn ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST cho điểm khởi đầu. Từ đó chi phí giảm tuyến tính về không trong thời lượng của cửa sổ. Số CST đã chi bị đốt trên đường đi.`,
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'cst-free-quiet': {
    prompt:
      'Giao thức đã yên ắng một quãng dài, và cửa sổ hiệu chỉnh CST đã trôi qua hoàn toàn. Điều gì đúng lúc này?',
    options: {
      a: 'Một nét bút CST gần như không tốn gì \u2014 bất kỳ ai nắm giữ dù chỉ một ít CST cũng có thể kéo dài chu kỳ.',
      b: 'Chu kỳ tự hoàn tất.',
      c: 'Nét bút CST bị vô hiệu cho đến khi có một nét bút ETH.',
      d: 'Chi phí CST đã tăng đến trần.',
    },
    explanation:
      'Đường giảm có thể chạm không, và đó là có chủ đích: nó bảo đảm chu kỳ luôn có thể được kéo dài bởi bất kỳ ai nắm giữ một ít CST. Chu kỳ không bao giờ tự hoàn tất \u2014 hoàn tất luôn là một giao dịch do ai đó gửi.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'window-feedback-loop': {
    prompt:
      'Một loạt nét bút ETH quét qua chu kỳ. Điều đó làm gì với thời lượng của cửa sổ hiệu chỉnh CST?',
    options: {
      a: `Mỗi nét bút ETH rút ngắn nó khoảng ${percent(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture)}%, nên chi phí CST giảm nhanh hơn và nét bút CST sớm trở nên hấp dẫn.`,
      b: `Mỗi nét bút ETH kéo dài nó khoảng ${percent(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture)}%, làm chậm đường giảm của CST.`,
      c: 'Không gì cả \u2014 hai loại tiền độc lập với nhau.',
      d: 'Cửa sổ đặt lại về thời lượng ban đầu.',
    },
    explanation: `Thời lượng của cửa sổ là một tham số sống và là một trong những vòng phản hồi lặng lẽ của giao thức: mỗi nét bút ETH rút ngắn nó khoảng ${percent(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture)}%, mỗi nét bút CST kéo dài nó khoảng ${percent(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture)}%. Hoạt động ETH sôi động đẩy nhanh đường giảm của CST, và hoạt động CST sôi động lại làm chậm nó \u2014 đẩy mỗi chu kỳ về một cán cân hài hòa.`,
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'participation-cst-timing': {
    prompt:
      'Hai nét bút khắc CST tham gia với các tham số lúc ra mắt: một nét đến 1 giây sau nét bút trước, nét kia kết thúc trọn một ngày yên lặng. Mỗi nét khắc khoảng bao nhiêu?',
    options: {
      a: `Khoảng ${viDecimal(oneSecondExample.cst)} CST và khoảng ${viDecimal(oneDayExample.cst)} CST \u2014 lượng này tăng theo căn bậc hai của thời gian đã trôi qua.`,
      b: `Mỗi nét một mức cố định ${cst(100)} CST, bất kể thời điểm.`,
      c: 'Bằng nhau \u2014 thời điểm không bao giờ quan trọng.',
      d: 'Không cho cả hai \u2014 chỉ hoàn tất mới khắc CST.',
    },
    explanation: `CST tham gia tăng theo căn bậc hai của thời gian kể từ nét bút trước: một nét bút đến sau một giây khắc gần như không có gì (khoảng ${viDecimal(oneSecondExample.cst)} CST), trong khi nét kết thúc một ngày yên lặng khắc hàng trăm (khoảng ${viDecimal(oneDayExample.cst)} CST). Mức cố định ${cst(100)} CST mỗi nét bút là quy tắc V1 ban đầu \u2014 nó biến những chuỗi tốc độ máy thành CST không tốn chi phí, chính là lý do V2 thay thế nó.`,
    funFact:
      'Kiên nhẫn là cách duy nhất để khắc lượng CST đáng kể. Một bot dồn dập đặt nét bút mỗi giây khắc được xấp xỉ không.',
    referenceLabel: 'Sách trắng \u00a77.1 \u2014 Quy tắc khắc',
  },
  'cst-max-cost-protection': {
    prompt:
      'Khi gửi một nét bút CST, điều gì bảo vệ Kestrel khỏi việc trả nhiều hơn dự kiến nếu giao dịch của cô đến muộn?',
    options: {
      a: 'Cô chỉ định chi phí tối đa mình chấp nhận; nét bút không thể chi nhiều hơn mức được cho phép.',
      b: 'Không gì cả \u2014 giá tại thời điểm thực thi là giá cô trả.',
      c: 'Hội đồng Vũ trụ hoàn lại phần thu quá sau chu kỳ.',
      d: 'Chi phí CST không bao giờ thay đổi giữa lúc ký và lúc thực thi.',
    },
    explanation:
      'Người tham gia gửi nét bút CST chỉ định chi phí tối đa họ chấp nhận, nên một nét bút đến muộn hơn dự kiến không thể chi nhiều hơn mức được cho phép. Điều này quan trọng nhất ngay sau khi một nét bút CST khác khởi động lại cửa sổ ở giá trị cao hơn.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'endurance-definition': {
    prompt:
      'Ari đặt nét bút vào một buổi chiều chậm rãi và không ai thay thế anh trong mười giờ liền \u2014 khoảng lặng dài nhất của chu kỳ. Anh đang trong hàng nhận danh hiệu nào?',
    options: {
      a: 'Quán quân Bền bỉ \u2014 anh giữ vị trí người đặt nét bút gần nhất trong khoảng liên tục dài nhất.',
      b: 'Chiến binh Thời gian \u2014 anh giữ một danh hiệu trong thời gian dài nhất.',
      c: 'Không danh hiệu nào; danh hiệu phụ thuộc vào số nét bút đã đặt.',
      d: 'Vai trò nét bút cuối cùng, một cách tự động.',
    },
    explanation:
      'Quán quân Bền bỉ là người tham gia giữ vị trí người đặt nét bút gần nhất trong khoảng liên tục dài nhất \u2014 khoảng lặng dài nhất mà một nét bút đơn lẻ trụ qua. Luồng Chiến binh Thời gian ở một tầng cao hơn và đo điều khác: chính danh hiệu Quán quân Bền bỉ được giữ trong bao lâu.',
    referenceLabel: 'Sách trắng \u00a75.2 \u2014 Quán quân Bền bỉ và Chiến binh Thời gian',
  },
  'chrono-definition': {
    prompt:
      'Kỷ lục mười giờ của Ari từ câu trước đứng vững thêm hai ngày trước khi Bea vượt qua. Chiến binh Thời gian đang đo ai?',
    options: {
      a: 'Bất kỳ ai giữ danh hiệu Quán quân Bền bỉ trong khoảng liên tục dài nhất \u2014 hai ngày Ari giữ kỷ lục được tính cho anh.',
      b: 'Bất kỳ ai phản ứng nhanh nhất sau nét bút của người tham gia khác.',
      c: 'Bất kỳ ai tham gia nhiều chu kỳ nhất tính chung.',
      d: 'Bất kỳ ai đặt nét bút cuối cùng của chu kỳ.',
    },
    explanation:
      'Bền bỉ đo khoảng lặng bạn tạo ra; luồng Chrono đo kỷ lục của bạn trụ được bao lâu. Khoảng bền bỉ của Ari là mười giờ, nhưng thời gian anh giữ vị trí Quán quân Bền bỉ kéo dài hai ngày \u2014 và chính thời gian giữ vị trí đó là điều luồng Chiến binh Thời gian chấm điểm. Cả hai chỉ được quyết định khi hoàn tất.',
    referenceLabel: 'Sách trắng \u00a75.2 \u2014 Quán quân Bền bỉ và Chiến binh Thời gian',
  },
  'eth-selection-count': {
    prompt: 'ETH Tinh tuyển phân phối phần của mình khi hoàn tất như thế nào?',
    options: {
      a: `${protocolFacts.ethStellarSelectionRecipients} lượt được chọn từ quỹ nét bút của chu kỳ và chia đều ${protocolFacts.stellarSelectionEthPercentage}% dự trữ.`,
      b: `${protocolFacts.nftStellarSelectionRecipients} lượt được chọn, mỗi lượt nhận ETH và một NFT.`,
      c: 'Một lượt được chọn và nhận toàn bộ phần này.',
      d: 'Mọi người tham gia nhận một phần bằng nhau.',
    },
    explanation: `ETH Tinh tuyển chọn ${protocolFacts.ethStellarSelectionRecipients} lượt, chia đều ${protocolFacts.stellarSelectionEthPercentage}% dự trữ. Con số ${protocolFacts.nftStellarSelectionRecipients} lượt thuộc về NFT Tinh tuyển riêng biệt, vốn mang CST và NFT thay vì ETH.`,
    referenceLabel: 'Sách trắng \u00a75.3 \u2014 Tinh tuyển',
  },
  'nft-selection-count': {
    prompt: 'Mỗi người nhận NFT Tinh tuyển nhận gì, và có bao nhiêu lượt được chọn?',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST và một Cosmic Signature NFT, chọn ${protocolFacts.nftStellarSelectionRecipients} lần từ quỹ nét bút.`,
      b: `Một phần ETH, chọn ${protocolFacts.ethStellarSelectionRecipients} lần.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, chọn một lần.`,
      d: `Chỉ một NFT, chọn ${protocolFacts.typicalNftsPerCycle} lần.`,
    },
    explanation: `NFT Tinh tuyển chọn ${protocolFacts.nftStellarSelectionRecipients} lượt; mỗi lượt mang ${cst(protocolFacts.specialAllocationCst)} CST và một NFT. CST ghi nhận luôn đi cùng NFT của nó \u2014 mọi lần phân phối NFT khi hoàn tất đều ghép đôi hai thứ này.`,
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'draws-with-replacement': {
    prompt:
      'Cùng một người tham gia có thể được chọn nhiều lần trong Tinh tuyển của một chu kỳ không?',
    options: {
      a: 'Có \u2014 các lượt chọn có hoàn lại, và số lượt tăng theo số nét bút đã đặt.',
      b: 'Không \u2014 mỗi người tham gia chỉ được chọn tối đa một lần.',
      c: 'Chỉ người tham gia có từ mười nét bút trở lên mới có thể lặp lại.',
      d: 'Chỉ khi Hội đồng Vũ trụ phê duyệt việc lặp lại.',
    },
    explanation:
      'Các lượt chọn có hoàn lại, nên cùng một người tham gia có thể được chọn nhiều lần. Mỗi nét bút ghi nhận một lượt, khiến tần suất được chọn tỷ lệ với mức tham gia \u2014 cơ chế tăng theo hoạt động thay vì chia định mức một lượt cho mỗi địa chỉ.',
    referenceLabel: 'Sách trắng \u00a75.3 \u2014 Tinh tuyển',
  },
  'anchored-rwlk-track': {
    prompt: 'Random Walk NFT đang neo giữ nhận gì từ một chu kỳ?',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt chọn, mỗi lượt ${cst(protocolFacts.specialAllocationCst)} CST cộng một Cosmic Signature NFT, tính theo số NFT đang neo giữ \u2014 và không có ETH.`,
      b: `Một phần theo tỷ lệ của ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ ETH.`,
      c: 'Không gì cả \u2014 chỉ Cosmic Signature NFT mới có thể neo giữ.',
      d: 'Một khoản CST trả một lần khi gỡ neo.',
    },
    explanation: `Random Walk NFT neo giữ riêng và với mục đích khác: chúng nhận các lượt chọn trong Tinh tuyển NFT neo giữ, ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt mỗi chu kỳ, mỗi lượt mang CST và một Cosmic Signature NFT. Phân phối neo giữ ETH thuộc riêng về Cosmic Signature NFT đang neo giữ \u2014 neo giữ Random Walk không mang theo ETH.`,
    referenceLabel: 'Sách trắng \u00a78 \u2014 Neo giữ',
  },
  'exclusivity-window': {
    prompt: 'Người đặt nét bút cuối cùng giữ quyền hoàn tất độc quyền trong bao lâu?',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours} giờ`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ`,
      c: `${protocolFacts.initialCycleTimeIncrementHours} giờ`,
      d: `${protocolFacts.initialCstCalibrationWindowHours} giờ`,
    },
    explanation: `Cửa sổ độc quyền là ${protocolFacts.finalGestureExclusivityHours} giờ; sau đó bất kỳ ai cũng có thể hoàn tất và tiếp quản vai trò người nhận. Con số ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ là đếm ngược ban đầu sau nét bút mở của một chu kỳ \u2014 một đồng hồ hoàn toàn khác.`,
    funFact: `V1 chỉ cho người đặt nét bút cuối cùng ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ độc quyền. V2 gấp đôi lên sau khi các chu kỳ thực tế cho thấy người ta thực sự ngủ quên qua thời hạn.`,
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'escrow-timeout': {
    prompt:
      'Juno được chọn trong ETH Tinh tuyển nhưng không bao giờ nhận về ETH đang ký quỹ. Điều gì xảy ra sau thời hạn?',
    options: {
      a: `Sau ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, bất kỳ ai cũng có thể nhận về phân bổ chưa được nhận cho chính họ.`,
      b: 'Nó quay về Dự trữ chu kỳ.',
      c: 'Nó bị đốt.',
      d: 'Nó chờ trong ký quỹ vô thời hạn đến khi Juno xuất hiện.',
    },
    explanation: `Phân bổ ký quỹ và tài sản đính kèm chờ ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần; sau đó, các hợp đồng cho phép bất kỳ ai nhận về một phân bổ chưa được nhận cho chính họ. Quy tắc này phản chiếu cửa sổ hoàn tất mở: mọi phân phối cuối cùng đều đến tay người muốn nó. Hãy nhận về kịp thời.`,
    referenceLabel: 'Sách trắng \u00a75.4 \u2014 Giao nhận, ký quỹ và thời hạn',
  },
  'push-vs-pull': {
    prompt: 'ETH nào được gửi trực tiếp trong lúc hoàn tất, và ETH nào chờ trong ký quỹ?',
    options: {
      a: 'Phân bổ Signature và khoản chuyển Hàng hóa công đi trực tiếp; ETH của Chiến binh Thời gian và các phần ETH Tinh tuyển chờ trong ví phân bổ.',
      b: 'Mọi thứ được gửi trực tiếp đến từng người nhận.',
      c: 'Mọi thứ chờ trong ký quỹ, kể cả phần của người nhận chu kỳ.',
      d: 'Chỉ CST được ký quỹ; toàn bộ ETH đi trực tiếp.',
    },
    explanation:
      'Việc phân phối được cố ý chia thành đẩy và kéo. ETH của người nhận chu kỳ và khoản chuyển Hàng hóa công được đẩy đi trong lúc hoàn tất; các phân bổ ETH phụ được đặt vào ví phân bổ để từng người nhận nhận về. CST và NFT được khắc trực tiếp cho người nhận.',
    referenceLabel: 'Sách trắng \u00a75.4 \u2014 Giao nhận, ký quỹ và thời hạn',
  },
  'council-proposal-threshold': {
    prompt: 'Một địa chỉ cần bao nhiêu trọng số CST được ủy quyền để gửi một đề xuất điều phối?',
    options: {
      a: `Ít nhất ${protocolFacts.councilProposalThresholdCst} CST.`,
      b: `Ít nhất ${cst(protocolFacts.specialAllocationCst)} CST.`,
      c: `Ít nhất ${cst(protocolFacts.outreachReserveCst)} CST.`,
      d: 'Bất kỳ lượng nào \u2014 không có ngưỡng.',
    },
    explanation: `Ngưỡng đề xuất là ${protocolFacts.councilProposalThresholdCst} CST trọng số được ủy quyền \u2014 khiêm tốn một cách có chủ đích, để việc đề xuất luôn dễ tiếp cận. Con số ${cst(protocolFacts.specialAllocationCst)} CST là CST ghi nhận đi cùng mỗi lần phân phối NFT, một hằng số khác dễ bị nhầm với nó.`,
    referenceLabel: 'Sách trắng \u00a79 \u2014 Hội đồng Vũ trụ',
  },
  'council-timeline': {
    prompt: 'Một đề xuất điều phối được gửi hôm nay. Dòng thời gian tiếp theo là gì?',
    options: {
      a: `Độ trễ điều phối ${protocolFacts.councilVotingDelayDays} ngày, rồi một giai đoạn điều phối ${protocolFacts.councilVotingPeriodWeeks} tuần.`,
      b: 'Nó có hiệu lực ngay nếu người đề xuất nắm đủ CST.',
      c: `Độ trễ ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, rồi một giai đoạn điều phối ${protocolFacts.councilVotingDelayDays} ngày.`,
      d: `Độ trễ ${protocolFacts.finalGestureExclusivityHours} giờ, rồi nó tự thực thi.`,
    },
    explanation: `Đề xuất chờ qua độ trễ điều phối ${protocolFacts.councilVotingDelayDays} ngày, rồi mở trong giai đoạn điều phối ${protocolFacts.councilVotingPeriodWeeks} tuần. Độ trễ cho người nắm giữ thời gian điều chỉnh ủy quyền trước ảnh chụp nhanh; không gì có hiệu lực ngay lập tức.`,
    referenceLabel: 'Sách trắng \u00a79 \u2014 Hội đồng Vũ trụ',
  },
  'quorum-rule': {
    prompt: 'Khi nào một đề xuất điều phối được thông qua?',
    options: {
      a: `Tán thành vượt phản đối, và trọng số tán thành cộng bỏ trống chạm túc số điều phối ${protocolFacts.councilQuorumPercent}%.`,
      b: 'Riêng tán thành chạm một nửa tổng cung CST.',
      c: `Tán thành, phản đối và bỏ trống cộng lại chạm ${protocolFacts.councilQuorumPercent}%.`,
      d: 'Chủ sở hữu giao thức ký xác nhận kết quả.',
    },
    explanation: `Hai điều kiện phải đồng thời đúng: tán thành vượt phản đối, và tán thành cộng bỏ trống chạm túc số điều phối ${protocolFacts.councilQuorumPercent}% tổng cung CST. Trọng số phản đối cố ý không được tính vào túc số \u2014 phản đối một đề xuất không thể vô tình giúp nó chạm ngưỡng.`,
    referenceLabel: 'Sách trắng \u00a79 \u2014 Hội đồng Vũ trụ',
  },
  'weight-activation': {
    prompt:
      'Rook nắm CST trong ví nhưng chưa bao giờ đụng đến Hội đồng. CST của anh biểu thị bao nhiêu trọng số điều phối?',
    options: {
      a: 'Không có \u2014 trọng số chỉ kích hoạt khi ủy quyền, cho chính anh hoặc một địa chỉ khác.',
      b: 'Một đơn vị cho mỗi CST, tự động.',
      c: 'Tùy anh đã nắm CST bao lâu.',
      d: 'Trọng số đến từ NFT đang neo giữ, không phải CST.',
    },
    explanation:
      'Trọng số điều phối kích hoạt khi ủy quyền: người nắm giữ ủy quyền cho chính mình hoặc một địa chỉ khác, và từ đó mỗi CST biểu thị một đơn vị trọng số. CST chưa ủy quyền hoàn toàn không mang trọng số \u2014 chỉ nắm giữ không phải là tham gia điều phối.',
    referenceLabel: 'Sách trắng \u00a77.3 \u2014 Trọng số điều phối',
  },
  'time-increment-growth': {
    prompt:
      'Mức tăng thời gian mỗi nét bút cộng thêm khởi đầu ở đúng một giờ. Nó tiến hóa thế nào?',
    options: {
      a: `Nó lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất, nên các chu kỳ dài dần theo năm tháng.`,
      b: 'Nó cố định ở một giờ mãi mãi.',
      c: 'Nó gấp đôi mỗi chu kỳ.',
      d: 'Nó co lại khi có thêm người tham gia.',
    },
    explanation: `Mức tăng lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất. Sự tích lũy lặng lẽ làm việc của nó: các chu kỳ dài ra, tốc độ khắc NFT chậm lại, và nhịp điệu của giao thức giãn ra theo thiết kế khi nó già đi.`,
    referenceLabel: 'Sách trắng \u00a73.2 \u2014 Đếm ngược',
  },
  'typical-cst-fixed': {
    prompt: 'Một chu kỳ điển hình khắc bao nhiêu CST cố định, và cơ cấu ra sao?',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST \u2014 ${cst(protocolFacts.specialAllocationCst)} CST đi cùng mỗi lần trong ${protocolFacts.typicalNftsPerCycle} lần phân phối NFT, cộng ${cst(protocolFacts.outreachReserveCst)} CST cho Dự trữ truyền thông.`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST, toàn bộ cho người nhận chu kỳ.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, toàn bộ cho truyền thông cộng đồng.`,
      d: 'Nó thay đổi khó lường từ chu kỳ này sang chu kỳ khác.',
    },
    explanation: `Các dòng cố định là chính xác: ${protocolFacts.typicalNftsPerCycle} lần khắc đi cùng NFT, mỗi lần ${cst(protocolFacts.specialAllocationCst)} CST, cộng ${cst(protocolFacts.outreachReserveCst)} CST truyền thông, tổng cộng ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST trong một chu kỳ điển hình. CST tham gia động từ các nét bút riêng lẻ là phần cộng thêm và phụ thuộc vào thời điểm.`,
    referenceLabel: 'Sách trắng \u00a77.1 \u2014 Quy tắc khắc',
  },
  'attached-assets-destination': {
    prompt: 'Wren đính kèm một token ERC-20 vào nét bút của mình. Tài sản đính kèm đi đâu?',
    options: {
      a: 'Vào ký quỹ của ví phân bổ \u2014 người nhận của chu kỳ có quyền ưu tiên nhận về nó sau khi hoàn tất.',
      b: 'Vào Dự trữ chu kỳ, cùng với ETH của nét bút.',
      c: 'Quay về Wren khi chu kỳ hoàn tất.',
      d: 'Nó bị đốt khi hoàn tất.',
    },
    explanation:
      'Tài sản đính kèm không bao giờ nhập vào dự trữ ETH. Chúng được ví phân bổ giữ, và người nhận của chu kỳ có quyền ưu tiên nhận về chúng sau khi hoàn tất \u2014 chịu cùng thời hạn nhận về mở như mọi phân bổ ký quỹ khác.',
    referenceLabel: 'Sách trắng \u00a74.4 \u2014 Lời nhắn và tài sản đính kèm',
  },
  'next-cycle-delay': {
    prompt: 'Một chu kỳ vừa được hoàn tất. Khi nào chu kỳ tiếp theo kích hoạt?',
    options: {
      a: `Sau một độ trễ ngắn \u2014 mặc định ${protocolFacts.defaultNextCycleDelayMinutes} phút, dù giá trị trực tiếp trên chuỗi có thể điều chỉnh và là giá trị quyết định.`,
      b: 'Ngay lập tức, trong cùng giao dịch.',
      c: `Đúng ${protocolFacts.finalGestureExclusivityHours} giờ sau.`,
      d: 'Chỉ khi chủ sở hữu khởi động thủ công.',
    },
    explanation: `Sau khi hoàn tất, chu kỳ tiếp theo kích hoạt sau một độ trễ ngắn, mặc định ${protocolFacts.defaultNextCycleDelayMinutes} phút. Độ trễ trực tiếp được lưu trên chuỗi và chủ sở hữu có thể cấu hình, nên hợp đồng \u2014 không phải giá trị mặc định \u2014 là nguồn chính xác. Khi đã kích hoạt, các cửa sổ hiệu chỉnh của chu kỳ mới mở ra.`,
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
