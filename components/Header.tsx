import React, { FC, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Toolbar,
  IconButton,
  Drawer,
  ListItem,
  Container,
  Link,
  Typography,
  Box,
  Divider,
  Grid,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import getNAVs from "../config/nav";
import ConnectWalletButton from "../components/ConnectWalletButton";

import { AppBarWrapper, DrawerList } from "./styled";
import ListNavItem from "./ListNavItem";
import ListItemButton from "./ListItemButton";
import { useApiData } from "../contexts/ApiDataContext";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { ethers } from "ethers";
import { useStakedToken } from "../contexts/StakedTokenContext";
import { useSystemMode } from "../contexts/SystemModeContext";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";

/**
 * Interface representing the structure of a user’s balance.
 */
interface Balance {
  CosmicToken: number;
  ETH: number;
  CosmicSignature: number;
  RWLK: number;
}

/**
 * The Header component is responsible for displaying the top navigation bar,
 * handling both desktop and mobile viewports. It also fetches and displays
 * user balances, staked tokens, and system mode notifications.
 */
const Header: FC = () => {
  // State to check if the screen is in mobile view
  const [mobileView, setMobileView] = useState<boolean>(false);

  // State to control the open/close status of the mobile drawer
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Pull in global API data from context
  const { apiData: status } = useApiData();

  // Active Web3 account info
  const { account } = useActiveWeb3React();

  // Loading state used for async data fetch calls
  const [loading, setLoading] = useState<boolean>(true);

  // Track the user's balances (ERC20, ETH, etc.)
  const [balance, setBalance] = useState<Balance>({
    CosmicToken: 0,
    ETH: 0,
    CosmicSignature: 0,
    RWLK: 0,
  });

  // Staked tokens from context
  const {
    cstokens: stakedCSTokens,
    rwlktokens: stakedRWLKTokens,
  } = useStakedToken();

  // System mode data (e.g., maintenance)
  const { data: systemMode } = useSystemMode();

  // Contract to fetch user RWLK NFTs
  const nftContract = useRWLKNFTContract();

  /**
   * Adjust mobileView based on window width changes.
   */
  useEffect(() => {
    const handleWindowResize = () => {
      setMobileView(window.innerWidth < 1024);
    };

    handleWindowResize(); // Initial check on mount

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  /**
   * Fetch and set user balance data from the API and NFT contract.
   *
   * @param showLoading - Whether to toggle the loading state while fetching.
   */
  const fetchData = useCallback(
    async (showLoading: boolean = true) => {
      if (showLoading) setLoading(true);
      try {
        // Check if contract is initialized
        if (!nftContract) {
          if (showLoading) setLoading(false);
          return;
        }

        // Fetch user balances for account
        const userBalance = await api.get_user_balance(account!);
        // Fetch user info
        const { UserInfo } = await api.get_user_info(account!);

        // Fetch RWLK tokens from the NFT contract
        const rwlkTokens = await nftContract.walletOfOwner(account!);

        // Update the local state with fetched balance data
        if (userBalance) {
          setBalance({
            CosmicToken: Number(
              ethers.utils.formatEther(userBalance.CosmicTokenBalance)
            ),
            ETH: Number(ethers.utils.formatEther(userBalance.ETH_Balance)),
            CosmicSignature: UserInfo?.TotalCSTokensWon ?? 0,
            RWLK: rwlkTokens.length,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    },
    [account, nftContract]
  );

  /**
   * Effect to fetch balance data periodically (every 30s) when user is connected.
   */
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (account && nftContract) {
      // Initial fetch when component mounts
      fetchData(true);

      // Periodically update data
      intervalId = setInterval(() => {
        fetchData(false);
      }, 30000);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [account, nftContract, fetchData]);

  // Dynamically retrieve navigation links based on user status and account
  const navs = getNAVs(status, account);

  // Handlers to open/close the mobile drawer
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  /**
   * Renders the navigation bar for desktop view.
   */
  const renderDesktop = () => (
    <Toolbar disableGutters>
      {/* Logo link */}
      <Link href="/">
        <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
      </Link>

      {/* Navigation items */}
      {navs.map((nav, i) => (
        <ListNavItem key={i} nav={nav} />
      ))}

      {/* Connect Wallet button (desktop) */}
      <ConnectWalletButton
        isMobileView={false}
        loading={loading}
        balance={balance}
        stakedTokenCount={{
          cst: stakedCSTokens?.length,
          rwalk: stakedRWLKTokens?.length,
        }}
      />
    </Toolbar>
  );

  /**
   * Renders the navigation bar for mobile view, including a drawer.
   */
  const renderMobile = () => {
    // Check if user has any claimable notifications
    const hasNotifications =
      account &&
      (status?.ETHRaffleToClaim > 0 ||
        status?.NumDonatedNFTToClaim > 0 ||
        (status?.UnclaimedStakingReward > 0 &&
          status?.claimableActionIds?.length > 0));

    return (
      <Toolbar>
        {/* Mobile menu icon */}
        <IconButton
          aria-label="menu"
          aria-haspopup="true"
          edge="start"
          color="inherit"
          onClick={handleDrawerOpen}
          style={{ marginRight: "8px" }}
        >
          {hasNotifications ? (
            <Badge variant="dot" color="error">
              <MenuIcon />
            </Badge>
          ) : (
            <MenuIcon />
          )}
        </IconButton>

        {/* Logo link */}
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>

        {/* Drawer for mobile navigation */}
        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
          <DrawerList>
            <ListItem>
              <ConnectWalletButton
                isMobileView
                balance={balance}
                loading={loading}
                stakedTokenCount={{
                  cst: stakedCSTokens?.length,
                  rwalk: stakedRWLKTokens?.length,
                }}
              />
            </ListItem>

            {/* Navigation items */}
            {navs.map((nav, i) => (
              <ListItemButton key={i} nav={nav} />
            ))}

            {/* Additional links and balance details if account is connected */}
            {account && (
              <>
                <Divider />

                <ListItemButton
                  nav={{ title: "My Statistics", route: "/my-statistics" }}
                />
                <ListItemButton
                  nav={{ title: "My Tokens", route: "/my-tokens" }}
                />
                <ListItemButton
                  nav={{ title: "My Staking", route: "/my-staking" }}
                />
                <ListItemButton
                  nav={{
                    title: "History of Winnings",
                    route: "/winning-history",
                  }}
                />

                <Divider />

                <ListItem sx={{ display: "block" }}>
                  <Typography sx={{ fontSize: 16 }}>BALANCE:</Typography>
                  {loading ? (
                    <Typography color="primary">Loading...</Typography>
                  ) : (
                    <>
                      {/* ETH Balance */}
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

                      {/* CosmicToken (ERC20) Balance */}
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

                      {/* CosmicSignature (ERC721) Balance */}
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
                          CS NFT (ERC721):
                        </Typography>
                        <Typography
                          variant="body2"
                          color="secondary"
                          sx={{ fontStyle: "italic", fontWeight: 600 }}
                        >
                          {balance.CosmicSignature} tokens
                        </Typography>
                      </Box>

                      {/* RWLK (ERC721) Balance */}
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
                </ListItem>

                <Divider />

                {/* Staked token counts */}
                <ListItem sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 16 }}>STAKED CST NFT:</Typography>
                  <Typography
                    color="secondary"
                    sx={{ fontSize: 16, fontWeight: 600 }}
                  >
                    {stakedCSTokens?.length}
                  </Typography>
                </ListItem>
                <ListItem sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 16 }}>
                    STAKED RWALK NFT:
                  </Typography>
                  <Typography
                    color="secondary"
                    sx={{ fontSize: 16, fontWeight: 600 }}
                  >
                    {stakedRWLKTokens?.length}
                  </Typography>
                </ListItem>
              </>
            )}
          </DrawerList>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <AppBarWrapper position="fixed">
      <Container>
        {/* Maintenance pending / active warning banner */}
        {systemMode > 0 && (
          <Box
            sx={{
              position: "fixed",
              top: mobileView ? "88px" : "96px",
              left: 0,
              right: 0,
              background: "#F3D217",
              color: "#000",
              px: 4,
              py: 1,
            }}
          >
            <Grid container>
              <Grid item sm={12} md={8}>
                <Typography variant="body1">
                  {systemMode === 1
                    ? "The system will enter maintenance mode as soon as prize claim transaction is executed. The administrator will make adjustments to the parameters of the system and after that you will be able to play again."
                    : "The system is in maintenance mode. The administrator will make adjustments to the parameters of the system and after that you will be able to play again."}
                </Typography>
              </Grid>
              <Grid item sm={12} md={4} sx={{ alignSelf: "center" }}>
                <Typography variant="h5" textAlign="center">
                  {systemMode === 1
                    ? "MAINTENANCE PENDING"
                    : "MAINTENANCE MODE"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Conditionally render desktop or mobile layout */}
        {mobileView ? renderMobile() : renderDesktop()}
      </Container>
    </AppBarWrapper>
  );
};

export default Header;
