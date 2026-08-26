import { buildCalendarInviteDataUri } from '../calendarInvite';

describe('buildCalendarInviteDataUri', () => {
  it('builds a valid data-URI ics with UTC stamps and escaped text', () => {
    const uri = buildCalendarInviteDataUri({
      uid: 'cosmic-cycle-3-opening',
      title: 'Cycle #3 opens; art, allocations',
      description: 'Line one\nLine two, with comma',
      url: 'https://app.cosmicsignature.com/',
      startSeconds: 1_700_000_000, // 2023-11-14T22:13:20Z
    });

    expect(uri.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);
    const body = decodeURIComponent(uri.split(',').slice(1).join(','));

    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('UID:cosmic-cycle-3-opening@cosmicsignature.com');
    expect(body).toContain('DTSTART:20231114T221320Z');
    // Default duration: 30 minutes.
    expect(body).toContain('DTEND:20231114T224320Z');
    // Semicolons and commas escaped per RFC 5545; newline folded to \n literal.
    expect(body).toContain('SUMMARY:Cycle #3 opens\\; art\\, allocations');
    expect(body).toContain('DESCRIPTION:Line one\\nLine two\\, with comma');
    expect(body).toContain('URL:https://app.cosmicsignature.com/');
    expect(body).toContain('END:VCALENDAR');
    // RFC 5545 requires CRLF line endings.
    expect(body).toContain('\r\n');
  });

  it('honors an explicit end time', () => {
    const uri = buildCalendarInviteDataUri({
      uid: 'x',
      title: 't',
      description: 'd',
      url: 'https://app.cosmicsignature.com/',
      startSeconds: 1_700_000_000,
      endSeconds: 1_700_003_600,
    });
    const body = decodeURIComponent(uri.split(',').slice(1).join(','));
    expect(body).toContain('DTEND:20231114T231320Z');
  });
});
