import React from 'react';
import Icon from './Icon';

interface IWalletBalance {
  walletBalance?: string;
  onMaxButtonClick?: (maxValue: string) => void;
}

const WalletBalance = ({ walletBalance, onMaxButtonClick }: IWalletBalance) => {
  return walletBalance ? (
    <p className="text-gray text-small">
      Wallet balance: <span className="text-numeric">{walletBalance}</span>
      {parseFloat(walletBalance) > 0 && onMaxButtonClick ? (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onMaxButtonClick(walletBalance)}
        >
          Max
        </button>
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
