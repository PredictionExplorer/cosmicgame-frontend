'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  LANDING_HEADER_LINKS,
  LANDING_SECTION_ANCHORS,
  getSiteRoute,
  locateSitePath,
  type LandingSectionAnchor,
} from '@/config/siteNav';
import { Link, usePathname } from '@/i18n/navigation';
import { publicPathname } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { PalettePicker } from '@/components/layout/PalettePicker';
import { useSiteNavCopy } from '@/components/layout/useSiteNav';
import { Wordmark } from '@/components/layout/Wordmark';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { OpenAppLink } from './OpenAppLink';
import { useCollapseWhenCrowded } from './useCollapseWhenCrowded';

export type LandingSectionLabels = Readonly<Record<LandingSectionAnchor, string>>;

/**
 * Pages without a header link of their own that belong to one that has: the
 * quiz is part of the learning path, so Learn is current on /quiz and its tiers.
 */
const HEADER_PARENT: Readonly<Partial<Record<string, string>>> = { quiz: 'learnHub' };

/**
 * Which home section is in view, for `aria-current="location"` on its link.
 * A band across the upper third of the viewport decides, so the link changes
 * when a section's heading reaches the reading line.
 */
function useSectionInView(enabled: boolean): LandingSectionAnchor | null {
  const [current, setCurrent] = useState<LandingSectionAnchor | null>(null);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const sections = LANDING_SECTION_ANCHORS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setCurrent(LANDING_SECTION_ANCHORS.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? current : null;
}

/**
 * True once the landing hero has scrolled out of view, and always off the
 * home page. Until the observer reports, the hero counts as visible: the
 * server render and the first paint match, and the hero's own button is
 * the one in view.
 */
function usePastHero(onHome: boolean): boolean {
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === 'undefined') return undefined;
    const hero = document.querySelector('[aria-labelledby="landing-headline"]');
    if (!hero) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(!!entry?.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [onHome]);
  return !onHome || !heroVisible;
}

interface LandingHeaderProps {
  /** Labels of the home page's sections (the landing copy's eyebrows); omitted, no anchors. */
  sections?: LandingSectionLabels;
}

/**
 * The landing header on every landing page, the home included: a sticky
 * glass bar outside `<main>` with the same wordmark lockup as the app, the
 * home sections (with the one in view marked), the reading pages, and
 * "Open the app", which joins the bar once the hero's own button has
 * scrolled away. Below 1024px the links move into a sheet.
 */
export function LandingHeader({ sections }: LandingHeaderProps) {
  const t = useTranslations('nav');
  const copy = useSiteNavCopy();
  const pathname = publicPathname(usePathname());
  const onHome = pathname === '/';
  const location = locateSitePath(pathname, 'landing');
  const inView = useSectionInView(onHome && !!sections);
  const pastHero = usePastHero(onHome);
  const [menuOpen, setMenuOpen] = useState(false);
  // When "Open the app" joins the bar, long names (Ukrainian, Vietnamese …)
  // no longer fit beside it: the section anchors give way first.
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const anchorsCrowded = useCollapseWhenCrowded(navRef, listRef);

  const anchorLinks = sections
    ? LANDING_SECTION_ANCHORS.map((id) => ({
        key: id,
        href: onHome ? `#${id}` : `/#${id}`,
        label: sections[id],
        current: inView === id ? ('location' as const) : undefined,
      }))
    : [];
  const locatedId = location.route?.id;
  const headerId = locatedId ? (HEADER_PARENT[locatedId] ?? locatedId) : undefined;
  const pageLinks = LANDING_HEADER_LINKS.map(({ id, short }) => {
    const route = getSiteRoute(id);
    const current = headerId === id;
    return {
      key: id,
      href: route.path,
      label: short ? copy.routeShortLabel(id) : copy.routeLabel(id),
      current:
        current && locatedId === id && location.exact
          ? ('page' as const)
          : current
            ? ('true' as const)
            : undefined,
    };
  });

  // On the home page "Open the app" is the bar's primary once the hero's own
  // button has scrolled away. On a reading page the page's own primary leads,
  // so the header's is an outline, and on phones it waits in the menu, which
  // leaves the wordmark its place.
  const openApp = <OpenAppLink variant={onHome ? 'default' : 'outline'} />;

  return (
    <header className="glass sticky top-0 z-40 border-b border-rule">
      <div className="site-container flex h-16 items-center gap-3 lg:gap-8">
        <Link
          href="/"
          aria-label={t('brand.homeLabel')}
          className="inline-flex min-h-11 shrink-0 items-center no-underline"
        >
          {/* On the home page's phones the name yields its place to "Open the app" once it appears. */}
          <Wordmark
            size="md"
            nameClassName={cn('max-[359px]:hidden', onHome && pastHero && 'max-sm:hidden')}
          />
        </Link>

        <nav ref={navRef} aria-label={t('primaryLabel')} className="hidden min-w-0 flex-1 lg:block">
          <ul ref={listRef} className="flex items-center gap-1">
            {[...anchorLinks, ...pageLinks].map((link, index) => (
              <li
                key={link.key}
                className={cn(
                  index < anchorLinks.length && (anchorsCrowded ? 'hidden' : 'hidden xl:block'),
                  index === anchorLinks.length &&
                    !anchorsCrowded &&
                    'xl:ml-3 xl:border-l xl:border-rule-faint xl:pl-3',
                )}
              >
                <Link
                  href={link.href}
                  aria-current={link.current}
                  className={cn(
                    'relative inline-flex h-9 items-center whitespace-nowrap rounded-control px-3 text-sm no-underline transition-colors duration-150',
                    link.current
                      ? 'text-foreground after:absolute after:inset-x-3 after:-bottom-[0.875rem] after:h-0.5 after:rounded-t-pill after:bg-primary'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <ThemeSwitcher />
            <LanguageSwitcher variant="compact" />
          </div>
          {pastHero ? (
            <div
              className={cn(
                'animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none',
                !onHome && 'max-sm:hidden',
              )}
            >
              {openApp}
            </div>
          ) : null}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t('menuLabel')}
                className="-mr-2 inline-flex size-11 items-center justify-center rounded-control text-foreground transition-colors duration-150 hover:bg-muted lg:hidden"
              >
                <Menu aria-hidden className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className="flex w-[min(20rem,100vw)] flex-col gap-0 border-l border-rule bg-background p-0"
            >
              <SheetTitle className="sr-only">{t('drawerTitle')}</SheetTitle>
              <div className="flex h-16 items-center border-b border-rule-faint pl-4 pr-16">
                <Wordmark size="md" />
              </div>
              <nav
                aria-label={t('primaryLabel')}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
              >
                <ul className="flex flex-col">
                  {[...anchorLinks, ...pageLinks].map((link, index) => (
                    <li
                      key={link.key}
                      className={cn(
                        index === anchorLinks.length && 'mt-2 border-t border-rule-faint pt-2',
                      )}
                    >
                      <Link
                        href={link.href}
                        aria-current={link.current}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'flex min-h-11 items-center rounded-control px-2 text-sm no-underline transition-colors duration-150 hover:bg-muted',
                          link.current ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 px-2">{openApp}</div>
              </nav>
              <div className="border-t border-rule-faint px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
                <p className="type-eyebrow text-subtle">{t('drawer.preferences')}</p>
                <PalettePicker className="mt-1 -ml-2.5" />
                <LanguageSwitcher variant="select" className="mt-2 w-full" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
