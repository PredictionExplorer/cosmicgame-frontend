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
  // Snackbar,
  // Alert,
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

const Header = () => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });
  const { mobileView, drawerOpen } = state;
  const { apiData: status, setApiData } = useApiData();
  const { account } = useActiveWeb3React();
  const [balance, setBalance] = useState({
    CosmicToken: 0,
    ETH: 0,
    CosmicSignature: 0,
  });
  const { data: stakedTokens } = useStakedToken();
  const { data: systemMode } = useSystemMode();
  // const [notification, setNotification] = useState<{
  //   text: string;
  //   type: "success" | "info" | "warning" | "error";
  //   visible: boolean;
  // }>({
  //   text: "",
  //   type: "error",
  //   visible: false,
  // });

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 992
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
      if (balance) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balance.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balance.ETH_Balance)),
          CosmicSignature: UserInfo?.TotalCSTokensWon,
        });
      }
    };

    if (account) {
      fetchData();
    }
  }, [account]);

  // useEffect(() => {
  //   if (systemMode === 2) {
  //     setNotification({
  //       text:
  //         "The system is entered in maintenance mode. You can't bid, donate or claim prize during the maintenance mode.",
  //       type: "info",
  //       visible: true,
  //     });
  //   } else if (systemMode === 1) {
  //     setNotification({
  //       text:
  //         "The system is in prepare_maintenance mode. The system will enter maintenance mode immediately after claimPrize() is executed.",
  //       type: "info",
  //       visible: true,
  //     });
  //   }
  // }, [systemMode]);

  const renderDesktop = () => {
    return (
      <Toolbar disableGutters>
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>
        {getNAVs(status, account).map((nav, i) => (
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
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>
        <IconButton
          aria-label="menu"
          aria-haspopup="true"
          edge="start"
          color="inherit"
          onClick={handleDrawerOpen}
          style={{ marginLeft: "auto" }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <DrawerList>
            <ListItem>
              <ConnectWalletButton
                isMobileView
                balance={balance}
                stakedTokens={stakedTokens}
              />
            </ListItem>
            {getNAVs(status, account).map((nav, i) => (
              <ListItemButton
                key={i}
                nav={nav}
                sx={{ justifyContent: "center" }}
              />
            ))}
            <ListItemButton
              nav={{ title: "My Tokens", route: "/my-tokens" }}
              sx={{ justifyContent: "center" }}
            />
            <ListItemButton
              nav={{ title: "History of Winnings", route: "/winning-history" }}
              sx={{ justifyContent: "center" }}
            />
            <Divider />
            <ListItem sx={{ display: "block" }}>
              <Typography sx={{ fontSize: 16 }}>BALANCE:</Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
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
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
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
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
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
            </ListItem>
            <Divider />
            <ListItem sx={{ justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 16 }}>STAKED TOKENS:</Typography>
              <Typography color="primary" sx={{ fontSize: 16 }}>
                {stakedTokens?.length}
              </Typography>
            </ListItem>
          </DrawerList>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <AppBarWrapper position="fixed">
      <Container>
        {/* <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          autoHideDuration={10000}
          open={notification.visible}
          onClose={() =>
            setNotification((prev) => ({ ...prev, visible: false }))
          }
        >
          <Alert severity={notification.type} variant="filled">
            {notification.text}
          </Alert>
        </Snackbar> */}
        {systemMode > 0 && (
          <Typography
            sx={{
              position: "fixed",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#f00",
              color: "#fff",
              px: 1,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            {systemMode === 1
              ? "Prepare Maintenance Mode"
              : systemMode === 2
              ? "Maintenance Mode"
              : ""}
          </Typography>
        )}
        {mobileView ? renderMobile() : renderDesktop()}
      </Container>
    </AppBarWrapper>
  );
};

export default Header;
