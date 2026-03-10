import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

import { render, screen } from '@/test-utils';

describe('Card', () => {
  it('renders all card sub-components', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Title</CardTitle>
          <CardDescription data-testid="card-description">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">Content</CardContent>
        <CardFooter data-testid="card-footer">Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent('Title');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Description');
    expect(screen.getByTestId('card-content')).toHaveTextContent('Content');
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer');
  });

  it('applies custom className to Card', () => {
    render(
      <Card className="custom-card" data-testid="card">
        body
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('applies custom className to CardHeader', () => {
    render(
      <CardHeader className="custom-header" data-testid="header">
        h
      </CardHeader>,
    );
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
  });

  it('applies custom className to CardTitle', () => {
    render(
      <CardTitle className="custom-title" data-testid="title">
        t
      </CardTitle>,
    );
    expect(screen.getByTestId('title')).toHaveClass('custom-title');
  });

  it('applies custom className to CardDescription', () => {
    render(
      <CardDescription className="custom-desc" data-testid="desc">
        d
      </CardDescription>,
    );
    expect(screen.getByTestId('desc')).toHaveClass('custom-desc');
  });

  it('applies custom className to CardContent', () => {
    render(
      <CardContent className="custom-content" data-testid="content">
        c
      </CardContent>,
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-content');
  });

  it('applies custom className to CardFooter', () => {
    render(
      <CardFooter className="custom-footer" data-testid="footer">
        f
      </CardFooter>,
    );
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });
});
