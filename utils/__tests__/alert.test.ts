import getErrorMessage from '../alert';

describe('getErrorMessage', () => {
  it('extracts a quoted string from the message', () => {
    expect(getErrorMessage('Error: "insufficient funds"')).toBe('insufficient funds');
  });

  it('extracts the first quoted string when multiple exist', () => {
    expect(getErrorMessage('"first" and "second"')).toBe('first');
  });

  it('returns the full message when regex matches but capture group is empty', () => {
    expect(getErrorMessage('has "" empty quotes')).toBe('');
  });

  it('falls back to colon-split when no quoted string found', () => {
    expect(getErrorMessage('Error: something went wrong')).toBe(' something went wrong');
  });

  it('joins multiple colon segments', () => {
    expect(getErrorMessage('Error: part1: part2')).toBe(' part1: part2');
  });

  it('returns empty string when no quotes and no colon', () => {
    expect(getErrorMessage('plain error')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(getErrorMessage('')).toBe('');
  });

  it('handles a message that is just a colon', () => {
    expect(getErrorMessage(':')).toBe('');
  });

  it('handles message with only a colon prefix', () => {
    expect(getErrorMessage('Error:')).toBe('');
  });

  it('extracts text from nested quotes (first match wins)', () => {
    expect(getErrorMessage('outer "inner "nested""')).toBe('inner ');
  });

  it('returns empty for a message that is only double quotes', () => {
    expect(getErrorMessage('""')).toBe('');
  });

  it('handles colon at the very end of the message', () => {
    expect(getErrorMessage('trailing colon:')).toBe('');
  });
});
