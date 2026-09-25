'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ArrowUpRight,
  CornerDownLeft,
  Images,
  Orbit,
  PenLine,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  SITE_ROUTES,
  SITE_SECTION_IDS,
  resolveRouteHref,
  type SiteLinkKind,
  type SiteSectionId,
} from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRouter } from '@/i18n/navigation';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { jumpKeywordsFor, parseJumpQuery, searchEntries, type JumpTarget } from '@/lib/siteSearch';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { getExplorerUrl } from '@/utils/urls';

import { paletteReturnTarget } from './commandShortcut';
import { useSiteNavCopy } from './useSiteNav';

// The keyboard contract lives in the small module the header loads on every
// page; re-exported for callers that import it from here.
export { useCommandPaletteShortcut, useCommandShortcut } from './commandShortcut';

interface PaletteOption {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly kind: SiteLinkKind;
}

interface PaletteGroup {
  readonly key: string;
  readonly title: string;
  readonly options: readonly PaletteOption[];
  /** Index of the group's first option in the flat option list. */
  readonly start: number;
}

const JUMP_ICONS: Record<JumpTarget['kind'], LucideIcon> = {
  address: UserRound,
  transaction: ArrowUpRight,
  token: Images,
  cycle: Orbit,
  gesture: PenLine,
};

/** How long typing must pause before the result count is announced. */
const ANNOUNCE_DELAY_MS = 500;

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="type-caption inline-flex h-5 min-w-5 items-center justify-center rounded-edge border border-rule px-1 font-sans text-subtle">
      {children}
    </kbd>
  );
}

/** The routes and the jumps a query spells out, grouped for the list. */
function usePaletteGroups(query: string): PaletteGroup[] {
  const t = useTranslations('nav');
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const jumpKeywords = useMemo(() => jumpKeywordsFor(locale), [locale]);

  const routeEntries = useMemo(
    () =>
      SITE_ROUTES.map((route) => {
        const target = resolveRouteHref(route, 'app', locale);
        return {
          id: route.id,
          section: route.section,
          label: copy.routeLabel(route.id),
          description: copy.routeDescription(route.id),
          keywords: [copy.sectionTitle(route.section), route.path],
          href: target.href,
          kind: target.kind,
        };
      }),
    [copy, locale],
  );

  return useMemo(() => {
    const groups: Omit<PaletteGroup, 'start'>[] = [];
    const jumps = parseJumpQuery(query, jumpKeywords).map((jump): PaletteOption => {
      if (jump.kind === 'transaction') {
        return {
          key: `jump-tx-${jump.value}`,
          label: t('search.results.transaction', { explorer: EXPLORER_NAME }),
          description: t('search.descriptions.transaction'),
          icon: JUMP_ICONS.transaction,
          href: getExplorerUrl('tx', jump.value),
          kind: 'external',
        };
      }
      const label =
        jump.kind === 'address'
          ? t('search.results.address', { address: formatAddress(jump.value) })
          : jump.kind === 'token'
            ? t('search.results.token', { id: formatId(jump.value) })
            : jump.kind === 'cycle'
              ? t('search.results.cycle', { cycle: String(jump.value) })
              : t('search.results.gesture', { id: String(jump.value) });
      return {
        key: `jump-${jump.kind}-${jump.value}`,
        label,
        description: t(`search.descriptions.${jump.kind}`),
        icon: JUMP_ICONS[jump.kind],
        href: jump.path,
        kind: 'internal',
      };
    });
    if (jumps.length) groups.push({ key: 'jump', title: t('search.groups.jump'), options: jumps });

    const matches = searchEntries(routeEntries, query);
    const bySection = new Map<SiteSectionId, PaletteOption[]>();
    for (const match of matches) {
      const options = bySection.get(match.section) ?? [];
      options.push({
        key: match.id,
        label: match.label,
        description: match.description,
        icon: SITE_ROUTE_ICONS[match.id],
        href: match.href,
        kind: match.kind,
      });
      bySection.set(match.section, options);
    }
    // A query keeps the best matches on top; an empty one reads like the site map.
    const order = query.trim()
      ? [...new Set(matches.map((match) => match.section))]
      : SITE_SECTION_IDS;
    for (const section of order) {
      const options = bySection.get(section);
      if (options?.length)
        groups.push({ key: section, title: copy.sectionTitle(section), options });
    }

    let start = 0;
    return groups.map((group) => {
      const withStart = { ...group, start };
      start += group.options.length;
      return withStart;
    });
  }, [copy, jumpKeywords, query, routeEntries, t]);
}

/**
 * What a screen reader hears once typing pauses: the number of results, or
 * that nothing matches. A combobox's list changes silently otherwise.
 */
function useResultAnnouncement(query: string, count: number): string {
  const t = useTranslations('nav');
  const trimmed = query.trim();
  const [announced, setAnnounced] = useState<{ query: string; text: string } | null>(null);
  useEffect(() => {
    if (!trimmed) return undefined;
    const timer = window.setTimeout(
      () =>
        setAnnounced({
          query: trimmed,
          text:
            count > 0 ? t('search.resultCount', { count }) : t('search.empty', { query: trimmed }),
        }),
      ANNOUNCE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [count, trimmed, t]);
  // Only the announcement for the query on screen; a new query clears the
  // region until typing pauses again.
  return trimmed && announced?.query === trimmed ? announced.text : '';
}

/**
 * The palette's contents. Mounted only while the dialog is open, so every
 * open starts with an empty query.
 */
function PaletteBody({ onClose }: { onClose: () => void }) {
  const t = useTranslations('nav');
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  // The full placeholder does not fit a phone's field; the short one names
  // the same three kinds of query.
  const roomy = useMediaQuery('(min-width: 640px)');
  const groups = usePaletteGroups(query);
  const options = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const activeIndex = Math.min(active, Math.max(options.length - 1, 0));
  const announcement = useResultAnnouncement(query, options.length);
  // Keyed by the option, not its position: as the query narrows, the active
  // descendant changes whenever the option under it does, so it is announced.
  const optionId = (option: PaletteOption) => `${listId}-${option.key}`;
  const activeOption = options[activeIndex];
  const activeId = activeOption ? optionId(activeOption) : undefined;

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);

  const choose = useCallback(
    (option: PaletteOption) => {
      onClose();
      if (option.kind === 'internal') router.push(option.href);
      else if (option.kind === 'crossHost') window.location.assign(option.href);
      else window.open(option.href, '_blank', 'noopener,noreferrer');
    },
    [onClose, router],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + options.length) % options.length);
    } else if (event.key === 'PageDown' || event.key === 'PageUp') {
      event.preventDefault();
      const step = event.key === 'PageDown' ? 8 : -8;
      setActive(Math.min(Math.max(activeIndex + step, 0), options.length - 1));
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b border-rule-faint px-4">
        <Search aria-hidden className="size-4 shrink-0 text-subtle" />
        <input
          role="combobox"
          aria-expanded={groups.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label={t('search.triggerLabel')}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={roomy ? t('search.placeholder') : t('search.placeholderShort')}
          className="focus-ring-none h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-subtle"
        />
        {/* A visible way out on every device: a close button on phones, the Esc key cap
            from 640px. The name is "Close" plus the key cap where it shows, so it
            always contains the visible label (WCAG 2.5.3). */}
        <DialogPrimitive.Close className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-subtle transition-colors duration-150 hover:bg-muted hover:text-foreground sm:mr-0 sm:size-auto sm:bg-transparent sm:hover:bg-transparent">
          <X aria-hidden className="size-5 sm:hidden" />
          <span className="sr-only">{t('search.keys.close')}</span>
          <span className="hidden sm:inline-flex">
            <Kbd>Esc</Kbd>
          </span>
        </DialogPrimitive.Close>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {groups.length === 0 ? (
        <p className="type-body-sm min-h-0 flex-1 px-5 py-10 text-center text-muted-foreground">
          {t('search.empty', { query: query.trim() })}
        </p>
      ) : null}
      <div
        id={listId}
        role="listbox"
        aria-label={t('search.listLabel')}
        hidden={groups.length === 0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {groups.map((group) => {
          const headingId = `${listId}-${group.key}`;
          return (
            <div key={group.key} role="group" aria-labelledby={headingId} className="pb-1">
              <div
                id={headingId}
                role="presentation"
                className="type-eyebrow px-3 pb-1.5 pt-3 text-subtle"
              >
                {group.title}
              </div>
              {group.options.map((option, offset) => {
                const index = group.start + offset;
                const selected = index === activeIndex;
                const Icon = option.kind === 'external' ? ArrowUpRight : option.icon;
                return (
                  <div
                    key={option.key}
                    id={optionId(option)}
                    role="option"
                    aria-selected={selected}
                    onPointerMove={() => {
                      if (!selected) setActive(index);
                    }}
                    onClick={() => choose(option)}
                    className={cn(
                      // The site's highlighted row (components/ui/item-highlight): a 12%
                      // primary fill and a 2px primary bar, 6.5:1 or more in every
                      // palette. Focus stays in the field (aria-activedescendant), so
                      // this row is the list's keyboard focus indicator; in forced
                      // colours it is outlined in the system highlight.
                      'flex min-h-12 cursor-pointer items-center gap-3 rounded-control px-3 py-2',
                      selected
                        ? 'bg-primary/12 text-foreground shadow-[inset_2px_0_0_0_hsl(var(--primary))] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]'
                        : 'bg-transparent',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-control',
                        selected ? 'text-primary' : 'text-subtle',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="type-caption truncate text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                    {selected ? (
                      <CornerDownLeft aria-hidden className="size-4 shrink-0 text-subtle" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="type-caption hidden items-center gap-4 border-t border-rule-faint px-4 py-2.5 text-subtle sm:flex"
      >
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          {t('search.keys.move')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          {t('search.keys.open')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          {t('search.keys.close')}
        </span>
      </div>
    </>
  );
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The app's command palette: jump to any destination by name, or paste an
 * address (participant page), a token id (its artwork), a cycle (its
 * allocations), a gesture id or a transaction hash. A WAI-ARIA combobox on
 * Radix Dialog; the active option follows the arrow keys and Enter opens it.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const t = useTranslations('nav');
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  // The palette has no Radix trigger (it opens from a shortcut, the header,
  // the drawer, a menu row or the 404), so Radix cannot give focus back on
  // its own: it would fall to <body>, and a keyboard or screen-reader user
  // would start again from the top of the page (WCAG 2.4.3).
  const openerRef = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top),12vh)] z-50 flex max-h-[min(34rem,calc(100dvh-2rem))] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden rounded-surface border border-rule bg-popover text-popover-foreground shadow-float duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            // Focus has not moved yet: this is the element that opened the palette.
            const opener = document.activeElement;
            openerRef.current =
              opener instanceof HTMLElement && opener !== document.body ? opener : null;
            (event.currentTarget as HTMLElement).querySelector('input')?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            paletteReturnTarget(openerRef.current)?.focus();
            openerRef.current = null;
          }}
        >
          <DialogPrimitive.Title className="sr-only">{t('search.title')}</DialogPrimitive.Title>
          <PaletteBody onClose={close} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
