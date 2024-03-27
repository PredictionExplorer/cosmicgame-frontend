import React, { useState } from "react";
import { Menu, MenuItem, Box } from "@mui/material";
import { NavLink } from "./styled";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const ListNavItem = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box ml={3}>
        {props.nav.children ? (
          <NavLink
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              "&:hover": { textDecoration: "none" },
              cursor: "pointer",
            }}
          >
            {props.nav.title}
            {anchorEl ? <ExpandLess /> : <ExpandMore />}
          </NavLink>
        ) : (
          <NavLink
            href={props.nav.route}
            sx={{ "&:hover": { textDecoration: "none" } }}
          >
            {props.nav.title}
          </NavLink>
        )}
      </Box>
      {props.nav.children && (
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
        >
          {props.nav.children.map((nav, i) => (
            <MenuItem
              key={i}
              style={{ minWidth: 166 }}
              onClick={handleMenuClose}
            >
              <NavLink href={nav.route} sx={{ width: "100%" }}>
                {nav.title}
              </NavLink>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default ListNavItem;
