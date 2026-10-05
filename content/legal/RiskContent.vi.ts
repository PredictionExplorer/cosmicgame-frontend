import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** Vietnamese copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyVi: RiskCopy = {
  title: 'Công bố rủi ro',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Đây không phải xổ số, sòng bạc, sản phẩm cờ bạc, sản phẩm đầu tư hay lời hứa về kết quả tài chính.',
  // lexicon-allow-end
  keyPoint: {
    title: 'Trước khi tham gia',
    text: 'Chỉ đặt nét bút bằng số tiền bạn chấp nhận mất. Khoản bạn chi cho một nét bút không được hoàn lại, dù chu kỳ diễn biến thế nào sau đó.',
  },
  groups: [
    {
      id: 'mechanics',
      heading: 'Cơ chế chu kỳ',
      risks: [
        'ETH hoặc CST đã chi cho một nét bút không được hoàn lại khi có nét bút khác theo sau.',
        `Mỗi nét bút ETH làm chi phí nét bút ETH tiếp theo tăng ${facts.ethGestureCostStepUpPercent}%, nên các nét bút lặp lại sẽ đắt dần.`,
        'Cửa sổ hiệu chỉnh làm thay đổi chi phí nét bút CST: chi phí giảm dần khi không ai đặt nét bút CST và bắt đầu lại ở mức cao hơn sau mỗi nét bút CST, nên chi phí bạn thấy có thể thay đổi trước khi giao dịch của bạn được xử lý.',
      ],
      source:
        'Quy tắc: mục <termsMechanics>Cơ chế giao thức và hợp đồng thông minh</termsMechanics> trong Điều khoản dịch vụ.',
    },
    {
      id: 'timing',
      heading: 'Thời hạn và nhận về',
      risks: [
        `Người đặt nét bút cuối cùng có ${facts.finalGestureExclusivityHours} giờ sau thời điểm hoàn tất chu kỳ để tự mình hoàn tất chu kỳ. Sau đó, bất kỳ ai cũng có thể hoàn tất chu kỳ và, theo quy tắc của hợp đồng, trở thành người nhận phân bổ Signature.`,
        `Các phân bổ ETH khác và tài sản đính kèm mặc định chờ người nhận trong ${facts.secondaryRetrievalTimeoutWeeks} tuần. Sau đó, bất kỳ ai cũng có thể nhận về phần còn lại cho chính mình.`,
      ],
      source:
        'Quy tắc: mục <termsRetrieval>Nhận về phân bổ</termsRetrieval> trong Điều khoản dịch vụ.',
    },
    {
      id: 'permanent',
      heading: 'Thao tác không thể hoàn tác',
      risks: [
        'Giao dịch đã xác nhận không thể đảo ngược, hủy hay hoàn tiền.',
        'Random Walk NFT đã dùng để giảm chi phí nét bút ETH sẽ được dùng hết: nó không bao giờ giảm chi phí được nữa.',
        'Mỗi NFT chỉ có thể neo giữ một lần. Sau khi gỡ neo, không thể neo giữ lại.',
      ],
      source:
        'Quy tắc: mục <termsRandomWalk>Giảm chi phí với Random Walk NFT</termsRandomWalk> trong Điều khoản dịch vụ.',
    },
    {
      id: 'wallets',
      heading: 'Ví và khóa',
      risks: [
        'Chỉ bạn giữ khóa của mình. Ai có cụm từ khôi phục của bạn đều kiểm soát được ví của bạn, và cụm từ đã mất thì không thể khôi phục.',
        'Một lời nhắc của ví có thể cấp nhiều quyền hơn vẻ bề ngoài. Hãy đọc mọi yêu cầu chấp thuận và chỉ dùng <securityOfficial>địa chỉ chính thức</securityOfficial>.',
      ],
      source:
        'Quy tắc: mục <termsEligibility>Điều kiện tham gia và yêu cầu về tài khoản</termsEligibility> trong Điều khoản dịch vụ.',
    },
    {
      id: 'availability',
      heading: 'Mạng và ứng dụng',
      risks: [
        'Tắc nghẽn mạng, gián đoạn RPC, độ trễ của bộ lập chỉ mục hoặc sự cố ứng dụng có thể làm chậm hoặc chặn giao dịch và dữ liệu mà trang web này hiển thị.',
        'Trang web có thể hiển thị dữ liệu chậm hơn chuỗi vài giây hoặc lâu hơn. Khi hai bên khác nhau, hợp đồng trên Arbitrum là nguồn chính xác.',
        'Hợp đồng thông minh có thể có lỗi mà không cuộc kiểm toán nào phát hiện. Xem <audits>Kiểm toán</audits> để biết những gì đã được kiểm tra.',
      ],
      source:
        'Quy tắc: mục <termsRisks>Rủi ro và tuyên bố miễn trừ</termsRisks> trong Điều khoản dịch vụ.',
    },
    {
      id: 'value',
      heading: 'Giá trị và kết quả',
      risks: [
        'Giá trị thị trường của ETH, CST và NFT có thể thay đổi mạnh, thậm chí về 0.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'Không nên hiểu CST và NFT là lợi nhuận được bảo đảm hay sản phẩm tài chính.',
        // lexicon-allow-end
        'Không nét bút nào bảo đảm một phân bổ. Kết quả tuân theo quy tắc công khai của hợp đồng, không phải lời hứa ngoài chuỗi.',
      ],
      source:
        'Quy tắc: mục <termsNoGuarantee>Không bảo đảm kết quả</termsNoGuarantee> trong Điều khoản dịch vụ.',
    },
  ],
  participation: {
    heading: 'Người tham gia làm gì',
    paragraphs: [
      'Người tham gia đặt nét bút trong các chu kỳ trình diễn. Nét bút có thể ảnh hưởng đến trạng thái đang biến chuyển của giao thức, khắc CST tham gia và góp vào bối cảnh của nghệ thuật Cosmic Signature NFT tất định. Kết quả được định nghĩa bởi cơ chế công khai của hợp đồng thông minh, không phải bởi những lời hứa ngoài chuỗi.',
      // lexicon-allow-start: link label names the categories denied by the linked page.
      'Đọc vì sao Cosmic Signature <notALottery>không phải xổ số, sòng bạc hay đầu tư</notALottery>.',
      // lexicon-allow-end
    ],
  },
};
