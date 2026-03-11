'use client';

import { useState } from 'react';
import { parseEther } from 'viem';

import { MainWrapper } from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDonationsBoth } from '@/hooks/useApiQuery';
import EthDonationTable, { EthDonation } from '@/components/tables/EthDonationTable';
import { useNotification } from '@/contexts/NotificationContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { isUserRejection, reportError } from '@/utils/errors';

const EthDonations = () => {
  const [donateAmount, setDonateAmount] = useState('');
  const [donateInformation, setDonationInformation] = useState('');

  const { setNotification } = useNotification();
  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const { data: donationsRaw, isLoading, refetch: refetchDonations } = useDonationsBoth();
  const charityDonations = (donationsRaw as EthDonation[] | undefined) ?? null;

  const handleDonate = async () => {
    try {
      await asWriteFn(cosmicGameContract!.write.donateEth)([], {
        value: parseEther(donateAmount),
      });

      setNotification({
        text: `${donateAmount} ETH was donated successfully!`,
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      refetchDonations();
    } catch (error: unknown) {
      if (!isUserRejection(error)) {
        reportError(error, 'Donation error');
        setNotification({
          text: 'Donation failed, please try again.',
          type: 'error',
          visible: true,
        });
      }
    }
  };

  const handleDonateWithInfo = async () => {
    try {
      await asWriteFn(cosmicGameContract!.write.donateEthWithInfo)([donateInformation], {
        value: parseEther(donateAmount),
      });

      setNotification({
        text: `${donateAmount} ETH with information was donated successfully!`,
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      setDonationInformation('');
      refetchDonations();
    } catch (error: unknown) {
      if (!isUserRejection(error)) {
        reportError(error, 'Donation with info error');
        setNotification({
          text: 'Donation with information failed, please check your input.',
          type: 'error',
          visible: true,
        });
      }
    }
  };

  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-8">Direct (ETH) Donations</h2>

      {isLoading || charityDonations === null ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Donation History</h3>
          <EthDonationTable list={charityDonations} />
        </>
      )}

      {!!account && (
        <>
          <div className="mt-12">
            <div className="flex items-center mb-2">
              <span className="mr-2">Amount:</span>
              <Input
                placeholder="Donation amount"
                type="number"
                value={donateAmount}
                className="mr-2 w-auto"
                onChange={(e) => setDonateAmount(e.target.value)}
              />
              <span>ETH</span>
            </div>

            <textarea
              value={donateInformation}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-[15px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Donation information (JSON format)"
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </div>

          <div className="mt-2 mb-2">
            <Button
              disabled={!donateAmount || donateAmount === '0'}
              onClick={handleDonate}
              className="mr-2"
            >
              Donate
            </Button>
            <Button disabled={!donateAmount || donateAmount === '0'} onClick={handleDonateWithInfo}>
              Donate with Info
            </Button>
          </div>
        </>
      )}
    </MainWrapper>
  );
};

export default EthDonations;
