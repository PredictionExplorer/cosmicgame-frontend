import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { auditsCopyEn } from './AuditsContent.en';
import { auditsCopyUk } from './AuditsContent.uk';
import { auditsCopyZh } from './AuditsContent.zh';
import { privacyCopyEn } from './PrivacyContent.en';
import { privacyCopyUk } from './PrivacyContent.uk';
import { privacyCopyZh } from './PrivacyContent.zh';
import { riskCopyEn } from './RiskContent.en';
import { riskCopyUk } from './RiskContent.uk';
import { riskCopyZh } from './RiskContent.zh';
import { securityCopyEn } from './SecurityContent.en';
import { securityCopyUk } from './SecurityContent.uk';
import { securityCopyZh } from './SecurityContent.zh';
import { termsCopyEn } from './TermsContent.en';
import { termsCopyUk } from './TermsContent.uk';
import { termsCopyZh } from './TermsContent.zh';
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
  uk: termsCopyUk,
};
const PRIVACY_COPY: LocaleRecord<PrivacyCopy> = {
  en: privacyCopyEn,
  zh: privacyCopyZh,
  uk: privacyCopyUk,
};
const AUDITS_COPY: LocaleRecord<TrustPageCopy> = {
  en: auditsCopyEn,
  zh: auditsCopyZh,
  uk: auditsCopyUk,
};
const SECURITY_COPY: LocaleRecord<TrustPageCopy> = {
  en: securityCopyEn,
  zh: securityCopyZh,
  uk: securityCopyUk,
};
const RISK_COPY: LocaleRecord<TrustPageCopy> = {
  en: riskCopyEn,
  zh: riskCopyZh,
  uk: riskCopyUk,
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
