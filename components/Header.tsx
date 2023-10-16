import React, { useState, useEffect } from "react";
import Image from "next/image";

import {
  Toolbar,
  IconButton,
  Drawer,
  ListItem,
  Container,
  Link,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import getNAVs from "../config/nav";
import ConnectWalletButton from "../components/ConnectWalletButton";

import { AppBarWrapper, DrawerList } from "./styled";
import ListNavItem from "./ListNavItem";
import ListItemButton from "./ListItemButton";
import { useApiData } from "../contexts/ApiDataContext";
import { useActiveWeb3React } from "../hooks/web3";

const Header = () => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });
  const { mobileView, drawerOpen } = state;
  const { apiData: status } = useApiData();
  const { account } = useActiveWeb3React();

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

  const renderDesktop = () => {
    return (
      <Toolbar disableGutters>
        <Link href="/">
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
        </Link>
        {getNAVs(status, account).map((nav, i) => (
          <ListNavItem key={i} nav={nav} />
        ))}
        <ConnectWalletButton isMobileView={false} />
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
              <ConnectWalletButton isMobileView />
            </ListItem>
            {getNAVs(status, account).map((nav, i) => (
              <ListItemButton
                key={i}
                nav={nav}
                sx={{ justifyContent: "center" }}
              />
            ))}
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
