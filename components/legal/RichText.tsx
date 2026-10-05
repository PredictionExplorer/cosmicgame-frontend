import type { ReactNode } from 'react';

import { LEGAL_LINKS, isLegalLinkId, type LegalLinkId } from '@/content/legal/links';

import { SiteLink } from '@/components/layout/SiteLink';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

/** One run of legal copy: plain text, a linked phrase, or a literal (a URL, an address). */
export type RichTextToken =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'link'; readonly id: LegalLinkId; readonly value: string }
  | { readonly type: 'code'; readonly value: string };

// `<contracts>the contracts page</contracts>` or `` `app.cosmicsignature.com` ``.
const TOKEN = /<([A-Za-z][A-Za-z0-9]*)>([\s\S]*?)<\/\1>|`([^`]+)`/g;

/**
 * Splits legal copy into its runs. A tag names an entry of `LEGAL_LINKS`; an
 * unknown tag keeps its words and drops the markup, so a typo in one locale
 * never prints angle brackets (the legal-copy test rejects unknown tags).
 */
export function parseRichText(text: string): RichTextToken[] {
  const tokens: RichTextToken[] = [];
  let cursor = 0;
  const push = (token: RichTextToken) => {
    const previous = tokens.at(-1);
    if (token.type === 'text' && previous?.type === 'text') {
      tokens[tokens.length - 1] = { type: 'text', value: previous.value + token.value };
    } else if (token.value) {
      tokens.push(token);
    }
  };
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) push({ type: 'text', value: text.slice(cursor, index) });
    const [, tag, inner, code] = match;
    if (code !== undefined) push({ type: 'code', value: code });
    else if (tag && isLegalLinkId(tag)) push({ type: 'link', id: tag, value: inner ?? '' });
    else push({ type: 'text', value: inner ?? '' });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) push({ type: 'text', value: text.slice(cursor) });
  return tokens;
}

/** The tags a piece of copy uses, in order (for the copy-parity test). */
export function richTextLinks(text: string): string[] {
  return Array.from(text.matchAll(TOKEN), (match) => match[1]).filter((tag): tag is string =>
    Boolean(tag),
  );
}

export interface LegalLinkProps {
  id: LegalLinkId;
  locale: string;
  children: ReactNode;
  /** Replaces the inline `link` style (a row that draws its own affordance). */
  className?: string;
  /** Draw the new-tab arrow after an external link. Default true. */
  externalIcon?: boolean;
}

/**
 * A link to one of the Trust Center's verifiable artifacts: a route on this
 * host, a page on the marketing host (localized there), an external source
 * (new tab, arrow, screen-reader note) or the support mailbox.
 */
export function LegalLink({
  id,
  locale,
  children,
  className,
  externalIcon = true,
}: LegalLinkProps) {
  const target = LEGAL_LINKS[id];
  const classes = className ?? 'link';
  switch (target.kind) {
    case 'app':
      return (
        <SiteLink href={target.href} kind="internal" className={classes}>
          {children}
        </SiteLink>
      );
    case 'landing':
      return (
        <SiteLink
          href={localeHref(LANDING_ORIGIN, target.href, locale)}
          kind="crossHost"
          className={classes}
        >
          {children}
        </SiteLink>
      );
    case 'external':
      return (
        <SiteLink
          href={target.href}
          kind="external"
          className={classes}
          externalIcon={externalIcon}
          externalIconClassName="ms-0.5 inline align-[-0.1em] text-current"
        >
          {children}
        </SiteLink>
      );
    case 'email':
    case 'file':
      return (
        <a href={target.href} className={classes}>
          {children}
        </a>
      );
  }
}

/**
 * Legal copy with its links: tags become `LegalLink`s and backticked
 * literals become code, so neither markup ever reaches the reader.
 * Renders no hooks; works in server and client trees.
 */
export function RichText({ text, locale }: { text: string; locale: string }) {
  return (
    <>
      {parseRichText(text).map((token, index) => {
        if (token.type === 'link') {
          return (
            <LegalLink key={index} id={token.id} locale={locale}>
              {token.value}
            </LegalLink>
          );
        }
        if (token.type === 'code') {
          return (
            <code key={index} className="type-hash text-foreground">
              {token.value}
            </code>
          );
        }
        return token.value;
      })}
    </>
  );
}
