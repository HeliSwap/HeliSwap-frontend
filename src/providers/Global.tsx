import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Hashconnect from '../connectors/hashconnect';
import BladeConnect from '../connectors/blade';

import { ITokenListData } from '../interfaces/tokens';

import useHealthCheck from '../hooks/useHealthCheck';
import useTokensWhitelisted from '../hooks/useTokensWhitelisted';
import useHbarPrice from '../hooks/useHbarPrice';

import SDK from '../sdk/sdk';

import { HEALTH_CHECK_INTERVAL } from '../constants';

const contextInitialValue = {
  sdk: {} as SDK,
  provider: {} as ethers.providers.JsonRpcProvider,
  connection: {
    userId: '',
    connected: false,
    isHashpackLoading: false,
    extensionFound: false,
    connectHashpackWallet: () => {},
    connectBladeWallet: () => {},
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
  const [provider, setProvider] = useState({} as ethers.providers.JsonRpcProvider);
  const [connected, setConnected] = useState(false);
  const [isHashpackLoading, setIsHashpackLoading] = useState(false);
  const [extensionFound, setExtensionFound] = useState(false);
  const [hashconnectConnectorInstance, setHashconnectConnectorInstance] = useState<Hashconnect>();
  const [bladeConnectorInstance, setBladeConnectorInstance] = useState<BladeConnect>();
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

  const connectHashpackWallet = () => {
    hashconnectConnectorInstance?.connectToExtension();
    setIsHashpackLoading(true);
  };

  const connectBladeWallet = async () => {
    const signer = await bladeConnectorInstance?.initBlade();
    console.log('signer', signer);
  };

  const disconnectWallet = () => {
    hashconnectConnectorInstance?.clearPairings();
    setUserId('');
  };

  const connection = {
    connected,
    userId,
    isHashpackLoading,
    extensionFound,
    connectHashpackWallet,
    connectBladeWallet,
    disconnectWallet,
    hashconnectConnectorInstance: hashconnectConnectorInstance || ({} as Hashconnect),
    showConnectModal,
    setShowConnectModal,
  };

  const contextValue = {
    sdk,
    connection,
    isRunning,
    lastUpdated,
    tokensWhitelisted,
    hbarPrice,
    provider,
  };

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
      setHashconnectConnectorInstance(hashconnectConnector);
    };

    const initBladeConnector = async () => {
      const bladeConnectorInstance = new BladeConnect(setConnected, setUserId);
      await bladeConnectorInstance.initBlade();
      setBladeConnectorInstance(bladeConnectorInstance);
    };

    initHashconnectConnector();
    initBladeConnector();

    const sdk = new SDK();
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER_URL);
    setSdk(sdk);
    setProvider(provider);
  }, []);

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>;
};
