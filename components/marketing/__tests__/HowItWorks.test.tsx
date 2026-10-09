import { render, screen, checkA11y, within } from '@/test-utils';

import { HowItWorks } from '../HowItWorks';

describe('HowItWorks', () => {
  it('is the section the header jumps to', () => {
    const { container } = render(<HowItWorks />);
    const section = container.querySelector('section#how-it-works');
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute('aria-labelledby', 'how-it-works-heading');
    expect(
      screen.getByRole('heading', { level: 2, name: 'marketing.howItWorks.title' }),
    ).toHaveAttribute('id', 'how-it-works-heading');
    expect(screen.getByText('marketing.howItWorks.description')).toBeVisible();
  });

  it('lists three numbered steps with their detail in the text', () => {
    render(<HowItWorks />);
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    ['promote', 'verify', 'receive'].forEach((id, index) => {
      const step = steps[index] as HTMLElement;
      expect(
        within(step).getByRole('heading', {
          level: 3,
          name: `marketing.howItWorks.steps.${id}.title`,
        }),
      ).toBeVisible();
      expect(step).toHaveTextContent(`0${index + 1}`);
      // The detail runs on from the description, joined by a space in English.
      expect(step).toHaveTextContent(
        `marketing.howItWorks.steps.${id}.description marketing.howItWorks.steps.${id}.detail`,
      );
    });
  });

  it('carries no info buttons', () => {
    render(<HowItWorks />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HowItWorks />);
    await checkA11y(container);
  });
});
