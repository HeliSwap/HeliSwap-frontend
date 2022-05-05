import React, { useEffect, useState } from 'react';
import Hashconnect from '../connectors/hashconnect';
import SDK from '../sdk/sdk';

const contextInitialValue = {
  sdk: {},
  connection: {
    userId: '',
    connected: false,
    isConnectionLoading: true,
    extensionFound: false,
    connectWallet: () => {},
    disconnectWallet: () => {},
    hashconnectConnectorInstance: {} as Hashconnect,
  },
};

export const GlobalContext = React.createContext(contextInitialValue);

interface IGlobalProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: IGlobalProps) => {
  const [sdk, setSdk] = useState({});
  const [connected, setConnected] = useState(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState(true);
  const [extensionFound, setExtensionFound] = useState(false);
  const [hashconnectConnectorInstance, setHashconnectConnectorInstance] = useState<Hashconnect>();
  const [userId, setUserId] = useState('');

  const connectWallet = () => {
    hashconnectConnectorInstance?.connect();
  };

  const disconnectWallet = () => {
    hashconnectConnectorInstance?.disconnect();
  };

  const connection = {
    connected,
    userId,
    isConnectionLoading,
    extensionFound,
    connectWallet,
    disconnectWallet,
    hashconnectConnectorInstance: hashconnectConnectorInstance || ({} as Hashconnect),
  };
  const contextValue = { sdk, connection };

  useEffect(() => {
    const initHashconnectConnector = async () => {
      const hashconnectConnector = new Hashconnect(
        setIsConnectionLoading,
        setExtensionFound,
        setConnected,
      );

      await hashconnectConnector.initHashconnect();
      setUserId(hashconnectConnector.saveData.pairedAccounts[0]);
      setHashconnectConnectorInstance(hashconnectConnector);
    };

    initHashconnectConnector();

    const sdk = new SDK();
    setSdk(sdk);
  }, []);

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};
