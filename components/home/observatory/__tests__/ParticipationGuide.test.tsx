import { render, screen, within, checkA11y } from '@/test-utils';

import { ParticipationGuide } from '../ParticipationGuide';

describe('ParticipationGuide', () => {
  it('presents the participation sequence without an interaction', () => {
    render(<ParticipationGuide />);

    const guide = screen.getByRole('region', { name: 'home.orientation.title' });
    const steps = within(guide).getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    for (const [index, step] of ['enter', 'extend', 'finalize'].entries()) {
      expect(steps[index]).toHaveTextContent(`home.orientation.steps.${step}.title`);
      expect(steps[index]).toHaveTextContent(`home.orientation.steps.${step}.body`);
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ParticipationGuide />);
    await checkA11y(container);
  });
});
