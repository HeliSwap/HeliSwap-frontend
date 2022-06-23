import React from 'react';
import HBAR from '../icons/tokens/HBAR.svg';
import ETH from '../icons/tokens/ETH.svg';

import HELI from '../icons/tokens/HELI.png';
import DOB from '../icons/tokens/DOB.png';
import EIGHT from '../icons/tokens/EIGHT.png';
import HEX from '../icons/tokens/HEX.webp';
import USDT from '../icons/tokens/USDT.png';
import WBTC from '../icons/tokens/WBTC.png';
import WHBAR from '../icons/tokens/WHBAR.png';

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
  WHBAR: WHBAR,
};

const IconToken = ({ symbol, className }: IIconTokenProps) => {
  return <img className={`icon-token ${className}`} src={tokenMapping[symbol]} alt="token-icon" />;
};

export default IconToken;
