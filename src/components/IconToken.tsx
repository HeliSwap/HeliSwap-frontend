import React from 'react';
import HBAR from '../icons/tokens/HBAR.svg';
import ETH from '../icons/tokens/ETH.svg';
import unknown from '../icons/tokens/unknown.svg';

import HELI from '../icons/tokens/HELI.png';
import DOB from '../icons/tokens/DOB.png';
import EIGHT from '../icons/tokens/EIGHT.png';
import HEX from '../icons/tokens/HEX.webp';
import USDT from '../icons/tokens/USDT.png';
import WBTC from '../icons/tokens/WBTC.png';

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
  HELI: HELI,
  DOB: DOB,
  EIGHT: EIGHT,
  HEX: HEX,
  USDT: USDT,
  WBTC: WBTC,
  WETH: ETH,
  WHBAR: HBAR,
};

const defaultIconToken = unknown;

const IconToken = ({ symbol, className = '' }: IIconTokenProps) => {
  const iconFound = tokenMapping[symbol];
  return (
    <img
      className={`icon-token ${className}`}
      src={iconFound ? tokenMapping[symbol] : defaultIconToken}
      alt="token-icon"
    />
  );
};

export default IconToken;
