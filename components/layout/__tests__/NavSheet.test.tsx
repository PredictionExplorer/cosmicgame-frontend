import '@testing-library/jest-dom';

import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { NavSheet } from '@/components/layout/NavSheet';

import { checkA11y, render, screen, within } from '@/test-utils';

function Harness({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <NavSheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange?.(next);
      }}
      trigger={<button type="button">Menu</button>}
    >
      <a href="/gallery">Gallery</a>
    </NavSheet>
  );
}

async function openSheet(onOpenChange?: (open: boolean) => void) {
  const user = userEvent.setup();
  render(<Harness onOpenChange={onOpenChange} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  return { user, sheet: await screen.findByRole('dialog', { name: 'nav.drawerTitle' }) };
}

describe('NavSheet', () => {
  it('holds the host’s navigation in the one named navigation landmark', async () => {
    const { sheet } = await openSheet();
    const nav = within(sheet).getByRole('navigation', { name: 'nav.primaryLabel' });
    expect(within(nav).getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery');
  });

  it('leads with the wordmark, which goes home and closes the sheet', async () => {
    const onOpenChange = jest.fn();
    const { user, sheet } = await openSheet(onOpenChange);
    const home = within(sheet).getByRole('link', { name: 'nav.brand.homeLabel' });
    expect(home).toHaveAttribute('href', '/');
    await user.click(home);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('pins the palette and language preferences to its foot, outside the navigation', async () => {
    const { sheet } = await openSheet();
    const nav = within(sheet).getByRole('navigation', { name: 'nav.primaryLabel' });
    const preferences = within(sheet).getByText('nav.drawer.preferences');
    expect(nav).not.toContainElement(preferences);
    expect(
      within(sheet).getByRole('radiogroup', { name: 'common.themeSwitcher.label' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { sheet } = await openSheet();
    await checkA11y(sheet);
  });
});
