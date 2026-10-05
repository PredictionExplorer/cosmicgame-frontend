import { cn } from '@/lib/utils';

export interface OrbitMarkProps {
  className?: string;
}

/**
 * The orbit mark as a hairline: three orbits and their bodies. It stands in
 * for artwork that has not arrived and never resembles a real Signature.
 * Server-safe, so a server-rendered page (the 404) can draw an empty plate
 * without the art-frame client module; `PendingPlate` draws it too.
 */
export function OrbitMark({ className }: OrbitMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      className={cn('text-foreground/15', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      data-testid="orbit-mark"
    >
      <ellipse cx="60" cy="60" rx="54" ry="19" vectorEffect="non-scaling-stroke" />
      <ellipse
        cx="60"
        cy="60"
        rx="54"
        ry="19"
        transform="rotate(60 60 60)"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="60"
        cy="60"
        rx="54"
        ry="19"
        transform="rotate(120 60 60)"
        vectorEffect="non-scaling-stroke"
      />
      <g fill="currentColor" stroke="none">
        <circle cx="114" cy="60" r="2.2" />
        <circle cx="33" cy="106.8" r="2.2" />
        <circle cx="42.2" cy="23.6" r="2.2" />
      </g>
    </svg>
  );
}
