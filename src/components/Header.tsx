import React, { useContext, useEffect, useState } from 'react';
import { hethers } from '@hashgraph/hethers';
import { GlobalContext } from '../providers/Global';
import { Md5 } from 'ts-md5/dist/md5';

import Button from './Button';
import Modal from './Modal';
import ConnectModalContent from './Modals/ConnectModalContent';
import { formatStringETHtoPriceFormatted } from '../utils/numberUtils';
import UserAccountModalContent from './Modals/UserAccountModalContent';

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
  const [showUserAccountModal, setShowUserAccountModal] = useState(false);

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
          {connected && userId ? (
            <>
              <div className="container-connected">
                <div className="text-small">{userBalance} HBAR</div>
                <div className="container-address" onClick={() => setShowUserAccountModal(true)}>
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
          <Modal show={showConnectModal} closeModal={() => setShowConnectModal(false)}>
            <ConnectModalContent
              modalTitle="Connect wallet"
              closeModal={() => setShowConnectModal(false)}
              connectWallet={connectWallet}
              isLoading={isHashpackLoading}
              extensionFound={extensionFound}
            />
          </Modal>
          <Modal show={showUserAccountModal} closeModal={() => setShowUserAccountModal(false)}>
            <UserAccountModalContent
              modalTitle="Account"
              closeModal={() => setShowUserAccountModal(false)}
              disconnectWallet={disconnectWallet}
              userId={userId}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Header;
