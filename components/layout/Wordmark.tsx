import { cn } from '@/lib/utils';

import { BrandMark } from './BrandMark';

type WordmarkSize = 'sm' | 'md' | 'lg';

const MARK_SIZE: Record<WordmarkSize, string> = {
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-9',
};

const TEXT_SIZE: Record<WordmarkSize, string> = {
  sm: 'text-[0.9375rem]',
  md: 'text-base',
  lg: 'text-xl',
};

interface WordmarkProps {
  /** sm: phone headers · md: headers and drawers · lg: footers. */
  size?: WordmarkSize;
  className?: string;
  /** Extra classes for the name, e.g. to hide it where only the mark fits. */
  nameClassName?: string;
}

/**
 * The Cosmic Signature lockup: the orbit mark and the name, identical on
 * both hosts and in every locale. The name is a Latin logotype, so it is set
 * in the locale-invariant brand face (`font-brand`), marked `lang="en"` and
 * `translate="no"`, and never follows the per-locale display stack. It is
 * decorative inside a link that carries its own accessible name.
 */
export function Wordmark({ size = 'md', className, nameClassName }: WordmarkProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <BrandMark className={cn('shrink-0', MARK_SIZE[size])} />
      <span
        lang="en"
        translate="no"
        data-wordmark
        className={cn(
          'font-brand whitespace-nowrap font-semibold leading-none tracking-[-0.01em] [word-spacing:0.08em] text-foreground',
          TEXT_SIZE[size],
          nameClassName,
        )}
      >
        Cosmic <span className="text-primary">Signature</span>
      </span>
    </span>
  );
}
