import { darkTheme } from '@rainbow-me/rainbowkit';

const baseTheme = darkTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

/**
 * CSS variables keep the lazy wallet modal in sync with the document palette,
 * including an already-open modal, without another provider or a wallet remount.
 * The radii are the design system's: the modal is a surface (12px) and its
 * buttons are controls (8px), never RainbowKit's 24px sheet and pill buttons.
 * Secondary text uses the subtle tier rather than a dimmed muted colour.
 */
export const cosmicRainbowTheme = {
  ...baseTheme,
  radii: {
    ...baseTheme.radii,
    actionButton: 'var(--radius-control)',
    connectButton: 'var(--radius-control)',
    menuButton: 'var(--radius-control)',
    modal: 'var(--radius-surface)',
    modalMobile: 'var(--radius-surface)',
  },
  colors: {
    ...baseTheme.colors,
    actionButtonBorder: 'hsl(var(--border))',
    actionButtonBorderMobile: 'hsl(var(--border))',
    actionButtonSecondaryBackground: 'hsl(var(--muted))',
    closeButton: 'hsl(var(--muted-foreground))',
    closeButtonBackground: 'hsl(var(--muted))',
    connectButtonBackground: 'hsl(var(--card))',
    connectButtonInnerBackground: 'hsl(var(--muted))',
    connectButtonText: 'hsl(var(--card-foreground))',
    downloadBottomCardBackground: 'hsl(var(--card))',
    downloadTopCardBackground: 'hsl(var(--muted))',
    generalBorder: 'hsl(var(--border))',
    generalBorderDim: 'hsl(var(--border) / 0.6)',
    menuItemBackground: 'hsl(var(--accent))',
    modalBackground: 'hsl(var(--popover))',
    modalBorder: 'hsl(var(--border))',
    modalText: 'hsl(var(--popover-foreground))',
    modalTextDim: 'hsl(var(--subtle-foreground))',
    modalTextSecondary: 'hsl(var(--muted-foreground))',
    profileAction: 'hsl(var(--muted))',
    profileActionHover: 'hsl(var(--accent))',
    profileForeground: 'hsl(var(--card))',
    selectedOptionBorder: 'hsl(var(--primary) / 0.5)',
  },
  // The document's text stack, so a Chinese locale keeps its punctuation alias.
  fonts: { body: 'var(--body-font-stack)' },
};
