import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { act, render, screen, checkA11y } from '@/test-utils';

import { MethodSelector, type MethodOption } from '../MethodSelector';

const OPTIONS: MethodOption[] = [
  { value: 'ETH', label: 'ETH', price: '0.10211 ETH' },
  {
    value: 'RandomWalk',
    label: 'ETH + RWLK',
    price: '0.051055 ETH',
    note: '50% discount',
    trackNote: 'ETH + RWLK gives a 50% discount',
  },
  { value: 'CST', label: 'CST', price: '250.52 CST' },
];

function renderSelector(value = 'ETH', onChange = jest.fn()) {
  render(
    <>
      <p id="method-label">Gesture method</p>
      <MethodSelector
        options={OPTIONS}
        value={value}
        onChange={onChange}
        labelledBy="method-label"
      />
    </>,
  );
  return onChange;
}

function StatefulSelector({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('ETH');
  return (
    <>
      <p id="method-label">Gesture method</p>
      <MethodSelector
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        labelledBy="method-label"
      />
    </>
  );
}

describe('MethodSelector', () => {
  it('shows every method with its live price inside the segment', () => {
    renderSelector();

    const group = screen.getByRole('radiogroup', { name: 'Gesture method' });
    const radios = screen.getAllByRole('radio');
    expect(group).toContainElement(radios[0]!);
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveTextContent('ETH0.10211 ETH');
    expect(radios[1]).toHaveTextContent('ETH + RWLK0.051055 ETH50% discount');
    expect(radios[2]).toHaveTextContent('CST250.52 CST');
  });

  it('marks the chosen row along its start edge when stacked, its foot when side by side', () => {
    renderSelector('RandomWalk');

    const [eth, rwlk] = screen.getAllByRole('radio');
    // Stacked rows (a narrow column): a start-edge rule and a ring, never a
    // bottom rule that reads as a row divider.
    expect(rwlk).toHaveClass('shadow-[inset_2px_0_0_hsl(var(--primary))]', 'ring-1');
    // Side by side: the segmented control's foot rule, no ring.
    expect(rwlk).toHaveClass(
      '@min-[21rem]/method:shadow-[inset_0_-2px_0_hsl(var(--primary))]',
      '@min-[21rem]/method:ring-0',
    );
    expect(eth).not.toHaveClass('ring-1');
  });

  it('lines the prices up across the segments whatever a label wraps to', () => {
    renderSelector();

    // Each segment shares the group's label and price rows.
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveClass(
        '@min-[21rem]/method:row-span-2',
        '@min-[21rem]/method:grid-rows-subgrid',
      );
    });
  });

  it('reads a note once under the track when the segments sit side by side', () => {
    renderSelector('RandomWalk');

    // No note row inside the segments, so the chosen one is not a tall,
    // mostly empty box; its own note stays in its name for screen readers.
    const rwlk = screen.getByRole('radio', { name: /ETH \+ RWLK/ });
    // Stacked, the note runs the row's full width under label and price.
    expect(screen.getByText('50% discount', { selector: 'button span' })).toHaveClass(
      'col-span-2',
      '@min-[21rem]/method:sr-only',
    );
    expect(rwlk).toHaveTextContent('50% discount');
    const notes = screen.getByTestId('gesture-method-notes');
    expect(notes).toHaveAttribute('aria-hidden', 'true');
    expect(notes).toHaveClass('hidden', '@min-[21rem]/method:block');
    // Under the whole track it starts under the first segment, so it names
    // its method rather than read as a note on that one.
    expect(notes).toHaveTextContent(/^ETH \+ RWLK gives a 50% discount$/);
    // The chosen method's note reads a step stronger.
    expect(notes.firstElementChild).toHaveClass('text-muted-foreground');
  });

  it('falls back to the segment note under the track', () => {
    render(
      <MethodSelector
        options={OPTIONS.map((option) => ({ ...option, trackNote: undefined }))}
        value="ETH"
        onChange={jest.fn()}
        labelledBy="method-label"
      />,
    );
    expect(screen.getByTestId('gesture-method-notes')).toHaveTextContent(/^50% discount$/);
  });

  it('sizes the side-by-side segments to their content, so a label keeps one line', () => {
    renderSelector();

    // Content-sized columns share out the rest of the track; equal fractions
    // would wrap "ETH + Random Walk" in a 450px console.
    expect(screen.getByRole('radiogroup')).toHaveClass(
      '@min-[21rem]/method:grid-cols-[repeat(3,auto)]',
    );
  });

  it('shows no note line when no method has one', () => {
    render(
      <MethodSelector
        options={OPTIONS.filter((option) => !option.note)}
        value="ETH"
        onChange={jest.fn()}
        labelledBy="method-label"
      />,
    );
    expect(screen.queryByTestId('gesture-method-notes')).not.toBeInTheDocument();
  });

  it('marks only the selected method as checked, with one tab stop', () => {
    renderSelector('CST');

    const [eth, rwlk, cst] = screen.getAllByRole('radio');
    expect(cst).toHaveAttribute('aria-checked', 'true');
    expect(eth).toHaveAttribute('aria-checked', 'false');
    expect(rwlk).toHaveAttribute('aria-checked', 'false');
    expect(cst).toHaveAttribute('tabindex', '0');
    expect(eth).toHaveAttribute('tabindex', '-1');
  });

  it('selects on click', async () => {
    const onChange = renderSelector();

    await userEvent.click(screen.getByRole('radio', { name: /CST/ }));
    expect(onChange).toHaveBeenCalledWith('CST');
  });

  it('moves the selection with the arrow keys, wrapping at the ends', async () => {
    const onChange = jest.fn();
    render(<StatefulSelector onChange={onChange} />);
    screen.getAllByRole('radio')[0]!.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('RandomWalk');
    expect(screen.getByRole('radio', { name: /RWLK/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('CST');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('ETH');
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('CST');
  });

  describe('side by side or stacked', () => {
    let restore: () => void = () => {};
    afterEach(() => restore());

    /**
     * jsdom lays nothing out: a container `width` px wide in which each price
     * needs `priceWidth` px and gets `segmentWidth` px, plus a
     * ResizeObserver the test can fire.
     */
    function layout(width: number, priceWidth: number, segmentWidth: number) {
      const isPrice = (element: HTMLElement) => element.dataset.slot === 'method-price';
      const resize: Array<() => void> = [];
      const originalObserver = window.ResizeObserver;
      window.ResizeObserver = class {
        constructor(callback: () => void) {
          resize.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
      const size = { width, priceWidth, segmentWidth };
      const spies = [
        jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
          this: HTMLElement,
        ) {
          return isPrice(this) ? size.segmentWidth : size.width;
        }),
        jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
          this: HTMLElement,
        ) {
          return isPrice(this) ? size.priceWidth : size.width;
        }),
      ];
      restore = () => {
        window.ResizeObserver = originalObserver;
        spies.forEach((spy) => spy.mockRestore());
      };
      return {
        resizeTo(next: Partial<typeof size>) {
          Object.assign(size, next);
          act(() => resize.forEach((callback) => callback()));
        },
      };
    }

    const container = () => screen.getByRole('radiogroup').parentElement!;

    it('sets the methods side by side while every price fits its segment', () => {
      layout(453, 112, 140);
      renderSelector();
      // The named query container lays them out from 21rem.
      expect(container()).toHaveClass('@container/method');
      expect(container()).not.toHaveAttribute('data-layout');
    });

    it('stacks them when a price is wider than its segment, instead of running into the next', () => {
      // Regression: at 350px testnet prices ("0.0000087087 ETH") collided.
      layout(350, 140, 90);
      renderSelector();
      expect(container()).not.toHaveClass('@container/method');
      expect(container()).toHaveAttribute('data-layout', 'stacked');
    });

    it('stays stacked at that width, and tries the row again once the container grows', () => {
      const view = layout(350, 140, 90);
      renderSelector();
      expect(container()).toHaveAttribute('data-layout', 'stacked');

      view.resizeTo({ width: 340 });
      expect(container()).toHaveAttribute('data-layout', 'stacked');

      view.resizeTo({ width: 453, segmentWidth: 164 });
      expect(container()).toHaveClass('@container/method');
      expect(container()).not.toHaveAttribute('data-layout');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <p id="method-label">Gesture method</p>
        <MethodSelector
          options={OPTIONS}
          value="ETH"
          onChange={jest.fn()}
          labelledBy="method-label"
        />
      </>,
    );
    await checkA11y(container);
  });
});
