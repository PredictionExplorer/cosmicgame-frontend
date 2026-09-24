import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getAuditsCopy, getRiskCopy, getSecurityCopy } from '@/content/legal';
import { privacyCopyEn } from '@/content/legal/PrivacyContent.en';
import { privacyCopyZh } from '@/content/legal/PrivacyContent.zh';
import type { PrivacyCopy } from '@/content/legal/PrivacyContent';
import { termsCopyEn } from '@/content/legal/TermsContent.en';
import { termsCopyZh } from '@/content/legal/TermsContent.zh';
import type { TrustPageCopy } from '@/content/legal/TrustPageContent';
import { TRUST_DOCUMENT_DATES } from '@/content/legal/trustCenter';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';

/** A locale's Trust Center tab labels (`legal.breadcrumbs`). */
function trustTabLabels(locale: string): Record<'security' | 'audits' | 'risk', string> {
  const legal = JSON.parse(
    readFileSync(join(process.cwd(), 'messages', locale, 'legal.json'), 'utf8'),
  ) as { breadcrumbs: Record<'security' | 'audits' | 'risk', string> };
  return legal.breadcrumbs;
}

function termsStructure(copy: typeof termsCopyEn | typeof termsCopyZh) {
  return {
    sections: copy.sections.map((section) => ({
      id: section.id,
      items: section.content.map((item) => item.id),
    })),
    additional: copy.additional.map((item) => item.id),
  };
}

function privacyStructure(copy: typeof privacyCopyEn | typeof privacyCopyZh) {
  return {
    introduction: copy.introduction.length,
    sections: copy.sections.map((section) => ({
      id: section.id,
      items: section.content.map((item) => item.id),
    })),
    additional: copy.additional.map((item) => item.id),
  };
}

function trustPageStructure(copy: TrustPageCopy) {
  return copy.sections.map((section) => ({
    paragraphs: section.paragraphs?.length ?? 0,
    bullets: section.bullets?.length ?? 0,
    linkParagraph: section.linkParagraph
      ? { kind: section.linkParagraph.kind, href: section.linkParagraph.href }
      : null,
    hasNote: Boolean(section.note),
    links: section.links?.map((link) => ({ kind: link.kind, href: link.href })) ?? [],
  }));
}

describe('localized legal content', () => {
  it('keeps Terms clause structure in exact parity', () => {
    expect(termsStructure(termsCopyZh)).toEqual(termsStructure(termsCopyEn));
    expect(termsCopyZh.title).toBe('服务条款');
  });

  it('keeps Privacy clause structure in exact parity', () => {
    expect(privacyStructure(privacyCopyZh)).toEqual(privacyStructure(privacyCopyEn));
    expect(privacyCopyZh.title).toBe('隐私政策');
  });

  it('keeps trust-page structure (sections, hrefs, link kinds) in exact parity', () => {
    for (const getCopy of [getAuditsCopy, getSecurityCopy, getRiskCopy]) {
      expect(trustPageStructure(getCopy('zh'))).toEqual(trustPageStructure(getCopy('en')));
    }
    // The H1 is the page name; the brand stays in <title> and JSON-LD.
    expect(getAuditsCopy('zh').title).toBe('审计');
    expect(getSecurityCopy('zh').title).toBe('安全');
    expect(getRiskCopy('zh').title).toBe('风险披露');
  });

  it('titles every trust page with its Trust Center tab label, in every locale', () => {
    for (const locale of routing.locales) {
      const legal = trustTabLabels(locale);
      expect(getSecurityCopy(locale).title).toBe(legal.security);
      expect(getAuditsCopy(locale).title).toBe(legal.audits);
      expect(getRiskCopy(locale).title).toBe(legal.risk);
    }
  });

  it('preserves Terms protocol facts and legal dates', () => {
    const chineseTerms = JSON.stringify(termsCopyZh);
    expect(chineseTerms).toContain(
      String(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture),
    );
    expect(chineseTerms).toContain(
      String(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture),
    );
    expect(chineseTerms).toContain(String(protocolFacts.finalGestureExclusivityHours));
    expect(chineseTerms).toContain(String(protocolFacts.secondaryRetrievalTimeoutWeeks));
  });

  it('dates the terms and privacy policy from one locale-independent source', () => {
    // The header renders these through ReviewedStamp, in each locale's long date form.
    expect(TRUST_DOCUMENT_DATES.terms).toEqual({ date: '2026-07-20', kind: 'updated' });
    expect(TRUST_DOCUMENT_DATES.privacy).toEqual({ date: '2026-07-20', kind: 'updated' });
    expect(TRUST_DOCUMENT_DATES.audits).toEqual({ date: '2026-08-24', kind: 'reviewed' });
    // Security and the risk disclosures state no date, so none is invented for them.
    expect(TRUST_DOCUMENT_DATES.security).toBeUndefined();
    expect(TRUST_DOCUMENT_DATES.risk).toBeUndefined();
  });

  it('describes Arbitrum settlement and smart-contract custody accurately in both locales', () => {
    const copy: PrivacyCopy = privacyCopyEn;
    const chineseCopy: PrivacyCopy = privacyCopyZh;
    const englishSecurity = copy.sections
      .flatMap((section) => section.content)
      .find((item) => item.id === 'blockchain')?.text;
    const chineseSecurity = chineseCopy.sections
      .flatMap((section) => section.content)
      .find((item) => item.id === 'blockchain')?.text;

    expect(englishSecurity).toMatch(/Arbitrum.*Ethereum Layer 2/);
    expect(englishSecurity).toMatch(/Connecting a wallet.*non-custodial/);
    expect(englishSecurity).toMatch(/transfer assets.*lock them.*release or retrieval/);
    expect(englishSecurity).not.toContain('remain in your wallet at all times');

    expect(chineseSecurity).toMatch(/Arbitrum.*以太坊二层/);
    expect(chineseSecurity).toMatch(/仅连接钱包.*非托管/);
    expect(chineseSecurity).toMatch(/转入协议合约.*锁定.*释放或取回/);
  });

  it('aligns the Terms IP carve-out with the scoped root CC0 dedication', () => {
    const englishIp = termsCopyEn.additional.find(
      (item) => item.id === 'intellectual-property',
    )?.text;
    const chineseIp = termsCopyZh.additional.find(
      (item) => item.id === 'intellectual-property',
    )?.text;

    expect(englishIp).toMatch(/root LICENSE.*CC0 1\.0/);
    expect(englishIp).toMatch(/Third-party dependencies.*retain their own licenses/);
    expect(englishIp).toMatch(/stated open-source license/);
    expect(englishIp).toMatch(/trademark or patent rights/);
    expect(chineseIp).toMatch(/根目录 LICENSE.*CC0 1\.0/);
    expect(chineseIp).toMatch(/第三方依赖.*各自的许可证/);
    expect(chineseIp).toMatch(/开源许可证/);
  });

  it('ships official CC0 legal code and preserves third-party license notices', () => {
    const license = readFileSync(join(process.cwd(), 'LICENSE'), 'utf8');
    const notices = readFileSync(join(process.cwd(), 'THIRD_PARTY_NOTICES.md'), 'utf8');

    expect(license).toContain('CC0 1.0 Universal');
    expect(license).toContain('1. Copyright and Related Rights.');
    expect(license).toContain('2. Waiver.');
    expect(license).toContain('3. Public License Fallback.');
    expect(license).toContain('4. Limitations and Disclaimers.');
    expect(license).toMatch(/project-owned source code, artwork,\ndocumentation/);
    expect(license).toMatch(/does not apply to third-party dependencies, fonts, assets/);

    expect(notices).toContain('assets/fonts/NotoSansSC-700.subset.ttf');
    expect(notices).toContain(
      '[assets/fonts/OFL-NotoSansCJK.txt](assets/fonts/OFL-NotoSansCJK.txt)',
    );
    expect(notices).toContain('SIL Open Font License 1.1');
    expect(notices).toContain('public/images/brands/geckoterminal-symbol.svg');
    expect(notices).toContain('https://brand.coingecko.com/resources/brand-kit');
  });
});
