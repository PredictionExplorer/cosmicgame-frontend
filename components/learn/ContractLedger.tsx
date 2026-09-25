import { SiteLink } from '@/components/layout/SiteLink';

export interface ContractLedgerRow {
  /** The contract's name, as the contracts page gives it. */
  name: string;
  /** The checksummed address. */
  address: string;
  /** The address on the block explorer. */
  href: string;
}

/**
 * Contract addresses as a ledger: each contract's name beside its full
 * address in the identifier face, linked to the explorer, so a reader can
 * check the address a guide names without leaving for another page first.
 */
export function ContractLedger({ rows }: { rows: readonly ContractLedgerRow[] }) {
  return (
    <dl className="divide-y divide-rule-faint border-y border-rule-faint">
      {rows.map((row) => (
        <div
          key={row.address}
          className="grid gap-x-8 gap-y-1 py-3.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-baseline"
        >
          <dt className="type-body-sm text-foreground">{row.name}</dt>
          <dd className="min-w-0">
            <SiteLink
              href={row.href}
              kind="external"
              className="link-entity inline-flex max-w-full items-baseline gap-1.5 type-hash text-muted-foreground"
              externalIconClassName="self-center"
            >
              <span className="min-w-0 break-all">{row.address}</span>
            </SiteLink>
          </dd>
        </div>
      ))}
    </dl>
  );
}
