/**
 * The header wallet pill's box and address, shared by the pill itself
 * (ConnectWalletButton, loaded on demand) and the placeholder the header
 * shows until that chunk arrives, so the two measure the same at every
 * width and the header never moves when the pill lands.
 */
export const WALLET_PILL_CLASS =
  'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill border border-input bg-surface-sunken px-3 text-sm text-foreground md:min-h-10';

/** The short address, wherever the header has room for it. */
export const WALLET_PILL_ADDRESS_CLASS = 'type-mono hidden min-[400px]:inline lg:hidden xl:inline';
