import { render, screen } from '@testing-library/react';

import { getLandingContent } from '@/content/landing';
import { getWhitePaperContent } from '@/content/white-paper';

import { AllocationBar, AllocationKey } from '@/components/reading/AllocationBar';

import { whitePaperAllocationTracks } from '../allocationTracks';

it('renders V3 labels and segment widths together without inheriting the older landing split', () => {
  const tracks = whitePaperAllocationTracks(
    getWhitePaperContent('en'),
    getLandingContent('en').tracks.eth,
  );
  const { container } = render(
    <>
      <AllocationBar tracks={tracks} />
      <AllocationKey tracks={tracks} />
    </>,
  );
  expect(
    Array.from(container.querySelectorAll('[data-share]'), (node) =>
      node.getAttribute('data-share'),
    ),
  ).toEqual(['20', '15', '5', '5', '5', '50']);
  expect(screen.getAllByText('20%')).toHaveLength(2);
  expect(screen.getAllByText('15%')).toHaveLength(2);
  expect(screen.getAllByText('5%')).toHaveLength(6);
  expect(screen.queryByText('25%')).not.toBeInTheDocument();
  expect(screen.queryByText('8%')).not.toBeInTheDocument();
});
