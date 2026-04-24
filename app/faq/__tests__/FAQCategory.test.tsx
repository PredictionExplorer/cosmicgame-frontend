import userEvent from '@testing-library/user-event';
import { Rocket } from 'lucide-react';

import { render, screen, checkA11y } from '@/test-utils';

import type { FAQCategory } from '../data/faq-data';
import { FAQCategorySection } from '../components/FAQCategory';

const mockCategory: FAQCategory = {
  id: 'test-cat',
  title: 'Test Category',
  description: 'Test description',
  icon: Rocket,
  items: [
    {
      id: 'q1',
      question: 'What is a Calibration Window?',
      answer: 'A Calibration Window descends the Gesture Cost over time.',
    },
    {
      id: 'q2',
      question: 'How does Anchoring work?',
      answer: 'Anchoring pays a share of each cycle distribution.',
    },
    {
      id: 'q3',
      question: 'What is an Endurance Champion?',
      answer: 'The longest-interval most-recent gesture maker.',
      hashAnchor: 'endurance-champion',
    },
  ],
};

jest.mock('framer-motion', () => {
  const React = require('react');
  const cache: Record<string, React.ForwardRefExoticComponent<unknown>> = {};
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          if (!cache[prop]) {
            const Comp = React.forwardRef(function MotionProxy(
              props: Record<string, unknown>,
              ref: React.Ref<HTMLElement>,
            ) {
              const {
                initial: _i,
                animate: _a,
                whileInView: _w,
                viewport: _v,
                transition: _t,
                variants: _va,
                custom: _c,
                ...rest
              } = props;
              return React.createElement(prop, { ...rest, ref });
            });
            Comp.displayName = `motion.${prop}`;
            cache[prop] = Comp;
          }
          return cache[prop];
        },
      },
    ),
  };
});

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

function renderFAQCategory(
  props: {
    category?: FAQCategory;
    searchQuery?: string;
    expandedItems?: string[];
    onItemToggle?: (categoryId: string, itemId: string) => void;
    onExpandAll?: (categoryId: string) => void;
  } = {},
) {
  const {
    category = mockCategory,
    searchQuery = '',
    expandedItems = [],
    onItemToggle = jest.fn(),
    onExpandAll = jest.fn(),
  } = props;
  return render(
    <FAQCategorySection
      category={category}
      searchQuery={searchQuery}
      expandedItems={expandedItems}
      onItemToggle={onItemToggle}
      onExpandAll={onExpandAll}
    />,
  );
}

describe('FAQCategorySection', () => {
  it('renders category title and description', () => {
    renderFAQCategory();
    expect(screen.getByRole('heading', { name: 'Test Category' })).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders all questions in the category', () => {
    renderFAQCategory();
    expect(screen.getByText('What is a Calibration Window?')).toBeInTheDocument();
    expect(screen.getByText('How does Anchoring work?')).toBeInTheDocument();
    expect(screen.getByText('What is an Endurance Champion?')).toBeInTheDocument();
  });

  it('expands items that are in expandedItems', () => {
    renderFAQCategory({ expandedItems: ['q1', 'q3'] });
    const q1Content = document.getElementById('q1')?.closest('[data-state]');
    const q3Content = document.getElementById('endurance-champion')?.closest('[data-state]');
    expect(q1Content).toHaveAttribute('data-state', 'open');
    expect(q3Content).toHaveAttribute('data-state', 'open');
  });

  it('calls onItemToggle when accordion item is toggled', async () => {
    const user = userEvent.setup();
    const onItemToggle = jest.fn();
    renderFAQCategory({ expandedItems: [], onItemToggle });
    const trigger = screen.getByRole('button', { name: 'What is a Calibration Window?' });
    await user.click(trigger);
    expect(onItemToggle).toHaveBeenCalledWith('test-cat', 'q1');
  });

  it('calls onExpandAll when "Expand All" button is clicked', async () => {
    const user = userEvent.setup();
    const onExpandAll = jest.fn();
    renderFAQCategory({ expandedItems: [], onExpandAll });
    const expandBtn = screen.getByRole('button', {
      name: 'Expand all questions',
    });
    await user.click(expandBtn);
    expect(onExpandAll).toHaveBeenCalledWith('test-cat');
  });

  it('shows "Collapse All" when all items are expanded', () => {
    renderFAQCategory({
      expandedItems: ['q1', 'q2', 'q3'],
    });
    expect(screen.getByRole('button', { name: 'Collapse all questions' })).toBeInTheDocument();
  });

  it('filters items based on searchQuery', () => {
    renderFAQCategory({ searchQuery: 'Calibration' });
    expect(
      screen.getByRole('button', { name: /What is a Calibration Window\?/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /How does Anchoring work\?/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /What is an Endurance Champion\?/ }),
    ).not.toBeInTheDocument();
  });

  it('returns null when searchQuery matches nothing in this category', () => {
    const { container } = renderFAQCategory({ searchQuery: 'xyznonexistent' });
    expect(container.firstChild).toBeNull();
  });

  it('highlights search matches with mark elements', () => {
    renderFAQCategory({ searchQuery: 'Calibration' });
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0]).toHaveTextContent(/Calibration/i);
  });

  it('renders "Copy link" button in expanded items', async () => {
    renderFAQCategory({ expandedItems: ['q1'] });
    const copyBtn = screen.getByRole('button', { name: 'Copy link to this question' });
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveTextContent('Copy link');
  });

  it('renders tooltips for technical terms when not searching', () => {
    renderFAQCategory({ searchQuery: '', expandedItems: ['q1'] });
    const tooltipTrigger = document
      .querySelector('[data-state]')
      ?.querySelector('span[class*="cursor-help"]');
    expect(tooltipTrigger).toBeInTheDocument();
  });

  it('sets correct id attribute for deep linking', () => {
    renderFAQCategory();
    expect(document.getElementById('q1')).toBeInTheDocument();
    expect(document.getElementById('q2')).toBeInTheDocument();
    expect(document.getElementById('endurance-champion')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderFAQCategory({ expandedItems: ['q1'] });
    await checkA11y(container);
  });
});
