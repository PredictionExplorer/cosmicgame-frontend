import type { QuizText } from './structure';
import { basicQuestionsTextVi } from './text.basic.vi';
import { hardQuestionsTextVi } from './text.hard.vi';
import { mediumQuestionsTextVi } from './text.medium.vi';

/** Vietnamese quiz copy, keyed by the skeleton in structure.ts. */
export const quizTextVi = {
  hub: {
    eyebrow: 'Trắc nghiệm kiến thức',
    h1: 'Bạn hiểu Cosmic Signature đến đâu?',
    intro:
      'Một trăm câu hỏi ở ba cấp độ, dựa trên sách trắng: chu kỳ, nét bút, phân bổ, quy trình tạo tác phẩm và các trường hợp đặc biệt. Mỗi đáp án có lời giải thích cùng liên kết đến phần tương ứng để bạn tìm hiểu thêm.',
    breadcrumbs: {
      ariaLabel: 'Đường dẫn điều hướng',
      homeLabel: 'Trang chủ',
      quizLabel: 'Trắc nghiệm',
    },
    questionCountTemplate: '{count} câu hỏi',
    startLabel: 'Bắt đầu',
  },
  ui: {
    intro: {
      keyboardHint: 'Mẹo: nhấn 1\u20134 để trả lời, Enter để tiếp tục.',
      beginLabel: 'Bắt đầu',
    },
    progressTemplate: 'Câu {current} trên {total}',
    correctFeedback: [
      'Chính xác.',
      'Đúng. Xem giải thích bên dưới.',
      'Bạn đã chọn đáp án đúng.',
      'Đúng với quy tắc của giao thức.',
    ],
    incorrectFeedback: [
      'Chưa đúng. Xem giải thích bên dưới.',
      'Đáp án này chưa khớp với quy tắc của giao thức.',
      'Hãy đối chiếu với quy tắc dưới đây.',
      'Xem giải thích và phần sách trắng liên quan.',
    ],
    streakTemplate: '{count} câu đúng liên tiếp',
    explanationHeading: 'Vì sao',
    funFactHeading: 'Bạn có biết?',
    referenceLabel: 'Đi sâu hơn',
    nextLabel: 'Câu tiếp theo',
    finishLabel: 'Xem kết quả',
    summary: {
      eyebrow: 'Đã hoàn thành',
      scoreTemplate: 'Đúng {correct} trên {total}',
      rankLabel: 'Mức độ hiểu biết',
      ranks: {
        observer: {
          name: 'Người quan sát',
          line: 'Bạn đã bắt đầu tìm hiểu giao thức. Các phần gợi ý bên dưới sẽ giúp củng cố kiến thức cơ bản.',
        },
        participant: {
          name: 'Người tham gia',
          line: 'Bạn đã nắm được các cơ chế chính. Hãy xem thêm những trường hợp đặc biệt để hiểu sâu hơn.',
        },
        enduranceChampion: {
          name: 'Quán quân Bền bỉ',
          line: 'Bạn hiểu rõ phần lớn cơ chế. Xem lại một vài chủ đề bên dưới để củng cố kiến thức.',
        },
        chronoWarrior: {
          name: 'Chiến binh Thời gian',
          line: 'Bạn đã nắm vững giao thức. Các phần tham chiếu giúp bạn tiếp tục tìm hiểu những chi tiết chuyên sâu.',
        },
      },
      studyHeading: 'Chủ đề nên xem lại',
      studyIntro: 'Các câu cần xem lại, kèm phần giải thích trong sách trắng:',
      noMissesNote: 'Không có gì để xem lại \u2014 mọi câu trả lời đều đúng.',
      restartLabel: 'Bắt đầu lại với thứ tự mới',
      hubLabel: 'Tất cả cấp độ',
    },
  },
  tiers: {
    basic: {
      title: 'Cơ bản',
      tagline: 'Những kiến thức nền tảng: chu kỳ, nét bút, phân bổ và nghệ thuật.',
      description:
        'Hai mươi lăm câu hỏi về những điều căn bản \u2014 nét bút là gì, chu kỳ kết thúc ra sao, ETH đi về đâu, và điều gì khiến tác phẩm mang tính tất định. Nếu bạn mới đến đây, hãy bắt đầu từ đây.',
      questions: basicQuestionsTextVi,
    },
    medium: {
      title: 'Trung cấp',
      tagline: 'Cơ chế vận hành: cửa sổ hiệu chỉnh, các luồng bền bỉ, quy tắc Hội đồng.',
      description:
        'Hai mươi lăm câu hỏi về cơ chế vận hành \u2014 đường chi phí, vòng phản hồi CST, Quán quân Bền bỉ so với Chiến binh Thời gian, toán học của Tinh tuyển và các tham số của Hội đồng. Dành cho người đã theo dõi một hai chu kỳ.',
      questions: mediumQuestionsTextVi,
    },
    hard: {
      title: 'Nâng cao',
      tagline:
        'Trường hợp đặc biệt và phân tích: ví có hành vi bất thường, lịch sử nâng cấp, quy trình nghệ thuật.',
      description:
        'Năm mươi câu hỏi cho người đọc kỹ \u2014 quy tắc sau khi hết thời hạn, những hợp đồng từ chối ETH, vì sao V2 thay đổi năm điều, V3 định giá lại điều gì, độ ngẫu nhiên được xây thế nào, và một bộ tích phân Yoshida đang làm gì trong một dự án nghệ thuật.',
      questions: hardQuestionsTextVi,
    },
  },
} as const satisfies QuizText;
