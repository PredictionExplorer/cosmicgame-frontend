'use client';

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { SiteLinkKind } from '@/config/siteNav';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * `viewport` keeps Next's default (prefetch when the link scrolls into
 * view). `intent` prefetches only on hover or keyboard focus, for long link
 * directories (footers, the site map, the 404 page) that would otherwise
 * fetch dozens of routes the visitor never opens.
 */
export type SiteLinkPrefetch = 'viewport' | 'intent';

export interface SiteLinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
  href: string;
  kind: SiteLinkKind;
  prefetch?: SiteLinkPrefetch;
  /** Draw the new-tab arrow after an external link's text. Default true. */
  externalIcon?: boolean;
  externalIconClassName?: string;
}

/**
 * One link behaviour for both hosts (config/siteNav `classifyHref`):
 *
 * - internal: the locale-aware router `Link`;
 * - crossHost (app ↔ cosmicsignature.com): a plain anchor in the same tab,
 *   no arrow, since it is still Cosmic Signature;
 * - external: a new tab with `rel="noopener noreferrer"`, an arrow, and
 *   "(opens in a new tab)" for screen readers.
 *
 * Forwards its ref and props, so Radix `asChild` menu items can wrap it.
 */
export const SiteLink = forwardRef<HTMLAnchorElement, SiteLinkProps>(function SiteLink(
  {
    href,
    kind,
    prefetch = 'viewport',
    externalIcon = true,
    externalIconClassName,
    children,
    onPointerEnter,
    onFocus,
    ...rest
  },
  ref,
) {
  const t = useTranslations('nav');
  const router = useRouter();

  if (kind === 'external') {
    return (
      <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        {externalIcon ? (
          <ArrowUpRight
            aria-hidden
            className={cn('size-3.5 shrink-0 text-subtle', externalIconClassName)}
          />
        ) : null}
        <span className="sr-only"> {t('link.newTab')}</span>
      </a>
    );
  }

  if (kind === 'crossHost') {
    return (
      <a ref={ref} href={href} {...rest}>
        {children}
      </a>
    );
  }

  if (prefetch === 'intent') {
    const warm = () => router.prefetch(href);
    return (
      <Link
        ref={ref}
        href={href}
        prefetch={false}
        onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
          warm();
          onPointerEnter?.(event);
        }}
        onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
          warm();
          onFocus?.(event);
        }}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link ref={ref} href={href} onPointerEnter={onPointerEnter} onFocus={onFocus} {...rest}>
      {children}
    </Link>
  );
});
