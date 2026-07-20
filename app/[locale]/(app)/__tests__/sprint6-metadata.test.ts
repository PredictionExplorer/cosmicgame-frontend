import zhMeta from '@/messages/zh/meta.json';

import { APP_ORIGIN } from '@/lib/hostRouting';

import { generateMetadata as generateAuditsMetadata } from '../audits/page';
import { generateMetadata as generateCodeMetadata } from '../code/page';
import { generateMetadata as generateContractsMetadata } from '../contracts/page';
import { generateMetadata as generateFaqMetadata } from '../faq/page';
import { generateMetadata as generateImprintMetadata } from '../imprint/page';
import { generateMetadata as generatePrivacyMetadata } from '../privacy/page';
import { generateMetadata as generateRiskMetadata } from '../risk-disclosures/page';
import { generateMetadata as generateSecurityMetadata } from '../security/page';
import { generateMetadata as generateTermsMetadata } from '../terms/page';

jest.mock('../contracts/Contracts', () => ({ __esModule: true, default: () => null }));
jest.mock('../contracts/ContractsSeoSummary', () => ({ ContractsSeoSummary: () => null }));
jest.mock('../code/CodeViewer', () => ({ __esModule: true, default: () => null }));
jest.mock('../code/CodeSeoSummary', () => ({ CodeSeoSummary: () => null }));
jest.mock('../imprint/Imprint', () => ({ __esModule: true, default: () => null }));
jest.mock('../PublicDataRouteSeoSummary', () => ({ PublicDataRouteSeoSummary: () => null }));

const localizedRoutes = [
  ['/faq', generateFaqMetadata],
  ['/terms', generateTermsMetadata],
  ['/privacy', generatePrivacyMetadata],
  ['/risk-disclosures', generateRiskMetadata],
  ['/security', generateSecurityMetadata],
  ['/audits', generateAuditsMetadata],
  ['/contracts', generateContractsMetadata],
  ['/code', generateCodeMetadata],
  ['/imprint', generateImprintMetadata],
] as const;

describe('Sprint 6 route metadata', () => {
  it.each(localizedRoutes)(
    '%s emits zh canonical, hreflang, and OG locale',
    async (path, build) => {
      const metadata = await build({ params: Promise.resolve({ locale: 'zh' }) });
      expect(metadata.alternates).toEqual({
        canonical: `${APP_ORIGIN}/zh${path}`,
        languages: {
          en: `${APP_ORIGIN}${path}`,
          zh: `${APP_ORIGIN}/zh${path}`,
          'x-default': `${APP_ORIGIN}${path}`,
        },
      });
      expect(metadata.openGraph).toEqual(expect.objectContaining({ locale: 'zh_CN' }));
    },
  );

  it('contains complete Chinese titles for catalog-backed routes', () => {
    expect(zhMeta.faq.title).toContain('常见问题');
    expect(zhMeta.contracts.title).toContain('合约');
    expect(zhMeta.pageTerms.title).toContain('服务条款');
    expect(zhMeta.pagePrivacy.title).toContain('隐私政策');
    expect(zhMeta.security.title).toContain('安全');
    expect(zhMeta.audits.title).toContain('审计');
    expect(zhMeta.code.title).toContain('源代码');
    expect(zhMeta.mint.title).toContain('铭刻');
  });
});
