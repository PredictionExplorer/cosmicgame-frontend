import { ArrowUpRight } from 'lucide-react';

/**
 * A wall-label title that leaves the site, with the external-link arrow
 * bound to its last word: a wrapped title keeps the arrow at the end of its
 * text ("Random Walk / #004079 ↗"), never alone at the far edge of the card.
 */
export function TitleWithArrow({ text, arrow = true }: { text: string; arrow?: boolean }) {
  if (!arrow) return <>{text}</>;
  const cut = text.lastIndexOf(' ') + 1;
  return (
    <>
      {text.slice(0, cut)}
      <span className="whitespace-nowrap">
        {text.slice(cut)}
        <ArrowUpRight aria-hidden className="ms-1 inline size-3.5 align-[-0.125em] text-subtle" />
      </span>
    </>
  );
}
