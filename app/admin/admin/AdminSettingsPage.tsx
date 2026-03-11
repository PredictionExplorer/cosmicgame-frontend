'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainWrapper } from '@/components/styled';
import { useDashboardInfo } from '@/hooks/useApiQuery';

const AdminSettingsPage = () => {
  const { data, isLoading } = useDashboardInfo();

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center">Administrative methods</h4>
      {isLoading || !data ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <>
          <div className="mt-12">
            <h5 className="text-xl font-semibold">Cosmic Game Contract</h5>
            <div className="ml-4">
              <div className="mt-6">
                <p className="text-base font-medium">
                  Cosmic Signature Token (ERC721) Contract Address
                </p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.CosmicSignatureAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Cosmic Token (ERC20) Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.CosmicTokenAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Charity Wallet Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.CharityWalletAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">RandomWalk NFT Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.RandomWalkAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Raffle Wallet Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.RaffleWalletAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Staking Wallet Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.StakingWalletAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Marketing Wallet Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.MarketingWalletAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Business Logic Contract Address</p>
                <div className="flex mt-2">
                  <Input
                    placeholder="Enter address here"
                    className="flex-1"
                    value={String(data?.ContractAddrs?.BusinessLogicAddr ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set Address
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Number of Raffle Winners Per Round</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.NumRaffleEthWinners ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Number of Raffle NFT Winners Per Round</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.NumRaffleNFTWinners ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Number of NFT Holder Winners Per Round</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.NumHolderNFTWinners ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Prize Percentage</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.PrizePercentage ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Charity Percentage</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.CharityPercentage ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Raffle Percentage</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.RafflePercentage ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Staking Percentage</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.StakingPercentage ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Time Increase</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.TimeIncrease ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Timeout Claim Prize</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Price Increase</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.PriceIncrease ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Nano Seconds Extra</p>
                <div className="flex mt-2">
                  <Input
                    type="number"
                    placeholder="Enter number here"
                    className="flex-1"
                    value={String(data?.NanosecondsExtra ?? '')}
                    readOnly
                  />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Initial Seconds Until Prize</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Initial Bid Amount Fraction</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Activation Time</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">ETH To CST Bid Ratio</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Round Start CST Auction Length</p>
                <div className="flex mt-2">
                  <Input type="number" placeholder="Enter number here" className="flex-1" />
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-base font-medium">Switch Mode</p>
                <div className="flex mt-2">
                  <Select defaultValue="runtime">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="runtime">Runtime Mode</SelectItem>
                      <SelectItem value="maintenance">Maintenance Mode</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="secondary" className="ml-2">
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </MainWrapper>
  );
};

export default AdminSettingsPage;
