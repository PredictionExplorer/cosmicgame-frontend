import { fireEvent, render, screen } from '@/test-utils';

import { SignatureReveal } from '../SignatureReveal';

const SOURCES = [[{ src: 'https://media.example/card.webp', width: 640 }]];

function renderReveal(reveal: boolean) {
  return render(
    <SignatureReveal
      reveal={reveal}
      sources={SOURCES}
      alt=""
      sizes="40rem"
      unavailableLabel="Artwork unavailable"
    />,
  );
}

describe('SignatureReveal', () => {
  it('keeps the image hidden until it has loaded, then lifts the hold for the fade', () => {
    const { container } = renderReveal(true);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-revealing', 'true');
    expect(wrapper.className).toContain('[&_img]:opacity-0');

    fireEvent.load(container.querySelector('img')!);

    expect(wrapper).toHaveAttribute('data-revealing', 'false');
    expect(wrapper.className).not.toContain('opacity-0');
  });

  it('never hides the image when there is no reveal to play', () => {
    const { container } = renderReveal(false);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-revealing', 'false');
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });
});
