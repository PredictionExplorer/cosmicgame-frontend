import '@testing-library/jest-dom';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  CycleAllocationSkeleton,
  LedgerPageSkeleton,
  ProfileSkeleton,
  RecordDetailSkeleton,
} from '@/components/ui/page-skeletons';

import { checkA11y, render, screen } from '@/test-utils';

const SKELETONS = [
  ['ProfileSkeleton', () => <ProfileSkeleton />],
  ['CycleAllocationSkeleton', () => <CycleAllocationSkeleton />],
  ['LedgerPageSkeleton', () => <LedgerPageSkeleton summaryRows={2} />],
  ['RecordDetailSkeleton', () => <RecordDetailSkeleton />],
] as const;

describe('record page skeletons', () => {
  it.each(SKELETONS)('%s announces loading once, inside the page shell', (_name, renderIt) => {
    render(renderIt());
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveAttribute('aria-busy', 'true');
    expect(statuses[0]).toHaveTextContent('common.status.loadingEllipsis');
    expect(document.querySelector('main#main')).not.toBeNull();
  });

  it('keeps a short ledger in the reading column under a full-width header', () => {
    const { container } = render(
      <LedgerPageSkeleton figures={3} rows={4} width="max-w-none" body="narrow" />,
    );
    const table = container.querySelector('[role="status"] > .max-w-3xl');
    expect(table).not.toBeNull();
    expect(screen.getByRole('status')).toHaveClass('max-w-none');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RecordDetailSkeleton />);
    await checkA11y(container);
  });
});

describe('dynamic record routes', () => {
  const APP = join(__dirname, '..', '..', '..', 'app', '[locale]', '(app)');
  it.each([
    'detail/[id]',
    'user/[address]',
    'gesture/[id]',
    'allocation/[id]',
    'eth-contribution/detail/[id]',
    'eth-contribution/round/[round]',
    'cosmic-token-transfer/[address]',
    'cosmic-signature-transfer/[address]',
    'anchor-action/[IsRwalk]/[actionId]',
    'system-event/[round]/[start]/[end]',
    'distributions-by-token/[address]/[tokenId]',
  ])('%s has a loading boundary', (route) => {
    expect(existsSync(join(APP, route, 'page.tsx'))).toBe(true);
    expect(existsSync(join(APP, route, 'loading.tsx'))).toBe(true);
  });
});
