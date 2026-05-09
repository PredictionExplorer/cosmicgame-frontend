import '@testing-library/jest-dom';
import { Children, isValidElement, type ReactNode } from 'react';

import { render, screen } from '@/test-utils';

import { HeroCanvas } from '../HeroCanvas';

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, frameloop }: { children: ReactNode; frameloop?: string }) => (
    <div data-testid="r3f-canvas" data-frameloop={frameloop}>
      {Children.toArray(children).filter(
        (child) => !isValidElement(child) || !['color', 'fog'].includes(String(child.type)),
      )}
    </div>
  ),
}));

jest.mock('@react-three/postprocessing', () => ({
  Bloom: () => <div data-testid="bloom-effect" />,
  ChromaticAberration: () => <div data-testid="chromatic-aberration-effect" />,
  EffectComposer: ({ children }: { children: ReactNode }) => (
    <div data-testid="effect-composer">{children}</div>
  ),
  Noise: () => <div data-testid="noise-effect" />,
  Vignette: () => <div data-testid="vignette-effect" />,
}));

jest.mock('postprocessing', () => ({
  BlendFunction: {
    MULTIPLY: 'MULTIPLY',
    NORMAL: 'NORMAL',
  },
}));

jest.mock('../NebulaShader', () => ({
  NebulaShader: () => <div data-testid="nebula-shader" />,
}));

jest.mock('../ReducedMotionFallback', () => ({
  ReducedMotionFallback: () => <div data-testid="reduced-motion-fallback" />,
}));

jest.mock('../ThreeBodyOrbit', () => ({
  ThreeBodyOrbit: () => <div data-testid="three-body-orbit" />,
}));

function installMatchMedia({
  highQuality = true,
  reducedMotion = false,
}: {
  highQuality?: boolean;
  reducedMotion?: boolean;
}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : highQuality,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('HeroCanvas', () => {
  beforeEach(() => {
    installMatchMedia({ highQuality: true, reducedMotion: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the high-quality decorative canvas in a non-interactive wrapper', () => {
    const { container } = render(<HeroCanvas />);

    const wrapper = container.querySelector('.pointer-events-none');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'h-full', 'w-full');
    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute('data-frameloop', 'always');
    expect(screen.getByTestId('nebula-shader')).toBeInTheDocument();
    expect(screen.getByTestId('three-body-orbit')).toBeInTheDocument();
  });

  it('uses the reduced-motion fallback when the user prefers reduced motion', () => {
    installMatchMedia({ highQuality: true, reducedMotion: true });

    render(<HeroCanvas />);

    expect(screen.getByTestId('reduced-motion-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
  });

  it('uses the fallback below the high-quality viewport breakpoint', () => {
    installMatchMedia({ highQuality: false, reducedMotion: false });

    render(<HeroCanvas />);

    expect(screen.getByTestId('reduced-motion-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
  });
});
