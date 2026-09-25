'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';

import type { AttachedNftProjectLink } from './attachedNftLinks';

/**
 * The project site an attached NFT's own metadata names, as a caption:
 * "Project site randomwalknft.com". Whoever deployed the contract wrote the
 * link, so it is never a card's primary link, and the caption shows its
 * whole host, wrapped rather than cut: a host is checked by its end, and a
 * cut one ("opensea.io-retrieve.example" shown as "opensea.io-ret…") would
 * show a phone reader only a trusted-looking start.
 */
export function AttachedNftProjectSite({
  link,
  className,
}: {
  link: AttachedNftProjectLink;
  className?: string;
}) {
  const t = useTranslations('statistics');
  return (
    <p className={cn('min-w-0 type-caption text-subtle', className)}>
      <span className="me-1.5">{t('attachedNftLinks.projectSite')}</span>
      <SiteLink
        kind="external"
        href={link.href}
        rel="noopener noreferrer nofollow ugc"
        className="link-quiet inline-flex min-h-6 max-w-full items-center gap-1"
      >
        <span className="min-w-0 [overflow-wrap:anywhere]">{link.host}</span>
      </SiteLink>
    </p>
  );
}
