import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

/**
 * Basic tier: the shape of the protocol. Scenario-first where possible;
 * every distractor is a misconception someone actually holds. Facts and
 * numbers interpolate from protocolFacts and match the white paper.
 */
export const basicQuestionsTextVi = {
  'what-is-cosmic-signature': {
    prompt: 'Một người bạn hỏi bạn Cosmic Signature thực sự là gì. Câu trả lời nào đúng?',
    options: {
      a: 'Một giao thức nghệ thuật tạo sinh trên chuỗi Arbitrum, vận hành như một chuỗi các chu kỳ trình diễn có giới hạn thời gian.',
      b: 'Một dịch vụ hình ảnh AI biến câu lệnh văn bản thành ảnh vũ trụ.',
      c: 'Một cơ sở dữ liệu về chữ ký đột biến ung thư dành cho các nhà sinh học.',
      d: 'Một dịch vụ dự báo giá cho các bộ sưu tập NFT.',
    },
    explanation:
      'Cosmic Signature là một giao thức nghệ thuật tạo sinh: các chu kỳ trình diễn có giới hạn thời gian đầy dần bằng nét bút, và việc hoàn tất khắc nên tác phẩm ba vật thể tất định. Không có AI ở bất kỳ đâu trong quy trình — nghệ thuật là vật lý tính từ một seed, điều trái ngược hoàn toàn với dịch vụ hình ảnh từ câu lệnh văn bản.',
    funFact:
      'Cái tên trùng với COSMIC, một cơ sở dữ liệu đột biến ung thư nổi tiếng. Giao thức không liên quan gì đến nó — tài liệu nêu rõ sự phân biệt này.',
    referenceLabel: 'Học: Cosmic Signature là gì?',
  },
  'what-is-a-gesture': {
    prompt: 'Theo ngôn ngữ của giao thức, nét bút là gì?',
    options: {
      a: 'Một hành động nhỏ trên chuỗi mang ETH hoặc CST, kéo dài đếm ngược của chu kỳ và ghi nhận một lượt Tinh tuyển.',
      b: 'Một chữ ký ngoài chuỗi thu thập cho một bản kiến nghị của cộng đồng.',
      c: 'Một vệt màu bạn tự vẽ bằng tay rồi được thêm vào tác phẩm.',
      d: 'Một lời nhắn đăng trong các kênh cộng đồng.',
    },
    explanation:
      'Nét bút là đầu vào duy nhất của giao thức. Mỗi nét bút mang ETH hoặc CST, đẩy thời điểm hoàn tất chu kỳ xa hơn, ghi nhận một lượt trong Tinh tuyển của chu kỳ và có thể khắc CST tham gia. Bạn không bao giờ vẽ gì bằng tay — tác phẩm được tính từ một seed khi hoàn tất.',
    referenceLabel: 'Sách trắng \u00a74 \u2014 Nét bút',
  },
  'two-currencies': {
    prompt: 'Một nét bút có thể mang những loại tiền nào?',
    options: {
      a: 'ETH hoặc CST, token ERC-20 riêng của giao thức.',
      b: 'Chỉ ETH.',
      c: 'Chỉ CST.',
      d: 'Bất kỳ ERC-20 nào, kể cả stablecoin.',
    },
    explanation:
      'Có đúng hai lối vào: nét bút ETH và nét bút CST. Các token ERC-20 khác có thể được đính kèm vào nét bút như một tài sản đi kèm, nhưng chúng không bao giờ thanh toán cho chính nét bút — chi phí nét bút chỉ được thanh toán bằng ETH hoặc CST.',
    referenceLabel: 'Sách trắng \u00a74 \u2014 Nét bút',
  },
  'countdown-extension': {
    prompt:
      'Nova đặt một nét bút khi đếm ngược của chu kỳ vẫn còn nhiều thời gian. Nét bút của cô làm gì với đồng hồ?',
    options: {
      a: 'Nó cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất chu kỳ đã lưu.',
      b: `Nó đặt lại đếm ngược về ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ mới.`,
      c: 'Nó rút ngắn đếm ngược, đẩy chu kỳ về phía hoàn tất.',
      d: 'Không gì cả \u2014 chỉ nét bút ETH mới dịch chuyển đồng hồ.',
    },
    explanation: `Mỗi nét bút, dù ETH hay CST, đều cộng mức tăng thời gian hiện tại vào thời điểm hoàn tất đã lưu. Không gì đặt lại đồng hồ về một khoảng cố định \u2014 con số ${protocolFacts.initialCycleFinalizationHoursAtLaunch} giờ chỉ là đếm ngược ban đầu sau nét bút mở của một chu kỳ với các tham số lúc ra mắt.`,
    referenceLabel: 'Sách trắng \u00a73.2 \u2014 Đếm ngược',
  },
  'final-gesture-role': {
    prompt: 'Đếm ngược vừa hết hạn. Ai đủ điều kiện hoàn tất chu kỳ trước tiên?',
    options: {
      a: 'Người tham gia có nét bút đứng cuối \u2014 nét bút cuối cùng.',
      b: 'Người tham gia đặt nhiều nét bút nhất trong chu kỳ.',
      c: 'Chủ sở hữu giao thức.',
      d: 'Người tham gia đặt nét bút mở chu kỳ.',
    },
    explanation:
      'Khi thời điểm hoàn tất chu kỳ hết hạn, người đặt nét bút cuối cùng đủ điều kiện hoàn tất, và ban đầu là độc quyền. Khối lượng không bao giờ quan trọng ở đây: một nét bút đúng lúc đứng cuối vượt lên trên hàng trăm nét bút trước đó.',
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'sleepy-beneficiary': {
    prompt:
      'Đếm ngược đã hết hạn hai ngày trước và người đặt nét bút cuối cùng im lặng. Bạn gọi hoàn tất từ ví của mình. Điều gì xảy ra?',
    options: {
      a: 'Chu kỳ hoàn tất và bạn trở thành người nhận của nó \u2014 phần ETH, CST và NFT là của bạn.',
      b: 'Giao dịch bị hoàn nguyên; chỉ người đặt nét bút cuối cùng mới có thể hoàn tất.',
      c: 'Chu kỳ hoàn tất, nhưng người đặt nét bút cuối cùng vẫn nhận mọi thứ.',
      d: 'Không gì xảy ra cho đến khi Hội đồng Vũ trụ biểu quyết can thiệp.',
    },
    explanation: `Người đặt nét bút cuối cùng giữ quyền độc quyền trong ${protocolFacts.finalGestureExclusivityHours} giờ. Sau đó, cửa sổ hoàn tất mở bắt đầu: bất kỳ ai cũng có thể hoàn tất, và hợp đồng coi người làm việc đó là người nhận của chu kỳ, cùng mọi thứ vai trò này mang theo. Quy tắc cố ý không nhân nhượng \u2014 nó giữ giao thức sống nếu một người tham gia biến mất, và nó khiến sự bất cẩn phải trả một cái giá.`,
    funFact:
      'Không gì trong giao thức chờ mãi một người tham gia vắng mặt. Mọi thời hạn cuối cùng đều mở ra cho người gọi đầu tiên.',
    referenceLabel: 'Sách trắng \u00a73.3 \u2014 Hoàn tất',
  },
  'signature-allocation-share': {
    prompt: 'Phân bổ Signature mang phần nào của Dự trữ chu kỳ khi hoàn tất?',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `Phân bổ Signature là ${protocolFacts.mainEthPercentage}% số dư ETH của giao thức, đọc một lần vào khoảnh khắc hoàn tất. Con số ${protocolFacts.compoundingReservePercentage}% là phần hoàn toàn không được phân phối \u2014 nó chuyển tiếp làm Dự trữ tích lũy.`,
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'compounding-reserve': {
    prompt: 'Vì sao mỗi chu kỳ trình diễn mở ra với dự trữ lớn hơn chu kỳ trước?',
    options: {
      a: `Khoảng ${protocolFacts.compoundingReservePercentage}% dự trữ của mỗi chu kỳ không bao giờ được phân phối \u2014 nó chuyển tiếp vào chu kỳ tiếp theo.`,
      b: 'Đội ngũ bổ sung dự trữ giữa các chu kỳ.',
      c: 'Giao thức khắc ETH mới mỗi chu kỳ.',
      d: 'Hội đồng Vũ trụ biểu quyết đưa ETH mới vào dự trữ.',
    },
    explanation:
      'Năm luồng ETH được phân phối cộng lại bằng một nửa dự trữ; phần còn lại tự động tích lũy. Không ai bổ sung gì, và không giao thức nào có thể khắc ETH \u2014 sự tăng trưởng hoàn toàn mang tính cơ học. Giao thức tích lũy thay vì rút ra.',
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'art-engine': {
    prompt: 'Điều gì thực sự tạo ra một tác phẩm Cosmic Signature?',
    options: {
      a: 'Một mô phỏng vật lý tất định của bài toán ba vật thể hấp dẫn, lấy seed từ dữ liệu trên chuỗi.',
      b: 'Một mô hình khuếch tán được tinh chỉnh trên ảnh chụp vũ trụ.',
      c: 'Một nghệ sĩ vẽ từng tác phẩm rồi tải lên.',
      d: 'Một bộ tạo điểm ảnh ngẫu nhiên với bảng màu vũ trụ.',
    },
    explanation:
      'Ba vật thể có khối lượng tương đương quay quanh nhau dưới lực hấp dẫn Newton; seed quyết định điều kiện khởi đầu và vật lý làm phần còn lại. Không có mô hình tạo sinh nào tham gia ở bất kỳ giai đoạn nào \u2014 không dữ liệu huấn luyện, không lấy mẫu, không câu lệnh. Lý thuyết hỗn độn, không phải sự ngẫu nhiên, là điều làm mỗi Signature độc nhất.',
    funFact:
      'Bài toán ba vật thể không có nghiệm dạng đóng tổng quát. Một thay đổi không thể nhận ra trong điều kiện khởi đầu tạo ra một vũ điệu hoàn toàn khác.',
    referenceLabel: 'Sách trắng \u00a76 \u2014 Nghệ thuật',
  },
  'same-seed': {
    prompt:
      'Bạn chạy lại quy trình nghệ thuật mã nguồn mở với đúng seed lưu trên chuỗi của token #42. Kết quả là gì?',
    options: {
      a: 'Hình ảnh giống hệt, đến từng điểm ảnh, trên bất kỳ máy nào.',
      b: 'Một hình ảnh tương tự với những biến thể ngẫu nhiên nhỏ.',
      c: 'Một hình ảnh khác trên phần cứng khác.',
      d: 'Chỉ một bản xem trước độ phân giải thấp; tác phẩm đầy đủ cần máy chủ của dự án.',
    },
    explanation:
      'Tính tất định được bảo đảm bằng cơ chế, không phải giả định: cùng seed tạo ra cùng hình ảnh, đến từng bit, trên bất kỳ máy nào. Mã băm SHA-256 của các khung hình đã kết xuất được kiểm định trong tích hợp liên tục, nên bất kỳ sai lệch đầu ra nào cũng làm bản dựng thất bại.',
    referenceLabel: 'Sách trắng \u00a76.2 \u2014 Khả năng tái tạo và giấy phép',
  },
  'cst-supply-origin': {
    prompt: 'CST đến từ đâu?',
    options: {
      a: 'Nguồn cung bắt đầu từ không, và chỉ hợp đồng giao thức mới có thể khắc nó \u2014 mọi CST đều truy về việc tham gia một chu kỳ.',
      b: 'Một phần lớn được tạo cho đội ngũ khi ra mắt.',
      c: 'Nó được phân phát cho các ví sớm trước khi ra mắt.',
      d: 'Bất kỳ ai cũng có thể khắc CST bằng cách gọi hợp đồng token.',
    },
    explanation:
      'Hợp đồng token CST chỉ nhận lệnh khắc và đốt từ hợp đồng giao thức, và nguồn cung bắt đầu từ không. Không có giới hạn, không khắc trước, không phần dành cho đội ngũ \u2014 sự tham gia kiên nhẫn là nguồn duy nhất của CST mới.',
    referenceLabel: 'Sách trắng \u00a77 \u2014 Token CST',
  },
  'cst-on-spend': {
    prompt: 'Rio chi một ít CST cho một nét bút. Số CST đó đi đâu?',
    options: {
      a: 'Nó bị đốt \u2014 loại bỏ vĩnh viễn khỏi nguồn cung.',
      b: 'Nó vào kho của đội ngũ.',
      c: 'Nó nhập vào Dự trữ chu kỳ và được phân phối lại khi hoàn tất.',
      d: 'Nó được trả lại cho Rio khi chu kỳ hoàn tất.',
    },
    explanation:
      'Toàn bộ chi phí của mỗi nét bút CST bị đốt. Điều đó gắn nguồn cung của token với việc sử dụng thực tế: chu kỳ yên ắng khắc ít, và hoạt động CST sôi động đốt nguồn cung xuống. Không gì chảy vào bất kỳ kho nào \u2014 chẳng có kho nào cả.',
    referenceLabel: 'Sách trắng \u00a77.2 \u2014 Đốt và động lực nguồn cung',
  },
  'public-goods-beneficiary': {
    prompt: `Mỗi chu kỳ chuyển ${protocolFacts.publicGoodsPercentage}% dự trữ làm phân bổ Hàng hóa công. Ai nhận nó hôm nay?`,
    options: {
      a: 'Protocol Guild \u2014 cơ chế tài trợ cho hơn 170 người đóng góp cốt lõi cho Ethereum.',
      b: 'Ví vận hành của đội ngũ giao thức.',
      c: 'Các validator của Arbitrum.',
      d: 'Một người nắm giữ NFT được chọn ngẫu nhiên.',
    },
    explanation:
      'Kho Hàng hóa công chuyển phần của mình đến Protocol Guild, và việc chuyển này được thực thi trên chuỗi như một phần của hoàn tất \u2014 không ai quyết định mỗi chu kỳ có tôn trọng nó hay không. Lý do: một giao thức sống trên hạ tầng công cộng nên tài trợ cho nó một cách cơ học, theo lịch, công khai.',
    referenceLabel: 'Sách trắng \u00a710 \u2014 Hàng hóa công',
  },
  'anchoring-basic': {
    prompt: 'Mira neo giữ Cosmic Signature NFT của mình với giao thức. Neo giữ mang lại gì cho cô?',
    options: {
      a: `Trong khi neo giữ, NFT tích lũy một phần theo tỷ lệ của ${protocolFacts.anchorDistributionPercentage}% phân phối neo giữ mỗi chu kỳ, nhận về khi gỡ neo.`,
      b: 'Nó niêm yết NFT để bán trên sàn.',
      c: 'Nó chuyển NFT thành CST.',
      d: 'Nó kết xuất lại tác phẩm với một seed mới.',
    },
    explanation:
      'Neo giữ là hình thức gắn kết dài hạn của giao thức: các Cosmic Signature NFT đang neo giữ chia sẻ phân phối neo giữ theo tỷ lệ, và ETH tích lũy được nhận về khi gỡ neo. Chính NFT không bao giờ thay đổi \u2014 seed và tác phẩm của nó là vĩnh viễn.',
    referenceLabel: 'Sách trắng \u00a78 \u2014 Neo giữ',
  },
  'anchor-once-ever': {
    prompt: 'Sau đó Mira gỡ neo. Tháng sau cô có thể neo giữ lại NFT đó không?',
    options: {
      a: 'Không \u2014 mỗi NFT chỉ được neo giữ đúng một lần. Gỡ neo là vĩnh viễn.',
      b: 'Có, sau một thời gian chờ ngắn.',
      c: 'Có, bằng cách trả thêm chi phí.',
      d: 'Có, nhưng chỉ trong cùng chu kỳ.',
    },
    explanation:
      'Quy tắc một-lần-duy-nhất thay lịch khóa thông thường bằng một lựa chọn không thể đảo ngược, cho tập hợp đang neo giữ một cái giá thực sự khi rời đi. Giữ một NFT neo giữ là quyết định sống động mỗi chu kỳ; gỡ neo là quyết định vĩnh viễn.',
    referenceLabel: 'Sách trắng \u00a78 \u2014 Neo giữ',
  },
  'random-walk-perk': {
    prompt: 'Sol sở hữu một Random Walk NFT và đính kèm nó vào một nét bút ETH. Điều gì xảy ra?',
    options: {
      a: `Chi phí của nét bút đó giảm ${protocolFacts.randomWalkDiscountPercentage}%; NFT vẫn ở trong ví của Sol nhưng được đánh dấu đã dùng, một lần duy nhất.`,
      b: 'NFT được chuyển cho giao thức để đổi lấy mức giảm.',
      c: 'Nét bút trở thành không tốn chi phí.',
      d: 'NFT nhân đôi lượng CST tham gia mà nét bút khắc.',
    },
    explanation: `Đính kèm một Random Walk NFT giảm chi phí của một nét bút ETH ${protocolFacts.randomWalkDiscountPercentage}%. NFT không được chuyển đi \u2014 hợp đồng chỉ đánh dấu nó đã dùng. Mỗi Random Walk NFT chỉ có thể đính kèm đúng một lần qua mọi chu kỳ, điều khiến mức giảm trở thành một tài nguyên tiêu hao.`,
    referenceLabel: 'Sách trắng \u00a74.2 \u2014 Đính kèm Random Walk NFT',
  },
  'first-gesture-currency': {
    prompt: 'Một chu kỳ mới vừa kích hoạt. Nét bút nào có thể mở nó?',
    options: {
      a: 'Một nét bút ETH \u2014 nét bút CST khả dụng từ nét bút thứ hai trở đi.',
      b: 'Một nét bút CST, vì CST là token riêng của giao thức.',
      c: 'Loại tiền nào cũng được cho nét bút mở.',
      d: 'Chỉ chủ sở hữu giao thức mới có thể mở chu kỳ.',
    },
    explanation:
      'Mọi chu kỳ đều phải mở bằng một nét bút ETH, định giá bởi cửa sổ hiệu chỉnh ETH. Khi chu kỳ đã chạy, CST cho một lối vào thứ hai. Không tài khoản đặc quyền nào mở chu kỳ \u2014 ai đặt nét bút mở thì người đó mở.',
    referenceLabel: 'Sách trắng \u00a74.3 \u2014 Nét bút CST',
  },
  'message-on-gesture': {
    prompt: 'Ngoài giá trị, một nét bút có thể mang gì?',
    options: {
      a: `Một lời nhắn tối đa ${protocolFacts.gestureMessageMaxLength} byte được ghi trên chuỗi, cộng với token ERC-20 hoặc một NFT ERC-721 đính kèm.`,
      b: 'Không gì cả \u2014 nét bút chỉ là chuyển giá trị.',
      c: 'Một tệp hình ảnh lưu trong hợp đồng.',
      d: 'Văn bản không giới hạn, lưu ngoài chuỗi.',
    },
    explanation: `Một nét bút có thể mang lời nhắn tối đa ${protocolFacts.gestureMessageMaxLength} byte, ghi trên chuỗi cùng với nó, và có thể đính kèm token hoặc một NFT. Tài sản đính kèm được ví phân bổ giữ, nơi người nhận của chu kỳ có quyền ưu tiên nhận về chúng sau khi hoàn tất.`,
    funFact:
      'Mọi lời nhắn từng được đính kèm vào nét bút đều có thể đọc vĩnh viễn trên Arbitrum \u2014 một cuốn sổ lưu bút công khai đan xuyên các chu kỳ.',
    referenceLabel: 'Sách trắng \u00a74.4 \u2014 Lời nhắn và tài sản đính kèm',
  },
  'who-runs-cycles': {
    prompt: 'Ai quyết định ETH của mỗi chu kỳ được phân phối thế nào?',
    options: {
      a: 'Không ai \u2014 tỷ lệ phân bổ là các hằng số trong hợp đồng đã xác minh, thực thi cơ học khi hoàn tất.',
      b: 'Đội ngũ xem xét từng chu kỳ và ký duyệt phân phối.',
      c: 'Một dịch vụ oracle tính toán cách chia.',
      d: 'Máy chủ backend của ứng dụng phát lệnh chuyển.',
    },
    explanation:
      'Phân phối cơ học là một trong ba đặc tính neo của giao thức: không tài khoản tùy quyết nào đứng giữa người tham gia và quy tắc phân phối, và không ví nào của đội ngũ nhận ETH từ nét bút. Ứng dụng và máy chủ chỉ hiển thị những gì hợp đồng đã làm.',
    referenceLabel: 'Sách trắng \u00a71 \u2014 Giới thiệu',
  },
  'nft-count-typical': {
    prompt: 'Một chu kỳ điển hình khắc bao nhiêu Cosmic Signature NFT?',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle}`,
      b: '1',
      c: `${protocolFacts.nftStellarSelectionRecipients}`,
      d: '100',
    },
    explanation: `Một chu kỳ điển hình khắc ${protocolFacts.typicalNftsPerCycle} NFT: ${protocolFacts.roleNftsPerCycle} NFT theo vai trò (người nhận, Chiến binh Thời gian, Quán quân Bền bỉ, nét bút CST cuối cùng), ${protocolFacts.nftStellarSelectionRecipients} NFT Tinh tuyển cho người tham gia và ${protocolFacts.anchoredRwlkNftSelectionRecipients} NFT Tinh tuyển cho Random Walk đang neo giữ. Chu kỳ bỏ qua một luồng thì khắc ít hơn.`,
    referenceLabel: 'Sách trắng \u00a75.1 \u2014 Phân phối khi hoàn tất',
  },
  'chrono-endurance-exist': {
    prompt: 'Các luồng Quán quân Bền bỉ và Chiến binh Thời gian đo điều gì?',
    options: {
      a: 'Sự bền bỉ theo thời gian \u2014 không phải ai đặt nét bút cuối hay nhiều nhất.',
      b: 'Ai chi nhiều ETH nhất trong chu kỳ.',
      c: 'Ai đặt nhiều nét bút nhất.',
      d: 'Ai đặt nét bút đầu tiên khi chu kỳ mở.',
    },
    explanation:
      'Cả hai luồng đo sự bền bỉ thay vì vị trí: Quán quân Bền bỉ giữ vị trí nét bút gần nhất trong khoảng liên tục dài nhất, và Chiến binh Thời gian giữ chính danh hiệu Quán quân Bền bỉ lâu nhất. Chi nhiều hơn hay đặt nhiều nét bút hơn không trực tiếp quyết định luồng nào.',
    referenceLabel: 'Sách trắng \u00a75.2 \u2014 Quán quân Bền bỉ và Chiến binh Thời gian',
  },
  'stellar-selection-what': {
    prompt: 'Tinh tuyển là gì?',
    options: {
      a: 'Các lượt theo từng nét bút được ghi nhận trong chu kỳ, từ đó hợp đồng chọn ra người nhận khi hoàn tất.',
      b: 'Một bảng xếp hạng người tham gia theo mức độ hoạt động.',
      c: 'Các bậc độ hiếm gán cho tác phẩm NFT.',
      d: 'Một cách đặt tên chòm sao trong nghệ thuật.',
    },
    explanation:
      'Mỗi nét bút ghi nhận một lượt vào quỹ Tinh tuyển của chu kỳ. Khi hoàn tất, hợp đồng chọn các lượt cho ETH Tinh tuyển và NFT Tinh tuyển, nên tần suất được chọn tỷ lệ với mức tham gia. Đây là một cơ chế phân phối, không phải một bảng xếp hạng.',
    referenceLabel: 'Sách trắng \u00a75.3 \u2014 Tinh tuyển',
  },
  'ecosystem-optionality': {
    prompt:
      'Ứng dụng, sàn và nền tảng dự đoán đều ngoại tuyến trong một ngày. Bạn vẫn có thể làm gì?',
    options: {
      a: 'Mọi thứ \u2014 mọi cơ chế đều có thể thực hiện trực tiếp với hợp đồng.',
      b: 'Không gì cả cho đến khi ứng dụng trở lại.',
      c: 'Chỉ nhận về phân bổ, không đặt nét bút.',
      d: 'Chỉ đặt nét bút bằng CST, không bằng ETH.',
    },
    explanation:
      'Hệ sinh thái xung quanh hợp đồng \u2014 ứng dụng, Axiom Zero, thanh khoản Uniswap, Chaos Zero \u2014 là tiện ích, không phải phụ thuộc. Không thứ nào là bắt buộc: nét bút, hoàn tất, neo giữ và nhận về đều hoạt động bằng cách gọi trực tiếp các hợp đồng đã xác minh.',
    referenceLabel: 'Sách trắng \u00a72 \u2014 Tổng quan giao thức',
  },
  'what-it-is-not': {
    prompt: 'Phát biểu nào khớp với cách sách trắng mô tả bản chất của giao thức?',
    options: {
      a: 'Người tham gia trao đổi giá trị để lấy chính sự tham gia, và giao thức không giữ lại bất kỳ biên lợi nào của người điều hành.',
      b: 'Có được CST là con đường đáng tin cậy để hưởng lợi tài chính từ công sức của người khác.',
      c: 'Một người điều hành giữ một tỷ lệ của mỗi chu kỳ cho mình.',
      d: 'Giao thức hứa rằng giá trị NFT sẽ tăng theo thời gian.',
    },
    explanation:
      'Mọi luồng phân bổ đều chảy đến người tham gia, các NFT đang neo giữ, dự trữ tích lũy hoặc hàng hóa công \u2014 không có biên lợi nào của người điều hành. Sách trắng không hứa hẹn gì về giá, thanh khoản hay giá trị tương lai, và nói thẳng rằng không ai nên có CST hay NFT với kỳ vọng hưởng lợi tài chính từ công sức của người khác.',
    referenceLabel: 'Sách trắng \u00a714.1 \u2014 Cosmic Signature không phải là gì',
  },
  'where-recorded': {
    prompt: 'Nét bút, seed và lịch sử chu kỳ thực sự nằm ở đâu?',
    options: {
      a: 'Trên chuỗi, trên Arbitrum One \u2014 một mạng Layer 2 của Ethereum.',
      b: 'Trong cơ sở dữ liệu riêng của dự án.',
      c: 'Chỉ trong các tệp IPFS do đội ngũ ghim.',
      d: 'Chúng không được ghi lại; chỉ giữ các tổng số.',
    },
    explanation:
      'Giao thức chạy trên Arbitrum One, và các bản ghi quan trọng \u2014 mỗi nét bút, mỗi seed, mỗi phân bổ \u2014 đều nằm trên chuỗi. Đó là điều làm nghệ thuật tái tạo được và phân phối kiểm chứng được bởi bất kỳ ai, mà không cần tin vào máy chủ nào.',
    referenceLabel: 'Học: Cosmic Signature trên Arbitrum',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
