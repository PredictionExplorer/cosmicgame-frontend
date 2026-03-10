'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Fireworks, { FireworksHandlers } from '@fireworks-js/react';

import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import { reportError } from '@/utils/errors';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const PrizeClaimedPage = () => {
  const searchParams = useSearchParams();

  const fireworksRef = useRef<FireworksHandlers>(null);

  const [finishFireworks, setFinishFireworks] = useState(false);

  const [prizeInfo, setPrizeInfo] = useState<import('@/services/api/types').RoundInfo | null>(null);

  const [loading, setLoading] = useState(true);

  const handleFireworksClick = () => {
    fireworksRef.current?.stop();
    setFinishFireworks(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const roundStr = searchParams.get('round');
        const roundNum = parseInt(roundStr ?? '0');

        const fetchedPrizeInfo = await api.get_round_info(roundNum);
        setPrizeInfo(fetchedPrizeInfo);
        setLoading(false);
      } catch (error) {
        reportError(error, 'fetch prize claimed info');
        setLoading(false);
      }
    };

    if (searchParams.get('round') !== null) {
      fetchData();
    }
  }, [searchParams]);

  return (
    <MainWrapper>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : prizeInfo === null ? (
        <h6 className="text-lg font-semibold">No prize information.</h6>
      ) : (
        <>
          {searchParams.get('message') && !finishFireworks && (
            <Fireworks
              ref={fireworksRef}
              options={{ opacity: 0.5 }}
              style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                position: 'fixed',
                zIndex: 10000,
              }}
              onClick={handleFireworksClick}
            />
          )}

          <h4 className="text-2xl font-bold text-primary text-center mb-12">
            {`Congratulations! You won Round ${prizeInfo.RoundNum}.`}
          </h4>

          <h5 className="text-xl font-bold mb-4">{`Round ${prizeInfo.RoundNum} rewards are:`}</h5>
          <div className="ml-8">
            <p className="text-base">{prizeInfo?.AmountEth.toFixed(6)} ETH</p>

            <p className="text-base">
              Cosmic Signature Token Number{' '}
              <Link href={`/detail/${prizeInfo.TokenId}`} className="text-inherit text-[inherit]">
                {prizeInfo.TokenId}
              </Link>
            </p>

            {!!(prizeInfo.RoundStats.TotalDonatedNFTs as number) && (
              <p className="text-base">
                {prizeInfo.RoundStats.TotalDonatedNFTs as ReactNode} donated tokens (ERC721)
              </p>
            )}
          </div>

          <p className="text-sm mt-8">
            There could also be random rewards from raffles. To check your winnings, go to{' '}
            <Link href="/my-winnings" className="text-inherit">
              My-Winnings
            </Link>{' '}
            page. For staking rewards, visit{' '}
            <Link href="/my-staking" className="text-inherit">
              My-Staking
            </Link>{' '}
            page.
          </p>
        </>
      )}
    </MainWrapper>
  );
};

export default PrizeClaimedPage;
