import type { TrustPageCopy } from './TrustPageContent';

/** Vietnamese copy for /security, rendered by TrustPageContent. */
export const securityCopyVi: TrustPageCopy = {
  eyebrow: 'Tin cậy và bảo mật',
  title: 'Bảo mật Cosmic Signature',
  intro:
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Thế trận bảo mật của nó dựa trên các hợp đồng thông minh công khai, dữ liệu giao thức minh bạch, tương tác ví cẩn trọng và việc hướng dẫn rõ ràng cho người tham gia.',
  sections: [
    {
      heading: 'Mô hình bảo mật',
      paragraphs: [
        'Các hành động của giao thức được các hợp đồng thông minh trên Arbitrum ghi lại. Các trang công khai nên cho người dùng và trình thu thập dữ liệu kiểm tra địa chỉ hợp đồng, tài nguyên mã nguồn, bối cảnh xác minh và các giả định vận hành trước khi kết nối ví hoặc đặt nét bút.',
      ],
      bullets: [
        'Dùng ứng dụng chính thức tại `https://app.cosmicsignature.com/`.',
        'Xác minh địa chỉ hợp đồng từ trang hợp đồng trước khi tương tác trên chuỗi.',
        'Xem kỹ các lời nhắc của ví; giao dịch blockchain không thể đảo ngược.',
        'Không coi CST, NFT, nét bút hay phân bổ là kết quả tài chính được bảo đảm.',
      ],
    },
    {
      heading: 'Tài nguyên xác minh',
      paragraphs: [
        'Tín hiệu bảo mật mạnh nhất là sự nhất quán giữa nội dung hiển thị trong ứng dụng, các hợp đồng đã xác minh, mã nguồn và dữ liệu trực tiếp trên Arbitrum.',
      ],
      links: [
        {
          kind: 'app',
          href: '/contracts',
          label: 'Hợp đồng Cosmic Signature và địa chỉ trên Arbitrum',
        },
        {
          kind: 'app',
          href: '/code',
          label: 'Mã nguồn Cosmic Signature và quy trình kết xuất',
        },
        { kind: 'app', href: '/audits', label: 'Kiểm toán và ghi chú kiểm chứng hình thức' },
        {
          kind: 'app',
          href: '/risk-disclosures',
          label: 'Công bố rủi ro và sự minh bạch với người tham gia',
        },
      ],
    },
  ],
};
