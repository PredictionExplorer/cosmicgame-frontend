import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { CollapsibleSection } from '../CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders the title', () => {
    render(
      <CollapsibleSection title="Section Title">
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });

  it('shows content when defaultOpen is true', () => {
    render(
      <CollapsibleSection title="Open Section" defaultOpen>
        <p>Visible content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('hides content when defaultOpen is false', () => {
    render(
      <CollapsibleSection title="Closed Section" defaultOpen={false}>
        <p>Hidden content</p>
      </CollapsibleSection>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('defaults to open when defaultOpen is not specified', () => {
    render(
      <CollapsibleSection title="Default Section">
        <p>Content</p>
      </CollapsibleSection>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles content visibility on click', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Toggle Section" defaultOpen>
        <p>Toggle content</p>
      </CollapsibleSection>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands collapsed section on click', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Expand Me" defaultOpen={false}>
        <p>Revealed content</p>
      </CollapsibleSection>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Revealed content')).toBeVisible();
  });

  it('renders title as an h4 heading', () => {
    render(
      <CollapsibleSection title="Heading">
        <p>Content</p>
      </CollapsibleSection>,
    );
    const heading = screen.getByText('Heading');
    expect(heading.tagName).toBe('H4');
  });

  it('renders an optional description below the title', () => {
    render(
      <CollapsibleSection title="CST Total Supply" description="Historical CST supply changes.">
        <p>Content</p>
      </CollapsibleSection>,
    );

    expect(screen.getByText('Historical CST supply changes.')).toBeInTheDocument();
  });

  it('opens an optional header tooltip without toggling the section', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Cycle Activations" tooltip="System event windows." defaultOpen>
        <p>Content</p>
      </CollapsibleSection>,
    );

    const toggle = screen.getByRole('button', { name: /Cycle Activations/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.hover(screen.getByRole('button', { name: 'Show more information' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('System event windows.');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggle button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Keyboard Test" defaultOpen>
        <p>Content</p>
      </CollapsibleSection>,
    );
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CollapsibleSection title="Styled" className="custom-class">
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders a chevron icon', () => {
    const { container } = render(
      <CollapsibleSection title="With Icon">
        <p>Content</p>
      </CollapsibleSection>,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <CollapsibleSection
        title="With Section Icon"
        icon={<span data-testid="section-icon">IC</span>}
      >
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
  });

  it('does not render icon wrapper when no icon provided', () => {
    const { container } = render(
      <CollapsibleSection title="No Icon">
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(container.querySelector('.bg-primary\\/10')).not.toBeInTheDocument();
  });

  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <CollapsibleSection title="A11y Open" defaultOpen>
        <p>Content</p>
      </CollapsibleSection>,
    );
    await checkA11y(container);
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(
      <CollapsibleSection title="A11y Closed" defaultOpen={false}>
        <p>Content</p>
      </CollapsibleSection>,
    );
    await checkA11y(container);
  });
});
