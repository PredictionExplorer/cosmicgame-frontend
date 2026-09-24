import { jumpToSection } from '../jumpToSection';

describe('jumpToSection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav><a href="#two" id="link">Two</a></nav>
      <section id="one"><h2>One</h2></section>
      <section id="two"><h2>Two</h2><button id="trigger">Question</button></section>
      <section id="bare"><p>No heading</p></section>
    `;
    Element.prototype.scrollIntoView = jest.fn();
    window.history.replaceState(null, '', '/faq');
  });

  it('scrolls to the section, puts its fragment in the address bar and focuses its heading', () => {
    expect(jumpToSection('two')).toBe(true);
    const section = document.getElementById('two')!;
    expect(section.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'start' }),
    );
    expect(window.location.hash).toBe('#two');
    const heading = section.querySelector('h2')!;
    expect(document.activeElement).toBe(heading);
    // The heading is focusable only programmatically: it adds no tab stop.
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('focuses a given control instead, leaving its own tab order alone', () => {
    const trigger = document.getElementById('trigger')!;
    jumpToSection('two', { focus: trigger, hash: 'question' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger).not.toHaveAttribute('tabindex');
    expect(window.location.hash).toBe('#question');
  });

  it('falls back to the section itself when it has no heading', () => {
    jumpToSection('bare');
    expect(document.activeElement).toBe(document.getElementById('bare'));
  });

  it('does nothing for an unknown id', () => {
    expect(jumpToSection('missing')).toBe(false);
    expect(window.location.hash).toBe('');
  });
});
