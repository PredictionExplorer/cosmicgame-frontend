import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { auditsCopyEn } from './AuditsContent.en';
import { auditsCopyJa } from './AuditsContent.ja';
import { auditsCopyKo } from './AuditsContent.ko';
import { auditsCopyUk } from './AuditsContent.uk';
import { auditsCopyVi } from './AuditsContent.vi';
import { auditsCopyZh } from './AuditsContent.zh';
import { auditsCopyZhHk } from './AuditsContent.zh-HK';
import { auditsCopyZhTw } from './AuditsContent.zh-TW';
import { privacyCopyEn } from './PrivacyContent.en';
import { privacyCopyJa } from './PrivacyContent.ja';
import { privacyCopyKo } from './PrivacyContent.ko';
import { privacyCopyUk } from './PrivacyContent.uk';
import { privacyCopyVi } from './PrivacyContent.vi';
import { privacyCopyZh } from './PrivacyContent.zh';
import { privacyCopyZhHk } from './PrivacyContent.zh-HK';
import { privacyCopyZhTw } from './PrivacyContent.zh-TW';
import { riskCopyEn } from './RiskContent.en';
import { riskCopyJa } from './RiskContent.ja';
import { riskCopyKo } from './RiskContent.ko';
import { riskCopyUk } from './RiskContent.uk';
import { riskCopyVi } from './RiskContent.vi';
import { riskCopyZh } from './RiskContent.zh';
import { riskCopyZhHk } from './RiskContent.zh-HK';
import { riskCopyZhTw } from './RiskContent.zh-TW';
import { securityCopyEn } from './SecurityContent.en';
import { securityCopyJa } from './SecurityContent.ja';
import { securityCopyKo } from './SecurityContent.ko';
import { securityCopyUk } from './SecurityContent.uk';
import { securityCopyVi } from './SecurityContent.vi';
import { securityCopyZh } from './SecurityContent.zh';
import { securityCopyZhHk } from './SecurityContent.zh-HK';
import { securityCopyZhTw } from './SecurityContent.zh-TW';
import { termsCopyEn } from './TermsContent.en';
import { termsCopyJa } from './TermsContent.ja';
import { termsCopyKo } from './TermsContent.ko';
import { termsCopyUk } from './TermsContent.uk';
import { termsCopyVi } from './TermsContent.vi';
import { termsCopyZh } from './TermsContent.zh';
import { termsCopyZhHk } from './TermsContent.zh-HK';
import { termsCopyZhTw } from './TermsContent.zh-TW';
import type { PrivacyCopy } from './PrivacyContent';
import type { TermsCopy } from './TermsContent';
import type { TrustPageCopy } from './TrustPageContent';

/**
 * Locale registries for every legal and trust page. Pages resolve their copy
 * here and render it through the shared TermsContent / PrivacyContent /
 * TrustPageContent components — adding a locale means adding one entry per
 * registry, enforced by the compiler.
 */

const TERMS_COPY: LocaleRecord<TermsCopy> = {
  en: termsCopyEn,
  zh: termsCopyZh,
  'zh-TW': termsCopyZhTw,
  'zh-HK': termsCopyZhHk,
  uk: termsCopyUk,
  ko: termsCopyKo,
  ja: termsCopyJa,
  vi: termsCopyVi,
};
const PRIVACY_COPY: LocaleRecord<PrivacyCopy> = {
  en: privacyCopyEn,
  zh: privacyCopyZh,
  'zh-TW': privacyCopyZhTw,
  'zh-HK': privacyCopyZhHk,
  uk: privacyCopyUk,
  ko: privacyCopyKo,
  ja: privacyCopyJa,
  vi: privacyCopyVi,
};
const AUDITS_COPY: LocaleRecord<TrustPageCopy> = {
  en: auditsCopyEn,
  zh: auditsCopyZh,
  'zh-TW': auditsCopyZhTw,
  'zh-HK': auditsCopyZhHk,
  uk: auditsCopyUk,
  ko: auditsCopyKo,
  ja: auditsCopyJa,
  vi: auditsCopyVi,
};
const SECURITY_COPY: LocaleRecord<TrustPageCopy> = {
  en: securityCopyEn,
  zh: securityCopyZh,
  'zh-TW': securityCopyZhTw,
  'zh-HK': securityCopyZhHk,
  uk: securityCopyUk,
  ko: securityCopyKo,
  ja: securityCopyJa,
  vi: securityCopyVi,
};
const RISK_COPY: LocaleRecord<TrustPageCopy> = {
  en: riskCopyEn,
  zh: riskCopyZh,
  'zh-TW': riskCopyZhTw,
  'zh-HK': riskCopyZhHk,
  uk: riskCopyUk,
  ko: riskCopyKo,
  ja: riskCopyJa,
  vi: riskCopyVi,
};

export function getTermsCopy(locale: string): TermsCopy {
  return pickByLocale(TERMS_COPY, locale);
}

export function getPrivacyCopy(locale: string): PrivacyCopy {
  return pickByLocale(PRIVACY_COPY, locale);
}

export function getAuditsCopy(locale: string): TrustPageCopy {
  return pickByLocale(AUDITS_COPY, locale);
}

export function getSecurityCopy(locale: string): TrustPageCopy {
  return pickByLocale(SECURITY_COPY, locale);
}

export function getRiskCopy(locale: string): TrustPageCopy {
  return pickByLocale(RISK_COPY, locale);
}
