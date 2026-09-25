import { render } from '@testing-library/react';

import { SiteNameText } from '@/components/ui/site-name-text';

const renderText = (text: string) =>
  render(<h1>{<SiteNameText>{text}</SiteNameText>}</h1>).container.querySelector('h1')!;

// V425: at 390px the Japanese and Korean H1s split the brand ("Cosmic / Signatureの仕組み").
describe('SiteNameText', () => {
  it('keeps the brand in one span that does not wrap wherever the line has room for it', () => {
    const heading = renderText('How Cosmic Signature works');
    const brand = heading.querySelector('span')!;
    expect(brand.textContent).toBe('Cosmic Signature');
    expect(brand).toHaveClass('min-[22.5rem]:whitespace-nowrap');
    expect(heading.textContent).toBe('How Cosmic Signature works');
  });

  it('lets a Japanese heading turn after the brand before a katakana or Han word', () => {
    expect(renderText('Cosmic Signatureギャラリー').textContent).toBe(
      'Cosmic Signature​ギャラリー',
    );
    expect(renderText('Cosmic Signature観測所').textContent).toBe('Cosmic Signature​観測所');
  });

  it('keeps a particle on the brand’s line and adds nothing before a space', () => {
    expect(renderText('Cosmic Signatureの仕組み').textContent).toBe('Cosmic Signatureの仕組み');
    expect(renderText('Cosmic Signature 작동 원리').textContent).toBe('Cosmic Signature 작동 원리');
  });

  it('leaves text without the brand as it is', () => {
    const heading = renderText('Protocol statistics');
    expect(heading.innerHTML).toBe('Protocol statistics');
  });
});
