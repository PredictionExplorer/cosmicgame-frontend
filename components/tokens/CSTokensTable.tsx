import { useEffect, useState, useMemo, useRef, type MouseEvent } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { cn } from '@/lib/utils';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import type { CSTTokenInfo } from '@/services/api';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

interface CSTokenRowProps {
  row: CSTTokenInfo & { Staked?: boolean };
  onSelectToggle: (id: number) => void;
  onStakeSingle: (id: number) => Promise<void>;
  isItemSelected: boolean;
}

const CSTokenRow = ({ row, onSelectToggle, onStakeSingle, isItemSelected }: CSTokenRowProps) => {
  const [processing, setProcessing] = useState(false);
  if (!row) return null;

  const { TokenId, TxHash, TimeStamp, TokenName, RoundNum, WinnerAddr, Staked } = row;

  const handleRowClick = () => onSelectToggle(TokenId);

  const handleStakeClick = async (e: MouseEvent) => {
    e.stopPropagation();
    setProcessing(true);
    try {
      await onStakeSingle(TokenId);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <TablePrimaryRow
      role="checkbox"
      tabIndex={-1}
      onClick={handleRowClick}
      className={cn('cursor-pointer', isItemSelected && 'bg-white/5')}
    >
      <TablePrimaryCell className="!px-3 !py-2">
        <Checkbox checked={isItemSelected} readOnly className="h-4 w-4" />
      </TablePrimaryCell>

      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${TokenId}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {TokenId}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{TokenName || ' '}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          className="text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <AddressLink address={String(WinnerAddr ?? '')} url={`/user/${WinnerAddr ?? ''}`} />
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {!Staked && (
          <Button size="sm" disabled={processing} onClick={handleStakeClick}>
            {processing ? (
              <span className="flex items-center gap-1">
                <Spinner size="sm" />
                Staking...
              </span>
            ) : (
              'Stake'
            )}
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface CSTokensTableProps {
  list: (CSTTokenInfo & { Staked?: boolean })[];
  handleStake: (id: number, isRwlk: boolean) => Promise<void>;
  handleStakeMany: (ids: number[], isRwlkFlags: boolean[]) => Promise<void>;
}

export const CSTokensTable = ({ list, handleStake, handleStakeMany }: CSTokensTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedTokenIds([]);
    setPage(1);
  }, [list]);

  const isIndeterminate = selectedTokenIds.length > 0 && selectedTokenIds.length < list.length;
  const isAllSelected = list.length > 0 && selectedTokenIds.length === list.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    return list.slice(startIndex, endIndex);
  }, [list, page]);

  const isSelected = (id: number) => selectedTokenIds.includes(id);

  const handleSelectToggle = (id: number) => {
    setSelectedTokenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedTokenIds(list.map((row) => row.TokenId));
  };

  const handleSelectCurrentPage = () => {
    setSelectedTokenIds(pageItems.map((row) => row.TokenId));
  };

  const handleSelectNone = () => {
    setSelectedTokenIds([]);
  };

  const handleStakeSingle = async (id: number) => {
    setSelectedTokenIds([id]);
    await handleStake(id, false);
  };

  const handleStakeManySelected = async () => {
    setProcessing(true);
    try {
      await handleStakeMany(selectedTokenIds, Array(selectedTokenIds.length).fill(false));
    } finally {
      setProcessing(false);
    }
  };

  if (list.length === 0) {
    return <p>No available tokens.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="3%" />
            <col width="25%" />
            <col width="10%" />
            <col width="15%" />
            <col width="10%" />
            <col width="25%" />
            <col width="12%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left" className="!px-3 !py-2">
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="hidden sm:flex items-center cursor-pointer">
                      <Checkbox
                        ref={headerCheckboxRef}
                        checked={isAllSelected}
                        readOnly
                        className="h-4 w-4"
                      />
                      {menuOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[166px]">
                    <DropdownMenuItem onSelect={handleSelectAll}>Select All</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleSelectCurrentPage}>
                      Select Current Page
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleSelectNone}>Select None</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TablePrimaryHeadCell>

              <TablePrimaryHeadCell align="left">Mint Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token Name</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Winner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {pageItems.map((row) => (
              <CSTokenRow
                key={row.EvtLogId}
                row={row}
                isItemSelected={isSelected(row.TokenId)}
                onSelectToggle={handleSelectToggle}
                onStakeSingle={handleStakeSingle}
              />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {selectedTokenIds.length > 1 && (
        <div className="flex justify-end mt-4">
          <Button variant="text" disabled={processing} onClick={handleStakeManySelected}>
            {processing ? (
              <span className="flex items-center gap-1">
                <Spinner size="sm" />
                Staking...
              </span>
            ) : (
              'Stake Many'
            )}
          </Button>
        </div>
      )}

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
