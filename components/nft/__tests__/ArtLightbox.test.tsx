import { createRef } from 'react';

import { render, screen, fireEvent, checkA11y, waitFor } from '@/test-utils';

import { ArtLightbox } from '../ArtLightbox';

// jsdom has no PointerEvent: without one the pointer type and coordinates
// never reach the handlers.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

const WEBP = 'https://media.example/0xabc/images/web/full.webp';
const PNG = 'https://media.example/0xabc.png';

function renderLightbox(props: Partial<Parameters<typeof ArtLightbox>[0]> = {}) {
  const onOpenChange = jest.fn();
  const utils = render(
    <ArtLightbox
      open
      onOpenChange={onOpenChange}
      sources={[WEBP, PNG]}
      alt="Cosmic Signature #000025: Orbit Ribbons structure"
      title="Twisted Mind"
      unavailableLabel="Artwork unavailable"
      {...props}
    />,
  );
  return { ...utils, onOpenChange };
}

/** jsdom has no layout: give the image and the region a size to zoom from. */
function layOut() {
  const region = screen.getByRole('region', { name: 'Twisted Mind' });
  const image = screen.getByAltText('Cosmic Signature #000025: Orbit Ribbons structure');
  image.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1440, height: 800, right: 1440, bottom: 800 }) as DOMRect;
  region.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1440, height: 800, right: 1440, bottom: 800 }) as DOMRect;
  return { region, image };
}

describe('ArtLightbox', () => {
  it('is a titled, described modal dialog showing the full-size art', () => {
    renderLightbox();
    const dialog = screen.getByRole('dialog', { name: 'Twisted Mind' });
    expect(dialog).toHaveAccessibleDescription('detail.viewer.zoomHint');
    expect(
      screen.getByAltText('Cosmic Signature #000025: Orbit Ribbons structure'),
    ).toHaveAttribute('src', WEBP);
  });

  it('zooms with the button and fits again, describing how to pan', () => {
    renderLightbox();
    const { region } = layOut();
    fireEvent.click(screen.getByRole('button', { name: 'detail.viewer.zoomIn' }));
    expect(region).toHaveAttribute('data-zoomed', 'true');
    expect(region).toHaveFocus();
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('detail.viewer.panHint');
    fireEvent.click(screen.getByRole('button', { name: 'detail.viewer.zoomOut' }));
    expect(region).not.toHaveAttribute('data-zoomed');
  });

  it('zooms from the keyboard with + and fits with 0 or -', () => {
    renderLightbox();
    const { region } = layOut();
    fireEvent.keyDown(region, { key: '+' });
    expect(region).toHaveAttribute('data-zoomed', 'true');
    fireEvent.keyDown(region, { key: '0' });
    expect(region).not.toHaveAttribute('data-zoomed');
    fireEvent.keyDown(region, { key: '=' });
    fireEvent.keyDown(region, { key: '-' });
    expect(region).not.toHaveAttribute('data-zoomed');
  });

  it('zooms toward the point that was selected, and a drag does not toggle it', () => {
    renderLightbox();
    const { region } = layOut();
    fireEvent.click(region, { clientX: 1200, clientY: 200 });
    expect(region).toHaveAttribute('data-zoomed', 'true');

    fireEvent.pointerDown(region, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(region, { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 60 });
    fireEvent.pointerUp(region, { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 60 });
    fireEvent.click(region, { clientX: 40, clientY: 60 });
    expect(region).toHaveAttribute('data-zoomed', 'true');

    fireEvent.click(region, { clientX: 40, clientY: 60 });
    expect(region).not.toHaveAttribute('data-zoomed');
  });

  it('closes with Escape and returns focus to the control that opened it', async () => {
    const opener = createRef<HTMLButtonElement>();
    const onOpenChange = jest.fn();
    const view = (open: boolean) => (
      <>
        <button ref={opener} type="button">
          Full screen
        </button>
        <ArtLightbox
          open={open}
          onOpenChange={onOpenChange}
          sources={[WEBP]}
          alt="Art"
          title="Twisted Mind"
          unavailableLabel="Artwork unavailable"
          returnFocusRef={opener}
        />
      </>
    );
    const { rerender } = render(view(true));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(view(false));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Radix restores focus on the tick after the dialog unmounts.
    await waitFor(() => expect(opener.current).toHaveFocus());
  });

  it('shows the pending plate when the art cannot load', () => {
    renderLightbox();
    fireEvent.error(screen.getByAltText('Cosmic Signature #000025: Orbit Ribbons structure'));
    fireEvent.error(screen.getByAltText('Cosmic Signature #000025: Orbit Ribbons structure'));
    expect(
      screen.getByRole('img', { name: 'Cosmic Signature #000025: Orbit Ribbons structure' }),
    ).toHaveTextContent('Artwork unavailable');
    expect(screen.queryByRole('button', { name: 'detail.viewer.zoomIn' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    renderLightbox();
    await checkA11y(screen.getByRole('dialog'));
  });
});
