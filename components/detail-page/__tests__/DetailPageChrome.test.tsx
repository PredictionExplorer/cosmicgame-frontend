import { checkA11y, render, screen, within } from '@/test-utils';

import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '../DetailPageChrome';

describe('SectionCard', () => {
  it('names its landmark from its own heading', () => {
    render(
      <SectionCard sectionId="gesture-summary" title="Gesture summary">
        <p>body</p>
      </SectionCard>,
    );

    const section = screen.getByRole('region', { name: 'Gesture summary' });
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent('Gesture summary');
  });

  it('renders its children inside the labelled section', () => {
    render(
      <SectionCard sectionId="gesture-summary" title="Gesture summary">
        <p>Cycle 12</p>
      </SectionCard>,
    );

    expect(
      within(screen.getByRole('region', { name: 'Gesture summary' })).getByText('Cycle 12'),
    ).toBeInTheDocument();
  });

  it('shows a description only when one is given', () => {
    const { rerender } = render(
      <SectionCard sectionId="gesture-summary" title="Gesture summary" description="What happened">
        <p>body</p>
      </SectionCard>,
    );
    expect(screen.getByText('What happened')).toBeInTheDocument();

    rerender(
      <SectionCard sectionId="gesture-summary" title="Gesture summary">
        <p>body</p>
      </SectionCard>,
    );
    expect(screen.queryByText('What happened')).not.toBeInTheDocument();
  });

  it('keeps two sections on one page independently addressable', () => {
    // The heading id is what names the landmark; reusing one would collapse
    // both sections onto the same name for screen-reader users.
    render(
      <>
        <SectionCard sectionId="summary" title="Summary">
          <p>first</p>
        </SectionCard>
        <SectionCard sectionId="timeline" title="Timeline">
          <p>second</p>
        </SectionCard>
      </>,
    );

    expect(
      within(screen.getByRole('region', { name: 'Summary' })).getByText('first'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Timeline' })).getByText('second'),
    ).toBeInTheDocument();
  });

  it('adds a caller className on top of the shared panel styling', () => {
    render(
      <SectionCard sectionId="summary" title="Summary" className="mt-12">
        <p>body</p>
      </SectionCard>,
    );

    const section = screen.getByRole('region', { name: 'Summary' });
    expect(section).toHaveClass('mt-12');
    for (const panelClass of detailPanelClass.split(' ')) {
      expect(section).toHaveClass(panelClass);
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SectionCard sectionId="summary" title="Summary" description="What happened">
        <p>body</p>
      </SectionCard>,
    );

    await checkA11y(container);
  });
});

describe('DefinitionList and DetailRow', () => {
  function renderRows() {
    return render(
      <DefinitionList>
        <DetailRow label="Cycle">12</DetailRow>
        <DetailRow label="Participant">
          <a className={detailLinkClass} href="#participant">
            0xabc
          </a>
        </DetailRow>
      </DefinitionList>,
    );
  }

  it('pairs each label with its value as a term and definition', () => {
    renderRows();

    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
      'Cycle',
      'Participant',
    ]);
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      '12',
      '0xabc',
    ]);
  });

  it('groups the rows into a single description list', () => {
    const { container } = renderRows();

    const lists = container.querySelectorAll('dl');
    expect(lists).toHaveLength(1);
    expect(lists[0]!.querySelectorAll('dt')).toHaveLength(2);
    expect(lists[0]!.querySelectorAll('dd')).toHaveLength(2);
  });

  it('renders interactive values as real controls', () => {
    renderRows();

    const link = screen.getByRole('link', { name: '0xabc' });
    expect(link).toHaveAttribute('href', '#participant');
    expect(link).toHaveClass('text-primary');
  });

  it('accepts a value of zero rather than dropping the row', () => {
    render(
      <DefinitionList>
        <DetailRow label="Attached NFTs">{0}</DetailRow>
      </DefinitionList>,
    );

    expect(screen.getByRole('definition')).toHaveTextContent('0');
  });

  it('renders inside a section card without violations', async () => {
    const { container } = render(
      <SectionCard sectionId="summary" title="Summary">
        <DefinitionList>
          <DetailRow label="Cycle">12</DetailRow>
          <DetailRow label="Participant">
            <a className={detailLinkClass} href="#participant">
              0xabc
            </a>
          </DetailRow>
        </DefinitionList>
      </SectionCard>,
    );

    await checkA11y(container);
  });

  it('has no accessibility violations when the list is empty', async () => {
    const { container } = render(<DefinitionList>{null}</DefinitionList>);

    await checkA11y(container);
  });
});
