/**
 * Jest mock for `@rainbow-me/rainbowkit`. The real package imports CSS +
 * ESM-only transitive deps that break jsdom — stub it out in tests.
 */
import type { ReactNode } from 'react';

module.exports = {
  ConnectButton: () => null,
  RainbowKitProvider: ({ children }: { children: ReactNode }) => children,
  darkTheme: () => ({}),
  getDefaultConfig: () => ({}),
};
