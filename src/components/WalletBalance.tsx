import React from 'react';
import Icon from './Icon';

interface IWalletBalance {
  walletBalance?: string;
  onMaxButtonClick?: (maxValue: string) => void;
}

const WalletBalance = ({ walletBalance, onMaxButtonClick }: IWalletBalance) => {
  return walletBalance ? (
    <p className="text-gray text-small">
      Balance: <span className="text-numeric">{walletBalance}</span>
      {parseFloat(walletBalance) > 0 && onMaxButtonClick ? (
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
      <Icon color="gray" name="hint" />
    </p>
  );
};

export default WalletBalance;
