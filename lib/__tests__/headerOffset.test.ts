import { headerHeightPx, headerRootMargin } from '@/lib/headerOffset';

describe('header offset', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--header-height');
    document.documentElement.style.removeProperty('font-size');
  });

  it('reads the header height the page resolves, in rem or px', () => {
    // Regression: observers hard-coded -72px after the phone header became 56px.
    document.documentElement.style.setProperty('--header-height', '3.5rem');
    expect(headerHeightPx()).toBe(56);
    expect(headerRootMargin()).toBe('-56px 0px 0px 0px');

    document.documentElement.style.setProperty('--header-height', '4.5rem');
    document.documentElement.style.fontSize = '20px';
    expect(headerHeightPx()).toBe(90);

    document.documentElement.style.setProperty('--header-height', '72px');
    expect(headerRootMargin()).toBe('-72px 0px 0px 0px');
  });

  it('falls back to the phone header when the token is missing', () => {
    expect(headerHeightPx()).toBe(56);
  });
});
