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

export const formatBigNumberToStringPrecision = (
  numberToFormat: BigNumber,
  decimals: number = 18,
) => {
  const numberToFormatArr = numberToFormat.toString().split('.');
  numberToFormatArr[1] = numberToFormatArr[1].slice(0, decimals);

  return numberToFormatArr.join('.');
};

export const formatNumberToStringPrecision = (numberToFormat: number, decimals: number = 18) => {
  const numberToFormatArr = numberToFormat.toString().split('.');
  numberToFormatArr[1] = numberToFormatArr[1].slice(0, decimals);

  return numberToFormatArr.join('.');
};
