import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyVi = {
  title: 'Chính sách quyền riêng tư',
  subtitle:
    'Quyền riêng tư của bạn rất quan trọng với chúng tôi. Chính sách này giải thích cách Cosmic Signature thu thập, sử dụng và bảo vệ thông tin của bạn khi bạn tương tác với ứng dụng phi tập trung của chúng tôi.',
  homeLabel: 'Trang chủ',
  lastUpdated: 'Cập nhật lần cuối: 20 tháng 7 năm 2026',
  introductionTitle: 'Giới thiệu',
  introduction: [
    'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum, một mạng Layer 2 của Ethereum. Ứng dụng phi tập trung (dApp) này xử lý dữ liệu và quyền riêng tư theo cách khác với ứng dụng web truyền thống.',
    'Chính sách quyền riêng tư này mô tả cách chúng tôi xử lý thông tin liên quan đến việc bạn sử dụng Cosmic Signature. Khi sử dụng nền tảng, bạn đồng ý với việc thu thập và sử dụng thông tin theo chính sách này.',
  ],
  sections: [
    {
      id: 'collection',
      title: 'Thông tin chúng tôi thu thập',
      content: [
        {
          id: 'wallet',
          subtitle: 'Thông tin ví',
          text: 'Khi bạn kết nối ví Web3 để dùng Cosmic Signature, chúng tôi thu thập địa chỉ ví công khai của bạn. Điều này cần thiết để xử lý giao dịch, hiển thị NFT của bạn, theo dõi nét bút và phân phối phân bổ.',
        },
        {
          id: 'transactions',
          subtitle: 'Dữ liệu giao dịch',
          text: 'Chúng tôi thu thập thông tin về các tương tác của bạn với hợp đồng thông minh, gồm nét bút đã đặt, NFT đã nhận, hoạt động neo giữ và các lần nhận về phân bổ. Toàn bộ dữ liệu này đều công khai trên blockchain.',
        },
        {
          id: 'usage',
          subtitle: 'Dữ liệu sử dụng',
          text: 'Chúng tôi có thể thu thập dữ liệu sử dụng ẩn danh như các trang đã xem, thời gian trên nền tảng và các mẫu tương tác chung để cải thiện dịch vụ.',
        },
      ],
    },
    {
      id: 'use',
      title: 'Cách chúng tôi sử dụng thông tin của bạn',
      content: [
        {
          id: 'delivery',
          subtitle: 'Cung cấp dịch vụ',
          text: 'Địa chỉ ví và dữ liệu giao dịch của bạn được dùng để cung cấp các dịch vụ của giao thức, gồm xử lý nét bút, quản lý NFT, phân phối phân bổ và hiển thị thống kê giao thức của bạn.',
        },
        {
          id: 'improvement',
          subtitle: 'Cải thiện nền tảng',
          text: 'Chúng tôi dùng dữ liệu tổng hợp, ẩn danh để cải thiện nền tảng, sửa lỗi và phát triển tính năng mới.',
        },
        {
          id: 'communication',
          subtitle: 'Liên lạc',
          text: 'Chúng tôi có thể dùng thông tin của bạn để gửi các cập nhật quan trọng về nền tảng, chẳng hạn thông báo bảo mật hoặc những thay đổi lớn trong cơ chế giao thức.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Bảo mật dữ liệu',
      content: [
        {
          id: 'blockchain',
          subtitle: 'Bảo mật blockchain',
          text: 'Việc thanh toán của giao thức diễn ra trên Arbitrum, một mạng Layer 2 của Ethereum. Việc kết nối ví không chuyển quyền kiểm soát ví hay tài sản cho chúng tôi. Tuy nhiên, khi bạn chấp thuận và ký một hành động trên hợp đồng thông minh một cách rõ ràng, giao dịch đó có thể chuyển tài sản đến một hợp đồng của giao thức hoặc khóa chúng ở đó đến khi các điều kiện gỡ hoặc nhận về tương ứng được đáp ứng.',
        },
        {
          id: 'infrastructure',
          subtitle: 'Bảo mật hạ tầng',
          text: 'Hạ tầng web của chúng tôi dùng các biện pháp bảo mật tiêu chuẩn ngành, gồm mã hóa HTTPS, lưu trữ an toàn và kiểm toán bảo mật định kỳ.',
        },
        {
          id: 'passwords',
          subtitle: 'Không có mật khẩu',
          text: 'Chúng tôi không bao giờ yêu cầu hay lưu mật khẩu. Việc xác thực được xử lý hoàn toàn thông qua ví Web3 của bạn.',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Chia sẻ và tiết lộ dữ liệu',
      content: [
        {
          id: 'public-chain',
          subtitle: 'Dữ liệu blockchain công khai',
          text: 'Giao dịch blockchain vốn là dữ liệu công khai. Địa chỉ ví, nét bút, quyền sở hữu NFT và phân bổ của bạn hiển thị trên blockchain và qua nền tảng của chúng tôi.',
        },
        {
          id: 'third-party',
          subtitle: 'Dịch vụ bên thứ ba',
          text: 'Chúng tôi có thể dùng dịch vụ bên thứ ba cho phân tích, lưu trữ và hạ tầng. Các dịch vụ này chịu ràng buộc bởi chính sách quyền riêng tư của riêng họ và chúng tôi bảo đảm họ đáp ứng các tiêu chuẩn bảo vệ dữ liệu phù hợp.',
        },
        {
          id: 'legal',
          subtitle: 'Yêu cầu pháp lý',
          text: 'Chúng tôi có thể tiết lộ thông tin nếu pháp luật, lệnh tòa hoặc quy định của cơ quan nhà nước yêu cầu.',
        },
      ],
    },
    {
      id: 'rights',
      title: 'Quyền và lựa chọn của bạn',
      content: [
        {
          id: 'wallet',
          subtitle: 'Kiểm soát ví',
          text: 'Bạn giữ toàn quyền kiểm soát ví của mình và có thể ngắt kết nối khỏi nền tảng bất cứ lúc nào.',
        },
        {
          id: 'permanence',
          subtitle: 'Tính vĩnh viễn của blockchain',
          text: 'Giao dịch blockchain được lưu vĩnh viễn và không thể xóa. Một khi nét bút đã được đặt hoặc NFT đã được chuyển giao, thông tin này tồn tại trên blockchain mãi mãi.',
        },
        {
          id: 'cookies',
          subtitle: 'Tùy chọn cookie',
          text: 'Trang web của chúng tôi có thể dùng cookie cho các chức năng cơ bản. Bạn có thể kiểm soát thiết lập cookie qua trình duyệt.',
        },
      ],
    },
  ],
  additionalTitle: 'Thông tin bổ sung',
  additional: [
    {
      id: 'children',
      subtitle: 'Quyền riêng tư của trẻ em',
      text: 'Dịch vụ của chúng tôi không dành cho người dùng dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em. Nếu bạn là cha mẹ hoặc người giám hộ và tin rằng con mình đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ với chúng tôi.',
    },
    {
      id: 'changes',
      subtitle: 'Thay đổi chính sách này',
      text: 'Chúng tôi có thể cập nhật Chính sách quyền riêng tư theo thời gian. Chúng tôi sẽ thông báo mọi thay đổi bằng cách đăng Chính sách quyền riêng tư mới trên trang này và cập nhật ngày “Cập nhật lần cuối”. Bạn nên xem lại Chính sách quyền riêng tư này định kỳ để nắm các thay đổi.',
    },
    {
      id: 'contact',
      subtitle: 'Thông tin liên hệ',
      text: 'Nếu bạn có câu hỏi về Chính sách quyền riêng tư này, vui lòng liên hệ với chúng tôi qua các kênh cộng đồng chính thức hoặc kho mã GitHub.',
    },
    {
      id: 'international',
      subtitle: 'Người dùng quốc tế',
      text: 'Cosmic Signature thanh toán trên Arbitrum, một mạng Layer 2 của Ethereum có thể truy cập toàn cầu. Khi sử dụng nền tảng, bạn xác nhận rằng thông tin của mình có thể được xử lý và lưu trữ tại nhiều địa điểm khác nhau trên thế giới.',
    },
  ],
  notice: {
    title: 'Quan trọng: tính minh bạch của blockchain',
    text: 'Xin lưu ý rằng giao dịch blockchain là công khai và vĩnh viễn. Địa chỉ ví và mọi tương tác của bạn với hợp đồng thông minh của chúng tôi đều hiển thị công khai và không thể xóa. Đây là đặc tính căn bản của công nghệ blockchain, không phải hạn chế trong thực hành quyền riêng tư của chúng tôi.',
  },
} as const satisfies PrivacyCopy;
