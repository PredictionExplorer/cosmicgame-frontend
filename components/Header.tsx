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

const Header = () => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });
  const { mobileView, drawerOpen } = state;
  const { apiData: status, setApiData } = useApiData();
  const { account } = useActiveWeb3React();
  const [balance, setBalance] = useState({ CosmicToken: 0, ETH: 0 });

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
      if (balance) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balance.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balance.ETH_Balance)),
        });
      }
    };

    if (account) {
      fetchData();
    }
  }, [account]);

  const renderDesktop = () => {
    return (
      <Toolbar disableGutters>
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>
        {getNAVs(status, account).map((nav, i) => (
          <ListNavItem key={i} nav={nav} />
        ))}
        <ConnectWalletButton isMobileView={false} balance={balance} />
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
              <ConnectWalletButton isMobileView balance={balance} />
            </ListItem>
            {getNAVs(status, account).map((nav, i) => (
              <ListItemButton
                key={i}
                nav={nav}
                sx={{ justifyContent: "center" }}
              />
            ))}
            <ListItemButton
              nav={{ title: "My Wallet", route: "/my-wallet" }}
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
                  CST:
                </Typography>
                <Typography
                  variant="body2"
                  color="secondary"
                  sx={{ fontStyle: "italic", fontWeight: 600 }}
                >
                  {balance.CosmicToken.toFixed(2)}
                </Typography>
              </Box>
            </ListItem>
          </DrawerList>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <AppBarWrapper position="fixed">
      <Container>{mobileView ? renderMobile() : renderDesktop()}</Container>
    </AppBarWrapper>
  );
};

export default Header;
