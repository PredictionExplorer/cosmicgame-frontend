import '@testing-library/jest-dom';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { RecordDetailSkeleton } from '@/components/ui/page-skeletons';

import { checkA11y, render, screen } from '@/test-utils';

describe('record page skeletons', () => {
  it('announces loading once, inside the page shell', () => {
    render(<RecordDetailSkeleton />);
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveAttribute('aria-busy', 'true');
    expect(statuses[0]).toHaveTextContent('common.status.loadingEllipsis');
    expect(document.querySelector('main#main')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RecordDetailSkeleton />);
    await checkA11y(container);
  });
});

describe('record routes rendered per request', () => {
  const APP = join(__dirname, '..', '..', '..', 'app', '[locale]', '(app)');
  // The other record routes are cached renders (on-demand ISR): a translated loading boundary
  // would read the request headers there (record-route-caching.test).
  it.each(['detail/[id]', 'eth-contribution/detail/[id]'])('%s has a loading boundary', (route) => {
    expect(existsSync(join(APP, route, 'page.tsx'))).toBe(true);
    expect(existsSync(join(APP, route, 'loading.tsx'))).toBe(true);
  });
});
