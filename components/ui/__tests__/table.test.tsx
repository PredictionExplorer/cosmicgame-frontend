import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { checkA11y, render, screen } from '@/test-utils';

function Contracts({ label }: { label?: string }) {
  return (
    <Table label={label}>
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
  it('renders the shared ledger markup without client code', () => {
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

  it('is a named, keyboard-reachable region when labelled', () => {
    render(<Contracts label="Protocol components" />);
    const region = screen.getByRole('region', { name: 'Protocol components' });
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Contracts label="Protocol components" />);
    await checkA11y(container);
  });
});
