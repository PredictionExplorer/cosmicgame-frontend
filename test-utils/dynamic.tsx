import type { ComponentType } from 'react';

type Loaded<P> = ComponentType<P> | { default: ComponentType<P> };

const pending: Promise<unknown>[] = [];

/**
 * `next/dynamic` for jest: the component's module is requested when the
 * mocked module is imported, and renders synchronously once
 * `flushDynamicImports()` has been awaited (in a `beforeAll`), so a test can
 * assert on a code-split chart without waiting in every case.
 *
 *   jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);
 *   beforeAll(() => flushDynamicImports());
 */
export function syncDynamic<P extends object>(loader: () => Promise<Loaded<P>>) {
  let Component: ComponentType<P> | null = null;
  pending.push(
    loader().then((loaded) => {
      // A module namespace (`import('…')`) carries `default`; a picked export is the component.
      Component = (
        typeof loaded === 'object' && loaded !== null && 'default' in loaded
          ? loaded.default
          : loaded
      ) as ComponentType<P>;
    }),
  );
  function DynamicComponent(props: P) {
    return Component ? <Component {...props} /> : null;
  }
  return DynamicComponent;
}

/** Resolves every module a `syncDynamic` component asked for. */
export async function flushDynamicImports(): Promise<void> {
  await Promise.all(pending);
}
