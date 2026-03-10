import { useState, type FC } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { NavLink } from '@/components/styled';
import { NavDescriptor } from '@/config/nav';

interface NestedListItemProps {
  nav: NavDescriptor;
}

const NestedListItem: FC<NestedListItemProps> = ({ nav }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <>
      {nav.children ? (
        <div
          role="button"
          tabIndex={0}
          className="flex w-full cursor-pointer items-center px-4 py-2 transition-colors hover:bg-white/5"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleToggle();
          }}
          aria-expanded={open}
        >
          <span className="flex w-full items-center text-base uppercase text-white">
            {nav.title}
            {open ? (
              <ChevronUp className="ml-auto h-4 w-4" />
            ) : (
              <ChevronDown className="ml-auto h-4 w-4" />
            )}
          </span>
        </div>
      ) : (
        <div className="flex items-center px-4 py-2 transition-colors hover:bg-white/5">
          <NavLink href={nav.route}>{nav.title}</NavLink>
        </div>
      )}

      {nav.children && (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            {nav.children.map((child, i) => (
              <div
                key={i}
                className="flex items-center py-2 pl-8 transition-colors hover:bg-white/5"
              >
                <NavLink href={child.route}>{child.title}</NavLink>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NestedListItem;
