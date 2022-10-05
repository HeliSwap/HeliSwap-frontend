import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import { hethers } from '@hashgraph/hethers';

export const formatStringToPrice = (stringToFormat: string, floor: boolean = false) => {
  return floor && Number(stringToFormat) < 1000
    ? `$${numeral(stringToFormat).format('0.00a', Math.floor)}`
    : `$${numeral(stringToFormat).format('0.00a')}`;
};

export const formatStringToPercentage = (stringToFormat: string) => {
  return `${numeral(stringToFormat).format('0.0a')}%`;
};

export const formatHBARStringToPrice = (stringToFormat: string) => {
  return `${numeral(stringToFormat).format('0,0.0000')}`;
};

export const formatNumberToBigNumber = (numberToFormat: number) => {
  const numberToFormatBN = new BigNumber(numberToFormat);

  return numberToFormatBN;
};

export const formatStringToBigNumber = (numberToFormat: string) => {
  const numberToFormatBN = new BigNumber(numberToFormat);

  return numberToFormatBN;
};

// Used to format values (string | ETH) into BN / wei (used for native contract calls)
export const formatStringToBigNumberWei = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);

  const tenPowDec = new BigNumber(10).pow(decimals);

  return numberToFormatBN.times(tenPowDec);
};

// Used to format input values (string | ETH) into Hethers BN / wei
export const formatStringToBigNumberEthersWei = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);

  const tenPowDec = new BigNumber(10).pow(decimals);

  const numberToFormatBNPowed = numberToFormatBN.times(tenPowDec);
  const numberToFormatBNPowedStr = numberToFormatBNPowed.toFixed();
  const numberToFormatBNHethersPowed = hethers.BigNumber.from(numberToFormatBNPowedStr);

  return numberToFormatBNHethersPowed;
};

// Used to format values (string | ETH) into String / wei
export const formatStringToStringWei = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);
  const tenPowDec = new BigNumber(10).pow(decimals);

  const numberToFormatBNPowed = numberToFormatBN.times(tenPowDec);
  const numberToFormatBNPowedStr = numberToFormatBNPowed.toFixed();

  return numberToFormatBNPowedStr;
};

// Used to convert values (string | wei) into string / ether
export const formatStringWeiToStringEther = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);
  const tenPowDec = new BigNumber(10).pow(decimals);

  const numberToFormatStr = numberToFormatBN.div(tenPowDec).toFixed();

  return numberToFormatStr;
};

export const formatStringETHtoPriceFormatted = (
  stringToFormat: string,
  symbolsAfterDecimals = 4,
) => {
  const decPosition = stringToFormat.indexOf('.');
  const splitted = stringToFormat.split('.');

  if (splitted.length > 1) {
    const lengthAfterDecimals = splitted[1].length;

    // If the number contains zeros in the decimals, leaves the zeros and shows to more symbols, despite the how many symbols are indicated in the second argument
    let zerosBeforeSymbol = 0;

    for (const num of splitted[1]) {
      if (num === '0') {
        zerosBeforeSymbol++;
      } else {
        break;
      }
    }

    const lenghtMoreThanMaxDecimals = lengthAfterDecimals > symbolsAfterDecimals;
    const zerosMoreThanMaxDecimals = zerosBeforeSymbol >= symbolsAfterDecimals;

    const logicForZeros = zerosMoreThanMaxDecimals
      ? stringToFormat.slice(0, decPosition + zerosBeforeSymbol + 3)
      : stringToFormat.slice(0, decPosition + symbolsAfterDecimals + 1);

    const formatted = lenghtMoreThanMaxDecimals ? logicForZeros : stringToFormat;

    // Remove leading zeros
    let zerosToRemove = 0;
    for (let i = formatted.length - 1; i > 0; i--) {
      if (formatted[i] === '0') {
        zerosToRemove++;
      } else {
        break;
      }
    }

    const withoutLeadingZeros = zerosToRemove > 0 ? formatted.slice(0, -zerosToRemove) : formatted;

    return withoutLeadingZeros;
  } else {
    return stringToFormat;
  }
};

// Used to calculate token min/max amount including slippage
export const getAmountWithSlippage = (
  amount: string,
  amountDecimals: number,
  slippagePercentage: number,
  isMinAmount: boolean,
  isNative: boolean = false,
) => {
  const amountWei = formatStringToBigNumberWei(amount, amountDecimals);
  const slippage = slippagePercentage / 100;
  let amountWithSlippage;

  if (isMinAmount) {
    amountWithSlippage = amountWei.minus(amountWei.times(slippage));
  } else {
    amountWithSlippage = amountWei.plus(amountWei.times(slippage));
  }

  return isNative ? amountWithSlippage.decimalPlaces(8) : amountWithSlippage.decimalPlaces(0, 1);
};

// Used to calculate the deadline of certain transactions
export const getExpirationTime = (minutes: number) => {
  return Math.floor(Date.now() / 1000) + 60 * minutes;
};

export const stripStringToFixedDecimals = (decimalString: string, decimals: number) => {
  const decPosition = decimalString.indexOf('.');
  return decPosition !== -1 ? decimalString.slice(0, decPosition + decimals + 1) : decimalString;
};

export const randomIntFromInterval = (min: number, max: number): number => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};
