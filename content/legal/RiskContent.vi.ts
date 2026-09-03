import type { TrustPageCopy } from './TrustPageContent';

/** Vietnamese copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyVi: TrustPageCopy = {
  eyebrow: 'Rủi ro và sự minh bạch với người tham gia',
  title: 'Công bố rủi ro Cosmic Signature',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Đây không phải xổ số, sòng bạc, sản phẩm cờ bạc, sản phẩm đầu tư hay lời hứa về kết quả tài chính.',
  // lexicon-allow-end
  sections: [
    {
      heading: 'Các rủi ro chính',
      bullets: [
        'Giao dịch blockchain là công khai và thường không thể đảo ngược.',
        'Bảo mật ví, khóa riêng và việc chấp thuận giao dịch là trách nhiệm của người dùng.',
        'Tắc nghẽn mạng, gián đoạn RPC, độ trễ của bộ lập chỉ mục hoặc sự cố ứng dụng có thể ảnh hưởng đến trải nghiệm.',
        'Nên xem kỹ tham số giao thức, phân bổ và thời điểm trước khi tham gia.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'Không nên hiểu CST và NFT là lợi nhuận được bảo đảm hay sản phẩm tài chính.',
        // lexicon-allow-end
      ],
    },
    {
      heading: 'Người tham gia làm gì',
      paragraphs: [
        'Người tham gia đặt nét bút trong các chu kỳ trình diễn. Nét bút có thể ảnh hưởng đến trạng thái đang biến chuyển của giao thức, khắc CST tham gia và góp vào bối cảnh của nghệ thuật Cosmic Signature NFT tất định. Kết quả được định nghĩa bởi cơ chế công khai của hợp đồng thông minh, không phải bởi những lời hứa ngoài chuỗi.',
      ],
    },
    {
      heading: 'Trang liên quan',
      links: [
        // lexicon-allow-start: link label names the categories denied by the linked page.
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Cosmic Signature có phải là xổ số, sòng bạc hay đầu tư?',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: 'Điều khoản dịch vụ' },
        { kind: 'app', href: '/security', label: 'Tổng quan bảo mật' },
      ],
    },
  ],
};
