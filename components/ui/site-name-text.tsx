import { Fragment } from 'react';

import { SITE_NAME } from '@/utils/seo';

/** A Han or katakana word written straight after the brand, with no space (Cosmic Signatureギャラリー). */
const GLUED_WORD = /^[\p{Script=Han}\p{Script=Katakana}]/u;

/**
 * Display text that keeps the brand whole: "Cosmic Signature" never splits
 * across lines in a heading ("Cosmic / Signatureの仕組み"), wherever the line
 * has room for it. Below 360px a 36px heading cannot fit the brand on one line
 * at all, so there it may still break between its words rather than inside one.
 *
 * Japanese and Chinese write the next word straight after the brand. A
 * particle (の, は) stays glued to it, so the line turns after
 * "Cosmic Signatureの"; before a Han or katakana word a zero-width break point
 * (as in lib/phrases.ts) lets the line turn right after the brand.
 */
export function SiteNameText({ children }: { children: string }) {
  const parts = children.split(SITE_NAME);
  if (parts.length === 1) return children;
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? (
        <>
          <span className="min-[22.5rem]:whitespace-nowrap">{SITE_NAME}</span>
          {GLUED_WORD.test(part) ? '​' : null}
        </>
      ) : null}
      {part}
    </Fragment>
  ));
}
