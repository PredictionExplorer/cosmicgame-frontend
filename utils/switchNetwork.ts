const accountRequest = (ethereum: any) => {
  return ethereum.request({ method: "eth_requestAccounts" });
};

const switchRequest = (ethereum: any) => {
  return ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x7A69" }], // local testnet
    // params: [{ chainId: "0x66eee" }], // sepolia
  });
};

const addChainRequest = (ethereum: any) => {
  return ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0x7A69',
        chainName: 'Localhost 22945',
        rpcUrls: ['http://161.129.67.42:22945'],
        nativeCurrency: {
          name: 'AGOR',
          symbol: 'AGOR',
          decimals: 18,
        },
      },
    ],
  })
  // return ethereum.request({
  //   method: "wallet_addEthereumChain",
  //   params: [
  //     {
  //       chainId: "0x66eee",
  //       chainName: "Arbitrum Sepolia",
  //       rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  //       nativeCurrency: {
  //         name: "ETH",
  //         symbol: "ETH",
  //         decimals: 18,
  //       },
  //     },
  //   ],
  // });
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
