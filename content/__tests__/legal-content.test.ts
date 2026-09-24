import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getAuditsCopy,
  getPrivacyCopy,
  getRiskCopy,
  getSecurityCopy,
  getTermsCopy,
} from '@/content/legal';
import { LEGAL_LINKS, isLegalLinkId } from '@/content/legal/links';
import { privacyCopyEn } from '@/content/legal/PrivacyContent.en';
import { privacyCopyZh } from '@/content/legal/PrivacyContent.zh';
import type { PrivacyCopy } from '@/content/legal/PrivacyContent';
import {
  activePrivacyStorage,
  ART_MOTION_STORAGE_KEY,
  ATTENTION_STORAGE_KEY,
  QUIZ_ATTEMPT_STORAGE_NAME,
  QUIZ_BEST_STORAGE_NAME,
} from '@/content/legal/privacyInventory';
import { RISK_GROUP_IDS } from '@/content/legal/RiskContent';
import { termsCopyEn } from '@/content/legal/TermsContent.en';
import { termsCopyZh } from '@/content/legal/TermsContent.zh';
import { TERMS_ALLOCATION_ROWS } from '@/content/legal/termsAllocations';
import { TRUST_CENTER_PAGES, TRUST_DOCUMENT_DATES } from '@/content/legal/trustCenter';
import { protocolFacts } from '@/content/protocol-facts';

import { richTextLinks } from '@/components/legal/RichText';
import { ART_MOTION_STORAGE_KEY as HOOK_ART_MOTION_KEY } from '@/components/home/experimental/useArtMotionPreference';
import { attemptStorageKey, bestScoreStorageKey } from '@/components/quiz/quizProgress';
import { ATTENTION_STORAGE_KEY as HOOK_ATTENTION_KEY } from '@/hooks/useAttentionPreferences';
import { routing } from '@/i18n/routing';

/** A locale's Trust Center tab labels (`legal.breadcrumbs`). */
function trustTabLabels(locale: string): Record<'security' | 'audits' | 'risk', string> {
  const legal = JSON.parse(
    readFileSync(join(process.cwd(), 'messages', locale, 'legal.json'), 'utf8'),
  ) as { breadcrumbs: Record<'security' | 'audits' | 'risk', string> };
  return legal.breadcrumbs;
}

/** Every string in a copy object, with its path, in a stable order. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => strings(item, `${path}.${key}`));
  }
  return [];
}

/** The shape of a copy object: every path, without its text. */
function shape(value: unknown): string[] {
  return strings(value)
    .map(([path]) => path)
    .sort();
}

const GETTERS = {
  security: getSecurityCopy,
  audits: getAuditsCopy,
  risk: getRiskCopy,
  terms: getTermsCopy,
  privacy: getPrivacyCopy,
} as const;

const TRANSLATED = routing.locales.filter((locale) => locale !== routing.defaultLocale);

/** Strips link tags, for assertions about the words. */
const plain = (text: string | undefined) => (text ?? '').replace(/<\/?\w+>/g, '');

describe('localized legal content', () => {
  it.each(Object.entries(GETTERS))(
    '%s: every locale has the same structure as English',
    (_page, getCopy) => {
      const english = shape(getCopy('en'));
      for (const locale of TRANSLATED) {
        expect({ locale, shape: shape(getCopy(locale)) }).toEqual({ locale, shape: english });
      }
    },
  );

  it.each(Object.entries(GETTERS))(
    '%s: every link tag is known and each string links what English links',
    (_page, getCopy) => {
      const english = new Map(strings(getCopy('en')));
      for (const locale of routing.locales) {
        for (const [path, text] of strings(getCopy(locale))) {
          const tags = richTextLinks(text);
          for (const tag of tags)
            expect({ locale, path, tag, known: isLegalLinkId(tag) }).toEqual({
              locale,
              path,
              tag,
              known: true,
            });
          expect({ locale, path, tags: [...tags].sort() }).toEqual({
            locale,
            path,
            tags: [...richTextLinks(english.get(path) ?? '')].sort(),
          });
        }
      }
    },
  );

  it('keeps the link ids the copy may name in one registry', () => {
    for (const target of Object.values(LEGAL_LINKS)) {
      expect(target.href).toMatch(/^(\/|https:\/\/|mailto:)/);
    }
  });

  it('titles every trust page with its Trust Center tab label, in every locale', () => {
    for (const locale of routing.locales) {
      const legal = trustTabLabels(locale);
      expect(getSecurityCopy(locale).title).toBe(legal.security);
      expect(getAuditsCopy(locale).title).toBe(legal.audits);
      expect(getRiskCopy(locale).title).toBe(legal.risk);
    }
    expect(termsCopyZh.title).toBe('服务条款');
    expect(privacyCopyZh.title).toBe('隐私政策');
  });

  it('groups the risks in the same order in every locale', () => {
    for (const locale of routing.locales) {
      expect(getRiskCopy(locale).groups.map((group) => group.id)).toEqual([...RISK_GROUP_IDS]);
    }
  });

  it('states the participant-specific risks from the protocol facts in every locale', () => {
    for (const locale of routing.locales) {
      const risk = JSON.stringify(getRiskCopy(locale));
      expect(risk).toContain(String(protocolFacts.finalGestureExclusivityHours));
      expect(risk).toContain(String(protocolFacts.secondaryRetrievalTimeoutWeeks));
      expect(risk).toContain(`${protocolFacts.ethGestureCostStepUpPercent}`);
    }
  });

  it('preserves Terms protocol facts in every locale', () => {
    for (const locale of routing.locales) {
      const terms = JSON.stringify(getTermsCopy(locale));
      // The decimal separator follows the locale (vi: 0,4).
      const increase = String(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture);
      expect(terms).toMatch(new RegExp(increase.replace('.', '[.,]')));
      expect(terms).toContain(String(protocolFacts.finalGestureExclusivityHours));
      expect(terms).toContain(String(protocolFacts.secondaryRetrievalTimeoutWeeks));
      expect(terms).toContain(`${protocolFacts.randomWalkDiscountPercentage}%`);
    }
  });

  it('names every allocation track of the table in the Terms clauses', () => {
    for (const locale of routing.locales) {
      const allocations = getTermsCopy(locale).sections.find(
        (section) => section.id === 'allocations',
      );
      const named = new Set(
        allocations?.content.filter((item) => item.subtitle).map((item) => item.id),
      );
      for (const row of TERMS_ALLOCATION_ROWS)
        expect({ locale, row: row.id, named: named.has(row.id) }).toEqual({
          locale,
          row: row.id,
          named: true,
        });
    }
  });

  it('lists the prohibited activities without typed bullet glyphs', () => {
    for (const locale of routing.locales) {
      const prohibited = getTermsCopy(locale).sections.find(
        (section) => section.id === 'prohibited',
      );
      expect(prohibited?.bullets).toHaveLength(7);
      for (const bullet of prohibited?.bullets ?? []) expect(bullet).not.toMatch(/^[•·-]/);
    }
  });

  it('dates every Trust Center document from one locale-independent source', () => {
    for (const { id } of TRUST_CENTER_PAGES) {
      expect(TRUST_DOCUMENT_DATES[id].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // The review date of the audit status; the text dates of the documents.
    expect(TRUST_DOCUMENT_DATES.audits).toEqual({ date: '2026-08-24', kind: 'reviewed' });
    expect(TRUST_DOCUMENT_DATES.terms).toEqual({ date: '2026-07-20', kind: 'updated' });
    // No copy states a date of its own any more.
    for (const locale of routing.locales) {
      for (const getCopy of Object.values(GETTERS)) {
        expect(JSON.stringify(getCopy(locale))).not.toMatch(/20\d\d-\d\d-\d\d/);
      }
    }
  });

  it('pins the storage keys the privacy policy names to their sources', () => {
    expect(ATTENTION_STORAGE_KEY).toBe(HOOK_ATTENTION_KEY);
    // The experimental home's paused-art preference was once missing from the policy.
    expect(ART_MOTION_STORAGE_KEY).toBe(HOOK_ART_MOTION_KEY);
    // The quiz keys are built per tier (and per locale for an attempt): the
    // policy names them by pattern.
    const pattern = (name: string) =>
      new RegExp(`^${name.replace(/[.:]/g, '\\$&').replace('*', '.+')}$`);
    expect(attemptStorageKey('en', 'basic')).toMatch(pattern(QUIZ_ATTEMPT_STORAGE_NAME));
    expect(attemptStorageKey('zh-TW', 'hard')).toMatch(pattern(QUIZ_ATTEMPT_STORAGE_NAME));
    expect(bestScoreStorageKey('basic')).toMatch(pattern(QUIZ_BEST_STORAGE_NAME));
    expect(activePrivacyStorage().flatMap((entry) => entry.names)).toEqual(
      expect.arrayContaining([
        ATTENTION_STORAGE_KEY,
        ART_MOTION_STORAGE_KEY,
        QUIZ_ATTEMPT_STORAGE_NAME,
        QUIZ_BEST_STORAGE_NAME,
      ]),
    );
  });

  it('lists every storage key the app declares', () => {
    const listed = new Set(activePrivacyStorage().flatMap((entry) => entry.names));
    const declared = /(?:STORAGE_KEY|StorageKey) = '([a-z0-9-]+)'/g;
    const keys = ['app', 'components', 'hooks', 'lib', 'contexts'].flatMap((dir) =>
      (readdirSync(join(process.cwd(), dir), { recursive: true }) as string[])
        .filter((file) => /\.tsx?$/.test(file) && !file.includes('__tests__'))
        .flatMap((file) =>
          Array.from(
            readFileSync(join(process.cwd(), dir, file), 'utf8').matchAll(declared),
            (match) => match[1] ?? '',
          ),
        ),
    );
    expect(keys).toEqual(expect.arrayContaining(['cosmic-experimental-art-paused']));
    for (const key of keys) expect(listed).toContain(key);
  });

  it('describes Arbitrum settlement and smart-contract custody accurately', () => {
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

  it('states what the site does instead of what it may do', () => {
    const english = JSON.stringify(privacyCopyEn);
    expect(english).not.toMatch(/We may collect|may use cookies|may use third-party/);
  });

  it('aligns the Terms IP carve-out with the scoped root CC0 dedication', () => {
    const englishIp = plain(
      termsCopyEn.additional.find((item) => item.id === 'intellectual-property')?.text,
    );
    const chineseIp = plain(
      termsCopyZh.additional.find((item) => item.id === 'intellectual-property')?.text,
    );

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
