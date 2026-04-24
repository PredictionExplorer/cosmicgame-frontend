'use client';

import { useState } from 'react';
import { parseEther } from 'viem';

import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDonationsBoth } from '@/hooks/useApiQuery';
import EthDonationTable, { EthDonation } from '@/components/tables/EthDonationTable';
import { useNotification } from '@/contexts/NotificationContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { isUserRejection, reportError, WALLET_TRANSACTION_CANCELLED_MESSAGE } from '@/utils/errors';

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
        text: `${donateAmount} ETH was contributed successfully!`,
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution error');
        setNotification({
          text: 'Contribution failed, please try again.',
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
        text: `${donateAmount} ETH with information was contributed successfully!`,
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      setDonationInformation('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: WALLET_TRANSACTION_CANCELLED_MESSAGE,
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution with info error');
        setNotification({
          text: 'Contribution with information failed, please check your input.',
          type: 'error',
          visible: true,
        });
      }
    }
  };

  return (
    <MainWrapper>
      <PageHeader
        title="ETH Contributions"
        subtitle="Contribute ETH directly to the Cosmic Signature Public Goods Vault"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Contribute ETH directly to the Cosmic Signature Public Goods Vault to support beneficiaries
        selected through Cosmic Council coordination. You can include an optional title, message,
        and URL with your contribution. Top contributors for each cycle may be featured on the home
        page.
      </p>

      {!!account && (
        <div className="mb-12 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Make a Contribution
          </h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Amount (ETH)</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="0.0"
                type="number"
                value={donateAmount}
                className="max-w-xs"
                onChange={(e) => setDonateAmount(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Information <span className="opacity-50">(optional, JSON)</span>
            </Label>
            <textarea
              value={donateInformation}
              rows={3}
              className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              placeholder='{"name": "Your Name", "message": "..."}'
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button disabled={!donateAmount || donateAmount === '0'} onClick={handleDonate}>
              Contribute
            </Button>
            <Button
              variant="outline"
              disabled={!donateAmount || donateAmount === '0'}
              onClick={handleDonateWithInfo}
            >
              Contribute with Info
            </Button>
          </div>
        </div>
      )}

      <SectionDivider title="Contribution History" className="mb-6" />
      {isLoading || charityDonations === null ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <EthDonationTable list={charityDonations} />
      )}
    </MainWrapper>
  );
};

export default EthDonations;
