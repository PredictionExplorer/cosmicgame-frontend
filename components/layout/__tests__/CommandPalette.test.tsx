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

  it('opens on "/" outside text fields only', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('textbox', { name: 'elsewhere' }));
    await user.keyboard('/');
    expect(screen.queryByRole('combobox')).toBeNull();
    (document.activeElement as HTMLElement).blur();
    await user.keyboard('/');
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
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

  it('says so when nothing matches', async () => {
    const { user, input } = await openPalette();
    await user.type(input, 'zzzz');
    expect(screen.getByText('nav.search.empty(query=zzzz)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    await openPalette();
    await checkA11y(screen.getByRole('dialog'));
  });
});
