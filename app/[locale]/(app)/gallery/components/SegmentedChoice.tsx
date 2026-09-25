'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SegmentedOption<T extends string> {
  value: T;
  /** The visible label, or the accessible name of an icon-only option. */
  label: string;
  icon?: ReactNode;
  /**
   * A one-line explanation: a hover hint for a mouse; in a `block` choice (the
   * phone's filter sheet) the selected option's hint is a caption under it.
   */
  hint?: string;
}

export interface SegmentedChoiceProps<T extends string> {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  /** The group's accessible name. */
  label: string;
  /** Icon-only options: the label becomes the name and the hover hint. */
  iconOnly?: boolean;
  /** Stretch the options across the row (sheets on phones). */
  block?: boolean;
  className?: string;
}

/**
 * SegmentedChoice — one choice from a short set, drawn as the segmented
 * track (`tabsListVariants`), with radio semantics: one tab stop, arrow keys
 * move and select, Home and End jump. For view choices that are not tab
 * panels (the gallery's status filter and view mode). A tap always selects:
 * hints never stand between a touch and its option.
 */
export function SegmentedChoice<T extends string>({
  value,
  options,
  onChange,
  label,
  iconOnly = false,
  block = false,
  className,
}: SegmentedChoiceProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const hintId = useId();
  // The sheet explains the current choice in words a touch reader can see.
  const caption = block && !iconOnly ? options[selectedIndex]?.hint : undefined;

  const select = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  const group = (
    <div
      role="radiogroup"
      aria-label={label}
      aria-describedby={caption ? hintId : undefined}
      className={cn(
        tabsListVariants({ variant: 'segmented' }),
        // The same 3:1 control edge as the search field and the buttons
        // beside it in the toolbar, not a fill alone at about 1.1:1.
        'border border-input',
        block && 'flex w-full',
        'shrink-0',
        caption ? undefined : className,
      )}
    >
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        const button = (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={iconOnly ? option.label : undefined}
            tabIndex={checked ? 0 : -1}
            data-state={checked ? 'active' : 'inactive'}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              tabsTriggerVariants({ variant: 'segmented', scroll: false }),
              'whitespace-nowrap',
              iconOnly && 'px-2.5',
              block && 'flex-1',
            )}
          >
            {option.icon}
            {iconOnly ? null : option.label}
          </button>
        );
        const hint = option.hint ?? (iconOnly ? option.label : undefined);
        return hint && !caption ? (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="bottom">{hint}</TooltipContent>
          </Tooltip>
        ) : (
          button
        );
      })}
    </div>
  );

  if (!caption) return group;
  return (
    <div className={cn('space-y-2', className)}>
      {group}
      <p id={hintId} className="type-caption text-subtle">
        {caption}
      </p>
    </div>
  );
}
