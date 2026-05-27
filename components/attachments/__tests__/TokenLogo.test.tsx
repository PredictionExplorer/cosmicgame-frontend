import { fireEvent } from '@testing-library/react';

import { checkA11y, render, screen } from '@/test-utils';

import { TokenLogo } from '../TokenLogo';

describe('TokenLogo', () => {
  it('renders an official token logo when provided', () => {
    render(
      <TokenLogo logoURI="https://cdn.example/logo.png" symbol="GLXY" name="Galaxy Credits" />,
    );

    expect(screen.getByAltText('GLXY token logo')).toHaveAttribute(
      'src',
      'https://cdn.example/logo.png',
    );
  });

  it('falls back to generated initials when the logo is missing', () => {
    render(<TokenLogo symbol="GLXY" name="Galaxy Credits" />);

    expect(screen.queryByAltText('GLXY token logo')).not.toBeInTheDocument();
    expect(screen.getByText('GLXY')).toBeInTheDocument();
  });

  it('falls back when the logo image fails to load', () => {
    render(<TokenLogo logoURI="https://cdn.example/missing.png" symbol="GLXY" />);

    fireEvent.error(screen.getByAltText('GLXY token logo'));
    expect(screen.queryByAltText('GLXY token logo')).not.toBeInTheDocument();
    expect(screen.getByText('GLXY')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TokenLogo logoURI="https://cdn.example/logo.png" symbol="GLXY" />,
    );
    await checkA11y(container);
  });
});
