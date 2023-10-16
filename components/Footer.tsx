import React from "react";
import Image from "next/image";

import {
  Toolbar,
  Box,
  IconButton,
  Container,
  Typography,
  Link,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";

import { FooterWrapper } from "./styled";

const Footer = () => (
  <FooterWrapper position="relative" color="primary">
    <Toolbar>
      <Container maxWidth="lg">
        <Box
          py={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{
            xs: "column",
            sm: "column",
            md: "column",
            lg: "row",
          }}
        >
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column-reverse",
                sm: "column-reverse",
                md: "column-reverse",
                lg: "row",
              },
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                width={{xs: "100%", sm: "100%", md: "100%", lg: "auto"}}
                textAlign="center"
                marginRight={{xs: 0, sm: 0, md: 0, lg: 10}}
                lineHeight={4}
              >
                Copyright © 2023 Cosmic Signature
              </Typography>
              <Link
                color="textSecondary"
                target="_blank"
                href="#"
                style={{ fontSize: "13px", textDecoration: "none" }}
                marginRight={10}
              >
                Terms and conditions
              </Link>
              <Link
                color="textSecondary"
                target="_blank"
                href="#"
                style={{ fontSize: "13px", textDecoration: "none" }}
              >
                Privacy policy
              </Link>
            </Box>
            <Box ml={{ xs: 0, sm: 0, md: 0, lg: 6 }}>
              <IconButton
                href="https://twitter.com/CosmicSignatureNFT"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  color="#A9AAB5"
                  width={24}
                  height={24}
                />
              </IconButton>
              <IconButton href="https://discord.gg/bGnPn96Qwt" target="_blank">
                <FontAwesomeIcon
                  icon={faDiscord}
                  color="#A9AAB5"
                  width={24}
                  height={24}
                />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Toolbar>
  </FooterWrapper>
);

export default Footer;
