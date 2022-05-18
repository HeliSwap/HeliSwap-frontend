import numeral from 'numeral';
import BigNumber from 'bignumber.js';

export const formatStringToPrice = (stringToFormat: string) => {
  return `$${numeral(stringToFormat).format('0.0a')}`;
};

export const formatNumberToBigNumber = (numberToFormat: number, decimals: number = 18) => {
  return new BigNumber(numberToFormat * Math.pow(10, decimals));
};
