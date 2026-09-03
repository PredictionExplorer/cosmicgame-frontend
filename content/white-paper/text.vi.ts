import { protocolFacts } from '@/content/protocol-facts';

import type { WhitePaperText } from './structure';
import { WHITE_PAPER_VERSION } from './types';

const cst = (amount: number): string => amount.toLocaleString('vi-VN');
const percent = (value: number): string => value.toLocaleString('vi-VN');
/** Vietnamese decimal mark for a protocol figure quoted in English notation ("0.0001"). */
const viDecimal = (value: string | number): string => String(value).replace('.', ',');

const ELAPSED_VI: Record<string, string> = {
  '0 seconds': '0 giây',
  '1 second': '1 giây',
  '60 seconds': '60 giây',
  '1 hour': '1 giờ',
  '1 day': '1 ngày',
};

/** Vietnamese white-paper copy, keyed by the skeleton in structure.ts. */
export const whitePaperTextVi = {
  metadata: {
    title: 'Sách trắng Cosmic Signature | Giao thức nghệ thuật tạo sinh trên chuỗi',
    description:
      'Bản mô tả tham chiếu của Cosmic Signature: chu kỳ trình diễn, nét bút, các luồng phân bổ, nghệ thuật NFT ba vật thể tất định, CST, neo giữ, Hội đồng Vũ trụ, nâng cấp giao thức và con đường đến phi tập trung hoàn toàn.',
  },
  breadcrumbLabel: 'Sách trắng',
  breadcrumbs: {
    ariaLabel: 'Đường dẫn điều hướng',
    homeLabel: 'Trang chủ',
  },
  hero: {
    eyebrow: 'Sách trắng',
    subtitle: 'Giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum',
    versionLabel: `Phiên bản ${WHITE_PAPER_VERSION}`,
    dateLabel: 'tháng 8 năm 2026',
    downloadLabel: 'Tải PDF',
  },
  abstract: {
    heading: 'Tóm tắt',
    paragraphs: [
      'Cosmic Signature là một giao thức nghệ thuật tạo sinh trên Arbitrum One. Nó vận hành như một chuỗi các chu kỳ trình diễn có giới hạn thời gian. Trong một chu kỳ, người tham gia đặt nét bút bằng ETH hoặc bằng CST, token ERC-20 của giao thức. Mỗi nét bút kéo dài đếm ngược của chu kỳ, ghi nhận một lượt trong Tinh tuyển của chu kỳ và có thể khắc CST mới. Khi đếm ngược hết hạn và chu kỳ được hoàn tất, giao thức phân phối dự trữ ETH của mình qua hơn mười luồng phân bổ, khắc một thế hệ Cosmic Signature NFT mới, và chuyển một phần cố định đến Protocol Guild, cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum. Khoảng một nửa dự trữ được chuyển sang chu kỳ sau, nên mỗi chu kỳ bắt đầu lớn hơn chu kỳ trước.',
      'Mỗi Cosmic Signature NFT là một bản kết xuất tất định của bài toán ba vật thể hấp dẫn, được tạo từ một seed trên chuỗi và bất kỳ ai cũng có thể tái tạo đến từng điểm ảnh. Không mạng thần kinh nào chạm vào hình ảnh. Bài viết này mô tả đầy đủ cơ chế và thiết kế token, ghi lại nâng cấp V2 đang vận hành hôm nay, trình bày nâng cấp V3 dự kiến, và nêu cam kết loại bỏ mọi hình thức kiểm soát đặc quyền khỏi địa chỉ triển khai một khi thiết kế hoàn thành.',
    ],
  },
  tocHeading: 'Mục lục',
  sections: {
    introduction: {
      heading: 'Giới thiệu',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature bắt đầu từ hai niềm tin. Thứ nhất, nghệ thuật tạo sinh thú vị nhất khi không có gì trong nó là tùy tiện: khi mỗi hình ảnh là đầu ra của một quá trình vật lý, được cố định bởi một seed, và bất kỳ ai cũng có thể chạy lại quá trình đó để kiểm chứng kết quả. Thứ hai, một giao thức giữ ETH thay cho những người tham gia nợ họ một câu trả lời cơ học, dễ đọc cho câu hỏi mỗi wei đi về đâu.',
        },
        {
          kind: 'paragraph',
          text: 'Kết quả là một giao thức xây quanh thời gian. Một chu kỳ trình diễn mở ra, đầy dần bằng nét bút, và khép lại khi đếm ngược của nó cạn. Một nét bút là một hành động nhỏ trên chuỗi: nó mang ETH hoặc CST, có thể mang một lời nhắn ngắn hoặc một tài sản đính kèm, và nó đẩy thời điểm hoàn tất của chu kỳ xa hơn về tương lai. Người tham gia có nét bút đứng cuối khi đếm ngược hết hạn, nét bút cuối cùng, sẽ hoàn tất chu kỳ. Hoàn tất phân phối dự trữ, khắc các NFT của chu kỳ và chuẩn bị chu kỳ tiếp theo.',
        },
        {
          kind: 'paragraph',
          text: 'Ba đặc tính neo giữ thiết kế này.',
        },
        {
          kind: 'list',
          items: [
            'Tính tất định. Tác phẩm được tính từ một seed ghi trên chuỗi lúc khắc. Quy trình kết xuất là mã nguồn mở, và cùng một seed luôn tạo ra cùng một hình ảnh và video, đến từng bit.',
            'Phân phối cơ học. Tỷ lệ phân bổ là các hằng số trong hợp đồng đã xác minh. Không tài khoản tùy quyết nào đứng giữa người tham gia và quy tắc phân phối, và không ví nào của đội ngũ nhận ETH từ nét bút.',
            'Một vai trò hữu hạn cho đội ngũ. Quyền của chủ sở hữu rất hẹp, bị khóa trong khi một chu kỳ chạy, và được lên lịch loại bỏ hoàn toàn khi các nâng cấp còn lại được triển khai.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Bài viết này là bản mô tả tham chiếu của giao thức. Mục 2 phác thảo hệ thống. Các mục 3 đến 5 đặc tả chu kỳ, nét bút và phân bổ. Mục 6 nói về nghệ thuật. Các mục 7 đến 10 nói về CST, neo giữ, Hội đồng Vũ trụ và Hàng hóa công. Mục 11 nói về bảo mật và khả năng xác minh. Các mục 12 và 13 ghi lại lịch sử nâng cấp và con đường đến phi tập trung hoàn toàn, và Mục 14 nêu thẳng giao thức không phải là gì. Các con số trong bài là hằng số hợp đồng hoặc giá trị lúc ra mắt của các tham số trên chuỗi; các hợp đồng đã triển khai, liệt kê ở Phụ lục A, vẫn là thẩm quyền cuối cùng.',
        },
      ],
    },
    'protocol-overview': {
      heading: 'Tổng quan giao thức',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Hệ thống gồm một hợp đồng cốt lõi và một vành các hợp đồng hẹp, đơn mục đích bao quanh. Hợp đồng cốt lõi, triển khai sau một proxy có thể nâng cấp, điều hành các chu kỳ: nó định chi phí nét bút, theo dõi đếm ngược, giữ Dự trữ chu kỳ và thực thi hoàn tất. Xung quanh nó là token CST, bộ sưu tập Cosmic Signature NFT, một ví ký quỹ cho phân bổ, hai ví neo giữ, Kho Hàng hóa công, Dự trữ truyền thông và Hội đồng Vũ trụ.',
        },
        {
          kind: 'table',
          table: {
            columns: ['Thành phần', 'Vai trò'],
            rows: [
              [
                'Hợp đồng giao thức',
                'Điều hành các chu kỳ trình diễn: chi phí nét bút, đếm ngược, Dự trữ chu kỳ và hoàn tất.',
              ],
              [
                'CST (ERC-20)',
                'Token tham gia. Chỉ giao thức mới khắc được, bị đốt khi chi cho nét bút, và biểu thị trọng số điều phối sau khi được ủy quyền.',
              ],
              [
                'Cosmic Signature NFT (ERC-721)',
                'Tác phẩm ba vật thể tất định. Chỉ được khắc khi hoàn tất, với seed lưu trên chuỗi.',
              ],
              [
                'Random Walk NFT',
                'Một bộ sưu tập tạo sinh trước đó của cùng đội ngũ. Mang lại mức giảm chi phí nét bút một lần và một luồng Tinh tuyển neo giữ riêng.',
              ],
              [
                'Ví phân bổ',
                'Ký quỹ cho các phân bổ ETH phụ và tài sản đính kèm vào nét bút, với một thời hạn nhận về mở.',
              ],
              [
                'Các ví neo giữ',
                'Một cho Cosmic Signature NFT (phân phối neo giữ ETH) và một cho Random Walk NFT (diện Tinh tuyển).',
              ],
              [
                'Kho Hàng hóa công',
                'Nhận và chuyển tiếp phân bổ Hàng hóa công theo từng chu kỳ. Đơn vị thụ hưởng hiện là Protocol Guild.',
              ],
              [
                'Dự trữ truyền thông',
                `Nhận ${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ cho truyền thông cộng đồng.`,
              ],
              [
                'Hội đồng Vũ trụ',
                'Cơ quan điều phối trên chuỗi, trong đó CST được ủy quyền biểu thị trọng số điều phối.',
              ],
            ],
          },
        },
        {
          kind: 'paragraph',
          text: 'Quanh các hợp đồng, một hệ sinh thái đã lớn lên: ứng dụng tại app.cosmicsignature.com, sàn Axiom Zero cho các NFT, thanh khoản Uniswap cho CST trên Arbitrum, và Chaos Zero, một nơi dự đoán kết quả chu kỳ. Không thứ nào là bắt buộc. Mọi cơ chế trong bài viết này đều có thể thực hiện trực tiếp với các hợp đồng.',
        },
      ],
    },
    'performance-cycle': {
      heading: 'Chu kỳ trình diễn',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Một chu kỳ là một khoảng thời gian. Nó mở ra với các cửa sổ hiệu chỉnh giá giảm dần, đầy dần bằng nét bút, và kết thúc khi thời điểm hoàn tất chu kỳ hết hạn và ai đó hoàn tất nó. Mục này nói về đồng hồ; Mục 4 nói về chính các nét bút.',
        },
      ],
      subsections: {
        'eth-calibration-window': {
          heading: 'Mở chu kỳ và cửa sổ hiệu chỉnh ETH',
          blocks: [
            {
              kind: 'paragraph',
              text: `Mỗi chu kỳ phải mở bằng một nét bút ETH, và cửa sổ hiệu chỉnh ETH đặt chi phí của nó. Cửa sổ bắt đầu ở ${protocolFacts.ethCalibrationCeilingMultiplier} lần chi phí mở đầu thực trả trong chu kỳ trước và giảm tuyến tính về sàn bằng một phần hai trăm giá trị khởi đầu đó, cộng một wei. Với các tham số lúc ra mắt, đường giảm mất khoảng hai ngày; thời lượng của nó gắn với mức tăng thời gian của chu kỳ, nên nó giãn dần khi giao thức già đi. Nếu cửa sổ trôi qua hoàn toàn trước khi có ai đặt nét bút, chi phí chỉ đơn giản nằm ở sàn. Chu kỳ đầu tiên mở ở mức cố định ${viDecimal(protocolFacts.initialGestureCostEth)} ETH.`,
            },
            {
              kind: 'paragraph',
              text: 'Cơ chế mở này thực hiện khám phá giá mà không cần sổ lệnh. Nếu chu kỳ trước mở quá rẻ, việc gấp đôi khôi phục biên độ; nếu mức gấp đôi lại quá cao, đường giảm hai ngày tìm ra mức mà ai đó sẵn lòng bắt đầu.',
            },
          ],
        },
        countdown: {
          heading: 'Đếm ngược',
          blocks: [
            {
              kind: 'paragraph',
              text: `Nét bút mở khởi động đồng hồ, đặt thời điểm hoàn tất chu kỳ khoảng ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ về phía trước với các tham số lúc ra mắt. Mỗi nét bút tiếp theo, dù ETH hay CST, cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất đã lưu. Mức tăng khởi đầu ở đúng một giờ và lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất, nên các chu kỳ dài dần và tốc độ khắc NFT chậm lại qua năm tháng. Không có giới hạn cứng cho độ dài một chu kỳ khi nét bút vẫn liên tục xuất hiện; trên thực tế, chi phí nét bút tăng dần khiến việc kéo dài vô hạn trở nên tốn kém.`,
            },
            {
              kind: 'paragraph',
              text: 'Việc kéo dài áp lên thời gian đã lưu, không phải thời điểm hiện tại. Một nét bút đặt sau khi đếm ngược đã hết hạn, nhưng trước khi việc hoàn tất được thực thi, cộng một mức tăng vào giá trị đã lưu và giành lấy vị trí nét bút cuối cùng. Nó không khởi động lại đồng hồ.',
            },
          ],
        },
        finalization: {
          heading: 'Hoàn tất và cửa sổ hoàn tất mở',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Khi thời điểm hoàn tất chu kỳ hết hạn, người tham gia đặt nét bút cuối cùng đủ điều kiện hoàn tất. Hoàn tất là một giao dịch: nó đọc số dư ETH của giao thức, phân phối các luồng phân bổ của Mục 5, khắc NFT và CST của chu kỳ, ghi seed cho mỗi tác phẩm mới, và lên lịch chu kỳ tiếp theo.',
            },
            {
              kind: 'paragraph',
              text: `Người đặt nét bút cuối cùng giữ quyền này độc quyền trong ${protocolFacts.finalGestureExclusivityHours} giờ. Sau đó, cửa sổ hoàn tất mở bắt đầu: bất kỳ ai cũng có thể hoàn tất, và hợp đồng coi người làm việc đó là người nhận của chu kỳ, cùng mọi thứ vai trò này mang theo: phần ETH của phân bổ Signature, lần khắc CST của nó, NFT của nó và quyền ưu tiên với các tài sản đính kèm. Quy tắc này cố ý không nhân nhượng. Nó giữ giao thức sống nếu một người tham gia biến mất, và nó khiến sự bất cẩn phải trả một cái giá: một người nhận không hành động trong hai ngày đã để ngỏ vai trò cho người gọi đầu tiên.`,
            },
            {
              kind: 'paragraph',
              text: `Sau khi hoàn tất, chu kỳ tiếp theo kích hoạt sau một độ trễ ngắn, mặc định ${protocolFacts.defaultNextCycleDelayMinutes} phút, và các cửa sổ hiệu chỉnh của nó mở ra.`,
            },
          ],
        },
      },
    },
    gestures: {
      heading: 'Nét bút',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Nét bút là đầu vào duy nhất của giao thức. Mỗi nét bút, bất kể loại tiền, kéo dài đếm ngược, ghi nhận một lượt trong Tinh tuyển dành cho người tham gia của chu kỳ, cập nhật các đồng hồ bền bỉ của Mục 5.2, và có thể khắc CST tham gia như mô tả ở Mục 7.1.',
        },
      ],
      subsections: {
        'eth-gestures': {
          heading: 'Nét bút ETH',
          blocks: [
            {
              kind: 'paragraph',
              text: `Sau nét bút mở, mỗi nét bút ETH nâng chi phí nét bút ETH tiếp theo lên ${protocolFacts.ethGestureCostStepUpPercent}%, cộng một wei. Chuỗi số là công khai và chính xác: bất kỳ ai cũng có thể đọc chi phí hiện tại từ hợp đồng trước khi hành động. Phần trả dư vượt ngưỡng vụn được hoàn lại trong cùng giao dịch; dưới ngưỡng đó, việc hoàn lại tốn nhiều gas hơn số tiền trả về, nên phần chênh ở lại trong dự trữ.`,
            },
          ],
        },
        'random-walk-attachment': {
          heading: 'Đính kèm Random Walk NFT',
          blocks: [
            {
              kind: 'paragraph',
              text: `Người tham gia sở hữu một Random Walk NFT có thể đính kèm nó vào một nét bút ETH để giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí của nét bút đó. NFT không được chuyển đi; hợp đồng đánh dấu nó đã dùng. Mỗi Random Walk NFT chỉ có thể đính kèm đúng một lần qua mọi chu kỳ, điều khiến mức giảm trở thành một tài nguyên tiêu hao và gắn một bộ sưu tập bên ngoài cố định vào dòng chảy của giao thức.`,
            },
          ],
        },
        'cst-gestures': {
          heading: 'Nét bút CST',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST cho một lối vào thứ hai. Cửa sổ hiệu chỉnh CST bắt đầu ở ${protocolFacts.cstCalibrationCeilingMultiplier} lần chi phí trả cho nét bút CST trước, và không bao giờ dưới ${protocolFacts.cstCalibrationCeilingMinCst} CST, rồi giảm tuyến tính về không trong thời lượng của cửa sổ. Mỗi nét bút CST khởi động lại cửa sổ từ giá trị khởi đầu mới, và CST đã chi bị đốt, loại bỏ vĩnh viễn khỏi nguồn cung.`,
            },
            {
              kind: 'paragraph',
              text: `Thời lượng của cửa sổ tự thân là một tham số sống, và là một trong những vòng phản hồi lặng lẽ của giao thức. Nó khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ. Mỗi nét bút ETH rút ngắn nó khoảng ${percent(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture)}%, và mỗi nét bút CST kéo dài nó khoảng ${percent(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture)}%. Vì vậy hoạt động ETH sôi động đẩy nhanh đường giảm của CST, khiến nét bút CST sớm trở nên hấp dẫn; hoạt động CST sôi động lại làm chậm nó. Vòng lặp này đẩy mỗi chu kỳ về một cán cân hài hòa giữa hai loại tiền.`,
            },
            {
              kind: 'paragraph',
              text: 'Vì đường giảm có thể chạm không, một khoảng yên lặng dài có thể khiến một nét bút CST gần như không tốn gì. Đó là có chủ đích. Nó bảo đảm chu kỳ luôn có thể được kéo dài bởi bất kỳ ai nắm giữ dù chỉ một ít CST, và việc đốt trong mỗi nét bút CST gắn nguồn cung của token với việc sử dụng thực tế. Người tham gia gửi nét bút CST chỉ định chi phí tối đa họ chấp nhận, nên một nét bút đến muộn hơn dự kiến không thể chi nhiều hơn mức được cho phép.',
            },
            {
              kind: 'paragraph',
              text: 'Nét bút đầu tiên của mỗi chu kỳ phải là ETH; nét bút CST khả dụng từ nét bút thứ hai trở đi.',
            },
          ],
        },
        'messages-and-attachments': {
          heading: 'Lời nhắn và tài sản đính kèm',
          blocks: [
            {
              kind: 'paragraph',
              text: `Một nét bút có thể mang lời nhắn tối đa ${protocolFacts.gestureMessageMaxLength} byte, ghi trên chuỗi cùng với nó. Một nét bút cũng có thể đính kèm token ERC-20 hoặc một NFT ERC-721. Tài sản đính kèm không nhập vào dự trữ ETH; chúng được ví phân bổ giữ, và người nhận của chu kỳ có quyền ưu tiên nhận về chúng sau khi hoàn tất, chịu thời hạn nhận về mở của Mục 5.4.`,
            },
          ],
        },
      },
    },
    'allocation-tracks': {
      heading: 'Dự trữ chu kỳ và các luồng phân bổ',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Toàn bộ ETH trả cho nét bút tích lũy trong hợp đồng giao thức, cùng với khoảng một nửa dự trữ của mọi chu kỳ trước. Số dư này là Dự trữ chu kỳ. Hoàn tất đọc nó một lần và phân phối các tỷ lệ cố định của nó.',
        },
      ],
      subsections: {
        'distribution-at-finalization': {
          heading: 'Phân phối khi hoàn tất',
          blocks: [
            {
              kind: 'table',
              table: {
                columns: ['Luồng ETH', 'Phần của Dự trữ chu kỳ', 'Người nhận'],
                rows: [
                  [
                    'Phân bổ Signature',
                    `${protocolFacts.mainEthPercentage}%`,
                    'Người nhận của chu kỳ, thường là người đặt nét bút cuối cùng.',
                  ],
                  [
                    'Phân bổ Chiến binh Thời gian',
                    `${protocolFacts.chronoWarriorEthPercentage}%`,
                    'Quán quân Bền bỉ giữ vị trí lâu nhất (Mục 5.2).',
                  ],
                  [
                    'Phân bổ Hàng hóa công',
                    `${protocolFacts.publicGoodsPercentage}%`,
                    'Protocol Guild, qua Kho Hàng hóa công.',
                  ],
                  [
                    'Phân phối neo giữ',
                    `${protocolFacts.anchorDistributionPercentage}%`,
                    'Các Cosmic Signature NFT đang neo giữ, theo tỷ lệ.',
                  ],
                  [
                    'ETH Tinh tuyển',
                    `${protocolFacts.stellarSelectionEthPercentage}%`,
                    `${protocolFacts.ethStellarSelectionRecipients} lượt được chọn từ quỹ nét bút của chu kỳ, chia đều số tiền.`,
                  ],
                  [
                    'Dự trữ tích lũy',
                    `~${protocolFacts.compoundingReservePercentage}% (phần còn lại)`,
                    'Chuyển tiếp vào chu kỳ tiếp theo.',
                  ],
                ],
                footnote:
                  'Tỷ lệ phần trăm được tính trên số dư ETH của giao thức vào khoảnh khắc hoàn tất.',
              },
            },
            {
              kind: 'paragraph',
              text: 'Năm luồng được phân phối cộng lại bằng một nửa dự trữ. Phần còn lại tích lũy: giao thức tích lũy thay vì rút ra, và mỗi chu kỳ mở ra với dự trữ lớn hơn chu kỳ trước. Nếu một chu kỳ hoàn tất mà không có Cosmic Signature NFT nào đang neo giữ, phân phối neo giữ của chu kỳ đó bị bỏ qua và phần của nó cũng tích lũy.',
            },
            {
              kind: 'table',
              table: {
                columns: ['Luồng CST và NFT', 'Phân phối', 'Người nhận'],
                rows: [
                  [
                    'Phân bổ Signature',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT`,
                    'Người nhận của chu kỳ.',
                  ],
                  [
                    'Chiến binh Thời gian',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT`,
                    'Chiến binh Thời gian.',
                  ],
                  [
                    'Quán quân Bền bỉ',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT`,
                    'Quán quân Bền bỉ.',
                  ],
                  [
                    'Nét bút CST cuối cùng',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT`,
                    'Người tham gia đặt nét bút CST sau cùng của chu kỳ.',
                  ],
                  [
                    'NFT Tinh tuyển',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT, ${protocolFacts.nftStellarSelectionRecipients} lần`,
                    `${protocolFacts.nftStellarSelectionRecipients} lượt được chọn từ quỹ nét bút.`,
                  ],
                  [
                    'Tinh tuyển NFT neo giữ',
                    `${cst(protocolFacts.specialAllocationCst)} CST và một NFT, ${protocolFacts.anchoredRwlkNftSelectionRecipients} lần`,
                    `${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt chọn trên các Random Walk NFT đang neo giữ.`,
                  ],
                  [
                    'Dự trữ truyền thông',
                    `${cst(protocolFacts.outreachReserveCst)} CST`,
                    'Truyền thông cộng đồng (Mục 7.1).',
                  ],
                ],
              },
            },
            {
              kind: 'paragraph',
              text: `Vì vậy một chu kỳ điển hình khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST trong các phân phối cố định, cộng với lượng CST tham gia mà các nét bút riêng lẻ đã khắc dọc đường. Chu kỳ không có nét bút CST bỏ qua luồng nét bút CST cuối cùng; chu kỳ không có Random Walk NFT đang neo giữ bỏ qua Tinh tuyển neo giữ.`,
            },
          ],
        },
        'endurance-and-chrono': {
          heading: 'Quán quân Bền bỉ và Chiến binh Thời gian',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Hai luồng đo sự bền bỉ thay vì vị trí. Quán quân Bền bỉ là người tham gia giữ vị trí người đặt nét bút gần nhất trong khoảng liên tục dài nhất của chu kỳ: khoảng lặng dài nhất mà một nét bút đơn lẻ trụ qua. Chiến binh Thời gian ở một tầng cao hơn: người tham gia giữ chính danh hiệu Quán quân Bền bỉ trong khoảng liên tục dài nhất.',
            },
            {
              kind: 'paragraph',
              text: 'Sự khác biệt tinh tế nhưng có thật. Một người tham gia đặt nét bút vào một buổi chiều chậm rãi và không bị thay thế trong mười giờ lập nên một khoảng bền bỉ mạnh. Họ có khép lại chu kỳ với vai trò Chiến binh Thời gian hay không tùy vào kỷ lục đó đứng vững bao lâu trước khi một người tham gia khác vượt qua. Bền bỉ đo khoảng lặng bạn tạo ra; luồng Chrono đo kỷ lục của bạn trụ được bao lâu. Cả hai chỉ được quyết định khi hoàn tất.',
            },
          ],
        },
        'stellar-selections': {
          heading: 'Tinh tuyển',
          blocks: [
            {
              kind: 'paragraph',
              text: `Mỗi nét bút ghi nhận một lượt vào quỹ Tinh tuyển dành cho người tham gia của chu kỳ. Khi hoàn tất, hợp đồng chọn ${protocolFacts.ethStellarSelectionRecipients} lượt cho ETH Tinh tuyển, chia đều ${protocolFacts.stellarSelectionEthPercentage}% dự trữ, và ${protocolFacts.nftStellarSelectionRecipients} lượt cho NFT Tinh tuyển. Các lượt chọn có hoàn lại, nên cùng một người tham gia có thể được chọn nhiều lần, và số lượt tăng theo số nét bút đã đặt: tần suất được chọn tỷ lệ với mức tham gia.`,
            },
            {
              kind: 'paragraph',
              text: `Một Tinh tuyển NFT neo giữ riêng chạy trên các Random Walk NFT đang neo giữ: ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt chọn, cân theo số NFT mỗi người đã neo giữ. Luồng này chỉ phân phối CST và Cosmic Signature NFT; nó không mang ETH.`,
            },
            {
              kind: 'paragraph',
              text: 'Độ ngẫu nhiên phía sau các lượt chọn này được xây trên chuỗi khi hoàn tất. Mục 11.3 mô tả nguồn và hạn chế của nó.',
            },
          ],
        },
        'delivery-and-timeouts': {
          heading: 'Giao nhận, ký quỹ và thời hạn',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Việc phân phối được cố ý chia thành đẩy và kéo. ETH của phân bổ Signature đi thẳng đến người nhận trong lúc hoàn tất, khoản chuyển Hàng hóa công cũng vậy. ETH của Chiến binh Thời gian và các phần ETH Tinh tuyển được đặt vào ví phân bổ, một hợp đồng ký quỹ, từ đó mỗi người nhận nhận về khi thuận tiện. CST và NFT được khắc trực tiếp cho người nhận trong lúc hoàn tất.',
            },
            {
              kind: 'paragraph',
              text: `Phân bổ ký quỹ và tài sản đính kèm chờ ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần. Sau đó, các hợp đồng cho phép bất kỳ ai nhận về một phân bổ chưa được nhận cho chính họ. Quy tắc này phản chiếu cửa sổ hoàn tất mở: không gì trong giao thức chờ mãi một người tham gia vắng mặt, và mọi phân phối cuối cùng đều đến tay người muốn nó. Hãy nhận về kịp thời.`,
            },
          ],
        },
      },
    },
    'the-art': {
      heading: 'Nghệ thuật: những Signature ba vật thể tất định',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Mỗi Cosmic Signature NFT là một bản kết xuất của bài toán ba vật thể hấp dẫn: ba thiên thể có khối lượng tương đương quay quanh nhau dưới lực hấp dẫn Newton. Bài toán ba vật thể không có nghiệm dạng đóng tổng quát, và quỹ đạo của nó là hỗn độn; một thay đổi không thể nhận ra trong điều kiện khởi đầu tạo ra một vũ điệu hoàn toàn khác. Sự hỗn độn đó là động cơ của bộ sưu tập. Seed quyết định điều kiện khởi đầu, vật lý làm phần còn lại, và không hai Signature nào lặp lại.',
        },
        {
          kind: 'paragraph',
          text: 'Không có mô hình tạo sinh nào tham gia ở bất kỳ giai đoạn nào. Không có dữ liệu huấn luyện, không lấy mẫu và không câu lệnh. Quy trình là một mô phỏng vật lý nối tiếp bởi một bộ kết xuất, viết bằng Rust, công bố dưới dạng mã nguồn mở và hoàn toàn tất định.',
        },
      ],
      subsections: {
        'art-pipeline': {
          heading: 'Quy trình',
          blocks: [
            {
              kind: 'list',
              items: [
                'Seed. Lúc khắc, hợp đồng suy ra một seed 32 byte từ dữ liệu trên chuỗi (Mục 11.3) và lưu nó cùng NFT. Seed khởi tạo một bộ tạo số ngẫu nhiên SHA3-256; mọi thứ phía sau là hàm thuần của nó.',
                'Mô phỏng. Một trăm nghìn cấu hình ứng viên được tích phân một triệu bước vật lý mỗi cấu hình, dùng bộ tích phân symplectic Yoshida bậc bốn, vốn bảo toàn hành vi năng lượng của hệ trên những khoảng dài.',
                'Chọn lọc. Một phép tổng hợp xếp hạng Borda chấm điểm các ứng viên theo độ hỗn độn và độ đều cạnh của tam giác mà ba vật thể tạo thành, rồi chọn quỹ đạo thú vị nhất về thị giác từ nhóm.',
                'Máy quay. Một chuyển động máy quay hình elip chậm rãi đưa điểm nhìn xuyên qua quỹ đạo, mang lại cho mỗi Signature hiệu ứng thị sai điện ảnh.',
                'Màu sắc. Màu được pha trong không gian cảm nhận OKLab với độ tách sắc 120 độ cho mỗi vật thể, điều biến bởi độ trôi và một sóng sin.',
                'Kết xuất quang phổ. Sáu mươi tư dải bước sóng trải từ 380 đến 700 nanomet kết xuất các vệt quỹ đạo với độ dày phụ thuộc vận tốc và độ sâu trường ảnh.',
                'Hoàn thiện. Ánh xạ tông AgX, hiệu ứng bloom, các lớp tinh vân OpenSimplex và cân màu hoàn thiện khung hình.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'Đầu ra cho mỗi NFT là một ảnh PNG 16 bit và một video H.265 dài 30 giây.',
            },
          ],
        },
        'reproducibility-and-license': {
          heading: 'Khả năng tái tạo và giấy phép',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Tính tất định được bảo đảm bằng cơ chế, không phải giả định. Cùng một seed tạo ra cùng một hình ảnh, đến từng điểm ảnh, trên bất kỳ máy nào, và mã băm SHA-256 của các khung hình đã tạo được kiểm định trong tích hợp liên tục. Vì mọi seed được lưu trên chuỗi và quy trình là công khai, bộ sưu tập không phụ thuộc vào máy chủ nào. Nếu mọi máy chủ biến mất vào ngày mai, mọi Signature đều có thể tạo lại từ chuỗi.',
            },
            {
              kind: 'paragraph',
              text: 'Chủ sở hữu có thể đặt tên NFT của mình trên chuỗi, tối đa 32 byte. Hợp đồng, shader và quy trình kết xuất thuộc dự án được công bố theo CC0 1.0, không bảo lưu quyền nào; các phụ thuộc bên thứ ba giữ giấy phép riêng của chúng.',
            },
          ],
        },
      },
    },
    cst: {
      heading: 'Token CST',
      blocks: [
        {
          kind: 'paragraph',
          text: 'CST là token ERC-20 của giao thức. Nguồn cung của nó bắt đầu từ không, và hợp đồng token chỉ nhận lệnh khắc và đốt từ hợp đồng giao thức. Mọi CST đang lưu hành đều truy về việc tham gia một chu kỳ.',
        },
      ],
      subsections: {
        'imprint-rules': {
          heading: 'Quy tắc khắc',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST đi vào lưu hành qua ba dòng. CST tham gia được khắc lúc đặt nét bút theo công thức dưới đây. CST ghi nhận được khắc khi hoàn tất: ${cst(protocolFacts.specialAllocationCst)} CST đi cùng mỗi lần phân phối NFT của chu kỳ, ${protocolFacts.typicalNftsPerCycle} lần trong một chu kỳ điển hình. Cuối cùng, ${cst(protocolFacts.outreachReserveCst)} CST mỗi chu kỳ đi vào Dự trữ truyền thông, mà đội ngũ dùng cho truyền thông cộng đồng; đây là dòng CST định kỳ duy nhất đội ngũ điều hướng, và nó không mang quyền đặc biệt nào.`,
            },
            {
              kind: 'formula',
              formula: protocolFacts.dynamicCstRewardFormula,
              caption:
                'CST tham gia được khắc bởi một nét bút. Thời gian trôi qua được đo kể từ nét bút trước và tỷ lệ theo mức tăng thời gian hiện tại của chu kỳ.',
            },
            {
              kind: 'paragraph',
              text: 'Nói đơn giản, lượng này tăng theo căn bậc hai của thời gian kể từ nét bút trước. Một nét bút đến một giây sau nét trước khắc gần như không có gì; một nét bút kết thúc một ngày yên lặng khắc hàng trăm CST.',
            },
            {
              kind: 'table',
              table: {
                columns: ['Thời gian kể từ nét bút trước', 'CST tham gia'],
                rows: protocolFacts.dynamicCstRewardExamples.map((example) => [
                  ELAPSED_VI[example.elapsed] ?? example.elapsed,
                  viDecimal(example.cst),
                ]),
                footnote: `Tính với mức tăng thời gian lúc ra mắt là đúng ${protocolFacts.dynamicCstRewardExamplesAssumeIncrementHours} giờ. Lượng thực tế trôi thấp hơn một chút khi mức tăng lớn dần; bản xem trước trực tiếp trong ứng dụng và hợp đồng là nguồn chính xác.`,
              },
            },
          ],
        },
        'supply-dynamics': {
          heading: 'Đốt và động lực nguồn cung',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST rời khỏi lưu hành mỗi khi được chi: toàn bộ chi phí của mỗi nét bút CST bị đốt. Vì vậy nguồn cung được định hình bởi hành vi. Chu kỳ yên ắng khắc ít CST tham gia, việc dùng CST sôi động đốt nguồn cung xuống, và các dòng ghi nhận và truyền thông cố định thêm một lượng dự đoán được là ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST mỗi chu kỳ điển hình. Không có giới hạn, không khắc trước và không phần dành cho đội ngũ.`,
            },
            {
              kind: 'paragraph',
              text: 'Chính công thức căn bậc hai là một cơ chế kiểm soát nguồn cung, được đưa vào trong nâng cấp V2 (Mục 12.2). Thiết kế ban đầu khắc một mức cố định 100 CST mỗi nét bút, điều khiến các chuỗi nét bút tốc độ máy trở thành nguồn CST mới không giới hạn. Với quy tắc hiện tại, một loạt nét bút dồn dập khắc xấp xỉ không, trong khi sự tham gia kiên nhẫn mới là điều tạo ra nguồn cung.',
            },
          ],
        },
        'coordination-weight': {
          heading: 'Trọng số điều phối',
          blocks: [
            {
              kind: 'paragraph',
              text: 'CST đồng thời là token trọng số của Hội đồng Vũ trụ (Mục 9). Trọng số kích hoạt khi ủy quyền: người nắm giữ ủy quyền cho chính mình hoặc một địa chỉ khác, và từ đó mỗi CST biểu thị một đơn vị trọng số điều phối. Token dùng các điểm kiểm dựa trên dấu thời gian, nên ảnh chụp nhanh của đề xuất tham chiếu thời gian thực thay vì số khối.',
            },
          ],
        },
      },
    },
    anchoring: {
      heading: 'Neo giữ',
      blocks: [
        {
          kind: 'paragraph',
          text: `Neo giữ là hình thức gắn kết dài hạn của giao thức. Chủ sở hữu có thể neo giữ một Cosmic Signature NFT với giao thức; trong khi neo giữ, nó tích lũy một phần theo tỷ lệ của ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ mỗi chu kỳ. ETH tích lũy được nhận về khi gỡ neo. Không có kỳ hạn cố định và không có phạt, nhưng neo giữ là quyết định một lần cho mỗi NFT: mỗi NFT chỉ được neo giữ đúng một lần, nên gỡ neo chấm dứt vĩnh viễn khả năng neo giữ của NFT đó.`,
        },
        {
          kind: 'paragraph',
          text: 'Quy tắc một-lần-duy-nhất thay lịch khóa thông thường bằng một lựa chọn không thể đảo ngược, và nó cho tập hợp đang neo giữ một cái giá thực sự khi rời đi. Giữ một NFT neo giữ là quyết định sống động mỗi chu kỳ; gỡ neo là quyết định vĩnh viễn.',
        },
        {
          kind: 'paragraph',
          text: `Random Walk NFT neo giữ riêng và với mục đích khác: Random Walk NFT đang neo giữ nhận các lượt chọn trong Tinh tuyển NFT neo giữ (Mục 5.3), ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt mỗi chu kỳ, mỗi lượt mang ${cst(protocolFacts.specialAllocationCst)} CST và một Cosmic Signature NFT. Neo giữ Random Walk không mang phân phối ETH. Cùng quy tắc một-lần-duy-nhất được áp dụng.`,
        },
      ],
    },
    'cosmic-council': {
      heading: 'Hội đồng Vũ trụ',
      blocks: [
        {
          kind: 'paragraph',
          text: `Hội đồng Vũ trụ là cơ quan điều phối trên chuỗi của giao thức, xây trên khung Governor đã được kiểm toán của OpenZeppelin với CST làm token trọng số. Bất kỳ địa chỉ nào nắm ít nhất ${protocolFacts.councilProposalThresholdCst} CST trọng số được ủy quyền đều có thể gửi một đề xuất điều phối. Đề xuất chờ qua độ trễ điều phối ${protocolFacts.councilVotingDelayDays} ngày, rồi mở trong giai đoạn điều phối ${protocolFacts.councilVotingPeriodWeeks} tuần.`,
        },
        {
          kind: 'paragraph',
          text: `Một đề xuất được thông qua khi hai điều kiện đồng thời đúng: tán thành vượt phản đối, và trọng số tán thành cộng bỏ trống chạm túc số điều phối ${protocolFacts.councilQuorumPercent}% tổng cung CST. Trọng số phản đối không được tính vào túc số. Bày tỏ trọng số là một hành động mật mã, không phải cổ phần hay công cụ vốn, và việc ủy quyền có thể thay đổi bất cứ lúc nào.`,
        },
        {
          kind: 'paragraph',
          text: 'Hôm nay Hội đồng điều phối song song với vai trò chủ sở hữu có giới hạn của đội ngũ. Sau bước phi tập trung của Mục 13, đó là lớp điều phối duy nhất mà giao thức có.',
        },
      ],
    },
    'public-goods': {
      heading: 'Hàng hóa công',
      blocks: [
        {
          kind: 'paragraph',
          text: `Mỗi chu kỳ chuyển ${protocolFacts.publicGoodsPercentage}% Dự trữ chu kỳ đến Kho Hàng hóa công, mà đơn vị thụ hưởng hiện là Protocol Guild, cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho giao thức Ethereum. Việc chuyển tiếp được thực thi trên chuỗi như một phần của hoàn tất; không ai quyết định mỗi chu kỳ có tôn trọng nó hay không. Giao thức càng được sử dụng nhiều, càng nhiều giá trị chảy về hạ tầng mà chính Ethereum nương tựa vào.`,
        },
        {
          kind: 'paragraph',
          text: 'Lý lẽ rất đơn giản. Cosmic Signature tồn tại vì lớp nền của Ethereum tiếp tục hoạt động, và một giao thức sống trên hạ tầng công cộng nên tài trợ cho nó theo cách nó làm mọi việc khác: cơ học, theo lịch, công khai. Kho cũng nhận các khoản đóng góp ETH tự nguyện trực tiếp, ngoài bất kỳ chu kỳ nào.',
        },
        {
          // lexicon-allow-start: tax-status disclaimer must name the concepts it denies.
          kind: 'note',
          text: 'Đây là việc chuyển tiếp ETH đến một địa chỉ hàng hóa công, hiện là Protocol Guild. Đây không phải là khoản đóng góp từ thiện hay quyên góp theo nghĩa thuế của Hoa Kỳ, và Cosmic Signature không đưa ra cam kết nào về cách xử lý thuế của nó ở bất kỳ khu vực pháp lý nào.',
          // lexicon-allow-end
        },
      ],
    },
    security: {
      heading: 'Bảo mật, độ ngẫu nhiên và khả năng xác minh',
      blocks: [],
      subsections: {
        'independent-review': {
          heading: 'Rà soát độc lập',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Cuối năm 2025, Hacken đã thực hiện một cuộc rà soát bảo mật độc lập các hợp đồng Cosmic Signature, bao gồm giao thức cốt lõi, token CST, cả hai tích hợp NFT, các ví neo giữ, cùng các hợp đồng ví và quản lý hệ thống hỗ trợ. Báo cáo cuối cùng, công bố vào tháng 1 năm 2026, liệt kê 23 phát hiện: không có mức nghiêm trọng, không có mức cao, 3 trung bình, 8 thấp và 12 mang tính thông tin, phần lớn là những cân nhắc thiết kế đã được xem xét và chấp nhận với lý do bằng văn bản.',
            },
            {
              kind: 'paragraph',
              text: 'Bên cạnh rà soát thủ công, Hacken đã kiểm thử fuzz 14 bất biến của hệ thống, những thuộc tính như số dư ETH của giao thức luôn bằng số đã nạp trừ số đã phân phối. Cả 14 đều giữ vững qua 10.000 lượt chạy. Báo cáo đầy đủ là công khai và được liên kết trong phần tham chiếu.',
            },
            {
              kind: 'paragraph',
              text: 'Ngoài rà soát bên ngoài, kho mã mang các đặc tả kiểm chứng hình thức Certora, cấu hình SMTChecker của Solidity, phân tích tĩnh Slither và một bộ kiểm thử nhắm đến độ phủ hoàn toàn các mã nguồn Solidity.',
            },
          ],
        },
        'defensive-design': {
          heading: 'Thiết kế phòng vệ',
          blocks: [
            {
              kind: 'list',
              items: [
                'Bộ chặn tái nhập bảo vệ mọi điểm vào bên ngoài của hợp đồng cốt lõi.',
                'Kéo thay cho đẩy: các phân bổ ETH phụ và tài sản đính kèm nằm trong ký quỹ thay vì được gửi trong lúc hoàn tất, nên không hợp đồng người nhận nào có thể chặn một chu kỳ khép lại.',
                'Chuyển tiếp chịu lỗi: nếu khoản chuyển Hàng hóa công không thể hoàn thành, hoàn tất vẫn tiến hành và sự kiện được ghi lại để xử lý sau.',
                'Khóa giữa các chu kỳ: thay đổi tham số cốt lõi và nâng cấp hợp đồng là bất khả trong khi một chu kỳ đang chạy (Mục 13).',
              ],
            },
          ],
        },
        randomness: {
          heading: 'Độ ngẫu nhiên',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Giao thức cần độ ngẫu nhiên hai lần: cho các lượt chọn Tinh tuyển khi hoàn tất và cho seed của mỗi NFT mới. Nó xây một seed trên chuỗi bằng cách gộp mã băm khối trước, phí cơ sở hiện tại và entropy riêng của Arbitrum từ các precompile ArbSys và ArbGasInfo: mã băm khối Arbitrum trước, lượng gas tồn đọng và các bộ đếm định giá L1. Các giá trị riêng lẻ sau đó được rút từ seed này bằng keccak256. Các lời gọi precompile chịu lỗi; nếu một lời gọi không khả dụng, cấu trúc dùng các nguồn còn lại.',
            },
            {
              kind: 'paragraph',
              text: 'Đây là chủ nghĩa tối giản có chủ đích: không oracle, không ủy ban bên ngoài, không callback có thể làm kẹt một chu kỳ. Sự cân nhắc được nêu thẳng. Về nguyên tắc, sequencer có thể ảnh hưởng đến các đầu vào cấp khối, và thiết kế giới hạn phạm vi mà ảnh hưởng đó có thể chạm tới. Các lượt chọn Tinh tuyển và seed nghệ thuật là những nơi duy nhất tiêu thụ độ ngẫu nhiên; đếm ngược, chuỗi chi phí nét bút và mọi tỷ lệ trong Mục 5 đều tất định. Cấu trúc được dùng một lần mỗi lần hoàn tất, và hoàn tất là một giao dịch công khai bất kỳ ai cũng có thể gửi.',
            },
          ],
        },
        'open-verification': {
          heading: 'Xác minh mở',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Mọi hợp đồng đều được xác minh mã nguồn với trạng thái khớp chính xác trên Sourcify cho Arbitrum One (chuỗi 42161), tại các địa chỉ cố định trong Phụ lục A. Tính tất định của quy trình nghệ thuật được kiểm định trong tích hợp liên tục bằng mã băm SHA-256 của các khung hình đã kết xuất. Mã thuộc dự án là CC0: bất kỳ ai cũng có thể phân nhánh hợp đồng, bộ kết xuất hay trang web, và bất kỳ ai cũng có thể kiểm tra bất kỳ Signature nào bằng cách tạo lại nó từ seed.',
            },
          ],
        },
      },
    },
    'upgrade-history': {
      heading: 'Lịch sử triển khai và con đường phía trước',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature được thiết kế để hoàn thành. Khả năng nâng cấp tồn tại để cơ chế có thể được hiệu chỉnh theo hành vi quan sát được trong giai đoạn đầu đời của giao thức, và nó kết thúc khi thiết kế kết thúc. Mục này ghi lại những gì đã triển khai và những gì còn lại.',
        },
      ],
      subsections: {
        v1: {
          heading: 'V1: Ra mắt',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V1 ra mắt giao thức trên Arbitrum One sau một proxy có thể nâng cấp UUPS: chu kỳ, nét bút, các luồng phân bổ, neo giữ, Hội đồng và quy trình nghệ thuật, về cơ bản như mô tả trong bài viết này. Nâng cấp yêu cầu chủ sở hữu và chỉ có thể diễn ra giữa các chu kỳ. Cố ý không có cơ chế nào để thay đổi hợp đồng giữa chu kỳ, bất kể hoàn cảnh.',
            },
          ],
        },
        v2: {
          heading: 'Nâng cấp V2, đang vận hành hôm nay',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V2 là bản triển khai đang chạy hôm nay. Nó thực hiện năm thay đổi, mỗi thay đổi là một phản hồi trước hành vi quan sát được hoặc dự kiến.',
            },
            {
              kind: 'list',
              items: [
                'CST tham gia động. Mức cố định 100 CST mỗi nét bút trở thành công thức căn bậc hai của Mục 7.1. Khắc cố định biến các chuỗi nét bút dồn dập thành CST không tốn chi phí; quy tắc mới khắc theo sự kiên nhẫn, không theo tần suất.',
                'Bảo đảm khắc tối thiểu. Mọi phương thức nét bút có thêm một tham số cho lượng CST tham gia nhỏ nhất mà người tham gia chấp nhận, bảo vệ họ trước những dịch chuyển thời gian giữa lúc ký và lúc thực thi.',
                'Một cửa sổ hiệu chỉnh CST sống. Thời lượng của cửa sổ trở thành một giá trị được lưu, phản ứng theo cơ cấu nét bút (Mục 4.3), để hai đường ETH và CST giữ cân bằng cho nhau.',
                `Cửa sổ độc quyền dài hơn. Cửa sổ hoàn tất độc quyền của người đặt nét bút cuối cùng tăng từ 24 lên ${protocolFacts.finalGestureExclusivityHours} giờ.`,
                'Siết chặt thời gian và phép tính. Việc kéo dài đếm ngược nay luôn áp lên thời điểm hoàn tất đã lưu, đóng một lỗ hổng trong đó những nét bút CST gần như không tốn chi phí đặt sau khi hết hạn có thể liên tục đẩy thời hạn ra xa. Phép tính lên lịch chu kỳ tiếp theo cũng được siết chặt để không cấu hình tham số nào, dù cực đoan đến đâu, có thể ngăn một chu kỳ hoàn tất.',
              ],
            },
          ],
        },
        v3: {
          heading: 'Nâng cấp V3 dự kiến',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V3, hiện đang được phát triển trong kho mã công khai, thay đổi đúng một điều: giá của việc hành động muộn. Trong 20 phút cuối trước thời điểm hoàn tất chu kỳ, mọi chi phí nét bút, dù ETH, ETH kèm Random Walk NFT hay CST, được nhân với một hệ số cộng thêm tăng theo đa thức từ 1 lần lên 10 lần, chạm 10 lần tại thời hạn và giữ ở đó cho bất kỳ nét bút nào đặt trong giờ bù.',
            },
            {
              kind: 'formula',
              formula: 'm(t) = 1 + 9 \u00b7 (t / T)^8, với T = 20 phút',
              caption:
                'Hệ số cộng thêm chi phí cuối chu kỳ, với t là thời gian đã trôi qua trong cửa sổ 20 phút cuối.',
            },
            {
              kind: 'paragraph',
              text: 'Số mũ quan trọng. Vì đường tăng là bậc tám, hệ số gần như vô hình trong phần lớn cửa sổ và chỉ dốc lên ở những phút cuối: khoảng 1,04 lần mười phút trước thời hạn, khoảng 1,9 lần khi còn năm phút, khoảng 7 lần khi còn một phút, và 10 lần ở không.',
            },
            {
              kind: 'paragraph',
              text: 'Ý định là thay đổi giai đoạn cuối. Dưới V2, chờ đến những giây cuối để đặt nét bút gần như không tốn gì, nên một chu kỳ có thể kết thúc trong một loạt các nước đi canh thời gian ít ý nghĩa. Dưới V3, một nét bút phút chót là một tuyên bố đắt giá, sự tham gia bền vững xuyên chu kỳ tương đối rẻ, và các luồng bền bỉ của Mục 5.2 trở nên khó bị tập kích hơn nhiều. Các tham số chính xác có thể còn được tinh chỉnh trước khi triển khai; cơ chế đúng như đã mô tả.',
            },
          ],
        },
      },
    },
    decentralization: {
      heading: 'Con đường đến phi tập trung hoàn toàn',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Giao thức hiện có một chủ sở hữu: địa chỉ đã triển khai nó. Vai trò này là thật, và bài viết này không hạ thấp nó. Nó cũng hẹp theo cấu trúc và tạm thời theo cam kết.',
        },
        {
          kind: 'paragraph',
          text: 'Trong khi một chu kỳ đang chạy, các tham số cốt lõi bị khóa. Chủ sở hữu không thể thay đổi tỷ lệ, mức tăng hay chi phí giữa chu kỳ, và không thể nâng cấp hợp đồng; hành động của chủ sở hữu nằm ở khoảng trống giữa các chu kỳ. Ba quyền kiểm soát hẹp hơn vẫn khả dụng bất cứ lúc nào: lùi thời điểm kích hoạt của một chu kỳ sắp tới, nhưng chỉ đến khi nét bút đầu tiên của nó xuất hiện; điều chỉnh độ trễ trước chu kỳ tiếp theo; và quản lý các hợp đồng ngoại vi, tức đơn vị thụ hưởng của Kho Hàng hóa công, URI siêu dữ liệu NFT và thời hạn nhận về của ký quỹ. Không quyền nào của chủ sở hữu chạm tới phân bổ ký quỹ, NFT đã khắc, seed đã ghi hay số dư CST của bất kỳ ai, và không ví nào của đội ngũ nhận ETH từ nét bút.',
        },
        {
          kind: 'paragraph',
          text: 'Những quyền này tồn tại vì cơ chế còn mới. V2 tồn tại vì hành vi thực tế dạy những bài học không mô phỏng nào bắt được, và V3 tồn tại vì cùng lý do. Một giai đoạn điều chỉnh có giới hạn, công khai là cách thiết kế được hoàn thành. Quyền mạnh nhất trong danh sách là chính việc nâng cấp, và ngay cả nó cũng công khai: một bản triển khai mới hiển thị và có thể xác minh trên chuỗi trước khi chu kỳ tiếp theo bắt đầu.',
        },
        {
          kind: 'paragraph',
          text: 'Nó kết thúc như sau. Khi các nâng cấp còn lại hoàn thành, bắt đầu từ V3, và cơ chế cùng thiết kế token được xem là cuối cùng, quyền kiểm soát đặc quyền sẽ được loại bỏ hoàn toàn khỏi địa chỉ triển khai. Vai trò chủ sở hữu sẽ rời khỏi người triển khai vĩnh viễn, bằng cách chuyển cho Hội đồng Vũ trụ hoặc từ bỏ hoàn toàn, với cơ chế chính xác được thông báo trước. Từ thời điểm đó, không bên tư nhân nào có thể nâng cấp giao thức hay thay đổi tham số của nó, và địa chỉ triển khai không nắm gì mà bất kỳ địa chỉ nào khác không có. Những gì còn lại là giao thức như đã triển khai, Hội đồng làm lớp điều phối, và nghệ thuật.',
        },
        {
          kind: 'paragraph',
          text: 'Mỗi bước của quá trình này đều hiển thị công khai trên chuỗi, kể cả bước cuối.',
        },
      ],
    },
    clarifications: {
      heading: 'Giải đáp và các yếu tố rủi ro',
      blocks: [],
      subsections: {
        'what-it-is-not': {
          heading: 'Cosmic Signature không phải là gì',
          blocks: [
            // lexicon-allow-start: denial copy must name the concepts it denies, matching FAQ practice.
            {
              kind: 'paragraph',
              text: 'Cosmic Signature không phải xổ số, sòng bạc hay sản phẩm cờ bạc. Không có nhà cái, không có người chia bài và không có cược. Người tham gia trao đổi giá trị để lấy chính sự tham gia: mỗi nét bút là một hành động biểu đạt định hình tác phẩm, kéo dài chu kỳ và được ghi vĩnh viễn trên chuỗi. Giao thức không giữ lại bất kỳ biên lợi nào của người điều hành; mọi luồng phân bổ trong Mục 5 đều chảy đến người tham gia, các NFT đang neo giữ, dự trữ tích lũy hoặc hàng hóa công.',
            },
            {
              kind: 'paragraph',
              text: 'Cosmic Signature không phải sản phẩm đầu tư, và không gì trong bài viết này là lời khuyên đầu tư hay lời chào bán chứng khoán. CST và Cosmic Signature NFT là những vật phẩm tham gia và nghệ thuật. Giao thức không hứa hẹn gì về giá, thanh khoản hay giá trị tương lai của chúng, và không ai nên có chúng với kỳ vọng lợi nhuận từ công sức của người khác.',
            },
            // lexicon-allow-end
          ],
        },
        'risk-factors': {
          heading: 'Các yếu tố rủi ro',
          blocks: [
            {
              kind: 'list',
              items: [
                'Rủi ro hợp đồng thông minh. Các hợp đồng đã được rà soát, phân tích hình thức và xác minh mã nguồn, và không điều nào trong đó là bảo đảm. Những khiếm khuyết chưa biết có thể tồn tại trong bất kỳ phần mềm nào giữ giá trị.',
                'Hạn chế của độ ngẫu nhiên. Các lượt chọn Tinh tuyển dùng entropy suy từ khối (Mục 11.3). Về nguyên tắc, sequencer có thể ảnh hưởng đến nó; thiết kế giới hạn hậu quả nhưng không thể loại bỏ chúng.',
                `Trách nhiệm về thời gian. Cửa sổ hoàn tất ${protocolFacts.finalGestureExclusivityHours} giờ và thời hạn ký quỹ ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần là những thời hạn có thật. Phân bổ chưa được nhận về sau các thời hạn đó trở thành khả dụng cho người khác, theo thiết kế.`,
                'Thay đổi tham số. Đến khi bước phi tập trung hoàn tất, tham số có thể thay đổi giữa các chu kỳ như mô tả ở Mục 13. Mọi thay đổi đều công khai trước khi chu kỳ tiếp theo bắt đầu.',
                'Biến động tài sản. Giá trị của ETH, CST và NFT dao động. Tham gia tốn tiền thật; hãy coi nét bút là khoản chi cho sự tham gia và nghệ thuật, không phải con đường đến lợi ích tài chính.',
                'Bất định về quy định. Cách xử lý pháp lý đối với tài sản số khác nhau theo khu vực pháp lý và tiếp tục thay đổi.',
              ],
            },
          ],
        },
      },
    },
    conclusion: {
      heading: 'Kết luận',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature là một nỗ lực xây dựng một giao thức nghệ thuật tạo sinh không cần sự cho phép của ai và, cuối cùng, không cần ai chăm sóc. Cơ chế đủ nhỏ để đặc tả trọn vẹn: những cửa sổ chi phí giảm dần, một đếm ngược mà nét bút kéo dài, các tỷ lệ phân bổ cố định, một dự trữ tích lũy, và nghệ thuật là hàm thuần của vật lý và một seed. Những nâng cấp còn lại là ít và công khai. Khi chúng hoàn thành, vai trò chủ sở hữu biến mất, và những gì còn lại là điều bài viết này mô tả: một đồng hồ, một dự trữ, một token, một hội đồng, và một chuỗi Signature không đứt đoạn, mỗi Signature là bản ghi của những bàn tay đã định hình nó.',
        },
      ],
    },
    'appendix-a': {
      heading: 'Phụ lục A: Địa chỉ hợp đồng đã xác minh',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Hợp đồng', 'Địa chỉ (Arbitrum One)'],
            rows: [
              ['Hợp đồng giao thức (proxy)', protocolFacts.contractAddresses.proxy],
              ['Bản triển khai giao thức (V2)', protocolFacts.contractAddresses.implementation],
              ['Token CST', protocolFacts.contractAddresses.cstToken],
              ['Cosmic Signature NFT', protocolFacts.contractAddresses.cosmicSignatureNft],
              ['Random Walk NFT', protocolFacts.contractAddresses.randomWalkNft],
              ['Hội đồng Vũ trụ', protocolFacts.contractAddresses.cosmicCouncil],
              ['Kho Hàng hóa công', protocolFacts.contractAddresses.publicGoodsVault],
              ['Dự trữ truyền thông', protocolFacts.contractAddresses.outreachReserve],
              ['Ví phân bổ', protocolFacts.contractAddresses.allocationsWallet],
              [
                'Ví neo giữ, Cosmic Signature NFT',
                protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
              ],
              ['Ví neo giữ, Random Walk NFT', protocolFacts.contractAddresses.rwlkAnchoringWallet],
            ],
            footnote:
              'Mọi hợp đồng đều được xác minh khớp chính xác trên Sourcify cho chuỗi 42161. Địa chỉ proxy là địa chỉ vĩnh viễn của giao thức; các bản triển khai chỉ thay đổi qua quy trình nâng cấp công khai mô tả ở các Mục 12 và 13.',
          },
        },
      ],
    },
    'appendix-b': {
      heading: 'Phụ lục B: Các tham số trong nháy mắt',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Tham số', 'Giá trị'],
            rows: [
              [
                'Chi phí mở đầu, chu kỳ đầu tiên',
                `${viDecimal(protocolFacts.initialGestureCostEth)} ETH (cố định)`,
              ],
              [
                'Trần cửa sổ hiệu chỉnh ETH',
                `${protocolFacts.ethCalibrationCeilingMultiplier} lần chi phí mở đầu đã trả của chu kỳ trước`,
              ],
              [
                'Sàn cửa sổ hiệu chỉnh ETH',
                `trần / ${protocolFacts.ethCalibrationFloorDivisor}, cộng một wei`,
              ],
              [
                'Bước tăng chi phí nét bút ETH',
                `${protocolFacts.ethGestureCostStepUpPercent}% mỗi nét bút ETH, cộng một wei`,
              ],
              [
                'Mức giảm với Random Walk NFT',
                `${protocolFacts.randomWalkDiscountPercentage}%, một lần duy nhất cho mỗi NFT`,
              ],
              [
                'Trần cửa sổ hiệu chỉnh CST',
                `max(${protocolFacts.cstCalibrationCeilingMultiplier} lần chi phí CST trả gần nhất, ${protocolFacts.cstCalibrationCeilingMinCst} CST)`,
              ],
              ['Sàn cửa sổ hiệu chỉnh CST', `${protocolFacts.cstCalibrationFloorCst} CST`],
              [
                'Thời lượng cửa sổ hiệu chỉnh CST',
                `mốc tham chiếu ban đầu ${protocolFacts.initialCstCalibrationWindowHours} giờ; khoảng \u2212${percent(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture)}% mỗi nét bút ETH, +${percent(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture)}% mỗi nét bút CST`,
              ],
              [
                'Đếm ngược ban đầu sau nét bút mở',
                `khoảng ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ lúc ra mắt`,
              ],
              [
                'Mức tăng thời gian mỗi nét bút',
                `${protocolFacts.initialCycleTimeIncrementHours} giờ lúc ra mắt, lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% mỗi chu kỳ`,
              ],
              ['Cửa sổ hoàn tất độc quyền', `${protocolFacts.finalGestureExclusivityHours} giờ`],
              [
                'Thời hạn nhận về ký quỹ',
                `${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, sau đó nhận về mở`,
              ],
              ['Giới hạn lời nhắn nét bút', `${protocolFacts.gestureMessageMaxLength} byte`],
              [
                'Các luồng phân bổ ETH',
                `${protocolFacts.mainEthPercentage}% Signature, ${protocolFacts.chronoWarriorEthPercentage}% Chiến binh Thời gian, ${protocolFacts.publicGoodsPercentage}% Hàng hóa công, ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ, ${protocolFacts.stellarSelectionEthPercentage}% ETH Tinh tuyển`,
              ],
              [
                'Dự trữ tích lũy',
                `khoảng ${protocolFacts.compoundingReservePercentage}% chuyển tiếp`,
              ],
              [
                'CST ghi nhận mỗi lần phân phối NFT',
                `${cst(protocolFacts.specialAllocationCst)} CST`,
              ],
              ['Dự trữ truyền thông mỗi chu kỳ', `${cst(protocolFacts.outreachReserveCst)} CST`],
              [
                'Lần khắc điển hình mỗi chu kỳ',
                `${protocolFacts.typicalNftsPerCycle} NFT, ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST cố định`,
              ],
              [
                'Tham số Hội đồng',
                `ngưỡng đề xuất ${protocolFacts.councilProposalThresholdCst} CST, độ trễ ${protocolFacts.councilVotingDelayDays} ngày, giai đoạn ${protocolFacts.councilVotingPeriodWeeks} tuần, túc số ${protocolFacts.councilQuorumPercent}%`,
              ],
              [
                'Độ trễ trước chu kỳ tiếp theo',
                `mặc định ${protocolFacts.defaultNextCycleDelayMinutes} phút, chủ sở hữu có thể điều chỉnh`,
              ],
            ],
            footnote:
              'Giá trị lúc ra mắt được hiển thị khi một tham số biến đổi hoặc có thể điều chỉnh; các hợp đồng báo cáo giá trị trực tiếp.',
          },
        },
      ],
    },
  },
  references: {
    heading: 'Tham chiếu',
    items: [
      {
        label: 'Kho mã hợp đồng Cosmic Signature (mã nguồn, kiểm thử, công cụ xác minh)',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature',
      },
      {
        label: 'Ứng dụng Cosmic Signature',
        href: 'https://app.cosmicsignature.com',
      },
      {
        label: 'Trang giao thức Cosmic Signature',
        href: 'https://cosmicsignature.com',
      },
      {
        label: 'Rà soát bảo mật của Hacken đối với các hợp đồng Cosmic Signature, tháng 1 năm 2026',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
      },
      {
        label: 'Tài liệu Protocol Guild',
        href: 'https://protocol-guild.readthedocs.io',
      },
      {
        label: 'Tài liệu OpenZeppelin Governor',
        href: 'https://docs.openzeppelin.com/contracts/5.x/governance',
      },
      {
        label: 'Arbitrum One',
        href: 'https://arbitrum.io',
      },
    ],
  },
  licenseNote:
    'Bài viết này, như mọi tài liệu thuộc dự án Cosmic Signature, được đưa vào phạm vi công cộng theo CC0 1.0.',
} satisfies WhitePaperText;
