import { formatCount } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from './audit';
import type { AuditsCopy } from './AuditsContent';

const { findings, invariants } = HACKEN_AUDIT;
const count = (value: number) => formatCount(value, 'vi');

/** Vietnamese copy for /audits, rendered by AuditsContent. */
export const auditsCopyVi: AuditsCopy = {
  title: 'Kiểm toán',
  intro:
    'Kiểm toán độc lập của Hacken đối với các hợp đồng Cosmic Signature, phần kiểm chứng hình thức và phân tích trong kho mã hợp đồng, và cách tự kiểm tra một hợp đồng.',
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
    repositoryCta: 'Xem các hợp đồng được kiểm toán',
  },
  audit: {
    heading: 'Kiểm toán độc lập bởi Hacken',
    paragraphs: [
      `Cuối năm 2025, Hacken đã thực hiện một cuộc rà soát bảo mật độc lập các hợp đồng thông minh của Cosmic Signature. Phạm vi bao gồm các hợp đồng đang vận hành trong kho mã công khai, từ giao thức cốt lõi điều hành mỗi chu kỳ đến token CST, cả hai bộ sưu tập NFT, các ví neo giữ, cùng các hợp đồng quản lý ví và hệ thống hỗ trợ chúng. Hacken công bố báo cáo cuối cùng vào tháng 1 năm 2026.`,
      `Báo cáo liệt kê ${count(AUDIT_FINDINGS_TOTAL)} phát hiện, không có phát hiện nào ở mức nghiêm trọng hay cao: ${count(findings.medium)} mức trung bình, ${count(findings.low)} mức thấp và ${count(findings.informational)} quan sát mang tính thông tin. Phần lớn mô tả những cân nhắc thiết kế mà đội ngũ đã xem xét và chấp nhận, và báo cáo giải thích từng phát hiện cùng trạng thái của nó.`,
      `Bên cạnh rà soát thủ công, Hacken đã chạy kiểm thử fuzz với ${count(invariants.tested)} bất biến của hệ thống, chẳng hạn yêu cầu rằng lượng ETH giao thức nắm giữ luôn bằng số đã nạp trừ số đã nhận về. Cả ${count(invariants.held)} bất biến đều giữ vững qua ${count(invariants.runs)} lượt chạy.`,
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
      'Mở địa chỉ đó trên <explorer>Arbiscan</explorer> và xác nhận nó nằm trên Arbitrum One với mã nguồn đã xác minh.',
      'So sánh mã nguồn đó với <contractsRepository>kho mã công khai</contractsRepository>, hoặc kiểm tra kết quả khớp chính xác trên <sourcify>Sourcify</sourcify>.',
      'Đọc <hacken>báo cáo của Hacken</hacken> để xem từng phát hiện và trạng thái của nó.',
      'Xác nhận rằng những gì ứng dụng hiển thị khớp với hành vi của hợp đồng trên chuỗi.',
    ],
  },
};
