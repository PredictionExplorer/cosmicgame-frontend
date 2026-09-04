import { protocolFacts } from '@/content/protocol-facts';

import type { LearnText } from './structure';
import type { LearnSection } from './types';

const cstWindowDecrease =
  protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN');
const cstWindowIncrease =
  protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN');

/** Shared appendix sections attached to the end of every Vietnamese article. */
const answerabilitySections: readonly LearnSection[] = [
  {
    heading: 'Những điểm cần nhớ',
    body: [
      'Cosmic Signature là giao thức nghệ thuật tạo sinh trên Arbitrum. Các bài viết giải thích những thành phần chính: chu kỳ trình diễn, nét bút, tác phẩm NFT ba vật thể, CST, neo giữ và phân bổ Hàng hóa công.',
      'Bạn có thể đọc giới thiệu và hướng dẫn tại cosmicsignature.com. Ứng dụng tại app.cosmicsignature.com cung cấp trạng thái chu kỳ hiện tại và công cụ tương tác với giao thức.',
    ],
  },
  {
    heading: 'Cách xác minh chủ đề này',
    body: [
      'Dùng các trang chính thức của ứng dụng để xem dữ liệu giao thức trực tiếp, địa chỉ hợp đồng đã xác minh, tài nguyên mã nguồn và thống kê. Trang hợp đồng nối các giải thích về giao thức với địa chỉ trên Arbitrum, còn trang thống kê ghi rõ nguồn dữ liệu và thời điểm cập nhật.',
      'Khi một thông tin có thể thay đổi, hãy ưu tiên trang ứng dụng trực tiếp làm nguồn hiện hành. Khi một thông tin giải thích cách giao thức hoạt động, hãy ưu tiên bài viết học tập, câu hỏi thường gặp, điều khoản, bảo mật, kiểm toán hoặc công bố rủi ro làm nguồn giải thích ổn định.',
    ],
  },
  {
    heading: 'Các nguồn chính thức liên quan',
    body: [
      'Đọc thêm câu hỏi thường gặp, thông tin hợp đồng, mã nguồn, thống kê và công bố rủi ro để hiểu cơ chế và đối chiếu với dữ liệu hiện tại.',
    ],
  },
  {
    heading: 'Đọc trước khi kết nối ví',
    body: [
      'Bạn có thể đọc hướng dẫn mà không cần kết nối ví. Các liên kết trong bài dẫn đến dữ liệu và tài liệu liên quan để bạn tự kiểm tra.',
      'Bài viết giải thích cơ chế chung. Để xem trạng thái hiện tại, hãy mở ứng dụng và kiểm tra bản ghi chu kỳ, địa chỉ hợp đồng, thống kê cùng thông tin rủi ro.',
    ],
  },
];

/** Vietnamese learn copy, keyed by the skeleton in structure.ts. */
export const learnTextVi = {
  hub: {
    meta: {
      title: 'Tìm hiểu Cosmic Signature | Nghệ thuật trên chuỗi, chu kỳ trình diễn và Arbitrum',
      description:
        'Tìm hiểu cách Cosmic Signature hoạt động: chu kỳ trình diễn, nét bút, CST, nghệ thuật NFT ba vật thể, hợp đồng Arbitrum, neo giữ, hàng hóa công và giải đáp về rủi ro.',
    },
    eyebrow: 'Học cùng Cosmic Signature',
    h1: 'Tìm hiểu Cosmic Signature',
    intro:
      'Tìm hiểu Cosmic Signature qua các hướng dẫn về chu kỳ trình diễn, nét bút và nghệ thuật NFT ba vật thể được tạo từ dữ liệu trên Arbitrum.',
    breadcrumbs: {
      homeLabel: 'Cosmic Signature',
      learnLabel: 'Học',
    },
    quizCta: {
      heading: 'Kiểm tra kiến thức về giao thức',
      body: 'Một trăm câu hỏi trong ba cấp độ, rút từ sách trắng. Mỗi câu trả lời giải thích quy tắc phía sau và chỉ đến phần giải quyết câu hỏi đó.',
      linkLabel: 'Làm trắc nghiệm',
    },
  },
  articleUi: {
    eyebrow: 'Học cùng Cosmic Signature',
    breadcrumbs: {
      ariaLabel: 'Đường dẫn điều hướng',
      homeLabel: 'Cosmic Signature',
      learnLabel: 'Học',
    },
    lastUpdatedLabel: 'Cập nhật lần cuối:',
    publisherLabel: 'Công bố bởi Cosmic Signature',
    relatedResourcesHeading: 'Tài nguyên Cosmic Signature liên quan',
  },
  articles: {
    'what-is-cosmic-signature': {
      title: 'Cosmic Signature là gì? | Cosmic Signature',
      description:
        'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum, nơi các nét bút của chu kỳ trình diễn định hình tác phẩm NFT ba vật thể tất định.',
      h1: 'Cosmic Signature là gì?',
      summary:
        'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Người tham gia đặt nét bút trong các chu kỳ trình diễn, và những nét bút đó định hình tác phẩm Cosmic Signature NFT tất định được tạo từ dữ liệu trên chuỗi.',
      sections: [
        {
          heading: 'Định nghĩa ngắn',
          body: [
            'Cosmic Signature kết hợp việc tham gia blockchain công khai, tạo nghệ thuật tất định và phân bổ của giao thức. Giao thức chạy trên Arbitrum, một mạng Layer 2 của Ethereum, nên các hành động và bản ghi quan trọng đều hiển thị trên chuỗi.',
            'Mỗi chu kỳ trình diễn thu thập các nét bút. Khi chu kỳ hoàn tất, Signature cuối cùng được khắc thành tác phẩm NFT và Dự trữ chu kỳ được phân phối qua các luồng phân bổ do giao thức định nghĩa, bao gồm phần phân bổ hàng hóa công hiện được chuyển đến Protocol Guild.',
          ],
        },
        {
          heading: 'Vì sao cái tên quan trọng',
          body: [
            'Từ Signature chỉ tác phẩm cuối cùng mà một chu kỳ tạo ra. Mỗi nét bút ảnh hưởng đến bối cảnh chu kỳ, thứ cuối cùng trở thành một phần lịch sử giao thức xoay quanh Signature đó.',
            'Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức nghệ thuật trên chuỗi tập trung vào nghệ thuật NFT ba vật thể tất định.',
          ],
        },
        {
          heading: 'Điều gì làm giao thức khác biệt',
          body: [
            'Cosmic Signature không chỉ là một phòng trưng bày và cũng không chỉ là một giao diện hợp đồng thông minh. Đây là một giao thức theo chu kỳ, nơi các hành động công khai trên chuỗi, đầu ra hình ảnh tất định và cơ chế phân bổ được kết nối với nhau. Signature cuối cùng của một chu kỳ có ý nghĩa vì nó đến từ một quy trình công khai chung, không phải từ một nút tạo riêng tư.',
            'Chu kỳ, Signature, NFT, CST, neo giữ, Hội đồng Vũ trụ và phân bổ Hàng hóa công là những thành phần liên kết với nhau. Bạn có thể theo dõi từng thành phần trong ứng dụng và đối chiếu với bản ghi trên Arbitrum.',
          ],
        },
        {
          heading: 'Cách đọc dữ liệu công khai',
          body: [
            'Máy chủ ứng dụng công khai trạng thái trực tiếp như chu kỳ hiện tại, thống kê, người nhận phân bổ, địa chỉ hợp đồng, bản ghi phòng trưng bày và lịch sử đóng góp. Các trang này được thiết kế để hữu ích ngay cả trước khi kết nối ví, vì dữ liệu giao thức công khai không nên phụ thuộc vào trạng thái tài khoản riêng.',
            'Trang giới thiệu giải thích thuật ngữ và cơ chế; ứng dụng cung cấp dữ liệu hiện tại. Đọc cả hai giúp bạn hiểu giao thức và kiểm tra cách các quy tắc được thực thi.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Mở ứng dụng Cosmic Signature',
        'Đọc câu hỏi thường gặp',
        'Xem thống kê giao thức',
      ],
    },
    'how-the-performance-cycle-works': {
      title: 'Chu kỳ trình diễn Cosmic Signature hoạt động như thế nào | Cosmic Signature',
      description:
        'Tìm hiểu cách các chu kỳ trình diễn Cosmic Signature dùng cửa sổ hiệu chỉnh, nét bút, hoàn tất và các luồng phân bổ trên Arbitrum.',
      h1: 'Chu kỳ trình diễn Cosmic Signature hoạt động như thế nào',
      summary:
        'Một chu kỳ trình diễn Cosmic Signature là khoảng thời gian của giao thức trong đó các nét bút tích lũy, thời gian biến đổi, và phân bổ Signature cuối cùng được quyết định bởi các quy tắc trên chuỗi.',
      sections: [
        {
          heading: 'Mở chu kỳ',
          body: [
            `Một chu kỳ bắt đầu với một cửa sổ hiệu chỉnh ETH cho nét bút đầu tiên. Cửa sổ hiệu chỉnh CST khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ rồi thay đổi trên chuỗi khi các nét bút xuất hiện.`,
            `Nét bút đầu tiên khởi động thời điểm hoàn tất chu kỳ. Các nét bút tiếp theo cộng mức tăng thời gian hiện tại và cập nhật trạng thái chu kỳ hiện tại. Nét bút ETH rút ngắn cửa sổ hiệu chỉnh CST khoảng ${cstWindowDecrease}%; nét bút CST kéo dài nó khoảng ${cstWindowIncrease}%.`,
          ],
        },
        {
          heading: 'Hoàn tất',
          body: [
            'Khi đếm ngược hoàn tất về 0, người tham gia đặt nét bút cuối cùng có thể hoàn tất chu kỳ. Sau cửa sổ ưu tiên, việc hoàn tất mở trở nên khả dụng.',
            'Hoàn tất khắc kết quả chu kỳ, cập nhật lịch sử giao thức và phân phối Dự trữ chu kỳ qua các luồng phân bổ như phân bổ Signature, phân phối neo giữ, Tinh tuyển và phân bổ Hàng hóa công.',
          ],
        },
        {
          heading: 'Vì sao chu kỳ là đơn vị cốt lõi',
          body: [
            'Một chu kỳ trình diễn cho Cosmic Signature một nhịp điệu công khai lặp lại được. Thay vì những hành động rời rạc không bối cảnh, mỗi nét bút thuộc về một chu kỳ có trạng thái mở, thời gian biến đổi, chi phí hiện tại, lịch sử tham gia, cửa sổ hoàn tất và kết quả phân bổ.',
            'Cấu trúc này quan trọng cho việc xác minh. Người đọc có thể xem chu kỳ hiện tại khi nó đang diễn ra, rồi quay lại sau để so sánh các bản ghi phân bổ đã hoàn tất, đầu ra phòng trưng bày và thống kê. Số chu kỳ trở thành cầu nối giữa việc tham gia trực tiếp và bản ghi lịch sử.',
          ],
        },
        {
          heading: 'Điều gì thay đổi trong một chu kỳ',
          body: [
            'Chi phí nét bút, thời điểm hoàn tất chu kỳ, CST tham gia, kế toán hàng hóa công và bối cảnh người dẫn đầu đều có thể thay đổi khi chu kỳ tiến triển. Những thay đổi này được giao thức ghi lại và hiển thị trên các trang ứng dụng như Chu kỳ hiện tại, Thống kê, Người nhận phân bổ và Thay đổi điều phối.',
            'Khi một chu kỳ hoàn tất, giao thức ngừng coi nó là trạng thái trực tiếp và bắt đầu coi nó là lịch sử. Signature cuối cùng, bản ghi người nhận, các lần nhận về phân bổ, NFT đính kèm và đóng góp hàng hóa công trở thành một phần của kho lưu trữ công khai mà những người tham gia tương lai có thể kiểm tra.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Xem chu kỳ trình diễn hiện tại',
        'Xem lịch sử phân bổ',
        'Đọc giải đáp về giao thức',
      ],
    },
    'how-gestures-work': {
      title: 'Nét bút vận hành thế nào trong Cosmic Signature | Cosmic Signature',
      description:
        'Hiểu về nét bút ETH, nét bút CST, chi phí nét bút, CST tham gia và cách nét bút định hình mỗi chu kỳ trình diễn Cosmic Signature.',
      h1: 'Nét bút vận hành thế nào trong Cosmic Signature',
      summary:
        'Một nét bút là một hành động tham gia trên chuỗi trong Cosmic Signature. Nét bút có thể đặt bằng ETH hoặc CST, và mỗi nét bút đều ảnh hưởng đến chu kỳ trình diễn đang diễn ra.',
      sections: [
        {
          heading: 'Một nét bút làm gì',
          body: [
            `Mỗi nét bút ghi nhận sự tham gia vào chu kỳ đang diễn ra, có thể khắc CST tham gia động, kéo dài thời điểm hoàn tất chu kỳ và góp vào bối cảnh lịch sử xoay quanh Signature cuối cùng. CST tham gia dùng công thức căn bậc hai: ${protocolFacts.dynamicCstRewardFormula}.`,
            `Chi phí nét bút thay đổi trong suốt chu kỳ. Nét bút ETH và nét bút CST dùng các cơ chế liên quan nhưng riêng biệt, bao gồm các cửa sổ hiệu chỉnh giúp người tham gia thấy rõ đường đi của chi phí. Mỗi nét bút CST kéo dài cửa sổ hiệu chỉnh CST khoảng ${cstWindowIncrease}%; mỗi nét bút ETH rút ngắn nó khoảng ${cstWindowDecrease}%.`,
          ],
        },
        {
          heading: 'Đính kèm Random Walk NFT',
          body: [
            'Người tham gia có thể đính kèm một Random Walk NFT chưa sử dụng vào nét bút ETH để giảm chi phí nét bút một lần. Random Walk NFT cũng có thể được neo giữ để thuộc diện Tinh tuyển NFT neo giữ.',
            'Kết nối ví để thực hiện các thao tác này trong ứng dụng. Bạn có thể đọc hướng dẫn và xem dữ liệu công khai trước khi kết nối.',
          ],
        },
        {
          heading: 'Nét bút như những tín hiệu công khai',
          body: [
            'Một nét bút là một hành động công khai của giao thức. Nó ghi lại rằng một người tham gia đã tương tác với chu kỳ trình diễn đang diễn ra, và nó thay đổi bối cảnh chu kỳ cuối cùng bao quanh Signature. Nét bút có thể dùng ETH hoặc CST, nhưng trong cả hai trường hợp nó đều là một phần của chuỗi hoạt động chu kỳ công khai.',
            'Vì nét bút nằm trên chuỗi, ứng dụng có thể hiển thị chúng nhiều hơn là các sự kiện giao diện. Chúng có thể được nối với địa chỉ người tham gia, thời điểm, CST tham gia, token đính kèm, các lần kéo dài chu kỳ và lịch sử phân bổ sau đó, giúp giải thích một chu kỳ đã kết thúc ra sao.',
          ],
        },
        {
          heading: 'Bối cảnh ETH, CST và RandomWalk',
          body: [
            'Nét bút ETH và nét bút CST đóng những vai trò liên quan nhưng tách biệt. Nét bút ETH góp vào Dự trữ chu kỳ, còn nét bút CST biểu thị sự tham gia thông qua token của giao thức. Ứng dụng ghi nhãn cả hai luồng để người tham gia hiểu tài sản nào đang được dùng và nó ảnh hưởng thế nào đến chu kỳ hiện tại.',
            'Đính kèm RandomWalk NFT thêm một lớp bối cảnh công khai khác. Một RandomWalk NFT chưa sử dụng có thể được đính kèm để giảm chi phí nét bút một lần, và các RandomWalk NFT đã sử dụng được liệt kê riêng để bản ghi công khai vẫn dễ hiểu sau khi thời điểm tham gia đã qua.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Đặt hoặc xem nét bút trong ứng dụng',
        'Tìm hiểu về chu kỳ trình diễn',
        'Xem dữ liệu chu kỳ hiện tại',
      ],
    },
    'three-body-nft-art': {
      title: 'Cosmic Signature tạo ra nghệ thuật NFT ba vật thể như thế nào | Cosmic Signature',
      description:
        'Giải thích kỹ thuật về tác phẩm Cosmic Signature NFT tất định được tạo từ seed trên chuỗi và vật lý ba vật thể.',
      h1: 'Cosmic Signature tạo ra nghệ thuật NFT ba vật thể như thế nào',
      summary:
        'Cosmic Signature NFT là tác phẩm tất định được tạo từ seed trên chuỗi và một quy trình kết xuất vật lý ba vật thể có thể tái tạo.',
      sections: [
        {
          heading: 'Từ seed trên chuỗi đến bản kết xuất tất định',
          body: [
            'Mỗi Cosmic Signature NFT lưu một seed có thể tái tạo tác phẩm. Quy trình kết xuất dùng các đầu vào tất định, nên cùng một seed tạo ra cùng một Signature.',
            'Quy trình nghệ thuật mô phỏng ba thiên thể dưới lực hấp dẫn Newton. Các quỹ đạo hỗn độn trở thành những vệt quỹ đạo quang phổ, tạo nên một bản sắc thị giác dễ nhận ra cho giao thức.',
          ],
        },
        {
          heading: 'Mở và có thể tái tạo',
          body: [
            'Giao thức đề cao khả năng tái tạo. Mã nguồn và quy trình kết xuất được thiết kế để mỗi Signature có thể được xác minh độc lập từ seed của nó.',
            'Tác phẩm được công bố theo CC0, đưa cả phần hình ảnh và kỹ thuật đến gần với phạm vi công cộng.',
          ],
        },
        {
          heading: 'Vì sao tính tất định quan trọng với nghệ thuật',
          body: [
            'Hệ ba vật thể cho Cosmic Signature một ngôn ngữ thị giác dựa trên chuyển động, lực hấp dẫn và những quỹ đạo bất ổn. Tính tất định quan trọng vì tác phẩm phải có thể tái tạo từ các đầu vào công khai thay vì phụ thuộc vào một bộ kết xuất lưu trữ mờ đục.',
            'Một quy trình tất định cho phép nhà sưu tầm, lập trình viên và nhà nghiên cứu xác minh rằng hình ảnh Signature tương ứng với seed và mã kết xuất. Đó là lý do trang mã nguồn, phòng trưng bày, trang chi tiết token và trang hợp đồng cùng kể một câu chuyện tin cậy.',
          ],
        },
        {
          heading: 'Từ lịch sử chu kỳ đến bản sắc thị giác',
          body: [
            'Signature cuối cùng không phải trang trí ngẫu nhiên. Nó là điểm kết thị giác của một chu kỳ trình diễn, với lịch sử chu kỳ cung cấp bối cảnh văn hóa và giao thức xoay quanh hình ảnh. Tác phẩm trở thành dấu mốc hữu hình của một quy trình công khai đã hoàn thành.',
            'Tác phẩm gắn liền với chu kỳ đã tạo ra nó. Từ trang token, bạn có thể xem seed, đặc tính, lịch sử chu kỳ và mã nguồn dùng để tái tạo hình ảnh.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Khám phá phòng trưng bày Cosmic Signature',
        'Xem mã nguồn',
        'Đọc ghi chú về hợp đồng và xác minh',
      ],
    },
    'cosmic-signature-on-arbitrum': {
      title: 'Cosmic Signature trên Arbitrum | Cosmic Signature',
      description:
        'Vì sao Cosmic Signature chạy trên Arbitrum và cách giao thức dùng hạ tầng Layer 2 của Ethereum cho nghệ thuật trên chuỗi.',
      h1: 'Cosmic Signature trên Arbitrum',
      summary:
        'Cosmic Signature chạy trên Arbitrum để nét bút, chu kỳ, bản ghi NFT và phân bổ có thể được xử lý trên một mạng Layer 2 của Ethereum.',
      sections: [
        {
          heading: 'Vì sao là Arbitrum',
          body: [
            'Arbitrum cung cấp việc thực thi chi phí thấp hơn trong khi vẫn gắn với tính bảo mật của Ethereum. Điều đó quan trọng với một giao thức mà người tham gia có thể đặt nét bút lặp lại và kiểm tra trạng thái công khai.',
            'Dữ liệu trong ứng dụng, thống kê và phòng trưng bày đều liên kết với hoạt động trên Arbitrum, giúp bạn kiểm tra nguồn gốc của từng bản ghi.',
          ],
        },
        {
          heading: 'Vì sao bối cảnh chuỗi được hiển thị rõ',
          body: [
            'Cosmic Signature nêu rõ Arbitrum xuyên suốt ứng dụng vì bối cảnh chuỗi là một phần của bản sắc giao thức. Nét bút, bản ghi chu kỳ, địa chỉ hợp đồng, CST, quyền sở hữu NFT và các lần nhận về phân bổ đều cần một tham chiếu mạng cụ thể để có thể kiểm tra độc lập.',
            'Trang hợp đồng cung cấp địa chỉ triển khai; trang thống kê tổng hợp hoạt động trên mạng. Hai nguồn này giúp bạn đối chiếu cơ chế được mô tả với dữ liệu thực tế.',
          ],
        },
        {
          heading: 'Cách các trang ứng dụng nối với bản ghi Arbitrum',
          body: [
            'Các trang ứng dụng dịch bản ghi thô từ chuỗi và API sang ngôn ngữ giao thức dễ đọc. Trang phân bổ giải thích người nhận và kết quả chu kỳ; trang neo giữ giải thích các cam kết token; trang hàng hóa công giải thích dòng đóng góp và nhận về; phòng trưng bày giải thích đầu ra token.',
            'Bạn có thể xem các trang này mà không cần ví để tìm hiểu hoạt động của giao thức và kiểm tra những dữ liệu do hợp đồng ghi nhận.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Xem các hợp đồng đã xác minh', 'Xem thống kê giao thức'],
    },
    'contracts-security-verification': {
      title: 'Hợp đồng, bảo mật và xác minh của Cosmic Signature | Cosmic Signature',
      description:
        'Tra cứu hợp đồng thông minh, mã nguồn, xác minh và bối cảnh bảo mật của giao thức Cosmic Signature trên Arbitrum.',
      h1: 'Hợp đồng, bảo mật và xác minh của Cosmic Signature',
      summary:
        'Cosmic Signature công khai thông tin hợp đồng và mã nguồn để người tham gia có thể kiểm tra cơ chế giao thức và xác minh hành vi trên chuỗi.',
      sections: [
        {
          heading: 'Thông tin hợp đồng công khai',
          body: [
            'Trang hợp đồng chính thức cung cấp địa chỉ, liên kết xác minh, thông tin triển khai và cách các hợp đồng quản lý phân bổ.',
            'Bạn có thể xem các thông tin này trước khi kết nối ví và mở từng địa chỉ trong trình khám phá khối để kiểm tra.',
          ],
        },
        {
          heading: 'Nguồn thông tin xác minh',
          body: [
            'Việc xác minh trải trên nhiều bề mặt công khai. Trang hợp đồng liệt kê địa chỉ triển khai và liên kết trình khám phá, trang mã nguồn mô tả các tài nguyên kết xuất tất định, trang kiểm toán nêu tình trạng rà soát, và trang bảo mật giải thích cách người dùng nên kiểm tra các tài nguyên chính thức.',
            'Những trang này nên được đọc cùng nhau. Một địa chỉ hợp đồng không có bối cảnh rất khó diễn giải; một tuyên bố bảo mật không có liên kết rất khó xác minh. Vì vậy Cosmic Signature giữ cho địa chỉ, tham chiếu mã nguồn, ngôn ngữ về rủi ro và tình trạng kiểm toán được kết nối qua các liên kết nội bộ.',
          ],
        },
        {
          heading: 'Kiểm tra gì trước tiên',
          body: [
            'Bắt đầu với trang hợp đồng chính thức trên máy chủ ứng dụng và xác nhận mạng Arbitrum. Sau đó so sánh các liên kết mã nguồn, tổng quan bảo mật và trang kiểm toán. Nếu một báo cáo kiểm toán hoặc kiểm chứng hình thức chưa được công bố, trang nên nói rõ điều đó thay vì ngầm ý về một bằng chứng chưa có.',
            'Cách tiếp cận thận trọng này là có chủ đích. Các trang tin cậy hữu ích nhất khi chúng phân biệt thông tin đã triển khai, báo cáo đã công bố, phân tích tĩnh, rà soát cộng đồng và công việc tương lai, thay vì gộp tất cả thành một tuyên bố không có cơ sở.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Mở địa chỉ hợp đồng', 'Mở tài nguyên mã nguồn', 'Đọc câu hỏi thường gặp'],
    },
    'cst-token-and-cosmic-council': {
      title: 'CST và Hội đồng Vũ trụ | Cosmic Signature',
      description:
        'Tìm hiểu token CST liên hệ thế nào với nét bút, điều phối giao thức và Hội đồng Vũ trụ.',
      h1: 'CST và Hội đồng Vũ trụ',
      summary:
        'CST là token ERC-20 của Cosmic Signature, được khắc qua việc tham gia và dùng để điều phối giao thức thông qua Hội đồng Vũ trụ.',
      sections: [
        {
          heading: 'CST trong giao thức',
          body: [
            'Nét bút có thể khắc CST tham gia, và CST cũng có thể dùng làm phương thức thanh toán thay thế cho nét bút thông qua cửa sổ hiệu chỉnh riêng của nó. CST chi cho một nét bút được đốt \u2014 loại bỏ vĩnh viễn khỏi nguồn cung \u2014 thay vì gom vào quỹ.',
            'Lượng CST tham gia là động: nó phụ thuộc vào thời gian kể từ nét bút trước và dùng công thức căn bậc hai, nên những khoảng lặng dài tạo ra lần khắc lớn hơn trong khi nét bút dồn dập có thể tạo ra 0 CST.',
            'CST biểu thị trọng số điều phối trong Hội đồng Vũ trụ sau khi được ủy quyền (người nắm giữ có thể ủy quyền cho chính mình), nơi những người tham gia điều phối các thay đổi của giao thức theo quy tắc trên chuỗi.',
          ],
        },
        {
          heading: 'Vai trò của CST',
          body: [
            'CST là một phần của lớp tham gia và điều phối trong Cosmic Signature. Nó có thể được khắc qua nét bút, dùng cho nét bút CST và dùng để biểu thị trọng số điều phối trong Hội đồng Vũ trụ. Điều đó khiến nó là một token của giao thức, không phải một quyền sở hữu vốn.',
            'Trong ứng dụng, CST dùng để thanh toán nét bút và thể hiện trọng số điều phối. Những chức năng này mô tả vai trò của token trong giao thức, không dự đoán giá trị tương lai của token.',
          ],
        },
        {
          heading: 'Bản ghi điều phối',
          body: [
            'Hội đồng Vũ trụ cho người nắm giữ CST một cách để điều phối các thay đổi của giao thức theo quy tắc trên chuỗi. Trang Thay đổi điều phối và các trang ứng dụng liên quan hiển thị lịch sử thay đổi tham số để người đọc hiểu giao thức tiến hóa ra sao.',
            'Hội đồng Vũ trụ là cơ chế điều phối của Cosmic Signature. Để hiểu phạm vi quyền hạn hiện tại và các giới hạn liên quan, hãy đọc thêm thông tin hợp đồng, điều khoản và công bố rủi ro.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Đọc cách nét bút vận hành', 'Mở ứng dụng'],
    },
    'anchoring-nfts': {
      title: 'Neo giữ Cosmic Signature NFT | Cosmic Signature',
      description:
        'Cách neo giữ vận hành với Cosmic Signature NFT, phân phối neo giữ ETH và diện Tinh tuyển của Random Walk NFT.',
      h1: 'Neo giữ Cosmic Signature NFT',
      summary:
        'Neo giữ nối NFT trở lại với giao thức: Cosmic Signature NFT nhận phân phối neo giữ ETH, còn RandomWalk NFT thuộc diện Tinh tuyển NFT neo giữ.',
      sections: [
        {
          heading: 'Phân phối neo giữ',
          body: [
            'Cosmic Signature NFT có thể được neo giữ với giao thức. Cosmic Signature NFT đang neo giữ chia sẻ phân phối neo giữ ETH của một chu kỳ theo quy tắc giao thức, và ETH tích lũy được nhận về khi gỡ neo.',
            'Random Walk NFT có vai trò neo giữ riêng để thuộc diện Tinh tuyển NFT neo giữ; chúng không nhận phân phối neo giữ ETH.',
            'Mỗi NFT \u2014 Cosmic Signature hay Random Walk \u2014 chỉ được neo giữ đúng một lần. Gỡ neo trả lại NFT cùng mọi khoản phân phối đã tích lũy, nhưng NFT đó không bao giờ có thể neo giữ lại.',
          ],
        },
        {
          heading: 'Neo giữ công khai điều gì',
          body: [
            'Neo giữ nối một NFT trở lại với giao thức sau khi nó đã được khắc hoặc được sở hữu. Các trang neo giữ công khai hiển thị thao tác neo giữ và gỡ neo, số token đang neo giữ, bản ghi phân phối và hoạt động RandomWalk NFT liên quan.',
            'Lịch sử neo giữ là dữ liệu công khai. Bạn có thể kiểm tra thao tác, NFT liên quan và khoản phân phối mà không cần kết nối ví.',
          ],
        },
        {
          heading: 'Vai trò của Cosmic Signature và RandomWalk',
          body: [
            'Cosmic Signature NFT và RandomWalk NFT có bối cảnh neo giữ khác nhau. Cosmic Signature NFT gắn với phân phối neo giữ ETH, còn RandomWalk NFT có thể gắn với diện được chọn và mức giảm chi phí nét bút ETH một lần tùy theo trạng thái của chúng.',
            'Trước khi neo giữ, hãy kiểm tra loại NFT và trạng thái của token. Trang thống kê, phòng trưng bày và chu kỳ hiện tại cung cấp thông tin để đối chiếu.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Mở công cụ neo giữ', 'Khám phá phòng trưng bày'],
    },
    'protocol-guild-public-goods': {
      title: 'Cosmic Signature và hàng hóa công của Ethereum | Cosmic Signature',
      description:
        'Cách Cosmic Signature chuyển một phần phân bổ hàng hóa công đến Protocol Guild, cơ chế tài trợ cho những người đóng góp cốt lõi cho Ethereum.',
      h1: 'Cosmic Signature và hàng hóa công của Ethereum',
      summary:
        'Cosmic Signature có một luồng phân bổ hàng hóa công, hiện chuyển một phần của mỗi Dự trữ chu kỳ đến Protocol Guild.',
      sections: [
        {
          heading: 'Phân bổ cho Protocol Guild',
          body: [
            'Protocol Guild là cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum. Cosmic Signature hiện chuyển phần phân bổ hàng hóa công đến Protocol Guild.',
            'Phân bổ Hàng hóa công là một phần trong cơ chế của giao thức. Lịch sử đóng góp và chuyển khoản giúp bạn kiểm tra phần dự trữ được dành cho mục đích này.',
          ],
        },
        {
          heading: 'Vì sao hàng hóa công là một phần của giao thức',
          body: [
            'Việc chuyển tiếp hàng hóa công là một luồng phân bổ ở cấp giao thức chứ không phải một tuyên bố truyền thông thi thoảng. Một phần Dự trữ chu kỳ được chuyển đến một đơn vị thụ hưởng hàng hóa công, hiện là Protocol Guild, theo các quy tắc hiển thị trong ứng dụng.',
            'Điều này cho các trang hàng hóa công một nhiệm vụ cụ thể: hiển thị bản ghi đóng góp, bản ghi nhận về, bối cảnh đơn vị thụ hưởng và mối quan hệ giữa việc tham gia chu kỳ và sự hỗ trợ hệ sinh thái Ethereum.',
          ],
        },
        {
          heading: 'Cách xác minh dòng hàng hóa công',
          body: [
            'Dùng các trang đóng góp hàng hóa công để xem số đã nạp và trang nhận về để xem các khoản được chuyển từ kho. Dùng trang hợp đồng để xem địa chỉ và trang thống kê để có bối cảnh tổng hợp.',
            'Các bản ghi cho thấy số ETH đã chuyển và địa chỉ nhận. Chúng không tự xác lập cách xử lý thuế hay địa vị pháp lý đặc biệt; hãy đọc thêm điều khoản và công bố rủi ro.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Xem bản ghi đóng góp hàng hóa công', 'Tìm hiểu cách chu kỳ vận hành'],
    },
    'collecting-and-trading-cosmic-signature': {
      title: 'Sưu tầm và giao dịch Cosmic Signature NFT và CST | Cosmic Signature',
      description:
        'Nơi các tài sản Cosmic Signature được giao dịch: sàn NFT không thu phí Axiom Zero, hoán đổi CST trên Uniswap tại Arbitrum và thị trường dự đoán Chaos Zero cho các chu kỳ.',
      h1: 'Sưu tầm và giao dịch Cosmic Signature',
      summary:
        'Cosmic Signature NFT được giao dịch trên Axiom Zero, sàn không thu phí dành cho nghệ thuật tạo sinh ra mắt công bằng trên Arbitrum. CST được giao dịch trên Uniswap, và Chaos Zero vận hành một thị trường dự đoán cho mỗi chu kỳ trình diễn.',
      sections: [
        {
          heading: 'Các tài sản được giao dịch ở đâu',
          body: [
            'Cosmic Signature NFT là token ERC-721 tiêu chuẩn trên Arbitrum, và sàn chính của chúng là Axiom Zero. Axiom Zero được xây cho nghệ thuật tạo sinh ra mắt công bằng: không thu phí nền tảng, niêm yết và giao dịch bán được thanh toán trực tiếp trên chuỗi trong một giao dịch duy nhất, và người bán nhận trọn số tiền bán. Sàn liệt kê cả hai bộ sưu tập của Axiom Zero \u2014 Cosmic Signature và Random Walk \u2014 và đọc mọi mức giá hiển thị thẳng từ các hợp đồng sàn đã xác minh.',
            'CST là token ERC-20 tiêu chuẩn và được giao dịch trên Uniswap tại Arbitrum. Vì cả hai tài sản đều theo các tiêu chuẩn token mở, bất kỳ sàn hay nơi trao đổi nào trên Arbitrum hỗ trợ ERC-721 hoặc ERC-20 cũng có thể xử lý chúng; luôn đối chiếu địa chỉ hợp đồng với trang hợp đồng chính thức trước khi giao dịch.',
          ],
        },
        {
          heading: 'Thị trường dự đoán Chaos Zero',
          body: [
            'Chaos Zero là thị trường dự đoán được xây riêng cho Cosmic Signature. Mỗi chu kỳ trình diễn nó mở một câu hỏi duy nhất: Chu kỳ này có hoàn tất với nhiều nét bút hơn chu kỳ trước không? Các vị thế được tính bằng CST và được bảo chứng đầy đủ theo thiết kế \u2014 một CST luôn chuyển thành một token YES cộng một token NO, và một cặp khớp nhau luôn đổi lại được một CST.',
            'Thị trường được giải quyết từ số nét bút công khai trên chuỗi. Khoảnh khắc số nét bút vượt tổng của chu kỳ trước, kết quả là chắc chắn, giao dịch dừng ngay trong cùng khối, và thị trường chỉ còn cho phép rút vị thế. Chaos Zero không có chủ sở hữu, không có khóa quản trị và không có đường nâng cấp.',
          ],
        },
        {
          heading: 'Trạng thái neo giữ và bối cảnh sưu tầm',
          body: [
            'Neo giữ cho Cosmic Signature và Random Walk NFT một thuộc tính thứ hai có ý nghĩa với thị trường ngoài chính tác phẩm. Mỗi NFT chỉ có thể được neo giữ với giao thức đúng một lần, và gỡ neo chấm dứt vĩnh viễn diện đó. Vì vậy một token chưa từng neo giữ vẫn giữ nguyên lựa chọn neo giữ một lần cho chủ sở hữu kế tiếp, đó là lý do nhà sưu tầm thường coi trọng trạng thái này.',
            'Axiom Zero đọc trạng thái neo giữ trực tiếp từ các hợp đồng neo giữ và ghi nhãn mỗi token là chưa từng neo giữ hoặc đã neo giữ, và mỗi bộ sưu tập có thể lọc theo trạng thái đó. Điều này giữ cho mô tả của sàn về một token nhất quán với các bản ghi neo giữ trên chuỗi mà chính ứng dụng hiển thị.',
          ],
        },
        {
          heading: 'Cách xác minh địa điểm và địa chỉ',
          body: [
            'Trước khi giao dịch, hãy xác nhận địa chỉ hợp đồng chính thức trên trang hợp đồng của máy chủ ứng dụng và so sánh với bộ sưu tập hoặc cặp token bạn đang xem trên sàn hay nơi trao đổi. Cosmic Signature liên kết các địa điểm trong hệ sinh thái \u2014 Axiom Zero, Chaos Zero và Uniswap \u2014 từ đầu trang, chân trang và sơ đồ trang của ứng dụng để luôn có một lộ trình điều hướng chính thức đến đúng đích.',
            'Sự thận trọng tương tự áp dụng cho hoán đổi CST và vị thế dự đoán: kiểm tra địa chỉ token khớp với hợp đồng CST đã công bố, và nhớ rằng vị thế trên Chaos Zero được giải quyết từ số nét bút công khai do giao thức ghi lại, nên mọi đầu vào của thị trường đều có thể kiểm tra độc lập trên Arbitrum.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Duyệt Cosmic Signature trên Axiom Zero',
        'Đưa ra dự đoán trên Chaos Zero',
        'Hoán đổi ETH sang CST trên Uniswap',
        'Xác minh địa chỉ hợp đồng',
        'Khám phá phòng trưng bày NFT',
      ],
    },
    // lexicon-allow-start: explicit denial language for crawler and compliance clarity.
    'not-a-lottery-not-an-investment': {
      title: 'Cosmic Signature có phải là xổ số, sòng bạc hay đầu tư? | Cosmic Signature',
      description:
        'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi, không phải xổ số, sòng bạc, sản phẩm cờ bạc hay sản phẩm đầu tư.',
      h1: 'Cosmic Signature có phải là xổ số, sòng bạc hay đầu tư?',
      summary:
        'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi. Đây không phải xổ số, sòng bạc, sản phẩm cờ bạc hay sản phẩm đầu tư.',
      sections: [
        {
          heading: 'Giải thích bằng ngôn ngữ giản dị',
          body: [
            'Người tham gia đặt nét bút trong các chu kỳ trình diễn. Giao thức phân phối phân bổ qua các luồng đã định nghĩa khi một chu kỳ hoàn tất. Không có nhà cái, không có người chia bài và không có cược.',
            'CST biểu thị sự tham gia và trọng số điều phối trong giao thức. Nó không phải cổ phần, quyền hưởng lợi nhuận, cổ tức hay hợp đồng đầu tư. Cosmic Signature không đưa ra cam kết nào về giá token hay diễn biến thị trường tương lai.',
          ],
        },
        {
          heading: 'Vì sao lời phủ nhận được nêu rõ',
          body: [
            'Các khái niệm được phân biệt rõ để người tham gia hiểu đúng bản chất giao thức. Cosmic Signature mô tả hoạt động nghệ thuật và phân bổ theo quy tắc, không chào mời như sản phẩm cờ bạc, sòng bạc hay đầu tư.',
            'Định nghĩa khẳng định vẫn là điểm tựa: Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi. Người tham gia đặt nét bút, chu kỳ hoàn tất, tác phẩm tất định được khắc, và phân bổ tuân theo các quy tắc công khai của giao thức.',
          ],
        },
        {
          heading: 'Cách đọc ngôn ngữ phân bổ',
          body: [
            'Ngôn ngữ phân bổ mô tả các phân phối của giao thức sau khi một chu kỳ hoàn tất. Nó không mô tả quyền hưởng lợi nhuận, quyền hưởng cổ tức, cổ phần hay lợi nhuận tài chính được hứa hẹn. Nên đọc công bố rủi ro và điều khoản trước khi tham gia.',
            'Bạn có thể đọc các giải thích và công bố rủi ro mà không cần kết nối ví. Hãy xem kỹ trước khi ký giao dịch.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Đọc Điều khoản dịch vụ', 'Đọc câu hỏi thường gặp'],
    },
    // lexicon-allow-end
  },
} satisfies LearnText;
