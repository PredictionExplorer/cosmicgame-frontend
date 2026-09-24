import { useQueryClient } from '@tanstack/react-query';

import { renderWithQuery, screen } from '@/test-utils';

import { QuerySeed } from '../QuerySeed';

// The real cache: the shared test mock stubs the client this test reads.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));
jest.mock('../publicDataReads', () => ({ readDashboard: jest.fn() }));

function SeededValue() {
  const data = useQueryClient().getQueryData<string>(['probe']);
  return <p>{data ?? 'no seed'}</p>;
}

const seeds = [{ queryKey: ['probe'], data: 'seeded rows', at: Date.now() }];

describe('QuerySeed', () => {
  const previous = process.env.PLAYWRIGHT;
  afterEach(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('hands the server read to the client query cache', () => {
    delete process.env.PLAYWRIGHT;
    renderWithQuery(
      <QuerySeed seeds={seeds}>
        <SeededValue />
      </QuerySeed>,
    );
    expect(screen.getByText('seeded rows')).toBeInTheDocument();
  });

  it('seeds nothing from a failed read', () => {
    delete process.env.PLAYWRIGHT;
    renderWithQuery(
      <QuerySeed seeds={[{ queryKey: ['probe'], data: null, at: Date.now() }]}>
        <SeededValue />
      </QuerySeed>,
    );
    expect(screen.getByText('no seed')).toBeInTheDocument();
  });

  it('seeds nothing under the e2e harness, whose specs mock the API in the browser', () => {
    process.env.PLAYWRIGHT = '1';
    renderWithQuery(
      <QuerySeed seeds={seeds}>
        <SeededValue />
      </QuerySeed>,
    );
    expect(screen.getByText('no seed')).toBeInTheDocument();
  });
});
