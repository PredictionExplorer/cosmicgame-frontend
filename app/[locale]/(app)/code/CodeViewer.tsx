import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';

import {
  CODE_REPOSITORIES,
  IMAGE_GENERATION_IPFS_CID,
  IMAGE_GENERATION_IPFS_URL,
} from '@/content/code/structure';

import { SiteLink } from '@/components/layout/SiteLink';
import { SectionHeader } from '@/components/ui/section-header';

import { COSMIC_SIGNATURE_CODE } from './cosmicSignatureCode';
import { SourceCode, countSourceLines } from './SourceCode';
import { SourceViewer } from './SourceViewer';

const SOURCE_LINK_CLASS =
  'link-quiet inline-flex min-h-11 items-center gap-1 rounded-control px-2 type-label text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground sm:min-h-9';

const IMAGE_GENERATION_REPOSITORY = CODE_REPOSITORIES.find(({ id }) => id === 'images')!.href;

/**
 * The image generation program, rendered on the server: highlighted, with
 * line numbers and anchors, in a frame that scrolls by keyboard, wraps on
 * request and copies the file, next to where else it is published.
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
        links={
          <>
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
          </>
        }
      >
        <SourceCode source={COSMIC_SIGNATURE_CODE} />
      </SourceViewer>
      <p className="mt-3 flex flex-wrap gap-x-2 type-caption text-subtle">
        <span>{t('viewer.cid')}</span>
        <span className="type-hash text-muted-foreground">ipfs://{IMAGE_GENERATION_IPFS_CID}</span>
      </p>
    </section>
  );
}
