import '@testing-library/jest-dom';

import type { MouseEvent, ReactNode } from 'react';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { render, screen, fireEvent } from '@/test-utils';

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
  it('uses an accessible button trigger by default', () => {
    render(<InfoTooltip content="Extra context" />);

    expect(screen.getByRole('button', { name: 'Show more information' })).toBeInTheDocument();
  });

  it('allows callers to customize the trigger label', () => {
    render(<InfoTooltip content="Extra context" ariaLabel="Explain cycle timing" />);

    expect(screen.getByRole('button', { name: 'Explain cycle timing' })).toBeInTheDocument();
  });

  it('opens from the accessible button on touch', async () => {
    render(<InfoTooltip content="Mobile users can read this help text." />);

    const trigger = screen.getByRole('button', { name: 'Show more information' });
    touchPointerDown(trigger);
    fireEvent.click(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Mobile users can read this help text.',
    );
  });
});
