import { render } from '@testing-library/react';

import { PHRASE_BREAK } from '@/lib/phrases';
import { PhrasedText } from '@/components/ui/phrased-text';

describe('PhrasedText', () => {
  it('glues each mark to its character and keeps the break points', () => {
    const source = `从开启到收官，读懂完整的${PHRASE_BREAK}演绎周期。`;
    const { container } = render(
      <h2>
        <PhrasedText>{source}</PhrasedText>
      </h2>,
    );
    const heading = container.querySelector('h2');
    expect(
      [...(heading?.querySelectorAll('.whitespace-nowrap') ?? [])].map((node) => node.textContent),
    ).toEqual(['官，', '期。']);
    // Inline glue only: no boxes, no <wbr>, and not a character added or lost.
    expect(heading?.querySelector('wbr')).toBeNull();
    expect(heading?.textContent).toBe(source);
  });

  it('renders text without Han characters as it is', () => {
    const { container } = render(
      <h2>
        <PhrasedText>Every gesture shapes the art.</PhrasedText>
      </h2>,
    );
    expect(container.querySelector('span')).toBeNull();
    expect(container.textContent).toBe('Every gesture shapes the art.');
  });
});
