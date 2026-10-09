import type { LegalDocumentLabels } from '@/content/legal/labels';
import { protocolFacts } from '@/content/protocol-facts';

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

/**
 * The protocol contract's owner as the chain reports it: an account (a
 * single-key wallet, or a contract such as a multisig), renounced (the zero
 * address), or unavailable when the read failed.
 */
export type ProtocolOwner =
  | { status: 'account'; address: string; kind: 'singleKey' | 'contract' }
  | { status: 'renounced' }
  | { status: 'unavailable' };

export interface SecurityRow {
  readonly term: string;
  /** Rich text: may carry link tags. */
  readonly detail: string;
}

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
  /**
   * Who controls the protocol: the owner (read live), what it can change
   * between cycles, during a cycle and at any time, the upgrade path and the
   * handover to the Cosmic Council. Facts from the FAQ's team-controls answer.
   */
  readonly controls: {
    readonly heading: string;
    /** Rich text: links the coordination changes page. */
    readonly paragraph: string;
    readonly ownerLabel: string;
    readonly ownerUnavailable: string;
    readonly account: Readonly<Record<'singleKey' | 'contract' | 'renounced', string>>;
    readonly rows: readonly SecurityRow[];
  };
  readonly model: {
    readonly heading: string;
    readonly paragraph: string;
    readonly bullets: readonly string[];
  };
  /** How to report: the address, what a report says, what is in scope, how to disclose. */
  readonly report: {
    readonly heading: string;
    readonly lead: string;
    readonly include: readonly string[];
    readonly scopeHeading: string;
    readonly scope: readonly SecurityRow[];
    readonly closing: string;
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
 * covers), who controls the protocol and how it upgrades, the security
 * model, how to report a vulnerability, and where to verify.
 */
export function SecurityContent({
  copy,
  locale,
  labels,
  contractNames,
  implementationNote,
  owner,
}: {
  copy: SecurityCopy;
  locale: string;
  labels: LegalDocumentLabels;
  /** The core contracts' names, from the `contracts` catalog (the /contracts names). */
  contractNames: Readonly<Record<OfficialContractId, string>>;
  /** What the implementation row is (the code behind the protocol proxy). */
  implementationNote: string;
  /** The protocol contract's owner, read from the chain for this render. */
  owner: ProtocolOwner;
}) {
  const { official, controls, report } = copy;
  const evidenceLabels = { explorer: official.explorerLink, sourcify: official.sourcifyLink };

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
                  {id === 'implementation' ? (
                    <span className="type-caption text-subtle">{implementationNote}</span>
                  ) : null}
                  <ContractEvidence address={address} labels={evidenceLabels} />
                </span>
              ),
            };
          })}
        />
      </div>
    </div>
  );

  const ownerDetail =
    owner.status === 'account' ? (
      <span className="flex flex-col gap-1.5">
        <AddressChip
          address={owner.address}
          variant="plain"
          display="full"
          label={false}
          href={false}
          className="type-hash self-start whitespace-normal text-foreground"
        />
        <span>{controls.account[owner.kind]}</span>
        <ContractEvidence address={owner.address} labels={evidenceLabels} />
      </span>
    ) : owner.status === 'renounced' ? (
      controls.account.renounced
    ) : (
      <span className="flex flex-col gap-1.5">
        <span>{controls.ownerUnavailable}</span>
        <ContractEvidence address={protocolFacts.contractAddresses.proxy} labels={evidenceLabels} />
      </span>
    );

  const controlsContent = (
    <>
      <LegalParagraph text={controls.paragraph} locale={locale} />
      <LegalLedger
        rows={[
          { key: 'owner', term: controls.ownerLabel, detail: ownerDetail },
          ...controls.rows.map((row) => ({
            key: row.term,
            term: row.term,
            detail: <RichText text={row.detail} locale={locale} />,
          })),
        ]}
      />
    </>
  );

  const reportContent = (
    <>
      <LegalParagraph text={report.lead} locale={locale} />
      <LegalList items={report.include} locale={locale} />
      <LegalLedger
        heading={report.scopeHeading}
        rows={report.scope.map((row) => ({
          key: row.term,
          term: row.term,
          detail: <RichText text={row.detail} locale={locale} />,
        }))}
      />
      <LegalParagraph text={report.closing} locale={locale} />
    </>
  );

  return (
    <LegalDocument
      page="security"
      labels={labels}
      title={copy.title}
      intro={copy.intro}
      sections={[
        { id: 'official', heading: official.heading, content: officialContent },
        { id: 'controls', heading: controls.heading, content: controlsContent },
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
        { id: 'report', heading: report.heading, content: reportContent },
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
