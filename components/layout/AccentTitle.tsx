import { Fragment } from 'react';

const ACCENT = /(<accent>[\s\S]*?<\/accent>)/;
const ACCENT_PART = /^<accent>([\s\S]*)<\/accent>$/;

/**
 * A title from a content module with its accented words marked
 * `<accent>…</accent>` — the content-module counterpart of next-intl's
 * `t.rich('title', { accent })`. One string per locale keeps word order and
 * spacing in the copy, never in JSX (a literal JSX space between two halves
 * put a forbidden space into Japanese titles).
 *
 *   <AccentTitle text="How Cosmic Signature <accent>Works</accent>" />
 */
export function AccentTitle({ text }: { text: string }) {
  return (
    <>
      {text.split(ACCENT).map((part, index) => {
        const accent = part.match(ACCENT_PART);
        return accent ? (
          <span key={index} className="text-primary">
            {accent[1]}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        );
      })}
    </>
  );
}
