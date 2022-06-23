import React from 'react';
import Icon from './Icon';

interface IWalletBalance {
  walletBalance?: string;
}

const WalletBalance = ({ walletBalance }: IWalletBalance) => {
  return walletBalance ? (
    <p className="text-gray text-small">
      Wallet balance: <span className="text-numeric">{walletBalance}</span>
    </p>
  ) : (
    <p className="d-flex align-items-center">
      <span className="text-gray text-micro me-3">Balance not viewable</span>{' '}
      <Icon color="gray" name="hint" />
    </p>
  );
};

export default WalletBalance;
