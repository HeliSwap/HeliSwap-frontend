import React from 'react';
import Loader from './Loader';

interface IConfirmationProps {
  confirmationText: string;
}

const Confirmation = ({ confirmationText }: IConfirmationProps) => {
  return (
    <>
      <Loader></Loader>
      <div className="text-center mt-4">
        <p className="text-subheader">Waiting for confirmation</p>
        <p className="text-small mt-3">{confirmationText}</p>
        <p className="text-micro text-gray mt-2">Confirm this transaction in your wallet</p>
      </div>
    </>
  );
};

export default Confirmation;
