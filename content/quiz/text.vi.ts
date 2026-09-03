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
      'Một trăm câu hỏi trong ba cấp độ, rút từ sách trắng: chu kỳ, nét bút, phân bổ, quy trình nghệ thuật và những trường hợp đặc biệt chỉ người đọc kỹ mới nhận ra. Mỗi câu trả lời đi kèm lời giải thích và chỉ dẫn đến đúng phần dạy quy tắc đó \u2014 trả lời cũng là một cách đọc.',
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
      'Chính xác \u2014 quỹ đạo vẫn vững.',
      'Hoàn toàn đúng.',
      'Chính xác \u2014 bạn đọc giao thức như seed đọc vật lý.',
      'Đúng \u2014 một quỹ đạo sạch.',
    ],
    incorrectFeedback: [
      'Chưa đúng \u2014 đây là điều giao thức thực sự làm.',
      'Một ngộ nhận phổ biến \u2014 cơ chế nói khác.',
      'Quỹ đạo gần, nhưng sai vật thể. Đây là quy tắc.',
      'Lần này chưa đúng \u2014 sách trắng sẽ giải quyết.',
    ],
    streakTemplate: '{count} câu đúng liên tiếp',
    explanationHeading: 'Vì sao',
    funFactHeading: 'Bạn có biết?',
    referenceLabel: 'Đi sâu hơn',
    nextLabel: 'Câu tiếp theo',
    finishLabel: 'Xem kết quả đọc của bạn',
    summary: {
      eyebrow: 'Đọc xong',
      scoreTemplate: 'Đúng {correct} trên {total}',
      rankLabel: 'Vị thế của bạn',
      ranks: {
        observer: {
          name: 'Người quan sát',
          line: 'Bạn đã thấy bề mặt. Sách trắng đáp lại những ai đến gần hơn.',
        },
        participant: {
          name: 'Người tham gia',
          line: 'Bạn biết các bộ phận chuyển động. Những trường hợp đặc biệt là nơi thiết kế trở nên thú vị.',
        },
        enduranceChampion: {
          name: 'Quán quân Bền bỉ',
          line: 'Một nắm bắt dài và vững về cơ chế. Ít khoảng trống nào thoát khỏi bạn.',
        },
        chronoWarrior: {
          name: 'Chiến binh Thời gian',
          line: 'Gần như nắm trọn giao thức. Các phần tham chiếu dưới đây là để thưởng thức, không phải để sửa.',
        },
      },
      studyHeading: 'Vạch quỹ đạo tiếp theo',
      studyIntro: 'Những câu bạn trả lời sai, mỗi câu kèm phần giải quyết nó:',
      noMissesNote: 'Không có gì để xem lại \u2014 mọi câu trả lời đều đúng.',
      restartLabel: 'Bắt đầu lại với thứ tự mới',
      hubLabel: 'Tất cả cấp độ',
    },
  },
  tiers: {
    basic: {
      title: 'Cơ bản',
      tagline: 'Hình dạng của giao thức: chu kỳ, nét bút, phân bổ và nghệ thuật.',
      description:
        'Hai mươi lăm câu hỏi về những điều căn bản \u2014 nét bút là gì, chu kỳ kết thúc ra sao, ETH đi về đâu, và điều gì khiến tác phẩm mang tính tất định. Nếu bạn mới đến đây, hãy bắt đầu từ đây.',
      questions: basicQuestionsTextVi,
    },
    medium: {
      title: 'Trung cấp',
      tagline: 'Cơ chế vận hành: cửa sổ hiệu chỉnh, các luồng bền bỉ, quy tắc Hội đồng.',
      description:
        'Hai mươi lăm câu hỏi về bộ máy đang chuyển động \u2014 đường chi phí, vòng phản hồi CST, Quán quân Bền bỉ so với Chiến binh Thời gian, toán học của Tinh tuyển và các tham số của Hội đồng. Dành cho người đã theo dõi một hai chu kỳ.',
      questions: mediumQuestionsTextVi,
    },
    hard: {
      title: 'Nâng cao',
      tagline:
        'Trường hợp đặc biệt và phân tích: ví đối nghịch, lịch sử nâng cấp, quy trình nghệ thuật.',
      description:
        'Năm mươi câu hỏi cho người đọc kỹ \u2014 ngữ nghĩa sau hết hạn, những hợp đồng từ chối ETH, vì sao V2 thay đổi năm điều, V3 định giá lại điều gì, độ ngẫu nhiên được xây thế nào, và một bộ tích phân Yoshida đang làm gì trong một dự án nghệ thuật.',
      questions: hardQuestionsTextVi,
    },
  },
} as const satisfies QuizText;
