import React, { useCallback } from "react";
import { Box } from "@mui/material";
import { isMobile } from "react-device-detect";

import {
  MobileWallet,
  Wallet,
  ConnectButton,
  MobileConnectButton,
} from "./styled";
import { injected, walletconnect } from "../connectors";
import { useActiveWeb3React } from "../hooks/web3";
import { shortenHex } from "../utils";
import { switchNetwork } from "../utils/switchNetwork";

const ConnectWalletButton = ({ isMobileView }) => {
  const { account, activate } = useActiveWeb3React();

  const handleConnectWallet = useCallback(async () => {
    const connector = isMobile ? walletconnect : injected;
    await activate(connector, async (err) => {
      if (
        err.name === "UnsupportedChainIdError" &&
        window.confirm("Switch to the Arbitrum network?")
      ) {
        await switchNetwork();
        window.location.reload();
      }
    });
  }, [activate]);

  if (account) {
    return isMobileView ? (
      <MobileWallet
        variant="outlined"
        color="secondary"
        label={
          <Box display="flex" alignItems="center">
            {shortenHex(account)}
          </Box>
        }
      />
    ) : (
      <>
        <Wallet
          variant="outlined"
          color="secondary"
          label={
            <Box display="flex" alignItems="center">
              {shortenHex(account)}
            </Box>
          }
        />
      </>
    );
  }

  return isMobileView ? (
    <MobileConnectButton
      variant="outlined"
      color="secondary"
      size="large"
      onClick={handleConnectWallet}
    >
      Connect to wallet
    </MobileConnectButton>
  ) : (
    <ConnectButton
      variant="outlined"
      color="secondary"
      size="large"
      onClick={handleConnectWallet}
    >
      Connect to wallet
    </ConnectButton>
  );
};

export default ConnectWalletButton;
