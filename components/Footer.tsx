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
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { FooterWrapper } from "./styled";

// Footer component displaying the company logo, links, and social media icons
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
          {/* Company Logo */}
          <Image src="/images/logo2.svg" width={240} height={48} alt="logo" />

          {/* Main content: Copyright, Terms, Privacy links, and Social Media icons */}
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
            {/* Text and legal links section */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Copyright Information */}
              <Typography
                variant="body2"
                color="textSecondary"
                width={{ xs: "100%", lg: "auto" }}
                textAlign="center"
                marginRight={{ lg: 10 }}
                lineHeight={4}
              >
                Copyright © 2024 Cosmic Signature
              </Typography>

              {/* Terms and Conditions link */}
              <Link
                color="textSecondary"
                target="_blank"
                href="#"
                sx={{
                  fontSize: "13px",
                  textDecoration: "none",
                  mr: { lg: 10 },
                }}
              >
                Terms and conditions
              </Link>

              {/* Privacy Policy link */}
              <Link
                color="textSecondary"
                target="_blank"
                href="#"
                sx={{ fontSize: "13px", textDecoration: "none" }}
              >
                Privacy policy
              </Link>
            </Box>

            {/* Social Media Icons and Sitemap link */}
            <Box ml={{ lg: 6 }}>
              {/* Sitemap icon */}
              <IconButton href="/site-map">
                <AccountTreeIcon sx={{ color: "#A9AAB5" }} />
              </IconButton>

              {/* Twitter icon */}
              <IconButton
                href="https://x.com/CosmicSignatureNFT"
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  color="#A9AAB5"
                  width={24}
                  height={24}
                />
              </IconButton>

              {/* Discord icon */}
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
