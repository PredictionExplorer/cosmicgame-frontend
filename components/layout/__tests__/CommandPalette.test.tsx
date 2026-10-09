import '@testing-library/jest-dom';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { checkA11y, fireEvent, render, screen, waitFor, within } from '@/test-utils';

import { CommandPalette, useCommandPaletteShortcut } from '../CommandPalette';
import { isPaletteChord } from '../commandShortcut';
import { requestSiteSearch } from '../siteSearchEvents';

const mockPush = jest.fn();
jest.spyOn(jest.requireMock('next/navigation'), 'useRouter').mockReturnValue({
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
});

function Harness() {
  const [open, setOpen] = useState(false);
  useCommandPaletteShortcut(() => setOpen(true));
  return (
    <>
      <input aria-label="elsewhere" />
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}

async function openPalette() {
  const user = userEvent.setup();
  render(<Harness />);
  await user.keyboard('{Control>}k{/Control}');
  const input = await screen.findByRole('combobox');
  return { user, input };
}

beforeEach(() => mockPush.mockClear());

describe('CommandPalette', () => {
  it('opens on Ctrl+K with the search field focused', async () => {
    const { input } = await openPalette();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'nav.search.listLabel' })).toBeInTheDocument();
  });

  it('claims no single-character shortcut: "/" types a slash, anywhere (WCAG 2.1.4)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.keyboard('/');
    expect(screen.queryByRole('combobox')).toBeNull();
    await user.click(screen.getByRole('textbox', { name: 'elsewhere' }));
    await user.keyboard('/');
    expect(screen.getByRole('textbox', { name: 'elsewhere' })).toHaveValue('/');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('opens when another surface requests search', async () => {
    render(<Harness />);
    requestSiteSearch();
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('lists every destination by section while the query is empty', async () => {
    await openPalette();
    const list = screen.getByRole('listbox');
    expect(
      within(list).getByRole('group', { name: 'nav.sections.participate' }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole('option', { name: /nav\.routes\.observatory\.label/ }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps to a token, a cycle or a gesture from a bare number', async () => {
    const { user, input } = await openPalette();
    await user.type(input, '25');
    const options = within(
      screen.getByRole('group', { name: 'nav.search.groups.jump' }),
    ).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining('nav.search.results.token(id=#000025)'),
      expect.stringContaining('nav.search.results.cycle(cycle=25)'),
      expect.stringContaining('nav.search.results.gesture(id=25)'),
    ]);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(mockPush).toHaveBeenCalledWith('/allocation/25');
    await waitFor(() => expect(screen.queryByRole('combobox')).toBeNull());
  });

  it('opens a participant page for a pasted address', async () => {
    const { user, input } = await openPalette();
    await user.click(input);
    await user.paste('0x1234567890abcdef1234567890abcdef12345678');
    await user.keyboard('{Enter}');
    expect(mockPush).toHaveBeenCalledWith('/user/0x1234567890abcdef1234567890abcdef12345678');
  });

  it('finds pages by name and moves with the arrow keys', async () => {
    const { user, input } = await openPalette();
    await user.type(input, 'faq');
    const option = screen.getByRole('option', { name: /nav\.routes\.faq\.label/ });
    expect(input).toHaveAttribute('aria-activedescendant', option.id);
    await user.keyboard('{Enter}');
    expect(mockPush).toHaveBeenCalledWith('/faq');
  });

  it('says so when nothing matches, outside the list', async () => {
    const { user, input } = await openPalette();
    await user.type(input, 'zzzz');
    const message = screen.getAllByText('nav.search.empty(query=zzzz)')[0]!;
    expect(message.closest('[role="listbox"]')).toBeNull();
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('announces the result count, or that nothing matches, once typing pauses', async () => {
    const { user, input } = await openPalette();
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    await user.type(input, 'faq');
    await waitFor(() =>
      expect(status).toHaveTextContent(/^nav\.search\.resultCount\(count=\d+\)$/),
    );
    await user.type(input, 'zzzz');
    await waitFor(() => expect(status).toHaveTextContent('nav.search.empty(query=faqzzzz)'));
  });

  it('keys option ids by the option, so the active one is announced as the list narrows', async () => {
    const { user, input } = await openPalette();
    const before = input.getAttribute('aria-activedescendant');
    await user.type(input, 'faq');
    const after = input.getAttribute('aria-activedescendant');
    expect(after).not.toBe(before);
    expect(document.getElementById(after!)).toHaveTextContent(/nav\.routes\.faq\.label/);
  });

  it('offers a visible close control whose name holds its visible key cap', async () => {
    const { user } = await openPalette();
    // "Close" for screen readers, plus the "Esc" key cap it shows from 640px (WCAG 2.5.3).
    const close = screen.getByRole('button', { name: /^nav\.search\.keys\.close/ });
    expect(close).toHaveAccessibleName('nav.search.keys.close Esc');
    await user.click(close);
    await waitFor(() => expect(screen.queryByRole('combobox')).toBeNull());
  });

  it('reports a collapsed list when nothing matches', async () => {
    const { user, input } = await openPalette();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await user.type(input, 'zzzz');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('marks the active option with the shared highlight: a primary fill and a leading bar', async () => {
    await openPalette();
    const active = screen.getByRole('option', { selected: true });
    expect(active).toHaveClass('bg-primary/12', 'shadow-[inset_2px_0_0_0_hsl(var(--primary))]');
  });

  it('gives focus back to the element that had it before Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const field = screen.getByRole('textbox', { name: 'elsewhere' });
    await user.click(field);
    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('combobox')).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('combobox')).toBeNull());
    expect(field).toHaveFocus();
  });

  it('opens on Ctrl+K from the physical K key on a Cyrillic layout', async () => {
    render(<Harness />);
    fireEvent.keyDown(window, { key: 'л', code: 'KeyK', ctrlKey: true });
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await openPalette();
    await checkA11y(screen.getByRole('dialog'));
  });
});

describe('isPaletteChord', () => {
  const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

  it('is Ctrl+K off Apple platforms and Cmd+K on them', () => {
    expect(isPaletteChord(key({ key: 'k', code: 'KeyK', ctrlKey: true }), false)).toBe(true);
    expect(isPaletteChord(key({ key: 'k', code: 'KeyK', metaKey: true }), false)).toBe(false);
    expect(isPaletteChord(key({ key: 'k', code: 'KeyK', metaKey: true }), true)).toBe(true);
    // Ctrl+K in a Mac text field deletes to the end of the line; it stays the field's.
    expect(isPaletteChord(key({ key: 'k', code: 'KeyK', ctrlKey: true }), true)).toBe(false);
  });

  it('reads the letter a Latin layout types, and the physical key otherwise', () => {
    expect(isPaletteChord(key({ key: 'K', code: 'KeyK', ctrlKey: true }), false)).toBe(true);
    expect(isPaletteChord(key({ key: 'л', code: 'KeyK', ctrlKey: true }), false)).toBe(true);
    // Dvorak: the key labelled K sits where QWERTY has V, and types "k".
    expect(isPaletteChord(key({ key: 'k', code: 'KeyV', ctrlKey: true }), false)).toBe(true);
    expect(isPaletteChord(key({ key: 't', code: 'KeyK', ctrlKey: true }), false)).toBe(false);
  });

  it('ignores extra modifiers and input-method composition', () => {
    expect(
      isPaletteChord(key({ key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true }), false),
    ).toBe(false);
    expect(
      isPaletteChord(key({ key: 'k', code: 'KeyK', ctrlKey: true, altKey: true }), false),
    ).toBe(false);
    expect(
      isPaletteChord(key({ key: 'k', code: 'KeyK', ctrlKey: true, isComposing: true }), false),
    ).toBe(false);
  });
});
