import React, { useCallback, useState, MouseEvent } from "react";
import { Box, Divider, Menu, MenuItem, Typography } from "@mui/material";
import { isMobile } from "react-device-detect";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  MobileWallet,
  Wallet,
  ConnectButton,
  MobileConnectButton,
  NavLink,
} from "./styled";
import { injected, walletconnect } from "../connectors";
import { useActiveWeb3React } from "../hooks/web3";
import { shortenHex } from "../utils";
import { switchNetwork } from "../utils/switchNetwork";

// Define the shape of the balance and staked token count
interface Balance {
  ETH: number;
  CosmicToken: number;
  CosmicSignature: number;
  RWLK: number;
}

interface StakedTokenCount {
  cst: number;
  rwalk: number;
}

// Define component props in a separate interface for clarity
interface ConnectWalletButtonProps {
  // If true, the component will display the mobile-specific UI
  isMobileView: boolean;
  // Indicates if the user’s balance data is currently loading
  loading: boolean;
  // Balance details for various tokens
  balance: Balance;
  // Counts of how many tokens/NFTs are staked
  stakedTokenCount: StakedTokenCount;
}

/**
 * This component handles wallet connection logic and displays
 * the user’s wallet address, token balances, and staked token
 * information once connected.
 */
const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  isMobileView,
  loading,
  balance,
  stakedTokenCount,
}) => {
  // Access the active Web3 context (includes account info and activate function)
  const { account, activate } = useActiveWeb3React();

  // State to manage anchor element for the Material-UI Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /**
   * Initiates the wallet connection using either WalletConnect or injected provider.
   * If the chain ID is unsupported, asks user for permission to switch to Arbitrum,
   * then reloads the page after switching.
   */
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

  /**
   * Opens the dropdown menu when the user clicks the wallet chip.
   */
  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Closes the dropdown menu.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // If the user is already connected to a wallet, show wallet info and menu
  if (account) {
    // Mobile UI
    if (isMobileView) {
      return (
        <MobileWallet
          variant="outlined"
          color="secondary"
          label={
            <Box display="flex" alignItems="center">
              {shortenHex(account)}
            </Box>
          }
        />
      );
    }

    // Desktop UI
    return (
      <>
        <Wallet
          variant="outlined"
          color="secondary"
          label={
            <Box display="flex" alignItems="center">
              {shortenHex(account)} <ExpandMoreIcon />
            </Box>
          }
          deleteIcon={<ExpandMoreIcon />}
          onClick={handleMenuOpen}
        />
        <Menu
          elevation={0}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{ zIndex: 10003 }}
        >
          {/* Menu item: My Statistics */}
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-statistics" sx={{ width: "100%" }}>
              MY STATISTICS
            </NavLink>
          </MenuItem>

          {/* Menu item: My Tokens */}
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-tokens" sx={{ width: "100%" }}>
              MY TOKENS
            </NavLink>
          </MenuItem>

          {/* Menu item: My Staking */}
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-staking" sx={{ width: "100%" }}>
              MY STAKING
            </NavLink>
          </MenuItem>

          {/* Menu item: Winning History */}
          <MenuItem onClick={handleMenuClose}>
            <NavLink href="/winning-history" sx={{ width: "100%" }}>
              HISTORY OF WINNINGS
            </NavLink>
          </MenuItem>

          <Divider />

          {/* Wallet Balance Section */}
          <MenuItem
            style={{ minWidth: 240, pointerEvents: "none", display: "block" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>BALANCE:</Typography>
            {loading ? (
              <Typography color="primary">Loading...</Typography>
            ) : (
              <>
                {/* ETH balance */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    ETH:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    {balance.ETH.toFixed(2)}
                  </Typography>
                </Box>

                {/* CST (ERC20) balance */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    CST (ERC20):
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    {balance.CosmicToken.toFixed(2)}
                  </Typography>
                </Box>

                {/* CSN (ERC721) balance */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    CSN (ERC721):
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    {balance.CosmicSignature} tokens
                  </Typography>
                </Box>

                {/* RWLK (ERC721) balance */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    RWLK (ERC721):
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    {balance.RWLK} tokens
                  </Typography>
                </Box>
              </>
            )}
          </MenuItem>

          <Divider />

          {/* Staked Token Counts */}
          <MenuItem
            style={{ pointerEvents: "none", justifyContent: "space-between" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>
              STAKED CST NFT:
            </Typography>
            <Typography color="primary" sx={{ fontSize: "inherit" }}>
              {stakedTokenCount.cst}
            </Typography>
          </MenuItem>
          <MenuItem
            style={{ pointerEvents: "none", justifyContent: "space-between" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>
              STAKED RWALK NFT:
            </Typography>
            <Typography color="primary" sx={{ fontSize: "inherit" }}>
              {stakedTokenCount.rwalk}
            </Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }

  // If no account is connected, show the "Connect to wallet" button
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
