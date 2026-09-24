import '@testing-library/jest-dom';

import { SectionDivider } from '@/components/ui/section-divider';
import { SectionHeader } from '@/components/ui/section-header';

import { checkA11y, render, screen } from '@/test-utils';

describe('SectionHeader', () => {
  it('renders the page tier as an h2 by default', () => {
    render(<SectionHeader title="Standings" />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Standings' });
    expect(heading).toHaveClass('type-section');
  });

  it('takes the heading level the outline needs and the panel size', () => {
    render(<SectionHeader as="h3" size="panel" title="Token economy" />);
    const heading = screen.getByRole('heading', { level: 3, name: 'Token economy' });
    expect(heading).toHaveClass('type-heading-3');
  });

  it('renders the eyebrow, description and actions slots', () => {
    render(
      <SectionHeader
        eyebrow="Cycle 2"
        title="Allocation tracks"
        description="How the Cycle Reserve is split at finalization."
        actions={<a href="/allocation">View all</a>}
        headingId="tracks"
      />,
    );
    expect(screen.getByText('Cycle 2')).toHaveClass('type-eyebrow');
    expect(screen.getByText(/Cycle Reserve is split/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Allocation tracks' })).toHaveAttribute(
      'id',
      'tracks',
    );
  });

  it('puts at most one explanation beside the title, named by it', () => {
    render(<SectionHeader title="Reserve split" info="Every track draws a fixed share." />);
    expect(
      screen.getByRole('button', { name: 'More information about Reserve split' }),
    ).toHaveAccessibleDescription('Every track draws a fixed share.');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SectionHeader title="Protocol economy" description="Totals across every cycle." />,
    );
    await checkA11y(container);
  });
});

describe('SectionDivider', () => {
  it('draws a hairline separator without a title', () => {
    render(<SectionDivider />);
    expect(screen.getByRole('separator')).toHaveClass('bg-rule-faint');
  });

  it('renders a titled divider as a heading unless told otherwise', () => {
    const { rerender } = render(<SectionDivider title="Name history" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Name history' })).toBeInTheDocument();
    rerender(<SectionDivider title="Name history" as="p" />);
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
