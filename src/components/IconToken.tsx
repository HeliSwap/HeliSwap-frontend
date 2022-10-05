import React from 'react';
import HBAR from '../icons/tokens/HBAR.png';
// import WHBAR from '../icons/tokens/WHBAR.png';
import ETH from '../icons/tokens/ETH.svg';
import unknown from '../icons/tokens/unknown.svg';
import LP from '../icons/tokens/LP.svg';

import HELI from '../icons/tokens/HELI.png';
import DOB from '../icons/tokens/DOB.png';
import USDC from '../icons/tokens/USDC.png';
import EIGHT from '../icons/tokens/EIGHT.png';
import HEX from '../icons/tokens/HEX.webp';
import USDT from '../icons/tokens/USDT.png';
import WBTC from '../icons/tokens/WBTC.png';
import OM from '../icons/tokens/OM.png';
import DAI from '../icons/tokens/DAI.png';
import WMATIC from '../icons/tokens/WMATIC.webp';
import HBARX from '../icons/tokens/HBARX.svg';
import HST from '../icons/tokens/HST.png';
import CLXY from '../icons/tokens/CLXY.png';
import DOVU from '../icons/tokens/DOVU.png';
import CREAM from '../icons/tokens/CREAM.svg';

interface IIconTokenProps {
  symbol: string;
  className?: string;
  size?: 'large' | 'default';
}

interface ITokenMapping {
  [key: string]: string;
}

const tokenMapping: ITokenMapping = {
  HBAR: HBAR,
  ETH: ETH,
  WETH: ETH,
  'WETH[hts]': ETH,
  USDC: USDC,
  'USDC[hts]': USDC,
  HELI: HELI,
  DOB: DOB,
  EIGHT: EIGHT,
  HEX: HEX,
  USDT: USDT,
  'USDT[hts]': USDT,
  WBTC: WBTC,
  'WBTC[hts]': WBTC,
  WHBAR: HBAR,
  OM: OM,
  DAI: DAI,
  'DAI[hts]': DAI,
  WMATIC: WMATIC,
  'WMATIC[hts]': WMATIC,
  HBARX: HBARX,
  HST: HST,
  CLXY: CLXY,
  'DOV[hts]': DOVU,
  CREAM: CREAM,
  LP: LP,
};

const defaultIconToken = unknown;

const IconToken = ({ symbol, className = '', size = 'default' }: IIconTokenProps) => {
  const iconFound = tokenMapping[symbol];
  const sizeMapping = {
    large: 'is-large',
    default: '',
  };

  return (
    <img
      className={`icon-token ${className} ${sizeMapping[size]}`}
      src={iconFound ? tokenMapping[symbol] : defaultIconToken}
      alt="token-icon"
    />
  );
};

export default IconToken;
