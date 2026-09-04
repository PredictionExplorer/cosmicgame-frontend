import type { TrustPageCopy } from './TrustPageContent';

/** Vietnamese copy for /audits, rendered by TrustPageContent. */
export const auditsCopyVi: TrustPageCopy = {
  eyebrow: 'Kiểm toán và xác minh',
  title: 'Kiểm toán Cosmic Signature',
  intro:
    'Trang này tổng hợp kết quả rà soát hợp đồng Cosmic Signature và liên kết đến các báo cáo. Bạn có thể xem phạm vi kiểm toán, các vấn đề được ghi nhận và bản triển khai công khai của giao thức.',
  sections: [
    {
      heading: 'Kiểm toán độc lập bởi Hacken',
      paragraphs: [
        'Cuối năm 2025, Hacken đã thực hiện một cuộc rà soát bảo mật độc lập các hợp đồng thông minh của Cosmic Signature. Phạm vi bao gồm các hợp đồng đang vận hành trong kho mã công khai, từ giao thức cốt lõi điều hành mỗi chu kỳ đến token CST, cả hai bộ sưu tập NFT, các ví neo giữ, cùng các hợp đồng quản lý ví và hệ thống hỗ trợ chúng. Hacken công bố báo cáo cuối cùng vào tháng 1 năm 2026.',
        'Báo cáo liệt kê 23 phát hiện, không có phát hiện nào ở mức nghiêm trọng hay cao: 3 mức trung bình, 8 mức thấp và 12 quan sát mang tính thông tin. Phần lớn mô tả những cân nhắc thiết kế mà đội ngũ đã xem xét và chấp nhận, và báo cáo giải thích từng phát hiện cùng trạng thái của nó.',
        'Bên cạnh rà soát thủ công, Hacken đã chạy kiểm thử fuzz với 14 bất biến của hệ thống, chẳng hạn yêu cầu rằng lượng ETH giao thức nắm giữ luôn bằng số đã nạp trừ số đã nhận về. Cả 14 bất biến đều giữ vững qua 10.000 lượt chạy.',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: 'Đọc toàn bộ báo cáo kiểm toán của Hacken',
      },
      note: 'Rà soát lần cuối: 24/08/2026. Trang này là nơi công khai chính thức về tình trạng kiểm toán và xác minh của Cosmic Signature.',
    },
    {
      heading: 'Danh mục xác minh',
      bullets: [
        'Xác nhận địa chỉ hợp đồng trên trang hợp đồng chính thức.',
        'So sánh mã nguồn đã xác minh và dữ liệu ABI trên trình khám phá khối của Arbitrum.',
        'Đọc báo cáo kiểm toán của Hacken để xem đầy đủ các phát hiện và trạng thái của chúng.',
        'Xác nhận rằng cơ chế hiển thị trong ứng dụng khớp với hành vi công khai của hợp đồng.',
      ],
    },
    {
      heading: 'Tài liệu bảo mật liên quan',
      links: [
        { kind: 'app', href: '/contracts', label: 'Địa chỉ hợp đồng Arbitrum đã xác minh' },
        { kind: 'app', href: '/code', label: 'Mã nguồn và tài nguyên kết xuất tất định' },
        { kind: 'app', href: '/security', label: 'Tổng quan bảo mật' },
      ],
    },
  ],
};
