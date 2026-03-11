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
      <h4 className="text-2xl font-bold text-primary text-center mb-2">
        Named Cosmic Signature Tokens
      </h4>

      <div className="mt-12">
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
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
          <p className="text-lg font-semibold">No NFTs yet.</p>
        )}
      </div>
    </MainWrapper>
  );
};

export default NamedNFTsPage;
