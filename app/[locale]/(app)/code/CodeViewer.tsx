import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

import {
  CODE_REPOSITORIES,
  IMAGE_GENERATION_IPFS_CID,
  IMAGE_GENERATION_IPFS_URL,
} from '@/content/code/structure';

import { CopyValue } from '@/components/legal/CopyValue';
import { SiteLink } from '@/components/layout/SiteLink';
import { SectionHeader } from '@/components/ui/section-header';

import { COSMIC_SIGNATURE_CODE } from './cosmicSignatureCode';
import { SourceCode, countSourceLines } from './SourceCode';
import { SourceViewer } from './SourceViewer';

const SOURCE_LINK_CLASS =
  'link-quiet inline-flex min-h-6 items-center gap-1 type-label text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground';

const IMAGE_GENERATION_REPOSITORY = CODE_REPOSITORIES.find(({ id }) => id === 'images')!.href;

const IPFS_URI = `ipfs://${IMAGE_GENERATION_IPFS_CID}`;
/** "ipfs://QmWEao…gyXTm": the ends a reader compares, whole on a phone. */
const IPFS_URI_SHORT = `ipfs://${IMAGE_GENERATION_IPFS_CID.slice(0, 6)}…${IMAGE_GENERATION_IPFS_CID.slice(-5)}`;

/**
 * The image generation program, rendered on the server: highlighted, with
 * line numbers and anchors, in a frame that scrolls by keyboard, wraps on
 * request and copies the file; under it, its IPFS identifier and where else
 * it is published.
 */
export default function CodeViewer() {
  const t = useTranslations('code');
  const lineCount = countSourceLines(COSMIC_SIGNATURE_CODE);

  return (
    <section aria-labelledby="code-viewer-heading">
      <SectionHeader
        headingId="code-viewer-heading"
        title={t('viewer.title')}
        description={t('viewer.description')}
      />
      <SourceViewer
        regionLabel={t('viewer.codeAria')}
        meta={
          <>
            {t('viewer.language')}
            <span aria-hidden className="px-1.5 text-subtle">
              ·
            </span>
            {t('viewer.lines', { count: lineCount })}
          </>
        }
      >
        <SourceCode source={COSMIC_SIGNATURE_CODE} />
      </SourceViewer>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 type-caption text-subtle">
          <span>{t('viewer.cid')}</span>
          <CopyValue
            value={IPFS_URI}
            display={IPFS_URI_SHORT}
            copyLabel={t('viewer.copyCid')}
            copiedLabel={t('viewer.copied')}
            className="sm:hidden"
          />
          <CopyValue
            value={IPFS_URI}
            copyLabel={t('viewer.copyCid')}
            copiedLabel={t('viewer.copied')}
            className="max-sm:hidden"
          />
        </p>
        <p className="flex items-center gap-x-5">
          <SiteLink
            href={IMAGE_GENERATION_IPFS_URL}
            kind="external"
            externalIcon={false}
            className={SOURCE_LINK_CLASS}
          >
            {t('viewer.ipfs')}
            <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
          </SiteLink>
          <SiteLink
            href={IMAGE_GENERATION_REPOSITORY}
            kind="external"
            externalIcon={false}
            className={SOURCE_LINK_CLASS}
          >
            {t('viewer.github')}
            <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
          </SiteLink>
        </p>
      </div>
    </section>
  );
}
