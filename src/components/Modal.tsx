import React from 'react';

interface IModalProps {
  show?: boolean;
  closeModal: () => void;
  children: JSX.Element | JSX.Element[] | string;
  modalTitle?: string;
}

const Modal = ({ show = true, closeModal, children, modalTitle }: IModalProps) => {
  return (
    <>
      <div
        className="modal fade show"
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        style={{ display: show ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              {modalTitle ? (
                <h5 className="modal-title" id="exampleModalLabel">
                  {modalTitle}
                </h5>
              ) : null}

              <button
                onClick={() => closeModal()}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div style={{ display: show ? 'block' : 'none' }} className="modal-backdrop fade show"></div>
    </>
  );
};

export default Modal;
