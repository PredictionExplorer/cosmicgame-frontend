'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { MainWrapper } from '@/components/styled';
import { SectionDivider } from '@/components/ui/section-divider';

import { faqCategories, findItemByHash, getTotalQuestionCount } from './data/faq-data';
import { HeroSection } from './components/HeroSection';
import { PopularQuestions } from './components/PopularQuestions';
import { CategoryNav } from './components/CategoryNav';
import { FAQCategorySection } from './components/FAQCategory';
import { ContactCTA } from './components/ContactCTA';

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const FAQPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());
  const hasHandledHash = useRef(false);

  const debouncedSearch = useDebounce(searchInput, 200);
  const totalCount = getTotalQuestionCount();

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return faqCategories;
    const q = debouncedSearch.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [debouncedSearch]);

  const resultCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories],
  );

  useEffect(() => {
    if (hasHandledHash.current) return;
    if (typeof window === 'undefined' || !window.location.hash) return;
    hasHandledHash.current = true;

    const result = findItemByHash(window.location.hash);
    if (!result) return;

    setExpandedItems([result.item.id]);
    setActiveCategory(result.category.id);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const anchor = result.item.hashAnchor || result.item.id;
        const el = document.getElementById(anchor);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    });
  }, []);

  useEffect(() => {
    const refs = categoryRefs.current;
    if (debouncedSearch.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('faq-category-', '');
            setActiveCategory(id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    for (const el of refs.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [debouncedSearch]);

  const handleItemToggle = useCallback((categoryId: string, itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  }, []);

  const handleExpandAll = useCallback((categoryId: string) => {
    const cat = faqCategories.find((c) => c.id === categoryId);
    if (!cat) return;

    setExpandedItems((prev) => {
      const catItemIds = cat.items.map((item) => item.id);
      const allExpanded = catItemIds.every((id) => prev.includes(id));
      if (allExpanded) {
        return prev.filter((id) => !catItemIds.includes(id));
      }
      return [...new Set([...prev, ...catItemIds])];
    });
  }, []);

  const handlePopularClick = useCallback((itemId: string, categoryId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    setActiveCategory(categoryId);

    requestAnimationFrame(() => {
      const el = document.getElementById(itemId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }, []);

  const setCategoryRef = useCallback(
    (categoryId: string) => (el: HTMLElement | null) => {
      if (el) {
        categoryRefs.current.set(categoryId, el);
      } else {
        categoryRefs.current.delete(categoryId);
      }
    },
    [],
  );

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <TooltipProvider delayDuration={150}>
      <MainWrapper>
        <HeroSection
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          resultCount={resultCount}
          totalCount={totalCount}
          categoryCount={faqCategories.length}
        />

        {!isSearching && (
          <>
            <SectionDivider />
            <PopularQuestions onQuestionClick={handlePopularClick} />
          </>
        )}

        <SectionDivider />

        {!isSearching && (
          <CategoryNav
            categories={faqCategories}
            activeCategory={activeCategory}
            onCategoryClick={setActiveCategory}
          />
        )}

        <div className="mt-6 space-y-12">
          {filteredCategories.map((cat) => (
            <FAQCategorySection
              key={cat.id}
              ref={setCategoryRef(cat.id)}
              category={cat}
              searchQuery={debouncedSearch}
              expandedItems={expandedItems}
              onItemToggle={handleItemToggle}
              onExpandAll={handleExpandAll}
            />
          ))}

          {isSearching && filteredCategories.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">No questions found</p>
              <p className="mt-2 text-sm text-muted-foreground/60">
                Try a different search term or{' '}
                <button
                  onClick={() => setSearchInput('')}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  clear the search
                </button>
              </p>
            </div>
          )}
        </div>

        <SectionDivider className="mt-12" />
        <ContactCTA />
      </MainWrapper>
    </TooltipProvider>
  );
};

export default FAQPage;
