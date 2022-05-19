import numeral from 'numeral';
import BigNumber from 'bignumber.js';

export const formatStringToPrice = (stringToFormat: string) => {
  return `$${numeral(stringToFormat).format('0.0a')}`;
};

export const formatStringToBigNumberWei = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);
  const tenPowDec = new BigNumber(10).pow(decimals);

  return numberToFormatBN.times(tenPowDec);
};

export const formatBigNumberToNumber = (numberToFormat: number, decimals: number = 18) => {
  return numberToFormat / Math.pow(10, decimals);
};
