import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { act, checkA11y, render, screen } from '@/test-utils';

function Contracts({ label, labelledBy }: { label?: string; labelledBy?: string }) {
  return (
    <Table label={label} labelledBy={labelledBy}>
      <TableHeader>
        <TableRow>
          <TableHead>Component</TableHead>
          <TableHead align="end">Share</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell label="Component">Public Goods Vault</TableCell>
          <TableCell label="Share" align="end" numeric>
            7%
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('static Table', () => {
  it('renders the shared ledger markup', () => {
    const { container } = render(<Contracts />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('cs-table');
    expect(table).toHaveAttribute('data-layout', 'cards');
    expect(container.querySelector('.cs-table-scroll')).toBeInTheDocument();
  });

  it('names each cell and states one alignment per column', () => {
    const { container } = render(<Contracts />);
    const [name, share] = Array.from(container.querySelectorAll('td'));
    expect(name).toHaveAttribute('data-label', 'Component');
    expect(share).toHaveAttribute('data-align', 'end');
    expect(share).toHaveAttribute('data-numeric', 'true');
    expect(screen.getByRole('columnheader', { name: 'Share' })).toHaveAttribute(
      'data-align',
      'end',
    );
    expect(name?.firstElementChild).toHaveAttribute('data-slot', 'value');
  });

  it('is named by the heading it sits under', () => {
    render(
      <section>
        <h2 id="contracts-heading">Contracts</h2>
        <Contracts labelledBy="contracts-heading" />
      </section>,
    );
    expect(screen.getByRole('table', { name: 'Contracts' })).toBeInTheDocument();
  });

  it('adds no tab stop or landmark while the table fits', () => {
    const { container } = render(<Contracts label="Protocol components" />);
    expect(screen.getByRole('table', { name: 'Protocol components' })).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(container.querySelector('.cs-table-scroll')).not.toHaveAttribute('tabindex');
  });

  describe('when the table is wider than its column', () => {
    let restore: () => void;

    beforeEach(() => {
      // jsdom lays nothing out: fake a ResizeObserver and the scroll geometry.
      class FakeResizeObserver {
        constructor(private readonly callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {}
        unobserve() {}
      }
      const original = window.ResizeObserver;
      window.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
      const spies = [
        jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900),
        jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(320),
      ];
      restore = () => {
        window.ResizeObserver = original;
        spies.forEach((spy) => spy.mockRestore());
      };
    });

    afterEach(() => restore());

    it('becomes a keyboard-reachable region named after its heading', async () => {
      render(
        <section>
          <h2 id="contracts-heading">Contracts</h2>
          <Contracts labelledBy="contracts-heading" />
        </section>,
      );
      await act(async () => {});
      const region = screen.getByRole('region', { name: 'Contracts' });
      expect(region).toHaveAttribute('tabindex', '0');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(
        <section>
          <h2 id="contracts-heading">Contracts</h2>
          <Contracts labelledBy="contracts-heading" />
        </section>,
      );
      await act(async () => {});
      await checkA11y(container);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Contracts label="Protocol components" />);
    await checkA11y(container);
  });
});
