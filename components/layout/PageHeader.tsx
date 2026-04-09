'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  className?: string;
  align?: 'left' | 'center';
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  className,
  align = 'center',
  children,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('mb-10', align === 'center' && 'text-center', className)}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight md:text-4xl">
        {title}
      </h1>
      <div className="mx-auto mt-4 h-px max-w-xs bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      )}
      {children}
    </motion.div>
  );
}
