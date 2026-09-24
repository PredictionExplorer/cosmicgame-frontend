import '@testing-library/jest-dom';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import userEvent from '@testing-library/user-event';

import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Term } from '@/components/ui/term';
import { routing } from '@/i18n/routing';
import { GLOSSARY_TERM_IDS } from '@/lib/glossary';

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
    expect(term).toHaveAccessibleDescription(enGlossary.terms.calibrationWindow.short);
    expect(term).toHaveAttribute('data-term', 'calibrationWindow');
    expect(term).not.toHaveAttribute('aria-expanded');
    expect(term.className).toMatch(/decoration-dotted/);
  });

  it('keeps the description out of the reading order', () => {
    render(
      <p>
        Each <Term id="gesture" /> counts.
      </p>,
    );
    const term = screen.getByRole('button', { name: 'Gesture' });
    const description = document.getElementById(term.getAttribute('aria-describedby') ?? '');
    expect(description).toHaveTextContent(enGlossary.terms.gesture.short);
    // Referenced directly, hidden text still describes the trigger, and
    // browse mode does not read the definition a second time.
    expect(description).toHaveAttribute('hidden');
  });

  it('wraps with the sentence: an inline span, never an atomic button box', () => {
    render(
      <p>
        Holders of <Term id="cycleFinalizationTime">the Cycle Finalization Time</Term> extend it.
      </p>,
    );
    const term = screen.getByRole('button', { name: 'the Cycle Finalization Time' });
    // A <button> is laid out as one inline-block, so a multi-word term would
    // jump whole to the next line (jsdom's UA sheet reports the same); a
    // span breaks across line boxes with the text around it.
    expect(term.tagName).toBe('SPAN');
    expect(getComputedStyle(term).display).not.toBe('inline-block');
    expect(term.className).not.toMatch(/(^|\s)(inline-block|inline-flex|block|flex|grid)(\s|$)/);
    expect(term).toHaveAttribute('tabindex', '0');
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
    // The card renders in a portal, so the long definition is announced.
    expect(screen.getByRole('status')).toHaveTextContent(enGlossary.terms.enduranceChampion.long);

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

  it('opens from the keyboard with Enter and closes on Escape', async () => {
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

  it('toggles with Space, without scrolling the page', async () => {
    const user = userEvent.setup();
    render(<Term id="imprint" />);
    await user.tab();
    const term = screen.getByRole('button', { name: 'Imprint' });

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    term.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(enGlossary.terms.imprint.long);

    await user.keyboard(' ');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(term).toHaveFocus();
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

describe('ExplainedTerm', () => {
  it('explains an ad hoc word outside the glossary', async () => {
    render(
      <ExplainedTerm definition="A widely used Ethereum token standard.">ERC-20</ExplainedTerm>,
    );
    const term = screen.getByRole('button', { name: 'ERC-20' });
    expect(term).toHaveAccessibleDescription('A widely used Ethereum token standard.');
    fireEvent.click(term);
    const card = await screen.findByRole('tooltip');
    expect(card).toHaveTextContent('ERC-20');
    expect(card).toHaveTextContent('A widely used Ethereum token standard.');
  });

  it('names a figure label as more information about it', () => {
    render(
      <ExplainedTerm definition="Gestures made across every Cycle." announce="moreInformation">
        Gestures made
      </ExplainedTerm>,
    );
    expect(
      screen.getByRole('button', { name: 'More information about Gestures made' }),
    ).toHaveTextContent('Gestures made');
  });

  it('adds no live region when there is nothing longer to announce', () => {
    render(<ExplainedTerm definition="Layer 2 network.">Arbitrum</ExplainedTerm>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('glossary catalog', () => {
  const messagesDir = join(__dirname, '..', '..', '..', 'messages');
  /** The source catalog is written to the tighter budget; translations may run longer. */
  const shortBudget = (locale: string) => (locale === routing.defaultLocale ? 160 : 180);

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
        expect(entry?.short.length).toBeLessThanOrEqual(shortBudget(locale));
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
