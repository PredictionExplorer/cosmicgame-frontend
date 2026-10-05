import { act, render, screen } from '@testing-library/react';

const { useNearViewport } =
  jest.requireActual<typeof import('../useNearViewport')>('../useNearViewport');

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

/** An observer the test drives: it reports whatever `report` is handed. */
class DrivenObserver {
  static last: DrivenObserver | null = null;
  static options: IntersectionObserverInit | undefined;
  observed: Element[] = [];
  disconnected = false;
  constructor(
    private readonly callback: Callback,
    options?: IntersectionObserverInit,
  ) {
    DrivenObserver.last = this;
    DrivenObserver.options = options;
  }
  observe(element: Element) {
    this.observed.push(element);
  }
  disconnect() {
    this.disconnected = true;
  }
  report(isIntersecting: boolean) {
    act(() => this.callback([{ isIntersecting }]));
  }
}

function Probe({ margin }: { margin?: string }) {
  const [near, ref] = useNearViewport<HTMLDivElement>(margin);
  return <div ref={ref}>{near ? 'near' : 'far'}</div>;
}

describe('useNearViewport', () => {
  const original = global.IntersectionObserver;
  beforeEach(() => {
    DrivenObserver.last = null;
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = DrivenObserver;
  });
  afterEach(() => {
    global.IntersectionObserver = original;
  });

  it('stays far until the element nears the screen, half a screen ahead by default', () => {
    render(<Probe />);
    expect(screen.getByText('far')).toBeInTheDocument();
    expect(DrivenObserver.options).toEqual({ rootMargin: '50% 0px' });
    DrivenObserver.last!.report(false);
    expect(screen.getByText('far')).toBeInTheDocument();
    DrivenObserver.last!.report(true);
    expect(screen.getByText('near')).toBeInTheDocument();
  });

  it('stays near for good, and stops observing', () => {
    render(<Probe />);
    const observer = DrivenObserver.last!;
    observer.report(true);
    expect(observer.disconnected).toBe(true);
    expect(screen.getByText('near')).toBeInTheDocument();
  });

  it('takes the margin it is given', () => {
    render(<Probe margin="200px 0px" />);
    expect(DrivenObserver.options).toEqual({ rootMargin: '200px 0px' });
  });

  it('is near at once where the browser has no observer', () => {
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    render(<Probe />);
    expect(screen.getByText('near')).toBeInTheDocument();
  });
});
