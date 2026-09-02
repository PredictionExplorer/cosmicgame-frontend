import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mergeMessages, NAMESPACES } from '../request';
import { routing } from '../routing';

describe('i18n message loading contract', () => {
  it.each(routing.locales)('has a parseable object catalog for every %s namespace', (locale) => {
    for (const namespace of NAMESPACES) {
      const path = resolve(process.cwd(), 'messages', locale, `${namespace}.json`);
      const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
      expect(parsed).not.toBeNull();
      expect(Array.isArray(parsed)).toBe(false);
      expect(typeof parsed).toBe('object');
    }
  });

  it('deep-merges translated keys over English fallback messages', () => {
    expect(
      mergeMessages(
        {
          common: {
            loading: 'Loading',
            nested: { retry: 'Try again', cancel: 'Cancel' },
          },
        },
        {
          common: {
            loading: '加载中',
            nested: { retry: '重试' },
          },
        },
      ),
    ).toEqual({
      common: {
        loading: '加载中',
        nested: { retry: '重试', cancel: 'Cancel' },
      },
    });
  });

  it('falls back when a translated value is empty', () => {
    expect(mergeMessages({ label: 'English' }, { label: '' })).toEqual({
      label: 'English',
    });
  });
});
