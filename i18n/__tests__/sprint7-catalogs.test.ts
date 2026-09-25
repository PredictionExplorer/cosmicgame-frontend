import enAdmin from '@/messages/en/admin.json';
import enCoordination from '@/messages/en/coordination.json';
import enEthContribution from '@/messages/en/ethContribution.json';
import enMarketing from '@/messages/en/marketing.json';
import enPublicGoods from '@/messages/en/publicGoods.json';
import zhAdmin from '@/messages/zh/admin.json';
import zhCoordination from '@/messages/zh/coordination.json';
import zhEthContribution from '@/messages/zh/ethContribution.json';
import zhMarketing from '@/messages/zh/marketing.json';
import zhPublicGoods from '@/messages/zh/publicGoods.json';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('Sprint 7 focused catalogs', () => {
  it.each([
    ['admin', enAdmin, zhAdmin],
    ['coordination', enCoordination, zhCoordination],
    ['ethContribution', enEthContribution, zhEthContribution],
    ['marketing', enMarketing, zhMarketing],
    ['publicGoods', enPublicGoods, zhPublicGoods],
  ] as const)('%s has exact English/Chinese key parity', (_name, en, zh) => {
    expect(leafKeys(zh).sort()).toEqual(leafKeys(en).sort());
  });

  it('contains complete Chinese route, form, status, tooltip, and ARIA copy', () => {
    expect(zhEthContribution.page.historyTitle).toBe('贡献记录');
    expect(zhEthContribution.form.contributeEth).toBe('贡献 ETH');
    expect(zhEthContribution.detail.breadcrumbContributions).toBe('ETH 贡献');
    expect(zhPublicGoods.loadError).toBe('无法加载公共物品记录。');
    expect(zhMarketing.cta.copyEmail).toBe('复制邮箱地址');
    expect(zhAdmin.outreachTransfer.form.sends).toBe('将转出 {amount}');
    expect(zhCoordination.page.title).toBe('协调变更');
    expect(zhCoordination.events.publicGoodsPercentage).toBe('公共物品比例已变更');
    expect(zhAdmin.outreachTransfer.restrictedTitle).toBe('此钱包不是财务执行人');
  });

  it('pins the reviewed English rendering', () => {
    expect(enEthContribution.form.title).toBe('Contribute ETH');
    expect(enEthContribution.form.submitAmount).toBe('Contribute {amount}');
    expect(enPublicGoods.loadError).toBe('The Public Goods records couldn’t be loaded.');
    expect(enMarketing.cta.contact).toBe('Email the outreach team');
    expect(enCoordination.page.title).toBe('Coordination changes');
    expect(enAdmin.settings.title).toBe('Contract settings');
  });

  it('uses glossary-safe Chinese for outreach and public-goods copy', () => {
    expect(JSON.stringify(zhMarketing)).not.toMatch(/奖励|收益|赚取/);
    expect(JSON.stringify(zhPublicGoods)).not.toMatch(/慈善|捐赠|捐款/);
  });
});
