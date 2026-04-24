import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime, getAssetsUrl, getRWLKImageUrl } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import api from '@/services/api';
import { reportError } from '@/utils/errors';
import type { RewardsByToken } from '@/services/api/types';
import NFTImage from '@/components/nft/NFTImage';
import { useActiveWeb3React } from '@/hooks/web3';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RandomWalkRow {
  StakeActionId: number;
  StakedTokenId: number;
  StakeTimeStamp: number;
}

interface CosmicSignatureTokenInfo {
  TokenId: number;
  Seed: number;
  StakeActionId: number;
}

interface CosmicSignatureRow {
  TokenInfo: CosmicSignatureTokenInfo;
  StakeTimeStamp: number;
}

type StakedRow = RandomWalkRow | CosmicSignatureRow;

function useTokenName(
  isRandomWalk: boolean,
  randomWalkId?: number,
  cosmicSignatureInfo?: CosmicSignatureTokenInfo,
) {
  const [tokenName, setTokenName] = useState<string>('');

  useEffect(() => {
    const fetchName = async () => {
      try {
        if (isRandomWalk && typeof randomWalkId === 'number') {
          const res = await api.get_info(randomWalkId);
          setTokenName(res?.CurName || '');
        } else if (!isRandomWalk && cosmicSignatureInfo?.TokenId) {
          const names = await api.get_name_history(cosmicSignatureInfo.TokenId);
          if (names.length > 0) {
            setTokenName(names[names.length - 1]?.TokenName ?? '');
          }
        }
      } catch (err) {
        reportError(err, 'fetch staked token name');
      }
    };
    fetchName();
  }, [isRandomWalk, randomWalkId, cosmicSignatureInfo]);

  return tokenName;
}

interface StakedTokenRowProps {
  row: StakedRow;
  isRandomWalk: boolean;
  isItemSelected: boolean;
  accumulatedRewards: number;
  onRowClick: (id: number) => void;
  onUnstakeSingle: (id: number) => void;
}

const StakedTokenRow = ({
  row,
  isRandomWalk,
  isItemSelected,
  accumulatedRewards,
  onRowClick,
  onUnstakeSingle,
}: StakedTokenRowProps) => {
  const [processing, setProcessing] = useState(false);
  const stakeActionId = isRandomWalk
    ? (row as RandomWalkRow).StakeActionId
    : (row as CosmicSignatureRow).TokenInfo.StakeActionId;
  const tokenId = isRandomWalk
    ? (row as RandomWalkRow).StakedTokenId
    : (row as CosmicSignatureRow).TokenInfo.TokenId;

  const seedOrRandomId = isRandomWalk
    ? (row as RandomWalkRow).StakedTokenId
    : (row as CosmicSignatureRow).TokenInfo.Seed;

  const stakeTimeStamp = isRandomWalk
    ? (row as RandomWalkRow).StakeTimeStamp
    : (row as CosmicSignatureRow).StakeTimeStamp;

  const tokenName = useTokenName(
    isRandomWalk,
    isRandomWalk ? tokenId : undefined,
    !isRandomWalk ? (row as CosmicSignatureRow).TokenInfo : undefined,
  );

  const tokenImageURL = useMemo(() => {
    const fileName = seedOrRandomId.toString().padStart(6, '0');
    return isRandomWalk
      ? getRWLKImageUrl(fileName)
      : getAssetsUrl(`cosmicsignature/0x${fileName}.png`);
  }, [isRandomWalk, seedOrRandomId]);

  if (!row) return null;

  return (
    <TablePrimaryRow
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      className={cn('cursor-pointer', isItemSelected && 'bg-white/[0.08]')}
      onClick={() => onRowClick(stakeActionId)}
    >
      <TablePrimaryCell className="p-2">
        <Checkbox checked={isItemSelected} readOnly />
      </TablePrimaryCell>

      <TablePrimaryCell className="w-[120px]">
        <NFTImage src={tokenImageURL} />
        <span className="text-xs mt-2 block">{tokenName}</span>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <a
          href={isRandomWalk ? `https://randomwalknft.com/detail/${tokenId}` : `/detail/${tokenId}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tokenId}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/anchor-action/${isRandomWalk ? 1 : 0}/${stakeActionId}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {stakeActionId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(stakeTimeStamp)}
      </TablePrimaryCell>

      {!isRandomWalk && (
        <TablePrimaryCell align="center">{accumulatedRewards.toFixed(4)}</TablePrimaryCell>
      )}

      <TablePrimaryCell align="center">
        <Button
          size="sm"
          variant="ghost"
          className="mr-2"
          disabled={processing}
          onClick={async (e) => {
            e.stopPropagation();
            setProcessing(true);
            try {
              await onUnstakeSingle(stakeActionId);
            } finally {
              setProcessing(false);
            }
          }}
        >
          {processing ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Releasing...
            </span>
          ) : (
            'Release'
          )}
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface StakedTokensTableProps {
  list: StakedRow[];
  handleUnstake: (id: number, isRandomWalk?: boolean) => Promise<void>;
  handleUnstakeMany: (ids: number[], isRandomWalk?: boolean) => Promise<void>;
  IsRwalk: boolean;
}

export const StakedTokensTable = ({
  list,
  handleUnstake,
  handleUnstakeMany,
  IsRwalk,
}: StakedTokensTableProps) => {
  const { account } = useActiveWeb3React();
  const perPage = 5;
  const [page, setPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [accumulatedRewardsByToken, setAccumulatedRewardsByToken] = useState<RewardsByToken[]>([]);

  useEffect(() => {
    const fetchAccumulatedRewards = async () => {
      if (account) {
        const rewards = await api.get_staking_rewards_by_user(account);
        setAccumulatedRewardsByToken(rewards);
      }
    };

    if (!IsRwalk) {
      fetchAccumulatedRewards();
    }
  }, [account, IsRwalk]);

  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [list]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < list.length;
    }
  }, [selectedIds.length, list.length]);

  const sortedList = useMemo(() => {
    return [...list].sort((a, b) => {
      const aTime = IsRwalk
        ? (a as RandomWalkRow).StakeTimeStamp
        : (a as CosmicSignatureRow).StakeTimeStamp;
      const bTime = IsRwalk
        ? (b as RandomWalkRow).StakeTimeStamp
        : (b as CosmicSignatureRow).StakeTimeStamp;
      return aTime - bTime;
    });
  }, [list, IsRwalk]);

  const isSelected = (id: number) => selectedIds.includes(id);

  const handleRowClick = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const onSelectAllClick = () => {
    const newSelected = list.map((row) =>
      IsRwalk
        ? (row as RandomWalkRow).StakeActionId
        : (row as CosmicSignatureRow).TokenInfo.StakeActionId,
    );
    setSelectedIds(newSelected);
  };

  const onSelectCurPgClick = () => {
    const newSelected = sortedList
      .slice((page - 1) * perPage, page * perPage)
      .map((row) =>
        IsRwalk
          ? (row as RandomWalkRow).StakeActionId
          : (row as CosmicSignatureRow).TokenInfo.StakeActionId,
      );
    setSelectedIds(newSelected);
  };

  const onSelectNoneClick = () => {
    setSelectedIds([]);
  };

  const onUnstakeManyClick = async () => {
    setProcessing(true);
    try {
      await handleUnstakeMany(selectedIds, IsRwalk);
    } finally {
      setProcessing(false);
    }
  };

  const onUnstakeSingle = async (actionId: number) => {
    setSelectedIds([actionId]);
    await handleUnstake(actionId, IsRwalk);
  };

  if (list.length === 0) {
    return <p className="text-muted-foreground">No tokens yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="5%" />
            <col width="15%" />
            <col width="20%" />
            <col width="15%" />
            <col width="15%" />
            {!IsRwalk && <col width="15%" />}
            <col width="15%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell className="p-2" align="left">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex items-center cursor-pointer">
                      <Checkbox
                        ref={headerCheckboxRef}
                        checked={list.length > 0 && selectedIds.length === list.length}
                        readOnly
                      />
                      <ChevronDown className="h-4 w-4 ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="min-w-[166px]" onClick={onSelectAllClick}>
                      Select All
                    </DropdownMenuItem>
                    <DropdownMenuItem className="min-w-[166px]" onClick={onSelectCurPgClick}>
                      Select Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem className="min-w-[166px]" onClick={onSelectNoneClick}>
                      Select None
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell>Token Image</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Anchor Action ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Anchor Datetime</TablePrimaryHeadCell>
              {!IsRwalk && <TablePrimaryHeadCell>Accumulated Distributions</TablePrimaryHeadCell>}
              <TablePrimaryHeadCell>
                <span className="sr-only">Actions</span>
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {sortedList.slice((page - 1) * perPage, page * perPage).map((row) => {
              const stakeActionId = IsRwalk
                ? (row as RandomWalkRow).StakeActionId
                : (row as CosmicSignatureRow).TokenInfo.StakeActionId;

              const accumulatedRewards = IsRwalk
                ? 0
                : accumulatedRewardsByToken.find(
                    (x) => x.TokenId === (row as CosmicSignatureRow).TokenInfo.TokenId,
                  )?.RewardToCollectEth || 0;

              return (
                <StakedTokenRow
                  key={stakeActionId}
                  row={row}
                  isRandomWalk={IsRwalk}
                  accumulatedRewards={accumulatedRewards}
                  isItemSelected={isSelected(stakeActionId)}
                  onRowClick={handleRowClick}
                  onUnstakeSingle={onUnstakeSingle}
                />
              );
            })}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {selectedIds.length > 1 && (
        <div className="flex justify-end mt-4">
          <Button variant="text" disabled={processing} onClick={onUnstakeManyClick}>
            {processing ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Releasing...
              </span>
            ) : (
              'Release Many'
            )}
          </Button>
        </div>
      )}

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
