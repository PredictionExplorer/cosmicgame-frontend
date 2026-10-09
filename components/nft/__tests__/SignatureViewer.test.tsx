import { render, screen, fireEvent, checkA11y, within, act, waitFor } from '@/test-utils';

import { SignatureViewer } from '../SignatureViewer';
import { signatureMedia } from '../signatureArt';

let mockReducedMotion = false;
jest.mock('../../../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockReducedMotion,
}));

const media = signatureMedia('abc123')!;

// jsdom has no media pipeline: play() and pause() only flip `paused`; the
// tests fire the play and pause events a browser would.
const play = jest.fn(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { configurable: true, value: false });
  return Promise.resolve();
});
const pause = jest.fn(function (this: HTMLMediaElement) {
  Object.defineProperty(this, 'paused', { configurable: true, value: true });
});

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pause });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockReducedMotion = false;
});

function renderViewer(overrides: Partial<Parameters<typeof SignatureViewer>[0]> = {}) {
  return render(
    <SignatureViewer
      media={media}
      alt="“Twisted Mind”, Cosmic Signature #000025"
      subject="Twisted Mind"
      tokenLabel="#000025"
      unavailableLabel="Artwork unavailable"
      sizes="100vw"
      {...overrides}
    />,
  );
}

/** A segment of the Still / In motion control: the shared SegmentedControl's radios. */
function modeButton(name: RegExp) {
  return within(screen.getByRole('radiogroup', { name: 'detail.viewer.modeLabel' })).getByRole(
    'radio',
    { name },
  );
}

describe('SignatureViewer', () => {
  it('shows the still by default, eagerly loaded, on its plate', () => {
    renderViewer();
    const art = screen.getByAltText('“Twisted Mind”, Cosmic Signature #000025');
    expect(art).toHaveAttribute('loading', 'eager');
    expect(modeButton(/detail.viewer.still/)).toBeChecked();
    expect(modeButton(/detail.viewer.motion/)).not.toBeChecked();
    expect(screen.queryByTestId('signature-motion')).not.toBeInTheDocument();
  });

  it('offers no animation beside a render that is still pending', () => {
    renderViewer({ media: null, renderPending: true, unavailableLabel: 'Rendering' });
    expect(screen.queryByRole('group', { name: 'detail.viewer.modeLabel' })).toBeNull();
    expect(screen.getByText('Rendering')).toBeInTheDocument();
  });

  it('plays the animation in the same plate when In motion is chosen, with a pause control', async () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    const video = screen.getByTestId('signature-motion');
    expect(video).toHaveAttribute('src', media.video);
    expect(video).toHaveAttribute('poster', media.webImage);
    expect(video).toHaveAccessibleName('detail.viewer.motionLabel(subject=Twisted Mind)');
    await waitFor(() => expect(play).toHaveBeenCalled());
    fireEvent.play(video);
    const toggle = screen.getByRole('button', { name: 'detail.viewer.pause' });
    fireEvent.click(toggle);
    expect(pause).toHaveBeenCalled();
    fireEvent.pause(video);
    expect(screen.getByRole('button', { name: 'detail.viewer.play' })).toBeInTheDocument();
  });

  it('waits for Play under reduced motion', () => {
    mockReducedMotion = true;
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    expect(screen.getByTestId('signature-motion')).toBeInTheDocument();
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'detail.viewer.play' }));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('pauses while the tab is hidden and resumes when it returns', async () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    const visibility = jest.spyOn(document, 'visibilityState', 'get');
    visibility.mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(pause).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(play).toHaveBeenCalledTimes(2);
    visibility.mockRestore();
  });

  it('falls back to the still and says so when the animation cannot load', () => {
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    fireEvent.error(screen.getByTestId('signature-motion'));
    expect(screen.queryByTestId('signature-motion')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('detail.viewer.motionError');
    expect(modeButton(/detail.viewer.motion/)).toBeDisabled();
  });

  it('opens the full-screen viewer from the keyboard-reachable button and from the art', () => {
    renderViewer();
    fireEvent.click(screen.getByRole('button', { name: /detail.viewer.fullscreen/ }));
    expect(screen.getByRole('dialog', { name: 'Twisted Mind' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.actions.close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByAltText('“Twisted Mind”, Cosmic Signature #000025'));
    expect(screen.getByRole('dialog', { name: 'Twisted Mind' })).toBeInTheDocument();
  });

  it('uses the browser’s own full screen for the animation', () => {
    const requestFullscreen = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLVideoElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    fireEvent.click(screen.getByRole('button', { name: /detail.viewer.fullscreen/ }));
    expect(requestFullscreen).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the browser’s controls while the animation fills the screen, and only then', () => {
    let current: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => current,
    });
    renderViewer();
    fireEvent.click(modeButton(/detail.viewer.motion/));
    const video = screen.getByTestId('signature-motion') as HTMLVideoElement;
    expect(video.controls).toBe(false);

    current = video;
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(video.controls).toBe(true);
    // The native controls own the click: the page does not toggle it a second time.
    const plays = play.mock.calls.length;
    const pauses = pause.mock.calls.length;
    fireEvent.click(video);
    expect(play).toHaveBeenCalledTimes(plays);
    expect(pause).toHaveBeenCalledTimes(pauses);

    current = null;
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(video.controls).toBe(false);
    Reflect.deleteProperty(document, 'fullscreenElement');
  });

  it('draws the pending plate with the token number when there is no seed yet', () => {
    renderViewer({ media: null });
    const plate = screen.getByRole('img', { name: '“Twisted Mind”, Cosmic Signature #000025' });
    expect(plate).toHaveTextContent('Artwork unavailable');
    expect(plate).toHaveTextContent('#000025');
    expect(
      screen.queryByRole('group', { name: 'detail.viewer.modeLabel' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /detail.viewer.fullscreen/ }),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderViewer();
    await checkA11y(container);
  });
});
