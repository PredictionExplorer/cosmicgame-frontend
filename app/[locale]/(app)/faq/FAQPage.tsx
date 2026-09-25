'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookA } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { findFaqItemByHash, findFaqItemById, getTotalFaqQuestionCount } from '@/content/faq/lookup';
import type { FAQContent } from '@/content/faq/types';

import { jumpToSection, sectionScrollBehavior } from '@/lib/jumpToSection';
import { PageShell } from '@/components/ui/page-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

import { HeroSection } from './components/HeroSection';
import { PopularQuestions } from './components/PopularQuestions';
import { CategoryNav, categoryAnchor, type CategoryNavEntry } from './components/CategoryNav';
import { FAQCategorySection } from './components/FAQCategory';
import { FAQGlossary, GLOSSARY_ENTRY_ID } from './components/FAQGlossary';
import { ContactCTA } from './components/ContactCTA';
import { FAQ_ICONS } from './components/faqIcons';
import { matchesQuery } from './components/answerText';

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Scrolls an element to the top of the reading area; its scroll-margin clears the sticky bars. */
function scrollToElement(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: sectionScrollBehavior(), block: 'start' });
}

/** The button that opens and closes a question (the accordion trigger in its header). */
function questionTrigger(anchor: string): HTMLElement | null {
  return document.getElementById(anchor)?.querySelector<HTMLElement>('h3 button') ?? null;
}

interface FAQPageProps {
  content: FAQContent;
}

/**
 * The FAQ as a documentation page: the header with search, the popular
 * questions, then a contents rail (a sticky column from `lg`, a sticky chip
 * row below it) beside the categories and the glossary. Answers are closed
 * by default and open in place from a popular question, a shared `#link`,
 * find-in-page or "Expand all"; a search opens every matching answer. A
 * jump from the contents or a popular question moves keyboard focus with
 * it (to the category heading, or the opened question) and puts the anchor
 * in the address bar, as following the link itself would.
 */
const FAQPage = ({ content }: FAQPageProps) => {
  const t = useTranslations('faq');
  const [searchInput, setSearchInput] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const typedSearch = useDebounce(searchInput, 200);
  // Typing is debounced; clearing (the clear button, a deep link) applies at once.
  const debouncedSearch = searchInput.trim() ? typedSearch : '';
  const totalCount = getTotalFaqQuestionCount(content);
  const { categories } = content;
  const isSearching = debouncedSearch.trim().length > 0;

  // The same matcher as each category's list and highlight (answerText), so
  // the count, the empty state and the rendered answers always agree.
  const filteredCategories = useMemo(() => {
    if (!isSearching) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            matchesQuery(item.question, debouncedSearch) ||
            matchesQuery(item.answer, debouncedSearch),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, debouncedSearch, isSearching]);

  const resultCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories],
  );

  const navEntries = useMemo<CategoryNavEntry[]>(
    () => [
      ...categories.map((cat) => ({
        id: cat.id,
        label: cat.title,
        count: cat.items.length,
        icon: FAQ_ICONS[cat.icon],
      })),
      { id: GLOSSARY_ENTRY_ID, label: t('glossary.title'), icon: BookA },
    ],
    [categories, t],
  );

  const openItem = useCallback(
    (itemId: string, categoryId: string, anchor: string, moveFocus = false) => {
      setExpandedItems((current) => (current.includes(itemId) ? current : [...current, itemId]));
      setActiveCategory(categoryId);
      // After the answer has opened, so the scroll lands on its final position.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          // A reader who chose the question continues from it; a link that
          // opened the page only scrolls, and focus stays where it starts.
          if (moveFocus) jumpToSection(anchor, { focus: questionTrigger(anchor) });
          else scrollToElement(anchor);
        }),
      );
    },
    [],
  );

  useEffect(() => {
    const openHashTarget = () => {
      if (!window.location.hash) return;
      const result = findFaqItemByHash(content, window.location.hash);
      if (!result) return;
      // A deep link always shows its question, even if a search would hide it.
      setSearchInput('');
      openItem(result.item.id, result.category.id, result.item.hashAnchor ?? result.item.id);
    };
    openHashTarget();
    window.addEventListener('hashchange', openHashTarget);
    return () => window.removeEventListener('hashchange', openHashTarget);
  }, [content, openItem]);

  // The contents mark the section being read.
  useEffect(() => {
    if (isSearching || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveCategory(visible.target.id.replace('faq-category-', ''));
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    for (const element of sectionRefs.current.values()) observer.observe(element);
    return () => observer.disconnect();
  }, [isSearching]);

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
        const ids = cat.items.map((item) => item.id);
        return ids.every((id) => prev.includes(id))
          ? prev.filter((id) => !ids.includes(id))
          : [...new Set([...prev, ...ids])];
      });
    },
    [categories],
  );

  const handlePopularClick = useCallback(
    (itemId: string, categoryId: string) => {
      const resolved = findFaqItemById(content, itemId);
      openItem(itemId, categoryId, resolved?.item.hashAnchor ?? itemId, true);
    },
    [content, openItem],
  );

  const handleNavSelect = useCallback((id: string) => {
    setActiveCategory(id);
    // Focus lands on the category heading, so the next Tab is its first question.
    jumpToSection(categoryAnchor(id));
  }, []);

  const setSectionRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) sectionRefs.current.set(id, element);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  return (
    <PageShell variant="marketing" backdrop="subtle">
      <HeroSection
        searchValue={searchInput}
        activeQuery={debouncedSearch}
        onSearchChange={setSearchInput}
        resultCount={resultCount}
        totalCount={totalCount}
        categoryCount={categories.length}
      />

      {isSearching ? null : (
        <PopularQuestions content={content} onQuestionClick={handlePopularClick} />
      )}

      {/* The contents is a direct child of this tall container, so it sticks in both shapes. */}
      <div className="lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
        {isSearching ? (
          <div aria-hidden className="hidden lg:block" />
        ) : (
          <CategoryNav
            entries={navEntries}
            activeId={activeCategory}
            onSelect={handleNavSelect}
            className="mb-10 lg:mb-0"
          />
        )}

        <div className="min-w-0">
          <div className="space-y-16 sm:space-y-20">
            {filteredCategories.map((cat) => (
              <FAQCategorySection
                key={cat.id}
                ref={setSectionRef(cat.id)}
                category={cat}
                searchQuery={debouncedSearch}
                expandedItems={expandedItems}
                onItemToggle={handleItemToggle}
                onExpandAll={handleExpandAll}
              />
            ))}

            {isSearching && filteredCategories.length === 0 ? (
              <EmptyState
                headingLevel={2}
                title={t('empty.heading')}
                description={t('empty.description')}
                action={
                  <Button variant="outline" onClick={() => setSearchInput('')}>
                    {t('empty.clearAction')}
                  </Button>
                }
              />
            ) : null}

            {isSearching ? null : <FAQGlossary ref={setSectionRef(GLOSSARY_ENTRY_ID)} />}
          </div>
        </div>
      </div>

      <ContactCTA className="mt-20 sm:mt-24" />
    </PageShell>
  );
};

export default FAQPage;
