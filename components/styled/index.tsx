import React, { type ComponentPropsWithoutRef } from 'react';
import { Table, Thead, Tr, Th, Td } from 'react-super-responsive-table';

import { cn } from '@/lib/utils';

export function StyledLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn('text-white underline', className)} {...props} />;
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

export function TablePrimaryContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function TablePrimary({ className, ...props }: ComponentPropsWithoutRef<typeof Table>) {
  return <Table className={cn('border-collapse w-full', className)} {...props} />;
}

export function TablePrimaryHead({ className, ...props }: ComponentPropsWithoutRef<typeof Thead>) {
  return <Thead className={cn('bg-muted/60 sticky top-0 z-[1]', className)} {...props} />;
}

export function TablePrimaryHeadCell({ className, ...props }: ComponentPropsWithoutRef<typeof Th>) {
  return (
    <Th
      className={cn(
        'text-muted-foreground font-medium text-xs uppercase tracking-wider leading-[1.43] border-b border-white/[0.06] px-4 py-3 max-sm:text-[10px]',
        className,
      )}
      {...props}
    />
  );
}

export function TablePrimaryCell({ className, ...props }: ComponentPropsWithoutRef<typeof Td>) {
  return (
    <Td
      className={cn(
        'font-normal text-muted-foreground leading-[1.43] border-b border-white/[0.03] px-4 py-3.5 text-sm max-sm:text-xs',
        className,
      )}
      {...props}
    />
  );
}

export function TablePrimaryRow({ className, ...props }: ComponentPropsWithoutRef<typeof Tr>) {
  return (
    <Tr
      className={cn(
        'border-0 transition-colors hover:bg-white/[0.04] even:bg-white/[0.015]',
        className,
      )}
      {...props}
    />
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
        'fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.06] py-4 print:static print:z-auto print:w-full',
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
  return <div className={cn('pt-4 w-[265px] h-full bg-background', className)} {...props} />;
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

export function MainWrapper({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        'mx-auto w-full max-w-7xl px-4 pt-40 pb-40 overflow-hidden leading-normal min-h-[calc(100vh-100px)] relative z-[1] max-sm:pt-36 max-sm:pb-24',
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
        'mr-2 w-[360px] flex h-10 rounded-md border border-input bg-background px-3 py-2 text-[15px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-xs:mr-0 max-xs:mb-4 max-xs:w-full',
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
        'inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 bg-gradient-to-r from-[#06AEEC] to-[#9C37FD] text-white hover:opacity-90 max-xs:w-full',
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
  return (
    <Component
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
        'flex h-10 w-full rounded-md border border-input bg-background px-4 py-3 text-[15px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
