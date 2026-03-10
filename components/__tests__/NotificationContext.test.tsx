import '@testing-library/jest-dom';
import { toast } from 'sonner';

import { NotificationProvider, useNotification } from '@/contexts/NotificationContext';

import { render, screen, fireEvent } from '@/test-utils';

jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
}));

function TestConsumer() {
  const { setNotification } = useNotification();
  return (
    <div>
      <button onClick={() => setNotification({ text: 'Success!', type: 'success', visible: true })}>
        Trigger Success
      </button>
      <button onClick={() => setNotification({ text: 'Error!', type: 'error', visible: true })}>
        Trigger Error
      </button>
      <button onClick={() => setNotification({ text: 'Info!', type: 'info', visible: true })}>
        Trigger Info
      </button>
      <button onClick={() => setNotification({ text: 'Warning!', type: 'warning', visible: true })}>
        Trigger Warning
      </button>
      <button onClick={() => setNotification({ text: 'Hidden', type: 'success', visible: false })}>
        Trigger Hidden
      </button>
      <button
        onClick={() =>
          setNotification((prev) => ({
            ...prev,
            text: 'From fn',
            type: 'info',
            visible: true,
          }))
        }
      >
        Trigger Function
      </button>
    </div>
  );
}

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides context to children', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    expect(screen.getByText('Trigger Success')).toBeInTheDocument();
  });

  it('calls toast.success when notification type is success', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Success'));
    expect(toast.success).toHaveBeenCalledWith('Success!');
  });

  it('calls toast.error when notification type is error', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Error'));
    expect(toast.error).toHaveBeenCalledWith('Error!');
  });

  it('calls toast.info when notification type is info', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Info'));
    expect(toast.info).toHaveBeenCalledWith('Info!');
  });

  it('calls toast.warning when notification type is warning', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Warning'));
    expect(toast.warning).toHaveBeenCalledWith('Warning!');
  });

  it('does nothing when visible is false', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Hidden'));
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('accepts a function updater and resolves it', () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Function'));
    expect(toast.info).toHaveBeenCalledWith('From fn');
  });

  it('throws when useNotification is used outside NotificationProvider', () => {
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => render(<TestConsumer />)).toThrow(
      'useNotification must be used within a NotificationProvider',
    );
    console.error = originalError;
  });
});
