import { render, screen, checkA11y } from '@/test-utils';

import { DefinitionsDisclosure } from '../DefinitionsDisclosure';
import { StatisticsGroup } from '../StatisticsGroup';
import { StatisticsItem } from '../StatisticsItem';

describe('StatisticsGroup and StatisticsItem', () => {
  it('renders a titled spec sheet of label/value rows', () => {
    render(
      <StatisticsGroup title="Token economy">
        <StatisticsItem title="Total CST consumed" value="264,467.61 CST" />
        <StatisticsItem title="Named tokens" value="3" caption="across 2 cycles" />
      </StatisticsGroup>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Token economy' })).toBeInTheDocument();
    const terms = screen.getAllByRole('term').map((el) => el.textContent);
    expect(terms).toEqual(['Total CST consumed', 'Named tokens']);
    const values = screen.getAllByRole('definition');
    expect(values[0]).toHaveTextContent('264,467.61 CST');
    expect(values[1]).toHaveTextContent('3across 2 cycles');
  });

  it('takes the heading level from its place in the outline', () => {
    render(
      <StatisticsGroup title="Overview" headingLevel={4}>
        <StatisticsItem title="A" value="1" />
      </StatisticsGroup>,
    );
    expect(screen.getByRole('heading', { level: 4, name: 'Overview' })).toBeInTheDocument();
  });

  it('links a figure to the ledger behind it, named by its label and its figure', () => {
    render(
      <StatisticsGroup title="Public Goods">
        <StatisticsItem title="Protocol contributions" value="4.826 ETH" href="/public-goods" />
      </StatisticsGroup>,
    );
    // V118: a list of the page's links reads "Protocol contributions 4.826 ETH", not a bare
    // number, and the name still starts with nothing the reader cannot see (WCAG 2.5.3).
    expect(screen.getByRole('link', { name: 'Protocol contributions 4.826 ETH' })).toHaveAttribute(
      'href',
      '/public-goods',
    );
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <StatisticsGroup title="Allocation economy" info="What these figures count.">
        <StatisticsItem title="Signature Allocations" value="25.5 ETH" />
      </StatisticsGroup>,
    );
    await checkA11y(container);
  });
});

describe('DefinitionsDisclosure', () => {
  it('keeps every definition in one closed disclosure', () => {
    const { container } = render(
      <DefinitionsDisclosure
        label="Definitions"
        items={[
          { term: 'Named tokens', definition: 'NFTs given a name by their owner.' },
          { term: 'CST gestures', definition: 'Gestures paid in CST.' },
        ]}
      />,
    );
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
    expect(screen.getByText('Definitions')).toBeInTheDocument();
    // In the server HTML even while closed, for search and print.
    expect(details).toHaveTextContent('NFTs given a name by their owner.');
  });

  it('renders nothing without items', () => {
    const { container } = render(<DefinitionsDisclosure label="Definitions" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
