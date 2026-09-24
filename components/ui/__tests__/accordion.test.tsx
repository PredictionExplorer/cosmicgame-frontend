import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { act, render, screen } from '@/test-utils';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion';

/** A controlled accordion whose bodies stay mounted, like the FAQ's. */
function KeptMounted() {
  const [open, setOpen] = useState<string[]>([]);
  return (
    <Accordion type="multiple" value={open} onValueChange={setOpen}>
      {['a', 'b'].map((id) => (
        <AccordionItem key={id} value={id}>
          <AccordionTrigger>Question {id}</AccordionTrigger>
          <AccordionContent hiddenUntilFound={!open.includes(id)}>Answer {id}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const region = (id: string) =>
  screen.getByText(`Answer ${id}`).closest<HTMLElement>('[role="region"]');

describe('AccordionContent', () => {
  it('mounts a body only while open by default', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.queryByText('Answer')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Question' }));
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('keeps a closed body in the page as hidden="until-found"', () => {
    render(<KeptMounted />);
    expect(region('a')).toHaveAttribute('hidden', 'until-found');
    expect(region('a')).toHaveAttribute('data-state', 'closed');
  });

  it('shows the body once its item opens, and hides it again on close', async () => {
    const user = userEvent.setup();
    render(<KeptMounted />);
    await user.click(screen.getByRole('button', { name: 'Question a' }));
    expect(region('a')).not.toHaveAttribute('hidden');
    await user.click(screen.getByRole('button', { name: 'Question a' }));
    expect(region('a')).toHaveAttribute('hidden', 'until-found');
  });

  it('opens its item when find-in-page reveals the body', () => {
    render(<KeptMounted />);
    act(() => {
      region('b')!.dispatchEvent(new Event('beforematch'));
    });
    expect(screen.getByRole('button', { name: 'Question b' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(region('b')).not.toHaveAttribute('hidden');
    expect(region('a')).toHaveAttribute('hidden', 'until-found');
  });
});
