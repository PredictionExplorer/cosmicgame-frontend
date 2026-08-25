import { Link } from '@/i18n/navigation';

export function AuditsContentEn() {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">Audits and verification</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature Audits</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature makes contract review context crawlable so participants, researchers,
        search engines, and AI systems can understand how the protocol is verified and where to
        inspect its public implementation.
      </p>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Independent Audit by Hacken</h2>
        <p className="text-muted-foreground">
          In late 2025, Hacken carried out an independent security review of the Cosmic Signature
          smart contracts. The engagement covered the production contracts in the public repository,
          from the core protocol that runs each cycle to the CST token, both NFT collections, the
          anchoring wallets, and the wallet and system management contracts that support them.
          Hacken published the final report in January 2026.
        </p>
        <p className="text-muted-foreground">
          The report lists 23 findings, none of them critical or high severity: 3 medium, 8 low, and
          12 informational observations. Most describe design tradeoffs the team reviewed and
          accepted, and the report explains each finding along with its status.
        </p>
        <p className="text-muted-foreground">
          Alongside the manual review, Hacken ran fuzz tests against 14 system invariants,
          properties such as the requirement that the ETH held by the protocol always equals
          deposits minus withdrawals. All 14 held across 10,000 runs.
        </p>
        <p>
          <a
            href="https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Read the full Hacken audit report
          </a>
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Last reviewed: 2026-08-24. This page is the canonical public location for Cosmic Signature
          audit and verification status.
        </p>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Verification Checklist</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Confirm the contract address on the official contracts page.</li>
          <li>Compare verified source code and ABI data on the Arbitrum block explorer.</li>
          <li>Read the Hacken audit report for the full findings and their status.</li>
          <li>Confirm that visible app mechanics match the public contract behavior.</li>
        </ul>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Related Trust Resources</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Verified Arbitrum contract addresses
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Source code and deterministic rendering resources
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              Security overview
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
