import { render, screen } from '@/test-utils';

import { SignatureNotFoundIntro } from '../SignatureNotFoundIntro';

const mockParams = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: () => mockParams(),
}));

describe('SignatureNotFoundIntro', () => {
  it('hangs an empty plate captioned with the number that was asked for', () => {
    mockParams.mockReturnValue({ locale: 'en', id: '60' });
    render(<SignatureNotFoundIntro />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('detail.notFound.title');
    expect(screen.getByTestId('pending-plate')).toHaveTextContent('#000060');
  });

  it('says the link leads to no Signature when it holds no token number', () => {
    mockParams.mockReturnValue({ locale: 'en', id: 'not-a-token' });
    render(<SignatureNotFoundIntro />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'detail.notFound.titleInvalid',
    );
    expect(screen.getByTestId('pending-plate')).not.toHaveTextContent('#');
  });
});
