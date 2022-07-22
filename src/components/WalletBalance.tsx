import React from 'react';
// import Icon from './Icon';

interface IWalletBalance {
  insufficientBallance?: boolean;
  walletBalance?: string;
  onMaxButtonClick?: (maxValue: string) => void;
}

const WalletBalance = ({
  walletBalance,
  onMaxButtonClick,
  insufficientBallance,
}: IWalletBalance) => {
  return walletBalance ? (
    <p className={`text-micro ${insufficientBallance ? 'text-danger' : 'text-gray'}`}>
      {insufficientBallance ? 'Insufficient ' : ''}Balance:{' '}
      <span className="text-numeric">{walletBalance}</span>
      {parseFloat(walletBalance) > 0 && onMaxButtonClick && !insufficientBallance ? (
        <span
          className="link-primary text-bold text-uppercase text-micro ms-2"
          onClick={() => onMaxButtonClick(walletBalance)}
        >
          Max
        </span>
      ) : null}
    </p>
  ) : (
    <p className="d-flex align-items-center">
      <span className="text-gray text-micro me-3">Balance not viewable</span>{' '}
      {/* <Icon color="gray" name="hint" /> */}
    </p>
  );
};

export default WalletBalance;
