import { cn } from '@/lib/utils';

interface UnknownValueProps {
  /**
   * What assistive technology announces instead of the dash, already translated —
   * for example the namespace's "Unavailable" string, or a sentence naming the reason.
   */
  label: string;
  className?: string;
}

/**
 * The single rendering for a figure the page could not read or that does not exist yet:
 * an em dash for sighted readers and a spoken label for screen readers. Use it instead of
 * `0`, `--` or a blank whenever a read failed, a field is missing from the payload, or a
 * ratio has no denominator, so an unknown never reads as a confident zero.
 *
 * Renders no hooks, so it works in server and client components alike.
 */
export function UnknownValue({ label, className }: UnknownValueProps) {
  return (
    <span className={cn('text-muted-foreground', className)} title={label}>
      <span aria-hidden="true">—</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
