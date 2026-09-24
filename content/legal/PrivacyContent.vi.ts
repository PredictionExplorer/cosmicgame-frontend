import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyVi = {
  title: 'Chính sách quyền riêng tư',
  subtitle:
    'Cách Cosmic Signature xử lý thông tin khi bạn dùng ứng dụng và trang dự án: điều gì công khai trên chuỗi, trang web đo lường và lưu trữ gì, và dịch vụ nào nhận dữ liệu gì.',
  inShort: {
    title: 'Tóm tắt',
    points: [
      'Địa chỉ ví của bạn và mọi việc bạn làm trên chuỗi đều công khai và vĩnh viễn: ai cũng đọc được trên Arbitrum và không ai xóa được.',
      'Kết nối ví chỉ chia sẻ địa chỉ công khai của ví. Chúng tôi không bao giờ hỏi cụm từ khôi phục, khóa riêng hay mật khẩu của bạn, và không thu thập tên hay địa chỉ email của bạn.',
      'Trang web đo lượt truy cập và báo lỗi qua các dịch vụ được nêu tên bên dưới, và chỉ đặt các cookie được liệt kê bên dưới.',
    ],
  },
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
          text: 'Chúng tôi đo cách trang web được sử dụng: các trang được xem, tốc độ tải trang, trang dẫn đến, cùng quốc gia, trình duyệt và loại thiết bị của lượt truy cập. Các dịch vụ phân tích làm việc này được liệt kê tại <privacyServices>Dịch vụ chúng tôi sử dụng</privacyServices>.',
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
          text: 'Chúng tôi dùng dữ liệu sử dụng đã tổng hợp và báo cáo lỗi để sửa lỗi và cải thiện trang web.',
        },
        {
          id: 'communication',
          subtitle: 'Liên lạc',
          text: 'Chúng tôi không thu thập địa chỉ email hay thông tin liên hệ khác, nên không liên hệ trực tiếp với bạn. Thông báo, bao gồm thông báo bảo mật và thay đổi của giao thức, được đăng trên <x>X</x> và <discord>Discord</discord>.',
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
          text: 'Trang web chỉ được phục vụ qua HTTPS, trên nền tảng lưu trữ của Vercel. Các hợp đồng thông minh đã được kiểm toán độc lập; xem <audits>Kiểm toán</audits>.',
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
          text: 'Các dịch vụ được liệt kê tại <privacyServices>Dịch vụ chúng tôi sử dụng</privacyServices> nhận dữ liệu được mô tả ở đó và xử lý theo chính sách quyền riêng tư của riêng họ, có liên kết trong bảng.',
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
          text: 'Trang web chỉ đặt các cookie được liệt kê tại <privacyStorage>Cookie và bộ nhớ trình duyệt</privacyStorage>. Bạn có thể xóa hoặc chặn chúng trong cài đặt trình duyệt; trang web vẫn hoạt động nhưng sẽ không nhớ bảng màu và ngôn ngữ của bạn.',
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
      text: 'Chúng tôi có thể cập nhật Chính sách quyền riêng tư này theo thời gian. Mọi thay đổi đều được đăng trên trang này kèm ngày “Cập nhật lần cuối” ở đầu trang, và từng thay đổi đều có trong <privacyHistory>lịch sử sửa đổi</privacyHistory> của chính sách.',
    },
    {
      id: 'contact',
      subtitle: 'Thông tin liên hệ',
      text: 'Nếu bạn có câu hỏi về Chính sách quyền riêng tư này, hãy liên hệ với chúng tôi qua <support>support@cosmicsignature.com</support>, trên <discord>Discord</discord> hoặc trên <x>X</x>.',
    },
    {
      id: 'international',
      subtitle: 'Người dùng quốc tế',
      text: 'Cosmic Signature thanh toán trên Arbitrum, một mạng Layer 2 của Ethereum có thể truy cập toàn cầu. Khi sử dụng nền tảng, bạn xác nhận rằng thông tin của mình có thể được xử lý và lưu trữ tại nhiều địa điểm khác nhau trên thế giới.',
    },
  ],
  services: {
    heading: 'Dịch vụ chúng tôi sử dụng',
    intro:
      'Trang web này dùng các dịch vụ dưới đây. Mỗi dịch vụ xử lý dữ liệu được nêu theo chính sách quyền riêng tư của riêng mình.',
    columns: {
      service: 'Dịch vụ',
      purpose: 'Mục đích',
      data: 'Dữ liệu nhận được',
      policy: 'Chính sách quyền riêng tư',
    },
    policyLink: 'Chính sách',
    ownPolicy: 'Chính sách này',
    none: 'Không có',
    items: {
      vercel: {
        purpose: 'Lưu trữ và phân phối trang web',
        data: 'Địa chỉ IP và thông tin trình duyệt của bạn, trong nhật ký yêu cầu',
      },
      vercelAnalytics: {
        purpose: 'Đếm lượt xem trang và đo tốc độ trang, không dùng cookie',
        data: 'Trang được xem, trang dẫn đến, quốc gia, trình duyệt và loại thiết bị',
      },
      googleAnalytics: {
        purpose: 'Đo cách khách truy cập sử dụng trang web',
        data: 'Trang được xem, vị trí gần đúng, trình duyệt và thiết bị, qua cookie',
      },
      sentry: {
        purpose: 'Báo lỗi để có thể sửa',
        data: 'Lỗi, trang, trình duyệt của bạn và bản ghi lại khoảnh khắc trước lỗi, với mọi văn bản và dữ liệu nhập đều được che',
      },
      api: {
        purpose: 'Cung cấp dữ liệu giao thức mà các trang hiển thị',
        data: 'Các bản ghi bạn mở, kể cả địa chỉ ví bạn tra cứu',
      },
      rpc: {
        purpose: 'Đọc hợp đồng trên Arbitrum và chuyển tiếp giao dịch bạn ký',
        data: 'Địa chỉ IP của bạn, các địa chỉ được đọc và giao dịch bạn gửi',
      },
      walletConnect: {
        purpose: 'Kết nối ví di động và ví qua mã QR',
        data: 'Địa chỉ ví của bạn và các tin nhắn đã mã hóa giữa trang web và ví',
      },
      coingecko: {
        purpose: 'Cung cấp giá ETH và CST theo đô la Mỹ',
        data: 'Địa chỉ IP của bạn, khi một trang hiển thị giá đô la',
      },
    },
  },
  storage: {
    heading: 'Cookie và bộ nhớ trình duyệt',
    intro:
      'Trang web lưu những mục sau trên thiết bị của bạn. Không mục nào chứa tên hay thông tin liên hệ của bạn. Cookie được gửi kèm yêu cầu; bộ nhớ trình duyệt chỉ ở trên thiết bị của bạn.',
    columns: {
      name: 'Tên',
      kind: 'Loại',
      purpose: 'Mục đích',
      lifetime: 'Lưu trong',
    },
    kinds: {
      cookie: 'Cookie',
      browser: 'Bộ nhớ trình duyệt',
    },
    lifetimes: {
      oneYear: '1 năm',
      twoYears: '2 năm',
      untilCleared: 'Đến khi bạn xóa',
    },
    items: {
      themeCookie: 'Ghi nhớ bảng màu của bạn trên cả hai trang Cosmic Signature',
      localeCookie: 'Ghi nhớ ngôn ngữ bạn chọn',
      gaCookies: 'Phân biệt các lượt truy cập lặp lại cho Google Analytics',
      themeStorage: 'Ghi nhớ bảng màu của bạn trên trang này',
      attention: 'Ghi nhớ cài đặt nhắc nhở và âm thanh của bạn',
      explainer: 'Ghi nhớ rằng bạn đã đóng phần giải thích chu kỳ',
      observatory:
        'Ghi nhớ rằng bạn đã ghé trang chủ thử nghiệm, để phần giới thiệu được thu gọn ở lần sau',
      wallet: 'Ghi nhớ ví bạn đã kết nối để ứng dụng có thể kết nối lại',
    },
  },
} as const satisfies PrivacyCopy;
