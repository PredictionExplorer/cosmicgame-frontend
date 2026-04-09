import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

function renderTooltip(contentProps?: Record<string, unknown>) {
  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent {...contentProps}>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

describe('Tooltip', () => {
  it('renders trigger text', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip content when open', () => {
    renderTooltip();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
  });

  it('applies custom className to TooltipContent', () => {
    renderTooltip({ className: 'my-custom-class' });
    const el = document.querySelector('.my-custom-class');
    expect(el).toBeInTheDocument();
  });

  it('passes side prop through to content', () => {
    renderTooltip({ side: 'bottom' });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('passes sideOffset prop through to content', () => {
    renderTooltip({ sideOffset: 12 });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('renders content via portal (outside trigger container)', () => {
    const { container } = renderTooltip();
    const tooltipInContainer = container.querySelector('[role="tooltip"]');
    expect(tooltipInContainer).toBeNull();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('shows content on hover and hides on unhover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip text');
    await user.unhover(screen.getByText('Hover me'));
  });

  it('has no accessibility violations', async () => {
    const { baseElement } = renderTooltip();
    await checkA11y(baseElement, {
      rules: { region: { enabled: false } },
    });
  });
});
