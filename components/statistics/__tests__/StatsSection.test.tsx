import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { SectionShell } from '../SectionShell';
import { StatsSection } from '../StatsSection';

describe('SectionShell', () => {
  it('names the section by a plain H2 by default, with its sentence and actions', () => {
    render(
      <SectionShell
        title="Gesture spikes"
        description="One sentence."
        actions={<a href="#x">Act</a>}
      >
        <p>Chart body</p>
      </SectionShell>,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Gesture spikes' });
    expect(screen.getByRole('region', { name: 'Gesture spikes' })).toBeInTheDocument();
    expect(heading.querySelector('button')).toBeNull();
    expect(screen.getByText('One sentence.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Act' })).toBeInTheDocument();
    expect(screen.getByText('Chart body')).toBeVisible();
  });

  it('folds a collapsible section away from its H2 button', async () => {
    const user = userEvent.setup();
    render(
      <SectionShell
        title="Gesture spikes"
        description="One sentence."
        actions={<a href="#x">Act</a>}
        collapsible
      >
        <p>Chart body</p>
      </SectionShell>,
    );
    expect(screen.getByRole('region', { name: 'Gesture spikes' })).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Gesture spikes' });
    expect(toggle.closest('h2')).not.toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // One heading line is 29px on a phone: a band above and below makes it a 44px target.
    expect(toggle).toHaveAttribute('data-touch-target', 'extended');
    expect(toggle.className).toContain('after:-inset-y-2');
    expect(screen.getByText('One sentence.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Act' })).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Chart body')).not.toBeVisible();
    // The actions belong to the open section only.
    expect(screen.queryByRole('link', { name: 'Act' })).not.toBeInTheDocument();
  });

  it('renders an H3 inside a section and mounts a lazy body on first open', async () => {
    const user = userEvent.setup();
    render(
      <SectionShell title="Cycle activations" headingLevel={3} defaultOpen={false} lazy>
        <p>Heavy table</p>
      </SectionShell>,
    );
    const toggle = screen.getByRole('button', { name: 'Cycle activations' });
    expect(toggle.closest('h3')).not.toBeNull();
    expect(screen.queryByText('Heavy table')).not.toBeInTheDocument();
    await user.click(toggle);
    expect(screen.getByText('Heavy table')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <SectionShell title="Accessible" tooltip="What it shows.">
        <p>Body</p>
      </SectionShell>,
    );
    await checkA11y(container);
  });
});

describe('StatsSection', () => {
  it('renders children when no query state is active', () => {
    render(
      <StatsSection title="Ready section">
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText('Table content')).toBeInTheDocument();
  });

  it('shows skeleton rows and marks the section busy while loading', () => {
    render(
      <StatsSection title="Loading section" isLoading>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByRole('region', { name: 'Loading section' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByText('Table content')).not.toBeInTheDocument();
  });

  it('renders a custom skeleton when provided', () => {
    render(
      <StatsSection title="Loading section" isLoading skeleton={<div data-testid="custom" />}>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('renders an error state whose retry calls back', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(
      <StatsSection title="Unique participants" isError onRetry={onRetry}>
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/unique participants/i);
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the empty state with its title and description', () => {
    render(
      <StatsSection
        title="Recipients"
        isEmpty
        emptyTitle="No recipients yet"
        emptyDescription="They appear after the first allocation."
      >
        <p>Table content</p>
      </StatsSection>,
    );
    expect(screen.getByText('No recipients yet')).toBeInTheDocument();
    expect(screen.getByText('They appear after the first allocation.')).toBeInTheDocument();
    expect(screen.queryByText('Table content')).not.toBeInTheDocument();
  });
});
