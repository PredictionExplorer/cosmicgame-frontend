import { expect, test } from '@playwright/test';

const assistantOrigin = 'https://holloway-bay.vercel.app';

for (const host of ['cosmicsignature.com', 'app.cosmicsignature.com', 'preview.vercel.app']) {
  test(`${host}: microphone inheritance is limited to approved assistant origins`, async ({
    page,
    context,
    baseURL,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Chromium exposes policy inspection without device access.',
    );
    // No production page, provider session, or microphone is contacted.
    await context.route(`https://${host}/**`, async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({
        url: `${baseURL}${url.pathname}${url.search}`,
        headers: { ...route.request().headers(), host, 'x-forwarded-host': host },
        maxRedirects: 0,
      });
      await route.fulfill({ response });
    });
    await page.route(`${assistantOrigin}/website-assistant.js`, (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    for (const origin of [assistantOrigin, 'https://unrelated.example']) {
      await page.route(`${origin}/permission-probe`, (route) =>
        route.fulfill({
          contentType: 'text/html',
          headers: { 'Permissions-Policy': 'microphone=(self), camera=(self), geolocation=(self)' },
          body: '<!doctype html><title>Permission probe</title><body>Ready</body>',
        }),
      );
    }
    const target = `https://${host}${host === 'cosmicsignature.com' ? '/about' : '/faq'}`;
    await page.goto(target);
    await expect(page).toHaveURL(target);
    for (const origin of [assistantOrigin, 'https://unrelated.example']) {
      await page.evaluate((src) => {
        const frame = document.createElement('iframe');
        frame.src = src;
        frame.allow = 'microphone; camera; geolocation';
        document.body.append(frame);
      }, `${origin}/permission-probe`);
      const body = page.frameLocator(`iframe[src="${origin}/permission-probe"]`).locator('body');
      await expect(body).toHaveText('Ready');
      const allowed = await body.evaluate(() => {
        const policy = (
          document as Document & { featurePolicy: { allowsFeature: (name: string) => boolean } }
        ).featurePolicy;
        return {
          microphone: policy.allowsFeature('microphone'),
          camera: policy.allowsFeature('camera'),
          geolocation: policy.allowsFeature('geolocation'),
        };
      });
      expect(allowed).toEqual({
        microphone: host !== 'preview.vercel.app' && origin === assistantOrigin,
        camera: false,
        geolocation: false,
      });
    }
    await context.unrouteAll({ behavior: 'ignoreErrors' });
  });
}
