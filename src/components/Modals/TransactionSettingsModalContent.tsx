import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import { MAX_EXPIRATION_VALUE, MAX_SLIPPAGE_VALUE } from '../../constants';
import Button from '../Button';
import Icon from '../Icon';

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
    const parsedValue = parseFloat(value);

    const isValid = !isNaN(parsedValue) && parsedValue <= MAX_SLIPPAGE_VALUE;

    setSlippageTollerance(isValid ? parsedValue : defaultSlippageValue);
  };

  const handleSetDefaultSlippage = () => {
    setDefaultSlippage(true);
    setSlippageTollerance(defaultSlippageValue);
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const parsedValue = parseFloat(value);

    const isValid = !isNaN(parsedValue) && parsedValue <= MAX_EXPIRATION_VALUE;

    setDeadline(isValid ? parsedValue : expiration);
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
          <p className="d-flex align-items-center">
            <span className="text-small">Slippage</span>
            <Tippy content="If the prices of your specified tokens change adversely, your transaction will revert. Slippage allows you to specify your price change tolerance.">
              <span className="ms-2">
                <Icon color="gray" name="hint" />
              </span>
            </Tippy>
          </p>
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
          <p className="d-flex align-items-center">
            <span className="text-small">Transaction deadline</span>
            <Tippy content="If the transaction takes more time than your specified deadline, it will be automatically reverted.">
              <span className="ms-2">
                <Icon color="gray" name="hint" />
              </span>
            </Tippy>
          </p>
          <div className="d-flex align-items-center mt-3">
            <input
              className="form-control text-numeric form-control-sm"
              type={'number'}
              value={deadline}
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
