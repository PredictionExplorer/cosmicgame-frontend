import enCode from '@/messages/en/code.json';
import enContracts from '@/messages/en/contracts.json';
import enFaq from '@/messages/en/faq.json';
import enImprint from '@/messages/en/imprint.json';
import enLegal from '@/messages/en/legal.json';
import zhCode from '@/messages/zh/code.json';
import zhContracts from '@/messages/zh/contracts.json';
import zhFaq from '@/messages/zh/faq.json';
import zhImprint from '@/messages/zh/imprint.json';
import zhLegal from '@/messages/zh/legal.json';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('Sprint 6 focused catalogs', () => {
  it.each([
    ['faq', enFaq, zhFaq],
    ['legal', enLegal, zhLegal],
    ['contracts', enContracts, zhContracts],
    ['code', enCode, zhCode],
    ['imprint', enImprint, zhImprint],
  ] as const)('%s has exact English/Chinese key parity', (_name, en, zh) => {
    expect(leafKeys(zh).sort()).toEqual(leafKeys(en).sort());
  });

  it('contains Chinese UI, tooltip, form, and ARIA copy', () => {
    expect(zhFaq.search.ariaLabel).toBe('搜索常见问题');
    expect(zhFaq.category.copyLinkAria).toContain('复制');
    expect(zhContracts.search.placeholder).toContain('搜索合约');
    expect(zhContracts.addressCard.explorerAria).toContain('区块浏览器');
    expect(zhCode.viewer.title).toBe('代码查看器');
    expect(zhImprint.page.submit).toBe('铭刻');
  });

  it('does not alter English UI source strings', () => {
    expect(enFaq.search.placeholder).toBe('Search questions...');
    expect(enContracts.page.title).toBe('Contract Addresses');
    expect(enCode.viewer.title).toBe('Code Viewer');
    expect(enImprint.page.submit).toBe('Imprint Now');
  });
});
