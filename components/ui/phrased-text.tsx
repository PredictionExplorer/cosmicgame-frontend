import { phraseTokens } from '@/lib/phrases';

/**
 * Display text that never parts a punctuation mark from its character
 * (lib/phrases.ts): a Chinese heading keeps 。 and ， on the line of the
 * character before them and 「 on the line of the one after, even where a
 * clause overflows its line. The authored break points in the copy stay in
 * the text as zero-width spaces. The glue is inline, so the heading's text
 * and accessible name are the plain sentence. Text without Han characters
 * renders as it is. Server-safe.
 *
 *   <h2 className="type-display-md"><PhrasedText>{copy.heading}</PhrasedText></h2>
 */
export function PhrasedText({ children }: { children: string }) {
  const tokens = phraseTokens(children);
  if (!tokens) return children;
  // The tokens of one string never reorder, so the index is a stable key.
  return tokens.map((token, index) =>
    token.type === 'keep' ? (
      <span key={index} className="whitespace-nowrap">
        {token.text}
      </span>
    ) : (
      token.text
    ),
  );
}
