import React, { useEffect, useState } from 'react';

interface IModalProps {
  closeModal: () => void;
  saveChanges: (setDefaultSlippage: boolean, slippage: number, expiration: number) => void;
  modalTitle?: string;
  slippage: number;
  expiration: number;
  defaultSlippageValue: number;
}

const TransactionSettingsModalContent = ({
  closeModal,
  modalTitle,
  slippage,
  expiration,
  saveChanges,
  defaultSlippageValue,
}: IModalProps) => {
  const [slippageTollerance, setSlippageTollerance] = useState(slippage);
  const [deadline, setDeadline] = useState(expiration);
  const [defaultSlippage, setDefaultSlippage] = useState(false);

  const handleSlippageToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSlippageTollerance(parseFloat(value));
  };

  const handleSetDefaultSlippage = () => {
    setDefaultSlippage(true);
    setSlippageTollerance(defaultSlippageValue);
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDeadline(parseFloat(value));
  };

  const handleSaveChanges = () => {
    saveChanges(defaultSlippage, slippageTollerance, deadline);
    closeModal();
  };

  return (
    <>
      <div className="modal-header">
        {modalTitle ? (
          <h5 className="modal-title" id="exampleModalLabel">
            {modalTitle}
          </h5>
        ) : null}

        <button
          onClick={closeModal}
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div>
          <button
            onClick={handleSetDefaultSlippage}
            type="button"
            className="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Auto
          </button>
          <span>Slippage tolerance</span>
          <input
            type={'number'}
            value={slippageTollerance}
            onChange={handleSlippageToleranceChange}
          ></input>
          <span>%</span>
        </div>
        <div>
          <span>Transaction deadline</span>
          <input type={'number'} defaultValue={deadline} onChange={handleExpirationChange}></input>
        </div>
      </div>
      <div className="modal-footer">
        <button
          onClick={closeModal}
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
          Save changes
        </button>
      </div>
    </>
  );
};

export default TransactionSettingsModalContent;
