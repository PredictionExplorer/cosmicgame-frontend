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
    heading: 'Cosmic Signature hoạt động như thế nào',
    paragraph:
      'Những nét bút nối tiếp nhau định hình Signature trong mỗi chu kỳ trình diễn. Khi đếm ngược về 0, chu kỳ có thể được hoàn tất. Giao thức khi đó phân phối dự trữ qua hơn mười luồng, gồm phân bổ Signature, phân phối neo giữ và phần dành cho Protocol Guild.',
    primaryCtaLabel: 'Đặt nét bút',
    secondaryCtaLabel: 'Xem chu kỳ hiện tại',
  },
  rewardBreakdown: {
    heading: 'Mỗi nét bút mang lại điều gì',
    subhead: 'Mỗi nét bút tham gia vào nhiều luồng phân bổ của chu kỳ.',
    items: [
      {
        title: 'CST tham gia động',
        description:
          'Một nét bút có thể khắc CST. Lượng CST tính theo căn bậc hai của thời gian kể từ nét bút trước: nét bút ngay sau một nét bút khác có thể khắc 0 CST, còn khoảng lặng dài hơn khắc nhiều hơn.',
      },
      {
        title: 'Lượt Tinh tuyển',
        description: `Mỗi nét bút ghi nhận một lượt. Khi chu kỳ hoàn tất, ba lượt được chọn ngẫu nhiên để chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ bằng ETH.`,
      },
      {
        title: 'Tinh tuyển Cosmic Signature NFT',
        description: `Mười lượt khác được chọn, mỗi lượt nhận ${cstAmount} CST và một Cosmic Signature NFT. Cùng một địa chỉ có thể được chọn nhiều lần, và không số lượt nào bảo đảm được chọn.`,
      },
      {
        title: 'Phân bổ Signature',
        description: `Người tham gia đặt nét bút cuối cùng có thể hoàn tất chu kỳ và nhận về ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ bằng ETH, ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
    ],
  },
  costs: {
    heading: 'Một nét bút tốn gì',
    subhead: 'Hãy nắm rõ những điều này trước khi bạn trả ETH hoặc CST cho một nét bút.',
    items: [
      {
        title: 'Khoản đã trả không được hoàn lại',
        body: 'ETH trả cho nét bút được cộng vào Dự trữ chu kỳ, còn CST đã trả bị đốt. Cả hai đều không quay lại khi có người đặt nét bút sau bạn.',
      },
      {
        title: 'Chi phí ETH tăng dần',
        body: `Mỗi nét bút ETH làm chi phí nét bút ETH kế tiếp tăng ${protocolFacts.ethGestureCostStepUpPercent}%. Chi phí chỉ giảm trong cửa sổ hiệu chỉnh ETH mở ra đầu mỗi chu kỳ.`,
      },
      {
        title: 'Phí gas tính riêng',
        body: 'Mỗi nét bút là một giao dịch trên Arbitrum, nên bạn còn trả phí mạng bằng ETH. Ví hiển thị khoản phí này trước khi bạn xác nhận.',
      },
    ],
    note: 'Chỉ đặt nét bút bằng số tiền bạn chấp nhận mất đi.',
    riskLinkLabel: 'Đọc công bố rủi ro',
  },
  gameCycle: {
    heading: 'Vòng đời của một chu kỳ trình diễn',
    subhead: 'Mỗi chu kỳ đi theo trình tự này từ lúc mở đến khi hoàn tất.',
    legend: {
      gestures: 'Nét bút',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} giờ chỉ người đặt nét bút cuối cùng được hoàn tất`,
      allocations: 'Luồng phân bổ',
    },
    phases: [
      {
        label: 'Chu kỳ mở',
        description: `Một chu kỳ trình diễn mới bắt đầu. Chi phí nét bút ETH và CST giảm dần trong cửa sổ hiệu chỉnh riêng của mỗi loại; cửa sổ hiệu chỉnh CST khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ rồi thay đổi theo mức tham gia. Dự trữ chu kỳ bắt đầu từ phần chu kỳ trước chuyển sang.`,
      },
      {
        label: 'Người tham gia đặt nét bút',
        description: `Mỗi nét bút cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất chu kỳ. Nét bút ETH rút ngắn cửa sổ hiệu chỉnh CST khoảng ${cstWindowDecrease}%; nét bút CST kéo dài cửa sổ khoảng ${cstWindowIncrease}%.`,
      },
      {
        label: 'Đếm ngược về 0',
        description: `Khi đếm ngược về 0, người đặt nét bút cuối cùng có ${protocolFacts.finalGestureExclusivityHours} giờ để hoàn tất chu kỳ. Sau đó bất kỳ ai cũng có thể hoàn tất, và người hoàn tất nhận phân bổ Signature. Cho đến khi việc hoàn tất được thực thi, một nét bút mới sẽ kéo dài đồng hồ và trở thành nét bút cuối cùng.`,
      },
      {
        label: 'Chu kỳ hoàn tất',
        description: `Việc hoàn tất phân phối mọi phân bổ. Người hoàn tất chu kỳ nhận phân bổ Signature: ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      {
        label: 'Tinh tuyển',
        description: `Ba người nhận ETH Tinh tuyển chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ. Mười người nhận NFT Tinh tuyển, cùng mười người nhận Tinh tuyển NFT neo giữ được chọn từ các Random Walk NFT đang neo giữ, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT. Lượt được ghi nhận theo từng nét bút, và mỗi lượt chọn được thực hiện trong toàn bộ lượt của chu kỳ, có hoàn lại.`,
      },
      {
        label: 'Chu kỳ tiếp theo',
        description: `Phần còn lại, ${protocolFacts.compoundingReservePercentage}% Dự trữ chu kỳ, chuyển tiếp làm Dự trữ tích lũy, và chu kỳ tiếp theo mở ra với những cửa sổ hiệu chỉnh mới.`,
      },
    ],
  },
  payoff: {
    heading: 'Mỗi chu kỳ khép lại bằng một Signature',
    body: 'Mỗi nét bút góp phần tạo nên tác phẩm của chu kỳ. Khi chu kỳ hoàn tất, Signature được khắc thành một Cosmic Signature NFT và trao cho người đặt nét bút cuối cùng cùng với phân bổ Signature.',
    caption: 'Signature của chu kỳ {cycle}',
    linkLabel: 'Xem Signature này',
  },
  stepByStep: {
    heading: 'Bắt đầu',
    subhead: 'Từ kết nối ví đến nét bút đầu tiên trong ba bước.',
    stepLabel: 'Bước {n}',
    steps: [
      {
        title: 'Kết nối ví',
        highlights: [
          'Nhấn nút kết nối ở góc trên bên phải của trang.',
          'Dùng một ví hỗ trợ Arbitrum, chẳng hạn MetaMask. Arbitrum là một Layer 2 của Ethereum với phí thấp hơn và giao dịch nhanh hơn.',
          'Chuyển mạng sang Arbitrum khi ví yêu cầu, rồi chấp thuận kết nối.',
          'Sau khi kết nối, địa chỉ ví của bạn xuất hiện trên đầu trang.',
        ],
      },
      {
        title: 'Kiểm tra chi phí nét bút',
        highlights: [
          'Kiểm tra chi phí nét bút hiện tại bằng ETH hoặc CST trước khi quyết định.',
          'Xem bản xem trước CST tham gia; lượng này thay đổi theo thời gian kể từ nét bút trước.',
          'Đảm bảo ví có đủ chi phí nét bút cộng một ít ETH cho phí mạng; ví hiển thị khoản phí này trước khi bạn xác nhận.',
        ],
      },
      {
        title: 'Đặt nét bút',
        highlights: [
          `Chọn ETH hoặc CST. Nét bút ETH có thể đính kèm một Random Walk NFT để giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH, mỗi NFT một lần.`,
          'Nhấn nút nét bút ghi rõ phương thức và chi phí (ví dụ “Đặt nét bút bằng ETH”), rồi xác nhận giao dịch trong ví.',
        ],
      },
    ],
    fundingText: 'Chưa có ETH trên Arbitrum?',
    fundingLinkLabel: 'Cách có ETH trên Arbitrum',
  },
  proTips: {
    heading: 'Điều nên biết',
    subhead: 'Những chi tiết dễ bỏ sót.',
    tips: [
      {
        title: 'Hai cửa sổ hiệu chỉnh',
        body: `Chi phí nét bút ETH chỉ giảm dần trong cửa sổ hiệu chỉnh một lần, khi mỗi chu kỳ mở ra. Chi phí nét bút CST bắt đầu một cửa sổ mới sau mỗi nét bút CST: từ gấp đôi chi phí vừa trả (tối thiểu ${protocolFacts.cstCalibrationCeilingMinCst} CST) giảm dần về 0.`,
      },
      {
        title: 'Mỗi Random Walk NFT chỉ dùng một lần',
        body: `Một Random Walk NFT giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí cho một nét bút ETH, sau đó không thể giảm cho nét bút khác. Việc dùng NFT tách biệt với việc neo giữ nó.`,
      },
      {
        title: 'Dùng một ví phụ',
        body: 'Ví phụ tách hoạt động trên giao thức khỏi tài sản chính của bạn. Trang Kiểm toán cho biết những gì đã được rà soát và xác minh.',
      },
    ],
  },
  callToAction: {
    heading: 'Sẵn sàng đặt nét bút đầu tiên?',
    body: 'Kết nối ví để đặt nét bút trong chu kỳ hiện tại, định hình Signature và có thể khắc CST tham gia.',
    primaryCtaLabel: 'Đặt nét bút',
    faqCtaLabel: 'Xem câu hỏi thường gặp',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
