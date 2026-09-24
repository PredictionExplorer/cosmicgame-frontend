import '@testing-library/jest-dom';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import userEvent from '@testing-library/user-event';

import { GLOSSARY_TERM_IDS, Term } from '@/components/ui/term';
import { routing } from '@/i18n/routing';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import enGlossary from '../../../messages/en/glossary.json';

function touchPointerDown(element: Element) {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: 'touch' });
  fireEvent(element, event);
}

describe('Term', () => {
  it('renders the glossary word in place with its short definition as the description', () => {
    render(
      <p>
        Gesture cost falls during the <Term id="calibrationWindow" />.
      </p>,
    );

    const term = screen.getByRole('button', { name: 'Calibration Window' });
    expect(term).toHaveAttribute('aria-description', enGlossary.terms.calibrationWindow.short);
    expect(term).toHaveAttribute('data-term', 'calibrationWindow');
    expect(term).not.toHaveAttribute('aria-expanded');
    expect(term.className).toMatch(/decoration-dotted/);
  });

  it('keeps the sentence’s own wording for an inflected term', () => {
    render(<Term id="stellarSelection">Stellar Selections</Term>);
    expect(screen.getByRole('button', { name: 'Stellar Selections' })).toBeInTheDocument();
  });

  it('shows the short definition on hover and the long one once pinned', async () => {
    const user = userEvent.setup();
    render(<Term id="enduranceChampion" />);
    const term = screen.getByRole('button', { name: 'Endurance Champion' });

    await user.hover(term);
    const hoverCard = await screen.findByRole('tooltip');
    expect(hoverCard).toHaveTextContent(enGlossary.terms.enduranceChampion.short);
    expect(hoverCard).not.toHaveTextContent(enGlossary.terms.enduranceChampion.long);

    await user.click(term);
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        enGlossary.terms.enduranceChampion.long,
      ),
    );

    // A pinned card survives the pointer leaving.
    await user.unhover(term);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('opens on a touch tap', async () => {
    render(<Term id="anchoring" />);
    const term = screen.getByRole('button', { name: 'Anchoring' });
    touchPointerDown(term);
    fireEvent.click(term);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(enGlossary.terms.anchoring.long);
  });

  it('opens from the keyboard and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Term id="retrieve" />);
    await user.tab();
    const term = screen.getByRole('button', { name: 'Retrieve' });
    expect(term).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(term).toHaveFocus();
  });

  it('explains an ad hoc word outside the glossary', async () => {
    render(
      <Term definition="A widely used Ethereum token standard." announce="text">
        ERC-20
      </Term>,
    );
    const term = screen.getByRole('button', { name: 'ERC-20' });
    fireEvent.click(term);
    const card = await screen.findByRole('tooltip');
    expect(card).toHaveTextContent('ERC-20');
    expect(card).toHaveTextContent('A widely used Ethereum token standard.');
  });

  it('names a figure label as more information about it', () => {
    render(
      <Term definition="Gestures made across every Cycle." announce="moreInformation">
        Gestures made
      </Term>,
    );
    expect(
      screen.getByRole('button', { name: 'More information about Gestures made' }),
    ).toHaveTextContent('Gestures made');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <p>
        Each <Term id="gesture" /> extends the <Term id="cycleFinalizationTime" />.
      </p>,
    );
    await checkA11y(container);
  });
});

describe('glossary catalog', () => {
  const messagesDir = join(__dirname, '..', '..', '..', 'messages');

  it('defines every term in every locale with a term, a short and a long definition', () => {
    for (const locale of routing.locales) {
      const catalog = JSON.parse(
        readFileSync(join(messagesDir, locale, 'glossary.json'), 'utf8'),
      ) as { terms: Record<string, { term: string; short: string; long: string }> };
      expect(Object.keys(catalog.terms).sort()).toEqual([...GLOSSARY_TERM_IDS].sort());
      for (const id of GLOSSARY_TERM_IDS) {
        const entry = catalog.terms[id];
        expect(entry?.term.trim()).toBeTruthy();
        expect(entry?.short.trim()).toBeTruthy();
        expect(entry?.long.trim()).toBeTruthy();
        // The hover card stays a glance: one or two sentences.
        expect(entry?.short.length).toBeLessThanOrEqual(locale === 'en' ? 160 : 180);
      }
    }
  });

  it('ships for every locale in the routing table', () => {
    const locales = readdirSync(messagesDir).filter((entry) =>
      readdirSync(join(messagesDir, entry)).includes('glossary.json'),
    );
    expect(locales.sort()).toEqual([...routing.locales].sort());
  });
});
