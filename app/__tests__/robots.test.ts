import robots from '@/app/robots';

describe('robots', () => {
  const result = robots();

  it('returns rules array', () => {
    const rules = result.rules;
    expect(Array.isArray(rules)).toBe(true);
    expect((rules as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it('has a wildcard rule allowing root', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule!.allow).toContain('/');
  });

  it('disallows /admin/ and /api/ for wildcard agent', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule!.disallow).toContain('/admin/');
    expect(wildcardRule!.disallow).toContain('/api/');
  });

  it('includes AI crawler bot rules', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const aiRule = rules.find((r) => Array.isArray(r.userAgent) && r.userAgent.includes('GPTBot'));
    expect(aiRule).toBeDefined();
    expect(aiRule!.allow).toContain('/');
  });

  it('includes common AI bot user agents', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const aiRule = rules.find((r) => Array.isArray(r.userAgent));
    expect(aiRule).toBeDefined();
    const agents = aiRule!.userAgent as string[];
    expect(agents).toContain('GPTBot');
    expect(agents).toContain('ChatGPT-User');
    expect(agents).toContain('Claude-Web');
    expect(agents).toContain('PerplexityBot');
    expect(agents).toContain('Google-Extended');
  });

  it('references the sitemap', () => {
    expect(result.sitemap).toBe('https://www.cosmicsignature.com/sitemap.xml');
  });

  it('specifies the host', () => {
    expect(result.host).toBe('https://www.cosmicsignature.com');
  });
});
