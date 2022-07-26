import React, { useContext, useEffect, useState } from 'react';
import { hethers } from '@hashgraph/hethers';
import { GlobalContext } from '../providers/Global';

import Button from './Button';
import Modal from './Modal';
import ConnectModalContent from './Modals/ConnectModalContent';
import { formatStringETHtoPriceFormatted } from '../utils/numberUtils';

const Header = () => {
  const contextValue = useContext(GlobalContext);
  const {
    connected,
    connectWallet,
    disconnectWallet,
    extensionFound,
    isHashpackLoading,
    userId,
    showConnectModal,
    setShowConnectModal,
  } = contextValue.connection;

  const [userBalance, setUserBalance] = useState('0.0');

  const handleConnectButtonClick = () => {
    setShowConnectModal(true);
  };

  useEffect(() => {
    const getUserTokensData = async () => {
      if (userId) {
        const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
        const userBalanceBN = await provider.getBalance(userId);
        const tokenBalance = hethers.utils.formatHbar(userBalanceBN);

        setUserBalance(formatStringETHtoPriceFormatted(tokenBalance));
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
          {connected ? (
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
            <Button
              onClick={() => handleConnectButtonClick()}
              type="primary"
              size="small"
              className="mx-2"
            >
              Connect wallet
            </Button>
          )}
          <Modal show={showConnectModal} closeModal={() => setShowConnectModal(false)}>
            <ConnectModalContent
              modalTitle="Connect wallet"
              closeModal={() => setShowConnectModal(false)}
              connectWallet={connectWallet}
              isLoading={isHashpackLoading}
              extensionFound={extensionFound}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Header;
