'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export interface SectionShellProps {
  title: string;
  /** One explanation for the whole section, beside its title. */
  tooltip?: string;
  /** One sentence under the title. */
  description?: ReactNode;
  /** Controls at the end of the title row (a scope switch, a link). */
  actions?: ReactNode;
  /** The heading's level in the page outline: 2 under the page's H1 (default), 3 inside a section. */
  headingLevel?: 2 | 3;
  /**
   * Whether the title is a disclosure button that folds the section away.
   * Off by default: a section a reader should see stays a plain heading.
   * Defaults to on for a section that starts collapsed (`defaultOpen={false}`).
   */
  collapsible?: boolean;
  /** Start collapsed with `false` (makes the section collapsible). */
  defaultOpen?: boolean;
  /** Mount the content only once the section is first opened (heavy charts, own queries). */
  lazy?: boolean;
  /**
   * What a folded section holds ("12 contracts"), shown under its title while
   * it is closed, so a closed section never reads as an empty one.
   */
  collapsedSummary?: ReactNode;
  /**
   * The visible verbs beside a collapsible title's chevron. Visual only: the
   * button's name stays the title and `aria-expanded` carries the state.
   */
  toggleLabels?: { show: string; hide: string };
  /** Marks the section busy while its content loads. */
  busy?: boolean;
  /** Anchor id, for links into the section. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * SectionShell — one section of a data page: an H2 in `type-section` (the
 * button folding the section away when it is `collapsible`, as a heavy
 * section that starts closed is), one explanation beside it, optional
 * actions on the right, and the body. No box: sections are divided
 * by one `--rule` and space, and the table or chart inside is the only frame
 * (docs/design-system.md → "Captions, not cards"). Carries no copy of its
 * own, so any page can use it; `StatsSection` adds the statistics pages'
 * loading, error and empty states.
 */
export function SectionShell({
  title,
  tooltip,
  description,
  actions,
  headingLevel = 2,
  defaultOpen = true,
  collapsible = !defaultOpen,
  lazy = false,
  collapsedSummary,
  toggleLabels,
  busy = false,
  id,
  className,
  children,
}: SectionShellProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [hasOpened, setHasOpened] = useState(defaultOpen);
  const headingId = useId();
  const panelId = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  const toggle = () => {
    setOpen((value) => !value);
    setHasOpened(true);
  };

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      className={cn(
        'min-w-0 scroll-mt-[calc(var(--sticky-offset)+3.5rem)] border-t border-rule pt-8 first:border-t-0 first:pt-0 sm:pt-10',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Heading
              id={headingId}
              className={cn(
                'min-w-0 text-foreground',
                headingLevel === 2 ? 'type-section' : 'type-heading-3',
              )}
            >
              {collapsible ? (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={toggle}
                  className="group inline-flex max-w-full touch-hit-area items-start gap-2.5 rounded-edge text-left"
                >
                  <span className="min-w-0">{title}</span>
                  <span className="mt-[0.3em] inline-flex shrink-0 items-center gap-1 text-subtle group-hover:text-foreground">
                    <ChevronDown
                      aria-hidden
                      className="size-5 transition-transform duration-base group-aria-expanded:rotate-180 motion-reduce:transition-none"
                    />
                    {toggleLabels ? (
                      <span aria-hidden className="type-label">
                        {open ? toggleLabels.hide : toggleLabels.show}
                      </span>
                    ) : null}
                  </span>
                </button>
              ) : (
                title
              )}
            </Heading>
            {tooltip ? (
              <InfoTooltip content={tooltip} label={title} className="mt-[0.35em] shrink-0" />
            ) : null}
          </div>
          {description ? (
            <p className="mt-2 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
          {collapsedSummary && !open ? (
            <p className="mt-2 type-body-sm text-muted-foreground">{collapsedSummary}</p>
          ) : null}
        </div>
        {actions && open ? (
          // Never wider than the row: on a phone the actions take their own line and wrap inside it.
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div id={panelId} hidden={!open} className="mt-6 min-w-0 sm:mt-8">
        {!lazy || hasOpened ? children : null}
      </div>
    </section>
  );
}
