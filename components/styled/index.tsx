import React from 'react';

import { cn } from '@/lib/utils';
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableContainer,
  ResponsiveTableHead,
  ResponsiveTableHeadCell,
  ResponsiveTableRow,
} from '@/components/ui/responsive-table';

export function StyledLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  // These frequently wrap IPFS URIs and contract addresses, which have no
  // natural break opportunity and otherwise run off a narrow screen.
  return <a className={cn('break-words text-white underline', className)} {...props} />;
}

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
export const TablePrimaryContainer = ResponsiveTableContainer;
export const TablePrimary = ResponsiveTable;
export const TablePrimaryHead = ResponsiveTableHead;
export const TablePrimaryBody = ResponsiveTableBody;
export const TablePrimaryHeadCell = ResponsiveTableHeadCell;
export const TablePrimaryCell = ResponsiveTableCell;
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
        // Base chrome: fixed glass bar with a soft aurora shadow.
        'fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/80 py-4 shadow-[0_16px_70px_-60px_rgb(var(--aurora-cyan-rgb)/0.9)] backdrop-blur-2xl',
        // Gradient hairlines: a faint stellar sheen on top, an aurora seam below.
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.14] before:to-transparent',
        'after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-[rgb(var(--aurora-cyan-rgb)/0.4)] after:to-transparent',
        'print:static print:z-auto print:w-full print:before:hidden print:after:hidden',
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

export function MobileWallet({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return <Wallet className={cn('mx-auto ml-0', className)} {...props} />;
}

export function ConnectButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('ml-auto', className)} {...props} />;
}

export function MobileConnectButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <ConnectButton className={cn('mr-auto', className)} {...props} />;
}

export function MainWrapper({ className, id, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      id={id ?? 'main'}
      tabIndex={-1}
      className={cn(
        'mx-auto w-full max-w-7xl px-4 pt-40 pb-40 overflow-x-clip leading-normal min-h-[calc(100vh-100px)] relative z-[1] max-sm:pt-36 max-sm:pb-24',
        className,
      )}
      {...props}
    />
  );
}

export function CenterBox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-start max-sm:justify-center', className)}
      {...props}
    />
  );
}

export function CounterWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end items-center', className)} {...props} />;
}

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

export function CounterItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-1/4 py-2 box-border max-sm:w-4/5', className)} {...props} />;
}

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

export function NFTSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('w-full pt-[64%] animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export function NFTCheckMark({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute top-0 left-0', className)} {...props} />;
}

export function NFTInfoWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute top-4 left-5', className)} {...props} />;
}

export function SearchBox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-center items-center mb-8 max-xs:flex-col', className)}
      {...props}
    />
  );
}

export function SearchField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'mr-2 w-full max-w-[360px] flex h-11 rounded-md border border-input bg-background px-3 py-2 text-base sm:text-[15px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-xs:mr-0 max-xs:mb-4 max-xs:max-w-none',
        className,
      )}
      {...props}
    />
  );
}

export function SearchButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-11 shrink-0 items-center justify-center rounded-md text-sm font-medium px-4 py-2 bg-gradient-to-r from-[#06AEEC] to-[#9C37FD] text-white hover:opacity-90 max-xs:w-full',
        className,
      )}
      {...props}
    />
  );
}

export function VideoCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative bg-[linear-gradient(#080B2A,#080B2A)_padding-box,linear-gradient(90deg,rgba(21,191,253,0)_8.19%,rgba(21,191,253,0.7)_70.61%,rgba(156,55,253,0.7)_100%)_border-box] rounded-2xl border-[6px] border-transparent px-4 py-5',
        className,
      )}
      {...props}
    />
  );
}

export function SectionWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('py-16 max-sm:py-8', className)} {...props} />;
}

export function GradientText({
  className,
  as: Component = 'span',
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AnyComponent = Component as any;
  return (
    <AnyComponent
      className={cn(
        'bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent',
        className,
      )}
      {...props}
    />
  );
}

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

export function CustomTextField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-4 py-3 text-base sm:text-[15px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
}

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
