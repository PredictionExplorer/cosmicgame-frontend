import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical Vietnamese terminology (docs/i18n/glossary-vi.md).
 *
 * Variants are matched as whole words or phrases under Unicode boundaries
 * (`unicode-word` in locale-text-matchers.ts): Vietnamese spaces every
 * syllable and never inflects, so "cử chỉ" matches cử chỉ and Cử chỉ but not
 * "cử chỉnh" — and, because a word boundary is also a syllable boundary, a
 * single-syllable variant would match that syllable inside every compound
 * that contains it. Every entry below is therefore a full word of two or
 * more syllables, or a phrase, checked against the vocabulary the site does
 * need (chữ ký is not a drift variant of Signature because wallet copy signs
 * transactions with it; phân phối is not a variant of phân bổ because Anchor
 * Distribution is a distribution).
 *
 * Keep this list focused on terminology drift. Vocabulary that is banned
 * outright (đấu giá, xổ số, đầu tư, đặt cọc, quyên góp, …) lives only in
 * VI_BANNED_TERMS in lexicon-scan-core.ts so neither gate can silently weaken
 * the other.
 */
export const VI_TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  {
    concept: 'Gesture',
    canonical: 'nét bút',
    variants: ['cử chỉ', 'nét vẽ', 'lượt vẽ', 'lượt đặt', 'đường bút', 'nét cọ'],
  },
  {
    concept: 'Gesture Cost',
    canonical: 'chi phí nét bút',
    // "phí nét bút" is a substring of the canonical form and cannot be listed.
    variants: ['giá nét bút', 'mức giá nét bút', 'giá của nét bút', 'lệ phí nét bút'],
  },
  {
    concept: 'Performance Cycle',
    canonical: 'chu kỳ trình diễn (dense UI: chu kỳ)',
    variants: [
      'chu kỳ biểu diễn',
      'chu kỳ hiệu suất',
      'chu trình trình diễn',
      'chu trình',
      'giai đoạn trình diễn',
    ],
  },
  {
    concept: 'Finalize',
    canonical: 'hoàn tất',
    variants: [
      'chốt chu kỳ',
      'kết thúc chu kỳ',
      'tổng kết chu kỳ',
      'chung kết',
      'quyết toán',
      'thanh lý chu kỳ',
    ],
  },
  {
    concept: 'Calibration Window',
    canonical: 'cửa sổ hiệu chỉnh',
    variants: [
      'cửa sổ hiệu chuẩn',
      'khung hiệu chỉnh',
      'giai đoạn hiệu chỉnh',
      'khoảng hiệu chỉnh',
      'cửa sổ điều chỉnh',
      'cửa sổ căn chỉnh',
    ],
  },
  {
    concept: 'Allocation',
    canonical: 'phân bổ',
    variants: ['phần chia', 'suất chia', 'khoản chia', 'phần được chia'],
  },
  {
    concept: 'Recipient',
    canonical: 'người nhận',
    variants: ['người thụ hưởng', 'người hưởng lợi', 'người được nhận', 'bên nhận'],
  },
  {
    concept: 'Stellar Selection',
    canonical: 'Tinh tuyển',
    variants: [
      'tuyển chọn tinh tú',
      'tuyển chọn sao',
      'lựa chọn tinh tú',
      'chọn lọc tinh tú',
      'tinh tú tuyển chọn',
      'sao tuyển',
    ],
  },
  {
    concept: 'Anchoring',
    canonical: 'neo giữ',
    variants: ['cắm neo', 'buộc neo', 'neo đậu', 'neo lại', 'ghim giữ', 'khóa giữ'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: 'phân phối neo giữ',
    variants: ['phân bổ neo giữ', 'khoản neo giữ', 'phân chia neo giữ', 'hoa lợi neo giữ'],
  },
  {
    concept: 'Retrieve',
    canonical: 'nhận về',
    variants: ['lấy về', 'lấy lại', 'thu về', 'thu hồi', 'yêu cầu nhận', 'nhận lại'],
  },
  {
    concept: 'Imprint',
    canonical: 'khắc',
    variants: ['khắc ghi', 'khắc dấu', 'in dấu', 'ghi khắc', 'điêu khắc'],
  },
  {
    concept: 'Endurance Champion',
    canonical: 'Quán quân Bền bỉ',
    variants: [
      'nhà vô địch bền bỉ',
      'vô địch bền bỉ',
      'quán quân sức bền',
      'quán quân kiên trì',
      'quán quân chịu đựng',
      'nhà vô địch sức bền',
    ],
  },
  {
    concept: 'Chrono-Warrior',
    canonical: 'Chiến binh Thời gian',
    variants: ['chiến binh thời khắc', 'dũng sĩ thời gian', 'võ sĩ thời gian', 'chiến binh chrono'],
  },
  {
    concept: 'Cosmic Council',
    canonical: 'Hội đồng Vũ trụ',
    variants: ['hội đồng cosmic', 'ủy ban vũ trụ', 'nghị viện vũ trụ', 'hội đồng vũ trụ học'],
  },
  {
    concept: 'Public Goods',
    canonical: 'Hàng hóa công',
    variants: ['hàng hóa công cộng', 'lợi ích công', 'công ích', 'tài sản công'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: 'Dự trữ truyền thông',
    variants: [
      'quỹ truyền thông',
      'dự trữ tiếp cận',
      'quỹ tiếp cận',
      'dự trữ lan tỏa',
      'ngân sách truyền thông',
    ],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: 'Dự trữ tích lũy',
    variants: ['dự trữ cộng dồn', 'dự trữ gộp', 'quỹ tích lũy', 'dự trữ chuyển tiếp'],
  },
  {
    concept: 'Signature (the artwork)',
    canonical: 'Signature',
    variants: ['chữ ký vũ trụ', 'tác phẩm chữ ký', 'bức chữ ký'],
  },
  {
    concept: 'Contribution (ETH / NFT)',
    canonical: 'đóng góp',
    variants: ['góp vốn', 'cống hiến', 'khoản góp'],
  },
  {
    concept: 'Participant',
    canonical: 'người tham gia',
    variants: ['thành viên tham gia', 'người dùng tham gia', 'người tham dự'],
  },
  {
    concept: 'Wallet',
    canonical: 'ví',
    variants: ['ví tiền', 'túi tiền', 'ví điện tử'],
  },
  {
    concept: 'Gallery',
    canonical: 'Phòng trưng bày',
    variants: ['thư viện ảnh', 'bộ sưu tập ảnh', 'triển lãm', 'phòng tranh'],
  },
  {
    concept: 'Sign (a transaction)',
    canonical: 'ký',
    variants: ['ký tên giao dịch', 'chữ ký giao dịch'],
  },
];
