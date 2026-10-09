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
      'Mã nguồn công bố của mỗi hợp đồng khớp chính xác trên Sourcify (kiểm tra ngày {date}), nên bytecode trên chuỗi chính là mã bạn đọc được. <contracts>Trang hợp đồng</contracts> liệt kê mọi địa chỉ.',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: 'Sao chép {value}',
    copiedLabel: 'Đã sao chép',
  },
  controls: {
    heading: 'Quyền của chủ sở hữu và nâng cấp',
    paragraph:
      'Hợp đồng Giao thức Cosmic Signature có một chủ sở hữu: một tài khoản có thể thay đổi một số tham số và nâng cấp mã của hợp đồng, trong các giới hạn dưới đây. Mọi thay đổi đều được ghi trên chuỗi và liệt kê trong <coordination>Thay đổi điều phối</coordination>.',
    ownerLabel: 'Chủ sở hữu',
    ownerUnavailable:
      'Hiện chưa đọc được chủ sở hữu. Hàm owner() của hợp đồng trên Arbiscan trả về địa chỉ này.',
    account: {
      singleKey:
        'Một ví dùng một khóa duy nhất (tài khoản sở hữu bên ngoài), không phải ví đa chữ ký hay khóa thời gian.',
      contract: 'Một tài khoản hợp đồng thông minh, chẳng hạn ví đa chữ ký hoặc khóa thời gian.',
      renounced:
        'Quyền sở hữu đã được từ bỏ: không tài khoản nào có thể thay đổi tham số hay nâng cấp mã.',
    },
    rows: [
      {
        term: 'Giữa các chu kỳ',
        detail:
          'Chủ sở hữu có thể thay đổi tham số giao thức, như thời gian mỗi nét bút cộng thêm hay tỷ lệ các luồng phân bổ.',
      },
      {
        term: 'Trong một chu kỳ',
        detail:
          'Các tham số cốt lõi bị khóa từ lúc một chu kỳ kích hoạt, trước nét bút đầu tiên của nó, cho đến khi chu kỳ đó hoàn tất.',
      },
      {
        term: 'Bất cứ lúc nào',
        detail:
          'Chủ sở hữu có thể lùi thời điểm kích hoạt chu kỳ cho đến khi có nét bút đầu tiên, thay đổi độ trễ trước chu kỳ tiếp theo và quản lý các hợp đồng ngoại vi: Đơn vị thụ hưởng Hàng hóa công, liên kết siêu dữ liệu NFT và thời hạn nhận về của Ví phân bổ.',
      },
      {
        term: 'Nâng cấp',
        detail:
          'Giao thức chạy sau một proxy UUPS nên địa chỉ không bao giờ đổi. Chủ sở hữu chỉ có thể trỏ nó tới mã mới giữa các chu kỳ; mã đang dùng là bản triển khai V2 đã được xác minh công khai, liệt kê ở trên.',
      },
      {
        term: 'Hội đồng Vũ trụ',
        detail:
          'Quyền sở hữu dự kiến được chuyển giao cho Hội đồng Vũ trụ khi giao thức ổn định. Từ đó, tham số chỉ thay đổi qua các đề xuất điều phối giao thức đạt túc số điều phối.',
      },
    ],
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
    lead: 'Nếu bạn phát hiện lỗ hổng trong hợp đồng Cosmic Signature, ứng dụng hoặc trang web này, hãy gửi email đến <support>support@cosmicsignature.com</support> với tiêu đề có chữ “Security”. Một báo cáo hữu ích cho biết:',
    include: [
      'Bạn phát hiện điều gì, và nó ảnh hưởng đến hợp đồng, trang hay địa chỉ nào.',
      'Cách tái hiện, từng bước.',
      'Nó cho phép người khác làm gì, và với tiền của ai.',
      'Cách nhóm có thể liên hệ với bạn.',
    ],
    scopeHeading: 'Phạm vi',
    scope: [
      {
        term: 'Trong phạm vi',
        detail:
          'Các hợp đồng trong mục <securityOfficial>Địa chỉ chính thức</securityOfficial>, app.cosmicsignature.com và cosmicsignature.com.',
      },
      {
        term: 'Ngoài phạm vi',
        detail:
          'Các dịch vụ Cosmic Signature không vận hành, như ví, sàn NFT, cầu nối và chính mạng Arbitrum. Hãy báo cho đội ngũ của các dịch vụ đó.',
      },
    ],
    closing:
      'Hãy cho nhóm thời gian phản hồi và khắc phục trước khi công bố, và đừng thử lợi dụng lỗ hổng trên hợp đồng đang chạy hay tiền của người tham gia khác. Cùng thông tin liên hệ này có trong tệp <securityTxt>security.txt</securityTxt> của trang web.',
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
