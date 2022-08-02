import React, { useEffect, useCallback } from 'react';

interface IModalProps {
  show?: boolean;
  closeModal?: () => void;
  children: JSX.Element | JSX.Element[] | string;
}

const Modal = ({ show = true, children, closeModal }: IModalProps) => {
  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === 'Escape' && closeModal) {
        closeModal();
      }
    },
    [closeModal],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
