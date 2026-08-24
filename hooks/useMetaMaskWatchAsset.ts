'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { isUserRejection, reportError } from '@/utils/errors';

import { useNotify } from './useNotify';
import { useRequireChain } from './useRequireChain';

type WatchAssetKind = 'cst' | 'nft';

type WatchAssetParams =
  | {
      type: 'ERC20';
      options: {
        address: string;
        symbol: string;
        decimals: number;
        image?: string;
      };
    }
  | {
      type: 'ERC721';
      options: {
        address: string;
        tokenId: string;
      };
    };

interface WatchAssetProvider {
  request: (args: { method: 'wallet_watchAsset'; params: WatchAssetParams }) => Promise<unknown>;
}

interface MetaMaskConnectorLike {
  id?: string;
  name?: string;
}

function hasWatchAssetProvider(value: unknown): value is WatchAssetProvider {
  return (
    typeof value === 'object' &&
    value !== null &&
    'request' in value &&
    typeof (value as { request?: unknown }).request === 'function'
  );
}

/** RainbowKit and wagmi have used both identifiers for the injected MetaMask connector. */
export function isMetaMaskConnector(connector: MetaMaskConnectorLike | null | undefined): boolean {
  const id = connector?.id?.toLowerCase();
  const name = connector?.name?.toLowerCase();
  return id === 'metamask' || id === 'io.metamask' || name === 'metamask';
}

export function useMetaMaskWatchAsset() {
  const t = useTranslations('toasts');
  const { notify } = useNotify();
  const { connector, isConnected } = useAccount();
  const { ensureCorrectChain } = useRequireChain();
  const contractAddresses = useContractAddresses();
  const [pendingAsset, setPendingAsset] = useState<WatchAssetKind | null>(null);
  const pendingAssetRef = useRef<WatchAssetKind | null>(null);

  const isMetaMaskConnected = Boolean(isConnected && isMetaMaskConnector(connector));

  const requestWatchAsset = useCallback(
    async (
      kind: WatchAssetKind,
      params: WatchAssetParams,
      successMessage: string,
      failureMessage: string,
    ): Promise<boolean> => {
      if (pendingAssetRef.current) return false;

      if (!isConnected || !connector || !isMetaMaskConnector(connector)) {
        notify('error', t('watchAsset.metaMaskRequired'));
        return false;
      }

      pendingAssetRef.current = kind;
      setPendingAsset(kind);
      try {
        if (!(await ensureCorrectChain())) return false;

        const provider = await connector.getProvider();
        if (!hasWatchAssetProvider(provider)) {
          notify('error', t('watchAsset.providerUnavailable'));
          return false;
        }

        const wasAdded = await provider.request({
          method: 'wallet_watchAsset',
          params,
        });

        if (wasAdded === true) {
          notify('success', successMessage);
          return true;
        }

        notify('info', t('watchAsset.notAdded'));
        return false;
      } catch (error) {
        if (isUserRejection(error)) {
          notify('info', t('watchAsset.cancelled'));
          return false;
        }

        reportError(error, `MetaMask wallet_watchAsset ${kind}`);
        notify('error', failureMessage);
        return false;
      } finally {
        pendingAssetRef.current = null;
        setPendingAsset(null);
      }
    },
    [connector, ensureCorrectChain, isConnected, notify, t],
  );

  const addCst = useCallback(async (): Promise<boolean> => {
    const address = contractAddresses.cosmicToken;
    if (!isAddress(address)) {
      notify('error', t('watchAsset.cstUnavailable'));
      return false;
    }

    const image =
      typeof window === 'undefined'
        ? undefined
        : new URL('/images/logo2.svg', window.location.origin).href;

    return requestWatchAsset(
      'cst',
      {
        type: 'ERC20',
        options: {
          address,
          symbol: 'CST',
          decimals: 18,
          ...(image ? { image } : {}),
        },
      },
      t('watchAsset.cstAdded'),
      t('watchAsset.cstFailed'),
    );
  }, [contractAddresses.cosmicToken, notify, requestWatchAsset, t]);

  const addCosmicSignatureNft = useCallback(
    async (tokenId: number | bigint | string): Promise<boolean> => {
      const address = contractAddresses.cosmicSignature;
      if (!isAddress(address)) {
        notify('error', t('watchAsset.nftUnavailable'));
        return false;
      }

      return requestWatchAsset(
        'nft',
        {
          type: 'ERC721',
          options: {
            address,
            tokenId: String(tokenId),
          },
        },
        t('watchAsset.nftAdded'),
        t('watchAsset.nftFailed'),
      );
    },
    [contractAddresses.cosmicSignature, notify, requestWatchAsset, t],
  );

  return {
    isMetaMaskConnected,
    isAddingCst: pendingAsset === 'cst',
    isAddingNft: pendingAsset === 'nft',
    addCst,
    addCosmicSignatureNft,
  } as const;
}
