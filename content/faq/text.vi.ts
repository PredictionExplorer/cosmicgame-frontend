import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { FAQText } from './structure';

/** Vietnamese decimal mark for a protocol figure quoted in English notation ("1.73"). */

const cstAmount = formatCount(protocolFacts.specialAllocationCst, 'vi');
const outreachCst = formatCount(protocolFacts.outreachReserveCst, 'vi');

/** Vietnamese FAQ copy, keyed by the skeleton in structure.ts. */
export const faqTextVi = {
  'getting-started': {
    title: 'Bắt đầu',
    description: 'Những điều cơ bản về Cosmic Signature và cách tham gia',
    items: {
      'what-is-cosmic-signature': {
        question: 'Cosmic Signature là gì?',
        answer:
          'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum. Người tham gia đặt nét bút trong một chu kỳ trình diễn; mỗi nét bút đều định hình Signature cuối cùng của chu kỳ. Khi chu kỳ hoàn tất, giao thức phân phối dự trữ của mình qua một nhóm luồng phân bổ cố định — bao gồm Protocol Guild, cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum.',
      },
      'how-does-the-bidding-game-work': {
        question: 'Một chu kỳ trình diễn hoạt động như thế nào?',
        answer:
          'Nét bút đầu tiên của chu kỳ phải dùng ETH và bắt đầu đồng hồ hoàn tất. Các nét bút sau cộng mức tăng hiện tại vào thời điểm hoàn tất đã lưu, kể cả sau khi hết giờ. Đồng hồ không bắt đầu lại từ thời điểm hiện tại. Bạn vẫn có thể đặt nét bút cho tới khi giao dịch hoàn tất thành công.',
      },
      'what-type-of-gestures-are-available': {
        question: 'Có những loại nét bút nào?',
        answer:
          'ETH và CST có quy tắc chi phí cơ sở riêng. Khi chu kỳ mở, chi phí ETH giảm trong cửa sổ hiệu chỉnh; mỗi nét bút ETH nâng chi phí cơ sở tiếp theo. Chi phí CST giảm theo tốc độ lưu trên chuỗi. Gần hạn hoàn tất, cả hai chi phí có phụ phí cuối chu kỳ, nhưng phụ phí không nâng chi phí cơ sở tiếp theo hay trọng số Tinh tuyển. Nét bút đầu tiên của chu kỳ phải dùng ETH và bắt đầu đồng hồ hoàn tất. Các nét bút sau cộng mức tăng hiện tại vào thời điểm hoàn tất đã lưu, kể cả sau khi hết giờ. Đồng hồ không bắt đầu lại từ thời điểm hiện tại. Bạn vẫn có thể đặt nét bút cho tới khi giao dịch hoàn tất thành công. Để giảm chi phí ETH, mỗi Random Walk NFT chỉ được dùng một lần. Hợp đồng kiểm tra quyền sở hữu và đánh dấu đã dùng; bản thân NFT không được chuyển đi. Quyền này tách biệt với neo giữ.',
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
        answer:
          'Nét bút đầu tiên của chu kỳ phải dùng ETH và bắt đầu đồng hồ hoàn tất. Các nét bút sau cộng mức tăng hiện tại vào thời điểm hoàn tất đã lưu, kể cả sau khi hết giờ. Đồng hồ không bắt đầu lại từ thời điểm hiện tại. Bạn vẫn có thể đặt nét bút cho tới khi giao dịch hoàn tất thành công.',
      },
      'can-i-place-multiple-gestures': {
        question: 'Tôi có thể đặt nhiều nét bút trong một chu kỳ không?',
        answer:
          'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
      },
    },
  },
  'allocations-and-rewards': {
    title: 'Phân bổ và phân phối',
    description: 'Người tham gia có thể nhận gì khi chu kỳ hoàn tất',
    items: {
      'what-is-the-main-allocation': {
        question: 'Phân bổ Signature là gì?',
        answer: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
      },
      'what-rewards-per-bid': {
        question: 'Tôi nhận được gì cho mỗi nét bút?',
        answer:
          'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
      },
      'how-does-the-stellarSelection-work': {
        question: 'Tinh tuyển hoạt động như thế nào?',
        answer:
          'Cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia đều dùng trọng số từng nét bút. Trọng số là chi phí ETH cơ sở tại thời điểm đó, chưa giảm bằng Random Walk NFT và chưa cộng phụ phí cuối chu kỳ. Nét bút CST dùng cùng chi phí ETH cơ sở đương thời. Các lượt chọn có hoàn lại, nên một địa chỉ có thể được chọn nhiều lần. Tinh tuyển NFT neo giữ xét riêng các Random Walk NFT đang neo giữ.',
      },
      'how-random-selection-works': {
        question: 'Việc chọn ngẫu nhiên được thực hiện thế nào?',
        answer:
          'Cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia đều dùng trọng số từng nét bút. Trọng số là chi phí ETH cơ sở tại thời điểm đó, chưa giảm bằng Random Walk NFT và chưa cộng phụ phí cuối chu kỳ. Nét bút CST dùng cùng chi phí ETH cơ sở đương thời. Các lượt chọn có hoàn lại, nên một địa chỉ có thể được chọn nhiều lần. Tinh tuyển NFT neo giữ xét riêng các Random Walk NFT đang neo giữ.',
      },
      'how-do-i-claim-my-allocation': {
        question: 'Tôi nhận về phân bổ bằng cách nào nếu là người nhận?',
        answer: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp.

Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.

Phân bổ ETH thứ cấp và tài sản đính kèm được nhận về riêng từ Ví Phân bổ. Sau thời hạn hiện tại là ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, bất kỳ ai cũng có thể nhận về tài sản chưa được nhận cho chính mình. Hết hạn không tự động chuyển tài sản.`,
      },
      'how-does-anchoring-work': {
        question: 'Neo giữ hoạt động như thế nào?',
        answer: `Cosmic Signature NFT có thể được neo giữ với giao thức để nhận phân phối neo giữ bằng ETH: mỗi chu kỳ hoàn tất phân bổ ${protocolFacts.anchorDistributionPercentage}% Dự trữ chu kỳ, chia đều cho mỗi Cosmic Signature NFT đang neo giữ, và ETH tích lũy được chi trả khi bạn gỡ neo.\n\nRandom Walk NFT cũng có thể được neo giữ, nhưng chỉ để thuộc diện Tinh tuyển NFT neo giữ — những người neo giữ được chọn nhận CST và Cosmic Signature NFT, không nhận ETH.\n\nHai quy tắc cần biết: mỗi NFT chỉ được neo giữ đúng một lần (sau khi bạn gỡ neo, NFT đó không bao giờ có thể neo giữ lại), và nếu không có Cosmic Signature NFT nào đang neo giữ khi một chu kỳ hoàn tất, ${protocolFacts.anchorDistributionPercentage}% của chu kỳ đó chỉ đơn giản ở lại trong Dự trữ chu kỳ. CST (ERC-20) không thể neo giữ. Hãy vào trang Neo giữ của tôi (từ menu tài khoản) để quản lý neo giữ.`,
      },
      'what-are-marketing-rewards': {
        question: 'Dự trữ truyền thông là gì?',
        answer: `Bạn có thể nhận token CST (ERC-20) khi giúp giới thiệu giao thức. Dự trữ truyền thông khắc ${outreachCst} CST mỗi chu kỳ và phân phối cho những người đóng góp cho hệ sinh thái. Hãy liên hệ người phụ trách truyền thông qua Discord để được hướng dẫn.`,
      },
      'how-many-nfts-minted': {
        question: 'Mỗi chu kỳ có bao nhiêu Cosmic Signature NFT được khắc?',
        answer: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
      },
      'what-happens-to-remaining-eth': {
        question: 'ETH còn lại trong Dự trữ chu kỳ sẽ đi đâu?',
        answer:
          'Khoảng một nửa ETH được giữ lại cho chu kỳ sau. Làm tròn số nguyên, luồng bị bỏ qua và chuyển không thành công có thể làm phần còn lại lớn hơn. Điều đó không bảo đảm dự trữ đầu chu kỳ sau sẽ lớn hơn.',
      },
      'what-happens-to-attached-assets': {
        question: 'Điều gì xảy ra với token hoặc NFT đính kèm vào nét bút?',
        answer: `Token ERC-20 hoặc NFT ERC-721 đính kèm vào nét bút được hợp đồng ví phân bổ giữ trong ký quỹ; chúng không nhập vào Dự trữ chu kỳ bằng ETH. Sau khi hoàn tất, người nhận của chu kỳ (thường là người đặt nét bút cuối cùng) có quyền ưu tiên độc quyền để nhận về chúng. Nếu tài sản đính kèm vẫn chưa được nhận về sau thời hạn nhận về phụ, hiện mặc định là ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần, các hợp đồng cho phép bất kỳ ai nhận về chúng cho chính họ.`,
      },
      'who-receives-10-percent': {
        question: 'Ai nhận phần phân bổ hàng hóa công từ Dự trữ chu kỳ?',
        answer: `Khi hoàn tất, giao thức thử chuyển ${protocolFacts.publicGoodsPercentage}% Dự trữ chu kỳ vào Kho Hàng hóa công. Sau đó bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild. Chủ sở hữu có thể thay đổi đơn vị thụ hưởng. Nếu chuyển từ giao thức vào kho thất bại, phần này có thể ở lại dự trữ mà không hủy hoàn tất.`,
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
          'ETH và CST có quy tắc chi phí cơ sở riêng. Khi chu kỳ mở, chi phí ETH giảm trong cửa sổ hiệu chỉnh; mỗi nét bút ETH nâng chi phí cơ sở tiếp theo. Chi phí CST giảm theo tốc độ lưu trên chuỗi. Gần hạn hoàn tất, cả hai chi phí có phụ phí cuối chu kỳ, nhưng phụ phí không nâng chi phí cơ sở tiếp theo hay trọng số Tinh tuyển.',
      },
      'what-is-dutch-auction': {
        question: 'Cửa sổ hiệu chỉnh là gì?',
        answer:
          'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      },
      'how-is-participation-cst-calculated': {
        question: 'CST tham gia được tính như thế nào?',
        answer: `Số đơn vị nhỏ nhất của CST tham gia bằng ${protocolFacts.dynamicCstRewardFormula}. Thời gian đã trôi qua tính bằng giây, còn mức tăng thời gian của chu kỳ tính bằng micro giây. Chia kết quả cho 10^18 để biểu diễn bằng CST.

Nét bút tiếp theo khắc toàn bộ cho người tham gia trước. Nét bút đầu tiên không tạo CST tham gia; hoàn tất cũng không thanh toán thêm khoảng thời gian cuối.`,
      },
      'why-minimum-cst-reward-protection': {
        question: 'Bảo đảm CST tham gia tối thiểu là gì?',
        answer:
          'Mức CST tham gia tối thiểu giới hạn số lượng mà nét bút tiếp theo khắc cho người tham gia trước, không bảo đảm một khoản cho người gửi. Nếu hai địa chỉ giống nhau, người gửi tự nhận số lượng đó. Giá trị 0 tắt giới hạn này; nét bút ETH đầu tiên của chu kỳ bỏ qua kiểm tra. Chi phí tối đa và phí mạng là các điều kiện riêng.',
      },
      'how-cst-calibration-window-changes': {
        question: 'Mỗi nét bút làm thay đổi cửa sổ hiệu chỉnh CST như thế nào?',
        answer:
          'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
      },
      'what-is-open-finalization-window': {
        question: 'Cửa sổ hoàn tất mở là gì?',
        answer: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
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
          'Cơ chế này điều tiết tốc độ khắc Cosmic Signature NFT về dài hạn: chu kỳ càng dài thì càng ít NFT mới được khắc trong cùng một khoảng thời gian.',
      },
      'how-time-increase-affects-game': {
        question: 'Việc tăng thời gian mỗi nét bút ảnh hưởng thế nào đến giao thức?',
        answer:
          'Mức tăng thời gian lớn hơn có thể ảnh hưởng tần suất hoàn tất chu kỳ, nhưng không đặt trần cố định cho nguồn cung NFT hay bảo đảm số tác phẩm mới trong một khoảng thời gian.',
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
          'CST có thể dùng để đặt nét bút hoặc, sau khi ủy quyền, làm Trọng số Điều phối trong Hội đồng Vũ trụ. Hội đồng chỉ quản lý tài sản và quyền mà mình thực sự nắm giữ. Hiện Hội đồng không sở hữu giao thức chính; chuyển giao hoặc từ bỏ quyền cần các thao tác riêng trên chuỗi.',
      },
      'what-can-i-do-with-cst': {
        question: 'Tôi có thể làm gì với token CST?',
        answer:
          'Token CST có thể dùng thay cho ETH khi đặt nét bút thông qua cửa sổ hiệu chỉnh CST; CST chi cho một nét bút được đốt (loại bỏ vĩnh viễn khỏi nguồn cung) thay vì gom vào quỹ. Nét bút cũng có thể khắc CST tham gia, nhưng lượng này là động và phụ thuộc vào khoảng thời gian kể từ nét bút trước. CST cũng biểu thị trọng số điều phối trong Hội đồng Vũ trụ sau khi được ủy quyền (bạn có thể ủy quyền cho chính mình).',
      },
      'what-makes-nfts-unique': {
        question: 'Điều gì làm Cosmic Signature NFT trở nên độc nhất?',
        answer:
          'Seed của NFT được lưu trên chuỗi, còn hình ảnh và video được tạo ngoài chuỗi. Tái tạo cần cùng seed, đúng phiên bản và cấu hình bộ kết xuất, cùng công cụ tương thích. Chỉ có cùng seed không bảo đảm kết quả giống nhau giữa các phiên bản.',
      },
      'how-are-nft-images-created': {
        question: 'Hình ảnh NFT được tạo ra như thế nào?',
        answer:
          'Mỗi Cosmic Signature NFT trực quan hóa bài toán ba vật thể trong lực hấp dẫn Newton. Quy trình mô phỏng ba thiên thể dưới lực hấp dẫn và kết xuất quang phổ quỹ đạo của chúng qua 64 dải bước sóng trải từ 380–700 nanomet, tạo nên một hoa văn hỗn độn độc nhất cho mỗi NFT.',
      },
      'significance-of-random-seed': {
        question: 'Vì sao mỗi NFT được tạo từ một seed trên chuỗi?',
        answer:
          'Seed của NFT được lưu trên chuỗi, còn hình ảnh và video được tạo ngoài chuỗi. Tái tạo cần cùng seed, đúng phiên bản và cấu hình bộ kết xuất, cùng công cụ tương thích. Chỉ có cùng seed không bảo đảm kết quả giống nhau giữa các phiên bản.',
      },
      'is-nft-supply-limited': {
        question: 'Số lượng Cosmic Signature NFT có giới hạn không?',
        answer:
          'Mức tăng thời gian lớn hơn có thể ảnh hưởng tần suất hoàn tất chu kỳ, nhưng không đặt trần cố định cho nguồn cung NFT hay bảo đảm số tác phẩm mới trong một khoảng thời gian.',
      },
      'impact-of-limiting-nfts': {
        question: 'Nhịp chu kỳ ảnh hưởng thế nào đến số NFT mới?',
        answer:
          'Mức tăng thời gian lớn hơn có thể ảnh hưởng tần suất hoàn tất chu kỳ, nhưng không đặt trần cố định cho nguồn cung NFT hay bảo đảm số tác phẩm mới trong một khoảng thời gian.',
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
          'Bản kiểm toán công khai áp dụng cho phiên bản hợp đồng lịch sử đã được xem xét. Nó không phải kiểm toán độc lập mọi thay đổi V2 hoặc V3 sau đó. Xác minh mã nguồn trùng với mã triển khai cũng không phải đánh giá bảo mật. Bản triển khai hiện tại của giao thức là V3. Hãy đối chiếu địa chỉ triển khai với ô EIP-1967 của proxy. Việc xác minh công khai mã nguồn V3 chưa được xác nhận; xác minh V2 trước đây không áp dụng cho bản triển khai mới.',
      },
      'fees-involved': {
        question: 'Có khoản phí nào không?',
        answer:
          'Ngoài chính chi phí nét bút, bạn trả phí gas của mạng Arbitrum cho mỗi giao dịch. Phí gas dao động theo điều kiện mạng và không do Cosmic Signature kiểm soát.',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Cosmic Signature có liên quan đến cơ sở dữ liệu sinh học COSMIC không?',
        answer:
          'Không. Cosmic Signature không liên quan đến cơ sở dữ liệu đột biến ung thư COSMIC hay các chữ ký đột biến COSMIC trong sinh học. Đây là một giao thức và ứng dụng nghệ thuật trên chuỗi tập trung vào nghệ thuật NFT ba vật thể tất định.',
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
          'Chủ sở hữu vẫn có quyền đổi tham số và bản triển khai theo điều kiện của hợp đồng.\n\nCác thay đổi chính bị giới hạn khi chu kỳ chưa hoạt động, nhưng thời điểm kích hoạt, thời gian chờ chu kỳ sau và các hợp đồng phụ có quyền riêng.\n\nV3 không tự động chuyển quyền cho Hội đồng Vũ trụ hoặc tự động từ bỏ quyền chủ sở hữu.',
      },
      'will-team-always-have-control': {
        question: 'Đội ngũ có luôn nắm quyền kiểm soát các tham số của giao thức không?',
        answer:
          'Chủ sở hữu vẫn có quyền đổi tham số và bản triển khai theo điều kiện của hợp đồng. Các thay đổi chính bị giới hạn khi chu kỳ chưa hoạt động, nhưng thời điểm kích hoạt, thời gian chờ chu kỳ sau và các hợp đồng phụ có quyền riêng. V3 không tự động chuyển quyền cho Hội đồng Vũ trụ hoặc tự động từ bỏ quyền chủ sở hữu.',
      },
      'what-is-renounce-ownership': {
        question: '“Từ bỏ quyền sở hữu” nghĩa là gì?',
        answer:
          'Chủ sở hữu vẫn có quyền đổi tham số và bản triển khai theo điều kiện của hợp đồng. Các thay đổi chính bị giới hạn khi chu kỳ chưa hoạt động, nhưng thời điểm kích hoạt, thời gian chờ chu kỳ sau và các hợp đồng phụ có quyền riêng. V3 không tự động chuyển quyền cho Hội đồng Vũ trụ hoặc tự động từ bỏ quyền chủ sở hữu.',
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
          'Bạn có thể liên hệ cộng đồng và đội hỗ trợ qua Discord, X (Twitter) hoặc email. Các liên kết chính thức nằm trên trang Giới thiệu.',
      },
      'stay-updated': {
        question: 'Tôi theo dõi tin tức Cosmic Signature bằng cách nào?',
        answer:
          'Theo dõi các kênh mạng xã hội chính thức và tham gia cộng đồng Discord để nhận thông báo mới nhất, các đề xuất điều phối giao thức và tóm tắt chu kỳ.',
      },
    },
  },
} satisfies FAQText;
