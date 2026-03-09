import { networkConfig } from "../config/networks";

const { chainHex, chainName, rpcUrl } = networkConfig;

const accountRequest = (ethereum: any) => {
  return ethereum.request({ method: "eth_requestAccounts" });
};

const switchRequest = (ethereum: any) => {
  return ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: chainHex }],
  });
};

const addChainRequest = (ethereum: any) => {
  return ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainHex,
        chainName,
        rpcUrls: [rpcUrl],
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      },
    ],
  });
};

export const switchNetwork = async () => {
  const { ethereum } = window;
  if (ethereum) {
    try {
      await accountRequest(ethereum);
      await switchRequest(ethereum);
    } catch (error) {
      if (error.code === 4902) {
        try {
          await addChainRequest(ethereum);
          await switchRequest(ethereum);
        } catch (addError) {
          console.log(addError);
        }
      }
    }
  }
};
