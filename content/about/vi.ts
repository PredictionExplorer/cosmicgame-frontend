import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentVi = {
  metadata: {
    title: 'Về Cosmic Signature | Nghệ thuật trên chuỗi Arbitrum',
    description:
      'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum, biến các nét bút của chu kỳ trình diễn thành nghệ thuật NFT ba vật thể tất định.',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'Về Cosmic Signature',
    description:
      'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum, tạo ra nghệ thuật NFT ba vật thể tất định từ các nét bút của chu kỳ trình diễn.',
  },
  breadcrumbLabel: 'Giới thiệu',
  eyebrow: 'Về Cosmic Signature',
  heading: 'Nghệ thuật ai cũng tái tạo được, từ seed đến Signature',
  body: {
    lede: 'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Trong mỗi chu kỳ trình diễn, người tham gia đặt nét bút bằng ETH hoặc CST, mỗi nét bút góp phần định hình Signature cuối cùng: tác phẩm NFT được tạo từ dữ liệu trên chuỗi bằng mô phỏng vật lý ba vật thể. Quy trình tất định cho phép tái tạo cùng một tác phẩm từ cùng dữ liệu ban đầu.',
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature không được chào mời như một sản phẩm đầu tư. Giao thức mô tả việc tham gia, nét bút, phân bổ, neo giữ và việc chuyển tiếp hàng hóa công; giao thức không hứa hẹn về diễn biến giá token hay kết quả tài chính.',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: 'Giấy phép',
    license: 'Tác phẩm và mã nguồn CC0',
    networkLabel: 'Mạng',
    network: 'Arbitrum One',
    publicGoodsLabel: 'Hàng hóa công',
    publicGoodsTemplate: '{percent} mỗi Dự trữ chu kỳ',
  },
  origin: {
    heading: 'Khởi nguồn',
    paragraphs: [
      `Cosmic Signature do ${WHITE_PAPER_SHARED.authorName} thiết kế, người cũng là tác giả của sách trắng. Dự án bắt đầu từ hai niềm tin: nghệ thuật tạo sinh thú vị nhất khi không có gì trong đó là tùy tiện, mỗi hình ảnh là sản phẩm của một quá trình vật lý mà ai cũng có thể chạy lại từ cùng một seed; và một giao thức giữ ETH thay cho người tham gia phải trả lời rõ ràng từng wei đi về đâu.`,
      'Chủ sở hữu vẫn có quyền đổi tham số và bản triển khai theo điều kiện của hợp đồng. Các thay đổi chính bị giới hạn khi chu kỳ chưa hoạt động, nhưng thời điểm kích hoạt, thời gian chờ chu kỳ sau và các hợp đồng phụ có quyền riêng. V3 không tự động chuyển quyền cho Hội đồng Vũ trụ hoặc tự động từ bỏ quyền chủ sở hữu.',
    ],
  },
  milestones: {
    heading: 'Từ ra mắt đến chuyển giao',
    items: {
      v1: {
        label: 'V1',
        status: 'Đã ra mắt',
        text: 'Giao thức ra mắt trên Arbitrum One sau một proxy có thể nâng cấp: chu kỳ, nét bút, các luồng phân bổ, neo giữ, Hội đồng Vũ trụ và quy trình tạo tác phẩm.',
      },
      v2: {
        label: 'V2',
        status: 'Phiên bản trước',
        text: 'V2 là phiên bản trước và hiện đã được thay bằng V3.',
      },
      v3: {
        label: 'V3',
        status: 'Đã triển khai',
        text: 'V3 đã được triển khai. Bản này thay đổi công thức và người nhận CST tham gia, trọng số của cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia, tốc độ giảm chi phí CST, tỷ lệ ETH, số NFT của Phân bổ Signature và bổ sung phụ phí cuối chu kỳ.',
      },
      handover: {
        label: 'Sau đó',
        status: 'Không tự động thực hiện',
        text: 'Chủ sở hữu vẫn có quyền đổi tham số và bản triển khai theo điều kiện của hợp đồng. Các thay đổi chính bị giới hạn khi chu kỳ chưa hoạt động, nhưng thời điểm kích hoạt, thời gian chờ chu kỳ sau và các hợp đồng phụ có quyền riêng. V3 không tự động chuyển quyền cho Hội đồng Vũ trụ hoặc tự động từ bỏ quyền chủ sở hữu.',
      },
    },
  },
  clarificationsHeading: 'Làm rõ',
  officialResources: {
    heading: 'Tài nguyên chính thức',
    links: [
      { id: 'app', label: 'Ứng dụng Cosmic Signature', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Hợp đồng Arbitrum',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'Tài nguyên mã nguồn', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
