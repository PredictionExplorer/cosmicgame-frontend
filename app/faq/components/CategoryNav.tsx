'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';

import { cn } from '@/lib/utils';

import { type FAQCategory } from '../data/faq-data';

interface CategoryNavProps {
  categories: FAQCategory[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string | null) => void;
  className?: string;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryClick,
  className,
}: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsSticky(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: '-1px 0px 0px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (categoryId: string | null) => {
    onCategoryClick(categoryId);
    if (categoryId) {
      const el = document.getElementById(`faq-category-${categoryId}`);
      if (el) {
        const offset = 140;
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div ref={navRef} className={cn('sticky top-[72px] z-30', className)}>
      <nav
        aria-label="FAQ categories"
        className={cn(
          'mx-auto -mx-4 overflow-x-auto px-4 py-3 transition-all duration-300 scrollbar-none',
          isSticky && 'border-b border-white/[0.06] bg-background/90 backdrop-blur-xl',
        )}
      >
        <div className="flex items-center gap-2 min-w-max mx-auto justify-center">
          <button
            onClick={() => scrollToCategory(null)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
              activeCategory === null
                ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            All
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.title}
                <span className="ml-0.5 text-[10px] opacity-60">{cat.items.length}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
