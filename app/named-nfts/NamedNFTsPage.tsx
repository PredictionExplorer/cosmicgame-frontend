'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tr, Tbody } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useNamedNFTs } from '@/hooks/useApiQuery';
import type { CSTTokenInfo } from '@/services/api';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

const NamedNFTRow = ({ nft }: { nft: CSTTokenInfo }) => {
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(nft.MintTimeStamp ?? nft.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/detail/${nft.TokenId}`} className="text-inherit text-[inherit]">
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>{nft.TokenName ?? ''}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NamedNFTsTable = ({ list }: { list: CSTTokenInfo[] }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Token Name</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <Tbody>
          {list.map((nft, i: number) => (
            <NamedNFTRow key={i} nft={nft} />
          ))}
        </Tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const NamedNFTsPage = () => {
  const [curPage, setCurPage] = useState(1);
  const perPage = 5;
  const { data: list = [], isLoading: loading } = useNamedNFTs();

  return (
    <MainWrapper>
      <PageHeader
        title="Named Cosmic Signature Tokens"
        subtitle="Browse tokens that have been given custom names"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Cosmic Signature NFT owners can give their tokens custom names, creating a unique identity
        within the collection. Named tokens stand out in the gallery and carry the personal touch of
        their owners.
      </p>

      <div className="mt-12">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : list.length > 0 ? (
          <>
            <NamedNFTsTable list={list.slice((curPage - 1) * perPage, curPage * perPage)} />
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <EmptyState
            title="No named tokens"
            description="No Cosmic Signature tokens have been named yet."
          />
        )}
      </div>
    </MainWrapper>
  );
};

export default NamedNFTsPage;
