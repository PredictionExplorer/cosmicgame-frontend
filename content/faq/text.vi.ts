import { protocolFacts } from '@/content/protocol-facts';

import type { FAQText } from './structure';

const ELAPSED_VI: Record<
  (typeof protocolFacts.dynamicCstRewardExamples)[number]['elapsed'],
  string
> = {
  '0 seconds': '0 giây',
  '1 second': '1 giây',
  '60 seconds': '60 giây',
  '1 hour': '1 giờ',
  '1 day': '1 ngày',
};

/** Vietnamese decimal mark for a protocol figure quoted in English notation ("1.73"). */
const viDecimal = (value: string): string => value.replace('.', ',');

const cstAmount = protocolFacts.specialAllocationCst.toLocaleString('vi-VN');
const outreachCst = protocolFacts.outreachReserveCst.toLocaleString('vi-VN');
const cstWindowDecrease =
  protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture.toLocaleString('vi-VN');
const cstWindowIncrease =
  protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture.toLocaleString('vi-VN');

/** Vietnamese FAQ copy, keyed by the skeleton in structure.ts. */
export const faqTextVi = {
  'getting-started': {
    title: 'Bắt đầu',
    description: 'Những điều cơ bản về Cosmic Signature và cách tham gia',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature là gì?',
        answer:
          'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Người tham gia đặt nét bút trong một chu kỳ trình diễn; mỗi nét bút đều định hình Signature cuối cùng của chu kỳ. Khi chu kỳ hoàn tất, giao thức phân phối dự trữ của mình qua hơn mười luồng phân bổ — bao gồm Protocol Guild, cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum.',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature có liên quan đến cơ sở dữ liệu sinh học COSMIC không?',
        answer:
          'Không. Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức và ứng dụng nghệ thuật trên chuỗi tập trung vào nghệ thuật NFT ba vật thể tất định.',
      },
      'how-does-the-bidding-game-work': {
        question: 'Một chu kỳ trình diễn hoạt động như thế nào?',
        answer: `Mỗi chu kỳ mở ra với một cửa sổ hiệu chỉnh ETH cho nét bút đầu tiên. Nét bút đầu tiên đó khởi động thời điểm hoàn tất chu kỳ, hiện mặc định khoảng 24 giờ. Các nét bút tiếp theo bằng ETH hoặc CST cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất đã lưu, với mức tăng khởi đầu là một giờ và lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất. Khi đếm ngược hoàn tất về 0, người tham gia đặt nét bút cuối cùng có một cửa sổ ưu tiên ${protocolFacts.finalGestureExclusivityHours} giờ để hoàn tất chu kỳ và nhận về phân bổ Signature; vẫn có thể đặt nét bút cho đến khi chu kỳ thực sự được hoàn tất.`,
      },
      'what-type-of-gestures-are-available': {
        question: 'Có những loại nét bút nào?',
        answer:
          'Nét bút có thể đặt bằng ETH hoặc token CST (ERC-20). Nét bút đầu tiên của mỗi chu kỳ phải là nét bút ETH; sau đó, nét bút ETH và CST có thể xen kẽ tự do. Bạn cũng có thể đính kèm một Random Walk NFT vào nét bút ETH để được giảm 50% chi phí nét bút ETH. Cosmic Signature NFT (ERC-721) là tài sản phân bổ và neo giữ; chúng không được chấp nhận làm phương thức thanh toán cho nét bút. Nét bút CST dùng cửa sổ hiệu chỉnh riêng: chi phí nét bút CST giảm dần khi cửa sổ chạy, và độ dài cửa sổ tự thay đổi sau mỗi nét bút ETH hoặc CST.',
      },
      'can-i-participate-without-nfts': {
        question: 'Tôi có thể tham gia nếu không sở hữu NFT nào không?',
        answer:
          'Có. Bất kỳ ai cũng có thể tham gia một chu kỳ trình diễn Cosmic Signature bằng cách đặt nét bút. Một Random Walk NFT chưa sử dụng có thể được đính kèm vào nét bút ETH để giảm 50% chi phí nét bút.',
      },
      'how-can-i-get-involved': {
        question: 'Tôi có thể tham gia bằng cách nào?',
        answer:
          'Bạn có thể tham gia bằng cách đặt nét bút trong một chu kỳ trình diễn, hoặc đóng góp một NFT từ dự án của bạn để đính kèm vào nét bút của người tham gia. Hãy tham gia Discord để gặp những người tham gia khác.',
      },
      'how-long-does-each-round-last': {
        question: 'Mỗi chu kỳ trình diễn kéo dài bao lâu?',
        answer: `Mỗi chu kỳ bắt đầu khi nét bút ETH đầu tiên được đặt, khởi động thời điểm hoàn tất chu kỳ ở khoảng 24 lần mức tăng thời gian hiện tại (khoảng một ngày khi ra mắt). Mỗi nét bút sau đó cộng thêm mức tăng thời gian hiện tại, vốn khởi đầu ở đúng một giờ và lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất. Vì vậy một chu kỳ có thể kéo dài hơn một ngày rất nhiều nếu nét bút liên tục xuất hiện trước khi hoàn tất.`,
      },
      'can-i-place-multiple-gestures': {
        question: 'Tôi có thể đặt nhiều nét bút trong một chu kỳ không?',
        answer:
          'Có. Mỗi nét bút có thể khắc CST tham gia vào ví của bạn, tăng số lượt của bạn trong Tinh tuyển và định hình Signature đang biến chuyển của chu kỳ. Lượng CST tham gia thay đổi theo thời gian kể từ nét bút trước. Khoảng cách dài hơn cho lượng CST được khắc lớn hơn so với hai nét bút nối tiếp sát nhau.',
      },
    },
  },
  'allocations-and-rewards': {
    title: 'Phân bổ và phân phối',
    description: 'Người tham gia có thể nhận gì khi chu kỳ hoàn tất',
    items: {
      'what-is-the-main-allocation': {
        question: 'Phân bổ Signature là gì?',
        answer:
          'Phân bổ Signature thuộc về người tham gia đặt nét bút cuối cùng của một chu kỳ. Nó bao gồm một Cosmic Signature NFT, 1.000 CST ghi nhận và 25% Dự trữ chu kỳ bằng ETH, cộng với mọi token hoặc NFT được đính kèm vào nét bút của người tham gia trong chu kỳ.',
      },
      'what-rewards-per-bid': {
        question: 'Tôi nhận được gì cho mỗi nét bút?',
        answer: `Mỗi nét bút ghi nhận một lượt trong Tinh tuyển cuối chu kỳ, cập nhật thời gian dẫn đầu liên quan đến Quán quân Bền bỉ và Chiến binh Thời gian, và có thể khắc CST tham gia. CST tham gia được tính theo công thức căn bậc hai: ${protocolFacts.dynamicCstRewardFormula}. Nói đơn giản, lượng này tăng theo thời gian kể từ nét bút trước, nhưng với tốc độ chậm dần. Nét bút quá dồn dập có thể nhận 0 CST; một khoảng cách dài hơn có thể tạo ra lần khắc CST lớn hơn nhiều.`,
      },
      'how-does-the-stellarSelection-work': {
        question: 'Tinh tuyển hoạt động như thế nào?',
        answer: `Mỗi nét bút ghi nhận một lượt Tinh tuyển. Cuối mỗi chu kỳ, hợp đồng thông minh chọn ngẫu nhiên các lượt từ quỹ: ${protocolFacts.ethStellarSelectionRecipients} lượt chia ${protocolFacts.stellarSelectionEthPercentage}% Dự trữ chu kỳ bằng ETH, ${protocolFacts.nftStellarSelectionRecipients} lượt mỗi lượt nhận ${cstAmount} CST và một Cosmic Signature NFT, và ${protocolFacts.anchoredRwlkNftSelectionRecipients} lượt trong số các Random Walk NFT đang neo giữ cũng nhận ${cstAmount} CST và Cosmic Signature NFT. Các lượt chọn có hoàn lại, nên cùng một địa chỉ có thể được chọn nhiều lần trong một chu kỳ. Tần suất được chọn tăng theo số nét bút bạn đặt.`,
      },
      'how-random-selection-works': {
        question: 'Việc chọn ngẫu nhiên được thực hiện thế nào?',
        answer:
          'Tinh tuyển dùng các nguồn ngẫu nhiên trên chuỗi tại thời điểm hoàn tất chu kỳ, gồm bối cảnh khối do Arbitrum cung cấp và các nguồn entropy dự phòng. Tinh tuyển dành cho người tham gia tính theo lượt: mỗi nét bút thêm một lượt, nên càng nhiều nét bút thì tần suất được chọn càng cao. Tinh tuyển NFT neo giữ là một cơ chế riêng, dựa trên diện Random Walk NFT đang neo giữ thay vì quỹ lượt nét bút của người tham gia.',
      },
      'how-do-i-claim-my-allocation': {
        question: 'Tôi nhận về phân bổ bằng cách nào nếu là người nhận?',
        answer: `Người nhận nhận về phân bổ thông qua ứng dụng và các hợp đồng giao thức. Người đặt nét bút cuối cùng có ${protocolFacts.finalGestureExclusivityHours} giờ ưu tiên sau thời điểm hoàn tất chu kỳ để hoàn tất chu kỳ và nhận về phân bổ Signature. Sau đó, cửa sổ hoàn tất mở bắt đầu: bất kỳ ai cũng có thể hoàn tất chu kỳ, và hợp đồng thông minh coi người hoàn tất là người nhận của chu kỳ — người hoàn tất nhận toàn bộ phân bổ Signature (phần ETH, ${cstAmount} CST được khắc, Cosmic Signature NFT và quyền ưu tiên với các tài sản đính kèm). Các phân bổ ETH phụ cùng phân bổ token hoặc NFT đính kèm nằm trong ký quỹ của ví phân bổ với một thời hạn nhận về riêng, mặc định là ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần; khi hết hạn, các hợp đồng cho phép bất kỳ ai nhận về một phân bổ chưa được nhận cho chính họ. Hãy nhận về kịp thời.`,
      },
      'how-does-anchoring-work': {
        question: 'Neo giữ hoạt động như thế nào?',
        answer: `Cosmic Signature NFT có thể được neo giữ với giao thức để nhận phân phối neo giữ bằng ETH: mỗi chu kỳ hoàn tất phân bổ ${protocolFacts.anchorDistributionPercentage}% Dự trữ chu kỳ, chia đều cho mỗi Cosmic Signature NFT đang neo giữ, và ETH tích lũy được chi trả khi bạn gỡ neo. Random Walk NFT cũng có thể được neo giữ, nhưng chỉ để thuộc diện Tinh tuyển NFT neo giữ — những người neo giữ được chọn nhận CST và Cosmic Signature NFT, không nhận ETH. Hai quy tắc cần biết: mỗi NFT chỉ được neo giữ đúng một lần (sau khi bạn gỡ neo, NFT đó không bao giờ có thể neo giữ lại), và nếu không có Cosmic Signature NFT nào đang neo giữ khi một chu kỳ hoàn tất, ${protocolFacts.anchorDistributionPercentage}% của chu kỳ đó chỉ đơn giản ở lại trong Dự trữ chu kỳ. CST (ERC-20) không thể neo giữ. Hãy vào trang Neo giữ của tôi (từ menu tài khoản) để quản lý neo giữ.`,
      },
      'what-are-marketing-rewards': {
        question: 'Dự trữ truyền thông là gì?',
        answer: `Bạn có thể nhận token CST (ERC-20) khi giúp giới thiệu giao thức. Dự trữ truyền thông khắc ${outreachCst} CST mỗi chu kỳ và phân phối cho những người đóng góp cho hệ sinh thái. Hãy liên hệ người phụ trách truyền thông qua Discord để được hướng dẫn.`,
      },
      'how-many-nfts-minted': {
        question: 'Mỗi chu kỳ có bao nhiêu Cosmic Signature NFT được khắc?',
        answer: `Trong phần lớn các chu kỳ, ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT được khắc: một cho người nhận phân bổ Signature, một cho người nhận nét bút CST cuối cùng, một cho Quán quân Bền bỉ, một cho Chiến binh Thời gian, ${protocolFacts.nftStellarSelectionRecipients} cho người nhận NFT Tinh tuyển, và ${protocolFacts.anchoredRwlkNftSelectionRecipients} cho những người neo giữ Random Walk NFT được chọn qua Tinh tuyển NFT neo giữ. Mỗi phân bổ NFT trong ${protocolFacts.typicalNftsPerCycle} phân bổ đó cũng đi kèm ${cstAmount} CST. Nếu một chu kỳ không có nét bút CST hoặc không có Random Walk NFT đang neo giữ, những lần khắc tương ứng sẽ được bỏ qua trong chu kỳ đó.`,
      },
      'what-happens-to-remaining-eth': {
        question: 'ETH còn lại trong Dự trữ chu kỳ sẽ đi đâu?',
        answer:
          'Khoảng một nửa Dự trữ chu kỳ chuyển tiếp vào chu kỳ trình diễn tiếp theo dưới dạng Dự trữ tích lũy, nâng số dư khởi điểm của chu kỳ sau. Phần ETH này tiếp tục được tích lũy trong giao thức.',
      },
      'what-happens-to-attached-assets': {
        question: 'Điều gì xảy ra với token hoặc NFT đính kèm vào nét bút?',
        answer: `Token ERC-20 hoặc NFT ERC-721 đính kèm vào nét bút được hợp đồng ví phân bổ giữ trong ký quỹ; chúng không nhập vào Dự trữ chu kỳ bằng ETH. Sau khi hoàn tất, người nhận của chu kỳ (thường là người đặt nét bút cuối cùng) có quyền ưu tiên độc quyền để nhận về chúng. Nếu tài sản đính kèm vẫn chưa được nhận về sau thời hạn nhận về phụ, hiện mặc định là ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, các hợp đồng cho phép bất kỳ ai nhận về chúng cho chính họ.`,
      },
      'who-receives-10-percent': {
        question: 'Ai nhận phần phân bổ hàng hóa công từ Dự trữ chu kỳ?',
        answer:
          'Bảy phần trăm Dự trữ chu kỳ được chuyển đến Kho Hàng hóa công khi hoàn tất, và sau đó bất kỳ ai cũng có thể chuyển số dư của kho đến đơn vị thụ hưởng Hàng hóa công đã cấu hình. Đơn vị thụ hưởng hiện tại là Protocol Guild — cơ chế tài trợ tập thể cho hơn 170 người đóng góp cốt lõi cho Ethereum. Hiện nay địa chỉ thụ hưởng do chủ sở hữu giao thức thiết lập; dự định là Hội đồng Vũ trụ sẽ điều hướng nó khi quyền sở hữu chuyển sang Hội đồng kiểm soát.',
      },
    },
  },
  'game-mechanics': {
    title: 'Cơ chế chu kỳ',
    description: 'Đi sâu vào thời điểm nét bút và quy tắc giao thức',
    items: {
      'how-does-price-increase': {
        question: 'Chi phí nét bút thay đổi thế nào trong một chu kỳ?',
        answer:
          'Chi phí nét bút ETH và CST đi theo hai đường riêng trên chuỗi. Chi phí nét bút ETH dùng cửa sổ hiệu chỉnh ETH rồi tăng theo bậc sau các nét bút ETH. Chi phí nét bút CST giảm dần qua cửa sổ hiệu chỉnh CST hiện tại. Cửa sổ CST đó không tĩnh: nét bút ETH rút ngắn nó một chút, còn nét bút CST kéo dài nó một chút, nên đường chi phí phản ứng theo cán cân giữa tham gia bằng ETH và CST.',
      },
      'what-is-dutch-auction': {
        question: 'Cửa sổ hiệu chỉnh là gì?',
        answer: `Cửa sổ hiệu chỉnh là một cửa sổ khám phá chi phí, trong đó chi phí nét bút giảm tuyến tính từ trần hiệu chỉnh trong một thời lượng đã biết. Nét bút ETH và nét bút CST dùng hai cửa sổ riêng với hai sàn khác nhau: chi phí nét bút ETH giảm đến sàn khoảng 1/${protocolFacts.ethCalibrationFloorDivisor} trần của nó, còn chi phí nét bút CST giảm hẳn về ${protocolFacts.cstCalibrationFloorCst} — một nét bút CST không tốn chi phí là khả thi nếu cửa sổ trôi qua hoàn toàn. Cửa sổ hiệu chỉnh CST hiện khởi đầu từ mốc tham chiếu ${protocolFacts.initialCstCalibrationWindowHours} giờ, nhưng nó được lưu trên chuỗi và thay đổi sau mỗi nét bút: mỗi nét bút CST tăng cửa sổ khoảng ${cstWindowIncrease}%, và mỗi nét bút ETH giảm nó khoảng ${cstWindowDecrease}%.`,
      },
      'how-is-participation-cst-calculated': {
        question: 'CST tham gia được tính như thế nào?',
        answer: `CST tham gia dùng công thức căn bậc hai dựa trên thời gian đã trôi qua kể từ nét bút trước: ${protocolFacts.dynamicCstRewardFormula}. Công thức căn bậc hai cho lượng CST lớn hơn khi khoảng cách giữa hai nét bút dài hơn, nhưng mức tăng chậm hơn thời gian chờ. Với các tham số lúc ra mắt (mức tăng thời gian đúng một giờ), các ví dụ xấp xỉ là ${protocolFacts.dynamicCstRewardExamples.map((example) => `${viDecimal(example.cst)} CST sau ${ELAPSED_VI[example.elapsed]}`).join(', ')}. Mức tăng lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất, nên lượng thực tế theo thời gian trôi thấp hơn một chút so với các con số này. Ứng dụng hiển thị lượng CST ước tính hiện tại. Hợp đồng xác định lượng thực tế khi nét bút được xử lý.`,
      },
      'why-minimum-cst-reward-protection': {
        question: 'Bảo đảm CST tham gia tối thiểu là gì?',
        answer:
          'Trước khi bạn gửi nét bút, ứng dụng xem trước lượng CST tham gia dự kiến và gửi kèm mức CST tối thiểu bạn sẵn lòng chấp nhận. Nếu một nét bút khác đến trước, lượng dự kiến của bạn có thể thay đổi. Bảo đảm CST tham gia tối thiểu có thể dừng giao dịch nếu lần khắc CST kết quả thấp hơn mức tối thiểu bạn đã chọn. Bạn cũng có thể chọn chấp nhận mọi lượng CST, kể cả 0 CST, nếu muốn nét bút được tiến hành miễn là các kiểm tra chi phí đạt.',
      },
      'how-cst-calibration-window-changes': {
        question: 'Mỗi nét bút làm thay đổi cửa sổ hiệu chỉnh CST như thế nào?',
        answer: `Mỗi nét bút ETH hoặc CST đều cập nhật cửa sổ hiệu chỉnh CST đã lưu. Một nét bút CST kéo dài cửa sổ thêm thời lượng / ${protocolFacts.cstCalibrationWindowChangeDivisor}, tức khoảng +${cstWindowIncrease}% trước khi làm tròn xuống số nguyên. Một nét bút ETH rút ngắn nó khoảng thời lượng / ${protocolFacts.cstCalibrationWindowChangeDivisor + 1}, tức khoảng -${cstWindowDecrease}%. Cửa sổ ngắn hơn khiến chi phí nét bút CST giảm nhanh hơn; cửa sổ dài hơn khiến nó giảm chậm hơn.`,
      },
      'what-is-open-finalization-window': {
        question: 'Cửa sổ hoàn tất mở là gì?',
        answer: `Khi đếm ngược hoàn tất về 0, người đặt nét bút cuối cùng có ${protocolFacts.finalGestureExclusivityHours} giờ ưu tiên để hoàn tất chu kỳ. Nếu họ không hoàn tất trong cửa sổ ưu tiên đó, bất kỳ ai cũng có thể gọi giao dịch hoàn tất — và hợp đồng thông minh coi người hoàn tất là người nhận của chu kỳ. Người hoàn tất nhận toàn bộ phân bổ Signature (phần ETH, ${cstAmount} CST, Cosmic Signature NFT và quyền ưu tiên với các tài sản đính kèm), nên người đặt nét bút cuối cùng nên hoàn tất trước khi cửa sổ kết thúc. Hoàn tất mở giữ cho giao thức tiếp tục vận hành ngay cả khi người đặt nét bút cuối cùng biến mất.`,
      },
      'what-is-endurance-champion': {
        question: 'Quán quân Bền bỉ là gì?',
        answer:
          'Người tham gia giữ vị trí người đặt nét bút gần nhất trong khoảng liên tục dài nhất của một chu kỳ (khoảng cách dài nhất trước khi một nét bút khác xuất hiện). Khi chu kỳ hoàn tất, Quán quân Bền bỉ nhận 1.000 CST ghi nhận và một Cosmic Signature NFT.',
      },
      'what-is-final-cst-gesture': {
        question: 'Nét bút CST cuối cùng là gì?',
        answer:
          'Nét bút CST cuối cùng là nét bút sau cùng được đặt bằng token CST trong một chu kỳ. Khi chu kỳ hoàn tất, người tham gia đặt nét bút đó nhận 1.000 CST ghi nhận và một Cosmic Signature NFT.',
      },
      'what-is-chrono-warrior': {
        question: 'Chiến binh Thời gian là gì?',
        answer: `Người tham gia giữ vị trí Quán quân Bền bỉ trong khoảng liên tục dài nhất. Tương tự như Quán quân Bền bỉ là người đặt nét bút gần nhất giữ vị trí lâu nhất, Chiến binh Thời gian là Quán quân Bền bỉ giữ vị trí lâu nhất. Khi chu kỳ hoàn tất, Chiến binh Thời gian nhận ${protocolFacts.chronoWarriorEthPercentage}% Dự trữ chu kỳ bằng ETH, ${cstAmount} CST và một Cosmic Signature NFT.`,
      },
      'does-time-per-bid-stay-same': {
        question: 'Thời gian cộng thêm cho mỗi nét bút có luôn giữ nguyên không?',
        answer: `Không. Thời gian cộng thêm sau mỗi nét bút khởi đầu ở đúng một giờ khi ra mắt và lớn thêm ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% mỗi lần một chu kỳ hoàn tất. Vì mức tăng lớn hơn cũng khiến mỗi chu kỳ kéo dài hơn, nên đà tăng tự nhiên chậm lại theo thời gian lịch.`,
      },
      'why-time-per-bid-increases': {
        question: 'Vì sao thời gian cộng thêm cho mỗi nét bút tăng dần theo thời gian?',
        answer:
          'Cơ chế này giới hạn tốc độ khắc Cosmic Signature NFT về dài hạn. Chu kỳ chậm hơn nghĩa là ít NFT mới đi vào lưu hành hơn trên mỗi đơn vị thời gian, giữ gìn sự khan hiếm.',
      },
      'how-time-increase-affects-game': {
        question: 'Việc tăng thời gian mỗi nét bút ảnh hưởng thế nào đến giao thức?',
        answer:
          'Khi thời gian cộng thêm cho mỗi nét bút tăng, các chu kỳ trung bình kéo dài hơn. Sự thay đổi diễn ra từ từ, giữ trải nghiệm tham gia mượt mà và có xu hướng làm chậm tốc độ khắc NFT trong dài hạn, tùy theo hoạt động của người tham gia.',
      },
      'what-if-two-gestures-same-time': {
        question: 'Điều gì xảy ra nếu hai nét bút được gửi cùng lúc?',
        answer:
          'Arbitrum xử lý giao dịch tuần tự theo thứ tự do sequencer sắp xếp. Nét bút được xử lý trước sẽ cập nhật trạng thái giao thức. Nét bút sau vẫn có thể thành công nếu đáp ứng giới hạn chi phí tối đa và CST tham gia tối thiểu; nếu không, hợp đồng sẽ hoàn nguyên giao dịch.',
      },
      'is-there-game-theory': {
        question: 'Cosmic Signature có yếu tố chiến thuật không?',
        answer:
          'Có. Thời điểm của người tham gia, tần suất nét bút và phương thức (ETH so với CST so với đính kèm Random Walk) đều định hình cách các phân bổ được phân phối. Động lực xã hội và thiết kế giao thức được xây dựng để nhiều chiến thuật khác nhau đều có thể thành công trên các luồng phân bổ khác nhau.',
      },
    },
  },
  'tokens-and-nfts': {
    title: 'Token và Cosmic Signature',
    description: 'CST, nghệ thuật trên chuỗi và tài sản số',
    items: {
      'what-are-cst-and-dao': {
        question: 'Token CST và Hội đồng Vũ trụ là gì?',
        answer:
          'Mỗi nét bút có thể khắc token CST, thứ biểu thị trọng số điều phối trong Hội đồng Vũ trụ. Hội đồng điều phối giao thức trên chuỗi: người nắm giữ CST gửi các đề xuất điều phối và bày tỏ tán thành hoặc phản đối (ủy quyền CST của bạn — cho chính bạn hoặc một địa chỉ khác — để kích hoạt trọng số đó). Hội đồng được thiết kế để điều hướng các tham số giao thức, bao gồm đơn vị thụ hưởng Hàng hóa công nào nhận phần phân bổ 7%, khi quyền sở hữu hợp đồng chuyển sang Hội đồng kiểm soát; hiện nay các thiết lập đó vẫn do chủ sở hữu giao thức quản lý.',
      },
      'what-can-i-do-with-cst': {
        question: 'Tôi có thể làm gì với token CST?',
        answer:
          'Token CST có thể dùng thay cho ETH khi đặt nét bút thông qua cửa sổ hiệu chỉnh CST; CST chi cho một nét bút được đốt (loại bỏ vĩnh viễn khỏi nguồn cung) thay vì gom vào quỹ. Nét bút cũng có thể khắc CST tham gia, nhưng lượng này là động và phụ thuộc vào khoảng thời gian kể từ nét bút trước. CST cũng biểu thị trọng số điều phối trong Hội đồng Vũ trụ sau khi được ủy quyền (bạn có thể ủy quyền cho chính mình).',
      },
      'what-makes-nfts-unique': {
        question: 'Điều gì làm Cosmic Signature NFT trở nên độc nhất?',
        answer:
          'Cosmic Signature NFT nằm trên chuỗi và tự duy trì. Mỗi NFT được khắc với một seed sinh ngẫu nhiên lưu trong hợp đồng thông minh. Hình ảnh và video được kết xuất từ seed này bằng một quy trình Rust mã nguồn mở. Seed quyết định điều kiện khởi đầu của ba thiên thể, tạo ra một quỹ đạo hỗn độn độc nhất cho mỗi NFT.',
      },
      'how-are-nft-images-created': {
        question: 'Hình ảnh NFT được tạo ra như thế nào?',
        answer:
          'Mỗi Cosmic Signature NFT trực quan hóa bài toán ba vật thể trong lực hấp dẫn Newton. Quy trình mô phỏng ba thiên thể dưới lực hấp dẫn và kết xuất quang phổ quỹ đạo của chúng qua 64 dải bước sóng trải từ 380–700 nanomet, tạo nên một hoa văn hỗn độn độc nhất cho mỗi NFT.',
      },
      'significance-of-random-seed': {
        question: 'Vì sao mỗi NFT được tạo từ một seed trên chuỗi?',
        answer:
          'Quy trình dựa trên seed bảo đảm khả năng tái tạo lâu dài. Khác với các dự án NFT mà hình ảnh phụ thuộc vào máy chủ tập trung, seed của mỗi Cosmic Signature NFT được lưu trên Arbitrum. Bất kỳ ai cũng có thể độc lập tạo lại hình ảnh và video NFT vào bất cứ lúc nào bằng quy trình Rust mã nguồn mở — giống bản gốc đến từng điểm ảnh.',
      },
      'is-nft-supply-limited': {
        question: 'Số lượng Cosmic Signature NFT có giới hạn không?',
        answer: `Hợp đồng không đặt giới hạn tối đa cho tổng số NFT. Thời gian cộng thêm cho mỗi nét bút tăng ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% sau mỗi chu kỳ hoàn tất. Điều này có xu hướng kéo dài chu kỳ và làm chậm tốc độ khắc NFT, nhưng tốc độ thực tế còn phụ thuộc vào hoạt động của người tham gia.`,
      },
      'impact-of-limiting-nfts': {
        question: 'Nhịp chu kỳ ảnh hưởng thế nào đến số NFT mới?',
        answer:
          'Thời gian cộng thêm tăng dần có xu hướng kéo dài chu kỳ và giảm số NFT được khắc trong cùng một khoảng thời gian. Mỗi Cosmic Signature NFT ghi lại một phần lịch sử của giao thức; tổng cung không có giới hạn cố định.',
      },
      'connection-with-randomwalknft': {
        question: 'Mối liên hệ với Random Walk NFT là gì?',
        answer:
          'Người nắm giữ Random Walk NFT có thể đính kèm một token chưa sử dụng vào một nét bút ETH để giảm 50% chi phí nét bút ETH. Người neo giữ Random Walk NFT cũng nhận các lượt Tinh tuyển NFT neo giữ mỗi chu kỳ.',
      },
      'how-to-trade-nfts-tokens': {
        question: 'Tôi có thể giao dịch hoặc bán Cosmic Signature NFT hay CST bằng cách nào?',
        answer:
          'Cosmic Signature NFT được giao dịch trên Axiom Zero (axiomzero.market), sàn NFT không thu phí được xây cho Cosmic Signature và Random Walk NFT, còn CST được giao dịch trên Uniswap tại Arbitrum. Cả hai đều là tài sản ERC-721 và ERC-20 tiêu chuẩn, nên bất kỳ sàn hay nơi trao đổi nào khác trên Arbitrum hỗ trợ các tiêu chuẩn này cũng dùng được, kể cả OpenSea.',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: 'Tôi có thể mua hoặc bán Cosmic Signature NFT ở đâu?',
        answer:
          'Nơi chính là Axiom Zero (https://www.axiomzero.market/cosmic-signature), sàn NFT không thu phí trên Arbitrum được xây cho nghệ thuật tạo sinh ra mắt công bằng. Niêm yết và giao dịch bán được thanh toán trực tiếp trên chuỗi, người bán nhận trọn số tiền bán, và mỗi trang token hiển thị trạng thái neo giữ của NFT đọc trực tiếp từ các hợp đồng neo giữ — một token chưa từng neo giữ vẫn giữ nguyên lựa chọn neo giữ một lần cho chủ sở hữu kế tiếp.',
      },
      'cosmic-signature-prediction-market': {
        question: 'Có thị trường dự đoán cho Cosmic Signature không?',
        answer:
          'Có. Chaos Zero (https://chaoszero.com) là thị trường dự đoán được xây riêng cho Cosmic Signature. Mỗi chu kỳ trình diễn nó mở một câu hỏi: Chu kỳ này có hoàn tất với nhiều nét bút hơn chu kỳ trước không? Các vị thế được tính bằng CST và được bảo chứng đầy đủ theo thiết kế, và thị trường được giải quyết từ số nét bút công khai trên chuỗi, không có khóa chủ sở hữu hay quản trị.',
      },
      'participate-dao-without-bidding': {
        question: 'Tôi có thể tham gia Hội đồng Vũ trụ mà không đặt nét bút không?',
        answer:
          'Có. Bạn có thể có CST trên một nơi trao đổi được hỗ trợ và dùng nó để biểu thị trọng số điều phối trong Hội đồng Vũ trụ sau khi ủy quyền (cho chính bạn hoặc một địa chỉ khác). Đặt nét bút vẫn là cách chính để khắc CST mới.',
      },
      'donate-nfts-to-game': {
        question: 'Các dự án NFT khác có thể đóng góp token của họ vào một chu kỳ bằng cách nào?',
        answer:
          'Các dự án có thể đính kèm token của mình (ERC-721 hoặc ERC-20) vào một nét bút bằng khung “Nâng cao”. Cung cấp địa chỉ hợp đồng cùng mã token hoặc số lượng rồi gửi nét bút. Token đính kèm được giữ trong ví phân bổ để người nhận phân bổ Signature nhận về sau khi chu kỳ hoàn tất.',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrum và kỹ thuật',
    description: 'Thiết lập mạng, ví và chi tiết kỹ thuật',
    items: {
      'what-is-arbitrum': {
        question: 'Arbitrum là gì và vì sao Cosmic Signature được triển khai trên đó?',
        answer:
          'Arbitrum là rollup Layer 2 của Ethereum, được thiết kế để giảm chi phí giao dịch. Cosmic Signature sử dụng Arbitrum để hỗ trợ việc đặt nét bút thường xuyên, đồng thời dựa vào Ethereum để công bố dữ liệu và giải quyết tranh chấp. Phí gas thay đổi theo điều kiện mạng.',
      },
      'why-arbitrum-not-ethereum': {
        question: 'Vì sao là Arbitrum mà không phải mạng chính Ethereum?',
        answer:
          'Phần lớn hoạt động trên chuỗi đang chuyển sang các Layer 2. Arbitrum có chi phí gas thấp hơn đáng kể trong khi giữ nguyên mô hình bảo mật của Ethereum Layer 1 — khiến nó trở thành ngôi nhà phù hợp cho một giao thức nhiều nét bút như Cosmic Signature.',
      },
      'arbitrum-security': {
        question: 'Điều gì làm Arbitrum an toàn như Ethereum Layer 1?',
        answer:
          'Arbitrum là một rollup, không phải sidechain. Mỗi lô giao dịch được đăng trở lại mạng chính Ethereum. Điều này neo tính bảo mật của Arbitrum vào chính Ethereum: dữ liệu và việc giải quyết tranh chấp nằm trên Layer 1.',
      },
      'how-to-get-eth-on-arbitrum': {
        question: 'Tôi lấy ETH trên Arbitrum bằng cách nào?',
        answer:
          'Chuyển ETH từ mạng chính Ethereum qua cầu Arbitrum chính thức hoặc các cầu được hỗ trợ khác. ETH của bạn được khóa trên Ethereum và một lượng tương đương trở nên khả dụng trên Arbitrum. Việc chuyển qua cầu cần trả gas trên Ethereum Layer 1.',
      },
      'existing-wallet-on-arbitrum': {
        question: 'Tôi có thể dùng ví Ethereum hiện có trên Arbitrum không?',
        answer:
          'Có. Cùng một khóa riêng ký giao dịch trên cả hai mạng. Bạn chỉ cần thêm mạng Arbitrum vào danh sách mạng của ví.',
      },
      'view-tokens-on-arbitrum': {
        question: 'Tôi xem token CST và Cosmic Signature NFT trên Arbitrum bằng cách nào?',
        answer:
          'Xem trực tiếp trên trang web Cosmic Signature, hoặc thêm địa chỉ hợp đồng vào ví theo cách thủ công. Địa chỉ hợp đồng được công bố trên trang Hợp đồng và trong Discord của cộng đồng.',
      },
      'trade-on-arbitrum': {
        question: 'Tôi có thể giao dịch Cosmic Signature NFT và CST trên Arbitrum không?',
        answer:
          'Có. Cosmic Signature NFT được giao dịch trên Axiom Zero, sàn không thu phí dành cho bộ sưu tập, và CST được giao dịch trên Uniswap. Cả hai đều là tài sản ERC-721 và ERC-20 tiêu chuẩn trên Arbitrum, nên bất kỳ sàn hay nơi trao đổi nào hỗ trợ các tiêu chuẩn này cũng dùng được. Luôn xác nhận địa chỉ hợp đồng trước khi giao dịch.',
      },
      'verify-bid-success': {
        question: 'Tôi xác nhận nét bút đã được gửi thành công bằng cách nào?',
        answer:
          'Nét bút thành công được xác nhận trên Arbitrum và hiển thị trên trình khám phá khối của Arbitrum (Arbiscan). Bạn có thể dán mã băm giao dịch vào trình khám phá để xác minh nét bút.',
      },
      'game-security': {
        question: 'Tính bảo mật của giao thức được bảo đảm như thế nào?',
        answer:
          'Cosmic Signature công khai địa chỉ hợp đồng, tài nguyên mã nguồn và bối cảnh xác minh để cộng đồng có thể độc lập kiểm tra hành vi. Các hợp đồng thông minh đã được Hacken, một công ty bảo mật độc lập, kiểm toán, và báo cáo đầy đủ được liên kết từ trang Kiểm toán.',
      },
      'fees-involved': {
        question: 'Có khoản phí nào không?',
        answer:
          'Ngoài chính chi phí nét bút, bạn trả phí gas của mạng Arbitrum cho mỗi giao dịch. Phí gas dao động theo điều kiện mạng và không do Cosmic Signature kiểm soát.',
      },
    },
  },
  'trust-and-governance': {
    title: 'Tin cậy và điều phối',
    description: 'Minh bạch, quyền kiểm soát của đội ngũ và tầm nhìn mã nguồn mở',
    items: {
      'team-controls': {
        question: 'Đội ngũ có những quyền kiểm soát nào đối với giao thức?',
        answer:
          'Ban đầu, đội ngũ có khả năng điều chỉnh một số tham số của giao thức, như mức tăng thời gian nét bút hay tỷ lệ các luồng phân bổ. Quyền kiểm soát này được triển khai qua mẫu “Ownable” của hợp đồng thông minh và giới hạn trong cửa sổ giữa các chu kỳ: một khi chu kỳ tiếp theo kích hoạt — điều xảy ra trước nét bút đầu tiên của nó — các tham số cốt lõi của giao thức bị khóa cho đến khi chu kỳ đó hoàn tất. Một vài quyền kiểm soát hẹp hơn vẫn khả dụng ngoài khóa đó: chủ sở hữu có thể lùi thời điểm kích hoạt một chu kỳ cho đến khi nét bút đầu tiên xuất hiện, điều chỉnh độ trễ trước chu kỳ tiếp theo bất cứ lúc nào, và quản lý các hợp đồng ngoại vi (đơn vị thụ hưởng của Kho Hàng hóa công, URI siêu dữ liệu NFT và thời hạn nhận về của ví phân bổ) bất cứ lúc nào. Hợp đồng giao thức cũng có thể được chủ sở hữu nâng cấp (UUPS), nhưng chỉ giữa các chu kỳ; bản triển khai hiện tại là V2 đã được xác minh công khai.',
      },
      'will-team-always-have-control': {
        question: 'Đội ngũ có luôn nắm quyền kiểm soát các tham số của giao thức không?',
        answer:
          'Không. Khi giao thức ổn định, quyền sở hữu được chuyển giao cho Hội đồng Vũ trụ. Sau đó các thay đổi tham số chỉ diễn ra thông qua các đề xuất điều phối giao thức đạt túc số điều phối.',
      },
      'what-is-renounce-ownership': {
        question: '“Từ bỏ quyền sở hữu” nghĩa là gì?',
        answer:
          'Từ bỏ quyền sở hữu là một hàm của hợp đồng Ownable, chuyển giao vĩnh viễn quyền kiểm soát khỏi địa chỉ triển khai. Sau khi được gọi, không vai trò đặc quyền nào có thể sửa đổi tham số của hợp đồng.',
      },
      'why-renounce-ownership': {
        question: 'Vì sao đội ngũ lại từ bỏ quyền sở hữu?',
        answer:
          'Mục tiêu là một giao thức công bằng và phi tập trung. Từ bỏ quyền sở hữu bảo đảm các quy tắc của giao thức không thể bị thay đổi tùy tiện sau khi vận hành — củng cố niềm tin và tính dự đoán được cho người tham gia.',
      },
      'how-team-profits': {
        question: 'Đội ngũ Cosmic Signature nhận giá trị từ giao thức bằng cách nào?',
        answer:
          'Không có ví nào của đội ngũ nhận ETH từ nét bút của người tham gia. Toàn bộ ETH chảy vào Dự trữ chu kỳ và được phân phối theo các luồng phân bổ. Sự gắn kết của đội ngũ với giao thức được giữ gián tiếp qua các Random Walk NFT; thành công của giao thức có thể làm tăng giá trị văn hóa của những NFT đó. Động lực chính là sự tò mò, sáng tạo và đóng góp cho hàng hóa công mã nguồn mở.',
      },
      'why-was-cs-created': {
        question: 'Vì sao Cosmic Signature được tạo ra?',
        answer:
          'Cosmic Signature ra đời từ niềm say mê với lý thuyết hỗn độn và sự phức tạp của bài toán ba vật thể. Ý tưởng về nghệ thuật tất định, độc nhất được tạo từ seed trên chuỗi vừa hấp dẫn vừa phù hợp với một giao thức gắn với hàng hóa công.',
      },
      'what-if-team-disappears': {
        question: 'Nếu đội ngũ biến mất thì sao?',
        answer:
          'Giao thức được thiết kế để tự duy trì. Seed được lưu trên chuỗi; bất kỳ ai cũng có thể tạo lại hình ảnh và video NFT bằng quy trình Rust mã nguồn mở. Điều này bảo đảm mọi Cosmic Signature NFT luôn sẵn có bất kể tình trạng của đội ngũ.',
      },
      'can-create-competing-site': {
        question: 'Tôi có thể phân nhánh dự án này và xây trang web riêng không?',
        answer:
          'Hoàn toàn được. Hợp đồng, shader, bộ kết xuất, trang web và tài liệu thuộc dự án được công bố theo CC0 1.0 — không bảo lưu quyền nào. Các phụ thuộc bên thứ ba, phông chữ và tài sản giữ giấy phép riêng của chúng; xem THIRD_PARTY_NOTICES.md.',
      },
      'donate-to-pot': {
        question: 'Tôi có thể đóng góp ETH vào Dự trữ chu kỳ mà không đặt nét bút không?',
        answer:
          'Có. Hợp đồng giao thức có các hàm đóng góp riêng nhận ETH độc lập với nét bút, và bạn có thể đính kèm một lời nhắn có thể xuất hiện trên danh sách đóng góp của chu kỳ. Hãy dùng luồng đóng góp trong ứng dụng thay vì chuyển ví thông thường: ETH gửi trực tiếp đến địa chỉ giao thức được xử lý như một nét bút ETH, không phải một khoản đóng góp. Liên hệ qua Discord để biết chi tiết.',
      },
      'get-help': {
        question: 'Tôi có thể được trợ giúp ở đâu khi có câu hỏi?',
        answer:
          'Bạn có thể liên hệ cộng đồng và đội hỗ trợ qua Discord, X / Twitter hoặc email. Các liên kết chính thức nằm trên trang Giới thiệu.',
      },
      'stay-updated': {
        question: 'Tôi theo dõi tin tức Cosmic Signature bằng cách nào?',
        answer:
          'Theo dõi các kênh mạng xã hội chính thức và tham gia cộng đồng Discord để nhận thông báo mới nhất, các đề xuất điều phối giao thức và tóm tắt chu kỳ.',
      },
    },
  },
} satisfies FAQText;
