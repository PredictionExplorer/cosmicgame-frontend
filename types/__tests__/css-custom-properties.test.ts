import type React from 'react';

describe('CSS custom properties module augmentation', () => {
  it('allows --border on CSSProperties', () => {
    const style: React.CSSProperties = { '--border': '2px' };
    expect(style['--border']).toBe('2px');
  });

  it('allows --radius on CSSProperties', () => {
    const style: React.CSSProperties = { '--radius': '8px' };
    expect(style['--radius']).toBe('8px');
  });

  it('allows numeric custom property values', () => {
    const style: React.CSSProperties = { '--t': 0 };
    expect(style['--t']).toBe(0);
  });

  it('allows arbitrary --prefixed properties', () => {
    const style: React.CSSProperties = {
      '--my-color': 'red',
      '--spacing-lg': 24,
    };
    expect(style['--my-color']).toBe('red');
    expect(style['--spacing-lg']).toBe(24);
  });

  it('coexists with standard CSS properties', () => {
    const style: React.CSSProperties = {
      border: 0,
      borderRadius: 0,
      '--border': '1px',
      '--radius': '4px',
      background: 'transparent',
    };
    expect(style.border).toBe(0);
    expect(style['--border']).toBe('1px');
  });
});
