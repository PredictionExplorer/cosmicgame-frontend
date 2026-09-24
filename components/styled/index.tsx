/**
 * @deprecated Parallel primitives left from the MUI migration. Every export
 * here has a counterpart in components/ui; wave 3 moves the call sites and
 * wave 4 deletes this module. Do not add to it.
 *
 *   TablePrimary*             → ResponsiveTable* (components/ui/responsive-table)
 *   GradientText              → GradientText (components/ui/gradient-text)
 *   SearchField, CustomTextField, StyledInput → Input or SearchField (components/ui)
 *   SearchButton, ConnectButton, MobileConnectButton → Button (components/ui/button)
 *   StyledCard, VideoCard, CodeWrapper, GradientBorder, NFTImageWrapper → Surface
 *   MainWrapper               → PageShell (components/ui/page-shell)
 *   SectionWrapper, CenterBox, SearchBox → Container and plain layout classes
 *   NFTSkeleton               → SkeletonArtPlate (components/ui/skeleton)
 */
import React from 'react';

import { cn } from '@/lib/utils';
import { GradientText as UiGradientText } from '@/components/ui/gradient-text';
import { Input } from '@/components/ui/input';
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableContainer,
  ResponsiveTableHead,
  ResponsiveTableHeadCell,
  ResponsiveTableRow,
} from '@/components/ui/responsive-table';

/** @deprecated Use the `link` utility on an `<a>` (styles/global.css). */
export function StyledLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  // These frequently wrap IPFS URIs and contract addresses, which have no
  // natural break opportunity and otherwise run off a narrow screen.
  return <a className={cn('break-words text-white underline', className)} {...props} />;
}

/** @deprecated Use `Surface` (components/ui/surface). */
export function StyledCard({
  className,
  variant: _variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'alt' }) {
  return (
    <div className={cn('relative bg-transparent shadow-none', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Table primitives.
 *
 * These are thin aliases over `components/ui/responsive-table`, which replaced
 * `react-super-responsive-table`. The important difference for callers is that
 * `TablePrimaryCell` now requires a `label`: it is what the mobile card layout
 * shows beside the value, and making it explicit is what stops a cell from
 * inheriting the wrong column's label.
 */
/** @deprecated Import `ResponsiveTableContainer` from components/ui/responsive-table. */
export const TablePrimaryContainer = ResponsiveTableContainer;
/** @deprecated Import `ResponsiveTable` from components/ui/responsive-table. */
export const TablePrimary = ResponsiveTable;
/** @deprecated Import `ResponsiveTableHead` from components/ui/responsive-table. */
export const TablePrimaryHead = ResponsiveTableHead;
/** @deprecated Import `ResponsiveTableBody` from components/ui/responsive-table. */
export const TablePrimaryBody = ResponsiveTableBody;
/** @deprecated Import `ResponsiveTableHeadCell` from components/ui/responsive-table. */
export const TablePrimaryHeadCell = ResponsiveTableHeadCell;
/** @deprecated Import `ResponsiveTableCell` from components/ui/responsive-table. */
export const TablePrimaryCell = ResponsiveTableCell;
/** @deprecated Import `ResponsiveTableRow` from components/ui/responsive-table. */
export const TablePrimaryRow = ResponsiveTableRow;

/**
 * Renders a long column name on desktop and a short one on mobile.
 *
 * Only useful in the header now — mobile card labels come from each cell's
 * `label` prop, which should already be the short form.
 */
export function TableResponsiveHeaderLabel({
  desktop,
  mobile,
}: {
  desktop: string;
  mobile: string;
}) {
  return (
    <>
      <span className="sm:hidden">{mobile}</span>
      <span className="hidden sm:inline">{desktop}</span>
    </>
  );
}

/** @deprecated Use `Link` from '@/i18n/navigation' with the `link-quiet` utility. */
export function NavLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn('text-base text-white uppercase no-underline hover:underline', className)}
      {...props}
    />
  );
}

export function AppBarWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        // A single fine rule and the same ink surface as the landing navigation.
        // Keep the declared height in sync with sticky offsets throughout the app.
        'fixed top-0 left-0 right-0 z-50 flex h-[var(--header-height)] items-center border-b border-white/10 bg-background/95 backdrop-blur-xl',
        'print:static print:z-auto print:w-full',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export function FooterWrapper({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn('bg-background', className)} {...props}>
      {children}
    </footer>
  );
}

export function DrawerList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-full w-full flex-col overflow-y-auto bg-background pt-2', className)}
      {...props}
    />
  );
}

/** @deprecated Unused wallet pill; the header renders `ConnectWalletButton`. */
export function Wallet({
  className,
  label,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border px-4 py-2 h-auto ml-auto text-base',
        className,
      )}
      {...props}
    >
      {label}
    </div>
  );
}

/** @deprecated Use `Button` (components/ui/button). */
export function ConnectButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('ml-auto', className)} {...props} />;
}

/** @deprecated Use `Button` (components/ui/button). */
export function MobileConnectButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ConnectButton className={cn('mr-auto', className)} {...props} />;
}

/** @deprecated Use `PageShell` (components/ui/page-shell). */
export function MainWrapper({ className, id, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      id={id ?? 'main'}
      tabIndex={-1}
      className={cn(
        'mx-auto w-full max-w-[83rem] px-4 pt-[calc(var(--header-height)+3.5rem)] pb-12 leading-normal relative z-[1] sm:px-6 sm:pb-16 max-sm:pt-[calc(var(--header-height)+2rem)]',
        className,
      )}
      {...props}
    />
  );
}

/** @deprecated Use plain flex classes. */
export function CenterBox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-start max-sm:justify-center', className)}
      {...props}
    />
  );
}

/** @deprecated Unused. */
export function CounterWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end items-center', className)} {...props} />;
}

/** @deprecated Unused. */
export function CounterItemWrapper({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative w-[75px] px-4 py-1.5 mx-auto mb-2 border border-primary/50 rounded overflow-hidden',
        className,
      )}
      style={style}
      {...props}
    />
  );
}

/** @deprecated Unused. */
export function CounterItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-1/4 py-2 box-border max-sm:w-4/5', className)} {...props} />;
}

/** @deprecated Use the `art-plate` utility. */
export function NFTImageWrapper({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative border border-primary/50 rounded-lg overflow-hidden', className)}
      style={style}
      {...props}
    />
  );
}

/** @deprecated Use `SkeletonArtPlate` (components/ui/skeleton). */
export function NFTSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('w-full pt-[64%] animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/** @deprecated Unused. */
export function NFTCheckMark({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute top-0 left-0', className)} {...props} />;
}

/** @deprecated Unused. */
export function NFTInfoWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute top-4 left-5', className)} {...props} />;
}

/** @deprecated Use plain flex classes around `SearchField`. */
export function SearchBox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-center items-center mb-8 max-xs:flex-col', className)}
      {...props}
    />
  );
}

/**
 * @deprecated Use `SearchField` from components/ui/search-field (icon, clear
 * button, 16px on phones). This thin wrapper renders the shared `Input`.
 */
export function SearchField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      className={cn('mr-2 max-w-[360px] max-xs:mr-0 max-xs:mb-4 max-xs:max-w-none', className)}
      {...props}
    />
  );
}

/** @deprecated Use `<Button type="submit">` (components/ui/button). */
export function SearchButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-11 shrink-0 items-center justify-center rounded-md text-sm font-medium px-4 py-2 bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-xs:w-full',
        className,
      )}
      {...props}
    />
  );
}

/** @deprecated Use `Surface` (components/ui/surface). */
export function VideoCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative rounded-xl border border-white/10 bg-card px-4 py-5', className)}
      {...props}
    />
  );
}

/** @deprecated Use `Section` or `Container` (components/ui). */
export function SectionWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('py-16 max-sm:py-8', className)} {...props} />;
}

/** @deprecated Import `GradientText` from components/ui/gradient-text. */
export function GradientText(props: React.ComponentProps<typeof UiGradientText>) {
  return <UiGradientText {...props} />;
}

/** @deprecated Use `Surface variant="gradient-border"` (components/ui/surface). */
export function GradientBorder({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative border border-primary/50 rounded-2xl overflow-hidden', className)}
      style={style}
      {...props}
    />
  );
}

/** @deprecated Use `Surface` (components/ui/surface). */
export function CodeWrapper({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative border border-primary/50 rounded-2xl overflow-hidden bg-white/5',
        className,
      )}
      style={style}
      {...props}
    />
  );
}

/** @deprecated Use `Input` (components/ui/input); this thin wrapper renders it. */
export function CustomTextField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input className={cn('px-4', className)} {...props} />;
}

/** @deprecated Use `Input type="number"` (components/ui/input). */
export function StyledInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        '[&::-webkit-outer-spin-button]:appearance-[inner-spin-button] [&::-webkit-inner-spin-button]:appearance-[inner-spin-button] [&::-webkit-inner-spin-button]:w-[15px] [&::-webkit-inner-spin-button]:absolute [&::-webkit-inner-spin-button]:px-1.5 [&::-webkit-inner-spin-button]:top-0 [&::-webkit-inner-spin-button]:right-0 [&::-webkit-inner-spin-button]:h-full',
        className,
      )}
      {...props}
    />
  );
}

/** @deprecated Use `DropdownMenuItem` (components/ui/dropdown-menu). */
export function PrimaryMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-inherit min-h-[32px] px-4 py-1.5 cursor-pointer hover:bg-white/5',
        className,
      )}
      {...props}
    />
  );
}
