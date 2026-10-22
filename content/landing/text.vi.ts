import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { LandingText } from './structure';

const cstAmount = formatCount(protocolFacts.specialAllocationCst, 'vi');

/** Vietnamese landing copy, keyed by the skeleton in structure.ts. */
export const landingTextVi = {
  meta: {
    title: 'Cosmic Signature: Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum',
    description:
      'V3 đã được triển khai. Bản này thay đổi công thức và người nhận CST tham gia, trọng số của cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia, tốc độ giảm chi phí CST, tỷ lệ ETH, số NFT của Phân bổ Signature và bổ sung phụ phí cuối chu kỳ.',
    keywords: [
      'Cosmic Signature',
      'giao thức nghệ thuật tạo sinh',
      'nghệ thuật trên chuỗi',
      'Arbitrum',
      'bài toán ba vật thể',
      'nghệ thuật tạo sinh',
      'hàng hóa công',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: 'Giao thức nghệ thuật tạo sinh trên chuỗi · Arbitrum',
    headlineLead: 'Nghệ thuật từ',
    headlineAccent: 'từng nét bút.',
    subhead:
      'Nét bút đầu tiên của chu kỳ phải dùng ETH và bắt đầu đồng hồ hoàn tất. Các nét bút sau cộng mức tăng hiện tại vào thời điểm hoàn tất đã lưu, kể cả sau khi hết giờ. Đồng hồ không bắt đầu lại từ thời điểm hiện tại. Bạn vẫn có thể đặt nét bút cho tới khi giao dịch hoàn tất thành công. Phần này vào Kho Hàng hóa công. Bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild.',
    secondaryCtaLabel: 'Cách một chu kỳ vận hành',
    art: {
      viewAriaLabel: 'Xem Cosmic Signature {tokenLabel} trong ứng dụng',
      artworkAlt: 'Cosmic Signature {tokenLabel} — tác phẩm tạo sinh ba vật thể tất định',
      galleryCta: 'Duyệt toàn bộ phòng trưng bày',
    },
  },

  cycle: {
    eyebrow: 'Chu kỳ',
    heading: 'Một chu kỳ trình diễn, từ lúc mở đến khi hoàn tất.',
    steps: {
      gesture: {
        title: 'Đặt nét bút',
        body: 'Tham gia bằng ETH hoặc CST. Mỗi nét bút được ghi trên chuỗi và có một lượt trong Tinh tuyển của chu kỳ.',
      },
      extend: {
        title: 'Kéo dài đồng hồ',
        body: 'Mỗi nét bút cộng thêm thời gian vào thời điểm hoàn tất chu kỳ, nên chu kỳ còn tiếp diễn khi người tham gia còn đặt nét bút.',
      },
      finalize: {
        title: 'Hoàn tất và phân bổ',
        body: 'Khi đồng hồ về 0, chu kỳ có thể được hoàn tất: các Signature mới được khắc và Dự trữ chu kỳ được phân bổ qua các luồng bên dưới.',
      },
    },
    gestureCtaLabel: 'Đặt nét bút',
    guideCtaLabel: 'Xem từng bước vận hành',
  },

  art: {
    eyebrow: 'Nghệ thuật',
    heading: 'Bài toán ba vật thể trở thành nghệ thuật trên chuỗi.',
    description:
      'Seed của NFT được lưu trên chuỗi, còn hình ảnh và video được tạo ngoài chuỗi. Tái tạo cần cùng seed, đúng phiên bản và cấu hình bộ kết xuất, cùng công cụ tương thích. Chỉ có cùng seed không bảo đảm kết quả giống nhau giữa các phiên bản.',
    showcase: {
      viewAriaLabel: 'Xem Cosmic Signature {tokenLabel}',
      artworkAlt: 'Tác phẩm Cosmic Signature {tokenLabel}',
    },
    stageLabel: 'Giai đoạn',
    stages: {
      seed: {
        title: 'Seed',
        body: 'Một mã băm 32 byte được suy ra từ dữ liệu trên chuỗi — thông tin khối và các precompile ArbSys — rồi đưa vào một RNG SHA3-256.',
      },
      simulation: {
        title: 'Mô phỏng',
        body: 'Một trăm nghìn cấu hình ứng viên chạy qua bộ tích phân symplectic Yoshida bậc 4, mỗi cấu hình một triệu bước vật lý.',
      },
      selection: {
        title: 'Chọn lọc',
        body: 'Xếp hạng Borda theo đặc tính quỹ đạo tạo danh sách ngắn, sau đó một bước đánh giá tính thẩm mỹ của hình ảnh chọn kết quả.',
      },
      camera: {
        title: 'Máy quay',
        body: 'Máy quay di chuyển chậm theo quỹ đạo elip, tạo hiệu ứng thị sai và chiều sâu điện ảnh cho chuyển động của ba vật thể.',
      },
      color: {
        title: 'Màu sắc',
        body: 'Bảng màu dùng không gian cảm nhận OKLCh với sắc độ và khoảng cách màu biến đổi. Bộ kết xuất hiện tại không cố định góc cách đều giữa màu của ba vật thể.',
      },
      'spectral-render': {
        title: 'Kết xuất quang phổ',
        body: 'Sáu mươi tư dải bước sóng từ 380 đến 700 nanomet kết xuất các vệt quỹ đạo với độ dày phụ thuộc vận tốc và độ sâu trường ảnh.',
      },
      signature: {
        title: 'Signature',
        body: 'Ánh xạ tông màu, hiệu ứng phát sáng và xử lý màu hoàn thiện hình ảnh. Kích thước, thời lượng và định dạng phụ thuộc vào phiên bản và cấu hình bộ kết xuất.',
      },
    },
    facts: {
      imprinted: { label: 'Đã khắc đến nay' },
      resolution: { label: 'Độ phân giải gốc' },
      animation: { label: 'Hoạt ảnh', value: '30 giây, 60 fps' },
      license: { label: 'Giấy phép' },
    },
  },

  tracks: {
    eyebrow: 'Các luồng phân bổ',
    heading: 'Mỗi Dự trữ chu kỳ đều được phân bổ theo quy tắc.',
    description: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
    ethLabel: 'ETH từ mỗi Dự trữ chu kỳ',
    fixedLabel: 'CST và NFT trong mỗi chu kỳ',
    fixedEach: `Mỗi người nhận được ${cstAmount} CST và một Cosmic Signature NFT.`,
    recipients: { other: '{count}\u00a0người nhận' },
    items: {
      'signature-allocation': {
        title: 'Phân bổ Signature',
        body: 'Người hoàn tất nhận 3 Cosmic Signature NFT có ID liên tiếp và tổng cộng 1.000 CST. Quyền hoàn tất tuân theo thời gian độc quyền và thời gian mở.',
      },
      'compounding-reserve': {
        percent: '~50%',
        title: 'Dự trữ tích lũy',
        body: 'Khoảng một nửa ETH được giữ lại cho chu kỳ sau. Làm tròn số nguyên, luồng bị bỏ qua và chuyển không thành công có thể làm phần còn lại lớn hơn. Điều đó không bảo đảm dự trữ đầu chu kỳ sau sẽ lớn hơn.',
      },
      'chrono-warrior': {
        title: 'Phân bổ Chiến binh Thời gian',
        body: `Dành cho người tham gia giữ vị trí Quán quân Bền bỉ trong khoảng liên tục dài nhất. Bao gồm ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      'public-goods': {
        title: 'Phân bổ Hàng hóa công',
        body: 'Phần này vào Kho Hàng hóa công. Bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild.',
      },
      'anchor-distribution': {
        title: 'Phân phối neo giữ',
        body: 'Phân phối theo tỷ lệ cho mọi Cosmic Signature NFT đang neo giữ với giao thức trong chu kỳ này.',
      },
      'eth-stellar-selection': {
        title: 'ETH Tinh tuyển',
        body: `${protocolFacts.ethStellarSelectionRecipients} lượt có trọng số chia phần ETH. Trọng số là chi phí ETH cơ sở lúc đặt nét bút, không gồm mức giảm hay phụ phí cuối chu kỳ. Một địa chỉ có thể được chọn nhiều lần.`,
      },
      'participant-nft-stellar-selection': {
        title: 'NFT Tinh tuyển — Người tham gia',
        body: 'Trọng số là chi phí ETH cơ sở lúc đặt nét bút, không gồm mức giảm hay phụ phí cuối chu kỳ. Một địa chỉ có thể được chọn nhiều lần.',
      },
      'anchored-nft-stellar-selection': {
        title: 'Tinh tuyển NFT neo giữ',
        body: 'Được chọn ngẫu nhiên trong số người neo giữ Random Walk NFT.',
      },
      'endurance-champion': {
        title: 'Phân bổ Quán quân Bền bỉ',
        body: 'Người giữ vị trí người đặt nét bút gần nhất lâu nhất trong một khoảng liên tục.',
      },
      'final-cst-gesture': {
        title: 'Phân bổ nét bút CST cuối cùng',
        body: 'Người tham gia đặt nét bút CST cuối cùng của chu kỳ.',
      },
    },
  },

  anchoring: {
    eyebrow: 'Neo giữ',
    heading: 'Neo giữ Cosmic Signature NFT với giao thức.',
    body: `Khi bạn neo giữ một Cosmic Signature NFT, NFT đó nhận một phần theo tỷ lệ của ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ mỗi chu kỳ, được chi trả khi gỡ neo. Bạn có thể gỡ neo bất cứ lúc nào, nhưng mỗi NFT chỉ được neo giữ đúng một lần.`,
    bullets: [
      'ETH tích lũy theo từng chu kỳ, nhận về khi gỡ neo',
      'Không có kỳ hạn cố định và không có phạt; gỡ neo là vĩnh viễn với từng NFT',
      'Random Walk NFT thuộc bộ sưu tập song hành cũng có thể neo giữ',
      `Random Walk NFT đang neo giữ thuộc diện Tinh tuyển NFT neo giữ: ${cstAmount} CST và một Cosmic Signature NFT, không có ETH`,
    ],
    ctaLabel: 'Neo giữ trong ứng dụng',
  },

  publicGoods: {
    eyebrow: 'Hàng hóa công',
    heading: 'Mỗi chu kỳ đều tài trợ những người đóng góp cốt lõi cho Ethereum.',
    body: 'Khi hoàn tất, giao thức thử chuyển phần được cấu hình của Dự trữ chu kỳ vào Kho Hàng hóa công. Sau đó bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild. Chủ sở hữu có thể thay đổi đơn vị thụ hưởng. Nếu chuyển từ giao thức vào kho thất bại, phần này có thể ở lại dự trữ mà không hủy hoàn tất.',
    disclaimerHeading: 'Lưu ý',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'Đây là việc chuyển tiếp ETH đến một địa chỉ hàng hóa công (hiện là Protocol Guild). Đây không phải là khoản đóng góp từ thiện theo nghĩa thuế của Hoa Kỳ, và Cosmic Signature không đưa ra cam kết nào về cách xử lý thuế của nó.',
    // lexicon-allow-end
    card: {
      label: 'Phân bổ của chu kỳ',
      description:
        'Phần này vào Kho Hàng hóa công. Bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild.',
      tableRows: {
        contributors: { label: 'Người đóng góp Protocol Guild' },
        enforcement: { label: 'Cơ chế thực thi', value: 'trên chuỗi' },
        recipient: { label: 'Người nhận' },
      },
    },
    ctaLabel: 'Tìm hiểu về Protocol Guild',
  },

  council: {
    eyebrow: 'Hội đồng Vũ trụ',
    heading: 'Điều phối giao thức, trên chuỗi.',
    body: 'Người nắm giữ CST điều phối giao thức trên chuỗi: ủy quyền trọng số, gửi đề xuất điều phối và bày tỏ tán thành hoặc phản đối.',
    columns: {
      proposal: {
        title: 'Đề xuất điều phối',
        body: `Bất kỳ địa chỉ nào có ít nhất ${protocolFacts.councilProposalThresholdCst} CST trọng số được ủy quyền đều có thể gửi đề xuất. Độ trễ điều phối ${protocolFacts.councilVotingDelayDays} ngày, giai đoạn điều phối ${protocolFacts.councilVotingPeriodWeeks} tuần.`,
      },
      weight: {
        title: 'Trọng số điều phối',
        body: 'Mỗi CST biểu thị một đơn vị trọng số sau khi được ủy quyền. Ý kiến được ghi nhận bằng chữ ký mật mã; CST không đại diện cho cổ phần hay công cụ vốn.',
      },
      quorum: {
        title: 'Túc số điều phối',
        body: `Đề xuất được thông qua khi trọng số tán thành lớn hơn phản đối và tổng trọng số tán thành cùng bỏ trống đạt ít nhất ${protocolFacts.councilQuorumPercent}% tổng cung CST. Trọng số phản đối không được tính vào túc số.`,
      },
    },
  },

  verifiability: {
    eyebrow: 'Khả năng xác minh',
    heading: 'Mở, đã xác minh, có thể tái tạo.',
    body: 'Seed của NFT được lưu trên chuỗi, còn hình ảnh và video được tạo ngoài chuỗi. Tái tạo cần cùng seed, đúng phiên bản và cấu hình bộ kết xuất, cùng công cụ tương thích. Chỉ có cùng seed không bảo đảm kết quả giống nhau giữa các phiên bản.',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Tài liệu thuộc dự án trong các kho mã Cosmic Signature (hợp đồng, shader và quy trình kết xuất) được công bố theo CC0 1.0, không bảo lưu quyền nào; các phụ thuộc bên thứ ba, phông chữ và tài sản giữ giấy phép riêng của chúng.',
      },
      verification: {
        title: 'Tình trạng xác minh',
        body: 'Ứng dụng liên kết địa chỉ hợp đồng công khai, tài nguyên mã nguồn, bối cảnh xác minh và tình trạng kiểm toán/báo cáo để bất kỳ ai cũng có thể kiểm tra những gì đã được công bố.',
      },
      reproducible: {
        title: 'Nghệ thuật tái tạo được',
        body: 'Kho mã có các bước kiểm tra hình ảnh tham chiếu chạy thủ công. Quy trình tích hợp liên tục hiện tại không so sánh mã băm của các khung hình được tạo.',
      },
    },
    evidenceLabel: 'Tự kiểm chứng',
  },

  faq: {
    eyebrow: 'Giải đáp',
    heading: 'Những câu hỏi đáng được trả lời thẳng thắn.',
    moreLabel: 'Xem thêm trong Câu hỏi thường gặp',
    items: [
      {
        question: 'Là người tham gia, tôi thực sự làm gì?',
        answer:
          'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
      },
      {
        question: 'Về mặt kỹ thuật, tác phẩm là gì?',
        answer:
          'Seed của NFT được lưu trên chuỗi, còn hình ảnh và video được tạo ngoài chuỗi. Tái tạo cần cùng seed, đúng phiên bản và cấu hình bộ kết xuất, cùng công cụ tương thích. Chỉ có cùng seed không bảo đảm kết quả giống nhau giữa các phiên bản.',
      },
      {
        question: 'Các phân bổ ETH đến từ đâu?',
        answer:
          'Từ Dự trữ chu kỳ, vốn lớn dần khi người tham gia đặt nét bút. Khi một chu kỳ hoàn tất, khoảng một nửa chuyển tiếp vào Dự trữ tích lũy của chu kỳ tiếp theo; phần còn lại được phân phối qua các luồng phân bổ (phân bổ Signature, Chiến binh Thời gian, phân phối neo giữ, Tinh tuyển, Hàng hóa công) theo các tham số trên chuỗi.',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: 'Hàng hóa công chính xác là gì?',
        answer: `Khi hoàn tất, giao thức thử chuyển ${protocolFacts.publicGoodsPercentage}% Dự trữ chu kỳ vào Kho Hàng hóa công. Sau đó bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild. Chủ sở hữu có thể thay đổi đơn vị thụ hưởng. Nếu chuyển từ giao thức vào kho thất bại, phần này có thể ở lại dự trữ mà không hủy hoàn tất.`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'Đây có phải là xổ số, sòng bạc hay sản phẩm cờ bạc không?',
        answer:
          'Không. Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi. Người tham gia đặt nét bút trong một chu kỳ trình diễn; giao thức phân phối phân bổ qua các luồng phân bổ khi chu kỳ hoàn tất. Không có nhà cái, không có người chia bài, không có cược. Các phân bổ ghi nhận sự bền bỉ, thời điểm và sự tham gia. Luồng phân bổ ngẫu nhiên duy nhất, Tinh tuyển, là một phép phân phối theo quy trình ở cấp giao thức.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: 'Có điều gì trong đây là đầu tư không?',
        answer:
          'Không. Token CST biểu thị sự tham gia và trọng số điều phối trong giao thức, không phải cổ phần, quyền hưởng lợi nhuận, cổ tức hay hợp đồng đầu tư. Không có ví nào của đội ngũ nhận ETH từ nét bút của người tham gia. Cosmic Signature không đưa ra cam kết nào về giá token hay diễn biến tương lai và không mời gọi tham gia như một khoản đầu tư.',
      },
      // lexicon-allow-end
      {
        question: 'Vì sao lượng CST tham gia thay đổi?',
        answer:
          'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
      },
      {
        question: 'Nét bút ETH và CST ảnh hưởng thế nào đến cửa sổ hiệu chỉnh CST?',
        answer:
          'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      },
      {
        question: 'Tôi có thể phân nhánh dự án này không?',
        answer:
          'Có. Hợp đồng, shader, bộ kết xuất, trang giới thiệu và tài liệu thuộc dự án được công bố theo CC0 1.0 — không bảo lưu quyền nào. Các phụ thuộc bên thứ ba, phông chữ và tài sản vẫn theo giấy phép riêng của chúng; xem THIRD_PARTY_NOTICES.md.',
      },
    ],
  },
  closing: {
    eyebrow: 'Bộ sưu tập',
    heading: 'Mỗi chu kỳ bồi đắp thêm cho bộ sưu tập.',
    body: 'Theo dõi chu kỳ đang diễn ra, đặt nét bút, hoặc xem mọi Signature đã được khắc đến nay.',
  },
} satisfies LandingText;
