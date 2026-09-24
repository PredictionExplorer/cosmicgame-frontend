import { highlightRust, type RustTokenKind } from './highlightRust';

/**
 * Token colours: the palette's own secondary tint for keywords and the fixed
 * data hues for the rest, so the file reads the same in every palette and
 * every hue keeps its contrast on the sunken plate. Plain identifiers and
 * punctuation stay in the foreground colour.
 */
const TOKEN_CLASS: Record<RustTokenKind, string> = {
  comment: 'text-subtle',
  string: 'text-data-5',
  number: 'text-data-3',
  keyword: 'text-secondary',
  type: 'text-data-2',
  function: 'text-data-1',
  macro: 'text-data-4',
  attribute: 'text-data-4',
  lifetime: 'text-data-6',
};

/** The number of lines `SourceCode` renders for `source`. */
export function countSourceLines(source: string): number {
  return source.split('\n').length;
}

/**
 * A Rust file as highlighted lines, rendered on the server: each line is
 * addressable as `#L<n>` (its number is a link a pointer can use to cite it)
 * and the numbers are hidden from assistive technology and from selection,
 * so reading or copying the code gets the code alone. The frame around it
 * (`SourceViewer`) owns scrolling, wrapping and copying.
 */
export function SourceCode({ source }: { source: string }) {
  const lines = highlightRust(source);
  return (
    <code className="block min-w-max py-3 group-data-[wrap=true]/code:min-w-0">
      {lines.map((tokens, index) => {
        const number = index + 1;
        return (
          <span
            key={number}
            id={`L${number}`}
            className="flex scroll-mt-24 target:bg-primary/10 hover:bg-surface/60"
          >
            <a
              href={`#L${number}`}
              aria-hidden="true"
              tabIndex={-1}
              // A mouse permalink only: on touch the 22px line pitch is too
              // tight to aim at (WCAG 2.5.8) and a scroll would catch them.
              className="sticky start-0 w-11 shrink-0 select-none bg-surface-sunken pe-3 text-end text-subtle no-underline hover:text-foreground pointer-coarse:pointer-events-none sm:w-14 sm:pe-4"
            >
              {number}
            </a>
            <span
              data-line-code=""
              className="min-w-0 whitespace-pre pe-6 text-foreground group-data-[wrap=true]/code:whitespace-pre-wrap"
            >
              {/* An empty line keeps its height from its number. */}
              {tokens.map((token, i) =>
                token.kind ? (
                  <span key={i} className={TOKEN_CLASS[token.kind]}>
                    {token.text}
                  </span>
                ) : (
                  token.text
                ),
              )}
            </span>
          </span>
        );
      })}
    </code>
  );
}
