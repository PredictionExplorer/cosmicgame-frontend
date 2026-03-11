import { render, screen } from '@/test-utils';

import { CustomTabPanel } from '../CustomTabPanel';

describe('CustomTabPanel', () => {
  it('shows children when value equals index', () => {
    render(
      <CustomTabPanel value={0} index={0}>
        <p>Panel content</p>
      </CustomTabPanel>,
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('hides children when value does not equal index', () => {
    render(
      <CustomTabPanel value={1} index={0}>
        <p>Hidden content</p>
      </CustomTabPanel>,
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('sets role="tabpanel"', () => {
    render(
      <CustomTabPanel value={0} index={0}>
        Content
      </CustomTabPanel>,
    );
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('sets correct id and aria-labelledby based on index', () => {
    render(
      <CustomTabPanel value={2} index={2}>
        Panel 2
      </CustomTabPanel>,
    );
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'simple-tabpanel-2');
    expect(panel).toHaveAttribute('aria-labelledby', 'simple-tab-2');
  });

  it('sets hidden attribute when not selected', () => {
    const { container } = render(
      <CustomTabPanel value={0} index={1}>
        Not visible
      </CustomTabPanel>,
    );
    const panel = container.querySelector('[role="tabpanel"]');
    expect(panel).toHaveAttribute('hidden');
  });
});
