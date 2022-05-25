import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import { hethers } from '@hashgraph/hethers';

export const formatStringToPrice = (stringToFormat: string) => {
  return `$${numeral(stringToFormat).format('0.0a')}`;
};

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
  const numberToFormatBNPowedStr = numberToFormatBNPowed.toString();
  const numberToFormatBNHethersPowed = hethers.BigNumber.from(numberToFormatBNPowedStr);

  return numberToFormatBNHethersPowed;
};

export const formatStringWeiToStringEther = (numberToFormat: string, decimals: number = 18) => {
  const numberToFormatBN = new BigNumber(numberToFormat);
  const tenPowDec = new BigNumber(10).pow(decimals);

  return numberToFormatBN.div(tenPowDec).toString();
};

export const formatBigNumberToStringPrecision = (
  numberToFormat: BigNumber,
  decimals: number = 18,
) => {
  const numberToFormatArr = numberToFormat.toString().split('.');
  numberToFormatArr[1] = numberToFormatArr[1].slice(0, decimals);

  return numberToFormatArr.join('.');
};
