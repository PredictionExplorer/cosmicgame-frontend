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
 */
export function withMonoId(text: string, id: string): ReactNode {
  const at = id ? text.indexOf(id) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="type-mono-inline">{id}</span>
      {text.slice(at + id.length)}
    </>
  );
}
