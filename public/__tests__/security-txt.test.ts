import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SUPPORT_EMAIL } from '@/content/legal/links';

/**
 * public/.well-known/security.txt (RFC 9116): the vulnerability contact the
 * Security page publishes, served as a static file on both hosts (proxy.ts
 * leaves `/.well-known` alone).
 */
const text = readFileSync(join(process.cwd(), 'public/.well-known/security.txt'), 'utf8');

function fields(name: string): string[] {
  return text
    .split('\n')
    .filter((line) => line.startsWith(`${name}: `))
    .map((line) => line.slice(name.length + 2).trim());
}

describe('security.txt', () => {
  it('names the contact the Security page gives', () => {
    expect(fields('Contact')).toEqual([`mailto:${SUPPORT_EMAIL}`]);
    expect(fields('Policy')).toEqual(['https://app.cosmicsignature.com/security#report']);
  });

  it('is canonical on both hosts', () => {
    expect(fields('Canonical')).toEqual([
      'https://app.cosmicsignature.com/.well-known/security.txt',
      'https://cosmicsignature.com/.well-known/security.txt',
    ]);
  });

  it('has not expired (RFC 9116 asks for renewal at most a year ahead)', () => {
    const [expires] = fields('Expires');
    const at = Date.parse(expires ?? '');
    expect(Number.isNaN(at)).toBe(false);
    if (at <= Date.now()) {
      throw new Error('public/.well-known/security.txt has expired: renew its Expires field.');
    }
  });

  it('is not rewritten by the host proxy', () => {
    const proxy = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');
    expect(proxy).toContain('\\\\.well-known');
  });
});
