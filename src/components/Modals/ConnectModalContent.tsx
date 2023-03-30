import React, { useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GlobalContext } from '../../providers/Global';
import Loader from '../Loader';
// import Icon from '../Icon';

interface IConnectModalContentProps {
  closeModal: () => void;
  connectHashpackWallet: () => void;
  connectBladeWallet: () => void;
  modalTitle: string;
  isLoading: boolean;
  extensionFound: boolean;
}

const ConnectModalContent = ({
  closeModal,
  connectHashpackWallet,
  connectBladeWallet,
  modalTitle,
  isLoading,
  extensionFound,
}: IConnectModalContentProps) => {
  const contextValue = useContext(GlobalContext);
  const { connection } = contextValue;
  const { connectorInstance } = connection;

  const handleHashpackConnectButtonClick = () => {
    if (extensionFound) {
      connectHashpackWallet();
    } else {
      const newWindow = window.open('https://www.hashpack.app/', '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;
    }
  };

  const handleBladeConnectButtonClick = () => {
    // if (extensionFound) {
    connectBladeWallet();
    // } else {
    //   const newWindow = window.open('https://www.bladewallet.io/', '_blank', 'noopener,noreferrer');
    //   if (newWindow) newWindow.opener = null;
    // }
  };

  // const handleCopyButtonClick = () => {
  //   navigator.clipboard.writeText(connectorInstance.pairingString);
  // };

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
            <p className="text-small text-bold mt-4 mb-4">Connect with:</p>
            <div onClick={handleHashpackConnectButtonClick} className="btn-connect-wallet">
              <div>
                <p className="text-main">Hashpack</p>
                {!extensionFound ? (
                  <p className="text-micro text-gray mt-2">Not installed</p>
                ) : null}
              </div>
              <span className="icon-hashpack"></span>
            </div>

            <div onClick={handleBladeConnectButtonClick} className="btn-connect-wallet mt-3">
              <div>
                <p className="text-main">Blade wallet</p>
              </div>
              <span className="icon-blade"></span>
            </div>

            {connectorInstance && connectorInstance ? (
              <>
                {/* <p className="text-small text-bold mt-4 mb-4">Connect With Code</p>
                <div className="d-flex align-items-center" onClick={() => handleCopyButtonClick()}>
                  <span className="link cursor-pointer">
                    <Icon name="copy" />
                    <span className="text-small ms-2">Copy Pairing Code</span>
                  </span>
                </div> */}
                <p className="text-small text-bold mt-4 mb-4">Connect With Code</p>
                <div className="d-flex justify-content-center">
                  <QRCodeSVG size={200} value={''} includeMargin={true} />
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
