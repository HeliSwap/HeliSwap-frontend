import React, { useEffect, useState } from 'react';
import Hashconnect from '../connectors/hashconnect';
import useHealthCheck from '../hooks/useHealthCheck';
import SDK from '../sdk/sdk';

const contextInitialValue = {
  sdk: {} as SDK,
  connection: {
    userId: '',
    connected: false,
    isConnectionLoading: true,
    isHashpackLoading: false,
    extensionFound: false,
    connectWallet: () => {},
    disconnectWallet: () => {},
    hashconnectConnectorInstance: {} as Hashconnect,
  },
  isRunning: false,
};

export const GlobalContext = React.createContext(contextInitialValue);

interface IGlobalProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: IGlobalProps) => {
  const [sdk, setSdk] = useState({} as SDK);
  const [connected, setConnected] = useState(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState(true);
  const [isHashpackLoading, setIsHashpackLoading] = useState(false);
  const [extensionFound, setExtensionFound] = useState(false);
  const [hashconnectConnectorInstance, setHashconnectConnectorInstance] = useState<Hashconnect>();
  const [userId, setUserId] = useState('');

  const { timestamp, error } = useHealthCheck({
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  });

  const nowSeconds = Date.now() / 1000;
  const isRunning = !error ? (timestamp ? nowSeconds >= Number(timestamp) : false) : false;

  const connectWallet = () => {
    hashconnectConnectorInstance?.connect();
    setIsHashpackLoading(true);
  };

  const disconnectWallet = () => {
    hashconnectConnectorInstance?.disconnect();
    setUserId('');
  };

  const connection = {
    connected,
    userId,
    isConnectionLoading,
    isHashpackLoading,
    extensionFound,
    connectWallet,
    disconnectWallet,
    hashconnectConnectorInstance: hashconnectConnectorInstance || ({} as Hashconnect),
  };
  const contextValue = { sdk, connection, isRunning };

  useEffect(() => {
    const initHashconnectConnector = async () => {
      const hashconnectConnector = new Hashconnect(
        setIsConnectionLoading,
        setExtensionFound,
        setConnected,
        setUserId,
        setIsHashpackLoading,
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
