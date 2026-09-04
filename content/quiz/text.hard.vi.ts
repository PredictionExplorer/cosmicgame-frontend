import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('vi-VN');
/** Vietnamese decimal mark for a protocol figure quoted in English notation ("0.0001"). */
const viDecimal = (value: string | number): string => String(value).replace('.', ',');

/**
 * Hard tier: edge cases, adversarial forensics, upgrade history, the art
 * pipeline, and security design. Nearly every question is a scenario; many
 * distractors are superseded V1 behaviors or adjacent-mechanic confusions.
 */
export const hardQuestionsTextVi = {
  'late-gesture-semantics': {
    prompt:
      'Đếm ngược đã hết hạn một phút trước, nhưng chưa ai hoàn tất. Fen đặt một nét bút. Chính xác nó làm gì?',
    options: {
      a: 'Nó cộng một mức tăng vào thời điểm hoàn tất đã lưu và giành lấy vị trí nét bút cuối cùng \u2014 nó không khởi động lại đồng hồ.',
      b: 'Nó khởi động lại toàn bộ đếm ngược từ thời điểm hiện tại.',
      c: 'Nó bị hoàn nguyên \u2014 không thể đặt nét bút sau khi hết hạn.',
      d: 'Nó được tính cho chu kỳ tiếp theo.',
    },
    explanation:
      'Việc kéo dài áp lên thời gian đã lưu, không phải thời điểm hiện tại. Một nét bút đặt sau khi hết hạn nhưng trước khi việc hoàn tất được thực thi cộng một mức tăng vào giá trị đã lưu và giành lấy vị trí nét bút cuối cùng. Đếm ngược không được đặt lại từ thời điểm hiện tại, nên sau nét bút muộn này, chu kỳ vẫn có thể đã đủ điều kiện hoàn tất.',
    referenceLabel: 'Sách trắng \u00a73.2 \u2014 Đếm ngược',
  },
  'refusing-beneficiary': {
    prompt:
      'Một ví hợp đồng tự động giữ nét bút cuối cùng, nhưng nó được xây để từ chối mọi ETH gửi đến. Nó gọi hoàn tất. Điều gì xảy ra?',
    options: {
      a: `Chính giao dịch của nó bị hoàn nguyên khi việc chuyển phân bổ Signature thất bại \u2014 và sau ${protocolFacts.finalGestureExclusivityHours} giờ, bất kỳ ai khác cũng có thể hoàn tất và thay nó nhận vai trò người nhận.`,
      b: 'Hoàn tất thành công và ETH lặng lẽ biến mất.',
      c: 'Hoàn tất thành công và phần ETH của nó tích lũy sang chu kỳ tiếp theo.',
      d: 'Giao thức tạm dừng cho đến khi chủ sở hữu can thiệp.',
    },
    explanation:
      'Phân bổ Signature được đẩy đến người nhận trong lúc hoàn tất, nên một người nhận từ chối ETH khiến chính lời gọi hoàn tất của mình bị hoàn nguyên. Cơ chế xử lý trường hợp này như sau: khi cửa sổ độc quyền trôi qua, cửa sổ hoàn tất mở cho bất kỳ ai hoàn tất và tự trở thành người nhận. Ví từ chối ETH không thể giữ quyền hoàn tất vô thời hạn.',
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'refusing-chrono': {
    prompt:
      'Một hợp đồng từ chối mọi ETH gửi đến khép lại chu kỳ với vai trò Chiến binh Thời gian. Vì sao nó không thể chặn chu kỳ hoàn tất?',
    options: {
      a: 'ETH của nó vào ký quỹ của ví phân bổ, nên việc hoàn tất không bao giờ phụ thuộc vào việc người nhận đó chấp nhận một lệnh chuyển.',
      b: 'Hoàn tất thử lại lệnh chuyển cho đến khi được chấp nhận.',
      c: 'Phần của nó bị bỏ qua và tích lũy sang chu kỳ tiếp theo.',
      d: 'Hội đồng Vũ trụ chuyển hướng phần đó sang một địa chỉ khác.',
    },
    explanation:
      'Người nhận tự nhận về thay vì nhận chuyển trực tiếp: các phân bổ ETH phụ nằm trong ký quỹ thay vì được gửi trong lúc hoàn tất, chính là để không hợp đồng người nhận nào có thể chặn một chu kỳ khép lại. ETH của ví đối nghịch chờ trong ví phân bổ \u2014 nơi mà, nếu không được nhận về đủ lâu, cuối cùng nó thuộc về bất kỳ ai.',
    referenceLabel: 'Sách trắng \u00a711.2 \u2014 Thiết kế phòng vệ',
  },
  'public-goods-transfer-fails': {
    prompt:
      'Trong lúc hoàn tất, khoản chuyển Hàng hóa công không thể hoàn thành. Giao thức làm gì?',
    options: {
      a: 'Hoàn tất vẫn tiến hành, và sự kiện được ghi lại để xử lý sau.',
      b: 'Toàn bộ việc hoàn tất bị hoàn nguyên cho đến khi lệnh chuyển thành công.',
      c: 'Phần đó bị đốt.',
      d: 'Phần đó lặng lẽ được cộng vào phân bổ của người nhận chu kỳ.',
    },
    explanation:
      'Chuyển tiếp chịu lỗi là một lựa chọn thiết kế có chủ đích: một sự cố ở Kho Hàng hóa công không bao giờ được làm kẹt một chu kỳ. Hoàn tất hoàn thành, sự cố được ghi trên chuỗi, và việc chuyển tiếp được xử lý sau. Khác với khoản chuyển trực tiếp cho người nhận chu kỳ, giao dịch có thể bị hoàn nguyên \u2014 nhưng chỉ chính giao dịch của người gọi.',
    referenceLabel: 'Sách trắng \u00a711.2 \u2014 Thiết kế phòng vệ',
  },
  'no-anchored-nfts': {
    prompt:
      'Một chu kỳ hoàn tất khi không có Cosmic Signature NFT nào đang neo giữ. Điều gì xảy ra với phân phối neo giữ?',
    options: {
      a: `${protocolFacts.anchorDistributionPercentage}% của chu kỳ đó bị bỏ qua và phần của nó tích lũy sang chu kỳ tiếp theo.`,
      b: 'Nó được chuyển đến Hàng hóa công.',
      c: 'Nó được giữ đến khi có người neo giữ, rồi trả hồi tố.',
      d: 'Nó được chia cho những người nhận Tinh tuyển.',
    },
    explanation:
      'Nếu không có Cosmic Signature NFT nào đang neo giữ khi hoàn tất, phân phối neo giữ bị bỏ qua và phần của nó chuyển tiếp cùng dự trữ tích lũy. Không gì được giữ lại cho những người neo giữ tương lai \u2014 phân phối của mỗi chu kỳ đọc tập hợp đang neo giữ đúng như hiện trạng.',
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'no-cst-gestures': {
    prompt:
      'Một chu kỳ kết thúc mà không có một nét bút CST nào. Luồng phân bổ nào bị ảnh hưởng, và như thế nào?',
    options: {
      a: 'Luồng nét bút CST cuối cùng bị bỏ qua hoàn toàn trong chu kỳ đó.',
      b: 'CST và NFT của nó chuyển sang người đặt nét bút ETH cuối cùng.',
      c: 'Chu kỳ không thể hoàn tất cho đến khi có người đặt nét bút bằng CST.',
      d: `${cst(protocolFacts.specialAllocationCst)} CST của nó bị đốt để phản đối.`,
    },
    explanation:
      'Chu kỳ không có nét bút CST đơn giản bỏ qua luồng nét bút CST cuối cùng \u2014 không có người nhận thay thế nào được chỉ định, và hoàn tất diễn ra bình thường. Nguyên tắc bỏ qua luồng mà không chỉ định người thay thế cũng áp dụng cho Tinh tuyển Random Walk neo giữ khi không có gì đang neo giữ.',
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'randomness-sources': {
    prompt: 'Độ ngẫu nhiên phía sau các lượt chọn Tinh tuyển và seed nghệ thuật đến từ đâu?',
    options: {
      a: 'Một cấu trúc trên chuỗi gộp mã băm khối trước, phí cơ sở và entropy từ precompile của Arbitrum, với các giá trị được rút qua keccak256.',
      b: 'Một thuê bao oracle Chainlink VRF.',
      c: 'Một nghi thức cam kết-tiết lộ giữa những người tham gia của chu kỳ.',
      d: 'Một seed do đội ngũ gửi trước mỗi lần hoàn tất.',
    },
    explanation:
      'Seed gộp mã băm khối trước, phí cơ sở hiện tại và entropy riêng của Arbitrum từ các precompile ArbSys và ArbGasInfo \u2014 mã băm khối Arbitrum trước, lượng gas tồn đọng và các bộ đếm định giá L1. Đây là chủ nghĩa tối giản có chủ đích: không oracle, không ủy ban bên ngoài, không callback có thể làm kẹt một chu kỳ.',
    referenceLabel: 'Sách trắng \u00a711.3 \u2014 Độ ngẫu nhiên',
  },
  'randomness-limits': {
    prompt: 'Sách trắng nêu thẳng hạn chế nào của độ ngẫu nhiên đó?',
    options: {
      a: 'Về nguyên tắc, sequencer có thể ảnh hưởng đến các đầu vào cấp khối; thiết kế giới hạn phạm vi mà ảnh hưởng đó có thể chạm tới.',
      b: 'Không có \u2014 cấu trúc này được chứng minh là không ai dự đoán được.',
      c: 'Độ ngẫu nhiên thi thoảng thất bại, khiến chu kỳ bị hủy.',
      d: 'Người tham gia có nhiều nét bút có thể dự đoán các lượt chọn.',
    },
    explanation:
      'Sự cân nhắc được nói ra, không giấu đi: về nguyên tắc, sequencer có thể ảnh hưởng đến các đầu vào cấp khối. Thiết kế giới hạn phạm vi ảnh hưởng \u2014 các lượt chọn Tinh tuyển và seed nghệ thuật là những nơi duy nhất tiêu thụ độ ngẫu nhiên, cấu trúc được dùng một lần mỗi lần hoàn tất, và hoàn tất là một giao dịch công khai bất kỳ ai cũng có thể gửi.',
    referenceLabel: 'Sách trắng \u00a711.3 \u2014 Độ ngẫu nhiên',
  },
  'precompile-unavailable': {
    prompt:
      'Một precompile của Arbitrum không khả dụng vào khoảnh khắc hoàn tất. Điều gì xảy ra với cấu trúc ngẫu nhiên?',
    options: {
      a: 'Các lời gọi precompile chịu lỗi; cấu trúc dùng các nguồn còn lại.',
      b: 'Hoàn tất bị hoàn nguyên cho đến khi precompile trở lại.',
      c: 'Chu kỳ chờ và thử lại mỗi giờ.',
      d: 'Chủ sở hữu cung cấp một seed thay thế.',
    },
    explanation:
      'Mọi nguồn entropy đều là tùy chọn theo thiết kế: nếu một lời gọi precompile không khả dụng, cấu trúc chỉ đơn giản gộp những nguồn còn lại. Chủ đề này lặp lại xuyên suốt giao thức \u2014 không gì bên ngoài, kể cả precompile của chính Arbitrum, được phép ngăn chu kỳ hoàn tất.',
    referenceLabel: 'Sách trắng \u00a711.3 \u2014 Độ ngẫu nhiên',
  },
  'v2-flat-cst-problem': {
    prompt: `V1 khắc một mức cố định ${cst(100)} CST mỗi nét bút. Vì sao V2 thay nó bằng công thức căn bậc hai?`,
    options: {
      a: 'Khắc cố định biến các chuỗi nét bút tốc độ máy thành một nguồn CST mới không giới hạn; quy tắc mới khắc theo sự kiên nhẫn, không theo tần suất.',
      b: 'Người tham gia phàn nàn mức cố định quá nhỏ.',
      c: 'Công thức được đơn giản hóa để tiết kiệm gas.',
      d: 'Nó cho phép một lần phân bổ cho đội ngũ.',
    },
    explanation:
      'Với khắc cố định, một loạt nét bút dồn dập chế tạo CST từ chẳng gì ngoài tốc độ. Với quy tắc căn bậc hai, một loạt như vậy khắc xấp xỉ không, trong khi sự tham gia kiên nhẫn tạo ra nguồn cung \u2014 chính công thức là một cơ chế kiểm soát nguồn cung, không chỉ là một đường giá.',
    referenceLabel: 'Sách trắng \u00a712.2 \u2014 Nâng cấp V2',
  },
  'v2-min-imprint-guard': {
    prompt:
      'V2 thêm một tham số cho mọi phương thức nét bút: lượng CST tham gia nhỏ nhất mà người tham gia chấp nhận. Nó dùng để làm gì?',
    options: {
      a: 'Nó bảo vệ người tham gia trước những dịch chuyển thời gian giữa lúc ký và lúc thực thi \u2014 nếu lần khắc rơi dưới sàn của họ, nét bút bị hoàn nguyên.',
      b: 'Nó cho người tham gia yêu cầu thêm CST với một khoản phí.',
      c: 'Nó giới hạn tổng CST một chu kỳ có thể khắc.',
      d: 'Nó là một khoản thuế trên nét bút do Hội đồng kiểm soát.',
    },
    explanation:
      'CST tham gia phụ thuộc vào thời gian kể từ nét bút trước \u2014 và khoảng cách đó có thể co lại giữa lúc ký và lúc thực thi nếu ai khác đến trước. Bảo đảm khắc tối thiểu cho người tham gia nêu sàn của mình, biến việc nhận ít CST hơn dự kiến thành một giao dịch bị hoàn nguyên theo giới hạn đã chọn.',
    referenceLabel: 'Sách trắng \u00a712.2 \u2014 Nâng cấp V2',
  },
  'v2-exclusivity-change': {
    prompt: 'V2 đã làm gì với cửa sổ hoàn tất độc quyền của người đặt nét bút cuối cùng?',
    options: {
      a: `Nó tăng từ ${protocolFacts.initialCycleFinalizationHoursAtLaunch} lên ${protocolFacts.finalGestureExclusivityHours} giờ.`,
      b: `Nó rút xuống ${protocolFacts.initialCycleTimeIncrementHours} giờ để tăng tốc chu kỳ.`,
      c: 'Nó bị loại bỏ \u2014 hoàn tất mở ngay cho mọi người.',
      d: 'Nó trở thành vô hạn \u2014 chỉ người đặt nét bút cuối cùng mới được hoàn tất.',
    },
    explanation: `V2 gấp đôi cửa sổ độc quyền từ ${protocolFacts.initialCycleFinalizationHoursAtLaunch} lên ${protocolFacts.finalGestureExclusivityHours} giờ \u2014 một phản hồi trước hành vi quan sát được: người thật có ngủ, đi xa và quên thời hạn. Cửa sổ vẫn hữu hạn, vì không gì trong giao thức chờ mãi mãi.`,
    referenceLabel: 'Sách trắng \u00a712.2 \u2014 Nâng cấp V2',
  },
  'v2-timing-loophole': {
    prompt: 'Việc siết chặt thời gian của V2 đã đóng một lỗ hổng. Đó là gì?',
    options: {
      a: 'Những nét bút CST gần như không tốn chi phí đặt sau khi hết hạn có thể liên tục đẩy thời hạn ra xa; nay việc kéo dài luôn áp lên thời điểm hoàn tất đã lưu.',
      b: 'Nét bút ETH có thể bị phát lại qua các chu kỳ.',
      c: 'Chủ sở hữu có thể tạm dừng đếm ngược giữa chu kỳ.',
      d: 'NFT đang neo giữ có thể được gỡ neo và neo giữ lại trong một giao dịch.',
    },
    explanation:
      'Khi chi phí CST đã giảm về gần không, những nét bút sau hết hạn gần như không tốn gì \u2014 và nếu mỗi nét kéo dài thời hạn từ thời điểm hiện tại, một chu kỳ có thể bị kéo lê vô thời hạn với chi phí rất thấp. Neo việc kéo dài vào thời gian đã lưu đã đóng lỗ hổng; cùng đợt nâng cấp đó siết chặt phép tính lịch trình để không cấu hình tham số nào có thể ngăn việc hoàn tất.',
    referenceLabel: 'Sách trắng \u00a712.2 \u2014 Nâng cấp V2',
  },
  'v3-what-changes': {
    prompt: 'Nâng cấp V3 dự kiến thay đổi đúng một điều. Điều gì?',
    options: {
      a: 'Giá của việc hành động muộn: trong 20 phút cuối, mọi chi phí nét bút được nhân với một hệ số cộng thêm tăng dần từ 1 lần lên 10 lần.',
      b: 'Quy trình nghệ thuật chuyển sang bộ kết xuất mới.',
      c: 'Nét bút CST bị loại bỏ.',
      d: 'Các tỷ lệ phân bổ được cân đối lại.',
    },
    explanation:
      'V3 không chạm vào gì ngoài giai đoạn cuối: trong 20 phút cuối trước thời điểm hoàn tất chu kỳ, mọi chi phí nét bút \u2014 ETH, ETH kèm Random Walk NFT hay CST \u2014 được nhân với một hệ số cộng thêm tăng theo đa thức từ 1 lần lên 10 lần. Mọi thứ khác trong giao thức giữ nguyên như V2 định nghĩa.',
    referenceLabel: 'Sách trắng \u00a712.3 \u2014 Nâng cấp V3 dự kiến',
  },
  'v3-shape': {
    prompt:
      'Hệ số cộng thêm của V3 là m(t) = 1 + 9\u00b7(t/T)\u2078. Vì sao số mũ bậc tám quan trọng?',
    options: {
      a: 'Hệ số gần như vô hình trong phần lớn cửa sổ và chỉ dốc lên ở những phút cuối \u2014 khoảng 1,04 lần khi còn mười phút, 1,9 lần khi còn năm, 7 lần khi còn một, và 10 lần tại thời điểm đếm ngược về 0.',
      b: 'Nó khiến hệ số tăng tuyến tính xuyên cửa sổ.',
      c: 'Nó áp trọn 10 lần cho toàn bộ cửa sổ cuối.',
      d: 'Nó chỉ ảnh hưởng đến nét bút CST.',
    },
    explanation:
      'Đường tăng bậc tám tập trung phần lớn mức tăng chi phí vào những phút cuối. Nét bút ở đầu cửa sổ chịu mức tăng nhỏ, còn nét bút gần thời hạn chịu mức tăng lớn. Đường tuyến tính hoặc hệ số cố định 10 lần sẽ phân bố mức tăng theo cách khác.',
    referenceLabel: 'Sách trắng \u00a712.3 \u2014 Nâng cấp V3 dự kiến',
  },
  'v3-overtime': {
    prompt:
      'Dưới V3, Zed chờ đến sau khi thời hạn trôi qua và đặt nét bút sau thời hạn. Hệ số nào được áp?',
    options: {
      a: 'Trọn 10 lần \u2014 hệ số chạm 10 lần tại thời hạn và giữ ở đó cho mọi nét bút sau thời hạn.',
      b: 'Không có \u2014 nét bút sau thời hạn trở về 1 lần.',
      c: 'Một nửa mức tối đa, 5 lần.',
      d: 'Nét bút sau thời hạn bị chặn hoàn toàn dưới V3.',
    },
    explanation:
      'Hệ số tăng lên 10 lần tại thời hạn và giữ ở 10 lần cho bất kỳ nét bút nào đặt sau thời hạn. Việc giành vị trí sau hết hạn vẫn khả thi \u2014 quy tắc thời gian đã lưu của V2 vẫn điều khiển đồng hồ \u2014 nhưng dưới V3 những nét bút này phải chịu hệ số chi phí cao hơn.',
    referenceLabel: 'Sách trắng \u00a712.3 \u2014 Nâng cấp V3 dự kiến',
  },
  'owner-mid-cycle': {
    prompt:
      'Giữa chu kỳ, chủ sở hữu quyết định một tỷ lệ cần thay đổi và hợp đồng cần nâng cấp. Chủ sở hữu thực sự có thể làm gì ngay lúc này?',
    options: {
      a: 'Việc thay đổi tỷ lệ và nâng cấp hợp đồng phải chờ đến khoảng giữa các chu kỳ; tham số cốt lõi bị khóa khi chu kỳ đang diễn ra.',
      b: 'Thay đổi tỷ lệ ngay lập tức, nhưng không thay mã.',
      c: 'Nâng cấp hợp đồng, nhưng không thay tham số.',
      d: 'Cả hai, với một chữ ký đồng thuận của Hội đồng.',
    },
    explanation:
      'Khi chu kỳ đang diễn ra, chủ sở hữu không thể thay đổi các tỷ lệ cốt lõi, mức tăng thời gian hay chi phí nét bút, cũng không thể nâng cấp hợp đồng giao thức. Những quyền hẹp hơn, chẳng hạn một số thiết lập của hợp đồng phụ trợ, có giới hạn được mô tả riêng.',
    referenceLabel: 'Sách trắng \u00a713 \u2014 Con đường đến phi tập trung hoàn toàn',
  },
  'owner-cannot-reach': {
    prompt: 'Điều nào trong số này chủ sở hữu có thể chạm tới, ngay cả giữa các chu kỳ?',
    options: {
      a: 'Các chức năng quản trị được mô tả không cho phép trực tiếp chuyển quyền đối với những tài sản này hoặc sửa các bản ghi này.',
      b: 'Phân bổ ký quỹ, nhưng không gì khác.',
      c: 'Seed đã ghi, để sửa tác phẩm bị hỏng.',
      d: 'Số dư CST, trong trường hợp khẩn cấp.',
    },
    explanation:
      'Các chức năng quản trị được mô tả không cho phép trực tiếp thay đổi người nhận phân bổ ký quỹ, quyền sở hữu NFT đã khắc, seed đã ghi hoặc số dư CST. Chủ sở hữu vẫn giữ quyền nâng cấp giữa các chu kỳ theo phạm vi đã công bố, cho đến khi từ bỏ quyền kiểm soát đặc quyền.',
    referenceLabel: 'Sách trắng \u00a713 \u2014 Con đường đến phi tập trung hoàn toàn',
  },
  'owner-endgame': {
    prompt: 'Vai trò chủ sở hữu kết thúc như thế nào, theo cam kết của sách trắng?',
    options: {
      a: 'Khi các nâng cấp còn lại hoàn thành, quyền kiểm soát đặc quyền rời khỏi địa chỉ triển khai vĩnh viễn \u2014 bằng cách chuyển cho Hội đồng Vũ trụ hoặc từ bỏ hoàn toàn, được thông báo trước.',
      b: 'Nó không bao giờ kết thúc; đội ngũ giữ vai trò bảo trì vô thời hạn.',
      c: 'Nó được bán cho người được ủy quyền có trọng số cao nhất trong Hội đồng.',
      d: 'Nó chuyển sang một multisig của công ty vĩnh viễn.',
    },
    explanation:
      'Cam kết là rõ ràng: sau khi các nâng cấp còn lại được triển khai, bắt đầu từ V3, vai trò chủ sở hữu rời khỏi người triển khai vĩnh viễn, với cơ chế chính xác được thông báo trước. Từ đó không bên tư nhân nào có thể nâng cấp giao thức hay thay đổi tham số của nó \u2014 và mỗi bước của quá trình đều hiển thị trên chuỗi, kể cả bước cuối.',
    referenceLabel: 'Sách trắng \u00a713 \u2014 Con đường đến phi tập trung hoàn toàn',
  },
  'postpone-activation-limit': {
    prompt:
      'Chủ sở hữu muốn lùi thời điểm kích hoạt của một chu kỳ sắp tới. Điều gì giới hạn quyền đó?',
    options: {
      a: 'Nó chỉ có tác dụng đến khi nét bút đầu tiên của chu kỳ xuất hiện \u2014 sau đó, chu kỳ nằm ngoài khả năng lùi lại.',
      b: 'Nó có thể tạm dừng một chu kỳ ở bất kỳ điểm nào, kể cả đang bay.',
      c: 'Nó cần một đề xuất của Hội đồng được thông qua trước.',
      d: 'Hoàn toàn không có quyền như vậy.',
    },
    explanation:
      'Lùi thời điểm kích hoạt của một chu kỳ sắp tới là một trong ba quyền kiểm soát hẹp luôn khả dụng \u2014 nhưng chỉ đến khi nét bút đầu tiên của nó xuất hiện. Khoảnh khắc ai đó đặt nét bút, chu kỳ đang diễn ra và cần gạt thời gian của chủ sở hữu biến mất.',
    referenceLabel: 'Sách trắng \u00a713 \u2014 Con đường đến phi tập trung hoàn toàn',
  },
  'no-team-eth': {
    prompt:
      'Dòng chảy định kỳ duy nhất mà đội ngũ điều hướng là gì, và đội ngũ nhận ETH nào từ nét bút?',
    options: {
      a: `${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ cho Dự trữ truyền thông \u2014 và không ví nào của đội ngũ nhận ETH từ nét bút, bao giờ.`,
      b: 'Một tỷ lệ ETH nhỏ của mỗi nét bút.',
      c: 'Phân bổ Signature của mỗi chu kỳ thứ mười.',
      d: 'Hoàn toàn không gì, kể cả CST.',
    },
    explanation: `Dự trữ truyền thông nhận ${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ cho truyền thông cộng đồng \u2014 dòng chảy định kỳ duy nhất mà đội ngũ điều hướng, và nó không mang quyền đặc biệt nào. Về phía ETH, sách trắng tuyệt đối: không ví nào của đội ngũ nhận ETH từ nét bút.`,
    referenceLabel: 'Sách trắng \u00a77.1 \u2014 Quy tắc khắc',
  },
  'art-integrator': {
    prompt: 'Phương pháp số nào tích phân mô phỏng ba vật thể, và vì sao lựa chọn này quan trọng?',
    options: {
      a: 'Bộ tích phân symplectic Yoshida bậc bốn \u2014 nó bảo toàn hành vi năng lượng của hệ trên những khoảng dài.',
      b: 'Các bước Euler đơn giản \u2014 nhanh và đủ tốt cho nghệ thuật.',
      c: 'Một mạng thần kinh xấp xỉ các quỹ đạo.',
      d: 'Nghiệm dạng đóng của các phương trình ba vật thể.',
    },
    explanation:
      'Bộ tích phân symplectic bảo toàn cấu trúc hình học của hệ Hamilton, giúp mô phỏng ổn định trong thời gian dài. Phương pháp này không bảo đảm sai số năng lượng bằng 0. Quy trình sử dụng mô phỏng số vì bài toán ba vật thể không có nghiệm dạng đóng tổng quát.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'art-candidates': {
    prompt: 'Quy trình chọn quỹ đạo trở thành một Signature như thế nào?',
    options: {
      a: 'Một trăm nghìn cấu hình ứng viên được mô phỏng một triệu bước mỗi cấu hình, rồi một phép tổng hợp xếp hạng Borda chấm điểm hỗn độn và độ đều cạnh của tam giác để chọn quỹ đạo thú vị nhất về thị giác.',
      b: 'Quỹ đạo ngẫu nhiên đầu tiên được dùng nguyên trạng.',
      c: 'Đội ngũ tuyển chọn quỹ đạo của mỗi chu kỳ bằng tay.',
      d: 'Chủ sở hữu NFT biểu quyết chọn quỹ đạo ứng viên sau khi khắc.',
    },
    explanation:
      'Seed sinh ra một trăm nghìn ứng viên; mỗi ứng viên được tích phân một triệu bước vật lý; một phép tổng hợp xếp hạng Borda trên các chỉ số hỗn độn và độ đều cạnh chọn ra ứng viên nổi bật. Mọi giai đoạn đều là hàm thuần của seed \u2014 việc tuyển chọn diễn ra bằng thuật toán, bất kỳ ai cũng tái tạo được y hệt.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'art-color': {
    prompt: 'Màu của ba vật thể được chọn như thế nào?',
    options: {
      a: 'Pha trong không gian màu cảm nhận OKLab với độ tách sắc 120 độ cho mỗi vật thể, điều biến bởi độ trôi và một sóng sin.',
      b: 'Đỏ, lục và lam cố định cho mọi Signature.',
      c: 'Lấy mẫu từ ảnh chụp tinh vân thật.',
      d: 'Do chủ sở hữu đầu tiên của NFT chọn lúc khắc.',
    },
    explanation:
      'Màu được pha trong OKLab \u2014 một không gian cảm nhận nơi các khoảng cách số bằng nhau tạo ra mức chênh lệch màu gần tương đương trong cảm nhận của mắt người \u2014 với độ tách sắc 120 độ giữ ba vật thể phân biệt rõ về thị giác. Như mọi thứ phía sau seed, bảng màu là tất định.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'art-spectral': {
    prompt: 'Điều gì khiến các vệt quỹ đạo được kết xuất theo cách đó?',
    options: {
      a: 'Kết xuất quang phổ qua sáu mươi tư dải bước sóng trải từ 380 đến 700 nanomet, với độ dày phụ thuộc vận tốc và độ sâu trường ảnh.',
      b: 'Các nét vector phẳng với bộ lọc phát sáng.',
      c: 'Ảnh chụp màn hình của một trình mô phỏng vật lý, được AI nâng độ phân giải.',
      d: 'Các đường spline tinh chỉnh bằng tay vẽ theo mô phỏng.',
    },
    explanation:
      'Bộ kết xuất coi ánh sáng là một quang phổ, không phải ba kênh màu: sáu mươi tư dải bước sóng trải khắp vùng khả kiến, những vệt có độ dày phản ứng theo vận tốc, và độ sâu trường ảnh cho chiều sâu. Ánh xạ tông AgX, hiệu ứng bloom, các lớp tinh vân OpenSimplex và cân màu hoàn thiện khung hình.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'art-output': {
    prompt: 'Quy trình xuất ra những tệp gì cho mỗi NFT?',
    options: {
      a: 'Một ảnh PNG 16 bit và một video H.265 dài 30 giây.',
      b: 'Chỉ một ảnh thu nhỏ JPEG.',
      c: 'Một ảnh GIF động.',
      d: 'Một tệp vector SVG.',
    },
    explanation:
      'Mỗi Signature được xuất dưới dạng ảnh PNG 16 bit \u2014 gấp đôi độ sâu màu thông thường trên mỗi kênh \u2014 cộng một video H.265 dài 30 giây của quỹ đạo đang chuyển động. Cả hai đều có thể tái tạo từ seed trên chuỗi bởi bất kỳ ai chạy quy trình mã nguồn mở.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'art-server-death': {
    prompt: 'Mọi máy chủ gắn với dự án biến mất vào ngày mai. Điều gì xảy ra với tác phẩm?',
    options: {
      a: 'Mọi Signature có thể được tái tạo từ seed trên chuỗi bằng quy trình kết xuất mã nguồn mở.',
      b: 'Nghệ thuật mất; chỉ siêu dữ liệu còn lại.',
      c: 'Chỉ ảnh thu nhỏ còn lại trong ví.',
      d: 'Tùy vào việc các bản ghim IPFS có được duy trì không.',
    },
    explanation:
      'Seed được lưu trên chuỗi, còn quy trình kết xuất mã nguồn mở là tất định. Khi có seed và mã nguồn, bạn có thể tái tạo Signature đến từng điểm ảnh mà không cần máy chủ của dự án.',
    funFact:
      'Tích hợp liên tục kiểm định mã băm SHA-256 của các khung hình đã kết xuất, nên ngay cả một sai lệch vô tình một điểm ảnh trong quy trình cũng làm bản dựng thất bại.',
    referenceLabel: 'Sách trắng \u00a76.2 \u2014 Khả năng tái tạo và giấy phép',
  },
  'art-naming': {
    prompt: 'Chủ sở hữu có quyền tùy chỉnh gì với Cosmic Signature NFT của mình?',
    options: {
      a: 'Họ có thể đặt tên cho nó trên chuỗi, tối đa 32 byte \u2014 chính tác phẩm không bao giờ thay đổi.',
      b: 'Họ có thể đổi seed một lần.',
      c: 'Họ có thể điều chỉnh bảng màu.',
      d: 'Họ có thể kéo dài thời lượng video.',
    },
    explanation:
      'Chủ sở hữu có thể ghi một tên tối đa 32 byte trên chuỗi. Đó là toàn bộ bề mặt tùy chỉnh: seed, quỹ đạo, bảng màu và video được cố định vĩnh viễn lúc khắc \u2014 tính tất định là lời hứa cốt lõi của bộ sưu tập, và đổi seed sẽ phá vỡ nó.',
    referenceLabel: 'Sách trắng \u00a76.2 \u2014 Khả năng tái tạo và giấy phép',
  },
  'art-license': {
    prompt: 'Hợp đồng, shader và quy trình kết xuất thuộc dự án được phát hành theo giấy phép nào?',
    options: {
      a: 'CC0 1.0 \u2014 đưa vào phạm vi công cộng, không bảo lưu quyền nào.',
      b: 'Một giấy phép độc quyền do đội ngũ nắm giữ.',
      c: 'GPL-3.0, yêu cầu các tác phẩm phái sinh mở mã nguồn.',
      d: 'Một giấy phép theo từng NFT do mỗi người nắm giữ sở hữu.',
    },
    explanation:
      'Mã thuộc dự án được công bố theo CC0 1.0, không bảo lưu quyền nào: bất kỳ ai cũng có thể phân nhánh hợp đồng, bộ kết xuất hay trang web. Các phụ thuộc bên thứ ba giữ giấy phép riêng của chúng. Ngay cả sách trắng này cũng là CC0.',
    referenceLabel: 'Sách trắng \u00a76.2 \u2014 Khả năng tái tạo và giấy phép',
  },
  'seed-derivation': {
    prompt: 'Seed nghệ thuật của một NFT được tạo khi nào và như thế nào?',
    options: {
      a: 'Lúc khắc, hợp đồng suy ra một seed 32 byte từ dữ liệu trên chuỗi và lưu nó cùng NFT; một bộ tạo SHA3-256 khiến mọi thứ phía sau là hàm thuần của nó.',
      b: 'Nghệ sĩ tải lên một seed cho mỗi NFT trước khi hoàn tất.',
      c: 'Seed là địa chỉ ví của chủ sở hữu.',
      d: 'Một seed mới được rút mỗi lần tác phẩm được kết xuất.',
    },
    explanation:
      'Seed được suy ra trên chuỗi lúc khắc và lưu vĩnh viễn cùng NFT. Nó khởi tạo một bộ tạo số ngẫu nhiên SHA3-256, và mọi lựa chọn phía sau \u2014 quỹ đạo ứng viên, máy quay, màu sắc \u2014 đều là hàm thuần của nó. Kết xuất hôm nay hay một thập kỷ sau: cùng seed, cùng Signature.',
    referenceLabel: 'Sách trắng \u00a76.1 \u2014 Quy trình',
  },
  'hacken-findings': {
    prompt: 'Cuộc rà soát bảo mật độc lập của Hacken với các hợp đồng đã kết luận gì?',
    options: {
      a: '23 phát hiện: không có mức nghiêm trọng, không có mức cao, 3 trung bình, 8 thấp và 12 mang tính thông tin \u2014 phần lớn là những cân nhắc thiết kế được chấp nhận với lý do bằng văn bản.',
      b: 'Nhiều phát hiện nghiêm trọng vẫn chưa được sửa.',
      c: 'Không có phát hiện nào ở bất kỳ mức độ.',
      d: 'Báo cáo chưa bao giờ được công bố.',
    },
    explanation:
      'Cuộc rà soát, công bố vào tháng 1 năm 2026, bao gồm giao thức cốt lõi, token CST, cả hai tích hợp NFT, các ví neo giữ và các hợp đồng hỗ trợ. Báo cáo ghi nhận 23 vấn đề, không có vấn đề nào ở mức nghiêm trọng hoặc cao. Bạn có thể đọc toàn bộ báo cáo để xem phạm vi kiểm tra, từng vấn đề và cách xử lý.',
    referenceLabel: 'Sách trắng \u00a711.1 \u2014 Rà soát độc lập',
  },
  'hacken-invariants': {
    prompt: 'Ngoài rà soát thủ công, kiểm thử fuzz của Hacken đã kiểm tra gì?',
    options: {
      a: '14 bất biến của hệ thống \u2014 chẳng hạn số dư ETH luôn bằng số đã nạp trừ số đã phân phối \u2014 tất cả đều giữ vững qua 10.000 lượt chạy.',
      b: 'Mức dùng gas của các giao dịch phổ biến.',
      c: 'Tính tất định của quy trình nghệ thuật.',
      d: 'Hiệu năng kết xuất của giao diện.',
    },
    explanation:
      'Kiểm thử fuzz dồn dập nạp đầu vào sinh tự động vào hệ thống trong khi kiểm định các thuộc tính phải luôn đúng. Hacken hình thức hóa 14 bất biến như vậy và tất cả đều giữ vững qua 10.000 lượt chạy \u2014 một loại bằng chứng khác với việc rà soát từng dòng, nhắm vào những trạng thái không con người nào nghĩ đến để thử.',
    referenceLabel: 'Sách trắng \u00a711.1 \u2014 Rà soát độc lập',
  },
  'verification-tooling': {
    prompt: 'Ngoài rà soát bên ngoài, kho mã mang những công cụ xác minh nào?',
    options: {
      a: 'Các đặc tả kiểm chứng hình thức Certora, cấu hình SMTChecker của Solidity, phân tích tĩnh Slither và một bộ kiểm thử nhắm đến độ phủ hoàn toàn.',
      b: 'Không gì cả \u2014 rà soát bên ngoài là kiểm tra duy nhất.',
      c: 'Một bộ kiểm thử mã nguồn đóng chạy riêng tư.',
      d: 'Kiểm thử thủ công trước mỗi bản phát hành.',
    },
    explanation:
      'Các lớp xếp chồng: đặc tả kiểm chứng hình thức (Certora), kiểm tra dựa trên SMT, phân tích tĩnh (Slither) và kiểm thử nhắm độ phủ \u2014 cộng thêm rà soát và fuzz của Hacken ở trên. Mỗi phương pháp kiểm tra một nhóm thuộc tính khác nhau; kết hợp chúng giúp mở rộng phạm vi kiểm tra mà không bảo đảm phần mềm hoàn toàn không có lỗi.',
    referenceLabel: 'Sách trắng \u00a711.1 \u2014 Rà soát độc lập',
  },
  'sourcify-status': {
    prompt: 'Tình trạng xác minh mã nguồn của các hợp đồng đã triển khai là gì?',
    options: {
      a: 'Xác minh khớp chính xác trên Sourcify cho Arbitrum One (chuỗi 42161), tại các địa chỉ cố định trong phụ lục của sách trắng.',
      b: 'Chưa xác minh \u2014 bạn phải tin vào bytecode.',
      c: 'Chỉ proxy được xác minh, không phải bản triển khai.',
      d: 'Được xác minh trên testnet, nhưng không trên mainnet.',
    },
    explanation:
      'Mọi hợp đồng đều được xác minh khớp chính xác trên Sourcify cho chuỗi 42161 \u2014 bậc xác minh nghiêm ngặt nhất, nơi bytecode trên chuỗi khớp với mã nguồn đã công bố đến từng byte, kể cả siêu dữ liệu. Địa chỉ proxy là địa chỉ vĩnh viễn của giao thức; các bản triển khai chỉ thay đổi qua quy trình nâng cấp công khai.',
    referenceLabel: 'Sách trắng \u00a711.4 \u2014 Xác minh mở',
  },
  reentrancy: {
    prompt:
      'Một hợp đồng đối nghịch cố tái nhập giao thức giữa giao dịch thông qua một callback. Điều gì cản đường nó?',
    options: {
      a: 'Bộ chặn tái nhập bảo vệ mọi điểm vào bên ngoài của hợp đồng cốt lõi.',
      b: 'Không gì cả \u2014 giao thức dựa vào việc người nhận hành xử đúng.',
      c: 'Một danh sách cho phép các hợp đồng tin cậy do Hội đồng quản lý.',
      d: 'Chỉ giới hạn gas đã khiến tái nhập bất khả.',
    },
    explanation:
      'Mọi điểm vào bên ngoài của hợp đồng cốt lõi đều mang bộ chặn tái nhập \u2014 dòng đầu tiên trong danh sách thiết kế phòng vệ. Kết hợp với ký quỹ kiểu kéo cho các phân bổ phụ, hai cơ chế giúp giảm rủi ro từ việc gọi lại hợp đồng và từ hợp đồng người nhận.',
    referenceLabel: 'Sách trắng \u00a711.2 \u2014 Thiết kế phòng vệ',
  },
  'intercycle-locks-why': {
    prompt:
      'Vì sao không thể nâng cấp hợp đồng trong khi một chu kỳ đang chạy \u2014 ngay cả trong trường hợp khẩn cấp?',
    options: {
      a: 'Do thiết kế có chủ đích: không có cơ chế nào để thay đổi hợp đồng giữa chu kỳ, bất kể hoàn cảnh, nên người tham gia luôn hành động theo những quy tắc họ có thể kiểm tra.',
      b: 'Nâng cấp sẽ tốn quá nhiều gas giữa chu kỳ.',
      c: 'Đó là hạn chế kỹ thuật của mẫu proxy.',
      d: 'Có thể nâng cấp với một quyết định đồng thuận tuyệt đối của Hội đồng.',
    },
    explanation:
      'Khóa giữa các chu kỳ là một chính sách khắc vào hợp đồng, không phải tai nạn kỹ thuật \u2014 proxy UUPS về mặt kỹ thuật có thể nâng cấp bất cứ lúc nào. Giao thức chọn làm cho việc thay đổi giữa chu kỳ trở nên bất khả để những quy tắc người tham gia thấy khi đặt nét bút chính là những quy tắc quyết định chu kỳ.',
    referenceLabel: 'Sách trắng \u00a712.1 \u2014 V1: Ra mắt',
  },
  'cst-checkpoints': {
    prompt: 'CST chụp nhanh trọng số điều phối cho các đề xuất như thế nào?',
    options: {
      a: 'Bằng các điểm kiểm dựa trên dấu thời gian \u2014 ảnh chụp nhanh của đề xuất tham chiếu thời gian thực thay vì số khối.',
      b: 'Bằng các điểm kiểm theo số khối, như hầu hết các triển khai Governor.',
      c: 'Trọng số được đọc trực tiếp vào khoảnh khắc mỗi phiếu được bày tỏ.',
      d: 'Một ảnh chụp nhanh được lấy mỗi chu kỳ một lần khi hoàn tất.',
    },
    explanation:
      'Token dùng các điểm kiểm dựa trên dấu thời gian, nên ảnh chụp nhanh của đề xuất tham chiếu thời gian thực. Trên một L2 nơi nhịp khối khác với mạng chính Ethereum, dấu thời gian là mốc ổn định hơn \u2014 một lựa chọn tinh tế giữ cho dòng thời gian điều phối dễ dự đoán.',
    referenceLabel: 'Sách trắng \u00a77.3 \u2014 Trọng số điều phối',
  },
  'dust-refund': {
    prompt:
      'Pia trả dư cho nét bút ETH vài wei \u2014 dưới ngưỡng tối thiểu. Phần chênh sẽ thế nào?',
    options: {
      a: 'Nó ở lại trong dự trữ: một khoản hoàn nhỏ như vậy tốn nhiều gas hơn số tiền trả về.',
      b: 'Nó vẫn được hoàn lại, vì nguyên tắc.',
      c: 'Nó tích lũy vào một số dư tín dụng cá nhân.',
      d: 'Nét bút bị hoàn nguyên để bảo vệ cô.',
    },
    explanation:
      'Trên ngưỡng tối thiểu, phần trả dư được hoàn lại trong cùng giao dịch; dưới ngưỡng đó, phần chênh ở lại trong dự trữ vì chính việc hoàn lại sẽ đốt nhiều gas hơn số tiền nó chuyển. Một sự bất đối xứng nhỏ, trung thực \u2014 được ghi rõ thay vì giấu đi.',
    referenceLabel: 'Sách trắng \u00a74.1 \u2014 Nét bút ETH',
  },
  'rwlk-not-transferred': {
    prompt: 'Sol đính kèm Random Walk NFT của mình để giảm chi phí. NFT nằm ở đâu sau đó?',
    options: {
      a: 'Vẫn trong ví của anh \u2014 hợp đồng chỉ đánh dấu nó đã dùng; nó không bao giờ được chuyển đi hay ký quỹ.',
      b: 'Ký quỹ trong ví phân bổ đến khi chu kỳ kết thúc.',
      c: 'Bị đốt để đổi lấy mức giảm.',
      d: 'Được chuyển cho giao thức và trả lại sau khi hoàn tất.',
    },
    explanation:
      'Random Walk NFT không bao giờ di chuyển: hợp đồng ghi nó là đã dùng và áp mức giảm. Dấu đánh mới là thứ bị tiêu hao \u2014 một lần duy nhất cho mỗi NFT, qua mọi chu kỳ \u2014 điều gắn một bộ sưu tập bên ngoài cố định vào dòng chảy của giao thức mà không nắm giữ bất cứ gì.',
    referenceLabel: 'Sách trắng \u00a74.2 \u2014 Đính kèm Random Walk NFT',
  },
  'open-finalization-carries': {
    prompt:
      'Trong cửa sổ hoàn tất mở, Quill (người chưa từng đặt một nét bút nào) hoàn tất chu kỳ. Chính xác cô nhận gì?',
    options: {
      a: 'Mọi thứ vai trò người nhận mang theo: phần ETH của phân bổ Signature, lần khắc CST của nó, NFT của nó và quyền ưu tiên với các tài sản đính kèm.',
      b: 'Một khoản phí hoàn tất cố định, còn các phân bổ vẫn thuộc về người đặt nét bút cuối cùng.',
      c: 'Chỉ NFT; ETH tích lũy sang chu kỳ sau.',
      d: 'Không gì cả \u2014 hoàn tất là một dịch vụ công.',
    },
    explanation:
      'Hợp đồng coi bất kỳ ai hoàn tất trong cửa sổ mở là người nhận của chu kỳ, với đầy đủ quyền của vai trò này \u2014 phần ETH, lần khắc CST, NFT và quyền ưu tiên với tài sản đính kèm. Quill chưa bao giờ cần đặt nét bút. Người đặt nét bút cuối cùng vắng mặt mất toàn bộ vai trò, không phải một phần.',
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'attached-priority-timeout': {
    prompt: 'Quyền ưu tiên của người nhận chu kỳ với tài sản đính kèm kéo dài bao lâu?',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần \u2014 sau thời hạn nhận về mở, bất kỳ ai cũng có thể nhận về chúng.`,
      b: 'Mãi mãi \u2014 tài sản đính kèm chờ người nhận chu kỳ vô thời hạn.',
      c: `${protocolFacts.finalGestureExclusivityHours} giờ, khớp với cửa sổ hoàn tất.`,
      d: 'Đến khi chu kỳ tiếp theo hoàn tất.',
    },
    explanation: `Tài sản đính kèm nằm trong ví phân bổ với cùng thời hạn ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần như mọi phân bổ ký quỹ. Người nhận chu kỳ có quyền ưu tiên trong cửa sổ đó; sau đó, tài sản mở ra cho người gọi đầu tiên. Con số ${protocolFacts.finalGestureExclusivityHours} giờ điều chỉnh quyền hoàn tất, không phải ký quỹ.`,
    referenceLabel: 'Sách trắng \u00a75.4 \u2014 Giao nhận, ký quỹ và thời hạn',
  },
  'eth-window-duration-drift': {
    prompt: 'Đường giảm của cửa sổ hiệu chỉnh ETH kéo dài bao lâu, và có cố định không?',
    options: {
      a: 'Khoảng hai ngày với các tham số lúc ra mắt \u2014 nhưng thời lượng của nó gắn với mức tăng thời gian của chu kỳ, nên nó giãn dần khi giao thức già đi.',
      b: `Đúng ${protocolFacts.finalGestureExclusivityHours} giờ, mãi mãi.`,
      c: `Đúng ${protocolFacts.initialCstCalibrationWindowHours} giờ, như mốc tham chiếu của cửa sổ CST.`,
      d: 'Nó co lại mỗi chu kỳ khi hoạt động tăng.',
    },
    explanation: `Với các tham số lúc ra mắt, đường giảm mất khoảng hai ngày, và nếu trôi qua hoàn toàn thì chi phí chỉ đơn giản nằm ở sàn. Vì thời lượng gắn với mức tăng thời gian \u2014 vốn lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% mỗi chu kỳ \u2014 cửa sổ giãn ra theo nhịp điệu dài dần của giao thức thay vì cố định.`,
    referenceLabel: 'Sách trắng \u00a73.1 \u2014 Cửa sổ hiệu chỉnh ETH',
  },
  'first-cycle-opening': {
    prompt: 'Chu kỳ đầu tiên không có chu kỳ trước để hiệu chỉnh từ đó. Nó mở như thế nào?',
    options: {
      a: `Ở mức cố định ${viDecimal(protocolFacts.initialGestureCostEth)} ETH.`,
      b: 'Ở 1 ETH, do Hội đồng chọn.',
      c: 'Không tốn chi phí \u2014 nét bút đầu tiên không tốn gì.',
      d: 'Ở gấp đôi chi phí gas triển khai.',
    },
    explanation: `Không có chi phí mở đầu trước đó để gấp đôi, chu kỳ một mở ở mức cố định ${viDecimal(protocolFacts.initialGestureCostEth)} ETH \u2014 cố ý rất nhỏ, để thị trường tự dẫn chi phí đi lên qua các bậc tăng ${protocolFacts.ethGestureCostStepUpPercent}% và phép hiệu chỉnh giữa các chu kỳ, thay vì đoán một mức giá ra mắt.`,
    referenceLabel: 'Sách trắng \u00a73.1 \u2014 Cửa sổ hiệu chỉnh ETH',
  },
  'selection-entry-scaling': {
    prompt:
      'Bea đặt 30 nét bút trong chu kỳ này; Cal đặt 3. Điều gì đúng về các lượt chọn ETH Tinh tuyển?',
    options: {
      a: 'Lượt của Bea xuất hiện trong quỹ nhiều gấp mười lần, và với việc có hoàn lại cô thậm chí có thể được chọn nhiều lần \u2014 nhưng Cal hoàn toàn vẫn có thể được chọn.',
      b: 'Bea được bảo đảm ít nhất một lượt chọn.',
      c: 'Cal bị loại; chỉ những người tham gia hàng đầu mới đủ điều kiện.',
      d: 'Cả hai có cơ hội y hệt \u2014 một lượt cho mỗi địa chỉ.',
    },
    explanation:
      'Lượt tăng theo số nét bút đã đặt \u2014 tần suất được chọn tỷ lệ với mức tham gia \u2014 và các lượt chọn có hoàn lại. Không gì được bảo đảm cho ai, và không ai đã đặt nét bút bị loại: quỹ cân theo hoạt động mà không chia định mức hay đặt ngưỡng.',
    referenceLabel: 'Sách trắng \u00a75.3 \u2014 Tinh tuyển',
  },
  'recognition-vs-participation': {
    prompt: 'CST đi vào lưu hành qua ba dòng. Dòng nào do đội ngũ điều hướng, và nó mang quyền gì?',
    options: {
      a: `Chỉ ${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ của Dự trữ truyền thông \u2014 và nó hoàn toàn không mang quyền đặc biệt nào.`,
      b: 'CST ghi nhận, mà đội ngũ gán cho những người tham gia được ưu ái.',
      c: 'CST tham gia, mà đội ngũ có thể điều chỉnh theo từng nét bút.',
      d: 'Cả ba dòng đều do đội ngũ điều hướng.',
    },
    explanation: `Ba dòng là: CST tham gia (khắc lúc đặt nét bút theo công thức), CST ghi nhận (${cst(protocolFacts.specialAllocationCst)} CST đi cùng mỗi lần phân phối NFT khi hoàn tất) và Dự trữ truyền thông (${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ). Chỉ dòng cuối do đội ngũ điều hướng \u2014 và đó là CST thông thường không có quyền đặc biệt, được chi cho truyền thông cộng đồng.`,
    referenceLabel: 'Sách trắng \u00a77.1 \u2014 Quy tắc khắc',
  },
  'finalization-actions': {
    prompt: 'Hoàn tất là một giao dịch duy nhất. Nó thực sự làm gì?',
    options: {
      a: 'Đọc số dư ETH của giao thức một lần, phân phối các luồng phân bổ, khắc NFT và CST của chu kỳ, ghi seed của mỗi tác phẩm, và lên lịch chu kỳ tiếp theo.',
      b: 'Chỉ chuyển ETH của người nhận chu kỳ; mọi thứ khác diễn ra sau.',
      c: 'Chỉ khắc NFT; việc phân phối ETH theo sau qua nhiều giao dịch.',
      d: 'Bắt đầu một quá trình thanh toán nhiều ngày do đội ngũ xử lý.',
    },
    explanation:
      'Một giao dịch giải quyết trọn chu kỳ: số dư ETH được đọc một lần, các luồng của Mục 5 được phân phối (đẩy cho người nhận chu kỳ và Hàng hóa công, ký quỹ cho phần còn lại), NFT và CST được khắc cùng seed được ghi lại, và chu kỳ tiếp theo được lên lịch. Tính nguyên tử là điểm mấu chốt \u2014 không có trạng thái hoàn tất nửa chừng.',
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'chrono-vs-endurance-trap': {
    prompt:
      'Nyx giữ vị trí nét bút gần nhất sáu giờ vào đầu chu kỳ. Sau đó, Orin giữ nó chín giờ. Kỷ lục của Orin chỉ đứng vững một lát trước khi hoàn tất, trong khi kỷ lục của Nyx đứng vững hai ngày. Cuối cùng ai nhận danh hiệu nào?',
    options: {
      a: 'Orin là Quán quân Bền bỉ (khoảng lặng đơn lẻ dài nhất); thời gian dài Nyx giữ kỷ lục khiến cô nhiều khả năng là Chiến binh Thời gian.',
      b: 'Nyx nhận cả hai danh hiệu \u2014 hai ngày vượt mọi thứ.',
      c: 'Orin nhận cả hai danh hiệu \u2014 khoảng lặng lớn hơn luôn quét sạch mọi thứ.',
      d: 'Danh hiệu thuộc về người đặt nét bút cuối cùng.',
    },
    explanation:
      'Bền bỉ đo khoảng lặng bạn tạo ra \u2014 chín giờ của Orin vượt sáu giờ của Nyx. Luồng Chrono đo danh hiệu Quán quân Bền bỉ được giữ bao lâu: Nyx giữ nó hai ngày trước khi Orin vượt qua, trong khi thời gian giữ vị trí của Orin chỉ kéo dài đến lúc hoàn tất. Hai luồng cố ý ghi nhận hai hình dạng bền bỉ khác nhau, và cả hai chỉ được quyết định khi hoàn tất.',
    referenceLabel: 'Sách trắng \u00a75.2 \u2014 Quán quân Bền bỉ và Chiến binh Thời gian',
  },
  'anchored-rwlk-weighting': {
    prompt:
      'Vale neo giữ năm Random Walk NFT; Wynn neo giữ một. Tinh tuyển NFT neo giữ đối xử với họ thế nào?',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt chọn được cân theo số NFT mỗi người đã neo giữ \u2014 Vale mang trọng số gấp năm lần Wynn.`,
      b: 'Mỗi người neo giữ có đúng một lượt chọn bất kể số lượng.',
      c: 'Lượt chọn được cân theo thời điểm mỗi NFT được neo giữ sớm đến đâu.',
      d: 'Vale và Wynn chia đều các lượt chọn.',
    },
    explanation: `Tinh tuyển NFT neo giữ chạy ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt chọn mỗi chu kỳ trên các Random Walk NFT đang neo giữ, cân theo số NFT mỗi người đã neo giữ. Mỗi lượt chọn mang ${cst(protocolFacts.specialAllocationCst)} CST và một Cosmic Signature NFT \u2014 và không có ETH, phần vẫn thuộc riêng về Cosmic Signature NFT đang neo giữ.`,
    referenceLabel: 'Sách trắng \u00a75.3 \u2014 Tinh tuyển',
  },
  'voluntary-vault-contributions': {
    prompt: 'ETH có thể đến Kho Hàng hóa công ngoài khoản chuyển tiếp theo chu kỳ không?',
    options: {
      a: 'Có \u2014 kho cũng nhận các khoản đóng góp ETH tự nguyện trực tiếp, ngoài bất kỳ chu kỳ nào.',
      b: 'Không \u2014 chỉ hoàn tất mới có thể chuyển ETH vào kho.',
      c: 'Chỉ chủ sở hữu mới có thể bổ sung cho kho.',
      d: 'Chỉ CST mới có thể được đóng góp tự nguyện.',
    },
    explanation: `Kho nhận các khoản đóng góp ETH tự nguyện trực tiếp, bên trên ${protocolFacts.publicGoodsPercentage}% được thực thi mỗi chu kỳ. Việc chuyển tiếp cơ học đặt ra mức sàn; bất kỳ ai muốn thêm vào đều có thể làm vậy mà không cần chờ một lần hoàn tất.`,
    referenceLabel: 'Sách trắng \u00a710 \u2014 Hàng hóa công',
  },
  'risk-honesty': {
    prompt: 'Điều nào trong số này được chính mục rủi ro của sách trắng thừa nhận?',
    options: {
      a: 'Rà soát và phân tích hình thức không phải là bảo đảm \u2014 những khiếm khuyết chưa biết có thể tồn tại trong bất kỳ phần mềm nào giữ giá trị.',
      b: 'Các hợp đồng được chứng minh toán học là không có khiếm khuyết nào.',
      c: 'Rủi ro chỉ tồn tại đến khi nâng cấp V3 được triển khai.',
      d: 'Rủi ro thực sự duy nhất là chính Ethereum thất bại.',
    },
    explanation:
      'Các yếu tố rủi ro được nêu không tô vẽ: rủi ro hợp đồng thông minh tồn tại qua mọi lần rà soát; độ ngẫu nhiên có những hạn chế đã nêu; các thời hạn là có thật; tham số có thể thay đổi giữa các chu kỳ đến khi phi tập trung hoàn tất; giá trị tài sản dao động. Hãy coi nét bút là khoản chi cho sự tham gia và nghệ thuật \u2014 đó chính là cách sách trắng tự định khung.',
    referenceLabel: 'Sách trắng \u00a714.2 \u2014 Các yếu tố rủi ro',
  },
} as const satisfies QuizTierQuestionsText<'hard'>;
