import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

import { WalletUi } from '../WalletUi';

// jest.setup stubs the lazy wallet UI for every other suite; this one tests it.
jest.unmock('@/components/wallet/WalletUi');

interface CapturedAppInfo {
  appName?: string;
  learnMoreUrl?: string;
  disclaimer?: (props: {
    Text: (p: { children: ReactNode }) => ReactNode;
    Link: (p: { children: ReactNode; href: string }) => ReactNode;
  }) => ReactNode;
}

let mockAppInfo: CapturedAppInfo | undefined;
let mockOpenConnectModal: jest.Mock | undefined;
let mockStatus = 'disconnected';

jest.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({
    children,
    appInfo,
  }: {
    children: ReactNode;
    appInfo?: CapturedAppInfo;
  }) => {
    mockAppInfo = appInfo;
    return <>{children}</>;
  },
  useConnectModal: () => ({ openConnectModal: mockOpenConnectModal }),
}));
jest.mock('wagmi', () => ({ useConnection: () => ({ status: mockStatus }) }));
jest.mock('../wallet-connectors', () => ({ installWalletConnectors: jest.fn() }));
jest.mock('../../../config/wagmi', () => ({
  wagmiConfig: {},
  walletAppName: 'Cosmic Signature',
}));
jest.mock('../../../config/rainbowkit-theme', () => ({ cosmicRainbowTheme: {} }));

beforeEach(() => {
  mockAppInfo = undefined;
  mockOpenConnectModal = jest.fn();
  mockStatus = 'disconnected';
});

describe('WalletUi', () => {
  it('opens the connect modal for a request and reports it on screen', () => {
    const onModalOpened = jest.fn();
    render(<WalletUi connectRequestId={1} onModalOpened={onModalOpened} />);

    expect(mockOpenConnectModal).toHaveBeenCalledTimes(1);
    expect(onModalOpened).toHaveBeenCalledTimes(1);
  });

  it('settles a request made while connected instead of queueing it', () => {
    mockOpenConnectModal = undefined;
    mockStatus = 'connected';
    const onModalOpened = jest.fn();
    const { rerender } = render(<WalletUi connectRequestId={1} onModalOpened={onModalOpened} />);
    expect(onModalOpened).toHaveBeenCalledTimes(1);

    // After a later disconnect the old request must not pop the modal up.
    mockStatus = 'disconnected';
    mockOpenConnectModal = jest.fn();
    rerender(<WalletUi connectRequestId={1} onModalOpened={onModalOpened} />);
    expect(mockOpenConnectModal).not.toHaveBeenCalled();
  });

  it('waits while a session is still being restored', () => {
    mockOpenConnectModal = undefined;
    mockStatus = 'reconnecting';
    const onModalOpened = jest.fn();
    const { rerender } = render(<WalletUi connectRequestId={1} onModalOpened={onModalOpened} />);
    expect(onModalOpened).not.toHaveBeenCalled();

    mockStatus = 'disconnected';
    mockOpenConnectModal = jest.fn();
    rerender(<WalletUi connectRequestId={1} onModalOpened={onModalOpened} />);
    expect(mockOpenConnectModal).toHaveBeenCalledTimes(1);
  });

  it('names the app and adds the Terms and Risk Disclosures line', () => {
    render(<WalletUi connectRequestId={0} />);

    expect(mockAppInfo).toMatchObject({
      appName: 'Cosmic Signature',
      learnMoreUrl: expect.stringContaining('/learn/cosmic-signature-on-arbitrum'),
    });
    const Disclaimer = mockAppInfo!.disclaimer!;
    render(
      <Disclaimer
        Text={({ children }) => <p>{children}</p>}
        Link={({ children, href }) => <a href={href}>{children}</a>}
      />,
    );
    expect(screen.getByText(/wallet\.connect\.disclaimer/)).toBeInTheDocument();
  });
});
