import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { HowItWorksText } from './structure';

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
      'Những nét bút nối tiếp nhau định hình Signature trong mỗi chu kỳ trình diễn. Khi đếm ngược về 0, chu kỳ có thể được hoàn tất. Giao thức khi đó phân phối dự trữ qua một nhóm luồng cố định, gồm phân bổ Signature, phân phối neo giữ và phần dành cho Protocol Guild.',
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
          'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
      },
      {
        title: 'Lượt Tinh tuyển',
        description:
          'Trọng số là chi phí ETH cơ sở lúc đặt nét bút, không gồm mức giảm hay phụ phí cuối chu kỳ. Một địa chỉ có thể được chọn nhiều lần.',
      },
      {
        title: 'Tinh tuyển Cosmic Signature NFT',
        description:
          'Trọng số là chi phí ETH cơ sở lúc đặt nét bút, không gồm mức giảm hay phụ phí cuối chu kỳ. Một địa chỉ có thể được chọn nhiều lần.',
      },
      {
        title: 'Phân bổ Signature',
        description: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
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
        body: `Mỗi nét bút ETH tăng chi phí ETH cơ sở tiếp theo thêm ${protocolFacts.ethGestureCostStepUpPercent}% sau khi làm tròn số nguyên, cộng 1 wei. Phụ phí cuối chu kỳ và phần trả dư được giữ lại không đi vào chi phí cơ sở này. ETH và CST có quy tắc chi phí cơ sở riêng. Khi chu kỳ mở, chi phí ETH giảm trong cửa sổ hiệu chỉnh; mỗi nét bút ETH nâng chi phí cơ sở tiếp theo. Chi phí CST giảm theo tốc độ lưu trên chuỗi. Gần hạn hoàn tất, cả hai chi phí có phụ phí cuối chu kỳ, nhưng phụ phí không nâng chi phí cơ sở tiếp theo hay trọng số Tinh tuyển.`,
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
      finalization: 'Hoàn tất',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} giờ chỉ người đặt nét bút cuối cùng được hoàn tất`,
      allocations: 'Luồng phân bổ',
    },
    phases: [
      {
        label: 'Chu kỳ mở',
        description:
          'Nét bút đầu tiên của chu kỳ phải dùng ETH và bắt đầu đồng hồ hoàn tất. Các nét bút sau cộng mức tăng hiện tại vào thời điểm hoàn tất đã lưu, kể cả sau khi hết giờ. Đồng hồ không bắt đầu lại từ thời điểm hiện tại. Bạn vẫn có thể đặt nét bút cho tới khi giao dịch hoàn tất thành công.',
      },
      {
        label: 'Người tham gia đặt nét bút',
        description:
          'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      },
      {
        label: 'Đếm ngược về 0',
        description: `Khi đếm ngược về 0, người đặt nét bút cuối cùng có ${protocolFacts.finalGestureExclusivityHours} giờ để hoàn tất chu kỳ. Sau đó bất kỳ ai cũng có thể hoàn tất, và người hoàn tất nhận phân bổ Signature. Cho đến khi việc hoàn tất được thực thi, một nét bút mới sẽ kéo dài đồng hồ và trở thành nét bút cuối cùng.`,
      },
      {
        label: 'Chu kỳ hoàn tất',
        description: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
      },
      {
        label: 'Tinh tuyển',
        description: `Khi hoàn tất, ${protocolFacts.ethStellarSelectionRecipients} lượt có trọng số chia ${protocolFacts.stellarSelectionEthPercentage}% dự trữ bằng ETH. Riêng ${protocolFacts.nftStellarSelectionRecipients} lượt NFT của người tham gia và tối đa ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt Random Walk NFT đang neo giữ nhận NFT và CST. Cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia đều dùng trọng số từng nét bút. Trọng số là chi phí ETH cơ sở tại thời điểm đó, chưa giảm bằng Random Walk NFT và chưa cộng phụ phí cuối chu kỳ. Nét bút CST dùng cùng chi phí ETH cơ sở đương thời. Các lượt chọn có hoàn lại, nên một địa chỉ có thể được chọn nhiều lần. Tinh tuyển NFT neo giữ xét riêng các Random Walk NFT đang neo giữ.`,
      },
      {
        label: 'Chu kỳ tiếp theo',
        description:
          'Khoảng một nửa ETH được giữ lại cho chu kỳ sau. Làm tròn số nguyên, luồng bị bỏ qua và chuyển không thành công có thể làm phần còn lại lớn hơn. Điều đó không bảo đảm dự trữ đầu chu kỳ sau sẽ lớn hơn.',
      },
    ],
  },
  payoff: {
    heading: 'Mỗi chu kỳ khép lại bằng một Signature',
    body: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
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
          'Mức CST tham gia tối thiểu giới hạn số lượng mà nét bút tiếp theo khắc cho người tham gia trước, không bảo đảm một khoản cho người gửi. Nếu hai địa chỉ giống nhau, người gửi tự nhận số lượng đó. Giá trị 0 tắt giới hạn này; nét bút ETH đầu tiên của chu kỳ bỏ qua kiểm tra. Chi phí tối đa và phí mạng là các điều kiện riêng.',
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
        body: 'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
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
    body: 'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
    primaryCtaLabel: 'Đặt nét bút',
    faqCtaLabel: 'Xem câu hỏi thường gặp',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
