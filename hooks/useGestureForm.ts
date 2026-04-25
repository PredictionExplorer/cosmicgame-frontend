import { useState, useEffect, useMemo } from 'react';
import {
  useConfig,
  useChainId,
  usePublicClient,
  useWalletClient,
  useConnectorClient,
  useSwitchChain,
} from 'wagmi';
import { getConnectorClient, writeContract } from '@wagmi/core';
import { formatEther, isAddress, maxUint256, parseEther, parseUnits } from 'viem';

import {
  randomWalkNftAbi as NFT_ABI,
  cosmicTokenAbi as ERC20_ABI,
  cosmicGameAbi,
} from '@/contracts/abis';

import api from '@/services/api';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { activeChain } from '@/config/chains';
import { COSMICGAME_ADDRESS, STELLAR_SELECTION_WALLET_ADDRESS } from '@/config/networks';
import { ERC721_INTERFACE_ID, GESTURE_GAS_LIMIT } from '@/config/constants';
import { isUserRejection, reportError, WALLET_TRANSACTION_CANCELLED_MESSAGE } from '@/utils/errors';
import { getContractErrorMessage } from '@/utils/contractErrors';
import { useNotify } from '@/hooks/useNotify';
import { useCTPrice, useGestureEthCost, useUsedRWLKNFTs } from '@/hooks/useApiQuery';

export interface CSTGestureData {
  AuctionDuration: number;
  CSTPrice: number;
  SecondsElapsed: number;
}

export interface EthGestureInfo {
  AuctionDuration: number;
  ETHPrice: number;
  SecondsElapsed: number;
}

export function useGestureForm() {
  const config = useConfig();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { data: connectorClient } = useConnectorClient({ chainId: activeChain.id });
  const { data: walletClient } = useWalletClient({ chainId: activeChain.id });
  const client = (connectorClient ?? walletClient) as ReturnType<typeof useWalletClient>['data'];
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const { notify, notifyErrorFromEthers } = useNotify();

  const { data: ctPriceData } = useCTPrice();
  const { data: bidEthPriceData } = useGestureEthCost();
  const { data: usedRWLKData } = useUsedRWLKNFTs();

  const [gestureType, setBidType] = useState('ETH');
  const [contributionType, setContributionType] = useState('NFT');
  const [message, setMessage] = useState('');
  const [nftDonateAddress, setNftDonateAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [tokenDonateAddress, setTokenDonateAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [rwlkId, setRwlkId] = useState(-1);
  const [gestureCostPlus, setBidPricePlus] = useState(2);
  const [isGesturing, setIsBidding] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);

  const cstGestureData = useMemo<CSTGestureData>(() => {
    if (!ctPriceData) return { AuctionDuration: 0, CSTPrice: 0, SecondsElapsed: 0 };
    return {
      AuctionDuration: parseInt(ctPriceData.AuctionDuration),
      CSTPrice: parseFloat(formatEther(BigInt(ctPriceData.CSTPrice))),
      SecondsElapsed: parseInt(ctPriceData.SecondsElapsed),
    };
  }, [ctPriceData]);

  const ethGestureInfo = useMemo<EthGestureInfo | null>(() => {
    if (!bidEthPriceData) return null;
    return {
      AuctionDuration: parseInt(bidEthPriceData.AuctionDuration),
      ETHPrice: parseFloat(formatEther(BigInt(bidEthPriceData.ETHPrice))),
      SecondsElapsed: parseInt(bidEthPriceData.SecondsElapsed),
    };
  }, [bidEthPriceData]);

  const handleTx = async (hashPromise: Promise<`0x${string}`>) => {
    const hash = await hashPromise;
    await publicClient!.waitForTransactionReceipt({ hash });
  };

  const isContractAddress = async (address: string) => {
    if (!isAddress(address)) return false;
    try {
      const byteCode = await publicClient!.getCode({ address: address as `0x${string}` });
      return !!byteCode && byteCode !== '0x';
    } catch {
      return false;
    }
  };

  const isERC721 = async (nftAddress: string) => {
    try {
      return await publicClient!.readContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'supportsInterface',
        args: [ERC721_INTERFACE_ID],
      });
    } catch {
      return false;
    }
  };

  const ensureNftOwnership = async (nftAddress: string, tokenId: number) => {
    try {
      const owner = (await publicClient!.readContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      })) as string;
      if (owner?.toLowerCase() !== account?.toLowerCase()) {
        notify('error', "You aren't the owner of the token!");
        return false;
      }
      return true;
    } catch (err) {
      notifyErrorFromEthers(err);
      return false;
    }
  };

  const ensureNftApprovalForAll = async (nftAddress: string) => {
    const approved = await publicClient!.readContract({
      address: nftAddress as `0x${string}`,
      abi: NFT_ABI,
      functionName: 'isApprovedForAll',
      args: [account as `0x${string}`, STELLAR_SELECTION_WALLET_ADDRESS as `0x${string}`],
    });
    if (!approved) {
      const hash = await writeContract(config, {
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [STELLAR_SELECTION_WALLET_ADDRESS as `0x${string}`, true],
        account: account!,
        chainId: activeChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
    }
  };

  const ensureErc20Allowance = async (tokenAddress: string, required: bigint) => {
    let approved = false;
    const allowance = (await publicClient!.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account as `0x${string}`, STELLAR_SELECTION_WALLET_ADDRESS as `0x${string}`],
    })) as bigint;

    if (allowance < maxUint256) {
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STELLAR_SELECTION_WALLET_ADDRESS as `0x${string}`, maxUint256],
        account: account!,
        chainId: activeChain.id,
      });
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      approved = receipt.status === 'success';
    }
    if (!approved && allowance < required) {
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STELLAR_SELECTION_WALLET_ADDRESS as `0x${string}`, required],
        account: account!,
        chainId: activeChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
    }
  };

  const getErc20Decimals = async (tokenAddress: string) => {
    try {
      return (await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })) as number;
    } catch {
      console.warn('decimals() not found, assuming 18.');
      notify('warning', "Token doesn't implement decimals(); assuming 18 decimal places.");
      return 18;
    }
  };

  const hasEthBalance = async (amount: bigint) => {
    try {
      const bal = await publicClient!.getBalance({ address: account as `0x${string}` });
      return bal >= amount;
    } catch (e) {
      reportError(e, 'check ETH balance');
      return false;
    }
  };

  const hasCstBalance = async (amountWei: bigint) => {
    try {
      const bal = await api.get_user_balance(account!);
      if (!bal) return false;
      const wallet = BigInt(bal.CosmicTokenBalance);
      return wallet >= amountWei;
    } catch (e) {
      reportError(e, 'check CST balance');
      return false;
    }
  };

  const getNextEthGestureCostWithModifiers = async () => {
    const base = (await cosmicGameContract!.read.getNextEthBidPrice?.()) as bigint;
    let price = (base * parseEther((100 + gestureCostPlus).toString())) / parseEther('100');
    if (gestureType === 'RandomWalk') {
      price = (price * parseEther('50')) / parseEther('100');
    }
    return price;
  };

  const withNftDonation = async (nftAddress: string, tokenId: number) => {
    if (!nftAddress || nftAddress.trim() === '' || Number.isNaN(tokenId)) {
      throw new Error('Missing attached NFT address or tokenId.');
    }
    if (!(await isContractAddress(nftAddress))) {
      notify('error', 'The address provided is not a valid contract address!');
      return false;
    }
    if (!(await isERC721(nftAddress))) {
      notify('error', 'The attached NFT contract is not an ERC721 token contract.');
      return false;
    }
    if (!(await ensureNftOwnership(nftAddress, tokenId))) return false;
    await ensureNftApprovalForAll(nftAddress);
    return true;
  };

  const withTokenDonation = async (tokenAddress: string, amountStr: string) => {
    if (!tokenAddress || !amountStr) {
      throw new Error('Missing attached token address or amount.');
    }
    if (!(await isContractAddress(tokenAddress))) {
      notify('error', 'The address provided is not a valid contract address!');
      return { ok: false as const };
    }

    try {
      const ts = await publicClient!.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      });
      if (!ts) throw new Error('Not an ERC20');
    } catch {
      notify('error', 'The attached token contract is not an ERC20 token contract.');
      return { ok: false as const };
    }

    const decimals = await getErc20Decimals(tokenAddress);
    const amountWei = parseUnits(amountStr, decimals);
    const bal = (await publicClient!.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account as `0x${string}`],
    })) as bigint;

    if (bal < amountWei) {
      notify('error', 'Insufficient token balance to attach to this gesture.');
      return { ok: false as const };
    }
    await ensureErc20Allowance(tokenAddress, amountWei);
    return { ok: true as const, amountWei, decimals };
  };

  const estimateDonationGas = async (
    fnName: string,
    args: unknown[],
    value: bigint,
  ): Promise<bigint> => {
    try {
      const estimate = await publicClient!.estimateContractGas({
        address: COSMICGAME_ADDRESS as `0x${string}`,
        abi: cosmicGameAbi,
        functionName: fnName,
        args,
        value,
        account: account as `0x${string}`,
      });
      return estimate * 2n;
    } catch {
      return GESTURE_GAS_LIMIT;
    }
  };

  /**
   * EIP-1559 fees with floor from current block to avoid "max fee per gas less than block base fee".
   * Uses latest block baseFee * 2 as min to handle block progression and wallet re-estimation.
   */
  const getFeeParams = async (): Promise<{
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }> => {
    if (!publicClient) return {};
    try {
      const [block, fees] = await Promise.all([
        publicClient.getBlock({ blockTag: 'latest' }),
        publicClient.estimateFeesPerGas({ chain: activeChain }),
      ]);
      const baseFee = block?.baseFeePerGas ?? 0n;
      const minFromBase = baseFee ? (baseFee * 200n) / 100n : 0n;
      const fromEstimate =
        fees?.maxFeePerGas && fees?.maxPriorityFeePerGas ? (fees.maxFeePerGas * 125n) / 100n : 0n;
      const maxFeePerGas = fromEstimate > minFromBase ? fromEstimate : minFromBase;
      const maxPriorityFeePerGas = fees?.maxPriorityFeePerGas ?? 1_000_000_000n;
      if (maxFeePerGas > 0n) {
        return { maxFeePerGas, maxPriorityFeePerGas };
      }
    } catch {
      /* fallback: no fee override, wallet will supply */
    }
    return {};
  };

  /**
   * Submit an ETH bid (with optional NFT/token donation).
   * Returns `true` on success so the caller can trigger a post-tx refresh.
   */
  const onGesture = async (): Promise<boolean> => {
    setIsBidding(true);
    try {
      if (!account) {
        notify('error', 'Please connect your wallet.');
        return false;
      }
      if (chainId != null && chainId !== activeChain.id) {
        try {
          await switchChainAsync({ chainId: activeChain.id });
        } catch (err) {
          if (isUserRejection(err)) {
            notify('info', WALLET_TRANSACTION_CANCELLED_MESSAGE);
          } else {
            notify(
              'error',
              `Please switch to ${activeChain.name} in your wallet to make a gesture.`,
            );
          }
          return false;
        }
      }
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return false;
      }

      const ethGestureCost = await getNextEthGestureCostWithModifiers();

      if (!(await hasEthBalance(ethGestureCost))) {
        notify('error', "Insufficient ETH balance! There isn't enough ETH in your wallet.");
        return false;
      }

      const noDonation =
        (contributionType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (contributionType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !contributionType) {
        const signerAddress =
          (client as { account?: { address: `0x${string}` } } | undefined)?.account?.address ??
          (account as `0x${string}`);
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithEth',
          args: [rwlkId, message],
          account: signerAddress,
          value: ethGestureCost,
          gas: GESTURE_GAS_LIMIT,
          chainId: activeChain.id,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        return true;
      }

      if (contributionType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) return false;
        const donateArgs = [rwlkId, message, nftDonateAddress, nftIdNum];
        const gas = await estimateDonationGas('bidWithEthAndDonateNft', donateArgs, ethGestureCost);
        const signerAddress =
          (client as { account?: { address: `0x${string}` } } | undefined)?.account?.address ??
          (account as `0x${string}`);
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithEthAndDonateNft',
          args: donateArgs,
          account: signerAddress,
          value: ethGestureCost,
          gas,
          chainId: activeChain.id,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) return false;
        const donateArgs = [rwlkId, message, tokenDonateAddress, res.amountWei];
        const gas = await estimateDonationGas(
          'bidWithEthAndDonateToken',
          donateArgs,
          ethGestureCost,
        );
        const signerAddress =
          (client as { account?: { address: `0x${string}` } } | undefined)?.account?.address ??
          (account as `0x${string}`);
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithEthAndDonateToken',
          args: donateArgs,
          account: signerAddress,
          value: ethGestureCost,
          gas,
          chainId: activeChain.id,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      return true;
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        notify('info', WALLET_TRANSACTION_CANCELLED_MESSAGE);
        return false;
      }
      reportError(err, 'gesture-eth');
      const msg = getContractErrorMessage(err, ethGestureInfo?.ETHPrice);
      if (msg) {
        notify('error', msg);
      } else {
        notifyErrorFromEthers(err);
      }
      return false;
    } finally {
      setIsBidding(false);
    }
  };

  /**
   * Submit a CST bid (with optional NFT/token donation).
   * Returns `true` on success so the caller can trigger a post-tx refresh.
   */
  const onGestureWithCST = async (): Promise<boolean> => {
    setIsBidding(true);
    try {
      if (!account) {
        notify('error', 'Please connect your wallet.');
        return false;
      }
      if (chainId != null && chainId !== activeChain.id) {
        try {
          await switchChainAsync({ chainId: activeChain.id });
        } catch (err) {
          if (isUserRejection(err)) {
            notify('info', WALLET_TRANSACTION_CANCELLED_MESSAGE);
          } else {
            notify(
              'error',
              `Please switch to ${activeChain.name} in your wallet to make a gesture.`,
            );
          }
          return false;
        }
      }
      let signerClient = client;
      if (!signerClient) {
        signerClient = (await getConnectorClient(config, { chainId: activeChain.id })) ?? undefined;
      }
      if (!signerClient) {
        notify('error', 'Wallet is still connecting. Please try again in a moment.');
        return false;
      }
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return false;
      }
      const signerAddress =
        (signerClient as { account?: { address: `0x${string}` } } | undefined)?.account?.address ??
        (account as `0x${string}`);

      if (cstGestureData?.CSTPrice > 0) {
        const cstWei = parseEther(cstGestureData.CSTPrice.toString());
        if (!(await hasCstBalance(cstWei))) {
          notify(
            'error',
            "Insufficient CST balance! There isn't enough Cosmic Token in your wallet.",
          );
          return false;
        }
      }

      const priceMaxLimit = await cosmicGameContract.read.getNextCstBidPrice?.();

      const noDonation =
        (contributionType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (contributionType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !contributionType) {
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithCst',
          args: [priceMaxLimit, message],
          account: signerAddress,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        return true;
      }

      if (contributionType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) return false;
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithCstAndDonateNft',
          args: [priceMaxLimit, message, nftDonateAddress, nftIdNum],
          account: signerAddress,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) return false;
        const feeParams = await getFeeParams();
        const hash = await writeContract(config, {
          address: COSMICGAME_ADDRESS as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'bidWithCstAndDonateToken',
          args: [priceMaxLimit, message, tokenDonateAddress, res.amountWei],
          account: signerAddress,
          ...feeParams,
        });
        await handleTx(Promise.resolve(hash));
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      return true;
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        notify('info', WALLET_TRANSACTION_CANCELLED_MESSAGE);
        return false;
      }
      reportError(err, 'gesture-cst');
      const msg = getContractErrorMessage(err);
      if (msg) {
        notify('error', msg);
      } else {
        notifyErrorFromEthers(err);
      }
      return false;
    } finally {
      setIsBidding(false);
    }
  };

  useEffect(() => {
    if (!nftRWLKContract || !account || !usedRWLKData) return;
    const gesturedRWLKIds = usedRWLKData.map((x) => x.RWalkTokenId);
    (nftRWLKContract.read.walletOfOwner?.([account]) as Promise<readonly bigint[]>)
      .then((tokens) => {
        const nftIds = tokens
          .map((t) => Number(t))
          .filter((t: number) => !gesturedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      })
      .catch((e) => reportError(e, 'getRwlkNFTIds'));
  }, [nftRWLKContract, account, usedRWLKData]);

  return {
    gestureType,
    setBidType,
    contributionType,
    setContributionType,
    cstGestureData,
    ethGestureInfo,
    message,
    setMessage,
    nftDonateAddress,
    setNftDonateAddress,
    nftId,
    setNftId,
    tokenDonateAddress,
    setTokenDonateAddress,
    tokenAmount,
    setTokenAmount,
    rwlkId,
    setRwlkId,
    gestureCostPlus,
    setBidPricePlus,
    isGesturing,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    onGesture,
    onGestureWithCST,
  } as const;
}
