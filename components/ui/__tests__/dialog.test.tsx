import '@testing-library/jest-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { render, screen, checkA11y } from '@/test-utils';

describe('Dialog', () => {
  it('renders DialogContent when open', () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Test Dialog</DialogTitle>
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('does not render DialogContent when closed', () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Hidden Dialog</DialogTitle>
          <p>Hidden body</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
  });

  it('renders DialogTitle and DialogDescription', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
          <DialogDescription>My Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
  });

  it('renders DialogHeader and DialogFooter', () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Title</DialogTitle>
          <DialogHeader data-testid="dialog-header">Header content</DialogHeader>
          <DialogFooter data-testid="dialog-footer">Footer content</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId('dialog-header')).toHaveTextContent('Header content');
    expect(screen.getByTestId('dialog-footer')).toHaveTextContent('Footer content');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accessible Dialog</DialogTitle>
            <DialogDescription>Dialog description for screen readers</DialogDescription>
          </DialogHeader>
          <p>Body content</p>
        </DialogContent>
      </Dialog>,
    );
    await checkA11y(container);
  });
});
