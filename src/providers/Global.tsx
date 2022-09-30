import React, { useEffect, useState } from 'react';
import Hashconnect from '../connectors/hashconnect';
import { HEALTH_CHECK_INTERVAL } from '../constants';
import useHealthCheck from '../hooks/useHealthCheck';
import useTokensWhitelisted from '../hooks/useTokensWhitelisted';
import useHbarPrice from '../hooks/useHbarPrice';
import { ITokenListData } from '../interfaces/tokens';
import SDK from '../sdk/sdk';

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
  tokensWhitelisted: [] as ITokenListData[],
  isRunning: false,
  lastUpdated: '',
  hbarPrice: 0,
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

  const { tokens: tokensWhitelisted } = useTokensWhitelisted();

  const { hbarPrice } = useHbarPrice();

  const lastUpdated = new Date(Number(timestamp) * 1000).toString();

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
  const contextValue = { sdk, connection, isRunning, lastUpdated, tokensWhitelisted, hbarPrice };

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
