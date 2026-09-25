import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  buildContracts,
  CONTRACT_CATEGORIES,
  contractEntryCopy,
  type ContractEntry,
} from '@/content/legal/contractRegistry';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import {
  ContractEvidence,
  formatSourcifyChecked,
  SourcifyCheckedNote,
} from '@/components/legal/ContractEvidence';
import { SiteLink } from '@/components/layout/SiteLink';
import { AddressChip } from '@/components/ui/address-chip';
import type { ContractAddresses } from '@/services/api/types';

const QUIET_LINK_CLASS =
  'link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground';

/**
 * The one list of Cosmic Signature contract addresses, grouped by role and
 * rendered with the page (no client fetch, no second copy elsewhere). On
 * Arbitrum One every address is the verified one, whatever the indexer
 * answers; an address the indexer reports differently is shown as a caption,
 * never in its place. Every row reads the same way: the name and role, the
 * full address with a copy button, then its Arbiscan and Sourcify evidence
 * on the address's baseline. Where to trade CST or find the NFTs is one
 * quiet line under the core contracts, outside the verification rows.
 */
export function ContractAddressList({
  apiAddresses,
}: {
  /** The dashboard's `ContractAddrs`, or null when the read failed. */
  apiAddresses: ContractAddresses | null | undefined;
}) {
  const t = useTranslations('contracts');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const contracts = buildContracts(apiAddresses, contractEntryCopy(t));
  const markets = [
    { href: CST_UNISWAP_SWAP_URL, label: tNav('ecosystem.uniswap.defaultLabel') },
    { href: CST_GECKOTERMINAL_POOL_URL, label: tNav('ecosystem.geckoTerminal.ariaLabel') },
    { href: COSMIC_SIGNATURE_MARKETPLACE_URL, label: tNav('ecosystem.axiomZero.defaultLabel') },
  ];

  return (
    <section aria-labelledby="contract-addresses-heading">
      {/* The header's lede introduces the list; this names it in the outline. */}
      <h2 id="contract-addresses-heading" className="sr-only">
        {t('addresses.title')}
      </h2>
      <SourcifyCheckedNote
        text={t('addresses.verified', { date: formatSourcifyChecked(locale) })}
        className="max-w-2xl"
      />
      <div className="mt-8 space-y-10">
        {CONTRACT_CATEGORIES.map((category) => {
          const items = contracts.filter((contract) => contract.category === category);
          if (items.length === 0) return null;
          const headingId = `contracts-${category}-heading`;
          return (
            <section key={category} aria-labelledby={headingId}>
              <h3 id={headingId} className="type-title text-foreground">
                {t(`categories.${category}`)}
              </h3>
              <ul className="mt-3 divide-y divide-rule-faint border-t border-rule-faint">
                {items.map((contract) => (
                  <ContractAddressRow
                    key={contract.id}
                    contract={contract}
                    reportedLabel={
                      contract.reported
                        ? t('addresses.reported', { address: contract.reported })
                        : null
                    }
                  />
                ))}
              </ul>
              {category === 'core' ? (
                <p
                  data-slot="contract-markets"
                  className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 type-label"
                >
                  <span className="text-subtle">{t('addresses.markets')}</span>
                  {markets.map((market) => (
                    <SiteLink
                      key={market.href}
                      href={market.href}
                      kind="external"
                      externalIcon={false}
                      className={QUIET_LINK_CLASS}
                    >
                      {market.label}
                      <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
                    </SiteLink>
                  ))}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ContractAddressRow({
  contract,
  reportedLabel,
}: {
  contract: ContractEntry;
  /** What the indexer reports instead of the verified address, when it differs. */
  reportedLabel: string | null;
}) {
  return (
    <li
      data-contract={contract.id}
      className="grid gap-x-10 gap-y-2 py-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_auto_11rem] xl:items-baseline"
    >
      <div className="min-w-0 lg:row-span-2 xl:row-span-1">
        <p className="type-title text-foreground">{contract.name}</p>
        <p className="mt-1 type-body-sm text-muted-foreground">{contract.description}</p>
      </div>
      {/* The whole address at every width (it wraps on phones), for a character-by-character check. */}
      <div className="min-w-0">
        <AddressChip
          address={contract.address}
          variant="plain"
          display="full"
          label={false}
          href={false}
          className="type-hash whitespace-normal text-foreground"
        />
        {reportedLabel ? (
          <p data-slot="contract-drift" className="mt-1.5 type-caption text-attention">
            {reportedLabel}
          </p>
        ) : null}
      </div>
      {/* The evidence closes the row at xl, in a fixed column on the address's baseline. */}
      <ContractEvidence address={contract.address} className="xl:justify-end" />
    </li>
  );
}
