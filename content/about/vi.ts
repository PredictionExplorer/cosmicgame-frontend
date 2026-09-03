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
  eyebrow: 'Trang chủ của thực thể',
  heading: 'Về Cosmic Signature',
  body: {
    paragraphs: [
      'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Trong mỗi chu kỳ trình diễn, người tham gia đặt nét bút bằng ETH hoặc CST, và mỗi nét bút góp phần định hình Signature cuối cùng: tác phẩm NFT tất định được tạo từ dữ liệu trên chuỗi và kết xuất qua một mô phỏng vật lý ba vật thể.',
      'Giao thức được thiết kế xoay quanh các cơ chế công khai, có thể xác minh. Các hợp đồng thông minh trên Arbitrum ghi lại nét bút, chu kỳ, các luồng phân bổ, CST, neo giữ và các lần khắc NFT. Tác phẩm có thể tái tạo từ seed của nó, và dự án đề cao mã nguồn mở, nghệ thuật CC0 và việc hỗ trợ hàng hóa công.',
      'Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức và ứng dụng nghệ thuật trên chuỗi.',
    ],
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature không được chào mời như một sản phẩm đầu tư. Giao thức mô tả việc tham gia, nét bút, phân bổ, neo giữ và việc chuyển tiếp hàng hóa công; giao thức không hứa hẹn về diễn biến giá token hay kết quả tài chính.',
    // lexicon-allow-end
  },
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
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: 'Câu hỏi thường gặp', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: 'Điều khoản dịch vụ', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: 'Chính sách quyền riêng tư', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
