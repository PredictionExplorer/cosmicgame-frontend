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
      'Vì vậy, nghệ thuật ở đây là vật lý chứ không phải một mô hình: ba thiên thể dưới lực hấp dẫn Newton, được một quy trình mã nguồn mở kết xuất từ seed ghi trên chuỗi và phát hành theo CC0. Việc phân bổ là cơ học: hợp đồng thực thi mọi khoản phân bổ, và không ví nào của đội ngũ nhận ETH từ nét bút. Vai trò của đội ngũ cũng có giới hạn: quyền chủ sở hữu bị khóa khi chu kỳ đang chạy và sẽ được gỡ bỏ hoàn toàn khi các bản nâng cấp còn lại hoàn tất.',
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
        status: 'Phiên bản hiện tại',
        text: 'Năm thay đổi rút ra từ cách giao thức được sử dụng, trong đó có CST tham gia tăng theo khoảng thời gian giữa hai nét bút và thời hạn dài hơn để người đặt nét bút cuối cùng hoàn tất chu kỳ.',
      },
      v3: {
        label: 'V3',
        status: 'Dự kiến',
        text: 'Một khoản phụ phí cho nét bút trong vài phút cuối trước hạn chót, để việc tham gia bền bỉ có trọng lượng hơn thời điểm phút chót. Bản này đang được phát triển trong kho mã công khai.',
      },
      handover: {
        label: 'Sau đó',
        status: 'Đã cam kết',
        text: 'Khi thiết kế đã hoàn thiện, quyền kiểm soát của chủ sở hữu sẽ rời địa chỉ triển khai vĩnh viễn: chuyển cho Hội đồng Vũ trụ hoặc từ bỏ, với cách thức được công bố trước.',
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
        label: 'Hợp đồng Arbitrum đã xác minh',
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
