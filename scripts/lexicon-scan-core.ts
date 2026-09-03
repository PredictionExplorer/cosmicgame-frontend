/**
 * Core scanner logic for the Cosmic Signature lexicon.
 *
 * Separate from the CLI entry point so unit tests can import these primitives
 * without triggering a filesystem walk or `process.exit`. The CLI
 * (scripts/lexicon-scan.ts) re-imports these and adds the walk and exit.
 *
 * Three independent matchers, each returning ScannerHit[]:
 *   - scanContent: string literals (original behavior). Internal-only literals
 *     are skipped — import paths, `id`/`data-testid`/`className` values, and
 *     quoted property keys (`'legacy-url-fragment': {…}`, JSON catalog keys).
 *   - scanJsxTextNodes: text rendered between JSX tags — catches user-visible
 *     text that string-literal scanning misses (e.g. `<span>Cosmic Staking</span>`).
 *   - scanIdentifiers: declared names containing a banned stem — guards against
 *     `useGestureForm`, `MyAnchors`, `mintPrice`, etc. leaking back into new code.
 *
 * Allow pragmas:
 *   // lexicon-allow-start: <reason>   — opens a block; all matchers skip until…
 *   // lexicon-allow-end                — …this line.
 *   // lexicon-allow-abi                — single-line allow for ABI calls
 *                                         (e.g. `contract.write.mint(...)`).
 *   // lexicon-allow-backend-type       — single-line allow for sealed backend
 *                                         wire-shape field names.
 *
 * Legitimate uses: FAQ denial copy that must literally say "Is this a lottery?",
 * internal developer-facing docs explaining what terms are banned and why,
 * and ABI / backend-shape names that cannot change without breaking external
 * contracts.
 */

import type { TranslatedLocale } from '../i18n/routing';

import {
  buildCjkSubstringPattern,
  buildLatinWordPattern,
  buildTermPattern,
  inflect,
  UK_NOUN_ENDINGS,
  type TermSet,
} from './locale-text-matchers';

/** A single banned-term hit inside a scanned file. */
export interface ScannerHit {
  /** 1-based line number of the hit. */
  line: number;
  /** The exact substring that matched (original case preserved). */
  term: string;
  /** The full string literal, JSX text segment, or identifier containing the hit. */
  literal: string;
}

/**
 * The default banned-term list for Cosmic Signature, derived from
 * marketing/cosmic-lexicon.md (including the 2026-04-23 revision that
 * expanded the ban list to cover UK / EU / Australian gambling statutes).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const DEFAULT_BANNED_TERMS: readonly string[] = [
  // Auction / bidding
  'bid',
  'bids',
  'bidding',
  'bidder',
  'bidders',
  'auction',
  'auctions',
  'Dutch auction',
  // Allocations / winners
  'prize',
  'prizes',
  'winner',
  'winners',
  'jackpot',
  'pot',
  // Stellar Selection / lottery triggers
  'raffle',
  'raffles',
  'lottery',
  'lotteries',
  'sweepstakes',
  'giveaway',
  'giveaways',
  'casino',
  // Gambling language
  'gambling',
  'gamble',
  'bet',
  'bets',
  'wager',
  'wagers',
  'odds',
  'luck',
  'lucky',
  'house edge',
  'ticket',
  'tickets',
  // Game framing (UK/Canada/EU gambling acts use "game" and "play" as root terms)
  'gaming',
  'player',
  'players',
  'compete',
  'competing',
  'competition',
  'contest',
  'tournament',
  // Securities / Howey
  'investor',
  'investors',
  'investment',
  'investments',
  'profit',
  'profits',
  'ROI',
  'dividend',
  'dividends',
  'yield',
  'earn',
  'earns',
  'earning',
  'earnings',
  'income',
  'tax-deductible',
  // Crypto-slang landmines
  'degen',
  'moon',
  'lambo',
  'ape',
  'apes',
  // Staking / yield
  'staker',
  'stakers',
  'staking',
  // Charity language
  'charity',
  'charities',
  'charitable',
  'donate',
  'donated',
  'donating',
  'donation',
  'donations',
  'donor',
  'donors',
  // Withdraw slang
  'cash out',
  // Imprint (minted → imprinted)
  'minted',
];
// lexicon-allow-end

/**
 * Stems matched inside identifier names by `scanIdentifiers`. These are
 * PascalCase canonical forms; matching is case-insensitive and respects
 * camelCase / snake_case boundaries inside the identifier.
 */
// lexicon-allow-start: banned-stem list for the scanner itself
export const DEFAULT_BANNED_STEMS: readonly string[] = [
  'Bid',
  'Bidder',
  'Bidders',
  'Bidding',
  'Stake',
  'Staked',
  'Staker',
  'Stakers',
  'Staking',
  'Unstake',
  'Unstaked',
  'Unstaking',
  'Mint',
  'Minted',
  'Minting',
  'Raffle',
  'Prize',
  'Prizes',
  'Winner',
  'Winners',
];
// lexicon-allow-end

/**
 * Simplified-Chinese banned terms (docs/i18n/glossary-zh.md §5). Mirrors the
 * English list above: gambling/lottery/game/investment/staking/charity
 * register is banned in Chinese copy; the coined cosmic terms carry the
 * meaning instead (落笔, 星选, 锚定, 取回, 铭刻, …). As in English, the only
 * sanctioned exception is FAQ/legal denial copy inside lexicon-allow pragmas.
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const ZH_BANNED_TERMS: readonly string[] = [
  // bid / auction
  '出价',
  '竞价',
  '叫价',
  '投标',
  '拍卖',
  '竞拍',
  '荷兰拍',
  // prize / jackpot
  '奖品',
  '奖励',
  '奖金',
  '大奖',
  '头奖',
  '奖池',
  '战利品',
  // lottery / raffle / draw
  '彩票',
  '乐透',
  '彩券',
  '奖券',
  '抽奖',
  '抽签',
  '摇号',
  '开奖',
  '刮刮乐',
  // winner
  '中奖',
  '赢家',
  '得主',
  '获胜者',
  '优胜者',
  // gambling / bets / house
  '赌博',
  '赌场',
  '赌注',
  '博彩',
  '下注',
  '投注',
  '押注',
  '打赌',
  '赔率',
  '庄家',
  '荷官',
  // luck flavor
  '抽中',
  '碰运气',
  '拼手气',
  '幸运儿',
  // game / play
  '游戏',
  '玩家',
  '玩法',
  '试玩',
  '闯关',
  // competition
  '比赛',
  '竞赛',
  '竞争',
  '竞技',
  '锦标赛',
  '争夺',
  '对决',
  // investment
  '投资',
  '理财',
  '炒币',
  '建仓',
  // yield / profit / dividend
  '收益',
  '回报',
  '年化',
  '利息',
  '分红',
  '股息',
  '盈利',
  '利润',
  // earn(ings) / income
  '赚钱',
  '赚取',
  '躺赚',
  '薅羊毛',
  '被动收入',
  // staking / mint / mining
  '质押',
  '铸造',
  '铸币',
  '挖矿',
  // withdraw / claim
  '提现',
  '提款',
  '领取',
  '认领',
  // giveaway / airdrop
  '空投',
  '赠品',
  '白送',
  '免费领',
  // charity / donation
  '慈善',
  '捐赠',
  '捐款',
  '善款',
  // DAO
  '去中心化自治组织',
  // round (cycle context) — 轮/轮次/回合 as standalone terms
  '轮次',
  '回合',
  // ticket
  '门票',
  '入场券',
  // tax
  '免税',
  '抵税',
];
// lexicon-allow-end

/**
 * Traditional-Chinese banned register shared by Taiwan and Hong Kong
 * (docs/i18n/glossary-zh-TW.md §5, glossary-zh-HK.md §5): the Simplified list
 * above in Traditional characters, plus the pan-Traditional vocabulary that
 * has no Simplified counterpart in our copy (公益 "charity/public welfare",
 * 獲利 "profit"). Regional registers below add the words each place actually
 * uses for gambling, auctions, and returns — those differ (Taiwan says 博弈
 * and 競標, Hong Kong says 博彩 and 競投), which is why the profiles are
 * scoped to their own locale's files (scripts/locale-files.ts).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const ZH_HANT_BANNED_TERMS: readonly string[] = [
  // bid / auction
  '出價',
  '競價',
  '叫價',
  '投標',
  '拍賣',
  '競拍',
  '荷蘭拍',
  // prize / jackpot
  '獎品',
  '獎勵',
  '獎金',
  '大獎',
  '頭獎',
  '獎池',
  '戰利品',
  '安慰獎',
  // lottery / raffle / draw
  '彩票',
  '樂透',
  '彩券',
  '獎券',
  '抽獎',
  '抽籤',
  '搖號',
  '開獎',
  '刮刮樂',
  // winner
  '中獎',
  '贏家',
  '得主',
  '獲勝者',
  '優勝者',
  // gambling / bets / house
  '賭博',
  '賭場',
  '賭注',
  '賭客',
  '博彩',
  '下注',
  '投注',
  '押注',
  '打賭',
  '賠率',
  '莊家',
  '荷官',
  // luck flavor
  '抽中',
  '碰運氣',
  '拼手氣',
  '幸運兒',
  // game / play
  '遊戲',
  '玩家',
  '玩法',
  '試玩',
  '闖關',
  // competition
  '比賽',
  '競賽',
  '競爭',
  '競技',
  '錦標賽',
  '爭奪',
  '對決',
  // investment
  '投資',
  '理財',
  '炒幣',
  '建倉',
  // yield / profit / dividend
  '收益',
  '年化',
  '利息',
  '分紅',
  '股息',
  '盈利',
  '利潤',
  '獲利',
  // earn(ings) / income
  '賺錢',
  '賺取',
  '躺賺',
  '薅羊毛',
  '被動收入',
  // staking / mint / mining
  '質押',
  '鑄造',
  '鑄幣',
  '挖礦',
  // withdraw / claim
  '提現',
  '提款',
  '領取',
  '認領',
  // giveaway / airdrop
  '空投',
  '贈品',
  '白送',
  '免費領',
  // charity / donation
  '慈善',
  '公益',
  '捐贈',
  '捐款',
  '捐獻',
  '捐助',
  '善款',
  // DAO
  '去中心化自治組織',
  // round (cycle context) — 輪次/回合 as standalone terms
  '輪次',
  '回合',
  // ticket
  '門票',
  '入場券',
  // tax
  '免稅',
  '抵稅',
];

/**
 * Taiwan register (docs/i18n/glossary-zh-TW.md §5). 博弈 means gambling in
 * Taiwan (博弈產業) but "strategic interplay" on the mainland; 競標/得標 are
 * the everyday words for bidding; 報酬 is the finance word for a return
 * (投資報酬率); 摸彩 is a lucky draw; 提領 is a withdrawal.
 */
export const ZH_TW_BANNED_TERMS: readonly string[] = [
  '博弈',
  '威力彩',
  '大樂透',
  '運彩',
  '運動彩券',
  '簽注',
  '簽賭',
  '摸彩',
  '賓果',
  '競標',
  '標售',
  '得標',
  '喊價',
  '報酬',
  '獲利率',
  '股利',
  '配息',
  '提領',
];

/**
 * Hong Kong register (docs/i18n/glossary-zh-HK.md §5). 六合彩/賽馬/馬會 are
 * the local lotteries and racing; 派彩 is a payout; 落注/賭波 are placing a
 * bet; 攪珠 is the lottery draw; 競投/投得 are bidding at auction; 回報 is
 * the finance word for a return (投資回報); 派息 is a dividend.
 */
export const ZH_HK_BANNED_TERMS: readonly string[] = [
  '六合彩',
  '賽馬',
  '馬會',
  '投注站',
  '派彩',
  '落注',
  '賭波',
  '賭錢',
  '賭仔',
  '攪珠',
  '競投',
  '投得',
  '回報',
  '派息',
];
// lexicon-allow-end

/**
 * Ukrainian banned terms (docs/i18n/glossary-uk.md §5), mirroring the
 * English categories above with the same scope — no broader. Ukrainian
 * inflects, so the register is declared two ways:
 *
 *   - UK_BANNED_STEMS: word-initial stems that no unrelated word begins
 *     with; the matcher extends over any suffix (лотере → лотереї).
 *   - UK_BANNED_TERMS: explicit inflected forms for roots that ARE prefixes
 *     of ordinary words (приз → призначення, гра → гравітація, майн → майно),
 *     matched as whole words.
 *
 * As in English and Chinese, the only sanctioned exception is FAQ/legal
 * denial copy inside lexicon-allow pragmas.
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const UK_BANNED_STEMS: readonly string[] = [
  // auction / bidding
  'аукціон',
  'ставк',
  'ставок',
  // prize / winner / jackpot (виграш is safe; the verb root вигра- also begins
  // вигравірувати "to engrave", so its forms are listed explicitly below)
  'перемож',
  'виграш',
  'джекпот',
  // lottery / raffle / sweepstakes / giveaway / casino
  'лотере',
  'розіграш',
  'розігра',
  'жереб',
  'тираж',
  'лототрон',
  'роздач',
  'казино',
  // gambling / bets / odds / luck (парі "a bet" is deliberately absent: it is
  // also the locative of пара "a pair" — у парі з 1 000 CST — and ставк- already
  // covers the betting register)
  'азарт',
  'гральн',
  'букмекер',
  'тоталізатор',
  'рулетк',
  'удач',
  'везінн',
  'фортун',
  'щасливч',
  'пощастил',
  'пощастит',
  // ticket
  'білет',
  // game framing / competition
  'гейм',
  'гравц',
  'гравець',
  'ігров',
  'змаган',
  'змагат',
  'конкурс',
  'турнір',
  'конкуренц',
  'конкурент',
  // securities / yield / earnings
  'інвест',
  'дивіденд',
  'зароб',
  'рентабельн',
  'окупн',
  'неоподатков',
  'пільг',
  // crypto slang
  'деген',
  'туземун',
  'ламбо',
  // staking / mint
  'стейк',
  'мінт',
  'замінт',
  'намінт',
  'чекан',
  // charity / donation
  'благодійн',
  'доброчинн',
  'пожертв',
  'донат',
  'донор',
  'філантроп',
  // withdraw slang
  'кешаут',
  'кеш-аут',
  // round
  'раунд',
];

export const UK_BANNED_TERMS: readonly string[] = [
  // auction lots and bidding rounds (лот → лоток, торг → торгівля are unrelated)
  ...inflect('лот', ['', 'и', 'у', 'ом', 'ів', 'ам', 'ами', 'ах']),
  'торги',
  'торгів',
  'торгам',
  'торгами',
  'торгах',
  // prize (приз → призначення, призма)
  ...inflect('приз', ['', 'и', 'у', 'ом', 'ів', 'ам', 'ами', 'ах']),
  ...inflect('призов', ['ий', 'а', 'е', 'і', 'ого', 'ому', 'им', 'их', 'ими', 'у', 'ою']),
  'куш',
  'кушу',
  // to win (вигра- → вигравірувати "to engrave", so no stem)
  'виграти',
  'виграю',
  'виграєш',
  'виграє',
  'виграємо',
  'виграєте',
  'виграють',
  'виграв',
  'виграла',
  'виграли',
  'вигравати',
  'виграний',
  'виграна',
  'виграні',
  // game / play / player (гра → гравітація, графік; грати → also "bars")
  'гра',
  'гри',
  'грі',
  'гру',
  'грою',
  'ігри',
  'ігор',
  'іграм',
  'іграми',
  'іграх',
  'грати',
  'зіграти',
  'пограти',
  'граю',
  'грає',
  'граємо',
  'граєте',
  'грають',
  'грав',
  'грала',
  'грали',
  'зіграв',
  'зіграла',
  'зіграли',
  'зіграй',
  'зіграйте',
  'пограй',
  'пограйте',
  // ticket (квиток → квитанція is unrelated)
  ...inflect('квит', ['ок', 'ки', 'ка', 'ку', 'ком', 'ків', 'кам', 'ками', 'ках']),
  // profit / income (прибут → прибуття; доход → доходити)
  ...inflect('прибут', ['ок', 'ки', 'ку', 'ком', 'ків', 'кам', 'ками', 'ках']),
  ...inflect('прибутков', [
    'ий',
    'а',
    'е',
    'і',
    'ого',
    'ому',
    'им',
    'их',
    'ими',
    'ість',
    'ості',
    'істю',
  ]),
  'дохід',
  ...inflect('дохо', ['ди', 'ду', 'ді', 'дом', 'дів', 'дам', 'дами', 'дах']),
  ...inflect('дохідн', [
    'ий',
    'а',
    'е',
    'і',
    'ого',
    'ому',
    'им',
    'их',
    'ими',
    'ість',
    'ості',
    'істю',
  ]),
  ...inflect('доходн', ['ість', 'ості', 'істю']),
  // mining (майн → майно)
  ...inflect('майнінг', UK_NOUN_ENDINGS),
  ...inflect('майнер', UK_NOUN_ENDINGS),
  // claim slang (клейм → клеймо)
  'клейм',
  'клейму',
  'клеймити',
  'клеймнути',
  'заклеймити',
  'клеймінг',
  // withdraw slang phrases
  'вивести кошти',
  'виведення коштів',
  'вивід коштів',
  'зняти кошти',
  'зняття коштів',
  // DAO
  'ДАО',
  // freebie slang
  'халява',
  'халяви',
  'халяву',
  'халявний',
  'халявна',
  'халявне',
  'халявні',
];
// lexicon-allow-end

/**
 * Korean banned register (docs/i18n/glossary-ko.md §5): the words Korean
 * actually uses for the banned concepts. Korean compounds join without
 * spaces (재투자 "reinvest", NFT민팅) and particles attach directly to the
 * noun (도박을, 투자자에게), so the terms are matched as substrings like the
 * Chinese lists. Every entry was checked against the Korean the site does
 * need: words dropped because a common innocent word contains them are
 * listed in the glossary as reviewer cautions — 내기 (a bet) hides in 보내기
 * "send", 호가 (an asking price) in 번호가 "the number is", 시합 (a match)
 * in 표시합니다 "displays", 수입 (income) in 개수입니다 "is the count", 청구
 * stays available for the legal sense of "claim". Terms that a rarer
 * innocent word contains stay banned and the
 * glossary tells writers which word to use instead (배경 for 백그라운드,
 * 불리한 결과 for 불이익, 손해 배상 for 보상금).
 *
 * As in English and Chinese, the only sanctioned exception is FAQ/legal
 * denial copy inside lexicon-allow pragmas (or `\uXXXX` escapes in JSON).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const KO_BANNED_TERMS: readonly string[] = [
  // auction / bidding
  '경매',
  '입찰',
  '낙찰',
  '옥션',
  '비드',
  '비딩',
  '더치 옥션',
  // prize / jackpot
  '상금',
  '경품',
  '잭팟',
  '대박',
  '당첨금',
  // winner
  '당첨',
  '승자',
  '우승',
  // lottery / raffle / sweepstakes
  '추첨',
  '복권',
  '로또',
  '뽑기',
  '응모',
  // gambling / bets / odds
  '도박',
  '베팅',
  '배팅',
  '카지노',
  '갬블',
  '사행',
  '판돈',
  '배당',
  // luck flavor
  '행운',
  '럭키',
  '찬스',
  // ticket
  '티켓',
  '참가권',
  // game framing / competition
  '게임',
  '게이머',
  '플레이어',
  '승부',
  '경쟁',
  '대회',
  '토너먼트',
  '콘테스트',
  // securities / yield / earnings
  '투자',
  '재테크',
  '수익',
  '이익',
  '이윤',
  '소득',
  '이자율',
  '이자 수익',
  '이자 소득',
  // tax
  '면세',
  '세금 공제',
  // crypto slang
  '존버',
  '가즈아',
  '떡상',
  // staking
  '스테이킹',
  '예치',
  '락업',
  // mint / mining
  '민팅',
  '민트',
  '채굴',
  // withdraw / claim slang
  '인출',
  '출금',
  '클레임',
  '캐시아웃',
  '현금화',
  '페이아웃',
  // charity / donation
  '자선',
  '기부',
  '후원',
  '모금',
  '도네이션',
  // DAO
  '다오',
  // marketing
  '마케팅',
  // round
  '라운드',
  '회차',
];
// lexicon-allow-end

/**
 * Japanese banned register (docs/i18n/glossary-ja.md §5): the words Japanese
 * actually uses for the banned concepts. Japanese writes without spaces and
 * attaches particles directly (投資を, 抽選で), so the terms are matched as
 * substrings like the Chinese and Korean lists — which is also why several
 * obvious candidates are deliberately absent: ロト hides in プロトコル
 * "protocol", ベット in アルファベット "alphabet", プレイ in ディスプレイ
 * "display", and bare くじ in ordinary hiragana runs, so the list carries
 * 宝くじ / くじ引き / ベッティング / プレイヤー instead. Terms that a rarer
 * innocent word contains stay banned and the glossary names the word to
 * use instead (背景 for バックグラウンド, 関係者 for ステークホルダー, 損害 or
 * 不都合 for 不利益).
 *
 * As in English and Chinese, the only sanctioned exception is FAQ/legal
 * denial copy inside lexicon-allow pragmas (or `\uXXXX` escapes in JSON).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const JA_BANNED_TERMS: readonly string[] = [
  // auction / bidding
  'オークション',
  '競売',
  '入札',
  '落札',
  '競り',
  // prize / jackpot
  '賞金',
  '賞品',
  '景品',
  '懸賞',
  '大当たり',
  'ジャックポット',
  // winner
  '当選',
  '勝者',
  '優勝',
  '勝利',
  '受賞',
  // lottery / raffle / sweepstakes
  '抽選',
  '抽籤',
  '宝くじ',
  'くじ引き',
  'ロッタリー',
  'ラッフル',
  '福引',
  'ガチャ',
  // gambling / bets / odds
  'ギャンブル',
  '賭博',
  '賭け',
  '賭場',
  'カジノ',
  '胴元',
  'オッズ',
  'ベッティング',
  'パチンコ',
  // luck flavor
  '幸運',
  'ラッキー',
  '運試し',
  '一発逆転',
  'チャンス',
  // ticket
  'チケット',
  '参加券',
  // game framing / competition
  'ゲーム',
  'ゲーマー',
  'プレイヤー',
  '勝負',
  '対戦',
  '対決',
  'トーナメント',
  '大会',
  'コンテスト',
  '競争',
  '競技',
  'バトル',
  // securities / yield / earnings
  '投資',
  '利回り',
  '収益',
  '利益',
  '利潤',
  '儲け',
  '儲かる',
  '稼ぐ',
  '稼げる',
  '利息',
  '利子',
  '配当',
  'リターン',
  '収入',
  '所得',
  '資産運用',
  '運用益',
  '金利',
  // tax
  '免税',
  '税控除',
  // crypto slang
  'ガチホ',
  '爆上げ',
  '億り人',
  // staking
  'ステーキング',
  'ステーク',
  'ロックアップ',
  '預け入れ',
  '預入',
  // mint / mining
  'ミント',
  'ミンティング',
  '鋳造',
  'マイニング',
  '採掘',
  // withdraw / claim slang
  '引き出し',
  '出金',
  'キャッシュアウト',
  '換金',
  '現金化',
  'クレーム',
  'ペイアウト',
  '払い出し',
  // charity / donation
  '慈善',
  'チャリティ',
  '寄付',
  '寄附',
  '寄贈',
  '募金',
  '献金',
  'ドネーション',
  // DAO
  'ダオ',
  // marketing
  'マーケティング',
  '宣伝',
  '広告',
  '販促',
  'プロモーション',
  // round
  'ラウンド',
  '回戦',
];
// lexicon-allow-end

/**
 * Vietnamese banned register (docs/i18n/glossary-vi.md §5): the words
 * Vietnamese actually uses for the banned concepts. Vietnamese is a Latin
 * alphabet with stacked diacritics, written one spaced syllable at a time,
 * so the terms are matched as whole words with Unicode boundaries
 * (`unicode-word`; JavaScript's `\b` stops at every diacritic). Because a
 * word boundary is also a syllable boundary, a bare syllable that another
 * innocent compound contains is deliberately absent and its compounds are
 * listed instead: thưởng hides in thưởng thức "to appreciate (art)", lời in
 * lời nhắn "message", rút in rút gọn "shorten", vòng in vòng lặp "loop",
 * hiệp in hiệp hội "association", bạc in bạc "silver". Terms are
 * case-insensitive; every entry carries a diacritic or a Vietnamese-only
 * spelling so the profile never re-flags English (see DEFAULT_BANNED_TERMS).
 *
 * As in every other locale, the only sanctioned exception is FAQ/legal
 * denial copy inside lexicon-allow pragmas (or `\uXXXX` escapes in JSON).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const VI_BANNED_TERMS: readonly string[] = [
  // auction / bidding
  'đấu giá',
  'đấu thầu',
  'bỏ thầu',
  'đặt giá',
  'trả giá',
  'ra giá',
  'phiên đấu',
  // prize / jackpot / reward
  'giải thưởng',
  'phần thưởng',
  'tiền thưởng',
  'trúng thưởng',
  'trao thưởng',
  'nhận thưởng',
  'lĩnh thưởng',
  'trả thưởng',
  'khen thưởng',
  'độc đắc',
  // winner / win / lose
  'thắng',
  'chiến thắng',
  'thắng cuộc',
  'thắng giải',
  'người thắng',
  'người trúng',
  'đoạt giải',
  'giành giải',
  'trúng giải',
  'trúng số',
  'thua',
  'thua cuộc',
  'thua lỗ',
  // lottery / raffle / draw
  'xổ số',
  'vé số',
  'số đề',
  'lô tô',
  'lô đề',
  'rút thăm',
  'bốc thăm',
  'quay số',
  'quay thưởng',
  'vòng quay',
  // luck flavor
  'may mắn',
  'vận may',
  'cầu may',
  'ăn may',
  'may rủi',
  'hên xui',
  'số đỏ',
  'đỏ đen',
  // gambling / bets / odds
  'cá cược',
  'đặt cược',
  'cược',
  'kèo',
  'đánh bạc',
  'cờ bạc',
  'sòng bạc',
  'sòng bài',
  'đánh bài',
  'nhà cái',
  'con bạc',
  // ticket
  'vé',
  'tấm vé',
  // game framing / competition
  'trò chơi',
  'người chơi',
  'chơi',
  'ván',
  'lượt chơi',
  'giải đấu',
  'thi đấu',
  'trận đấu',
  'hiệp đấu',
  'vòng đấu',
  'vòng chơi',
  'vòng cược',
  'đối đầu',
  'đối thủ',
  'so tài',
  'tranh tài',
  'cạnh tranh',
  'cuộc đua',
  'cuộc thi',
  // securities / yield / earnings
  'đầu tư',
  'nhà đầu tư',
  'lợi nhuận',
  'lợi tức',
  'lợi suất',
  'lãi',
  'lãi suất',
  'tiền lãi',
  'sinh lời',
  'sinh lãi',
  'sinh lợi',
  'kiếm lời',
  'kiếm tiền',
  'thu lợi',
  'thu nhập',
  'cổ tức',
  'cổ phiếu',
  'chứng khoán',
  'lướt sóng',
  // tax
  'miễn thuế',
  // staking / deposit
  'đặt cọc',
  'ký gửi',
  'thế chấp',
  'gửi tiết kiệm',
  // mint / mining
  'đúc',
  'khai thác',
  'đào coin',
  'đào tiền',
  'thợ đào',
  // withdraw / claim slang
  'rút tiền',
  'rút về',
  'rút vốn',
  'rút lời',
  'rút ETH',
  'lĩnh tiền',
  // charity / donation
  'từ thiện',
  'quyên góp',
  'quyên tặng',
  'hiến tặng',
  'thiện nguyện',
  'làm phúc',
  'cứu trợ',
  'ủng hộ',
  // DAO
  'tự trị phi tập trung',
  // marketing
  'tiếp thị',
  'quảng cáo',
  'quảng bá',
  'khuyến mãi',
  'khuyến mại',
];
// lexicon-allow-end

/**
 * One banned-register profile per translated locale. The type forces a
 * decision the moment a locale joins routing.locales. The CLI applies a
 * profile to every locale-agnostic file and to every file of another
 * language written in a different family of characters (stray copy in the
 * wrong file is exactly what the scanner exists to catch), but not to files
 * of a sibling variant of the same language or of another language sharing
 * its script — Chinese and Japanese write the same characters with different
 * meanings — see `checkAppliesTo` in scripts/locale-files.ts.
 */
export interface LexiconProfile {
  /** Where the register is documented. */
  readonly glossary: string;
  readonly termSets: readonly TermSet[];
}

export const LEXICON_PROFILES: Record<TranslatedLocale, LexiconProfile> = {
  zh: {
    glossary: 'docs/i18n/glossary-zh.md',
    termSets: [{ matcher: 'cjk-substring', terms: ZH_BANNED_TERMS }],
  },
  'zh-TW': {
    glossary: 'docs/i18n/glossary-zh-TW.md',
    termSets: [
      { matcher: 'cjk-substring', terms: ZH_HANT_BANNED_TERMS },
      { matcher: 'cjk-substring', terms: ZH_TW_BANNED_TERMS },
    ],
  },
  'zh-HK': {
    glossary: 'docs/i18n/glossary-zh-HK.md',
    termSets: [
      { matcher: 'cjk-substring', terms: ZH_HANT_BANNED_TERMS },
      { matcher: 'cjk-substring', terms: ZH_HK_BANNED_TERMS },
    ],
  },
  uk: {
    glossary: 'docs/i18n/glossary-uk.md',
    termSets: [
      { matcher: 'unicode-stem', terms: UK_BANNED_STEMS },
      { matcher: 'unicode-word', terms: UK_BANNED_TERMS },
    ],
  },
  ko: {
    glossary: 'docs/i18n/glossary-ko.md',
    termSets: [{ matcher: 'cjk-substring', terms: KO_BANNED_TERMS }],
  },
  ja: {
    glossary: 'docs/i18n/glossary-ja.md',
    termSets: [{ matcher: 'cjk-substring', terms: JA_BANNED_TERMS }],
  },
  vi: {
    glossary: 'docs/i18n/glossary-vi.md',
    // Spaced Latin syllables with diacritics: whole words under Unicode
    // boundaries, never `latin-word`, whose ASCII `\b` breaks at every ế or ợ.
    termSets: [{ matcher: 'unicode-word', terms: VI_BANNED_TERMS }],
  },
};

/** Compiled patterns for a profile, in declaration order. */
export function buildProfilePatterns(profile: LexiconProfile): RegExp[] {
  return profile.termSets.map(buildTermPattern);
}

/**
 * Builds a case-insensitive, word-boundary-aware regex from a list of
 * banned terms. Escapes regex metacharacters so "Dutch auction" matches
 * the literal phrase and "tax-deductible" matches the literal hyphen.
 */
export function buildBannedPattern(banned: readonly string[]): RegExp {
  return buildLatinWordPattern(banned);
}

/**
 * CJK variant of `buildBannedPattern`: `\b` word boundaries do not exist
 * between CJK code points, so Chinese terms are matched as plain substrings.
 */
export function buildZhBannedPattern(banned: readonly string[]): RegExp {
  return buildCjkSubstringPattern(banned);
}

/**
 * Extracts string literals (single-quoted, double-quoted, and
 * backtick-quoted) from a single line of source code. Returns each literal
 * along with the zero-based column offset in the line so callers can
 * inspect what precedes the literal.
 */
export function extractStringLiterals(line: string): Array<{ literal: string; start: number }> {
  const result: Array<{ literal: string; start: number }> = [];
  const regex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    result.push({ literal: match[0]!, start: match.index });
  }
  return result;
}

/**
 * Decides whether a given string literal, at column `start` of `line`,
 * should be skipped because it represents an internal-only string (import
 * path, DOM element ID, test selector, object key, etc.). Returns true to skip.
 *
 * The "prefix" is the text in the line immediately before the literal.
 * We match on the trimmed trailing tokens to identify the surrounding
 * call site. When `end` (the column just past the literal) is supplied, the
 * text after the literal is consulted too, so quoted property keys can be
 * told apart from ternary branches.
 */
export function isInternalCallSite(line: string, start: number, end?: number): boolean {
  const prefix = line.slice(0, start);
  const trimmedPrefix = prefix.trimEnd();

  // Quoted property keys: `'what-rewards-per-bid': {` in a TS object literal
  // or `"perNftTooltip": "…"` in a JSON catalog. A key is an identifier, never
  // rendered copy — content modules key translations by legacy URL-fragment
  // ids that must stay stable. The prefix guard keeps ternary branches
  // (`cond ? 'a' : 'b'`, prefix ends in `?`) and `case 'x':` labels scanned.
  if (
    end !== undefined &&
    /^\s*:(?!:)/.test(line.slice(end)) &&
    /(?:^|[{,])$/.test(trimmedPrefix)
  ) {
    return true;
  }

  // Imports and bare require(): `import X from 'y'`, `require('y')`.
  if (/\b(?:from|require\s*\()\s*$/.test(trimmedPrefix)) return true;
  if (/\bimport\s*\(\s*$/.test(trimmedPrefix)) return true;

  // JSX / prop internal attributes: id, data-testid, className, sectionId,
  // data-*, key, htmlFor. These are internal DOM concerns.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*[:=]\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }
  // JSX attribute form: `data-testid={"..."}` or `id={"..."}`.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*=\s*\{\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }

  // Object literal shorthand for the above keys: `{ id: '...' }`,
  // `{ sectionId: '...' }`, `{ testId: '...' }`. We limit to cases where
  // the key is unambiguously an internal-identifier key.
  if (/\b(sectionId|testId|slotId|elementId|anchorId|hashAnchor)\s*:\s*$/.test(trimmedPrefix))
    return true;

  return false;
}

/** Tracks allow-block state across lines without leaking into callers. */
interface AllowState {
  inBlock: boolean;
}

/** Internal: is this line a pragma that opens/closes/singles an allow? */
interface LinePragma {
  opensBlock: boolean;
  closesBlock: boolean;
  allowsLine: boolean;
}

/**
 * Recognise a lexicon pragma in any common comment form:
 *   // lexicon-allow-*          (line comment)
 *   /&#42; lexicon-allow-* &#42;/     (block comment)
 *   {/&#42; lexicon-allow-* &#42;/}    (JSX comment)
 *   <!-- lexicon-allow-* -->    (HTML / markdown comment)
 *
 * The regex is case-insensitive and accepts leading whitespace and optional
 * `{` so callers can drop a pragma at the start of a comment in any file type.
 */
const PRAGMA_PREFIX = String.raw`(?:\/\/|\/\*|\{\/\*|<!--)\s*`;

/**
 * Strips string literals from a line before pragma detection so a literal
 * containing "// lexicon-allow-end" (as a test fixture, say) does not
 * inadvertently close an enclosing allow block.
 */
function stripStringLiterals(line: string): string {
  return line.replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '""');
}

function readPragma(line: string): LinePragma {
  const cleaned = stripStringLiterals(line);
  const allowsLine = new RegExp(
    `${PRAGMA_PREFIX}lexicon-allow-(?:abi|backend-type|line)\\b`,
    'i',
  ).test(cleaned);
  return {
    opensBlock: new RegExp(`${PRAGMA_PREFIX}lexicon-allow-start`, 'i').test(cleaned),
    closesBlock: new RegExp(`${PRAGMA_PREFIX}lexicon-allow-end`, 'i').test(cleaned),
    allowsLine,
  };
}

/**
 * Scans the content of a single file for banned terms in user-visible
 * string literals. Returns an array of hits with line number, matched
 * term, and the literal containing it.
 *
 * Lines wrapped in `// lexicon-allow-start` / `// lexicon-allow-end`
 * pragmas are excluded, as are lines tagged with `// lexicon-allow-abi`
 * or `// lexicon-allow-backend-type`. Pure-comment lines (starting with
 * `//` or `*`) are also excluded so JSDoc mentioning a banned term is fine.
 */
export function scanContent(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Fast-path: skip whole `import` / `export from` lines. The literal-by-
    // literal isInternalCallSite guard also catches these, but the shortcut
    // avoids scanning long module-re-export blocks.
    if (/^\s*(?:import|export)\s/.test(line) && /\bfrom\s+['"`]/.test(line)) return;

    const literals = extractStringLiterals(line);
    for (const { literal, start } of literals) {
      if (isInternalCallSite(line, start, start + literal.length)) continue;
      const matches = literal.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal });
        }
      }
    }
  });

  return hits;
}

/**
 * Extracts JSX text segments from a single line. A JSX text segment is the
 * text rendered between two adjacent JSX tags on the same line, e.g.
 * `<span>Hello World</span>` yields `Hello World`. JSX expression containers
 * (`{...}`) are excluded — they are regular TS/JS and covered by other
 * matchers. Empty and whitespace-only segments are filtered out.
 */
export function extractJsxTextInline(line: string): Array<{ text: string; start: number }> {
  const result: Array<{ text: string; start: number }> = [];
  const regex = />([^<>{}]+)</g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    const text = match[1]!;
    if (text.trim() === '') continue;
    result.push({ text, start: match.index + 1 });
  }
  return result;
}

/**
 * Heuristic check: does this trimmed line look like a standalone JSX text
 * node (i.e. a line between an opening and closing tag on adjacent lines)?
 *
 * Example that returns true:
 *   `  Cosmic Signature Staking`
 *
 * The line must:
 *   - contain an alphabetic run of 3+ characters,
 *   - contain at least one whitespace character (real JSX text is a phrase),
 *   - not contain tag/expression syntax,
 *   - not look like a TS object property row (`key: value,`),
 *   - not look like a property-access chain (`obj.prop`),
 *   - not end in a trailing comma (array/object literal row), and
 *   - not start with a reserved word.
 *
 * False positives here are still possible but the banned-term regex must
 * also match before a hit is reported, which filters most of the remainder.
 */
export function looksLikeStandaloneJsxText(trimmed: string): boolean {
  if (trimmed.length === 0) return false;
  if (!/[A-Za-z]{3,}/.test(trimmed)) return false;
  if (/[<>{}()=;'"`/]/.test(trimmed)) return false;
  if (trimmed.startsWith('*')) return false;
  // Real JSX text is a phrase with whitespace, not a single DOM attribute
  // identifier like `data-special-allocation-leaders-print`.
  if (!/\s/.test(trimmed)) return false;
  // Object/property syntax: `key: value`, `key: value,`, object rows.
  if (/^[A-Za-z_$][A-Za-z0-9_$]*\s*:\s*[A-Za-z_$[{]/.test(trimmed)) return false;
  // Property-access chains: `obj.prop`, `obj.prop.more`.
  if (/[A-Za-z_$][A-Za-z0-9_$]*\.[A-Za-z_$]/.test(trimmed)) return false;
  // Trailing comma → clearly an array / object literal row.
  if (/,\s*$/.test(trimmed)) return false;
  // Reserved keywords that may start prose-like lines but are actually code.
  if (
    /^(import|export|const|let|var|function|class|interface|type|enum|if|else|return|for|while|switch|case|default|break|continue|try|catch|finally|throw|new|async|await|yield|do)\b/.test(
      trimmed,
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Scans JSX text (inline and standalone) for banned terms. Operates
 * line-by-line without a full AST — good enough to catch obvious leaks
 * like `<span>Cosmic Signature Staking</span>` that string-literal
 * scanning misses.
 *
 * Allow pragmas are honored identically to `scanContent`.
 */
export function scanJsxTextNodes(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Inline JSX text: `<span>Hello</span>`.
    const inline = extractJsxTextInline(line);
    for (const { text } of inline) {
      const matches = text.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: text });
        }
      }
    }

    // Standalone JSX text: a line between `<span>` and `</span>` on its own.
    if (looksLikeStandaloneJsxText(trimmed)) {
      const matches = trimmed.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: trimmed });
        }
      }
    }
  });

  return hits;
}

/**
 * Builds a case-insensitive regex that matches an identifier-like token
 * (camelCase, PascalCase, or snake_case) containing any of the given stems.
 *
 * The match includes the full identifier so reports show `useGestureForm`, not
 * just `Bid`. Word-boundary anchors keep ordinary English in comments from
 * firing — but comments are excluded by `scanIdentifiers` separately.
 */
export function buildIdentifierPattern(stems: readonly string[]): RegExp {
  if (stems.length === 0) return /(?!)/g;
  const escaped = stems.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // A "banned identifier" is a run of identifier chars that contains one of
  // the stems. We match the whole identifier so the reporter can cite it.
  return new RegExp(`\\b[A-Za-z0-9_]*(?:${escaped.join('|')})[A-Za-z0-9_]*\\b`, 'gi');
}

/**
 * Decides whether an identifier match inside `line` at column `start`
 * should be ignored because it is a property access on an external contract
 * — ABI methods (`.write.mint`, `.read.getMintPrice`) cannot be renamed
 * without breaking block explorers, subgraphs, and audit artifacts.
 *
 * Heuristic: the character immediately before the identifier is `.`, and
 * the line has a `// lexicon-allow-abi` marker. This is stricter than
 * matching any `.identifier` because we still want to flag accidental
 * `widget.stakingStatus` style regressions — those should be renamed.
 */
export function isAbiPropertyAccess(line: string, start: number): boolean {
  if (start === 0) return false;
  if (line[start - 1] !== '.') return false;
  return /\/\/\s*lexicon-allow-abi\b/i.test(line);
}

/** Keywords that mark a declaration position. */
const DECL_KEYWORDS = /\b(?:const|let|var|function|class|interface|type|enum|namespace)\s+$/;

/**
 * Returns true when the identifier at `start` in `line` is positioned as
 * an explicit top-level declaration (`const X`, `function X`, `type X`,
 * `interface X`, etc.). Returns false for:
 *   - property access (`obj.X`) — skipped by `isAbiPropertyAccess` and the
 *     surrounding scanner logic.
 *   - destructuring patterns (`const { BidderAddr } = data`) — these are
 *     backend field consumers; renaming them would desync from the wire
 *     format. The `lexicon-allow-backend-type` pragma is the escape hatch
 *     for declaring backend-shaped types; everything else relies on the
 *     allow-wrapped `services/api/types.ts`.
 *
 * We use a conservative check: one of the declaration keywords appears
 * within the prefix of the line immediately before whitespace + the name.
 */
export function looksLikeDeclaration(line: string, start: number): boolean {
  const prefix = line.slice(0, start);
  return DECL_KEYWORDS.test(prefix);
}

/**
 * Scans for declared identifiers containing banned stems. Skips:
 *   - import/export lines (paths are handled by buildIdentifierPattern
 *     callers only for declarations, not property access).
 *   - Comment-only lines.
 *   - Lines inside `lexicon-allow-start/end` blocks.
 *   - Lines with `// lexicon-allow-abi` or `// lexicon-allow-backend-type`.
 *   - Property access like `obj.bidderAddr` (not a declaration).
 */
export function scanIdentifiers(
  content: string,
  pattern: RegExp,
  opts: { onlyDeclarations?: boolean } = {},
): ScannerHit[] {
  const { onlyDeclarations = true } = opts;
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (/^\s*(?:import|export)\s/.test(line) && /\bfrom\s+['"`]/.test(line)) return;

    // Reset global-regex lastIndex per line.
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const identifier = match[0];
      const start = match.index;
      if (isAbiPropertyAccess(line, start)) continue;
      if (onlyDeclarations && !looksLikeDeclaration(line, start)) continue;
      hits.push({ line: idx + 1, term: identifier, literal: identifier });
    }
  });

  return hits;
}

/** Extracts line and block comment content from a single line. */
export function extractComments(line: string): string[] {
  const out: string[] = [];
  // Block comments on the line.
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(line)) !== null) out.push(m[1]!);
  // Line comment at end of line (or whole line).
  const lineRe = /\/\/\s?(.*)$/;
  const lineMatch = lineRe.exec(line);
  if (lineMatch) out.push(lineMatch[1]!);
  return out;
}

/**
 * Scans only comment content for banned terms. Separate from
 * `scanContent` so CI can surface comment hits as warnings without failing
 * the build.
 */
export function scanComments(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };
  let inBlockComment = false;

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;

    // Multi-line block comments: crudely track /* ... */ across lines.
    let scanLine = line;
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) {
        // Whole line is inside a block comment.
        const matches = line.match(pattern);
        if (matches) for (const m of matches) hits.push({ line: idx + 1, term: m, literal: line });
        return;
      }
      const leading = line.slice(0, end);
      const matches = leading.match(pattern);
      if (matches) for (const m of matches) hits.push({ line: idx + 1, term: m, literal: leading });
      scanLine = line.slice(end + 2);
      inBlockComment = false;
    }

    // Look for /* ... (without */) to open a block spanning next lines.
    const openIdx = scanLine.indexOf('/*');
    if (openIdx !== -1 && scanLine.indexOf('*/', openIdx) === -1) {
      const commentStart = scanLine.slice(openIdx + 2);
      const matches = commentStart.match(pattern);
      if (matches)
        for (const m of matches) hits.push({ line: idx + 1, term: m, literal: commentStart });
      inBlockComment = true;
      return;
    }

    for (const comment of extractComments(scanLine)) {
      const matches = comment.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: comment });
        }
      }
    }
  });

  return hits;
}
