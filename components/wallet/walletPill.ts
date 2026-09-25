/**
 * The header wallet control's box and address, shared by the control itself
 * (ConnectWalletButton, loaded on demand) and the placeholder the header
 * shows until that chunk arrives, so the two measure the same at every
 * width and the header never moves when it lands. The header's one control
 * shape (rounded-control on the sunken surface, as search, palette and
 * language are): the pill is kept for the live Cycle status alone
 * (docs/design-system.md).
 */
export const WALLET_PILL_CLASS =
  'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-input bg-surface-sunken px-3 text-sm text-foreground md:min-h-10';

/** The short address, wherever the header has room for it. */
export const WALLET_PILL_ADDRESS_CLASS = 'type-mono hidden min-[400px]:inline lg:hidden xl:inline';
