import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useEffect, useState, useMemo, useRef, type MouseEvent } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';

import { cn } from '@/lib/utils';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

const ITEMS_PER_PAGE = 5;

interface RWLKRowProps {
  tokenId: number;
  ownerAddress: string;
  onSelectToggle: (id: number) => void;
  isSelected: boolean;
  onStake: (tokenId: number) => void;
}

const RWLKRow = ({ tokenId, ownerAddress, onSelectToggle, isSelected, onStake }: RWLKRowProps) => {
  const handleRowClick = () => onSelectToggle(tokenId);

  const handleStakeClick = (e: MouseEvent) => {
    e.stopPropagation();
    onStake(tokenId);
  };

  return (
    <TablePrimaryRow
      role="checkbox"
      tabIndex={-1}
      onClick={handleRowClick}
      className={cn('cursor-pointer', isSelected && 'bg-white/5')}
    >
      <TablePrimaryCell className="!px-3 !py-2">
        <Checkbox checked={isSelected} readOnly className="h-4 w-4" />
      </TablePrimaryCell>

      <TablePrimaryCell>
        <AddressLink address={ownerAddress} url={`/user/${ownerAddress}`} />
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{tokenId}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Button size="sm" onClick={handleStakeClick}>
          Stake
        </Button>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface RWLKNFTTableProps {
  list: number[];
  ownerAddress: string;
  handleStake: (tokenId: number, isRwlk: boolean) => Promise<void>;
  handleStakeMany: (tokenIds: number[], isRwlkFlags: boolean[]) => Promise<void>;
}

export const RWLKNFTTable = ({
  list,
  ownerAddress,
  handleStake,
  handleStakeMany,
}: RWLKNFTTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTokenIds([]);
    setCurrentPage(1);
  }, [list]);

  const isIndeterminate = selectedTokenIds.length > 0 && selectedTokenIds.length < list.length;
  const isAllSelected = list.length > 0 && selectedTokenIds.length === list.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return list.slice(startIndex, endIndex);
  }, [list, currentPage]);

  const isSelected = (id: number) => selectedTokenIds.includes(id);

  const handleSelectToggle = (id: number) => {
    setSelectedTokenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedTokenIds([...list]);
  };

  const handleSelectCurrentPage = () => {
    setSelectedTokenIds([...currentPageData]);
  };

  const handleSelectNone = () => {
    setSelectedTokenIds([]);
  };

  const handleSingleStake = async (tokenId: number) => {
    await handleStake(tokenId, true);
  };

  const handleManyStake = async () => {
    await handleStakeMany(selectedTokenIds, Array(selectedTokenIds.length).fill(true));
  };

  if (list.length === 0) {
    return <p>No available tokens.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="5%" />
            <col width="50%" />
            <col width="25%" />
            <col width="20%" />
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
              <TablePrimaryHeadCell align="left">Owner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell />
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {currentPageData.map((tokenId) => (
              <RWLKRow
                key={tokenId}
                tokenId={tokenId}
                ownerAddress={ownerAddress}
                onSelectToggle={handleSelectToggle}
                isSelected={isSelected(tokenId)}
                onStake={handleSingleStake}
              />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      {selectedTokenIds.length > 1 && (
        <div className="flex justify-end mt-4">
          <Button variant="text" onClick={handleManyStake}>
            Stake Many
          </Button>
        </div>
      )}

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={ITEMS_PER_PAGE}
      />
    </>
  );
};
