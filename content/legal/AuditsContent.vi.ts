import type { AuditsCopy } from './AuditsContent';

/** Vietnamese copy for /audits, rendered by AuditsContent. */
export const auditsCopyVi: AuditsCopy = {
  title: 'Kiểm toán',
  intro:
    'Bản kiểm toán công khai áp dụng cho phiên bản hợp đồng lịch sử đã được xem xét. Nó không phải kiểm toán độc lập mọi thay đổi V2 hoặc V3 sau đó. Xác minh mã nguồn trùng với mã triển khai cũng không phải đánh giá bảo mật.',
  summary: {
    label: 'Tóm tắt kiểm toán',
    auditor: 'Đơn vị kiểm toán',
    published: 'Công bố báo cáo',
    findings: 'Phát hiện',
    criticalOrHigh: 'Nghiêm trọng hoặc cao',
    invariants: 'Bất biến giữ vững',
    invariantsValue: '{held}/{tested}',
    runs: 'Lượt chạy fuzz',
    severity: 'Phát hiện theo mức độ nghiêm trọng',
    severities: {
      critical: 'Nghiêm trọng',
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
      informational: 'Thông tin',
    },
    reportCta: 'Đọc báo cáo của Hacken',
    repositoryCta: 'Xem kho mã hợp đồng',
  },
  audit: {
    heading: 'Kiểm toán độc lập bởi Hacken',
    paragraphs: [
      'Bản kiểm toán công khai áp dụng cho phiên bản hợp đồng lịch sử đã được xem xét. Nó không phải kiểm toán độc lập mọi thay đổi V2 hoặc V3 sau đó. Xác minh mã nguồn trùng với mã triển khai cũng không phải đánh giá bảo mật.',
      'Báo cáo nêu từng phát hiện cùng mức độ nghiêm trọng và trạng thái của nó; phần tóm tắt phía trên thống kê số lượng. Không có phát hiện nào ở mức nghiêm trọng hay cao, và phần lớn mô tả những cân nhắc thiết kế mà đội ngũ đã xem xét và chấp nhận.',
      'Bên cạnh rà soát thủ công, Hacken đã chạy kiểm thử fuzz với các bất biến của hệ thống, chẳng hạn yêu cầu rằng lượng ETH giao thức nắm giữ luôn bằng số đã nạp trừ số đã nhận về. Mọi bất biến đều giữ vững.',
    ],
  },
  analysis: {
    heading: 'Kiểm chứng hình thức và phân tích',
    paragraphs: [
      'Kho mã hợp đồng còn chứa các bước kiểm tra do đội ngũ tự chạy: đặc tả Certora Prover cho logic giao thức, bảo toàn ETH, kiểm soát truy cập và các hợp đồng ví; cấu hình Solidity SMTChecker; phân tích tĩnh bằng Slither; và bộ kiểm thử tự động.',
      'Các bước kiểm tra này chỉ chứng minh hoặc kiểm thử những tính chất mà chúng nêu ra. Cũng như kiểm toán, chúng giảm rủi ro chứ không loại bỏ rủi ro; xem <risk>công bố rủi ro</risk>.',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Đặc tả Certora',
        description: 'Các tính chất mà Certora Prover kiểm tra, kèm cấu hình của từng lượt chạy',
      },
      {
        link: 'smtchecker',
        label: 'Cấu hình SMTChecker',
        description:
          'Các tập lệnh biên dịch hợp đồng với bộ kiểm tra mô hình của Solidity được bật',
      },
      {
        link: 'slither',
        label: 'Phân tích Slither',
        description: 'Phân tích tĩnh và kiểm tra khả năng nâng cấp, kèm ghi chú cách chạy',
      },
      {
        link: 'tests',
        label: 'Bộ kiểm thử',
        description: 'Các bài kiểm thử tự động của hợp đồng',
      },
    ],
  },
  checklist: {
    heading: 'Danh mục xác minh',
    intro: 'Trước khi tương tác với một hợp đồng, bạn có thể tự xác nhận từng điều sau:',
    steps: [
      'Tìm địa chỉ hợp đồng trên <contracts>trang hợp đồng</contracts>, danh sách địa chỉ chính thức duy nhất.',
      'Bản triển khai hiện tại của giao thức là V3. Hãy đối chiếu địa chỉ triển khai với ô EIP-1967 của proxy. Việc xác minh công khai mã nguồn V3 chưa được xác nhận; xác minh V2 trước đây không áp dụng cho bản triển khai mới. Chi tiết: <explorer>Arbiscan</explorer>.',
      'Bản kiểm toán công khai áp dụng cho phiên bản hợp đồng lịch sử đã được xem xét. Nó không phải kiểm toán độc lập mọi thay đổi V2 hoặc V3 sau đó. Xác minh mã nguồn trùng với mã triển khai cũng không phải đánh giá bảo mật. Chi tiết: <contractsRepository>kho mã công khai</contractsRepository>, <sourcify>Sourcify</sourcify>.',
      'Đọc <hacken>báo cáo của Hacken</hacken> để xem từng phát hiện và trạng thái của nó.',
      'Xác nhận rằng những gì ứng dụng hiển thị khớp với hành vi của hợp đồng trên chuỗi.',
    ],
  },
};
