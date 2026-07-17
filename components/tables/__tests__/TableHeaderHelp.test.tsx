import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { TableHeaderHelp } from '../TableHeaderHelp';

describe('TableHeaderHelp', () => {
  it('renders desktop and mobile header labels', () => {
    render(<TableHeaderHelp desktop="Total Imprinted Tokens" mobile="Imprinted" tooltip="Help" />);

    expect(screen.getByText('Total Imprinted Tokens')).toBeInTheDocument();
    expect(screen.getByText('Imprinted')).toBeInTheDocument();
  });

  it('opens the header tooltip', async () => {
    const user = userEvent.setup();
    render(<TableHeaderHelp desktop="Round" tooltip="Cycle or deployment context." />);

    await user.hover(
      screen.getByRole('button', {
        name: /^tables\.tableHeaderHelp\.explainColumn/,
      }),
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Cycle or deployment context.');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TableHeaderHelp desktop="Balance (CST)" tooltip="Current CST ERC-20 balance." />,
    );
    await checkA11y(container);
  });
});
