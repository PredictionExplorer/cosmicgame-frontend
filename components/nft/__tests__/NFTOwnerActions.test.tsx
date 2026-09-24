import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import type { Address } from 'viem';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { AppContractAddresses } from '@/config/networks';
import type { RecipientCheck } from '@/components/tokens/transfer/useRecipientFacts';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import { NFTOwnerActions, type NFTOwnerActionsProps } from '../NFTOwnerActions';

const OWNER = '0x1111111111111111111111111111111111111111' as Address;
const RECIPIENT = '0x3333333333333333333333333333333333333334';

const mockTx = createFakeTxFlow(OWNER);
const mockNotify = jest.fn();
let mockCheck: RecipientCheck = { status: 'idle' };
let mockContracts: AppContractAddresses = TEST_APP_CONTRACT_ADDRESSES;

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

jest.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify }),
}));

jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockContracts,
}));

jest.mock('@/components/tokens/transfer/useRecipientFacts', () => ({
  ...jest.requireActual('@/components/tokens/transfer/useRecipientFacts'),
  useRecipientFacts: (address: string | null) => (address ? mockCheck : { status: 'idle' }),
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/components/ui/tx-status', () => ({
  TxStatus: () => null,
}));

const onTransferred = jest.fn();
const onRenamed = jest.fn();
const onAddToMetaMask = jest.fn();

function renderActions(overrides: Partial<NFTOwnerActionsProps> = {}) {
  return render(
    <NFTOwnerActions
      tokenId={25}
      owner={OWNER}
      currentName=""
      totalNamedTokens={12}
      showMetaMaskAction={false}
      addingToMetaMask={false}
      onAddToMetaMask={onAddToMetaMask}
      onTransferred={onTransferred}
      onRenamed={onRenamed}
      {...overrides}
    />,
  );
}

const nameField = () => screen.getByLabelText('detail.ownerActions.nameLabel');
const recipientField = () => screen.getByLabelText('forms.transfer.recipient.label');
const transferButton = () =>
  screen.getByRole('button', { name: 'detail.ownerActions.transferButton(id=#000025)' });

async function openTransfer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('tab', { name: 'detail.ownerActions.tabs.transfer' }));
}

beforeEach(() => {
  mockTx.reset();
  mockTx.writeContract.mockResolvedValue('0xhash');
  mockNotify.mockClear();
  onTransferred.mockClear();
  onRenamed.mockClear();
  onAddToMetaMask.mockClear();
  mockContracts = TEST_APP_CONTRACT_ADDRESSES;
  mockCheck = {
    status: 'ready',
    facts: { transactionCount: 4, isContract: false },
    known: null,
    warning: null,
  };
});

describe('NFTOwnerActions', () => {
  it('offers naming first and the transfer one tab away', () => {
    renderActions();
    expect(
      screen.getByRole('heading', { level: 2, name: 'detail.ownerActions.title' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'detail.ownerActions.tabs.name' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(nameField()).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /viewAllNamedTokens/ })).toHaveAttribute(
      'href',
      '/named-nfts',
    );
  });

  describe('naming', () => {
    it('writes the name on-chain and hands the refresh to the page', async () => {
      const user = userEvent.setup();
      renderActions();
      await user.type(nameField(), '  Twisted Mind ');
      await user.click(screen.getByRole('button', { name: 'detail.ownerActions.setName' }));

      await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
      expect(mockTx.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: TEST_APP_CONTRACT_ADDRESSES.cosmicSignature,
          functionName: 'setNftName',
          args: [25n, 'Twisted Mind'],
        }),
      );
      expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.nft.nameSet');
      expect(onRenamed).toHaveBeenCalledTimes(1);
      expect(nameField()).toHaveValue('');
    });

    it('cannot be sent empty', () => {
      renderActions();
      expect(screen.getByRole('button', { name: 'detail.ownerActions.setName' })).toBeDisabled();
    });

    it('stops at 32 bytes, never in the middle of a character', async () => {
      const user = userEvent.setup();
      renderActions();
      await user.type(nameField(), '星'.repeat(12));
      expect(nameField()).toHaveValue('星'.repeat(10));
    });

    it('offers to change or clear a name the token already has', async () => {
      const user = userEvent.setup();
      renderActions({ currentName: 'Twisted Mind' });
      expect(
        screen.getByRole('button', { name: 'detail.ownerActions.changeName' }),
      ).toBeInTheDocument();
      expect(nameField()).toHaveAttribute('placeholder', 'Twisted Mind');

      await user.click(screen.getByRole('button', { name: 'detail.ownerActions.clearName' }));
      await waitFor(() =>
        expect(mockTx.writeContract).toHaveBeenCalledWith(
          expect.objectContaining({ functionName: 'setNftName', args: [25n, ''] }),
        ),
      );
      expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.nft.nameCleared');
    });

    it('offers no clear when there is no name to clear', () => {
      renderActions();
      expect(
        screen.queryByRole('button', { name: 'detail.ownerActions.clearName' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('transfer', () => {
    it('refuses a malformed recipient under the field, before the wallet opens', async () => {
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), '0x1234');
      await user.click(transferButton());

      expect(recipientField()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('forms.transfer.recipient.errors.invalid')).toBeInTheDocument();
      expect(recipientField()).toHaveFocus();
      expect(mockTx.writeContract).not.toHaveBeenCalled();
    });

    it('refuses the owner’s own wallet', async () => {
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), OWNER);
      await user.tab();
      expect(screen.getByText('forms.transfer.recipient.errors.self')).toBeInTheDocument();
    });

    it('reviews the token and the full recipient, then sends it from the owner', async () => {
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), RECIPIENT);

      const review = screen.getByTestId('transfer-review');
      expect(review).toHaveTextContent('#000025');
      expect(review).toHaveTextContent(RECIPIENT);

      await user.click(transferButton());
      await waitFor(() =>
        expect(mockTx.writeContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: TEST_APP_CONTRACT_ADDRESSES.cosmicSignature,
            functionName: 'transferFrom',
            args: [OWNER, RECIPIENT, 25n],
          }),
        ),
      );
      expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.nft.detailTransferConfirmed');
      expect(onTransferred).toHaveBeenCalledTimes(1);
    });

    it('asks to acknowledge a never-used address before sending to it', async () => {
      mockCheck = {
        status: 'ready',
        facts: { transactionCount: 0, isContract: false },
        known: null,
        warning: 'fresh',
      };
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), RECIPIENT);
      await user.click(transferButton());

      expect(mockTx.writeContract).not.toHaveBeenCalled();
      expect(screen.getByText('forms.transfer.review.acknowledgeRequired')).toBeInTheDocument();

      await user.click(screen.getByLabelText('forms.transfer.review.acknowledge'));
      await user.click(transferButton());
      await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    });

    it('names the token when the transfer fails', async () => {
      mockTx.writeContract.mockRejectedValueOnce(new Error('execution reverted'));
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), RECIPIENT);
      await user.click(transferButton());
      await waitFor(() =>
        expect(mockTx.lastFailureMessage()).toBe(
          'toasts.transfer.nft.failedToken(tokenId=#000025)',
        ),
      );
      expect(onTransferred).not.toHaveBeenCalled();
    });

    it('says so when the NFT contract is not known yet, and sends nothing', async () => {
      mockContracts = { ...TEST_APP_CONTRACT_ADDRESSES, cosmicSignature: '' };
      const user = userEvent.setup();
      renderActions();
      await openTransfer(user);
      await user.type(recipientField(), RECIPIENT);
      await user.click(transferButton());
      expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.transfer.nft.contractUnavailable');
      expect(mockTx.writeContract).not.toHaveBeenCalled();
    });
  });

  it('adds the NFT to MetaMask when MetaMask is connected', async () => {
    const user = userEvent.setup();
    renderActions({ showMetaMaskAction: true });
    await user.click(screen.getByRole('button', { name: 'detail.ownerActions.addToMetaMask' }));
    expect(onAddToMetaMask).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderActions({ currentName: 'Twisted Mind', showMetaMaskAction: true });
    await checkA11y(container);
  });
});
