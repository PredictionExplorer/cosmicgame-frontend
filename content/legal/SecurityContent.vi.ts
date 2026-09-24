import type { SecurityCopy } from './SecurityContent';

/** Vietnamese copy for /security, rendered by SecurityContent. */
export const securityCopyVi: SecurityCopy = {
  title: 'Bảo mật',
  intro:
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Bảo mật của giao thức dựa trên hợp đồng thông minh công khai, dữ liệu minh bạch, việc kiểm tra kỹ thao tác ví và hướng dẫn rõ ràng cho người tham gia.',
  official: {
    heading: 'Địa chỉ chính thức',
    intro:
      'Chỉ mở Cosmic Signature từ các trang web này, và kiểm tra từng ký tự của địa chỉ trước khi bạn kết nối ví hoặc chấp thuận giao dịch. Mọi trang web hay tài khoản khác tự nhận là Cosmic Signature đều không phải trang chính thức.',
    websitesHeading: 'Trang web',
    websites: {
      app: 'Ứng dụng: nét bút, phân bổ, neo giữ và hồ sơ công khai',
      landing: 'Trang dự án: tác phẩm, sách trắng và hướng dẫn',
    },
    communityHeading: 'Cộng đồng',
    community: {
      x: 'Thông báo',
      discord: 'Trò chuyện cộng đồng và hỗ trợ',
    },
    contractsHeading: 'Hợp đồng cốt lõi trên Arbitrum One',
    contractsIntro:
      'Mã nguồn công bố của mỗi hợp đồng khớp chính xác trên Sourcify, nên bytecode trên chuỗi chính là mã bạn đọc được. <contracts>Trang hợp đồng</contracts> liệt kê mọi địa chỉ.',
    sourcifyMatch: 'Khớp chính xác',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: 'Sao chép {value}',
    copiedLabel: 'Đã sao chép',
  },
  model: {
    heading: 'Mô hình bảo mật',
    paragraph:
      'Hợp đồng thông minh trên Arbitrum ghi lại mọi thao tác của giao thức. Trước khi kết nối ví hoặc đặt nét bút, hãy xem địa chỉ hợp đồng đã công bố, mã nguồn, kết quả kiểm toán và các rủi ro.',
    bullets: [
      'Chỉ mở ứng dụng từ các địa chỉ chính thức ở trên, và kiểm tra thanh địa chỉ trước khi kết nối ví.',
      'Xác minh địa chỉ hợp đồng trên <contracts>trang hợp đồng</contracts> trước khi tương tác với hợp đồng đó trên chuỗi.',
      'Đọc kỹ mọi lời nhắc của ví trước khi chấp thuận: giao dịch blockchain không thể đảo ngược.',
      'Cosmic Signature sẽ không bao giờ hỏi cụm từ khôi phục hay khóa riêng của bạn. Ai hỏi những điều đó đều không phải Cosmic Signature.',
      'Không coi CST, NFT, nét bút hay phân bổ là kết quả tài chính được bảo đảm; xem <risk>công bố rủi ro</risk>.',
    ],
  },
  report: {
    heading: 'Báo cáo lỗ hổng',
    paragraphs: [
      'Nếu bạn phát hiện lỗ hổng trong hợp đồng, ứng dụng hoặc trang web này, hãy gửi email đến <support>support@cosmicsignature.com</support> với tiêu đề có chữ “Security”. Hãy mô tả điều bạn phát hiện, cách tái hiện và phạm vi ảnh hưởng.',
      'Hãy cho nhóm thời gian phản hồi và khắc phục trước khi công bố, và đừng thử lợi dụng lỗ hổng trên hợp đồng đang chạy hay tiền của người tham gia khác. Cùng thông tin liên hệ này có trong tệp <securityTxt>security.txt</securityTxt> của trang web.',
    ],
  },
  verify: {
    heading: 'Tự kiểm chứng',
    paragraph:
      'Tín hiệu bảo mật mạnh nhất là sự thống nhất giữa những gì ứng dụng hiển thị, hợp đồng đã xác minh, mã nguồn và dữ liệu trực tiếp trên Arbitrum. Bạn có thể tự kiểm tra từng thứ mà không cần tin vào trang web này.',
    resources: [
      {
        link: 'contracts',
        label: 'Địa chỉ hợp đồng',
        description:
          'Mọi hợp đồng Cosmic Signature trên Arbitrum, kèm liên kết đến trình khám phá khối và Sourcify',
      },
      {
        link: 'audits',
        label: 'Kiểm toán',
        description:
          'Kiểm toán của Hacken: các phát hiện theo mức độ nghiêm trọng, các bất biến đã kiểm thử fuzz và báo cáo đầy đủ',
      },
      {
        link: 'code',
        label: 'Mã nguồn',
        description: 'Các kho mã và trình kết xuất biến mỗi seed thành tác phẩm',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: 'Đối chiếu bytecode của bất kỳ hợp đồng nào với mã nguồn đã công bố',
      },
    ],
  },
};
