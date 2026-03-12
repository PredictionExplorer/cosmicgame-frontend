import { render, screen, checkA11y } from '@/test-utils';

import { StatisticsItem, CountdownRenderer } from '../StatisticsItem';

jest.mock('../../ui/info-tooltip', () => ({
  InfoTooltip: ({ content }: { content: string }) => (
    <span data-testid="info-tooltip">{content}</span>
  ),
}));

describe('StatisticsItem', () => {
  it('renders title and value', () => {
    render(<StatisticsItem title="My Title" value="My Value" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Value')).toBeInTheDocument();
  });

  it('renders ReactNode values', () => {
    render(<StatisticsItem title="Link" value={<a href="/test">Click</a>} />);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('renders numeric values', () => {
    render(<StatisticsItem title="Count" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders tooltip when provided', () => {
    render(<StatisticsItem title="Balance" value="1.5 ETH" tooltip="Total ETH in contract" />);
    expect(screen.getByTestId('info-tooltip')).toBeInTheDocument();
    expect(screen.getByText('Total ETH in contract')).toBeInTheDocument();
  });

  it('does not render tooltip when not provided', () => {
    render(<StatisticsItem title="Count" value={42} />);
    expect(screen.queryByTestId('info-tooltip')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatisticsItem title="Test" value="val" />);
    await checkA11y(container);
  });

  it('has no accessibility violations with tooltip', async () => {
    const { container } = render(
      <StatisticsItem title="Test" value="val" tooltip="Helpful info" />,
    );
    await checkA11y(container);
  });
});

describe('CountdownRenderer', () => {
  it('renders days, hours, minutes, seconds with "left"', () => {
    render(<CountdownRenderer days={1} hours={2} minutes={3} seconds={4} />);
    expect(screen.getByText('1d 2h 3m 4s left')).toBeInTheDocument();
  });

  it('returns null when all values are zero', () => {
    const { container } = render(<CountdownRenderer days={0} hours={0} minutes={0} seconds={0} />);
    expect(container.textContent).toBe('');
  });

  it('omits days when zero', () => {
    render(<CountdownRenderer days={0} hours={5} minutes={0} seconds={30} />);
    expect(screen.getByText('5h 0m 30s left')).toBeInTheDocument();
  });

  it('shows only seconds when others are zero', () => {
    render(<CountdownRenderer days={0} hours={0} minutes={0} seconds={10} />);
    expect(screen.getByText('10s left')).toBeInTheDocument();
  });
});
