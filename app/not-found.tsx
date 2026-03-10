import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-8">
      <h1 className="font-display text-4xl font-semibold text-primary md:text-5xl">
        404 - Page Not Found
      </h1>
      <Link
        href="/"
        className="mt-2 rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10"
      >
        Return Home
      </Link>
    </main>
  );
}
