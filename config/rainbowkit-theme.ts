import { darkTheme } from '@rainbow-me/rainbowkit';

const baseTheme = darkTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

/**
 * CSS variables keep the lazy wallet modal in sync with the document palette,
 * including an already-open modal, without another provider or a wallet remount.
 */
export const cosmicRainbowTheme = {
  ...baseTheme,
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
    modalTextDim: 'hsl(var(--muted-foreground) / 0.7)',
    modalTextSecondary: 'hsl(var(--muted-foreground))',
    profileAction: 'hsl(var(--muted))',
    profileActionHover: 'hsl(var(--accent))',
    profileForeground: 'hsl(var(--card))',
    selectedOptionBorder: 'hsl(var(--primary) / 0.5)',
  },
  fonts: { body: 'var(--font-inter), Inter, var(--cjk-font-stack), sans-serif' },
};
