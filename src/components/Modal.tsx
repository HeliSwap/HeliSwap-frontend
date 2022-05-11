import React from 'react';

interface IModalProps {
  show?: boolean;
  children: JSX.Element | JSX.Element[] | string;
}

const Modal = ({ show = true, children }: IModalProps) => {
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
          <div className="modal-content">{children}</div>
        </div>
      </div>
      <div style={{ display: show ? 'block' : 'none' }} className="modal-backdrop fade show"></div>
    </>
  );
};

export default Modal;
