import '@testing-library/jest-dom';

import type { MouseEvent, ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { render, screen, fireEvent, waitFor } from '@/test-utils';

function renderTooltip(trigger: ReactNode, content = 'Helpful tooltip') {
  return render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

function renderTooltipInsideClippingAncestor(content = 'Helpful tooltip') {
  // Mirrors `StatCard`'s constraints: an ancestor that simultaneously clips its
  // children with `overflow: hidden` and creates an isolating stacking context
  // via `transform`/`backdrop-filter`. Without a portal, the tooltip popper
  // would be visually clipped and its z-index would be confined to this
  // ancestor.
  return render(
    <div
      data-testid="clipping-ancestor"
      style={{
        overflow: 'hidden',
        transform: 'translateY(0)',
        backdropFilter: 'blur(4px)',
        position: 'relative',
        width: 200,
        height: 50,
      }}
    >
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>{content}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>,
  );
}

function touchPointerDown(element: Element) {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: 'touch' });

  fireEvent(element, event);
}

describe('Tooltip', () => {
  it('renders default-open tooltip content', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>Default content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Default content');
  });

  it('opens a non-focusable trigger on the first touch tap', async () => {
    renderTooltip(<span>Round badge</span>, 'Imprinted in cycle 7');

    const trigger = screen.getByText('Round badge');
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Imprinted in cycle 7');
  });

  it('preserves caller pointer handlers while opening on touch', async () => {
    const handlePointerDown = jest.fn();

    renderTooltip(<span onPointerDown={handlePointerDown}>Round badge</span>);

    const trigger = screen.getByText('Round badge');
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(handlePointerDown).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Helpful tooltip');
  });

  it('suppresses the first touch click so links can show the tooltip before navigating', async () => {
    const handleClick = jest.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    renderTooltip(
      <a href="/wallet/0x123" onClick={handleClick}>
        0x123...
      </a>,
      '0x1234567890',
    );

    const trigger = screen.getByRole('link', { name: '0x123...' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(handleClick).not.toHaveBeenCalled();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('0x1234567890');

    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not suppress normal mouse clicks on link triggers', () => {
    const handleClick = jest.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    renderTooltip(
      <a href="/wallet/0x123" onClick={handleClick}>
        0x123...
      </a>,
    );

    fireEvent.pointerDown(screen.getByRole('link', { name: '0x123...' }), { pointerType: 'mouse' });
    fireEvent.click(screen.getByRole('link', { name: '0x123...' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not suppress touch clicks when the tooltip is already open', () => {
    const handleClick = jest.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <a href="/wallet/0x123" onClick={handleClick}>
              0x123...
            </a>
          </TooltipTrigger>
          <TooltipContent>0x1234567890</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('link', { name: '0x123...' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('delegates touch open requests to controlled tooltip roots', () => {
    const handleOpenChange = jest.fn();

    render(
      <TooltipProvider>
        <Tooltip open={false} onOpenChange={handleOpenChange}>
          <TooltipTrigger>Controlled help</TooltipTrigger>
          <TooltipContent>Controlled content</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Controlled help' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('InfoTooltip', () => {
  it('names the button by the label it explains and describes it with the full text', () => {
    render(<InfoTooltip content="Extra context" label="Total Cycles" />);

    const trigger = screen.getByRole('button', { name: 'More information about Total Cycles' });
    expect(trigger).toHaveAccessibleDescription('Extra context');
  });

  it('never truncates the explanation into the accessible name', () => {
    const longContent =
      'This explanation is intentionally extremely long so that a derived accessible name would need truncation to stay readable.';
    render(<InfoTooltip content={longContent} />);

    const trigger = screen.getByRole('button', { name: 'More information' });
    // aria-describedby, not the ARIA 1.3 aria-description some browsers and
    // screen readers do not expose: the text is always announced.
    expect(trigger).toHaveAccessibleDescription(longContent);
    expect(trigger).not.toHaveAttribute('aria-description');
  });

  it('allows callers to customize the trigger label', () => {
    render(<InfoTooltip content="Extra context" ariaLabel="Explain cycle timing" />);

    expect(screen.getByRole('button', { name: 'Explain cycle timing' })).toBeInTheDocument();
  });

  it('is a 24px button at every width, with a 44px hit area on coarse pointers', () => {
    render(<InfoTooltip content="Extra context" label="Total Cycles" className="ml-1.5" />);

    const trigger = screen.getByRole('button', { name: 'More information about Total Cycles' });
    // The button's own box is 24px, which is what automated audits measure;
    // the 16px icon beside it keeps the row's layout and the caller's margin.
    expect(trigger).toHaveClass('size-6', 'pointer-coarse:after:size-11');
    expect(trigger.className).not.toMatch(/sm:after:hidden/);
    const wrapper = trigger.closest('[data-slot="info-tooltip"]');
    expect(wrapper).toHaveClass('text-subtle', 'ml-1.5');
    expect(wrapper?.querySelector('svg')).toHaveClass('size-4');
  });

  it('opens from the accessible button on touch', async () => {
    render(<InfoTooltip content="Mobile users can read this help text." label="Help" />);

    const trigger = screen.getByRole('button', { name: 'More information about Help' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Mobile users can read this help text.',
    );
  });

  it('opens on hover, stays open while pointed at, and closes after the pointer leaves', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Hover explanation" label="Hovered" />);

    const trigger = screen.getByRole('button', { name: 'More information about Hovered' });
    await user.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Hover explanation');

    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('toggles on a second press and closes on Escape without moving focus', async () => {
    const user = userEvent.setup();
    render(<InfoTooltip content="Pinned explanation" label="Pinned" />);

    const trigger = screen.getByRole('button', { name: 'More information about Pinned' });
    await user.click(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Pinned explanation');
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());

    await user.click(trigger);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('caps the card at the requested width for a readable line length', async () => {
    render(
      <InfoTooltip content="This is long-form tooltip content with a readable line length." />,
    );

    const trigger = screen.getByRole('button', { name: 'More information' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.style.maxWidth).toContain('280px');
  });

  it('renders open content even when the trigger sits in an overflow:hidden ancestor', async () => {
    const { container } = render(
      <div style={{ overflow: 'hidden', width: 80, height: 20 }}>
        <InfoTooltip content="Escapes clipped ancestor" />
      </div>,
    );

    const trigger = screen.getByRole('button', { name: 'More information' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Escapes clipped ancestor');
    expect(container.contains(tooltip)).toBe(false);
  });
});

describe('TooltipContent portal placement', () => {
  it('renders content as a descendant of document.body, not the trigger subtree', async () => {
    const { container } = renderTooltipInsideClippingAncestor('Portaled content');

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Portaled content');

    // The tooltip popper must not be rendered inside the clipping ancestor;
    // the whole point of the portal is to lift it out of any clipped subtree.
    const clippingAncestor = screen.getByTestId('clipping-ancestor');
    expect(clippingAncestor.contains(tooltip)).toBe(false);

    // It also must not live inside the React render container — Testing
    // Library's render wraps the tree in a div appended to document.body, and
    // the tooltip should sit alongside (rather than within) that wrapper.
    expect(container.contains(tooltip)).toBe(false);

    // It must, however, still be inside the document so screen readers and
    // pointer-events can reach it.
    expect(document.body.contains(tooltip)).toBe(true);
  });

  it('is queryable by accessible role even when escaping a stacking-context ancestor', async () => {
    renderTooltipInsideClippingAncestor('Reachable from the document');

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Reachable from the document');
  });

  it('renders a popper element with the high-z popover styling next to the role=tooltip node', async () => {
    renderTooltipInsideClippingAncestor();

    const tooltip = await screen.findByRole('tooltip');
    // Radix attaches the styling we pass on `TooltipContent` to either the
    // role="tooltip" node itself or its immediate popper wrapper, depending on
    // version. Either way the `z-50` styling we hand-set must be reachable
    // from the tooltip — that's how it stays above page chrome — so we check
    // the element and its closest ancestors rather than asserting on a single
    // exact node.
    const styledNode = tooltip.classList.contains('z-50') ? tooltip : tooltip.closest('.z-50');
    expect(styledNode).not.toBeNull();
  });

  it('opens multiple independent tooltips without interference', async () => {
    render(
      <div>
        <InfoTooltip content="Tooltip A" ariaLabel="Open A" />
        <InfoTooltip content="Tooltip B" ariaLabel="Open B" />
      </div>,
    );

    const triggerA = screen.getByRole('button', { name: 'Open A' });
    touchPointerDown(triggerA);
    fireEvent.click(triggerA);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip A');
  });
});
