import userEvent from '@testing-library/user-event';

import { reportError } from '@/utils/errors';

import { render, screen, checkA11y } from '@/test-utils';

import StatisticsError from '../error';

jest.mock('../../../../../utils/errors', () => ({ reportError: jest.fn() }));

describe('statistics route error boundary', () => {
  it('reports the error and offers a retry that calls reset', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    const error = Object.assign(new Error('boom'), { digest: 'digest-1' });

    render(<StatisticsError error={error} reset={reset} />);

    expect(reportError).toHaveBeenCalledWith(error, 'statistics-route');
    expect(screen.getByText('Statistics failed to load')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatisticsError error={new Error('boom')} reset={() => {}} />);
    await checkA11y(container);
  });
});
