'use client';

import { useState, type FC } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from '@/components/styled';
import { NavDescriptor } from '@/config/nav';

interface ListNavItemProps {
  nav: NavDescriptor;
}

const ListNavItem: FC<ListNavItemProps> = ({ nav }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive =
    nav.route && nav.route !== '#'
      ? pathname === nav.route
      : (nav.children?.some((c) => c.route && pathname.startsWith(c.route)) ?? false);

  return (
    <div className="ml-6">
      {nav.children ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              'flex cursor-pointer items-center text-sm font-medium uppercase outline-none transition-colors hover:text-white',
              isActive ? 'text-white' : 'text-white/70',
            )}
          >
            {nav.title}
            {open ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {nav.children.map((child, i) => {
              const childActive = child.route ? pathname.startsWith(child.route) : false;
              return (
                <DropdownMenuItem key={i} className="min-w-[166px] cursor-pointer p-0">
                  <NavLink
                    href={child.route}
                    className={cn('w-full px-2 py-1.5', childActive && 'text-primary')}
                  >
                    {child.title}
                  </NavLink>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <NavLink
          href={nav.route}
          className={cn(
            'text-sm font-medium transition-colors',
            isActive ? 'text-white' : 'text-white/70 hover:text-white',
          )}
        >
          {nav.title}
        </NavLink>
      )}
    </div>
  );
};

export default ListNavItem;
