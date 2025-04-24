import React, { FC, useState } from "react";
import { ListItem, Collapse, List } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { NavLink } from "./styled";

/** -----------------------------------------------------------------------
 * Type Definitions
 * ------------------------------------------------------------------------*/

/** Re-use the same descriptor type we introduced in ListNavItem.tsx */
export interface NavDescriptor {
  title: string;
  route?: string;
  children?: NavDescriptor[];
}

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
        <ListItem button onClick={handleToggle} aria-expanded={open}>
          <NavLink sx={{ display: "flex", alignItems: "center" }}>
            {nav.title}
            {open ? (
              <ExpandLess sx={{ ml: "auto" }} />
            ) : (
              <ExpandMore sx={{ ml: "auto" }} />
            )}
          </NavLink>
        </ListItem>
      ) : (
        // ---------------------------------------------------------------
        // Leaf node — a normal link without submenu
        // ---------------------------------------------------------------
        <ListItem button>
          <NavLink href={nav.route}>{nav.title}</NavLink>
        </ListItem>
      )}

      {/* ---------------------------------------------------------------
       * Collapsible children (if any)
       * -------------------------------------------------------------*/}
      {nav.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {nav.children.map((child, i) => (
              <ListItem key={i} sx={{ pl: 4 }} button>
                <NavLink href={child.route}>{child.title}</NavLink>
              </ListItem>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default NestedListItem;
