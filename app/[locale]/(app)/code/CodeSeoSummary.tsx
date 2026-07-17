import { Link } from '@/i18n/navigation';

const generationExcerpt = `seed -> SHA3-256 random stream -> three-body simulation -> spectral renderer -> Cosmic Signature NFT image`;

export function CodeSeoSummary() {
  return (
    <section
      aria-labelledby="code-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">Source code · deterministic art</p>
      <h1 id="code-seo-heading" className="mt-4 type-display-md text-foreground">
        Cosmic Signature Source Code
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        Cosmic Signature exposes source-code resources for the deterministic artwork pipeline that
        turns on-chain seeds into three-body NFT art. The client-side viewer below is interactive,
        while this server-rendered summary gives crawlers the key facts before JavaScript runs.
      </p>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30 p-4 text-sm text-muted-foreground">
        <code>{generationExcerpt}</code>
      </pre>
      <nav aria-label="Source code related pages" className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <a
              href="https://ipfs.io/ipfs/QmWEao2HjCvyHJSbYnWLyZj8HfFardxzuNh7AUk1jgyXTm"
              className="text-primary underline-offset-4 hover:underline"
            >
              Open the published IPFS source artifact
            </a>
          </li>
          <li>
            <a
              href="https://github.com/PredictionExplorer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Open the GitHub organization
            </a>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Review verified contracts
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              Read security notes
            </Link>
          </li>
          <li>
            <Link href="/gallery" className="text-primary underline-offset-4 hover:underline">
              Explore generated NFT art
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
