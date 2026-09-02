import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { auditsCopyEn } from './AuditsContent.en';
import { auditsCopyUk } from './AuditsContent.uk';
import { auditsCopyZh } from './AuditsContent.zh';
import { auditsCopyZhHk } from './AuditsContent.zh-HK';
import { auditsCopyZhTw } from './AuditsContent.zh-TW';
import { privacyCopyEn } from './PrivacyContent.en';
import { privacyCopyUk } from './PrivacyContent.uk';
import { privacyCopyZh } from './PrivacyContent.zh';
import { privacyCopyZhHk } from './PrivacyContent.zh-HK';
import { privacyCopyZhTw } from './PrivacyContent.zh-TW';
import { riskCopyEn } from './RiskContent.en';
import { riskCopyUk } from './RiskContent.uk';
import { riskCopyZh } from './RiskContent.zh';
import { riskCopyZhHk } from './RiskContent.zh-HK';
import { riskCopyZhTw } from './RiskContent.zh-TW';
import { securityCopyEn } from './SecurityContent.en';
import { securityCopyUk } from './SecurityContent.uk';
import { securityCopyZh } from './SecurityContent.zh';
import { securityCopyZhHk } from './SecurityContent.zh-HK';
import { securityCopyZhTw } from './SecurityContent.zh-TW';
import { termsCopyEn } from './TermsContent.en';
import { termsCopyUk } from './TermsContent.uk';
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
};
const PRIVACY_COPY: LocaleRecord<PrivacyCopy> = {
  en: privacyCopyEn,
  zh: privacyCopyZh,
  'zh-TW': privacyCopyZhTw,
  'zh-HK': privacyCopyZhHk,
  uk: privacyCopyUk,
};
const AUDITS_COPY: LocaleRecord<TrustPageCopy> = {
  en: auditsCopyEn,
  zh: auditsCopyZh,
  'zh-TW': auditsCopyZhTw,
  'zh-HK': auditsCopyZhHk,
  uk: auditsCopyUk,
};
const SECURITY_COPY: LocaleRecord<TrustPageCopy> = {
  en: securityCopyEn,
  zh: securityCopyZh,
  'zh-TW': securityCopyZhTw,
  'zh-HK': securityCopyZhHk,
  uk: securityCopyUk,
};
const RISK_COPY: LocaleRecord<TrustPageCopy> = {
  en: riskCopyEn,
  zh: riskCopyZh,
  'zh-TW': riskCopyZhTw,
  'zh-HK': riskCopyZhHk,
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
