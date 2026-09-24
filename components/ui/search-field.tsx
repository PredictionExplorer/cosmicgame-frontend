'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { fieldSurface } from '@/components/ui/item-highlight';

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'defaultValue'
>;

export interface SearchFieldProps extends NativeInputProps {
  value?: string;
  defaultValue?: string;
  /** Called with the new text on every change, and with '' when cleared. */
  onValueChange?: (value: string) => void;
  /**
   * Accessible name of the clear button (for example `search.gallery.clear`).
   * Without it the field shows no clear button.
   */
  clearLabel?: string;
  /** Called after the clear button empties the field. */
  onClear?: () => void;
  /**
   * A letter that focuses the field with ⌘ or Ctrl. The hint shows only to a
   * fine pointer (a keyboard is likely there) and only while the field is empty.
   */
  shortcutKey?: string;
  /** `md`: 44px on phones, 40px from `sm`. `lg`: 48px, for a page's main search. */
  size?: 'md' | 'lg';
  /** Classes for the wrapper (width, margins); `className` styles the input. */
  containerClassName?: string;
}

const noSubscription = () => () => undefined;

/** ⌘ on Apple platforms, Ctrl elsewhere; the server renders ⌘ and the client corrects it. */
function useIsApplePlatform(): boolean {
  return React.useSyncExternalStore(
    noSubscription,
    () => /mac|iphone|ipad|ipod/i.test(navigator.userAgent),
    () => true,
  );
}

/**
 * SearchField — the one search input.
 *
 * The magnifier sits above the field (it was painted over by a blurred fill
 * on the FAQ) and never takes the pointer; the text is 16px below `sm`, so
 * focusing it does not zoom iOS Safari; a clear button appears once there is
 * text; an optional ⌘K / Ctrl K shortcut focuses it. Pair it with a
 * `<Button type="submit">` when the search runs on submit.
 */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      onChange,
      clearLabel,
      onClear,
      shortcutKey,
      size = 'md',
      className,
      containerClassName,
      ...props
    },
    forwardedRef,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement, []);
    const isControlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
    const value = isControlled ? valueProp : uncontrolled;
    const hasText = value.length > 0;
    const isApple = useIsApplePlatform();

    React.useEffect(() => {
      if (!shortcutKey) return;
      const key = shortcutKey.toLowerCase();
      const onKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
          event.preventDefault();
          inputRef.current?.focus();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [shortcutKey]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolled(event.target.value);
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const clear = () => {
      if (!isControlled) setUncontrolled('');
      onValueChange?.('');
      onClear?.();
      inputRef.current?.focus();
    };

    const showClear = Boolean(clearLabel) && hasText;
    const showShortcut = Boolean(shortcutKey) && !hasText;

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <Search
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-subtle',
            size === 'lg' ? 'left-4 size-[1.125rem]' : 'left-3 size-4',
          )}
        />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          aria-keyshortcuts={
            shortcutKey
              ? `Meta+${shortcutKey.toUpperCase()} Control+${shortcutKey.toUpperCase()}`
              : undefined
          }
          className={cn(
            'flex w-full min-w-0 py-2 focus-visible:border-primary',
            // The native cancel glyph duplicates the clear button.
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
            fieldSurface,
            size === 'lg' ? 'h-12 min-h-12 pl-11' : 'h-11 min-h-11 pl-10 sm:h-10 sm:min-h-0',
            showClear || showShortcut ? 'pr-12' : 'pr-3',
            className,
          )}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            onClick={clear}
            aria-label={clearLabel}
            className={cn(
              'absolute top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-subtle transition-colors duration-[var(--duration-fast)] hover:bg-surface-raised hover:text-foreground',
              size === 'lg' ? 'right-2' : 'right-1.5',
            )}
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : showShortcut ? (
          <kbd
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-1/2 hidden h-6 -translate-y-1/2 select-none items-center gap-0.5 rounded-edge border border-rule px-1.5 font-mono type-caption text-subtle pointer-fine:inline-flex',
              size === 'lg' ? 'right-3' : 'right-2.5',
            )}
          >
            {isApple ? '⌘' : 'Ctrl '}
            {shortcutKey?.toUpperCase()}
          </kbd>
        ) : null}
      </div>
    );
  },
);
SearchField.displayName = 'SearchField';
