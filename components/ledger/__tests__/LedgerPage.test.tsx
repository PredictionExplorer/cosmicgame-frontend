import { checkA11y, render, screen } from '@/test-utils';

import { LedgerPage } from '../LedgerPage';

describe('LedgerPage', () => {
  it('renders the header and the body in one main landmark', () => {
    render(
      <LedgerPage header={<h1>CST transfers</h1>}>
        <table aria-label="Transfers ledger" />
      </LedgerPage>,
    );

    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByRole('heading', { level: 1 }));
    expect(main).toContainElement(screen.getByRole('table', { name: 'Transfers ledger' }));
  });

  it('sets the side column beside the body from lg, without a stray landmark', () => {
    const { container } = render(
      <LedgerPage header={<h1>Contributions</h1>} aside={<section aria-label="Form">form</section>}>
        <p>ledger</p>
      </LedgerPage>,
    );

    expect(container.querySelector('aside')).toBeNull();
    const side = screen.getByRole('region', { name: 'Form' }).parentElement;
    expect(side?.className).toContain('lg:col-span-4');
    expect(side?.className).toContain('lg:sticky');
    expect(screen.getByText('ledger').parentElement?.className).toContain('lg:col-span-8');
  });

  it('keeps a narrow body on the same content edge as the header', () => {
    render(
      <LedgerPage header={<h1>Outreach allocations</h1>} width="narrow">
        <p>ledger</p>
      </LedgerPage>,
    );

    const body = screen.getByText('ledger').parentElement;
    expect(body?.className).toContain('max-w-3xl');
    expect(body?.className).not.toContain('mx-auto');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <LedgerPage header={<h1>Ledger</h1>} aside={<section aria-label="Form">form</section>}>
        <p>ledger</p>
      </LedgerPage>,
    );
    await checkA11y(container);
  });
});
