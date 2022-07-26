import React from 'react';
import Loader from '../Loader';

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
  const handleConnectButtonClick = () => {
    if (extensionFound) {
      connectWallet();
    } else {
      const newWindow = window.open('https://www.hashpack.app/', '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;
    }
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
            <div onClick={handleConnectButtonClick} className="btn-connect-wallet">
              <div>
                <p className="text-main">Hashpack</p>
                {!extensionFound ? (
                  <p className="text-micro text-gray mt-2">Not installed</p>
                ) : null}
              </div>
              <span className="icon-hashpack"></span>
            </div>
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
