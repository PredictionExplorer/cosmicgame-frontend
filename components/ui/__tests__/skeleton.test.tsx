import '@testing-library/jest-dom';
import {
  Skeleton,
  SkeletonFigures,
  SkeletonNFTCard,
  SkeletonTable,
  SkeletonText,
} from '@/components/ui/skeleton';

import { render, screen, checkA11y } from '@/test-utils';

describe('Skeleton', () => {
  it('renders with shimmer by default', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('overflow-hidden');
    expect(el.className).toMatch(/before:animate-shimmer/);
  });

  it('moves one way only: the shimmer, never a pulse on top of it', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).not.toHaveClass('animate-pulse');
    expect(el).toHaveAttribute('data-slot', 'skeleton');
  });

  it('omits the shimmer when shine={false}', () => {
    render(<Skeleton shine={false} data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('data-slot', 'skeleton');
    expect(el.className).not.toMatch(/before:animate-shimmer/);
  });

  it('applies custom className', () => {
    render(<Skeleton className="h-12 w-12" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('h-12', 'w-12');
  });

  it('is aria-hidden so multiple skeletons do not spam SR users', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden');
  });

  it('renders as a span where only phrasing content is allowed (inside a button)', () => {
    render(
      <button type="button">
        Gestures
        <Skeleton as="span" data-testid="skeleton" className="inline-block h-4 w-6" />
      </button>,
    );
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('SPAN');
    expect(skeleton).toHaveClass('inline-block');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton className="h-12 w-12" />);
    await checkA11y(container);
  });
});

/**
 * A live region speaks its content, not its accessible name: the composites
 * hold their label as visually hidden text, beside bars that are all hidden.
 */
describe.each([
  ['SkeletonText', () => <SkeletonText lines={3} />, 'tables.skeleton.loadingText'],
  ['SkeletonFigures', () => <SkeletonFigures count={3} />, 'tables.skeleton.loadingStat'],
  ['SkeletonTable', () => <SkeletonTable rows={2} />, 'tables.skeleton.loadingRows'],
  ['SkeletonNFTCard', () => <SkeletonNFTCard />, 'tables.skeleton.loadingNft'],
])('%s', (_name, renderIt, label) => {
  it('announces loading once, with text a screen reader speaks', () => {
    render(renderIt());
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(label);
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAccessibleName(label);
  });
});

describe('announce={false}', () => {
  it('stays silent inside a skeleton that already announces', () => {
    render(<SkeletonFigures announce={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('SkeletonText', () => {
  it('renders the configured line count', () => {
    const { container } = render(<SkeletonText lines={5} />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(5);
  });
});

describe('SkeletonFigures', () => {
  it('draws a label and a figure per column, with no card around them', () => {
    const { container } = render(<SkeletonFigures count={3} />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);
    expect(container.innerHTML).not.toMatch(/rounded-surface|border-rule/);
  });
});
