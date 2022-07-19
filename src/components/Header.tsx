import React, { useContext, useEffect, useState } from 'react';
import { hethers } from '@hashgraph/hethers';
import { GlobalContext } from '../providers/Global';
import Button from './Button';

const Header = () => {
  const contextValue = useContext(GlobalContext);
  const { connected, connectWallet, disconnectWallet, extensionFound, isHashpackLoading, userId } =
    contextValue.connection;
  const { isRunning } = contextValue;

  const [userBalance, setUserBalance] = useState('0.0');

  useEffect(() => {
    const getUserTokensData = async () => {
      if (userId) {
        const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
        const userBalanceBN = await provider.getBalance(userId);
        const tokenBalance = hethers.utils.formatHbar(userBalanceBN);

        setUserBalance(tokenBalance);
      }
    };

    getUserTokensData();
    document.addEventListener('transaction-response-received', getUserTokensData);

    return () => {
      document.removeEventListener('transaction-response-received', getUserTokensData);
    };
  }, [userId]);

  return (
    <div className="p-5">
      <div className="d-flex justify-content-end">
        <div className="d-flex align-items-center">
          {isRunning ? <span className="me-3">🟢</span> : <span className="me-3">🔴</span>}
          {extensionFound ? (
            isHashpackLoading ? (
              <p className="text-warning mx-2">Please aprove from your wallet</p>
            ) : connected ? (
              <>
                <div className="container-connected">
                  <div className="text-small">{userBalance} HBAR</div>
                  <div className="container-address">
                    <div className="text-small">{userId}</div>
                  </div>
                </div>
                <Button
                  onClick={() => disconnectWallet()}
                  className="mx-2"
                  type="primary"
                  size="small"
                  outline={true}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={() => connectWallet()} type="primary" size="small" className="mx-2">
                Connect wallet
              </Button>
            )
          ) : (
            <p className="text-warning mx-2">
              Please{' '}
              <a target="_blank" className="link" rel="noreferrer" href="https://www.hashpack.app/">
                install
              </a>{' '}
              a wallet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
