import React, { useCallback, useState } from "react";
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

const ConnectWalletButton = ({
  isMobileView,
  loading,
  balance,
  stakedTokenCount,
}) => {
  const { account, activate } = useActiveWeb3React();
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

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
              {shortenHex(account)} <ExpandMoreIcon />
            </Box>
          }
          deleteIcon={<ExpandMoreIcon />}
          onClick={handleMenuOpen}
        />
        <Menu
          elevation={0}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{ zIndex: 10003 }}
        >
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-tokens" sx={{ width: "100%" }}>
              MY TOKENS
            </NavLink>
          </MenuItem>
          <MenuItem style={{ minWidth: 166 }} onClick={handleMenuClose}>
            <NavLink href="/my-staking" sx={{ width: "100%" }}>
              MY STAKING
            </NavLink>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <NavLink href="/winning-history" sx={{ width: "100%" }}>
              HISTORY OF WINNINGS
            </NavLink>
          </MenuItem>
          <Divider />
          <MenuItem
            style={{ minWidth: 166, pointerEvents: "none", display: "block" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>BALANCE:</Typography>
            {loading ? (
              <Typography color="primary">Loading...</Typography>
            ) : (
              <>
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
                    CSS (ERC721):
                  </Typography>
                  <Typography
                    variant="body2"
                    color="secondary"
                    sx={{ fontStyle: "italic", fontWeight: 600 }}
                  >
                    {balance.CosmicSignature} tokens
                  </Typography>
                </Box>
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
          <MenuItem
            style={{ pointerEvents: "none", justifyContent: "space-between" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>STAKED CST:</Typography>
            <Typography color="primary" sx={{ fontSize: "inherit" }}>
              {stakedTokenCount.cst}
            </Typography>
          </MenuItem>
          <MenuItem
            style={{ pointerEvents: "none", justifyContent: "space-between" }}
          >
            <Typography sx={{ fontSize: "inherit" }}>STAKED RWALK:</Typography>
            <Typography color="primary" sx={{ fontSize: "inherit" }}>
              {stakedTokenCount.rwalk}
            </Typography>
          </MenuItem>
        </Menu>
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
