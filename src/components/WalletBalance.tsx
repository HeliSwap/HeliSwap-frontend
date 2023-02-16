import React from 'react';
import Tippy from '@tippyjs/react';
import Icon from './Icon';

interface IWalletBalance {
  insufficientBallance?: boolean;
  walletBalance?: string;
  onMaxButtonClick?: (maxValue: string) => void;
  label?: string;
}

const WalletBalance = ({
  walletBalance,
  onMaxButtonClick,
  insufficientBallance,
  label = 'Balance',
}: IWalletBalance) => {
  return walletBalance ? (
    <p className={`text-micro ${insufficientBallance ? 'text-danger' : 'text-gray'}`}>
      {insufficientBallance ? 'Insufficient ' : ''}
      {label}: <span className="text-numeric">{walletBalance}</span>
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
      <span className="text-gray text-micro">Balance not viewable</span>{' '}
      <Tippy content="Your ERC-20 balance cannot be shown as ERC-20 tokens are supported on HeliSwap, but not on HashPack.">
        <span className="ms-2">
          <Icon color="gray" name="hint" />
        </span>
      </Tippy>
    </p>
  );
};

export default WalletBalance;
