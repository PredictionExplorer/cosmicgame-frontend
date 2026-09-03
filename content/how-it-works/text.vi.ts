import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cstAmount = protocolFacts.specialAllocationCst.toLocaleString('vi-VN');
const cstWindowDecrease =
  protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN');
const cstWindowIncrease =
  protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN');

/** Vietnamese how-it-works copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextVi = {
  metadata: {
    title: 'Cosmic Signature hoạt động như thế nào | Chu kỳ trình diễn, nét bút và NFT',
    description:
      'Tìm hiểu một chu kỳ trình diễn Cosmic Signature diễn ra thế nào — từ cửa sổ hiệu chỉnh, qua các nét bút, đến phân phối phân bổ cuối cùng.',
  },
  jsonLd: {
    name: 'Cosmic Signature hoạt động như thế nào',
    description:
      'Tìm hiểu một chu kỳ trình diễn Cosmic Signature diễn ra thế nào — từ cửa sổ hiệu chỉnh, qua các nét bút, đến phân phối phân bổ cuối cùng.',
  },
  breadcrumbs: {
    homeLabel: 'Trang chủ',
    pageLabel: 'Cách hoạt động',
  },
  hero: {
    badge: 'Giao thức nghệ thuật tạo sinh trên chuỗi',
    headingLead: 'Cosmic Signature',
    headingAccent: 'hoạt động như thế nào',
    paragraph:
      'Đặt nét bút. Bền bỉ. Định hình Signature. Người tham gia đặt nét bút trong một chu kỳ trình diễn. Khi thời điểm hoàn tất chu kỳ hết hạn, chu kỳ có thể được hoàn tất và các phân bổ được phân phối qua hơn mười luồng — bao gồm phân bổ Signature, phân phối neo giữ và Protocol Guild.',
    primaryCtaLabel: 'Mở giao thức',
    secondaryCtaLabel: 'Tìm hiểu thêm',
  },
  overview: {
    heading: 'Cách hoạt động',
    subhead: 'Ba bước để tham gia và định hình Dự trữ chu kỳ',
    cards: [
      {
        title: 'Đặt nét bút',
        description:
          'Đặt nét bút bằng ETH hoặc CST (ERC-20). Mỗi nét bút kéo dài thời điểm hoàn tất chu kỳ, ghi nhận một lượt Tinh tuyển và định hình Signature đang biến chuyển.',
        tooltip: `Nét bút có thể đặt bằng ETH hoặc token CST (ERC-20). Đính kèm một Random Walk NFT vào nét bút ETH mang lại mức giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH một lần.`,
      },
      {
        title: 'Bền bỉ',
        description:
          'Chu kỳ chạy đến khi thời điểm hoàn tất chu kỳ hết hạn. Mỗi nét bút mới cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất đã lưu.',
        tooltip:
          'Mức tăng thời gian khởi đầu khoảng một giờ và lớn dần qua các chu kỳ. Chi phí nét bút CST dùng một cửa sổ hiệu chỉnh động mà nét bút ETH và CST đẩy theo hai hướng ngược nhau.',
      },
      {
        title: 'Nhận',
        description:
          'Tham gia vào các phân bổ khi chu kỳ hoàn tất — phân bổ Signature, Tinh tuyển, phân phối neo giữ và nhiều hơn nữa.',
        tooltip: `Người tham gia đặt nét bút cuối cùng nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, ${cstAmount} CST và một Cosmic Signature NFT. Người nhận Tinh tuyển, người neo giữ và những người tham gia khác cũng nhận phân bổ.`,
      },
    ],
  },
  rewardBreakdown: {
    heading: 'Mỗi nét bút khắc những gì',
    subhead: 'Việc tham gia khắc vào nhiều luồng phân bổ mỗi chu kỳ.',
    items: [
      {
        title: 'CST tham gia động',
        description: 'Mỗi nét bút có thể khắc CST dựa trên khoảng thời gian kể từ nét bút trước.',
        tooltip: `CST tham gia dùng công thức căn bậc hai: ${protocolFacts.dynamicCstRewardFormula}. Nét bút dồn dập có thể nhận 0 CST; khoảng lặng dài hơn tạo ra lần khắc lớn hơn.`,
      },
      {
        title: 'Lượt Tinh tuyển',
        description: 'Mỗi nét bút ghi nhận một lượt Tinh tuyển cho các phân bổ cuối chu kỳ.',
        tooltip: `Khi chu kỳ hoàn tất, các lượt được chọn ngẫu nhiên: ba người tham gia chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ bằng ETH.`,
      },
      {
        title: 'Tinh tuyển Cosmic Signature NFT',
        description: `Mười người tham gia nhận ${cstAmount} CST và một Cosmic Signature NFT độc nhất qua Tinh tuyển mỗi chu kỳ.`,
        tooltip: `Mười người nhận Tinh tuyển cộng mười người neo giữ Random Walk NFT, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT mỗi chu kỳ.`,
      },
      {
        title: 'Phân bổ Signature',
        description: `Người tham gia đặt nét bút cuối cùng có thể nhận về ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ bằng ETH, ${cstAmount} CST và một Cosmic Signature NFT.`,
        tooltip:
          'Dự trữ chu kỳ lớn dần từ mọi nét bút. Người tham gia đặt nét bút cuối cùng nhận về phân bổ Signature qua hợp đồng giao thức.',
      },
    ],
  },
  gameCycle: {
    heading: 'Vòng đời của một chu kỳ trình diễn',
    subhead: 'Mỗi chu kỳ đi theo trình tự này từ lúc mở đến khi hoàn tất.',
    phases: [
      {
        label: 'Chu kỳ mở',
        description: `Một chu kỳ trình diễn mới bắt đầu. Cửa sổ hiệu chỉnh ETH đầu tiên mở ra, và cửa sổ hiệu chỉnh CST khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ, rồi thay đổi theo mức tham gia.`,
        tooltip:
          'Cửa sổ hiệu chỉnh cho phép người tham gia đặt nét bút với chi phí giảm dần. Dự trữ chu kỳ bắt đầu từ không cộng với Dự trữ tích lũy từ chu kỳ trước.',
      },
      {
        label: 'Người tham gia đặt nét bút',
        description: `Mỗi nét bút cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất chu kỳ. CST tham gia là động, và nét bút ETH/CST đẩy cửa sổ hiệu chỉnh CST xuống khoảng ${cstWindowDecrease}% hoặc lên khoảng ${cstWindowIncrease}%.`,
        tooltip:
          'CST tham gia đi theo công thức căn bậc hai dựa trên thời gian đã trôi qua kể từ nét bút trước. Bản xem trước hiện tại trong ứng dụng là nguồn chính xác cho lượng CST.',
      },
      {
        label: 'Thời điểm hoàn tất chu kỳ hết hạn',
        description:
          'Khi đếm ngược về không, người tham gia đặt nét bút cuối cùng đủ điều kiện hoàn tất chu kỳ.',
        tooltip: `Vẫn có thể đặt nét bút cho đến khi việc hoàn tất thực sự được thực thi — một nét bút muộn kéo dài thời gian đã lưu và giành lấy vị trí nét bút cuối cùng. Người đặt nét bút cuối cùng có cửa sổ hoàn tất ưu tiên ${protocolFacts.finalGestureExclusivityHours} giờ; sau đó bất kỳ ai cũng có thể hoàn tất và nhận phân bổ Signature.`,
      },
      {
        label: 'Chu kỳ hoàn tất',
        description: `Người tham gia đặt nét bút cuối cùng nhận về phân bổ Signature: ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, ${cstAmount} CST và một Cosmic Signature NFT.`,
        tooltip:
          'Việc nhận về phân bổ Signature diễn ra qua hợp đồng giao thức. CST và Cosmic Signature NFT được khắc tự động.',
      },
      {
        label: 'Tinh tuyển',
        description: `Ba người nhận ETH Tinh tuyển chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ. Mười người nhận NFT Tinh tuyển cộng mười người nhận Tinh tuyển NFT neo giữ, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT.`,
        tooltip:
          'Lượt được ghi nhận theo từng nét bút. Càng nhiều nét bút, tần suất được chọn càng cao. Người neo giữ Random Walk NFT có một Tinh tuyển riêng.',
      },
      {
        label: 'Chu kỳ tiếp theo',
        description:
          'Khoảng một nửa Dự trữ chu kỳ chuyển tiếp làm Dự trữ tích lũy, và chu kỳ tiếp theo bắt đầu với những cửa sổ hiệu chỉnh mới.',
        tooltip:
          'Dự trữ tích lũy nghĩa là giao thức tích lũy giá trị thay vì rút ra. Các hợp đồng trực tiếp báo cáo thời lượng cửa sổ và chi phí hiện tại.',
      },
    ],
  },
  stepByStep: {
    heading: 'Bắt đầu',
    subhead: 'Từ kết nối ví đến nét bút đầu tiên trong ba bước.',
    stepLabel: 'BƯỚC',
    steps: [
      {
        title: 'Kết nối ví',
        tooltip:
          'Arbitrum là một blockchain Layer 2 trên Ethereum với phí gas thấp hơn và giao dịch nhanh hơn.',
        highlights: [
          'Nhấn nút “Kết nối ví” ở đầu trang.',
          'Dùng một ví hỗ trợ blockchain Arbitrum, chẳng hạn MetaMask.',
          'Chuyển mạng sang Arbitrum khi được yêu cầu, rồi chấp thuận quyền truy cập.',
          'Địa chỉ ví của bạn sẽ xuất hiện trên đầu trang sau khi kết nối.',
        ],
      },
      {
        title: 'Kiểm tra chi phí nét bút',
        tooltip:
          'Phí gas trên Arbitrum thường chỉ vài xu — rẻ hơn nhiều so với mạng chính Ethereum.',
        highlights: [
          'Xem thời điểm hoàn tất chu kỳ — mỗi nét bút cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất đã lưu.',
          'Kiểm tra chi phí nét bút hiện tại bằng ETH hoặc CST trước khi quyết định.',
          'Xem bản xem trước CST tham gia trực tiếp; lượng này thay đổi theo thời gian kể từ nét bút trước.',
          'Lưu ý số tiền phân bổ Signature để thấy mức phân phối ETH tiềm năng.',
          'Đảm bảo ví của bạn có đủ chi phí nét bút cộng một khoản nhỏ cho phí gas.',
        ],
      },
      {
        title: 'Đặt nét bút',
        tooltip: `Mỗi Random Walk NFT chỉ dùng được một lần cho mức giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH - hãy chọn thời điểm khôn ngoan.`,
        highlights: [
          `Chọn ETH, tùy chọn đính kèm một Random Walk NFT để giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH, hoặc đặt nét bút bằng CST (ERC-20).`,
          'Nhấn “Đặt nét bút ngay” và xác nhận giao dịch trong ví.',
          'Nét bút của bạn kéo dài thời điểm hoàn tất chu kỳ và cập nhật trạng thái chi phí ETH/CST.',
          'Mỗi nét bút ghi nhận một lượt Tinh tuyển và có thể tự động khắc CST tham gia động.',
        ],
      },
    ],
  },
  proTips: {
    heading: 'Mẹo và chiến thuật',
    subhead: 'Hướng dẫn thực tế để tối đa hóa sự tham gia qua các luồng phân bổ.',
    tips: [
      {
        title: 'Theo dõi cả hai cửa sổ hiệu chỉnh',
        description:
          'Chi phí nét bút ETH và CST đi theo hai cửa sổ trực tiếp riêng, và mỗi nét bút làm thay đổi cửa sổ CST.',
        tooltip:
          'Nét bút ETH rút ngắn nhẹ cửa sổ hiệu chỉnh CST; nét bút CST kéo dài nhẹ nó. Các bảng trực tiếp trong ứng dụng hiển thị đường đi chi phí hiện tại.',
      },
      {
        title: 'Đính kèm một Random Walk NFT',
        description: `Nắm giữ một Random Walk NFT mang lại mức giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH một lần.`,
        tooltip:
          'Mỗi Random Walk NFT chỉ dùng được một lần cho mức giảm chi phí. Hãy để dành cho một nét bút có chi phí cao hơn để tối đa hóa hiệu quả.',
      },
      {
        title: 'Tích lũy lượt Tinh tuyển',
        description:
          'Mỗi nét bút ghi nhận một lượt Tinh tuyển. Càng nhiều nét bút, tần suất được chọn càng cao.',
        tooltip: `Ba người nhận ETH Tinh tuyển chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ. Mười người tham gia nhận NFT và mười người neo giữ Random Walk NFT, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      {
        title: 'Dùng một ví phụ',
        description:
          'Các hợp đồng thông minh đã được xác minh mã nguồn công khai trên chuỗi, nhưng dùng một ví riêng để tham gia thêm một lớp an toàn.',
        tooltip:
          'Ví phụ tách hoạt động trên giao thức khỏi tài sản chính của bạn để tăng bảo mật. Tình trạng kiểm toán và xác minh được công bố trên trang Kiểm toán.',
      },
      {
        title: 'Theo dõi thời điểm hoàn tất',
        description:
          'Mỗi nét bút cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất chu kỳ đã lưu.',
        tooltip:
          'Đặt nét bút gần thời hạn đưa bạn đến gần vị trí nét bút cuối cùng nhất, nhưng người tham gia khác vẫn có thể đặt nét bút sau bạn cho đến khi chu kỳ được hoàn tất.',
      },
      {
        title: 'Đặt nét bút bằng CST',
        description:
          'Dùng CST làm phương thức thanh toán thay thế cho nét bút thông qua cửa sổ hiệu chỉnh CST.',
        tooltip: `Một nét bút CST ghi nhận một lượt Tinh tuyển, kéo dài bộ đếm, có thể khắc CST tham gia động, và kéo dài cửa sổ hiệu chỉnh CST khoảng ${cstWindowIncrease}%.`,
      },
    ],
  },
  faqCallout: {
    heading: 'Còn câu hỏi?',
    body: 'Đọc câu hỏi thường gặp để có câu trả lời chi tiết về cơ chế chu kỳ, các luồng phân bổ, token và mọi điều khác về Cosmic Signature.',
    ctaLabel: 'Xem câu hỏi thường gặp',
  },
  callToAction: {
    heading: 'Sẵn sàng đặt nét bút đầu tiên?',
    body: 'Tham gia chu kỳ trình diễn đang diễn ra. Kết nối ví và đặt nét bút đầu tiên để bắt đầu khắc CST và định hình Signature của chu kỳ.',
    primaryCtaLabel: 'Mở giao thức',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
