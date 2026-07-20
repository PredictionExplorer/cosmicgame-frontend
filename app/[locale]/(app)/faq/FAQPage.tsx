'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  faqContentEn,
  findFaqItemByHash,
  findFaqItemById,
  getTotalFaqQuestionCount,
  type FAQContent,
} from '@/content/faq';

import { PageShell } from '@/components/ui/page-shell';
import { SectionDivider } from '@/components/ui/section-divider';

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

interface FAQPageProps {
  content?: FAQContent;
}

const FAQPage = ({ content = faqContentEn }: FAQPageProps) => {
  const t = useTranslations('faq');
  const [searchInput, setSearchInput] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());

  const debouncedSearch = useDebounce(searchInput, 200);
  const totalCount = getTotalFaqQuestionCount(content);
  const { categories } = content;

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, debouncedSearch]);

  const resultCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const openHashTarget = () => {
      if (!window.location.hash) return;
      const result = findFaqItemByHash(content, window.location.hash);
      if (!result) return;

      requestAnimationFrame(() => {
        setExpandedItems((current) =>
          current.includes(result.item.id) ? current : [...current, result.item.id],
        );
        setActiveCategory(result.category.id);

        setTimeout(() => {
          const anchor = result.item.hashAnchor ?? result.item.id;
          const el = document.getElementById(anchor);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      });
    };

    openHashTarget();
    window.addEventListener('hashchange', openHashTarget);
    return () => window.removeEventListener('hashchange', openHashTarget);
  }, [content]);

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

  const handleItemToggle = useCallback((_categoryId: string, itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  }, []);

  const handleExpandAll = useCallback(
    (categoryId: string) => {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;

      setExpandedItems((prev) => {
        const catItemIds = cat.items.map((item) => item.id);
        const allExpanded = catItemIds.every((id) => prev.includes(id));
        if (allExpanded) {
          return prev.filter((id) => !catItemIds.includes(id));
        }
        return [...new Set([...prev, ...catItemIds])];
      });
    },
    [categories],
  );

  const handlePopularClick = useCallback(
    (itemId: string, categoryId: string) => {
      const resolved = findFaqItemById(content, itemId);
      const anchor = resolved?.item.hashAnchor ?? itemId;

      setExpandedItems((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
      setActiveCategory(categoryId);

      requestAnimationFrame(() => {
        const el = document.getElementById(anchor);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    },
    [content],
  );

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
    <PageShell variant="marketing" backdrop="signature">
      <HeroSection
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        resultCount={resultCount}
        totalCount={totalCount}
        categoryCount={categories.length}
      />

      {!isSearching && (
        <>
          <SectionDivider />
          <PopularQuestions content={content} onQuestionClick={handlePopularClick} />
        </>
      )}

      <SectionDivider />

      {!isSearching && (
        <CategoryNav
          categories={categories}
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
            <p className="text-lg font-medium text-muted-foreground">{t('empty.heading')}</p>
            <p className="mt-2 text-sm text-muted-foreground/60">
              {t('empty.descriptionPrefix')}{' '}
              <button
                onClick={() => setSearchInput('')}
                className="text-primary underline-offset-2 hover:underline"
              >
                {t('empty.clearAction')}
              </button>
            </p>
          </div>
        )}
      </div>

      <SectionDivider className="mt-12" />
      <ContactCTA />
    </PageShell>
  );
};

export default FAQPage;
