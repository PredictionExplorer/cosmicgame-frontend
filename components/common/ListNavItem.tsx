'use client';

import type { FC } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavDescriptor } from '@/config/nav';

interface ListNavItemProps {
  nav: NavDescriptor;
}

const pillClasses = (isActive: boolean) =>
  cn(
    'group inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium leading-none tracking-[0.015em] outline-none transition-colors duration-[var(--duration-fast)]',
    isActive
      ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
      : 'text-white/65 hover:bg-white/[0.05] hover:text-white',
  );

const isExternalRoute = (route?: string) => !!route && /^https?:\/\//.test(route);

/** A single row inside a nav panel: icon tile + title + supporting copy. */
const PanelRow: FC<{ item: NavDescriptor; active: boolean }> = ({ item, active }) => {
  const Icon = item.icon;
  const content = (
    <>
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-[var(--duration-fast)]',
          active
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-white/[0.07] bg-white/[0.04] text-white/55 group-data-[highlighted]/row:border-primary/30 group-data-[highlighted]/row:text-primary',
        )}
        aria-hidden
      >
        {Icon ? (
          <Icon className="h-4 w-4" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium leading-tight',
            active ? 'text-primary' : 'text-white',
          )}
        >
          {item.title}
          {item.external ? (
            <ArrowUpRight className="h-3 w-3 shrink-0 text-white/35" aria-hidden />
          ) : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 text-xs leading-snug text-white/45">{item.description}</span>
        ) : null}
      </span>
    </>
  );

  const rowClassName =
    'group/row flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 no-underline outline-none transition-colors duration-[var(--duration-fast)] data-[highlighted]:bg-white/[0.05]';

  return (
    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
      {isExternalRoute(item.route) ? (
        <a href={item.route} rel="noopener" className={rowClassName}>
          {content}
        </a>
      ) : (
        <Link href={item.route ?? '#'} className={rowClassName}>
          {content}
        </Link>
      )}
    </DropdownMenuItem>
  );
};

/** Featured rows render as a highlighted card pinned to the panel footer. */
const PanelFeaturedRow: FC<{ item: NavDescriptor }> = ({ item }) => {
  const Icon = item.icon;
  const card = (
    <>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium leading-tight text-white">{item.title}</span>
        {item.description ? (
          <span className="mt-0.5 text-xs leading-snug text-white/55">{item.description}</span>
        ) : null}
      </span>
      <ArrowUpRight
        className="ml-auto h-4 w-4 shrink-0 text-white/45 transition-transform duration-[var(--duration-fast)] group-data-[highlighted]/card:translate-x-0.5 group-data-[highlighted]/card:-translate-y-0.5 group-data-[highlighted]/card:text-white"
        aria-hidden
      />
    </>
  );

  return (
    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
      <a
        href={item.route}
        rel="noopener"
        className="group/card relative mt-1.5 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[linear-gradient(120deg,rgb(var(--aurora-cyan-rgb)/0.07),rgb(var(--nebula-violet-rgb)/0.14))] px-3 py-3 no-underline outline-none transition-colors duration-[var(--duration-fast)] data-[highlighted]:border-[rgb(var(--aurora-cyan-rgb)/0.35)]"
      >
        {card}
      </a>
    </DropdownMenuItem>
  );
};

const ListNavItem: FC<ListNavItemProps> = ({ nav }) => {
  const pathname = usePathname();

  const isActive =
    nav.route && nav.route !== '#'
      ? pathname === nav.route
      : (nav.children?.some(
          (c) => c.route && !isExternalRoute(c.route) && pathname.startsWith(c.route),
        ) ?? false);

  if (!nav.children) {
    return (
      <Link href={nav.route ?? '#'} className={pillClasses(isActive)}>
        {nav.title}
      </Link>
    );
  }

  const rows = nav.children.filter((c) => !c.featured);
  const featured = nav.children.filter((c) => c.featured);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          pillClasses(isActive),
          'data-[state=open]:bg-white/[0.08] data-[state=open]:text-white',
        )}
      >
        {nav.title}
        <ChevronDown
          className="h-3.5 w-3.5 text-white/40 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={14}
        className="w-[300px] rounded-2xl border-white/[0.08] bg-popover/95 p-2 shadow-[var(--elevation-4)] backdrop-blur-2xl"
      >
        {rows.map((child, i) => {
          const childActive = !!(
            child.route &&
            !isExternalRoute(child.route) &&
            pathname.startsWith(child.route)
          );
          return <PanelRow key={i} item={child} active={childActive} />;
        })}
        {featured.map((child, i) => (
          <PanelFeaturedRow key={`featured-${i}`} item={child} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ListNavItem;
