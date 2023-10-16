import React, { createContext, useContext, useState, ReactNode } from "react";

interface ApiDataContextProps {
  children: ReactNode;
}

interface ApiDataContextValue {
  apiData: any; // Change this type based on your API response structure
  setApiData: React.Dispatch<React.SetStateAction<any>>;
}

const ApiDataContext = createContext<ApiDataContextValue | undefined>(
  undefined
);

export const useApiData = (): ApiDataContextValue => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};

export const ApiDataProvider: React.FC<ApiDataContextProps> = ({
  children,
}) => {
  const [apiData, setApiData] = useState({
    ETHRaffleToClaim: 0,
    ETHRaffleToClaimWei: 0,
    NumDonatedNFTToClaim: 0,
  });

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData }}>
      {children}
    </ApiDataContext.Provider>
  );
};
