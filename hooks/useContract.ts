import { Contract } from "@ethersproject/contracts";
import { useEffect, useMemo, useState } from "react";
import { useActiveWeb3React } from "./web3"; // Custom hook to access active web3 instance

// Custom hook to interact with a smart contract using the provided address and ABI
export default function useContract<T extends Contract = Contract>(
  address: string, // Contract address
  ABI: any // ABI of the contract
): T | null {
  const { library, account, chainId } = useActiveWeb3React(); // Get web3 library, account, and chainId
  const [byteCode, setByteCode] = useState(""); // State to store the bytecode of the contract

  // Effect to fetch contract bytecode once the address and library are available
  useEffect(() => {
    const getByteCode = async (address: string) => {
      // Fetch contract bytecode from the network
      const code = await library.getCode(address);
      setByteCode(code); // Store bytecode in state
    };

    // Only fetch bytecode if library is available
    if (library) {
      getByteCode(address); // Fetch bytecode on address or library change
    }
  }, [address, library]); // Dependencies: Re-run effect when address or library changes

  // Memoize and return the contract instance based on the provided parameters
  return useMemo(() => {
    // Ensure all necessary parameters are available before creating the contract
    if (!address || !ABI || !library || !chainId || byteCode.length <= 2) {
      return null; // Return null if any required data is missing or bytecode is invalid
    }

    try {
      // If an account is available, use its signer; otherwise, use the library directly
      if (account) {
        return new Contract(address, ABI, library.getSigner(account)); // Contract with signer
      } else {
        return new Contract(address, ABI, library); // Contract without signer
      }
    } catch (error) {
      console.error("Failed To Get Contract", error); // Log error if contract creation fails
      return null; // Return null in case of an error
    }
  }, [address, ABI, library, account, byteCode]) as T; // Re-run memoization when any dependency changes
}
