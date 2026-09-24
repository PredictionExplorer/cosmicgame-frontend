import { cosmicRainbowTheme } from '../rainbowkit-theme';

jest.mock('@rainbow-me/rainbowkit', () => ({
  darkTheme: () => ({
    colors: { modalTextDim: 'rgba(255, 255, 255, 0.3)' },
    radii: { actionButton: '9999px', connectButton: '12px', menuButton: '12px', modal: '24px' },
    fonts: { body: 'system-ui' },
  }),
}));

describe('wallet modal theme', () => {
  it('draws the modal as a surface and its buttons as controls', () => {
    expect(cosmicRainbowTheme.radii).toMatchObject({
      actionButton: 'var(--radius-control)',
      connectButton: 'var(--radius-control)',
      menuButton: 'var(--radius-control)',
      modal: 'var(--radius-surface)',
      modalMobile: 'var(--radius-surface)',
    });
  });

  it('sets secondary text in the subtle tier, never a dimmed colour', () => {
    expect(cosmicRainbowTheme.colors.modalTextDim).toBe('hsl(var(--subtle-foreground))');
    for (const value of Object.values(cosmicRainbowTheme.colors)) {
      expect(value).not.toMatch(/foreground\) \/ 0\.[0-9]/);
    }
  });

  it("uses the document's text stack", () => {
    expect(cosmicRainbowTheme.fonts.body).toBe('var(--body-font-stack)');
  });
});
