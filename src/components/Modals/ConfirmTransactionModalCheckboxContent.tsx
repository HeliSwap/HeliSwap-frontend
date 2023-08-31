import { useState } from 'react';
import Button from '../Button';

interface IConfirmTransactionModalCheckboxContentProps {
  closeModal: () => void;
  confirmTansaction: () => void;
  modalTitle: string;
  children: any;
  confirmButtonLabel: string;
  isLoading: boolean;
  checkboxText?: string;
}

const ConfirmTransactionModalCheckboxContent = ({
  closeModal,
  confirmTansaction,
  modalTitle,
  children,
  confirmButtonLabel,
  isLoading,
  checkboxText,
}: IConfirmTransactionModalCheckboxContentProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirmButtonClick = () => {
    confirmTansaction();
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
        {children}

        {!isLoading ? (
          <>
            {checkboxText && checkboxText?.length > 0 ? (
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  id="flexSwitchCheckChecked"
                  checked={isChecked}
                  onChange={() => setIsChecked(prev => !prev)}
                />
                <label className="text-small cursor-pointer" htmlFor="flexSwitchCheckChecked">
                  {checkboxText}
                </label>
              </div>
            ) : null}
            <div className="d-grid mt-4">
              <Button
                disabled={
                  checkboxText && checkboxText?.length > 0 ? (!isChecked ? true : false) : false
                }
                loading={isLoading}
                onClick={handleConfirmButtonClick}
              >
                {confirmButtonLabel}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default ConfirmTransactionModalCheckboxContent;
