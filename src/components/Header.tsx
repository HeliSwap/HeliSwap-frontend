import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hethers } from '@hashgraph/hethers';
import { GlobalContext } from '../providers/Global';
import { Md5 } from 'ts-md5/dist/md5';

import Button from './Button';
import Modal from './Modal';
import ConnectModalContent from './Modals/ConnectModalContent';
import UserAccountModalContent from './Modals/UserAccountModalContent';

import { formatHBARStringToPrice, formatStringETHtoPriceFormatted } from '../utils/numberUtils';

import { BALLANCE_FETCH_INTERVAL } from '../constants';

const Header = () => {
  const contextValue = useContext(GlobalContext);
  const { hbarPrice, heliPrice } = contextValue;

  const {
    connected,
    connectHashpackWallet,
    connectBladeWallet,
    disconnectWallet,
    extensionFound,
    isHashpackLoading,
    userId,
    showConnectModal,
    setShowConnectModal,
  } = contextValue.connection;

  const [showUserAccountModal, setShowUserAccountModal] = useState(false);
  const [userBalance, setUserBalance] = useState('0.0');

  const handleConnectButtonClick = () => {
    setShowConnectModal(true);
  };

  const getUserTokensData = useCallback(async () => {
    if (userId) {
      const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
      const userBalanceBN = await provider.getBalance(userId);
      const tokenBalance = hethers.utils.formatHbar(userBalanceBN);

      setUserBalance(formatStringETHtoPriceFormatted(tokenBalance));
    }
  }, [userId]);

  useEffect(() => {
    getUserTokensData();
    document.addEventListener('transaction-response-received', getUserTokensData);

    return () => {
      document.removeEventListener('transaction-response-received', getUserTokensData);
    };
  }, [userId, getUserTokensData]);

  useEffect(() => {
    const fetchInterval = setInterval(() => {
      getUserTokensData();
    }, BALLANCE_FETCH_INTERVAL);
    return () => {
      clearInterval(fetchInterval);
    };
  }, [getUserTokensData]);

  return (
    <div className="container-header p-3 p-md-5">
      <div className="d-flex justify-content-between justify-content-md-end align-items-center">
        <div className="d-sm-flex align-items-center">
          <div className="d-none d-xl-flex align-items-center">
            <a
              className="link mx-4"
              href="https://www.heliswap.io/ecosystem"
              target="_blank"
              rel="noreferrer"
            >
              Our Ecosystem
            </a>
            <a
              className="link mx-4"
              href="https://www.heliswap.io/community"
              target="_blank"
              rel="noreferrer"
            >
              Community
            </a>
            <a
              className="link mx-4"
              href="https://www.heliswap.io/academy"
              target="_blank"
              rel="noreferrer"
            >
              Academy
            </a>
            <a
              className="link ms-4"
              href="https://www.heliswap.io/news"
              target="_blank"
              rel="noreferrer"
            >
              News
            </a>
            <span className="separator-header d-none d-sm-block"></span>
          </div>
          <p className="text-small">
            HELI Price:{' '}
            <span className="text-numeric">
              ${formatStringETHtoPriceFormatted(heliPrice.toString(), 5)}
            </span>
          </p>
          <span className="separator-header d-none d-sm-block"></span>
          <p className="text-small mt-2 mt-sm-0 me-md-5">
            HBAR Price:{' '}
            <span className="text-numeric">
              ${formatStringETHtoPriceFormatted(hbarPrice.toString(), 5)}
            </span>
          </p>
        </div>

        {connected && userId ? (
          <>
            <div className="container-connected">
              <div className="text-center">
                <span className="text-small text-numeric">
                  {formatHBARStringToPrice(userBalance)}
                </span>{' '}
                HBAR
              </div>
              <div
                className="container-address mt-2 mt-sm-0"
                onClick={() => setShowUserAccountModal(true)}
              >
                <div className="text-small">{userId}</div>
                <img
                  className="img-profile ms-3"
                  src={`https://www.gravatar.com/avatar/${Md5.hashStr(userId)}/?d=identicon`}
                  alt=""
                />
              </div>
            </div>
          </>
        ) : (
          <Button
            onClick={() => handleConnectButtonClick()}
            type="primary"
            size="small"
            className="mx-2"
          >
            Connect wallet
          </Button>
        )}

        {showConnectModal ? (
          <Modal show={showConnectModal} closeModal={() => setShowConnectModal(false)}>
            <ConnectModalContent
              modalTitle="Connect wallet"
              closeModal={() => setShowConnectModal(false)}
              connectHashpackWallet={connectHashpackWallet}
              connectBladeWallet={connectBladeWallet}
              isLoading={isHashpackLoading}
              extensionFound={extensionFound}
            />
          </Modal>
        ) : null}

        {showUserAccountModal ? (
          <Modal show={showUserAccountModal} closeModal={() => setShowUserAccountModal(false)}>
            <UserAccountModalContent
              modalTitle="Account"
              closeModal={() => setShowUserAccountModal(false)}
              disconnectWallet={disconnectWallet}
              userId={userId}
            />
          </Modal>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
