/**
 * Conversion tables and pure functions behind `npm run i18n:derive`
 * (scripts/i18n-derive-variant.ts): how a sibling-script Chinese locale is
 * bootstrapped from an existing one. Kept apart from the CLI so the same
 * pipeline can seed test fixtures and be unit-tested without a filesystem.
 *
 * A derivation is OpenCC character/phrase conversion, then the target's
 * quotation marks, then character-form normalization, then glossary-driven
 * phrase substitutions (docs/i18n/glossary-<locale>.md). Its output is a
 * mechanical draft — mechanically correct enough to pass every i18n gate,
 * still to be rewritten for register — never shipped copy.
 */

import * as OpenCC from 'opencc-js';

import type { AppLocale } from '../i18n/routing';

import { HK_STANDARD_FORMS } from './i18n-script-conventions-core';

type Preset = 'cn' | 'tw' | 'twp' | 'hk' | 'hkp';

export interface Derivation {
  readonly from: Preset;
  readonly to: Preset;
  /** Quotation marks of the target convention: [open, close, openInner, closeInner]. */
  readonly quotes: readonly [string, string, string, string] | null;
  /** Character substitutions applied after OpenCC (see HK_STANDARD_FORMS). */
  readonly characterOverrides?: Readonly<Record<string, string>>;
  /**
   * Glossary-driven phrase substitutions applied in order after conversion:
   * the coined terms and everyday vocabulary where the target locale differs
   * from what OpenCC produces. Longer phrases come first so they win over
   * their substrings; a later pair may restore a sense an earlier one broke.
   */
  readonly substitutions?: ReadonlyArray<readonly [string, string]>;
}

/** Vocabulary both Traditional locales share against OpenCC's mainland-flavoured output. */
export const HANT_SHARED_SUBSTITUTIONS: ReadonlyArray<readonly [string, string]> = [
  ['收官倒計時', '收官倒數'],
  ['倒計時', '倒數'],
  ['詳細信息', '詳情'],
  ['信息', '資訊'],
  ['加載', '載入'],
  ['鏈接', '連結'],
  ['設置', '設定'],
  ['視頻', '影片'],
  ['默認', '預設'],
  ['菜單', '選單'],
  ['聯繫', '聯絡'],
  ['界面', '介面'],
  ['在線', '線上'],
  ['實時', '即時'],
  ['賬戶', '帳戶'],
  ['轉賬', '轉帳'],
  ['設備', '裝置'],
  ['登錄', '登入'],
  ['刷新', '重新整理'],
  ['搜索', '搜尋'],
  ['服務器', '伺服器'],
  ['內容質量', '內容品質'],
  ['當前', '目前'],
  ['瞭解', '了解'],
  ['稍後重試', '稍後再試'],
  ['儀表盤', '儀表板'],
  ['響應', '回應'],
  ['出錯了', '發生錯誤'],
  ['周期', '週期'],
  ['上鍊', '上鏈'],
  ['許可證', '授權條款'],
  ['倉庫', '儲存庫'],
  ['會回退', '會被還原'],
  ['API 返回', 'API 回傳'],
  // "the app" is 應用程式 in Taiwan and Hong Kong; bare 應用 reads mainland. The
  // one verb use in the source (應用體驗, "apply the experience") is restored.
  ['應用', '應用程式'],
  ['應用程式體驗', '應用體驗'],
  // 通過 is "via" almost everywhere in the copy, which both locales word as 透過;
  // the governance sense ("the proposal passes") is restored afterwards.
  ['通過', '透過'],
  ['提案透過', '提案通過'],
  ['獲透過', '獲通過'],
  ['表決透過', '表決通過'],
  ['投票透過', '投票通過'],
];

export const TW_SUBSTITUTIONS: ReadonlyArray<readonly [string, string]> = [
  ...HANT_SHARED_SUBSTITUTIONS,
  ['錨定派發', '錨定配發'],
  ['派發', '配發'],
  ['公共物品', '公共財'],
  ['校準視窗', '校準窗口'],
  ['視窗', '窗口'],
  // OpenCC renders every 连接 as 連線 (a network link); wallets are 連接 in Taiwan
  // crypto usage, while services and the network itself stay 連線.
  ['連線錢包', '連接錢包'],
  ['連線 Web3 錢包', '連接 Web3 錢包'],
  ['連線 MetaMask', '連接 MetaMask'],
  ['錢包尚未連線', '錢包尚未連接'],
  ['錢包仍在連線', '錢包仍在連接'],
  ['錢包已連線', '錢包已連接'],
  ['請連線轉出錢包', '請連接轉出錢包'],
  ['目前連線的錢包', '目前連接的錢包'],
  ['無法連線協議', '無法連線至協議'],
  ['無法連線即時', '無法連線至即時'],
  ['程式化', '程序化'],
  ['網站地圖', '網站導覽'],
  ['反饋', '回饋'],
  ['移動端', '行動裝置'],
  ['屏幕', '螢幕'],
  ['隱私政策', '隱私權政策'],
  ['風險披露', '風險揭露'],
  // OpenCC's Taiwan table renders 参数 as 引數 (a programming argument), 审核 as
  // 稽核 (an accounting audit), 权限 as 許可權, 声明 as 宣告, 类型 as 型別,
  // 扩展 as 擴充套件; the site means 參數, 審核, 權限, 聲明, 類型, 擴充功能.
  ['引數', '參數'],
  ['稽核', '審核'],
  ['許可權', '權限'],
  ['宣告', '聲明'],
  ['型別', '類型'],
  ['擴充套件', '擴充功能'],
  ['校驗', '驗證'],
  ['獲取', '取得'],
  ['核驗', '驗證'],
  ['運行於', '運作於'],
  ['訪問者', '訪客'],
  ['訪問', '存取'],
  ['釋出', '發布'],
  ['下浮', '下調'],
  // Taiwan UI says 導覽 for navigation (導航 is GPS) and 整體 for 全局.
  ['導航', '導覽'],
  ['全域性', '整體'],
  ['意外錯誤', '未預期的錯誤'],
  ['支援 170 多', '支持 170 多'],
  ['支援以太坊', '支持以太坊'],
  ['支援權重', '支持權重'],
  ['支援與棄權', '支持與棄權'],
  ['支援或反對', '支持或反對'],
  ['支援、反對', '支持、反對'],
  ['支援公共財', '支持公共財'],
  ['支援由宇宙議會', '支持由宇宙議會'],
  ['支援郵箱', '支援信箱'],
  // Taiwan writes the noun "a record" as 紀錄 (交易紀錄, 瀏覽紀錄) and keeps 記錄
  // for the verb; the verb contexts in the copy are restored afterwards.
  ['記錄', '紀錄'],
  ['紀錄了', '記錄了'],
  ['紀錄本', '記錄本'],
  ['紀錄下', '記錄下'],
  ['紀錄著', '記錄著'],
  ['紀錄在', '記錄在'],
  ['紀錄每', '記錄每'],
  ['紀錄為', '記錄為'],
  // 刷新 is right for records (刷新紀錄); only page refreshes are 重新整理.
  ['重新整理紀錄', '刷新紀錄'],
  ['重新整理堅守紀錄', '刷新堅守紀錄'],
  ["cosmicsignature.com/zh'", "cosmicsignature.com/zh-TW'"],
  ['臺', '台'],
];

export const HK_SUBSTITUTIONS: ReadonlyArray<readonly [string, string]> = [
  ...HANT_SHARED_SUBSTITUTIONS,
  ['移動端', '流動裝置'],
  ['隱私政策', '私隱政策'],
  ['隱私', '私隱'],
  ['電子郵件', '電郵'],
  ['首頁', '主頁'],
  ['內容品質', '內容質素'],
  ['核驗', '核實'],
  ['交互', '互動'],
  ['存儲', '儲存'],
  ['訪問者', '訪客'],
  ['重新整理紀錄', '刷新紀錄'],
  ['重新整理堅守紀錄', '刷新堅守紀錄'],
  // A message attached to a gesture is a 訊息; 消息 is news.
  ['消息', '訊息'],
  ["cosmicsignature.com/zh'", "cosmicsignature.com/zh-HK'"],
];

/**
 * Supported derivations. Taiwan gets OpenCC's phrase conversion (`twp`:
 * 软件→軟體, 信息→資訊); Hong Kong's phrase dictionary is small, so `hkp`
 * changes little beyond characters — the glossary substitutions carry the
 * vocabulary and the rewrite pass carries the register.
 */
export const DERIVATIONS: Readonly<Record<string, Derivation>> = {
  'zh->zh-TW': {
    from: 'cn',
    to: 'twp',
    quotes: ['「', '」', '『', '』'],
    substitutions: TW_SUBSTITUTIONS,
  },
  'zh->zh-HK': {
    from: 'cn',
    to: 'hkp',
    quotes: ['「', '」', '『', '』'],
    characterOverrides: HK_STANDARD_FORMS,
    substitutions: HK_SUBSTITUTIONS,
  },
  'zh-TW->zh': { from: 'twp', to: 'cn', quotes: ['“', '”', '‘', '’'] },
  'zh-HK->zh': { from: 'hkp', to: 'cn', quotes: ['“', '”', '‘', '’'] },
};

/** Source-script quotation marks, so they can be swapped for the target's. */
const SOURCE_QUOTES: Readonly<Record<string, readonly [string, string, string, string]>> = {
  zh: ['“', '”', '‘', '’'],
  'zh-TW': ['「', '」', '『', '』'],
  'zh-HK': ['「', '」', '『', '』'],
};

export interface VariantConverter {
  /** Converts copy text (a catalog value, a whole copy module). */
  readonly text: (text: string) => string;
  /** Converts a single character without phrase context (for `\uXXXX` escapes). */
  readonly character: (character: string) => string;
}

/** The converter for `from → to`, or `undefined` when no derivation is declared. */
export function createVariantConverter(
  from: AppLocale,
  to: AppLocale,
): VariantConverter | undefined {
  const derivation = DERIVATIONS[`${from}->${to}`];
  if (!derivation) return undefined;
  const convertChars = OpenCC.Converter({ from: derivation.from, to: derivation.to });
  const sourceQuotes = SOURCE_QUOTES[from];

  return {
    text(text) {
      let out = convertChars(text);
      if (sourceQuotes && derivation.quotes) {
        for (let index = 0; index < sourceQuotes.length; index += 1) {
          out = out.split(sourceQuotes[index]!).join(derivation.quotes[index]!);
        }
      }
      for (const [variant, standard] of Object.entries(derivation.characterOverrides ?? {})) {
        out = out.split(variant).join(standard);
      }
      for (const [phrase, replacement] of derivation.substitutions ?? []) {
        out = out.split(phrase).join(replacement);
      }
      return out;
    },
    character: convertChars,
  };
}

/** `Zh` → `ZhTw`, `_ZH` → `_ZH_TW`: the identifier suffix convention of copy modules. */
export function identifierSuffix(locale: AppLocale): { camel: string; upper: string } {
  const parts = locale.split('-');
  return {
    camel: parts.map((part) => part[0]!.toUpperCase() + part.slice(1).toLowerCase()).join(''),
    upper: parts.map((part) => part.toUpperCase()).join('_'),
  };
}

/** Renames a copy module's exports and sibling imports from one locale to another. */
export function renameIdentifiers(source: string, from: AppLocale, to: AppLocale): string {
  const fromSuffix = identifierSuffix(from);
  const toSuffix = identifierSuffix(to);
  return source
    .replace(
      new RegExp(`\\b([A-Za-z][A-Za-z0-9]*)${fromSuffix.camel}\\b`, 'g'),
      `$1${toSuffix.camel}`,
    )
    .replace(new RegExp(`\\b([A-Z][A-Z0-9_]*)_${fromSuffix.upper}\\b`, 'g'), `$1_${toSuffix.upper}`)
    .replace(new RegExp(`(from '\\./[^']*\\.)${from}'`, 'g'), `$1${to}'`);
}

/**
 * Converts a catalog as raw JSON text, not re-serialized: formatting and key
 * order survive, and so do the `\uXXXX` escapes the catalogs use to keep
 * FAQ/legal denial copy ("this is not a lottery") out of the lexicon scanner
 * (JSON has no comment for an allow pragma). Each escaped character is
 * re-encoded in the target script so the decoded value stays pure.
 */
export function convertJsonSource(raw: string, converter: VariantConverter): string {
  const converted = converter.text(raw);
  return converted.replace(/\\u([0-9a-fA-F]{4})/g, (escape, hex: string) => {
    const character = String.fromCharCode(parseInt(hex, 16));
    const target = converter.character(character);
    if (target === character) return escape;
    return Array.from(target)
      .map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
      .join('');
  });
}
