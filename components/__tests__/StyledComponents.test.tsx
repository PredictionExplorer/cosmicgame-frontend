import '@testing-library/jest-dom';
import {
  MainWrapper,
  AppBarWrapper,
  FooterWrapper,
  TablePrimaryContainer,
  GradientText,
  SectionWrapper,
  SearchBox,
  StyledLink,
  StyledCard,
  NavLink,
  DrawerList,
  Wallet,
  CenterBox,
  NFTSkeleton,
  SearchField,
  SearchButton,
} from '@/components/styled';
import { Spinner } from '@/components/ui/spinner';

import { render, screen } from '@/test-utils';

describe('MainWrapper', () => {
  it('renders its children', () => {
    render(<MainWrapper>Main content</MainWrapper>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('applies min-h class by default', () => {
    const { container } = render(<MainWrapper>content</MainWrapper>);
    expect(container.firstChild).toHaveClass('min-h-[calc(100vh-100px)]');
  });

  it('merges additional className', () => {
    const { container } = render(<MainWrapper className="extra-class">content</MainWrapper>);
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('forwards HTML attributes', () => {
    render(<MainWrapper data-testid="main">content</MainWrapper>);
    expect(screen.getByTestId('main')).toBeInTheDocument();
  });
});

describe('AppBarWrapper', () => {
  it('renders its children in a header element', () => {
    render(<AppBarWrapper>Header content</AppBarWrapper>);
    const header = screen.getByText('Header content').closest('header');
    expect(header).toBeInTheDocument();
  });

  it('has fixed positioning class', () => {
    const { container } = render(<AppBarWrapper>nav</AppBarWrapper>);
    expect(container.firstChild).toHaveClass('fixed');
  });

  it('has z-50 class', () => {
    const { container } = render(<AppBarWrapper>nav</AppBarWrapper>);
    expect(container.firstChild).toHaveClass('z-50');
  });

  it('merges additional className', () => {
    const { container } = render(<AppBarWrapper className="custom">nav</AppBarWrapper>);
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveClass('fixed');
  });
});

describe('FooterWrapper', () => {
  it('renders its children in a footer element', () => {
    render(<FooterWrapper>Footer content</FooterWrapper>);
    const footer = screen.getByText('Footer content').closest('footer');
    expect(footer).toBeInTheDocument();
  });

  it('has bg-background class', () => {
    const { container } = render(<FooterWrapper>footer</FooterWrapper>);
    expect(container.firstChild).toHaveClass('bg-background');
  });

  it('merges additional className', () => {
    const { container } = render(<FooterWrapper className="my-class">footer</FooterWrapper>);
    expect(container.firstChild).toHaveClass('my-class');
  });
});

describe('TablePrimaryContainer', () => {
  it('renders its children', () => {
    render(<TablePrimaryContainer>Table content</TablePrimaryContainer>);
    expect(screen.getByText('Table content')).toBeInTheDocument();
  });

  it('has bg-white opacity class', () => {
    const { container } = render(<TablePrimaryContainer>content</TablePrimaryContainer>);
    expect(container.firstChild).toHaveClass('bg-white/[0.02]');
  });

  it('merges additional className', () => {
    const { container } = render(
      <TablePrimaryContainer className="extra">content</TablePrimaryContainer>,
    );
    expect(container.firstChild).toHaveClass('extra');
  });
});

describe('GradientText', () => {
  it('renders its children as a span by default', () => {
    render(<GradientText>gradient</GradientText>);
    const el = screen.getByText('gradient');
    expect(el.tagName).toBe('SPAN');
  });

  it('applies gradient classes', () => {
    render(<GradientText>gradient</GradientText>);
    const el = screen.getByText('gradient');
    expect(el).toHaveClass('bg-gradient-to-r');
    expect(el).toHaveClass('bg-clip-text');
    expect(el).toHaveClass('text-transparent');
  });

  it('renders as a custom element via as prop', () => {
    render(<GradientText as="h1">heading</GradientText>);
    const el = screen.getByText('heading');
    expect(el.tagName).toBe('H1');
  });

  it('merges additional className', () => {
    render(<GradientText className="text-lg">gradient</GradientText>);
    expect(screen.getByText('gradient')).toHaveClass('text-lg');
  });
});

describe('SectionWrapper', () => {
  it('renders its children', () => {
    render(<SectionWrapper>Section content</SectionWrapper>);
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('has py-16 class', () => {
    const { container } = render(<SectionWrapper>content</SectionWrapper>);
    expect(container.firstChild).toHaveClass('py-16');
  });

  it('merges additional className', () => {
    const { container } = render(<SectionWrapper className="bg-red">content</SectionWrapper>);
    expect(container.firstChild).toHaveClass('bg-red');
  });
});

describe('SearchBox', () => {
  it('renders its children', () => {
    render(<SearchBox>Search content</SearchBox>);
    expect(screen.getByText('Search content')).toBeInTheDocument();
  });

  it('has flex and justify-center classes', () => {
    const { container } = render(<SearchBox>content</SearchBox>);
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('justify-center');
  });

  it('has mb-8 spacing class', () => {
    const { container } = render(<SearchBox>content</SearchBox>);
    expect(container.firstChild).toHaveClass('mb-8');
  });
});

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders accessible "Loading..." text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies the default md size', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('applies sm size classes', () => {
    render(<Spinner size="sm" />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies lg size classes', () => {
    render(<Spinner size="lg" />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('merges additional className', () => {
    render(<Spinner className="my-spinner" />);
    expect(screen.getByRole('status')).toHaveClass('my-spinner');
  });
});

describe('StyledLink', () => {
  it('renders an anchor with children', () => {
    render(<StyledLink href="/test">Link text</StyledLink>);
    const link = screen.getByText('Link text');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies underline class', () => {
    render(<StyledLink>Link text</StyledLink>);
    expect(screen.getByText('Link text')).toHaveClass('underline');
  });
});

describe('StyledCard', () => {
  it('renders its children', () => {
    render(<StyledCard>Card body</StyledCard>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('has relative positioning', () => {
    const { container } = render(<StyledCard>Card</StyledCard>);
    expect(container.firstChild).toHaveClass('relative');
  });
});

describe('NavLink', () => {
  it('renders an anchor with uppercase class', () => {
    render(<NavLink href="/page">Nav</NavLink>);
    const link = screen.getByText('Nav');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('uppercase');
  });
});

describe('DrawerList', () => {
  it('renders with a fixed width', () => {
    const { container } = render(<DrawerList>Items</DrawerList>);
    expect(container.firstChild).toHaveClass('w-[265px]');
  });
});

describe('Wallet', () => {
  it('renders the label text', () => {
    render(<Wallet label="0xABC" />);
    expect(screen.getByText('0xABC')).toBeInTheDocument();
  });

  it('has rounded-full class', () => {
    const { container } = render(<Wallet label="addr" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });
});

describe('CenterBox', () => {
  it('renders its children with flex', () => {
    const { container } = render(<CenterBox>Centered</CenterBox>);
    expect(container.firstChild).toHaveClass('flex');
    expect(screen.getByText('Centered')).toBeInTheDocument();
  });
});

describe('NFTSkeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<NFTSkeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

describe('SearchField', () => {
  it('renders an input element', () => {
    render(<SearchField placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});

describe('SearchButton', () => {
  it('renders a button element', () => {
    render(<SearchButton>Go</SearchButton>);
    expect(screen.getByText('Go').tagName).toBe('BUTTON');
  });

  it('has gradient background classes', () => {
    render(<SearchButton>Go</SearchButton>);
    expect(screen.getByText('Go')).toHaveClass('bg-gradient-to-r');
  });
});
