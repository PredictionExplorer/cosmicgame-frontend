import { contributionPayload, isNoteUrl, parseContributionNote } from '../contributionNote';

describe('isNoteUrl', () => {
  it('accepts only an empty link or an http(s) one', () => {
    expect(isNoteUrl('')).toBe(true);
    expect(isNoteUrl('https://example.com/a')).toBe(true);
    expect(isNoteUrl('http://example.com')).toBe(true);
    expect(isNoteUrl('example.com')).toBe(false);
    expect(isNoteUrl('javascript:alert(1)')).toBe(false);
    expect(isNoteUrl('ipfs://cid')).toBe(false);
  });
});

describe('contributionPayload', () => {
  it('builds the JSON the record page reads, or null for an empty note', () => {
    expect(contributionPayload({ title: ' ', message: '', url: '' })).toBeNull();
    expect(contributionPayload({ title: 'Hi', message: '', url: 'https://a.b' })).toBe(
      '{"title":"Hi","url":"https://a.b"}',
    );
  });
});

describe('parseContributionNote', () => {
  it('reads the form note, trimming its fields', () => {
    expect(
      parseContributionNote(
        '{"title":" Public goods ","message":"Keep building","url":"https://a.b"}',
      ),
    ).toEqual({
      kind: 'note',
      title: 'Public goods',
      message: 'Keep building',
      url: 'https://a.b',
    });
  });

  it('never makes a non-http(s) link clickable', () => {
    expect(parseContributionNote('{"message":"Hi","url":"javascript:alert(1)"}')).toEqual({
      kind: 'note',
      title: null,
      message: 'Hi',
      url: null,
    });
  });

  it('shows a note that is not the form JSON as stored instead of dropping it', () => {
    expect(parseContributionNote('gm, builders')).toEqual({ kind: 'raw', text: 'gm, builders' });
    expect(parseContributionNote('{"name":"Alice"}')).toEqual({
      kind: 'raw',
      text: '{"name":"Alice"}',
    });
    expect(parseContributionNote('[1,2]')).toEqual({ kind: 'raw', text: '[1,2]' });
  });

  it('has nothing to show for an empty note', () => {
    expect(parseContributionNote('')).toEqual({ kind: 'none' });
    expect(parseContributionNote(undefined)).toEqual({ kind: 'none' });
  });
});
