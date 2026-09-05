/** Decorative orbit mark; the adjacent wordmark names the home link. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="3" fill="currentColor" />
      <ellipse cx="20" cy="20" rx="18" ry="7" stroke="currentColor" transform="rotate(-35 20 20)" />
      <ellipse cx="20" cy="20" rx="18" ry="7" stroke="currentColor" transform="rotate(65 20 20)" />
    </svg>
  );
}
