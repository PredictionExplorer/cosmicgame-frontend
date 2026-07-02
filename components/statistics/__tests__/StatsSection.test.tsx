import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { StatsSection } from '../StatsSection';

describe('StatsSection', () => {
  it('renders children when no async state is active', () => {
    render(
      <StatsSection title="Ready Section">
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText('Table content')).toBeInTheDocument();
  });

  it('renders the default skeleton while loading', () => {
    render(
      <StatsSection title="Loading Section" isLoading>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByTestId('stats-section-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Table content')).not.toBeInTheDocument();
  });

  it('renders a custom skeleton when provided', () => {
    render(
      <StatsSection
        title="Loading Section"
        isLoading
        skeleton={<div data-testid="custom-skeleton" />}
      >
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
  });

  it('renders an error state with a working retry button', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(
      <StatsSection title="Broken Section" isError onRetry={onRetry}>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText(/failed to load broken section/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders an empty state when isEmpty', () => {
    render(
      <StatsSection
        title="Empty Section"
        isEmpty
        emptyTitle="Nothing here yet"
        emptyDescription="Data appears after the first event."
      >
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByText('Data appears after the first event.')).toBeInTheDocument();
    expect(screen.queryByText('Table content')).not.toBeInTheDocument();
  });

  it('prioritizes loading over error and empty', () => {
    render(
      <StatsSection title="Priority Section" isLoading isError isEmpty>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByTestId('stats-section-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
  });

  it('prioritizes error over empty', () => {
    render(
      <StatsSection title="Errored Section" isError isEmpty>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText(/failed to load errored section/i)).toBeInTheDocument();
    expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
  });

  it('defers content mounting when lazy and closed', () => {
    render(
      <StatsSection title="Lazy Section" defaultOpen={false} lazy>
        <p data-testid="deferred">Deferred content</p>
      </StatsSection>,
    );
    expect(screen.queryByTestId('deferred')).not.toBeInTheDocument();
  });

  it('renders the section tooltip trigger', () => {
    render(
      <StatsSection title="Documented Section" tooltip="Explains the section.">
        <p>Table content</p>
      </StatsSection>,
    );
    expect(
      screen.getByRole('button', { name: 'More information about Documented Section' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations across states', async () => {
    const { container, rerender } = render(
      <StatsSection title="A11y Section">
        <p>Content</p>
      </StatsSection>,
    );
    await checkA11y(container);

    rerender(
      <StatsSection title="A11y Section" isError onRetry={() => {}}>
        <p>Content</p>
      </StatsSection>,
    );
    await checkA11y(container);

    rerender(
      <StatsSection title="A11y Section" isEmpty>
        <p>Content</p>
      </StatsSection>,
    );
    await checkA11y(container);
  });
});
