import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  heading: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-3xl ${alignClass} ${className ?? ''}`}>
      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)]" aria-hidden />
        {eyebrow}
      </div>
      <h2
        className="mt-6 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
        style={{ fontFamily: 'var(--font-family-display)' }}
      >
        {heading}
      </h2>
      {description && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
