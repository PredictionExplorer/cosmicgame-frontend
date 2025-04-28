import React, { FC, useState } from "react";
import { Collapse, List, ListItemButton } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { NavLink } from "./styled";
import { NavDescriptor } from "../config/nav";

/** -----------------------------------------------------------------------
 * Type Definitions
 * ------------------------------------------------------------------------*/

/** Re-use the same descriptor type we introduced in ListNavItem.tsx */

interface NestedListItemProps {
  /** Primary navigation entry with optional sub-items */
  nav: NavDescriptor;
}

/** -----------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------*/

/**
 * Recursively renders a sidebar/table-of-contents entry that can expand to
 * reveal nested links. Designed for mobile drawers or doc sidebars.
 */
const NestedListItem: FC<NestedListItemProps> = ({ nav }) => {
  /** Whether the submenu is expanded */
  const [open, setOpen] = useState(false);

  /** Toggle handler for accordion behaviour */
  const handleToggle = () => setOpen((prev) => !prev);

  /* -------------------------------------------------------------------- */

  return (
    <>
      {nav.children ? (
        // ---------------------------------------------------------------
        // Parent item that controls a collapsible submenu
        // ---------------------------------------------------------------
        <ListItemButton onClick={handleToggle} aria-expanded={open}>
          <NavLink sx={{ display: "flex", alignItems: "center" }}>
            {nav.title}
            {open ? (
              <ExpandLess sx={{ ml: "auto" }} />
            ) : (
              <ExpandMore sx={{ ml: "auto" }} />
            )}
          </NavLink>
        </ListItemButton>
      ) : (
        // ---------------------------------------------------------------
        // Leaf node — a normal link without submenu
        // ---------------------------------------------------------------
        <ListItemButton>
          <NavLink href={nav.route}>{nav.title}</NavLink>
        </ListItemButton>
      )}

      {/* ---------------------------------------------------------------
       * Collapsible children (if any)
       * -------------------------------------------------------------*/}
      {nav.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {nav.children.map((child, i) => (
              <ListItemButton key={i} sx={{ pl: 4 }}>
                <NavLink href={child.route}>{child.title}</NavLink>
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default NestedListItem;
