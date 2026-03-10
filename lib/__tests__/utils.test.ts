import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles a single class name', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('handles false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('handles conditional classes via logical AND', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn(isActive && 'active', isDisabled && 'disabled', 'base')).toBe('active base');
  });

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('handles object inputs for conditional classes', () => {
    expect(cn({ active: true, disabled: false, visible: true })).toBe('active visible');
  });

  it('merges conflicting Tailwind padding classes (last wins)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('merges conflicting Tailwind margin classes', () => {
    expect(cn('m-2', 'm-6')).toBe('m-6');
  });

  it('merges conflicting Tailwind text color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('merges conflicting Tailwind background color classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('p-4', 'mx-2', 'text-sm')).toBe('p-4 mx-2 text-sm');
  });

  it('merges conflicting Tailwind display classes', () => {
    expect(cn('block', 'flex')).toBe('flex');
  });

  it('merges conflicting font-size classes', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('handles mixed non-tailwind and tailwind classes', () => {
    const result = cn('custom-class', 'p-4', 'p-8');
    expect(result).toContain('custom-class');
    expect(result).toContain('p-8');
    expect(result).not.toContain('p-4');
  });

  it('does not deduplicate non-Tailwind custom classes', () => {
    expect(cn('foo', 'foo')).toBe('foo foo');
  });

  it('deduplicates identical Tailwind classes', () => {
    expect(cn('flex', 'flex')).toBe('flex');
  });

  it('handles complex nested arrays and objects', () => {
    const result = cn('base', ['array-class', { 'nested-conditional': true }], {
      'top-level-conditional': false,
    });
    expect(result).toContain('base');
    expect(result).toContain('array-class');
    expect(result).toContain('nested-conditional');
    expect(result).not.toContain('top-level-conditional');
  });
});
