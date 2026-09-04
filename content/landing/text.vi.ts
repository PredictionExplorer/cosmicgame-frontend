import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

const cstAmount = protocolFacts.specialAllocationCst.toLocaleString('vi-VN');

/** Vietnamese landing copy, keyed by the skeleton in structure.ts. */
export const landingTextVi = {
  meta: {
    title: 'Cosmic Signature: Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum',
    description:
      'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Nét bút của người tham gia định hình Signature; dự trữ chu kỳ được phân bổ theo quy tắc công khai, trong đó có phần hỗ trợ hạ tầng Ethereum.',
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
      'kiểm chứng hình thức',
    ],
  },

  hero: {
    eyebrow: 'Giao thức nghệ thuật tạo sinh trên chuỗi · Arbitrum',
    headline: 'Cosmic Signature: Nghệ thuật tạo sinh trên chuỗi Arbitrum',
    headlineLead: 'Cosmic Signature: Nghệ thuật tạo sinh trên chuỗi',
    headlineAccent: 'Arbitrum',
    subhead:
      'Mỗi nét bút trong chu kỳ trình diễn đều để lại dấu ấn trên Signature cuối cùng. Khi chu kỳ hoàn tất, giao thức phân phối dự trữ qua hơn mười luồng phân bổ, trong đó có phần hỗ trợ hạ tầng Ethereum.',
    biologyDisclaimer:
      'Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức và ứng dụng nghệ thuật trên chuỗi.',
    primaryCtaLabel: 'Mở ứng dụng',
    secondaryCtaLabel: 'Khám phá chu kỳ',
    statisticsCtaLabel: 'Thống kê giao thức',
    galleryCtaLabel: 'Phòng trưng bày NFT',
    scrollAriaLabel: 'Cuộn đến phần Chu kỳ',
    marqueeChips: [
      'Hợp đồng đã xác minh',
      'CC0',
      'Mã nguồn mở',
      'Nghệ thuật tất định',
      '7% cho Protocol Guild',
      'Hội đồng Vũ trụ',
      'Arbitrum One',
    ],
    art: {
      eyebrow: 'Trực tiếp từ bộ sưu tập',
      caption: 'Khắc trên chuỗi · CC0',
      cstNote: `Mỗi Signature được khắc đều đi cùng ${cstAmount} CST.`,
      formingLabel: 'Tín hiệu đang hình thành',
      formingBody: 'Một Signature từ bộ sưu tập sẽ xuất hiện ở đây ngay khi mạng phản hồi.',
      viewAriaLabel: 'Xem Cosmic Signature {tokenLabel} trong ứng dụng',
      artworkAlt: 'Cosmic Signature {tokenLabel} — tác phẩm tạo sinh ba vật thể tất định',
      galleryCta: 'Duyệt toàn bộ phòng trưng bày',
    },
  },

  cycle: {
    eyebrow: 'Chu kỳ',
    heading: 'Một chu kỳ trình diễn, từ lúc mở đến khi hoàn tất.',
    description:
      'Chu kỳ mở bằng cửa sổ hiệu chỉnh, tiếp nối qua những nét bút và sẵn sàng hoàn tất khi đếm ngược về 0. Các bước diễn ra theo quy tắc của giao thức, không cần bên trung gian điều hành.',
    stages: {
      opening: {
        title: 'Mở chu kỳ',
        body: `Một chu kỳ trình diễn mới bắt đầu. Cửa sổ hiệu chỉnh ETH đầu tiên mở ra, và cửa sổ hiệu chỉnh CST dùng một thời lượng lưu trên chuỗi, hiện khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ.`,
      },
      gestures: {
        title: 'Nét bút',
        body: `Người tham gia đặt nét bút bằng ETH hoặc CST. Mỗi nét bút kéo dài thời điểm hoàn tất chu kỳ, ghi nhận một lượt Tinh tuyển, và có thể khắc CST tham gia động dựa trên căn bậc hai của thời gian kể từ nét bút trước. Nét bút ETH rút ngắn cửa sổ hiệu chỉnh CST khoảng ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN')}%; nét bút CST kéo dài nó khoảng ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN')}%.`,
      },
      finalization: {
        title: 'Hoàn tất',
        body: 'Khi đếm ngược về 0, người đặt nét bút cuối cùng có thể hoàn tất chu kỳ. Sau cửa sổ ưu tiên, cửa sổ hoàn tất mở cho phép bất kỳ ai thực hiện thao tác này.',
      },
      allocations: {
        title: 'Phân bổ',
        body: 'Giao thức phân phối Dự trữ chu kỳ qua hơn mười luồng phân bổ. Khoảng một nửa dự trữ ETH chuyển sang Dự trữ tích lũy của chu kỳ tiếp theo.',
      },
    },
  },

  art: {
    eyebrow: 'Nghệ thuật',
    heading: 'Bài toán ba vật thể trở thành nghệ thuật trên chuỗi.',
    description:
      'Mỗi Cosmic Signature NFT trực quan hóa ba thiên thể quay quanh nhau dưới lực hấp dẫn Newton. Ba vật thể tạo ra những quỹ đạo hỗn độn về bản chất. Không AI. Không dữ liệu huấn luyện. Chỉ có vật lý tất định. Cùng seed → cùng kết quả, đến từng điểm ảnh.',
    loading: {
      label: 'Đang đồng bộ kho lưu trữ trực tiếp',
      description: 'Tác phẩm sẽ xuất hiện tại đây sau khi siêu dữ liệu NFT được cập nhật.',
    },
    showcase: {
      liveLabel: 'Signature trực tiếp',
      signalLabel: 'Tín hiệu',
      awaitingMetadataLabel: 'Đang chờ siêu dữ liệu',
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
      'wavelength-bins': { label: 'Dải bước sóng' },
      'physics-steps': { label: 'Bước vật lý mỗi ứng viên', value: '1.000.000' },
      'candidate-orbits': { label: 'Quỹ đạo ứng viên', value: '100.000' },
      license: { label: 'Giấy phép' },
    },
  },

  tracks: {
    eyebrow: 'Các luồng phân bổ',
    heading: 'Hơn mười cách giao thức phân phối Dự trữ chu kỳ.',
    description:
      'Khi một chu kỳ hoàn tất, giao thức phân phối dự trữ ETH và CST của mình qua các luồng phân bổ ghi nhận sự bền bỉ, thời điểm, sự tận tâm và sự tham gia. Khoảng một nửa dự trữ ETH được tích lũy sang chu kỳ tiếp theo.',
    cardLabel: 'Phân bổ',
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
        body: 'Chia cho ba người tham gia được chọn ngẫu nhiên. Tần suất được chọn tăng theo số nét bút đã đặt.',
      },
      'participant-nft-stellar-selection': {
        percent: '10 NFT',
        title: 'NFT Tinh tuyển — Người tham gia',
        body: `Mười người tham gia được chọn ngẫu nhiên, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      'anchored-nft-stellar-selection': {
        percent: '10 NFT',
        title: 'Tinh tuyển NFT neo giữ',
        body: `Mười người neo giữ Random Walk NFT được chọn ngẫu nhiên, mỗi người nhận ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      'endurance-champion': {
        percent: `${cstAmount} CST`,
        title: 'Phân bổ Quán quân Bền bỉ',
        body: '1.000 CST ghi nhận và một Cosmic Signature NFT dành cho người giữ vị trí người đặt nét bút gần nhất lâu nhất trong một khoảng liên tục.',
      },
      'final-cst-gesture': {
        percent: `${cstAmount} CST`,
        title: 'Phân bổ nét bút CST cuối cùng',
        body: '1.000 CST ghi nhận và một Cosmic Signature NFT dành cho người tham gia đặt nét bút CST cuối cùng của chu kỳ.',
      },
    },
  },

  anchoring: {
    eyebrow: 'Neo giữ',
    heading: 'Neo giữ Cosmic Signature NFT với giao thức.',
    body: `Cosmic Signature NFT đang neo giữ nhận một phần theo tỷ lệ của ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ mỗi chu kỳ, được chi trả khi gỡ neo. Gỡ neo bất cứ khi nào bạn muốn — nhưng mỗi NFT chỉ được neo giữ đúng một lần, nên việc gỡ neo chấm dứt vĩnh viễn khả năng neo giữ của NFT đó. Random Walk NFT đang neo giữ nhận các lượt Tinh tuyển NFT neo giữ, nơi những người neo giữ được chọn nhận ${cstAmount} CST và một Cosmic Signature NFT (không có ETH).`,
    bullets: [
      'ETH tích lũy theo từng chu kỳ, nhận về khi gỡ neo',
      'Gỡ neo bất cứ lúc nào — mỗi NFT chỉ neo giữ một lần',
      'Neo giữ Random Walk thuộc diện Tinh tuyển',
      'Không có kỳ hạn cố định và không có phạt; gỡ neo là vĩnh viễn với từng NFT',
    ],
    ctaLabel: 'Neo giữ trong ứng dụng',
  },

  publicGoods: {
    eyebrow: 'Hàng hóa công',
    heading: '7% của mỗi chu kỳ tài trợ những người đóng góp cốt lõi cho Ethereum.',
    body: 'Mỗi chu kỳ trình diễn chuyển 7% dự trữ ETH của mình đến Protocol Guild — cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho Ethereum. Hoạt động trong giao thức góp phần duy trì nguồn hỗ trợ cho hạ tầng Ethereum.',
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
    body: 'Hội đồng Vũ trụ điều phối giao thức trên chuỗi. Người nắm giữ CST ủy quyền trọng số cho chính mình hoặc địa chỉ khác để gửi đề xuất và bày tỏ tán thành, phản đối hoặc bỏ trống. Túc số điều phối đạt được khi tổng trọng số tán thành và bỏ trống bằng ít nhất 3% nguồn cung CST. Ngưỡng đề xuất: 100 CST.',
    columns: [
      {
        title: 'Đề xuất điều phối',
        body: 'Bất kỳ địa chỉ nào có ít nhất 100 CST trọng số được ủy quyền đều có thể gửi đề xuất. Độ trễ điều phối hai ngày, giai đoạn điều phối hai tuần.',
      },
      {
        title: 'Trọng số điều phối',
        body: 'Mỗi CST biểu thị một đơn vị trọng số sau khi được ủy quyền. Ý kiến được ghi nhận bằng chữ ký mật mã; CST không đại diện cho cổ phần hay công cụ vốn.',
      },
      {
        title: 'Túc số điều phối',
        body: 'Đề xuất được thông qua khi trọng số tán thành lớn hơn phản đối và tổng trọng số tán thành cùng bỏ trống đạt ít nhất 3% tổng cung CST. Trọng số phản đối không được tính vào túc số.',
      },
    ],
  },

  verifiability: {
    eyebrow: 'Khả năng xác minh',
    heading: 'Mở, đã xác minh, có thể tái tạo.',
    body: 'Bất kỳ ai cũng có thể kiểm tra Signature bằng cách tái tạo tác phẩm từ seed. Ứng dụng công bố thông tin xác minh hợp đồng, phân tích tĩnh và tình trạng kiểm toán khi có báo cáo. Tài liệu thuộc dự án trong kho mã này được công bố theo CC0 1.0; các phụ thuộc bên thứ ba, phông chữ và tài sản giữ giấy phép riêng của chúng.',
    pillars: [
      {
        title: 'CC0 1.0',
        body: 'Hợp đồng, shader và quy trình kết xuất thuộc dự án. Không bảo lưu quyền nào. Tài liệu bên thứ ba không thuộc phạm vi này.',
      },
      {
        title: 'Tình trạng xác minh',
        body: 'Ứng dụng liên kết địa chỉ hợp đồng công khai, tài nguyên mã nguồn, bối cảnh xác minh và tình trạng kiểm toán/báo cáo để bất kỳ ai cũng có thể kiểm tra những gì đã được công bố.',
      },
      {
        title: 'Nghệ thuật tái tạo được',
        body: 'Mã băm SHA-256 của các khung hình đã tạo được kiểm định trong tích hợp liên tục. Cùng seed → cùng kết quả.',
      },
    ],
  },

  faq: {
    eyebrow: 'Giải đáp',
    heading: 'Những câu hỏi đáng được trả lời thẳng thắn.',
    items: [
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'Đây có phải là xổ số, sòng bạc hay sản phẩm cờ bạc không?',
        answer:
          'Không. Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi. Người tham gia đặt nét bút trong một chu kỳ trình diễn; giao thức phân phối phân bổ qua hơn mười luồng khi chu kỳ hoàn tất. Không có nhà cái, không có người chia bài, không có cược. Các phân bổ ghi nhận sự bền bỉ, thời điểm và sự tham gia. Luồng phân bổ ngẫu nhiên duy nhất, Tinh tuyển, là một phép phân phối theo quy trình ở cấp giao thức.',
      },
      // lexicon-allow-end
      {
        question: 'Là người tham gia, tôi thực sự làm gì?',
        answer:
          'Bạn đặt nét bút. Mỗi nét bút là một giao dịch ETH hoặc CST kéo dài thời điểm hoàn tất chu kỳ, ghi nhận một lượt Tinh tuyển, có thể khắc CST tham gia động, và định hình Signature của chu kỳ. Bạn có thể neo giữ Cosmic Signature NFT để nhận một phần phân phối neo giữ. Bạn có thể gửi đề xuất điều phối qua Hội đồng Vũ trụ nếu nắm giữ ít nhất 100 CST.',
      },
      {
        question: 'Vì sao lượng CST tham gia thay đổi?',
        answer: `Lượng CST tham gia được tính theo căn bậc hai của thời gian kể từ nét bút trước. Khoảng cách càng dài, lượng CST càng lớn, nhưng tăng chậm hơn thời gian chờ. Hai nét bút quá gần nhau có thể khiến lượng CST được khắc bằng 0. Ứng dụng hiển thị số lượng ước tính trước khi bạn gửi.`,
      },
      {
        question: 'Nét bút ETH và CST ảnh hưởng thế nào đến cửa sổ hiệu chỉnh CST?',
        answer: `Cửa sổ hiệu chỉnh CST được lưu trên chuỗi và thay đổi sau mỗi nét bút. Một nét bút CST kéo dài nó khoảng ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN')}%, khiến chi phí nét bút CST giảm chậm hơn. Một nét bút ETH rút ngắn nó khoảng ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN')}%, khiến chi phí nét bút CST giảm nhanh hơn.`,
      },
      {
        question: 'Các phân bổ ETH đến từ đâu?',
        answer:
          'Từ Dự trữ chu kỳ, vốn lớn dần khi người tham gia đặt nét bút. Khi một chu kỳ hoàn tất, khoảng một nửa chuyển tiếp vào Dự trữ tích lũy của chu kỳ tiếp theo; phần còn lại được phân phối qua các luồng phân bổ (phân bổ Signature, Chiến binh Thời gian, phân phối neo giữ, Tinh tuyển, Hàng hóa công) theo các tham số trên chuỗi.',
      },
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: 'Có điều gì trong đây là đầu tư không?',
        answer:
          'Không. Token CST biểu thị sự tham gia và trọng số điều phối trong giao thức, không phải cổ phần, quyền hưởng lợi nhuận, cổ tức hay hợp đồng đầu tư. Không có ví nào của đội ngũ nhận ETH từ nét bút của người tham gia. Cosmic Signature không đưa ra cam kết nào về giá token hay diễn biến tương lai và không mời gọi tham gia như một khoản đầu tư.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: 'Hàng hóa công chính xác là gì?',
        answer:
          'Bảy phần trăm dự trữ ETH của mỗi chu kỳ được chuyển đến một địa chỉ hàng hóa công, hiện là Protocol Guild. Protocol Guild là cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho Ethereum. Đây là việc chuyển tiếp ETH đến một địa chỉ hàng hóa công; đây không phải là khoản đóng góp từ thiện theo nghĩa thuế của Hoa Kỳ, và Cosmic Signature không đưa ra cam kết nào về cách xử lý thuế của nó.',
      },
      // lexicon-allow-end
      {
        question: 'Về mặt kỹ thuật, tác phẩm là gì?',
        answer:
          'Mỗi Cosmic Signature NFT là một bản kết xuất tất định của một mô phỏng ba vật thể theo Newton. Seed trên chuỗi chọn một quỹ đạo ứng viên (từ 100.000 quỹ đạo được mô phỏng qua bộ tích phân symplectic Yoshida bậc 4), rồi kết xuất quang phổ qua 64 dải bước sóng với phép pha màu OKLab. Toàn bộ quy trình là mã nguồn mở theo CC0; bất kỳ ai cũng có thể tái tạo một Signature từ seed của nó.',
      },
      {
        question: 'Tôi có thể phân nhánh dự án này không?',
        answer:
          'Có. Hợp đồng, shader, bộ kết xuất, trang giới thiệu và tài liệu thuộc dự án được công bố theo CC0 1.0 — không bảo lưu quyền nào. Các phụ thuộc bên thứ ba, phông chữ và tài sản vẫn theo giấy phép riêng của chúng; xem THIRD_PARTY_NOTICES.md.',
      },
    ],
  },

  footer: {
    brandName: 'Cosmic Signature',
    logoAlt: 'Cosmic Signature',
    tagline: 'Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum.',
    columns: {
      protocol: {
        heading: 'Giao thức',
        links: {
          app: 'Mở ứng dụng',
          about: 'Giới thiệu',
          learn: 'Học',
          quiz: 'Trắc nghiệm',
          'how-it-works': 'Tài liệu',
          contracts: 'Hợp đồng',
          code: 'Mã nguồn',
          audits: 'Kiểm toán bảo mật',
        },
      },
      ecosystem: {
        heading: 'Hệ sinh thái',
        links: {
          marketplace: 'Sàn Axiom Zero',
          predictions: 'Dự đoán Chaos Zero',
          uniswap: 'Giao dịch CST trên Uniswap',
          geckoterminal: 'Xem pool CST trên GeckoTerminal',
        },
      },
      community: {
        heading: 'Cộng đồng',
        links: {
          twitter: 'X / Twitter',
          discord: 'Discord',
          github: 'GitHub',
          'protocol-guild': 'Protocol Guild',
        },
      },
      legal: {
        heading: 'Pháp lý',
        links: {
          terms: 'Điều khoản',
          privacy: 'Quyền riêng tư',
          faq: 'Câu hỏi thường gặp',
        },
      },
    },
    copyright: '© {year} Cosmic Signature. Tài liệu thuộc dự án: CC0 1.0.',
    colophon: 'CC0 1.0 · Có thể xác minh công khai · Nghệ thuật tái tạo được',
  },

  notFound: {
    heading: 'Không tìm thấy trang.',
    description:
      'Trang này không tồn tại hoặc đã được chuyển đi. Hãy trở về trang chủ để tiếp tục khám phá.',
    ctaLabel: 'Về trang chủ',
  },
} satisfies LandingText;
