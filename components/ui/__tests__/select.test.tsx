import '@testing-library/jest-dom';

import { itemHighlight } from '@/components/ui/item-highlight';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { render, screen } from '@/test-utils';

beforeAll(() => {
  // Radix Select scrolls the selected option into view and captures the
  // pointer; jsdom implements neither.
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.hasPointerCapture = jest.fn(() => false);
  Element.prototype.releasePointerCapture = jest.fn();
});

function renderSelect(open: boolean) {
  return render(
    <Select open={open} value="newest" onValueChange={() => undefined}>
      <SelectTrigger aria-label="Sort">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe('Select', () => {
  it('marks the highlighted option with its own indicator, independent of the focus ring', () => {
    renderSelect(true);
    const option = screen.getByRole('option', { name: 'Oldest first' });
    for (const token of itemHighlight.split(' ')) {
      expect(option).toHaveClass(token);
    }
    expect(option.className).toMatch(/data-\[highlighted\]:shadow-\[inset_2px/);
    expect(option.className).not.toMatch(/focus:bg-accent/);
  });

  it('keeps the trigger at 16px on phones so iOS does not zoom', () => {
    renderSelect(false);
    const trigger = screen.getByRole('combobox', { name: 'Sort' });
    expect(trigger).toHaveClass('text-base', 'sm:text-sm', 'border-input');
  });
});
