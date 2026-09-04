import type { TrustPageCopy } from './TrustPageContent';

/** Vietnamese copy for /security, rendered by TrustPageContent. */
export const securityCopyVi: TrustPageCopy = {
  eyebrow: 'Tin cậy và bảo mật',
  title: 'Bảo mật Cosmic Signature',
  intro:
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Bảo mật của giao thức dựa trên hợp đồng thông minh công khai, dữ liệu minh bạch, việc kiểm tra kỹ thao tác ví và hướng dẫn rõ ràng cho người tham gia.',
  sections: [
    {
      heading: 'Mô hình bảo mật',
      paragraphs: [
        'Hợp đồng thông minh trên Arbitrum ghi lại các thao tác của giao thức. Trước khi kết nối ví hoặc đặt nét bút, hãy kiểm tra địa chỉ hợp đồng chính thức, mã nguồn, thông tin xác minh và điều kiện vận hành.',
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
        'Đối chiếu nội dung ứng dụng với hợp đồng đã xác minh, mã nguồn và dữ liệu hiện tại trên Arbitrum để kiểm tra cách giao thức hoạt động.',
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
