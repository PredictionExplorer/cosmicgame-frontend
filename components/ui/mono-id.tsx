import type { ReactNode } from 'react';

/**
 * Sets an identifier inside a line of text in the identifier face, wherever
 * the locale's template put it: "Signature #000023", "签名作品 #000023",
 * "シグネチャー#000023". Token numbers and addresses are always mono
 * (docs/design-system.md → Typography), also inside a sentence-case title.
 * The number takes `type-mono-inline` (the line's size less a sixteenth, so
 * the mono x-height sits level with Inter, never broken); the rest of the
 * line keeps its own face and size. Text without the identifier comes back
 * unchanged.
 *
 * `restClassName` goes on the words around the identifier (a compact label
 * can hide them below a breakpoint and keep the number alone); they stay in
 * the text, so the line reads the same to assistive technology and tests.
 */
export function withMonoId(text: string, id: string, restClassName?: string): ReactNode {
  const at = id ? text.indexOf(id) : -1;
  if (at < 0) return text;
  const rest = (part: string) =>
    part && restClassName ? <span className={restClassName}>{part}</span> : part;
  return (
    <>
      {rest(text.slice(0, at))}
      <span className="type-mono-inline">{id}</span>
      {rest(text.slice(at + id.length))}
    </>
  );
}
