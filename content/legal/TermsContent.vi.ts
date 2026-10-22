import { protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { TermsCopy } from './TermsContent';

const cstAmount = formatCount(protocolFacts.specialAllocationCst, 'vi');

export const termsCopyVi = {
  title: 'Điều khoản dịch vụ',
  subtitle:
    'Vui lòng đọc kỹ các điều khoản này trước khi sử dụng Cosmic Signature. Khi sử dụng nền tảng, bạn đồng ý chịu ràng buộc bởi các điều khoản này.',
  sections: [
    {
      id: 'acceptance',
      title: 'Chấp nhận điều khoản',
      content: [
        {
          id: 'acceptance',
          text: 'Khi truy cập và sử dụng Cosmic Signature, bạn chấp nhận và đồng ý chịu ràng buộc bởi Điều khoản dịch vụ này. Nếu bạn không đồng ý với các điều khoản này, vui lòng không sử dụng nền tảng của chúng tôi.',
        },
        {
          id: 'binding-agreement',
          text: 'Các điều khoản này tạo thành một thỏa thuận có hiệu lực pháp lý giữa bạn và Cosmic Signature. Chúng tôi bảo lưu quyền sửa đổi các điều khoản này vào bất cứ lúc nào, và những sửa đổi đó có hiệu lực ngay khi được đăng.',
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'Điều kiện tham gia và yêu cầu về tài khoản',
      content: [
        {
          id: 'age',
          subtitle: 'Yêu cầu về độ tuổi',
          text: 'Bạn phải từ 18 tuổi trở lên để sử dụng Cosmic Signature. Khi sử dụng nền tảng này, bạn tuyên bố và bảo đảm rằng mình đáp ứng yêu cầu về độ tuổi.',
        },
        {
          id: 'wallet',
          subtitle: 'Trách nhiệm về ví',
          text: 'Bạn hoàn toàn chịu trách nhiệm bảo đảm an toàn cho ví Web3 và khóa riêng của mình. Cosmic Signature sẽ không bao giờ yêu cầu khóa riêng hay cụm từ khôi phục của bạn. Mất quyền truy cập ví có thể dẫn đến mất vĩnh viễn NFT và tài sản.',
        },
        {
          id: 'compliance',
          subtitle: 'Tuân thủ pháp luật',
          text: 'Bạn đồng ý tuân thủ mọi luật và quy định áp dụng tại khu vực pháp lý của mình khi sử dụng Cosmic Signature, bao gồm những quy định liên quan đến tiền mã hóa và công nghệ blockchain.',
        },
      ],
    },
    {
      id: 'mechanics',
      title: 'Cơ chế giao thức và hợp đồng thông minh',
      content: [
        {
          id: 'protocol',
          subtitle: 'Giao thức hoạt động như thế nào',
          text: 'Cosmic Signature là giao thức nghệ thuật tạo sinh trên chuỗi, phi tập trung, nơi người tham gia đặt nét bút bằng ETH hoặc token CST trong một chu kỳ trình diễn. Nét bút kéo dài thời điểm hoàn tất chu kỳ, ghi nhận các lượt của giao thức và có thể khắc CST tham gia động theo công thức của hợp đồng thông minh. Khi đếm ngược hoàn tất về 0, người tham gia đặt nét bút cuối cùng có thể nhận về phân bổ Signature. Các phân bổ khác được phân phối theo cấu trúc luồng phân bổ đã công bố.',
        },
        {
          id: 'dynamic-cst',
          subtitle: 'Lần khắc CST động',
          text: 'Trong V3, nét bút tiếp theo khắc toàn bộ CST tham gia cho người đặt nét bút trước. Số lượng tăng tuyến tính theo thời gian giữa hai nét bút. Nét bút đầu tiên của chu kỳ không khắc CST theo quy tắc này, và hoàn tất không thanh toán thêm khoảng thời gian cuối cho người đặt nét bút cuối cùng. Nếu cả hai nét bút thuộc cùng một địa chỉ, địa chỉ đó nhận CST.',
        },
        {
          id: 'cst-window',
          subtitle: 'Cửa sổ hiệu chỉnh CST',
          text: 'V3 lưu tốc độ giảm chi phí CST; độ dài cửa sổ được tính từ tốc độ và mức trần. Nét bút ETH thử tăng tốc độ theo rate + floor(rate / 100), còn nét bút CST giảm theo rate - floor(rate / 101). Nếu mức tăng vi phạm điều kiện thời lượng tối thiểu, nó không được áp dụng. Nét bút CST đặt lại mức trần bằng giá trị lớn nhất giữa hai lần chi phí CST cơ sở chưa có phụ phí, mức tối thiểu đã cấu hình, và tốc độ mới nhân 180 giây. Bạn vẫn có thể đặt nét bút tiếp theo ngay lập tức.',
        },
        {
          id: 'smart-contract',
          subtitle: 'Tương tác với hợp đồng thông minh',
          text: 'Mọi hành động của giao thức được thực thi qua các hợp đồng thông minh trên mạng Arbitrum. Một khi giao dịch đã được xác nhận trên chuỗi, nó không thể đảo ngược. Bạn xác nhận rằng giao dịch blockchain là cuối cùng và không thể hoàn tác.',
        },
        {
          id: 'gas',
          subtitle: 'Phí gas',
          text: 'Bạn chịu trách nhiệm trả toàn bộ phí gas của mạng Arbitrum gắn với giao dịch của mình. Phí gas tách biệt với chi phí nét bút và được trả cho mạng, không phải cho Cosmic Signature.',
        },
        {
          id: 'random-walk',
          subtitle: 'Giảm chi phí với Random Walk NFT',
          text: `Một Random Walk NFT có thể được đính kèm một lần vào nét bút ETH để giảm ${protocolFacts.randomWalkDiscountPercentage}% chi phí nét bút ETH. Hành động này là vĩnh viễn và không thể hoàn tác. Sau khi sử dụng, Random Walk NFT không thể dùng lại để giảm chi phí.`,
        },
      ],
    },
    {
      id: 'allocations',
      title: 'Phân bổ và phân phối',
      content: [
        {
          id: 'distribution',
          subtitle: 'Phân phối phân bổ',
          text: `Khi có đủ các luồng, một chu kỳ khắc ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT và ${formatCount(protocolFacts.typicalCstImprintsPerCycle, 'vi')} CST trong các phân bổ cố định. Phân bổ Signature gồm ${protocolFacts.mainPrizeNftsPerCycle} NFT nhưng chỉ một khoản tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST. Chiến binh Thời gian, Quán quân Bền bỉ và nét bút CST cuối cùng mỗi luồng có một NFT cùng CST tương ứng; hai luồng NFT Tinh tuyển bổ sung phần còn lại. Nếu không có nét bút CST hoặc Random Walk NFT neo giữ thì luồng tương ứng bị bỏ qua. CST tham gia được tính riêng.`,
        },
        {
          id: 'signature',
          subtitle: 'Phân bổ Signature',
          text: `Địa chỉ hoàn tất chu kỳ thành công nhận ${protocolFacts.mainEthPercentage}% Dự trữ chu kỳ, tổng cộng ${formatCount(protocolFacts.specialAllocationCst, 'vi')} CST và ${protocolFacts.mainPrizeNftsPerCycle} Cosmic Signature NFT có ID liên tiếp. Trong ${protocolFacts.finalGestureExclusivityHours} giờ đầu sau thời điểm hoàn tất, chỉ người đặt nét bút cuối cùng được thực hiện; sau đó bất kỳ ai cũng có thể hoàn tất và tự nhận phân bổ.`,
        },
        {
          id: 'chrono',
          subtitle: 'Chiến binh Thời gian',
          text: `Người tham gia giữ vị trí Quán quân Bền bỉ trong khoảng liên tục dài nhất nhận ${protocolFacts.chronoWarriorEthPercentage}% ETH, ${cstAmount} CST ghi nhận và một Cosmic Signature NFT.`,
        },
        {
          id: 'endurance',
          subtitle: 'Quán quân Bền bỉ',
          text: `Người tham gia có khoảng giữ vị trí nét bút gần nhất liên tục dài nhất nhận ${cstAmount} CST ghi nhận và một Cosmic Signature NFT.`,
        },
        {
          id: 'final-cst',
          subtitle: 'Nét bút CST cuối cùng',
          text: `Người tham gia đặt nét bút CST cuối cùng của chu kỳ nhận ${cstAmount} CST ghi nhận và một Cosmic Signature NFT.`,
        },
        {
          id: 'eth-selection',
          subtitle: 'ETH Tinh tuyển',
          text: `Khi hoàn tất, giao thức thử chuyển ${protocolFacts.publicGoodsPercentage}% Dự trữ chu kỳ vào Kho Hàng hóa công. Sau đó bất kỳ ai cũng có thể dùng một giao dịch riêng để chuyển số dư kho tới đơn vị thụ hưởng hiện tại là Protocol Guild. Chủ sở hữu có thể thay đổi đơn vị thụ hưởng. Nếu chuyển từ giao thức vào kho thất bại, phần này có thể ở lại dự trữ mà không hủy hoàn tất.`,
        },
        {
          id: 'nft-selection',
          subtitle: 'NFT Tinh tuyển',
          text: `${protocolFacts.nftStellarSelectionRecipients} người tham gia được chọn, mỗi người nhận ${cstAmount} CST ghi nhận và một Cosmic Signature NFT.`,
        },
        {
          id: 'anchored-selection',
          subtitle: 'Tinh tuyển NFT neo giữ',
          text: `${protocolFacts.anchoredRwlkNftSelectionRecipients} người neo giữ RandomWalk NFT được chọn, mỗi người nhận ${cstAmount} CST ghi nhận và một Cosmic Signature NFT.`,
        },
        {
          id: 'anchor-distribution',
          subtitle: 'Phân phối neo giữ',
          text: `${protocolFacts.anchorDistributionPercentage}% ETH được phân phối theo tỷ lệ cho mọi Cosmic Signature NFT đang neo giữ.`,
        },
        {
          id: 'public-goods',
          subtitle: 'Hàng hóa công',
          text: 'Cả ETH Tinh tuyển và NFT Tinh tuyển dành cho người tham gia đều dùng trọng số từng nét bút. Trọng số là chi phí ETH cơ sở tại thời điểm đó, chưa giảm bằng Random Walk NFT và chưa cộng phụ phí cuối chu kỳ. Nét bút CST dùng cùng chi phí ETH cơ sở đương thời. Các lượt chọn có hoàn lại, nên một địa chỉ có thể được chọn nhiều lần. Tinh tuyển NFT neo giữ xét riêng các Random Walk NFT đang neo giữ.',
        },
        {
          id: 'compounding',
          subtitle: 'Dự trữ tích lũy',
          text: `Khoảng ${protocolFacts.compoundingReservePercentage}% Dự trữ chu kỳ chuyển tiếp vào chu kỳ trình diễn tiếp theo.`,
        },
        {
          id: 'outreach',
          subtitle: 'Dự trữ truyền thông',
          text: `${protocolFacts.outreachReserveCst.toLocaleString('vi-VN')} CST mỗi chu kỳ được khắc cho các đợt phân phối truyền thông và những người đóng góp cho hệ sinh thái.`,
        },
        {
          id: 'retrieval',
          subtitle: 'Nhận về phân bổ',
          text: `Một số phân bổ cần được nhận về thủ công qua nền tảng. Người tham gia đủ điều kiện nhận phân bổ Signature có ${protocolFacts.finalGestureExclusivityHours} giờ sau thời điểm hoàn tất chu kỳ để hoàn tất chu kỳ một cách độc quyền. Sau cửa sổ đó, bất kỳ ai cũng có thể hoàn tất chu kỳ, và theo quy tắc của hợp đồng thông minh, người hoàn tất trở thành người nhận của chu kỳ và nhận phân bổ Signature. Các phân bổ ETH phụ cùng phân bổ token hoặc NFT đính kèm dùng một thời hạn nhận về riêng, mặc định là ${protocolFacts.secondaryRetrievalTimeoutWeeks} tuần; sau khi hết hạn, các hợp đồng thông minh cho phép bất kỳ ai nhận về các phân bổ chưa được nhận cho chính họ. Bạn chịu trách nhiệm nhận về phân bổ của mình trước khi các thời hạn này kết thúc.`,
        },
        {
          id: 'no-guarantee',
          subtitle: 'Không bảo đảm kết quả',
          text: 'Việc tham gia Cosmic Signature không bảo đảm bất kỳ kết quả nào. Mọi nét bút đã được xác nhận đều không thể hoàn tác, và bạn có thể mất một phần hoặc toàn bộ chi phí nét bút. Không bao giờ đặt nét bút bằng số tiền bạn không thể chấp nhận mất.',
        },
      ],
    },
    {
      id: 'risks',
      title: 'Rủi ro và tuyên bố miễn trừ',
      content: [
        {
          id: 'blockchain-risk',
          subtitle: 'Rủi ro của công nghệ blockchain',
          text: 'Bạn xác nhận các rủi ro cố hữu của công nghệ blockchain, bao gồm nhưng không giới hạn ở: lỗ hổng hợp đồng thông minh, tắc nghẽn mạng, biến động giá gas, thay đổi về quy định pháp lý và nguy cơ mất tài sản do sự cố kỹ thuật.',
        },
        {
          id: 'warranties',
          subtitle: 'Không bảo hành',
          text: 'Cosmic Signature được cung cấp “nguyên trạng”, không có bất kỳ bảo hành nào, dù rõ ràng hay ngụ ý. Chúng tôi không bảo đảm rằng nền tảng sẽ hoạt động không gián đoạn, không lỗi hay không có thành phần gây hại.',
        },
        {
          id: 'volatility',
          subtitle: 'Biến động thị trường',
          text: 'Thị trường tiền mã hóa và NFT biến động rất mạnh. Giá trị của ETH, token CST và NFT có thể dao động đáng kể. Diễn biến trong quá khứ không phản ánh kết quả tương lai.',
        },
        {
          id: 'audits',
          subtitle: 'Kiểm toán hợp đồng thông minh',
          text: 'Dù chúng tôi nỗ lực bảo đảm an toàn cho các hợp đồng thông minh của mình, không cuộc kiểm toán nào có thể bảo đảm an toàn tuyệt đối; xem <audits>Kiểm toán</audits> để biết những gì đã được kiểm tra. Bạn sử dụng nền tảng với rủi ro của chính mình.',
        },
      ],
    },
    {
      id: 'prohibited',
      title: 'Hành vi bị cấm',
      content: [
        {
          id: 'intro',
          text: 'Bạn đồng ý không thực hiện bất kỳ hành vi bị cấm nào sau đây:',
        },
      ],
      bullets: [
        'Cố tình thao túng hoặc lợi dụng cơ chế giao thức thông qua lỗi, trục trặc hoặc lỗ hổng',
        'Dùng bot, kịch bản hoặc công cụ tự động để tương tác với nền tảng',
        'Tham gia bất kỳ hình thức thao túng thị trường hoặc thông đồng với người dùng khác',
        'Cố tình tấn công, dịch ngược hoặc phá vỡ bảo mật của nền tảng',
        'Vi phạm bất kỳ luật hoặc quy định áp dụng nào',
        'Tạo nhiều tài khoản để giành lợi thế không công bằng',
        'Tải lên nội dung độc hại hoặc cố tình tấn công từ chối dịch vụ',
      ],
    },
  ],
  additionalTitle: 'Điều khoản bổ sung',
  additional: [
    {
      id: 'intellectual-property',
      subtitle: 'Sở hữu trí tuệ',
      text: 'Tài liệu của dự án thuộc phạm vi tệp <license>LICENSE</license> ở thư mục gốc của kho mã được công bố theo CC0 1.0. Các phụ thuộc bên thứ ba, phông chữ, tài sản và tài liệu bên thứ ba khác giữ giấy phép riêng của chúng và không nằm trong phạm vi đó; xem <notices>THIRD_PARTY_NOTICES.md</notices>. CC0 không từ bỏ quyền nhãn hiệu hay quyền sáng chế. Bất kỳ tài liệu nào không thuộc phạm vi CC0 hoặc một giấy phép mã nguồn mở đã nêu vẫn thuộc sở hữu của chủ thể quyền tương ứng và được bảo hộ theo luật sở hữu trí tuệ áp dụng. NFT nhận qua giao thức trao cho bạn quyền sở hữu token cụ thể đó, nhưng không trao quyền sở hữu trí tuệ nền tảng trừ khi được nêu rõ.',
    },
    // lexicon-allow-start: boilerplate limitation-of-liability language must preserve "profits".
    {
      id: 'liability',
      subtitle: 'Giới hạn trách nhiệm',
      text: 'Trong phạm vi tối đa pháp luật cho phép, Cosmic Signature và các bên liên kết không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hay mang tính trừng phạt nào, bất kỳ tổn thất lợi nhuận hay doanh thu nào, dù phát sinh trực tiếp hay gián tiếp, hay bất kỳ tổn thất về dữ liệu, quyền sử dụng, uy tín hoặc các tổn thất vô hình khác do việc bạn sử dụng nền tảng.',
    },
    // lexicon-allow-end
    {
      id: 'indemnification',
      subtitle: 'Bồi hoàn',
      text: 'Bạn đồng ý bồi hoàn và giữ cho Cosmic Signature cùng các bên liên kết không bị tổn hại trước bất kỳ khiếu nại, tổn thất, thiệt hại, trách nhiệm và chi phí nào (bao gồm phí pháp lý) phát sinh từ việc bạn sử dụng nền tảng, việc bạn vi phạm các điều khoản này hoặc vi phạm bất kỳ quyền nào của bên khác.',
    },
    {
      id: 'disputes',
      subtitle: 'Giải quyết tranh chấp',
      text: 'Mọi tranh chấp phát sinh từ các điều khoản này hoặc từ việc bạn sử dụng Cosmic Signature sẽ được giải quyết thông qua trọng tài có phán quyết ràng buộc theo quy tắc của Hiệp hội Trọng tài Hoa Kỳ. Bạn từ bỏ mọi quyền được xét xử bởi bồi thẩm đoàn hoặc tham gia vụ kiện tập thể.',
    },
    {
      id: 'law',
      subtitle: 'Luật điều chỉnh',
      text: 'Các điều khoản này được điều chỉnh và giải thích theo luật của khu vực pháp lý nơi Cosmic Signature hoạt động, không xét đến các quy định về xung đột pháp luật.',
    },
    {
      id: 'severability',
      subtitle: 'Tính tách biệt',
      text: 'Nếu bất kỳ điều khoản nào trong các điều khoản này bị xem là vô hiệu hoặc không thể thi hành, các điều khoản còn lại vẫn tiếp tục có hiệu lực đầy đủ.',
    },
    {
      id: 'agreement',
      subtitle: 'Toàn bộ thỏa thuận',
      text: 'Các điều khoản này tạo thành toàn bộ thỏa thuận giữa bạn và Cosmic Signature về việc bạn sử dụng nền tảng và thay thế mọi thỏa thuận trước đó.',
    },
    {
      id: 'contact',
      subtitle: 'Thông tin liên hệ',
      text: 'Nếu bạn có câu hỏi về Điều khoản dịch vụ này, hãy liên hệ với chúng tôi qua <support>support@cosmicsignature.com</support>, trên <discord>Discord</discord>, <x>X</x> hoặc qua <frontendRepository>kho mã GitHub</frontendRepository>.',
    },
  ],
  // lexicon-allow-start: Howey-test denial copy must explicitly negate an investment framing.
  warning: {
    title: 'Cảnh báo quan trọng',
    text: 'Tham gia Cosmic Signature có rủi ro tài chính. Thị trường tiền mã hóa và NFT biến động rất mạnh, và bạn có thể mất giá trị đã bỏ vào các nét bút. Không bao giờ đặt nét bút bằng số tiền bạn không thể chấp nhận mất. Cosmic Signature không phải là sản phẩm đầu tư, không đưa ra cam kết nào về giá token hay diễn biến tương lai, và không mời gọi tham gia như một khoản đầu tư. Hãy luôn tự tìm hiểu và cân nhắc kỹ tình hình tài chính của mình trước khi tham gia.',
  },
  // lexicon-allow-end
  allocationsTable: {
    title: 'Tổng quan các luồng phân bổ',
    sharedBy: '{percent}, chia cho {count} người',
    each: '{count} × {amount}',
  },
  acknowledgment: {
    title: 'Xác nhận',
    text: 'Khi sử dụng Cosmic Signature, bạn xác nhận rằng mình đã đọc, hiểu và đồng ý chịu ràng buộc bởi Điều khoản dịch vụ này. Bạn cũng xác nhận rằng mình hiểu các rủi ro gắn với công nghệ blockchain, tiền mã hóa và NFT.',
  },
} as const satisfies TermsCopy;
