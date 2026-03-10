interface EthereumRequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

interface Window {
  ethereum?: {
    isMetaMask?: true;
    on?: (...args: unknown[]) => void;
    removeListener?: (...args: unknown[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    request: (arg: EthereumRequestArguments) => Promise<unknown>;
  };
  web3?: Record<string, unknown>;
  gtag?: (...args: [string, ...unknown[]]) => void;
}
