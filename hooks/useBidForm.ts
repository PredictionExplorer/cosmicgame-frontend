import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, isAddress, maxUint256, parseEther, parseUnits } from 'viem';

import { randomWalkNftAbi as NFT_ABI, cosmicTokenAbi as ERC20_ABI } from '@/contracts/abis';

import api from '@/services/api';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { RAFFLE_WALLET_ADDRESS } from '@/config/networks';
import { ERC721_INTERFACE_ID, BID_GAS_LIMIT } from '@/config/constants';
import type { UsedRWLKNFT } from '@/services/api/types';
import { isUserRejection, isEthProviderError, reportError } from '@/utils/errors';
import { useNotify } from '@/hooks/useNotify';

export interface CSTBidData {
  AuctionDuration: number;
  CSTPrice: number;
  SecondsElapsed: number;
}

export interface EthBidInfo {
  AuctionDuration: number;
  ETHPrice: number;
  SecondsElapsed: number;
}

export function useBidForm() {
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();
  const { notify, notifyErrorFromEthers } = useNotify();

  const [bidType, setBidType] = useState('ETH');
  const [donationType, setDonationType] = useState('NFT');
  const [cstBidData, setCSTBidData] = useState<CSTBidData>({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [ethBidInfo, setEthBidInfo] = useState<EthBidInfo | null>(null);
  const [message, setMessage] = useState('');
  const [nftDonateAddress, setNftDonateAddress] = useState('');
  const [nftId, setNftId] = useState('');
  const [tokenDonateAddress, setTokenDonateAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [rwlkId, setRwlkId] = useState(-1);
  const [bidPricePlus, setBidPricePlus] = useState(2);
  const [isBidding, setIsBidding] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);

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
      args: [account as `0x${string}`, RAFFLE_WALLET_ADDRESS as `0x${string}`],
    });
    if (!approved) {
      const hash = await walletClient!.writeContract({
        address: nftAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, true],
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
      args: [account as `0x${string}`, RAFFLE_WALLET_ADDRESS as `0x${string}`],
    })) as bigint;

    if (allowance < maxUint256) {
      const hash = await walletClient!.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, maxUint256],
      });
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      approved = receipt.status === 'success';
    }
    if (!approved && allowance < required) {
      const hash = await walletClient!.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [RAFFLE_WALLET_ADDRESS as `0x${string}`, required],
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

  const getNextEthBidPriceWithModifiers = async () => {
    const base = (await cosmicGameContract!.read.getNextEthBidPrice?.()) as bigint;
    let price = (base * parseEther((100 + bidPricePlus).toString())) / parseEther('100');
    if (bidType === 'RandomWalk') {
      price = (price * parseEther('50')) / parseEther('100');
    }
    return price;
  };

  const withNftDonation = async (nftAddress: string, tokenId: number) => {
    if (!nftAddress || nftAddress.trim() === '' || Number.isNaN(tokenId)) {
      throw new Error('Missing NFT donation address or tokenId.');
    }
    if (!(await isContractAddress(nftAddress))) {
      notify('error', 'The address provided is not a valid contract address!');
      return false;
    }
    if (!(await isERC721(nftAddress))) {
      notify('error', 'The donate NFT contract is not an ERC721 token contract.');
      return false;
    }
    if (!(await ensureNftOwnership(nftAddress, tokenId))) return false;
    await ensureNftApprovalForAll(nftAddress);
    return true;
  };

  const withTokenDonation = async (tokenAddress: string, amountStr: string) => {
    if (!tokenAddress || !amountStr) {
      throw new Error('Missing token donation address or amount.');
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
      notify('error', 'The donate token contract is not an ERC20 token contract.');
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
      notify('error', 'Insufficient token balance for donation.');
      return { ok: false as const };
    }
    await ensureErc20Allowance(tokenAddress, amountWei);
    return { ok: true as const, amountWei, decimals };
  };

  /**
   * Submit an ETH bid (with optional NFT/token donation).
   * Returns `true` on success so the caller can trigger a post-tx refresh.
   */
  const onBid = async (): Promise<boolean> => {
    setIsBidding(true);
    try {
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return false;
      }

      const ethBidPrice = await getNextEthBidPriceWithModifiers();

      if (!(await hasEthBalance(ethBidPrice))) {
        notify('error', "Insufficient ETH balance! There isn't enough ETH in your wallet.");
        return false;
      }

      const noDonation =
        (donationType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (donationType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !donationType) {
        await handleTx(
          (
            cosmicGameContract.write.bidWithEth as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message], { value: ethBidPrice, gas: BID_GAS_LIMIT }),
        );
        return true;
      }

      if (donationType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) return false;
        await handleTx(
          (
            cosmicGameContract.write.bidWithEthAndDonateNft as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message, nftDonateAddress, nftIdNum], { value: ethBidPrice }),
        );
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) return false;
        await handleTx(
          (
            cosmicGameContract.write.bidWithEthAndDonateToken as unknown as (
              ...a: unknown[]
            ) => Promise<`0x${string}`>
          )([rwlkId, message, tokenDonateAddress, res.amountWei], { value: ethBidPrice }),
        );
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      return true;
    } catch (err: unknown) {
      if (!isUserRejection(err)) {
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
  const onBidWithCST = async (): Promise<boolean> => {
    setIsBidding(true);
    try {
      if (!cosmicGameContract) {
        notify('error', 'Please connect your wallet and ensure you are on the correct network.');
        return false;
      }

      if (cstBidData?.CSTPrice > 0) {
        const cstWei = parseEther(cstBidData.CSTPrice.toString());
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
        (donationType === 'NFT' && (!nftDonateAddress || !nftId)) ||
        (donationType === 'Token' && (!tokenDonateAddress || !tokenAmount));

      if (noDonation || !donationType) {
        await handleTx(cosmicGameContract.write.bidWithCst!([priceMaxLimit, message]));
        return true;
      }

      if (donationType === 'NFT') {
        const nftIdNum = Number(nftId);
        const ok = await withNftDonation(nftDonateAddress!, nftIdNum);
        if (!ok) return false;
        await handleTx(
          cosmicGameContract.write.bidWithCstAndDonateNft!([
            priceMaxLimit,
            message,
            nftDonateAddress,
            nftIdNum,
          ]),
        );
        setNftId('');
        setNftDonateAddress('');
      } else {
        const res = await withTokenDonation(tokenDonateAddress!, tokenAmount!);
        if (!res.ok) return false;
        await handleTx(
          cosmicGameContract.write.bidWithCstAndDonateToken!([
            priceMaxLimit,
            message,
            tokenDonateAddress,
            res.amountWei,
          ]),
        );
        setTokenAmount('');
        setTokenDonateAddress('');
      }

      return true;
    } catch (err: unknown) {
      if (!isUserRejection(err)) {
        if (isEthProviderError(err) && err.data?.message) {
          notify('error', err.data.message);
        } else {
          notifyErrorFromEthers(err);
        }
      }
      return false;
    } finally {
      setIsBidding(false);
    }
  };

  const getRwlkNFTIds = useCallback(async () => {
    try {
      if (nftRWLKContract && account) {
        const used_rwalk = await api.get_used_rwlk_nfts();
        const biddedRWLKIds = used_rwalk.map((x: UsedRWLKNFT) => x.RWalkTokenId);
        const tokens = (await nftRWLKContract.read.walletOfOwner?.([account])) as readonly bigint[];
        const nftIds = tokens
          .map((t) => Number(t))
          .filter((t: number) => !biddedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      }
    } catch (e) {
      reportError(e, 'getRwlkNFTIds');
    }
  }, [nftRWLKContract, account]);

  const fetchCSTBidData = useCallback(async () => {
    try {
      const ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(formatEther(BigInt(ctData.CSTPrice))),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    } catch (err) {
      reportError(err, 'fetch CST bid data');
    }
  }, []);

  const fetchEthBidInfo = useCallback(async () => {
    try {
      const info = await api.get_bid_eth_price();
      if (info) {
        setEthBidInfo({
          AuctionDuration: parseInt(info.AuctionDuration),
          ETHPrice: parseFloat(formatEther(BigInt(info.ETHPrice))),
          SecondsElapsed: parseInt(info.SecondsElapsed),
        });
      }
    } catch (err) {
      reportError(err, 'fetch ETH bid info');
    }
  }, []);

  useEffect(() => {
    if (nftRWLKContract && account) {
      getRwlkNFTIds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftRWLKContract, account]);

  return {
    bidType,
    setBidType,
    donationType,
    setDonationType,
    cstBidData,
    ethBidInfo,
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
    bidPricePlus,
    setBidPricePlus,
    isBidding,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    onBid,
    onBidWithCST,
    getRwlkNFTIds,
    fetchCSTBidData,
    fetchEthBidInfo,
  } as const;
}
