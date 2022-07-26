import React, { useEffect, useState } from 'react';
import Hashconnect from '../connectors/hashconnect';
import { HEALTH_CHECK_INTERVAL } from '../constants';
import useHealthCheck from '../hooks/useHealthCheck';
import SDK from '../sdk/sdk';
import { timestampToDate } from '../utils/timeUtils';

const contextInitialValue = {
  sdk: {} as SDK,
  connection: {
    userId: '',
    connected: false,
    isHashpackLoading: false,
    extensionFound: false,
    connectWallet: () => {},
    disconnectWallet: () => {},
    hashconnectConnectorInstance: {} as Hashconnect,
    showConnectModal: false,
    setShowConnectModal: (show: boolean) => {},
  },
  isRunning: false,
  lastUpdated: '',
};

export const GlobalContext = React.createContext(contextInitialValue);

interface IGlobalProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: IGlobalProps) => {
  const [sdk, setSdk] = useState({} as SDK);
  const [connected, setConnected] = useState(false);
  const [isHashpackLoading, setIsHashpackLoading] = useState(false);
  const [extensionFound, setExtensionFound] = useState(false);
  const [hashconnectConnectorInstance, setHashconnectConnectorInstance] = useState<Hashconnect>();
  const [userId, setUserId] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);

  const { timestamp, error } = useHealthCheck({
    fetchPolicy: 'network-only',
    pollInterval: HEALTH_CHECK_INTERVAL,
  });

  const lastUpdated = timestampToDate(timestamp);
  const nowSeconds = Date.now() / 1000;
  const isRunning = !error
    ? timestamp
      ? nowSeconds + HEALTH_CHECK_INTERVAL / 1000 >= Number(timestamp)
      : false
    : false;

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
    isHashpackLoading,
    extensionFound,
    connectWallet,
    disconnectWallet,
    hashconnectConnectorInstance: hashconnectConnectorInstance || ({} as Hashconnect),
    showConnectModal,
    setShowConnectModal,
  };
  const contextValue = { sdk, connection, isRunning, lastUpdated };

  useEffect(() => {
    const initHashconnectConnector = async () => {
      const hashconnectConnector = new Hashconnect(
        setExtensionFound,
        setConnected,
        setUserId,
        setIsHashpackLoading,
        setShowConnectModal,
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
