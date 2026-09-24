import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import {
  ContractEvidence,
  SourcifyCheckedNote,
  formatSourcifyChecked,
} from '@/components/legal/ContractEvidence';
import { CopyValue } from '@/components/legal/CopyValue';
import {
  LegalLedger,
  LegalList,
  LegalParagraph,
  LegalResourceList,
  type LegalResource,
} from '@/components/legal/LegalProse';
import { RichText } from '@/components/legal/RichText';
import { SiteLink } from '@/components/layout/SiteLink';
import { AddressChip } from '@/components/ui/address-chip';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

import {
  OFFICIAL_COMMUNITY,
  OFFICIAL_CONTRACTS,
  OFFICIAL_WEBSITES,
  type OfficialCommunityId,
  type OfficialContractId,
  type OfficialWebsiteId,
} from './officialAddresses';

export interface SecurityCopy {
  readonly title: string;
  readonly intro: string;
  readonly official: {
    readonly heading: string;
    readonly intro: string;
    readonly websitesHeading: string;
    readonly websites: Readonly<Record<OfficialWebsiteId, string>>;
    readonly communityHeading: string;
    readonly community: Readonly<Record<OfficialCommunityId, string>>;
    readonly contractsHeading: string;
    /**
     * Rich text: may link the contracts page. Says once, for the whole list,
     * that each address is an exact match on Sourcify; `{date}` is the day
     * that was checked (`SOURCIFY_CHECKED`), spelled in the locale.
     */
    readonly contractsIntro: string;
    readonly explorerLink: string;
    readonly sourcifyLink: string;
    /** The copy button's name; `{value}` is the domain. */
    readonly copyLabel: string;
    readonly copiedLabel: string;
  };
  readonly model: {
    readonly heading: string;
    readonly paragraph: string;
    readonly bullets: readonly string[];
  };
  readonly report: {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  };
  readonly verify: {
    readonly heading: string;
    readonly paragraph: string;
    readonly resources: readonly LegalResource[];
  };
}

const COMMUNITY_NAMES: Record<OfficialCommunityId, string> = { x: 'X', discord: 'Discord' };

/**
 * /security, the Trust Center hub: the official websites, community accounts
 * and core contracts (each with its explorer and Sourcify evidence, and the
 * Sourcify statement said once under the heading, before the rows it
 * covers), the security model, how to report a vulnerability, and where to
 * verify.
 */
export function SecurityContent({
  copy,
  locale,
  labels,
  contractNames,
}: {
  copy: SecurityCopy;
  locale: string;
  labels: LegalDocumentLabels;
  /** The core contracts' names, from the `contracts` catalog (the /contracts names). */
  contractNames: Readonly<Record<OfficialContractId, string>>;
}) {
  const { official } = copy;

  const officialContent = (
    <div className="space-y-10">
      <LegalParagraph text={official.intro} locale={locale} />
      <LegalLedger
        heading={official.websitesHeading}
        rows={OFFICIAL_WEBSITES.map(({ id, host }) => ({
          key: id,
          term: (
            <CopyValue
              value={host}
              copyLabel={official.copyLabel.replace('{value}', host)}
              copiedLabel={official.copiedLabel}
            />
          ),
          detail: official.websites[id],
        }))}
      />
      <LegalLedger
        heading={official.communityHeading}
        rows={OFFICIAL_COMMUNITY.map(({ id, handle, href }) => ({
          key: id,
          term: COMMUNITY_NAMES[id],
          // The handle, then what the account is for: two lines on a phone for
          // every row alike, one from sm.
          detail: (
            <span className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
              <span>
                <SiteLink
                  href={href}
                  kind="external"
                  data-touch-target="extended"
                  className={cn(
                    'link inline-flex min-h-6 items-center gap-1 type-hash',
                    TOUCH_TARGET_EXTENDED_CLASS,
                  )}
                >
                  {handle}
                </SiteLink>
              </span>
              <span>{official.community[id]}</span>
            </span>
          ),
        }))}
      />
      <div>
        <LegalLedger
          heading={official.contractsHeading}
          note={
            <SourcifyCheckedNote
              text={
                <RichText
                  text={official.contractsIntro.replace('{date}', formatSourcifyChecked(locale))}
                  locale={locale}
                />
              }
            />
          }
          rows={OFFICIAL_CONTRACTS.map(({ id, address }) => {
            const name = contractNames[id];
            return {
              key: id,
              term: name,
              detail: (
                <span className="flex flex-col gap-1.5">
                  {/* The whole address at every width (it wraps on phones): the page asks
                      readers to check it character by character. */}
                  <AddressChip
                    address={address}
                    variant="plain"
                    display="full"
                    label={false}
                    href={false}
                    className="type-hash self-start whitespace-normal text-foreground"
                  />
                  <ContractEvidence
                    address={address}
                    labels={{ explorer: official.explorerLink, sourcify: official.sourcifyLink }}
                  />
                </span>
              ),
            };
          })}
        />
      </div>
    </div>
  );

  return (
    <LegalDocument
      page="security"
      labels={labels}
      title={copy.title}
      intro={copy.intro}
      sections={[
        { id: 'official', heading: official.heading, content: officialContent },
        {
          id: 'model',
          heading: copy.model.heading,
          content: (
            <>
              <LegalParagraph text={copy.model.paragraph} locale={locale} />
              <LegalList items={copy.model.bullets} locale={locale} />
            </>
          ),
        },
        {
          id: 'report',
          heading: copy.report.heading,
          content: copy.report.paragraphs.map((paragraph) => (
            <LegalParagraph key={paragraph} text={paragraph} locale={locale} />
          )),
        },
        {
          id: 'verify',
          heading: copy.verify.heading,
          content: (
            <>
              <LegalParagraph text={copy.verify.paragraph} locale={locale} />
              <LegalResourceList resources={copy.verify.resources} locale={locale} />
            </>
          ),
        },
      ]}
    />
  );
}
