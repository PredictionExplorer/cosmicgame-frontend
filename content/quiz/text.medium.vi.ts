import { protocolFacts } from '@/content/protocol-facts';

import { formatCount, formatNumber } from '@/utils/format/numbers';

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
      a: 'ETH và CST có quy tắc chi phí cơ sở riêng. Khi chu kỳ mở, chi phí ETH giảm trong cửa sổ hiệu chỉnh; mỗi nét bút ETH nâng chi phí cơ sở tiếp theo. Chi phí CST giảm theo tốc độ lưu trên chuỗi. Gần hạn hoàn tất, cả hai chi phí có phụ phí cuối chu kỳ, nhưng phụ phí không nâng chi phí cơ sở tiếp theo hay trọng số Tinh tuyển.',
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
    explanation:
      'ETH và CST có quy tắc chi phí cơ sở riêng. Khi chu kỳ mở, chi phí ETH giảm trong cửa sổ hiệu chỉnh; mỗi nét bút ETH nâng chi phí cơ sở tiếp theo. Chi phí CST giảm theo tốc độ lưu trên chuỗi. Gần hạn hoàn tất, cả hai chi phí có phụ phí cuối chu kỳ, nhưng phụ phí không nâng chi phí cơ sở tiếp theo hay trọng số Tinh tuyển.',
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
      'Phần trả dư vượt ngưỡng tối thiểu được hoàn lại trong cùng giao dịch. Dưới ngưỡng đó, việc hoàn lại tốn nhiều gas hơn số tiền trả về, nên phần chênh ở lại trong dự trữ. Quy tắc này tránh việc chi phí hoàn trả lớn hơn số tiền được hoàn.',
    referenceLabel: 'Sách trắng \u00a74.1 \u2014 Nét bút ETH',
  },
  'cst-window-restart': {
    prompt: 'Lyra đặt một nét bút CST. Điều đó làm gì với cửa sổ hiệu chỉnh CST?',
    options: {
      a: 'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      b: 'Không gì cả \u2014 cửa sổ tiếp tục giảm từ chỗ đang đứng.',
      c: `Chi phí khóa ở ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST cho phần còn lại của chu kỳ.`,
      d: 'Cửa sổ đóng và nét bút CST tạm dừng đến chu kỳ sau.',
    },
    explanation:
      'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'cst-free-quiet': {
    prompt:
      'Giao thức đã yên ắng một quãng dài, và cửa sổ hiệu chỉnh CST đã trôi qua hoàn toàn. Điều gì đúng lúc này?',
    options: {
      a: 'Chi phí nét bút CST có thể về 0. Nét bút vẫn phải đáp ứng quy tắc chu kỳ hiện tại và trả phí gas.',
      b: 'Chu kỳ tự hoàn tất.',
      c: 'Nét bút CST bị vô hiệu cho đến khi có một nét bút ETH.',
      d: 'Chi phí CST đã tăng đến trần.',
    },
    explanation:
      'Khi cửa sổ hiệu chỉnh CST đi hết, chi phí nét bút CST có thể về 0. Giao dịch vẫn phải đáp ứng các điều kiện hiện tại của hợp đồng và trả phí gas. Chu kỳ không tự hoàn tất; cần có người gửi giao dịch hoàn tất.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'window-feedback-loop': {
    prompt:
      'Một loạt nét bút ETH quét qua chu kỳ. Điều đó làm gì với thời lượng của cửa sổ hiệu chỉnh CST?',
    options: {
      a: 'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      b: `Mỗi nét bút ETH kéo dài nó khoảng ${percent(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture)}%, làm chậm đường giảm của CST.`,
      c: 'Không gì cả \u2014 hai loại tiền độc lập với nhau.',
      d: 'Cửa sổ đặt lại về thời lượng ban đầu.',
    },
    explanation:
      'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'participation-cst-timing': {
    prompt:
      'Hai nét bút khắc CST tham gia với các tham số lúc ra mắt: một nét đến 1 giây sau nét bút trước, nét kia kết thúc trọn một ngày yên lặng. Mỗi nét khắc khoảng bao nhiêu?',
    options: {
      a: `Khoảng ${formatNumber(Number(oneSecondExample.cst.replaceAll(',', '')), 'vi', { maximumFractionDigits: 6 })} CST và ${formatNumber(Number(oneDayExample.cst.replaceAll(',', '')), 'vi', { maximumFractionDigits: 6 })} CST cho người tham gia trước; lượng tăng tuyến tính.`,
      b: `Mỗi nét một mức cố định ${cst(100)} CST, bất kể thời điểm.`,
      c: 'Bằng nhau \u2014 thời điểm không bao giờ quan trọng.',
      d: 'Không cho cả hai \u2014 chỉ hoàn tất mới khắc CST.',
    },
    explanation: `Số đơn vị nhỏ nhất của CST tham gia bằng ${protocolFacts.dynamicCstRewardFormula}. Thời gian đã trôi qua tính bằng giây, còn mức tăng thời gian của chu kỳ tính bằng micro giây. Chia kết quả cho 10^18 để biểu diễn bằng CST. Nét bút tiếp theo khắc toàn bộ cho người tham gia trước. Nét bút đầu tiên không tạo CST tham gia; hoàn tất cũng không thanh toán thêm khoảng thời gian cuối.`,
    funFact:
      'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
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
      'Ari đặt nét bút vào một buổi chiều chậm rãi và không ai thay thế anh trong mười giờ liền \u2014 khoảng lặng dài nhất của chu kỳ. Anh hiện đủ điều kiện nhận danh hiệu nào?',
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
      'Ari lập kỷ lục giữ vị trí nét bút gần nhất trong mười giờ và giữ danh hiệu Quán quân Bền bỉ hai ngày trước khi Bea vượt qua. Khoảng thời gian nào được tính cho danh hiệu Chiến binh Thời gian?',
    options: {
      a: 'Bất kỳ ai giữ danh hiệu Quán quân Bền bỉ trong khoảng liên tục dài nhất \u2014 hai ngày Ari giữ kỷ lục được tính cho anh.',
      b: 'Bất kỳ ai phản ứng nhanh nhất sau nét bút của người tham gia khác.',
      c: 'Bất kỳ ai tham gia nhiều chu kỳ nhất tính chung.',
      d: 'Bất kỳ ai đặt nét bút cuối cùng của chu kỳ.',
    },
    explanation:
      'Quán quân Bền bỉ được tính theo thời gian giữ vị trí nét bút gần nhất; Chiến binh Thời gian được tính theo thời gian giữ danh hiệu Quán quân Bền bỉ. Khoảng bền bỉ của Ari là mười giờ, nhưng thời gian anh giữ vị trí Quán quân Bền bỉ kéo dài hai ngày \u2014 và chính thời gian giữ vị trí đó là điều luồng Chiến binh Thời gian chấm điểm. Cả hai chỉ được quyết định khi hoàn tất.',
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
    explanation: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'draws-with-replacement': {
    prompt:
      'Cùng một người tham gia có thể được chọn nhiều lần trong Tinh tuyển của một chu kỳ không?',
    options: {
      a: 'Trọng số là chi phí ETH cơ sở lúc đặt nét bút, không gồm mức giảm hay phụ phí cuối chu kỳ. Một địa chỉ có thể được chọn nhiều lần.',
      b: 'Không \u2014 mỗi người tham gia chỉ được chọn tối đa một lần.',
      c: 'Chỉ người tham gia có từ mười nét bút trở lên mới có thể lặp lại.',
      d: 'Chỉ khi Hội đồng Vũ trụ phê duyệt việc lặp lại.',
    },
    explanation:
      'Cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia đều dùng trọng số từng nét bút. Trọng số là chi phí ETH cơ sở tại thời điểm đó, chưa giảm bằng Random Walk NFT và chưa cộng phụ phí cuối chu kỳ. Nét bút CST dùng cùng chi phí ETH cơ sở đương thời. Các lượt chọn có hoàn lại, nên một địa chỉ có thể được chọn nhiều lần. Tinh tuyển NFT neo giữ xét riêng các Random Walk NFT đang neo giữ.',
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
    explanation: `Khi hoàn tất, giao thức thử chuyển ${protocolFacts.publicGoodsPercentage}% Dự trữ chu kỳ vào Kho Hàng hóa công. Sau đó bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild. Chủ sở hữu có thể thay đổi đơn vị thụ hưởng. Nếu chuyển từ giao thức vào kho thất bại, phần này có thể ở lại dự trữ mà không hủy hoàn tất.`,
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
    explanation:
      'CST có thể dùng để đặt nét bút hoặc, sau khi ủy quyền, làm Trọng số Điều phối trong Hội đồng Vũ trụ. Hội đồng chỉ quản lý tài sản và quyền mà mình thực sự nắm giữ. Hiện Hội đồng không sở hữu giao thức chính; chuyển giao hoặc từ bỏ quyền cần các thao tác riêng trên chuỗi.',
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
      'Rook nắm CST trong ví nhưng chưa từng ủy quyền trọng số trong Hội đồng. CST của anh biểu thị bao nhiêu trọng số điều phối?',
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
    explanation: `Mức tăng lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất. Mức tăng này có xu hướng kéo dài chu kỳ và làm chậm tốc độ khắc NFT. Thời lượng thực tế còn phụ thuộc vào hoạt động của người tham gia.`,
    referenceLabel: 'Sách trắng \u00a73.2 \u2014 Đếm ngược',
  },
  'typical-cst-fixed': {
    prompt: 'Một chu kỳ điển hình khắc bao nhiêu CST cố định, và cơ cấu ra sao?',
    options: {
      a: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST, toàn bộ cho người nhận chu kỳ.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, toàn bộ cho truyền thông cộng đồng.`,
      d: 'Nó thay đổi khó lường từ chu kỳ này sang chu kỳ khác.',
    },
    explanation: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
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
      a: `Chu kỳ tiếp theo mở sau thời gian chờ được cấu hình trên chuỗi tính từ hoàn tất thành công, hiện là ${protocolFacts.currentNextCycleDelayDays} ngày. Chủ sở hữu có thể đổi thời gian này; mặc định ban đầu ${protocolFacts.defaultNextCycleDelayMinutes} phút không phải cấu hình hiện tại.`,
      b: 'Ngay lập tức, trong cùng giao dịch.',
      c: `Đúng ${protocolFacts.finalGestureExclusivityHours} giờ sau.`,
      d: 'Chỉ khi chủ sở hữu khởi động thủ công.',
    },
    explanation: `Chu kỳ tiếp theo mở sau thời gian chờ được cấu hình trên chuỗi tính từ hoàn tất thành công, hiện là ${protocolFacts.currentNextCycleDelayDays} ngày. Chủ sở hữu có thể đổi thời gian này; mặc định ban đầu ${protocolFacts.defaultNextCycleDelayMinutes} phút không phải cấu hình hiện tại.`,
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
