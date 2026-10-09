import { checkA11y, render, screen } from '@/test-utils';

import { FormField } from '../form-field';
import { Input } from '../input';

describe('FormField', () => {
  it('labels the control and describes it with the hint', () => {
    render(
      <FormField label="Amount" hint="In CST, on Arbitrum One.">
        {(control) => <Input {...control} />}
      </FormField>,
    );

    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAccessibleDescription('In CST, on Arbitrum One.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('replaces the hint with the error and marks the control invalid', () => {
    render(
      <FormField label="Amount" hint="In CST." error="Enter an amount greater than 0.">
        {(control) => <Input {...control} />}
      </FormField>,
    );

    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter an amount greater than 0.');
    expect(screen.queryByText('In CST.')).not.toBeInTheDocument();
  });

  it('keeps a fixed id and renders the label row extras', () => {
    render(
      <FormField
        id="recipient"
        label="Recipient"
        labelSuffix="(optional)"
        labelAside={<span>Max</span>}
      >
        {(control) => <Input {...control} />}
      </FormField>,
    );

    expect(screen.getByLabelText(/Recipient/)).toHaveAttribute('id', 'recipient');
    expect(screen.getByText('(optional)')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('has no accessibility violations with an error', async () => {
    const { container } = render(
      <FormField label="Link" error="Use a full link.">
        {(control) => <Input {...control} />}
      </FormField>,
    );
    await checkA11y(container);
  });
});
