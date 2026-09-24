import '@testing-library/jest-dom';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor, within } from '@/test-utils';

import { CommandPalette, useCommandPaletteShortcut } from '../CommandPalette';
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

  it('offers a visible close control', async () => {
    const { user } = await openPalette();
    await user.click(screen.getByRole('button', { name: 'nav.search.keys.close' }));
    await waitFor(() => expect(screen.queryByRole('combobox')).toBeNull());
  });

  it('has no accessibility violations', async () => {
    await openPalette();
    await checkA11y(screen.getByRole('dialog'));
  });
});
