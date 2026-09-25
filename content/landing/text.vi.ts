import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

const cstAmount = protocolFacts.specialAllocationCst.toLocaleString('vi-VN');

/** Vietnamese landing copy, keyed by the skeleton in structure.ts. */
export const landingTextVi = {
  meta: {
    title: 'Cosmic Signature: Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum',
    description: `Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Người tham gia đặt nét bút trong mỗi chu kỳ trình diễn; khi chu kỳ hoàn tất, các Signature mới được khắc và Dự trữ chu kỳ được phân bổ theo quy tắc qua các luồng, trong đó ${protocolFacts.publicGoodsPercentage}% dành cho những người đóng góp cốt lõi của Ethereum.`,
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
    subhead: `Mỗi nét bút, đặt bằng ETH hoặc CST, đều kéo dài đồng hồ của chu kỳ. Khi thời gian hết, chu kỳ được hoàn tất: các Signature mới được khắc cho người nhận, và Dự trữ chu kỳ được phân bổ qua các luồng, trong đó ${protocolFacts.publicGoodsPercentage}% dành cho những người đóng góp cốt lõi của Ethereum.`,
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
      'Mỗi Cosmic Signature NFT trực quan hóa ba thiên thể quay quanh nhau dưới lực hấp dẫn Newton. Ba vật thể tạo ra những quỹ đạo hỗn độn về bản chất. Không AI. Không dữ liệu huấn luyện. Chỉ có vật lý tất định. Cùng seed → cùng kết quả, đến từng điểm ảnh.',
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
        body: 'Một phép tổng hợp xếp hạng Borda (hỗn độn × độ đều cạnh) chọn ra quỹ đạo thú vị nhất về thị giác từ nhóm ứng viên.',
      },
      camera: {
        title: 'Máy quay',
        body: 'Máy quay di chuyển chậm theo quỹ đạo elip, tạo hiệu ứng thị sai và chiều sâu điện ảnh cho chuyển động của ba vật thể.',
      },
      color: {
        title: 'Màu sắc',
        body: 'Màu được pha trong không gian cảm nhận OKLab với độ tách sắc 120° cho mỗi vật thể, điều biến bởi độ trôi và một sóng sin.',
      },
      'spectral-render': {
        title: 'Kết xuất quang phổ',
        body: 'Sáu mươi tư dải bước sóng từ 380 đến 700 nanomet kết xuất các vệt quỹ đạo với độ dày phụ thuộc vận tốc và độ sâu trường ảnh.',
      },
      signature: {
        title: 'Signature',
        body: 'Ánh xạ tông AgX, hiệu ứng bloom, các lớp tinh vân OpenSimplex và cân màu hoàn thiện khung hình. Kết quả: một ảnh PNG 16 bit cùng một video H.265 dài 30 giây.',
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
    description:
      'Khi một chu kỳ hoàn tất, giao thức phân phối dự trữ ETH và CST của mình qua các luồng phân bổ ghi nhận sự bền bỉ, thời điểm, sự tận tâm và sự tham gia. Khoảng một nửa dự trữ ETH được tích lũy sang chu kỳ tiếp theo.',
    ethLabel: 'ETH từ mỗi Dự trữ chu kỳ',
    fixedLabel: 'CST và NFT trong mỗi chu kỳ',
    fixedEach: `Mỗi người nhận được ${cstAmount} CST và một Cosmic Signature NFT.`,
    recipients: { other: '{count}\u00a0người nhận' },
    items: {
      'signature-allocation': {
        title: 'Phân bổ Signature',
        body: 'Dành cho người tham gia đặt nét bút cuối cùng. Bao gồm 1.000 CST và một Cosmic Signature NFT.',
      },
      'compounding-reserve': {
        percent: '~50%',
        title: 'Dự trữ tích lũy',
        body: 'Được giữ lại và tích lũy vào dự trữ của chu kỳ trình diễn tiếp theo.',
      },
      'chrono-warrior': {
        title: 'Phân bổ Chiến binh Thời gian',
        body: `Dành cho người tham gia giữ vị trí Quán quân Bền bỉ trong khoảng liên tục dài nhất. Bao gồm ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      'public-goods': {
        title: 'Phân bổ Hàng hóa công',
        body: 'Chuyển đến Protocol Guild, cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum.',
      },
      'anchor-distribution': {
        title: 'Phân phối neo giữ',
        body: 'Phân phối theo tỷ lệ cho mọi Cosmic Signature NFT đang neo giữ với giao thức trong chu kỳ này.',
      },
      'eth-stellar-selection': {
        title: 'ETH Tinh tuyển',
        body: `Chia cho ${protocolFacts.ethStellarSelectionRecipients} người tham gia được chọn ngẫu nhiên. Tần suất được chọn tăng theo số nét bút đã đặt.`,
      },
      'participant-nft-stellar-selection': {
        title: 'NFT Tinh tuyển — Người tham gia',
        body: 'Được chọn ngẫu nhiên trong số người tham gia của chu kỳ.',
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
    body: 'Mỗi chu kỳ trình diễn chuyển một tỷ lệ cố định trong dự trữ ETH của mình đến Protocol Guild — cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho Ethereum. Hoạt động trong giao thức góp phần duy trì nguồn hỗ trợ cho hạ tầng Ethereum.',
    disclaimerHeading: 'Lưu ý',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'Đây là việc chuyển tiếp ETH đến một địa chỉ hàng hóa công (hiện là Protocol Guild). Đây không phải là khoản đóng góp từ thiện theo nghĩa thuế của Hoa Kỳ, và Cosmic Signature không đưa ra cam kết nào về cách xử lý thuế của nó.',
    // lexicon-allow-end
    card: {
      label: 'Phân bổ của chu kỳ',
      description: 'của mỗi chu kỳ trình diễn được chuyển đến Protocol Guild.',
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
    body: 'Bất kỳ ai cũng có thể tái tạo Signature từ seed và đối chiếu với hợp đồng, mã nguồn và tình trạng kiểm toán mà ứng dụng công bố.',
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
        body: 'Mã băm SHA-256 của các khung hình đã tạo được kiểm định trong tích hợp liên tục. Cùng seed → cùng kết quả.',
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
        answer: `Bạn đặt nét bút. Mỗi nét bút là một giao dịch ETH hoặc CST kéo dài thời điểm hoàn tất chu kỳ, ghi nhận một lượt Tinh tuyển, có thể khắc CST tham gia động, và định hình Signature của chu kỳ. Bạn có thể neo giữ Cosmic Signature NFT để nhận một phần phân phối neo giữ. Bạn có thể gửi đề xuất điều phối qua Hội đồng Vũ trụ nếu nắm giữ ít nhất ${protocolFacts.councilProposalThresholdCst} CST.`,
      },
      {
        question: 'Về mặt kỹ thuật, tác phẩm là gì?',
        answer:
          'Mỗi Cosmic Signature NFT là một bản kết xuất tất định của một mô phỏng ba vật thể theo Newton. Seed trên chuỗi chọn một quỹ đạo ứng viên (từ 100.000 quỹ đạo được mô phỏng qua bộ tích phân symplectic Yoshida bậc 4), rồi kết xuất quang phổ qua 64 dải bước sóng với phép pha màu OKLab. Toàn bộ quy trình là mã nguồn mở theo CC0; bất kỳ ai cũng có thể tái tạo một Signature từ seed của nó.',
      },
      {
        question: 'Các phân bổ ETH đến từ đâu?',
        answer:
          'Từ Dự trữ chu kỳ, vốn lớn dần khi người tham gia đặt nét bút. Khi một chu kỳ hoàn tất, khoảng một nửa chuyển tiếp vào Dự trữ tích lũy của chu kỳ tiếp theo; phần còn lại được phân phối qua các luồng phân bổ (phân bổ Signature, Chiến binh Thời gian, phân phối neo giữ, Tinh tuyển, Hàng hóa công) theo các tham số trên chuỗi.',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: 'Hàng hóa công chính xác là gì?',
        answer: `${protocolFacts.publicGoodsPercentage}% dự trữ ETH của mỗi chu kỳ được chuyển đến một địa chỉ hàng hóa công, hiện là Protocol Guild. Protocol Guild là cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho Ethereum. Đây là việc chuyển tiếp ETH đến một địa chỉ hàng hóa công; đây không phải là khoản đóng góp từ thiện theo nghĩa thuế của Hoa Kỳ, và Cosmic Signature không đưa ra cam kết nào về cách xử lý thuế của nó.`,
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
        answer: `Lượng CST tham gia được tính theo căn bậc hai của thời gian kể từ nét bút trước. Khoảng cách càng dài, lượng CST càng lớn, nhưng tăng chậm hơn thời gian chờ. Hai nét bút quá gần nhau có thể khiến lượng CST được khắc bằng 0. Ứng dụng hiển thị số lượng ước tính trước khi bạn gửi.`,
      },
      {
        question: 'Nét bút ETH và CST ảnh hưởng thế nào đến cửa sổ hiệu chỉnh CST?',
        answer: `Cửa sổ hiệu chỉnh CST được lưu trên chuỗi và thay đổi sau mỗi nét bút. Một nét bút CST kéo dài nó khoảng ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN')}%, khiến chi phí nét bút CST giảm chậm hơn. Một nét bút ETH rút ngắn nó khoảng ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN')}%, khiến chi phí nét bút CST giảm nhanh hơn.`,
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

  footer: {
    tagline: 'Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum.',
    copyright: '© {year} Cosmic Signature. Tài liệu thuộc dự án: CC0 1.0.',
    colophon: 'CC0 1.0 · Có thể xác minh công khai · Nghệ thuật tái tạo được',
    disambiguation:
      'Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức và ứng dụng nghệ thuật trên chuỗi.',
  },
} satisfies LandingText;
