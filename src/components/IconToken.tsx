import React from 'react';
import HBAR from '../icons/tokens/HBAR.svg';
import ETH from '../icons/tokens/ETH.svg';

interface IIconTokenProps {
  symbol: string;
  className?: string;
}

interface ITokenMapping {
  [key: string]: string;
}

const tokenMapping: ITokenMapping = {
  HBAR: HBAR,
  ETH: ETH,
};

const IconToken = ({ symbol, className }: IIconTokenProps) => {
  return <img className={`icon-token ${className}`} src={tokenMapping[symbol]} alt="token-icon" />;
};

export default IconToken;
