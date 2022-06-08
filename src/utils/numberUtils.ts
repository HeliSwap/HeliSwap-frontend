import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import { hethers } from '@hashgraph/hethers';

export const formatStringToPrice = (stringToFormat: string) => {
  return `$${numeral(stringToFormat).format('0.0a')}`;
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

  return numberToFormatBN.div(tenPowDec).toString();
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
