import React, { useState, useEffect } from "react";
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

const Header = () => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });
  const [navs, setNavs] = useState([]);
  const { mobileView, drawerOpen } = state;
  const { apiData: status, setApiData } = useApiData();
  const { account } = useActiveWeb3React();
  const [balance, setBalance] = useState({
    CosmicToken: 0,
    ETH: 0,
    CosmicSignature: 0,
    RWLK: 0,
  });
  const { data: stakedTokens } = useStakedToken();
  const { data: systemMode } = useSystemMode();
  const nftContract = useRWLKNFTContract();

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 1024
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());

    return () => {
      window.removeEventListener("resize", () => setResponsiveness());
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const notify = await api.notify_red_box(account);
      setApiData(notify);
      const balance = await api.get_user_balance(account);
      const { UserInfo } = await api.get_user_info(account);
      const rwlkTokens = await nftContract.walletOfOwner(account);
      if (balance) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balance.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balance.ETH_Balance)),
          CosmicSignature: UserInfo?.TotalCSTokensWon,
          RWLK: rwlkTokens.length,
        });
      }
    };

    if (account) {
      fetchData();
    }
  }, [account]);

  useEffect(() => {
    const navs = getNAVs(status, account);
    setNavs(navs);
  }, [account, status]);

  const renderDesktop = () => {
    return (
      <Toolbar disableGutters>
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>
        {navs.map((nav, i) => (
          <ListNavItem key={i} nav={nav} />
        ))}
        <ConnectWalletButton
          isMobileView={false}
          balance={balance}
          stakedTokens={stakedTokens}
        />
      </Toolbar>
    );
  };

  const renderMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: false }));

    return (
      <Toolbar>
        <IconButton
          aria-label="menu"
          aria-haspopup="true"
          edge="start"
          color="inherit"
          onClick={handleDrawerOpen}
          style={{ marginRight: "8px" }}
        >
          {account &&
          (status?.ETHRaffleToClaim > 0 ||
            status?.NumDonatedNFTToClaim > 0 ||
            status?.UnclaimedStakingReward > 0) ? (
            <Badge variant="dot" color="error">
              <MenuIcon />
            </Badge>
          ) : (
            <MenuIcon />
          )}
        </IconButton>
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>

        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
          <DrawerList>
            <ListItem>
              <ConnectWalletButton
                isMobileView
                balance={balance}
                stakedTokens={stakedTokens}
              />
            </ListItem>
            {navs.map((nav, i) => (
              <ListItemButton
                key={i}
                nav={nav}
                sx={{ justifyContent: "center" }}
              />
            ))}
            {account && (
              <>
                <Divider />
                <ListItemButton
                  nav={{ title: "My Tokens", route: "/my-tokens" }}
                  sx={{ justifyContent: "center" }}
                />
                <ListItemButton
                  nav={{ title: "My Staking", route: "/my-staking" }}
                  sx={{ justifyContent: "center" }}
                />
                <ListItemButton
                  nav={{
                    title: "History of Winnings",
                    route: "/winning-history",
                  }}
                  sx={{ justifyContent: "center" }}
                />
                <Divider />
                <ListItem sx={{ display: "block" }}>
                  <Typography sx={{ fontSize: 16 }}>BALANCE:</Typography>
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
                </ListItem>
                <Divider />
                <ListItem sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 16 }}>STAKED TOKENS:</Typography>
                  <Typography
                    color="secondary"
                    sx={{ fontSize: 16, fontWeight: 600 }}
                  >
                    {stakedTokens?.length}
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
        {mobileView ? renderMobile() : renderDesktop()}
      </Container>
    </AppBarWrapper>
  );
};

export default Header;
