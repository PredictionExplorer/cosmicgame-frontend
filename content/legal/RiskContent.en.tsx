import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

export function RiskContentEn({ locale }: { locale: string }) {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">Risk and participant clarity</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature Risk Disclosures</h1>
      {/* lexicon-allow-start: explicit legal denial copy must name the denied categories. */}
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature is a procedural on-chain art protocol on Arbitrum. It is not a lottery,
        casino, gambling product, investment product, or promise of financial results.
      </p>
      {/* lexicon-allow-end */}

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Key Risks</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Blockchain transactions are public and generally irreversible.</li>
          <li>
            Wallet security, private keys, and transaction approvals are user responsibilities.
          </li>
          <li>Network congestion, RPC outages, indexer delays, or app issues can affect UX.</li>
          <li>
            Protocol parameters, allocations, and timing should be reviewed before participating.
          </li>
          <li>
            CST and NFTs should not be understood as guaranteed returns or financial products.
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">What Participants Do</h2>
        <p className="text-muted-foreground">
          Participants make gestures during Performance Cycles. Gestures can influence the evolving
          protocol state, imprint Participation CST, and contribute to the context of deterministic
          Cosmic Signature NFT art. Outcomes are defined by public smart-contract mechanics, not by
          off-chain promises.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Related Pages</h2>
        <ul className="space-y-3">
          <li>
            {/* lexicon-allow-start: link label names the categories denied by the linked page. */}
            <a
              href={localeHref(LANDING_ORIGIN, '/learn/not-a-lottery-not-an-investment', locale)}
              className="text-primary underline-offset-4 hover:underline"
            >
              Is Cosmic Signature a lottery, casino, or investment?
            </a>
            {/* lexicon-allow-end */}
          </li>
          <li>
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms of Service
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
