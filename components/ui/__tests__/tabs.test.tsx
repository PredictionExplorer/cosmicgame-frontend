import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { ScrollRail } from '@/components/ui/scroll-rail';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  SEGMENT_SELECTED_CLASS,
  tabsListVariants,
  tabsTriggerVariants,
} from '@/components/ui/tabs';

import { act, checkA11y, render, screen } from '@/test-utils';

function renderTabs(props: Partial<React.ComponentProps<typeof TabsList>> = {}) {
  return render(
    <Tabs defaultValue="gestures">
      <TabsList aria-label="Cycle records" {...props}>
        <TabsTrigger value="gestures">Gestures</TabsTrigger>
        <TabsTrigger value="endurance">Endurance Champions</TabsTrigger>
        <TabsTrigger value="stellar">Stellar Selection</TabsTrigger>
      </TabsList>
      <TabsContent value="gestures">Gesture list</TabsContent>
      <TabsContent value="endurance">Endurance list</TabsContent>
      <TabsContent value="stellar">Selection list</TabsContent>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('lets a caller reshape the segmented list into a bottom rule without boxing it', () => {
    // /user's anchoring tabs: a full default border would survive the
    // caller's `border-b` and draw a square box around the row.
    renderTabs({ className: 'rounded-none border-b border-border bg-transparent p-0' });
    const list = screen.getByRole('tablist', { name: 'Cycle records' });
    expect(list).toHaveClass('border-b');
    expect(list).not.toHaveClass('border');
  });

  it.each(['segmented', 'underline', 'pills'] as const)(
    'marks the selected %s tab with its own indicator',
    (variant) => {
      renderTabs({ variant });
      const selected = screen.getByRole('tab', { name: 'Gestures' });
      expect(selected).toHaveAttribute('data-state', 'active');
      expect(selected.className).toMatch(/data-\[state=active\]:/);
    },
  );

  it('keeps arrow-key navigation and one tab stop', async () => {
    const user = userEvent.setup();
    renderTabs({ variant: 'underline' });
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Gestures' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    const endurance = screen.getByRole('tab', { name: 'Endurance Champions' });
    expect(endurance).toHaveFocus();
    expect(endurance).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Endurance list')).toBeVisible();
  });

  it('puts a scrolling list on one row that never wraps', () => {
    renderTabs({ variant: 'underline', scroll: true });
    const list = screen.getByRole('tablist', { name: 'Cycle records' });
    expect(list).toHaveClass('flex-nowrap', 'w-max');
    expect(screen.getByRole('tab', { name: 'Endurance Champions' })).toHaveClass(
      'whitespace-nowrap',
      'shrink-0',
    );
  });

  it('shares the trigger look with link-based sub-navigation', () => {
    expect(tabsTriggerVariants({ variant: 'underline' })).toMatch(/aria-\[current=page\]:/);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTabs({ scroll: true });
    await checkA11y(container);
  });
});

describe('ScrollRail', () => {
  it('scrolls the current item into view without moving the page', () => {
    const scrollTo = jest.fn();
    const original = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo;
    jest.useFakeTimers();
    try {
      render(
        <ScrollRail data-testid="rail">
          <a href="#a">A</a>
          <a href="#b" aria-current="page">
            B
          </a>
        </ScrollRail>,
      );
      const rail = screen.getByTestId('rail');
      const track = rail.firstElementChild as HTMLElement;
      track.getBoundingClientRect = () => ({ left: 0, right: 100 }) as DOMRect;
      const current = screen.getByRole('link', { name: 'B' });
      current.getBoundingClientRect = () => ({ left: 180, right: 240 }) as DOMRect;
      act(() => {
        jest.runOnlyPendingTimers();
      });
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'instant', left: expect.any(Number) }),
      );
      const [{ left }] = scrollTo.mock.calls[0] as [{ left: number }];
      // B comes to rest whole, one rest inset from the start: the gap to A,
      // no wider than the fade (40px).
      expect(left).toBe(180 - 40);
    } finally {
      jest.useRealTimers();
      HTMLElement.prototype.scrollTo = original;
    }
  });
});

describe('one selected look and one underline row', () => {
  it('applies the exported segment selection exactly as the segmented variant does', () => {
    const segmented = tabsTriggerVariants({ variant: 'segmented' });
    for (const token of SEGMENT_SELECTED_CLASS.split(' ')) {
      expect(segmented).toContain(`data-[state=active]:${token}`);
      expect(segmented).toContain(`aria-[current=page]:${token}`);
    }
    // A segment never draws the --primary rule an underline row uses.
    expect(SEGMENT_SELECTED_CLASS).not.toMatch(/primary/);
  });

  it('sets underline tabs flush on the content edge, 1.5rem apart', () => {
    expect(tabsListVariants({ variant: 'underline' })).toContain('gap-x-6');
    expect(tabsTriggerVariants({ variant: 'underline' })).toContain('px-0');
  });
});
