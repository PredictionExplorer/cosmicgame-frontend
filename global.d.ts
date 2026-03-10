declare module 'react-copy-to-clipboard' {
  import { ReactNode } from 'react';
  export class CopyToClipboard extends React.Component<{
    text: string;
    children: ReactNode;
  }> {}
}

declare module 'react-awesome-lightbox' {
  import { FC } from 'react';
  const Lightbox: FC<{ image: string; onClose: () => void }>;
  export default Lightbox;
}

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
}
