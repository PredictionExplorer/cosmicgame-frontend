import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { InfoTooltip } from '@/components/ui/info-tooltip';

import { render, screen, checkA11y } from '@/test-utils';

function getTrigger() {
  return document.querySelector('[data-state]') as HTMLElement;
}

describe('InfoTooltip', () => {
  it('renders the info icon', () => {
    render(<InfoTooltip content="Help text" />);
    const trigger = getTrigger();
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector('svg')).toBeInTheDocument();
  });

  it('shows tooltip text on hover', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Detailed help" />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.hover(getTrigger());
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Detailed help');
  });

  it('applies className to the trigger wrapper', () => {
    render(<InfoTooltip content="Help" className="extra-class" />);
    const trigger = getTrigger();
    expect(trigger).toHaveClass('extra-class');
  });

  it('applies iconClassName to the icon', () => {
    render(<InfoTooltip content="Help" iconClassName="icon-custom" />);
    const svg = getTrigger().querySelector('svg');
    expect(svg).toHaveClass('icon-custom');
  });

  it('respects custom maxWidth via inline style', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Wide tooltip" maxWidth={400} />);

    await user.hover(getTrigger());
    const tooltip = await screen.findByRole('tooltip');
    const paragraph = tooltip.querySelector('p');
    expect(paragraph).toHaveStyle({ maxWidth: '400px' });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<InfoTooltip content="Accessible help" />);
    await checkA11y(container);
  });
});
