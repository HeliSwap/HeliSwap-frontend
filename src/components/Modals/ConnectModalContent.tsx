import React, { useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GlobalContext } from '../../providers/Global';
import Loader from '../Loader';
import Icon from '../Icon';

interface IConnectModalContentProps {
  closeModal: () => void;
  connectWallet: () => void;
  modalTitle: string;
  isLoading: boolean;
  extensionFound: boolean;
}

const ConnectModalContent = ({
  closeModal,
  connectWallet,
  modalTitle,
  isLoading,
  extensionFound,
}: IConnectModalContentProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { hashconnectConnectorInstance } = connection;

  const handleConnectButtonClick = () => {
    if (extensionFound) {
      connectWallet();
    } else {
      const newWindow = window.open('https://www.hashpack.app/', '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;
    }
  };

  const handleCopyButtonClick = () => {
    console.log('hashconnectConnectorInstance', hashconnectConnectorInstance);
    navigator.clipboard.writeText(hashconnectConnectorInstance.pairingString);
  };

  return (
    <>
      <div className="modal-header">
        <h5 className="modal-title text-small text-bold" id="exampleModalLabel">
          {modalTitle}
        </h5>

        <button
          onClick={closeModal}
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        {isLoading ? (
          <>
            <Loader></Loader>
            <div className="text-center mt-4">
              <p className="text-subheader">Connecting...</p>
              <p className="text-micro text-gray mt-4">
                By connecting a wallet, you agree to HeliSwap Terms of Service and acknowledge that
                you have read and understand the Heliswap Protocol Disclaimer.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-small text-bold mt-4 mb-4">Connect With Hashpack Extension</p>
            <div onClick={handleConnectButtonClick} className="btn-connect-wallet">
              <div>
                <p className="text-main">Hashpack</p>
                {!extensionFound ? (
                  <p className="text-micro text-gray mt-2">Not installed</p>
                ) : null}
              </div>
              <span className="icon-hashpack"></span>
            </div>
            {hashconnectConnectorInstance && hashconnectConnectorInstance ? (
              <>
                <p className="text-small text-bold mt-4 mb-4">Connect With Code</p>
                <div className="d-flex align-items-center" onClick={() => handleCopyButtonClick()}>
                  <span className="link cursor-pointer">
                    <Icon name="copy" />
                    <span className="text-small ms-2">Copy Pairing Code</span>
                  </span>
                </div>
                <p className="text-small text-bold mt-4 mb-4">Connect With Code</p>
                <div className="d-flex justify-content-center">
                  <QRCodeSVG
                    size={200}
                    value={hashconnectConnectorInstance.pairingString}
                    includeMargin={true}
                  />
                </div>
              </>
            ) : null}
            <div></div>
            <p className="text-micro text-gray mt-4">
              By connecting a wallet, you agree to HeliSwap Terms of Service and acknowledge that
              you have read and understand the Heliswap Protocol Disclaimer.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ConnectModalContent;
