import type { AppContractAddresses } from '@/config/networks';

/** Distinct addresses for tests that render staking labels in transfer tables. */
export const TEST_STAKING_CST_LABEL = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
export const TEST_STAKING_RWALK_LABEL = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

export const TEST_APP_CONTRACT_ADDRESSES: AppContractAddresses = {
  randomWalkNft: '0x1111111111111111111111111111111111111111',
  cosmicGame: '0x2222222222222222222222222222222222222222',
  cosmicSignature: '0x3333333333333333333333333333333333333333',
  cosmicToken: '0x4444444444444444444444444444444444444444',
  cosmicDao: '0x5555555555555555555555555555555555555555',
  charity: '0x6666666666666666666666666666666666666666',
  prizesWallet: '0x7777777777777777777777777777777777777777',
  stakingCst: TEST_STAKING_CST_LABEL,
  stakingRwalk: TEST_STAKING_RWALK_LABEL,
  marketing: '0x8888888888888888888888888888888888888888',
  implementation: '0x9999999999999999999999999999999999999999',
};

export const TEST_MARKETING_WALLET = TEST_APP_CONTRACT_ADDRESSES.marketing;
