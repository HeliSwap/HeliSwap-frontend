import numeral from 'numeral';

export const formatStringToPrice = (stringToFormat: string) => {
  return `$${numeral(stringToFormat).format('0.0a')}`;
};
