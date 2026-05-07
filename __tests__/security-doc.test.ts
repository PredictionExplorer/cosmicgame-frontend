import { readFileSync } from 'node:fs';
import path from 'node:path';

const securityDoc = readFileSync(path.join(process.cwd(), 'docs/SECURITY.md'), 'utf8');

function acceptedAdvisorySections() {
  return securityDoc
    .split(/^### /gm)
    .slice(1)
    .map((section) => {
      const [idLine = '', ...bodyLines] = section.split('\n');
      return {
        id: idLine.trim(),
        body: bodyLines.join('\n'),
      };
    });
}

describe('SECURITY.md accepted dependency advisories', () => {
  it('records machine-checkable fields for every accepted advisory', () => {
    const sections = acceptedAdvisorySections();

    expect(sections.length).toBeGreaterThan(0);
    for (const { id, body } of sections) {
      expect(id).toMatch(/^GHSA-[a-z0-9-]+$/);
      expect(body).toMatch(/^- package: `[^`]+`$/m);
      expect(body).toMatch(/^- severity: (low|moderate|high|critical)$/m);
      expect(body).toMatch(/^- scope: .+$/m);
      expect(body).toMatch(/^- reason: .+/m);
    }
  });

  it('does not accept direct runtime dependency CVEs', () => {
    expect(securityDoc).not.toMatch(/package: `axios`/);
    expect(securityDoc).not.toMatch(/package: `next`/);
  });
});
