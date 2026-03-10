'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MainWrapper } from '@/components/styled';

export default function NotFound() {
  return (
    <MainWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-primary text-center">404 - Page Not Found</h1>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </MainWrapper>
  );
}
