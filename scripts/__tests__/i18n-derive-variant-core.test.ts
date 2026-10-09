import {
  DERIVATIONS,
  convertJsonSource,
  createVariantConverter,
  renameIdentifiers,
} from '../i18n-derive-variant-core';
import { LOCALE_CONVENTIONS, checkConventions } from '../i18n-conventions-core';

const tw = createVariantConverter('zh', 'zh-TW')!;
const hk = createVariantConverter('zh', 'zh-HK')!;

describe('createVariantConverter', () => {
  it('declares derivations for both Traditional locales and back', () => {
    expect(Object.keys(DERIVATIONS).sort()).toEqual(
      ['zh->zh-HK', 'zh->zh-TW', 'zh-HK->zh', 'zh-TW->zh'].sort(),
    );
    expect(createVariantConverter('zh', 'uk')).toBeUndefined();
  });

  it('applies the glossary, not just characters, for Taiwan', () => {
    expect(tw.text('落笔 演绎周期 锚定派发 公共物品 网站地图 用户 软件 网络 信息')).toBe(
      '落筆 演繹週期 錨定配發 公共財 網站導覽 使用者 軟體 網路 資訊',
    );
    expect(tw.text('校准窗口 连接钱包 程序化 台湾 参数 权限 免责声明 倒计时')).toBe(
      '校準窗口 連接錢包 程序化 台灣 參數 權限 免責聲明 倒數',
    );
  });

  it('applies the glossary for Hong Kong', () => {
    expect(
      hk.text('落笔 演绎周期 锚定派发 公共物品 网站地图 用户 软件 网络 信息 隐私政策 首页'),
    ).toBe('落筆 演繹週期 錨定派發 公共物品 網站地圖 用戶 軟件 網絡 資訊 私隱政策 主頁');
  });

  it('switches quotation marks to corner brackets', () => {
    expect(tw.text('所谓“落笔”')).toBe('所謂「落筆」');
    expect(hk.text('所谓“落笔”和‘一笔’')).toBe('所謂「落筆」和『一筆』');
  });

  it('keeps Hong Kong copy on standard character forms while keeping its character choices', () => {
    const out = hk.text('说明 阅读 用户 这里 看着 税务 温度 开启');
    expect(out).toBe('說明 閱讀 用戶 這裏 看着 稅務 溫度 開啟');
  });

  it('restores senses the blanket substitutions would break', () => {
    expect(tw.text('提案通过后，通过下方链接查看')).toContain('提案通過');
    expect(tw.text('提案通过后，通过下方链接查看')).toContain('透過下方連結');
    expect(tw.text('刷新纪录；请刷新页面')).toBe('刷新紀錄；請重新整理頁面');
    expect(tw.text('记录在链上的交易记录')).toBe('記錄在鏈上的交易紀錄');
  });

  it('produces drafts that already satisfy the script conventions', () => {
    const source =
      '每一笔都会延长收官倒计时，并把“分配”写入链上记录。请通过应用查看详情，当前默认为 24 小时。';
    expect(checkConventions(tw.text(source), LOCALE_CONVENTIONS['zh-TW']!)).toEqual([]);
    expect(checkConventions(hk.text(source), LOCALE_CONVENTIONS['zh-HK']!)).toEqual([]);
  });
});

describe('renameIdentifiers', () => {
  it('renames module exports, constants, and sibling imports', () => {
    const source = [
      "import { basicQuestionsTextZh } from './text.basic.zh';",
      'const ELAPSED_ZH = {};',
      'export const faqTextZh = { a: ELAPSED_ZH };',
    ].join('\n');
    expect(renameIdentifiers(source, 'zh', 'zh-TW')).toBe(
      [
        "import { basicQuestionsTextZhTw } from './text.basic.zh-TW';",
        'const ELAPSED_ZH_TW = {};',
        'export const faqTextZhTw = { a: ELAPSED_ZH_TW };',
      ].join('\n'),
    );
  });
});

describe('convertJsonSource', () => {
  it('preserves formatting and re-encodes escaped denial copy in the target script', () => {
    // lexicon-allow-start: the fixture is denial copy, escaped exactly as the catalogs escape it
    const raw = '{\n  "title": "不是\\u6295资产品",\n  "n": "彩\\u7968"\n}\n';
    const out = convertJsonSource(raw, tw);
    expect(out).toBe('{\n  "title": "不是\\u6295資產品",\n  "n": "彩\\u7968"\n}\n');
    expect(JSON.parse(out)).toEqual({ title: '不是投資產品', n: '彩票' });
    // lexicon-allow-end
  });
});
