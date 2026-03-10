import { useState, type FC } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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

  return (
    <div className="ml-6">
      {nav.children ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="flex cursor-pointer items-center text-base uppercase text-white outline-none hover:underline">
            {nav.title}
            {open ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {nav.children.map((child, i) => (
              <DropdownMenuItem key={i} className="min-w-[166px] cursor-pointer p-0">
                <NavLink href={child.route} className="w-full px-2 py-1.5">
                  {child.title}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <NavLink href={nav.route}>{nav.title}</NavLink>
      )}
    </div>
  );
};

export default ListNavItem;
