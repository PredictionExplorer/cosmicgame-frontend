import { linkifyMessage } from '@/utils/linkify';

describe('linkifyMessage', () => {
  it('returns an empty array for empty text', () => {
    expect(linkifyMessage('')).toEqual([]);
  });

  it('returns a single text segment when there is no URL', () => {
    expect(linkifyMessage('gm cosmos, enjoy the cycle everyone')).toEqual([
      { type: 'text', value: 'gm cosmos, enjoy the cycle everyone' },
    ]);
  });

  it('splits text around an https URL', () => {
    expect(linkifyMessage('check https://example.com/page for details')).toEqual([
      { type: 'text', value: 'check ' },
      { type: 'url', value: 'https://example.com/page', href: 'https://example.com/page' },
      { type: 'text', value: ' for details' },
    ]);
  });

  it('links http URLs', () => {
    expect(linkifyMessage('http://example.com')).toEqual([
      { type: 'url', value: 'http://example.com', href: 'http://example.com' },
    ]);
  });

  it('prefixes bare www hosts with https', () => {
    expect(linkifyMessage('visit www.example.com today')).toEqual([
      { type: 'text', value: 'visit ' },
      { type: 'url', value: 'www.example.com', href: 'https://www.example.com' },
      { type: 'text', value: ' today' },
    ]);
  });

  it('does not linkify URLs embedded in another word', () => {
    expect(linkifyMessage('awww.example.com xhttps://example.com')).toEqual([
      { type: 'text', value: 'awww.example.com xhttps://example.com' },
    ]);
  });

  it('keeps sentence punctuation out of the link', () => {
    expect(linkifyMessage('read https://example.com/a.')).toEqual([
      { type: 'text', value: 'read ' },
      { type: 'url', value: 'https://example.com/a', href: 'https://example.com/a' },
      { type: 'text', value: '.' },
    ]);

    expect(linkifyMessage('really? https://example.com!?')).toEqual([
      { type: 'text', value: 'really? ' },
      { type: 'url', value: 'https://example.com', href: 'https://example.com' },
      { type: 'text', value: '!?' },
    ]);
  });

  it('trims unbalanced closing brackets but keeps balanced ones', () => {
    expect(linkifyMessage('(see https://en.wikipedia.org/wiki/Foo_(bar))')).toEqual([
      { type: 'text', value: '(see ' },
      {
        type: 'url',
        value: 'https://en.wikipedia.org/wiki/Foo_(bar)',
        href: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      },
      { type: 'text', value: ')' },
    ]);
  });

  it('linkifies multiple URLs in one message', () => {
    expect(linkifyMessage('https://a.example and https://b.example')).toEqual([
      { type: 'url', value: 'https://a.example', href: 'https://a.example' },
      { type: 'text', value: ' and ' },
      { type: 'url', value: 'https://b.example', href: 'https://b.example' },
    ]);
  });

  it('handles URLs across multiline messages', () => {
    expect(linkifyMessage('line one\nhttps://example.com\nline three')).toEqual([
      { type: 'text', value: 'line one\n' },
      { type: 'url', value: 'https://example.com', href: 'https://example.com' },
      { type: 'text', value: '\nline three' },
    ]);
  });

  it('never linkifies non-http schemes', () => {
    expect(linkifyMessage('javascript:alert(1)')).toEqual([
      { type: 'text', value: 'javascript:alert(1)' },
    ]);
    expect(linkifyMessage('ftp://example.com file')).toEqual([
      { type: 'text', value: 'ftp://example.com file' },
    ]);
  });

  it('rejects hosts without a dotted public domain', () => {
    expect(linkifyMessage('http://localhost:3000 is local')).toEqual([
      { type: 'text', value: 'http://localhost:3000 is local' },
    ]);
    expect(linkifyMessage('go to www. now')).toEqual([{ type: 'text', value: 'go to www. now' }]);
  });

  it('keeps query strings and fragments in the link', () => {
    expect(linkifyMessage('https://example.com/p?a=1&b=2#frag')).toEqual([
      {
        type: 'url',
        value: 'https://example.com/p?a=1&b=2#frag',
        href: 'https://example.com/p?a=1&b=2#frag',
      },
    ]);
  });
});
