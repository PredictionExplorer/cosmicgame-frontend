import { render, screen } from '@/test-utils';

import { TitleWithCount } from '../components/TitleWithCount';

function renderHeading(title: string, count: number | null, locale: string) {
  render(
    <h2>
      <TitleWithCount title={title} count={count} locale={locale} />
    </h2>,
  );
  return screen.getByRole('heading', { level: 2 });
}

// The title also names its section and the Participants tablist
// (aria-labelledby). Chrome builds those names from the text alone, the
// count's margin adds nothing, so the text itself must carry the space
// (jsdom's name computation pads inline elements and cannot show this).
describe('TitleWithCount', () => {
  it('joins the count with a word space: "Gesture history 1,144", not "Gesture history1,144"', () => {
    expect(renderHeading('Gesture history', 1144, 'en').textContent).toBe('Gesture history 1,144');
  });

  it('adds no space where the language writes none', () => {
    expect(renderHeading('本周期参与者', 13, 'zh').textContent).toBe('本周期参与者13');
  });

  it('shows no count while it is unknown', () => {
    expect(renderHeading('Gesture history', null, 'en').textContent).toBe('Gesture history');
    expect(screen.queryByTestId('section-count')).not.toBeInTheDocument();
  });
});
