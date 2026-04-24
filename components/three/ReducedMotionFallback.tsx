export function ReducedMotionFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 40%, rgb(var(--nebula-violet-rgb) / 0.35) 0%, transparent 55%), radial-gradient(80% 100% at 20% 90%, rgb(var(--aurora-cyan-rgb) / 0.25) 0%, transparent 55%), radial-gradient(90% 80% at 80% 70%, rgb(var(--chrono-rose-rgb) / 0.22) 0%, transparent 60%), linear-gradient(180deg, #0D0521 0%, #1A0B3E 100%)',
      }}
    />
  );
}
