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
    expect(zhEthContribution.page.title).toBe('ETH 贡献');
    expect(zhEthContribution.form.contributeEth).toBe('贡献 ETH');
    expect(zhEthContribution.detail.breadcrumbHome).toBe('首页');
    expect(zhPublicGoods.retrievals.title).toBe('公共物品取回');
    expect(zhMarketing.stats.infoAria).toContain('说明');
    expect(zhMarketing.transferForm.recipientLabel).toBe('接收地址');
    expect(zhCoordination.page.title).toBe('协调变更');
    expect(zhCoordination.events.publicGoodsPercentage).toBe('公共物品比例已变更');
    expect(zhAdmin.outreachTransfer.restrictedTitle).toBe('访问受限');
  });

  it('preserves the existing English rendering', () => {
    expect(enEthContribution.page.title).toBe('ETH Contributions');
    expect(enEthContribution.form.contributeWithMessage).toBe('Contribute with Message');
    expect(enPublicGoods.protocol.title).toBe('Protocol Public-Goods Contributions');
    expect(enMarketing.hero.title).toBe(
      'E<legacy>arn</legacy> Rewards by <highlight>Spreading the Word</highlight>',
    );
    expect(enCoordination.page.title).toBe('Coordination Changes');
    expect(enAdmin.settings.title).toBe('Administrative methods');
  });

  it('uses glossary-safe Chinese for outreach and public-goods copy', () => {
    expect(JSON.stringify(zhMarketing)).not.toMatch(/奖励|收益|赚取/);
    expect(JSON.stringify(zhPublicGoods)).not.toMatch(/慈善|捐赠|捐款/);
  });
});
