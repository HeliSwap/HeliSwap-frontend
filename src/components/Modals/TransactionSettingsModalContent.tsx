import React, { useState } from 'react';
import Button from '../Button';

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
          <h5 className="modal-title text-main text-bold" id="exampleModalLabel">
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
          <p className="text-small">Slippage</p>
          <div className="d-flex align-items-center mt-3">
            <input
              type={'number'}
              value={slippageTollerance}
              onChange={handleSlippageToleranceChange}
              className="form-control form-control-sm text-numeric me-3"
            />
            <span className="me-2">%</span>
            <Button
              onClick={handleSetDefaultSlippage}
              type="primary"
              outline={true}
              data-bs-dismiss="modal"
              size="small"
            >
              Auto
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-small">Transaction deadline</p>
          <div className="d-flex align-items-center mt-3">
            <input
              className="form-control text-numeric form-control-sm"
              type={'number'}
              defaultValue={deadline}
              onChange={handleExpirationChange}
            />
            <span className="ms-3">minutes</span>
          </div>
        </div>
        <div className="d-grid mt-5">
          <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
            Confirm settings
          </button>
        </div>
      </div>
    </>
  );
};

export default TransactionSettingsModalContent;
