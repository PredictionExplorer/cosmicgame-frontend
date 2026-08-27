/**
 * Deploys the full protocol suite to the local chain by invoking the
 * contracts repo's own Hardhat deployment task, then parses its report file.
 * The game is deployed with activation far in the future so the director can
 * apply harness pacing parameters before opening the first cycle.
 */

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { HarnessConfig } from '../config';
import { harnessPaths } from '../config';
import { logFileFor, runBlocking } from '../processes';

import { CONTRACTS_REPO_ENV } from './chain';

/** Hardhat's well-known dev account #0 — protocol owner/deployer on the harness chain. */
export const OWNER_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/** Hardhat's well-known dev account #6 — receives the Public Goods vault payouts. */
export const PUBLIC_GOODS_RECIPIENT = '0x976EA74026E726554dB657fA54763abd0C3a0aa9';

/** Activation timestamp far enough out that cycles stay closed until configured. */
export const FAR_FUTURE_ACTIVATION = 4_000_000_000;

/** Address book produced by the deployment, in frontend naming. */
export interface DeployedAddresses {
  cosmicGame: string;
  implementation: string;
  cosmicToken: string;
  cosmicSignature: string;
  randomWalkNft: string;
  cosmicDao: string;
  publicGoodsVault: string;
  allocationsWallet: string;
  anchoringCst: string;
  anchoringRwlk: string;
  outreachReserve: string;
}

interface DeployReportFile {
  cosmicSignatureTokenAddress: string;
  randomWalkNftAddress: string;
  cosmicSignatureNftAddress: string;
  prizesWalletAddress: string;
  stakingWalletRandomWalkNftAddress: string;
  stakingWalletCosmicSignatureNftAddress: string;
  marketingWalletAddress: string;
  charityWalletAddress: string;
  cosmicSignatureDaoAddress: string;
  cosmicSignatureGameImplementationAddress: string;
  cosmicSignatureGameProxyAddress: string;
}

/**
 * Run the contracts repo deployment task against the running local node.
 * This deploys the V1 game; the director upgrades to CosmicSignatureGameV2
 * after the genesis cycle completes (V2's reinitializer asserts a non-first
 * cycle — the same order production followed on Arbitrum One).
 */
export async function deployContracts(config: HarnessConfig): Promise<DeployedAddresses> {
  const paths = harnessPaths(config);
  // The tasks refuse to overwrite existing reports; the chain is fresh, so a
  // stale OpenZeppelin upgrades manifest for 31337 would only mislead.
  rmSync(paths.deployReportFile, { force: true });
  rmSync(paths.upgradeReportFile, { force: true });
  rmSync(join(config.contractsDir, '.openzeppelin', 'unknown-31337.json'), { force: true });

  const deployTaskConfig = {
    deployerPrivateKey: OWNER_PRIVATE_KEY,
    cosmicSignatureGameContractName: 'CosmicSignatureGame',
    randomWalkNftAddress: '',
    charityAddress: PUBLIC_GOODS_RECIPIENT,
    transferContractOwnershipToCosmicSignatureDao: false,
    roundActivationTime: FAR_FUTURE_ACTIVATION,
    donateEthToCosmicSignatureGame: false, // lexicon-allow-abi
    ethDonationToCosmicSignatureGameAmountInEth: 0, // lexicon-allow-abi
    reportFilePath: paths.deployReportFile,
  };
  writeFileSync(paths.deployConfigFile, JSON.stringify(deployTaskConfig, null, 2));

  await runBlocking({
    name: 'deploy',
    command: 'npx',
    args: [
      'hardhat',
      'deploy-cosmic-signature-contracts',
      '--deployconfigfilepath',
      paths.deployConfigFile,
      '--network',
      'hardhat_on_localhost',
    ],
    cwd: config.contractsDir,
    env: CONTRACTS_REPO_ENV,
    logFile: logFileFor(config, 'deploy'),
  });

  return readDeployReport(config);
}

/**
 * Upgrade the game proxy to CosmicSignatureGameV2 — the version live on
 * Arbitrum One and the ABI shape the frontend prefers on chain 31337. Must
 * run after at least one finalized cycle (the reinitializer asserts it).
 */
export async function upgradeGameToV2(config: HarnessConfig): Promise<void> {
  const paths = harnessPaths(config);
  rmSync(paths.upgradeReportFile, { force: true });
  const upgradeTaskConfig = {
    deploymentConfigurationFilePath: paths.deployConfigFile,
    newCosmicSignatureGameContractName: 'CosmicSignatureGameV2',
    unsafeAllowRenames: false,
    unsafeSkipStorageCheck: false,
    newInitializerMethodName: 'reinitialize',
    reportFilePath: paths.upgradeReportFile,
  };
  writeFileSync(paths.upgradeConfigFile, JSON.stringify(upgradeTaskConfig, null, 2));
  await runBlocking({
    name: 'upgrade',
    command: 'npx',
    args: [
      'hardhat',
      'upgrade-cosmic-signature-game',
      '--upgradeconfigfilepath',
      paths.upgradeConfigFile,
      '--network',
      'hardhat_on_localhost',
    ],
    cwd: config.contractsDir,
    env: CONTRACTS_REPO_ENV,
    logFile: logFileFor(config, 'upgrade'),
    mirror: false,
  });
}

/** Parse the deploy (+ optional upgrade) reports into the address book. */
export function readDeployReport(config: HarnessConfig): DeployedAddresses {
  const paths = harnessPaths(config);
  const report = JSON.parse(readFileSync(paths.deployReportFile, 'utf8')) as DeployReportFile;
  let implementation = report.cosmicSignatureGameImplementationAddress;
  try {
    const upgrade = JSON.parse(readFileSync(paths.upgradeReportFile, 'utf8')) as {
      newCosmicSignatureGameImplementationAddress?: string;
    };
    implementation = upgrade.newCosmicSignatureGameImplementationAddress ?? implementation;
  } catch {
    // No upgrade report — a V1-only deployment (e.g. pinned older contracts).
  }
  return {
    cosmicGame: report.cosmicSignatureGameProxyAddress,
    implementation,
    cosmicToken: report.cosmicSignatureTokenAddress,
    cosmicSignature: report.cosmicSignatureNftAddress,
    randomWalkNft: report.randomWalkNftAddress,
    cosmicDao: report.cosmicSignatureDaoAddress,
    publicGoodsVault: report.charityWalletAddress,
    allocationsWallet: report.prizesWalletAddress,
    anchoringCst: report.stakingWalletCosmicSignatureNftAddress,
    anchoringRwlk: report.stakingWalletRandomWalkNftAddress,
    outreachReserve: report.marketingWalletAddress,
  };
}
