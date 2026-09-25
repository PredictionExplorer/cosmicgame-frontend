import seo from '@/messages/en/seo.json';

import { render, screen } from '@/test-utils';

import { FinalizedLoading } from '../FinalizedLoading';
import { FINALIZED_INDEX_FIGURES, FINALIZED_INDEX_LINKS } from '../finalizedIndexSummary';

let mockSearch = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => mockSearch,
  usePathname: () => '/allocation-finalized',
}));

describe('the finalized page’s loading state', () => {
  it('draws a cycle’s record under its own header and trail', () => {
    mockSearch = new URLSearchParams('cycle=5&message=success');
    render(<FinalizedLoading />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'allocation.finalized.result.title(cycle=5)',
    );
    expect(screen.getByRole('link', { name: 'allocation.formats.cycle(cycle=5)' })).toHaveAttribute(
      'href',
      '/allocation/5',
    );
    expect(
      screen.getByRole('status', { name: 'allocation.finalized.loading.status' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
  });

  // The index lands with its summary header (PublicDataRouteSeoSummary): the loading state
  // draws that header, its figures still on their way, so its title never changes on arrival.
  it('draws the index under its summary header when no cycle is named', () => {
    mockSearch = new URLSearchParams('cycle=abc');
    render(<FinalizedLoading />);
    const copy = seo.publicData.routes['allocation-finalized'];
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.heading);
    for (const { key } of FINALIZED_INDEX_FIGURES) {
      expect(screen.getByText(copy.cards[key].label)).toBeInTheDocument();
    }
    for (const { href, key } of FINALIZED_INDEX_LINKS) {
      expect(screen.getByRole('link', { name: copy.links[key] })).toHaveAttribute('href', href);
    }
    expect(
      screen.getByRole('heading', { level: 2, name: 'allocation.finalized.index.title' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('pending-plate')).toHaveLength(3);
  });
});
