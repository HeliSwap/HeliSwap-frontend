import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Hashconnect from '../connectors/hashconnect';
import BladeConnect from '../connectors/blade';

import { ITokenListData, ITokenPriceMapping } from '../interfaces/tokens';

import useHealthCheck from '../hooks/useHealthCheck';
import useTokensWhitelisted from '../hooks/useTokensWhitelisted';
import useHbarPrice from '../hooks/useHbarPrice';
import useHeliPrice from '../hooks/useHeliPrice';
import SDK from '../sdk/sdk';

import { HEALTH_CHECK_INTERVAL } from '../constants';
import useTokenPriceMapping from '../hooks/useTokenPriceMapping';

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
    connectorInstance: {} as any,
    showConnectModal: false,
    setShowConnectModal: (show: boolean) => {},
    pairingString: '',
  },
  tokensWhitelisted: [] as ITokenListData[],
  tokenPriceMapping: {} as ITokenPriceMapping,
  isRunning: false,
  lastUpdated: '',
  hbarPrice: 0,
  heliPrice: 0,
};

export const GlobalContext = React.createContext(contextInitialValue);

interface IGlobalProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: IGlobalProps) => {
  const [sdk, setSdk] = useState({} as SDK);
  const [provider, setProvider] = useState({} as ethers.providers.JsonRpcProvider);
  const [connected, setConnected] = useState(false);
  const [pairingString, setPairingString] = useState('');
  const [isHashpackLoading, setIsHashpackLoading] = useState(false);
  const [extensionFound, setExtensionFound] = useState(false);
  const [hashconnectConnectorInstance, setHashconnectConnectorInstance] = useState<Hashconnect>();
  const [bladeConnectorInstance, setBladeConnectorInstance] = useState<BladeConnect>();
  const [connectorInstance, setConnectorInstance] = useState<BladeConnect | Hashconnect>();
  const [userId, setUserId] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);

  const { timestamp, error } = useHealthCheck({
    fetchPolicy: 'network-only',
    pollInterval: HEALTH_CHECK_INTERVAL,
  });

  const { tokens: tokensWhitelisted } = useTokensWhitelisted();

  const { hbarPrice } = useHbarPrice();
  const { heliPrice } = useHeliPrice();
  const tokenAddresses = tokensWhitelisted.map(token => token.address);
  const tokenPriceMapping = useTokenPriceMapping(tokenAddresses);

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
    await bladeConnectorInstance?.connect();
  };

  const disconnectWallet = () => {
    bladeConnectorInstance?.connector.killSession();
    hashconnectConnectorInstance?.clearPairings();
    localStorage.clear();
    setUserId('');
    setConnectorInstance(undefined);
  };

  const connection = {
    connected,
    userId,
    isHashpackLoading,
    extensionFound,
    connectHashpackWallet,
    connectBladeWallet,
    disconnectWallet,
    connectorInstance,
    showConnectModal,
    setShowConnectModal,
    pairingString,
  };

  const contextValue = {
    sdk,
    connection,
    isRunning,
    lastUpdated,
    tokensWhitelisted,
    hbarPrice,
    heliPrice,
    provider,
    tokenPriceMapping,
  };

  console.log('In global context');

  useEffect(() => {
    const initHashconnectConnector = async () => {
      const hashconnectConnector = new Hashconnect(
        setExtensionFound,
        setConnected,
        setUserId,
        setIsHashpackLoading,
        setShowConnectModal,
        setConnectorInstance,
      );

      await hashconnectConnector.initHashconnect();
      setHashconnectConnectorInstance(hashconnectConnector);
      setPairingString(hashconnectConnector.pairingString);
    };

    const initBladeConnector = async () => {
      const bladeConnectorInstance = new BladeConnect(
        setConnected,
        setUserId,
        setShowConnectModal,
        setConnectorInstance,
      );
      const sessionFromLS = localStorage.getItem('wc@2:client:0.3//session');

      if (sessionFromLS && JSON.parse(sessionFromLS).length > 0) {
        // const session = JSON.parse(sessionFromLS);
        await bladeConnectorInstance.connect();
      }

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
