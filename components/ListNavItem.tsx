import React, { FC, useState, MouseEvent } from "react";
import { Menu, MenuItem, Box } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { NavLink } from "./styled";
import { NavDescriptor } from "../config/nav";

/** -----------------------------------------------------------------------
 * Type Definitions
 * ------------------------------------------------------------------------*/

interface ListNavItemProps {
  /** Data describing the link (and its optional children) */
  nav: NavDescriptor;
}

/** -----------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------*/

/**
 * A single entry inside the top‑level navigation bar.
 *
 *  - If `nav.children` is provided, clicking the item opens a dropdown menu
 *    with additional links.
 *  - Otherwise, it behaves as a normal link to `nav.route`.
 */
const ListNavItem: FC<ListNavItemProps> = ({ nav }) => {
  /** Anchor element that the dropdown menu is attached to */
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /** -------------------------------------------------------------------
   * Event handlers
   * ------------------------------------------------------------------*/

  const openMenu = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => setAnchorEl(null);

  /** Derived boolean for convenience */
  const menuOpen = Boolean(anchorEl);

  /* -------------------------------------------------------------------- */

  return (
    <>
      {/* Primary nav link ------------------------------------------------ */}
      <Box ml={3 /* left padding between navbar items */}>
        {nav.children ? (
          <NavLink
            // Acts as a button when there are sub‑items
            onClick={openMenu}
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": { textDecoration: "none" },
            }}
          >
            {nav.title}
            {menuOpen ? <ExpandLess /> : <ExpandMore />}
          </NavLink>
        ) : (
          <NavLink
            href={nav.route}
            sx={{ "&:hover": { textDecoration: "none" } }}
          >
            {nav.title}
          </NavLink>
        )}
      </Box>

      {/* Dropdown menu --------------------------------------------------- */}
      {nav.children && (
        <Menu
          elevation={0}
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={closeMenu}
          keepMounted
          disableAutoFocusItem
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{
            "& > .MuiPaper-root": {
              boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.75)",
            },
          }}
        >
          {nav.children.map((child, i) => (
            <MenuItem key={i} sx={{ minWidth: 166 }} onClick={closeMenu}>
              <NavLink href={child.route} sx={{ width: "100%" }}>
                {child.title}
              </NavLink>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default ListNavItem;
