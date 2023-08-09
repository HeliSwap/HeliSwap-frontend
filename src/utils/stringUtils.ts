export const getParamsFromSignature = (str: string): string => {
  let startIndex = str.indexOf('(');
  let endIndex = str.indexOf(')');
  return str.substring(startIndex + 1, endIndex);
};

export const commaSeparatedStringToArray = (str: string): string[] => {
  let array = str.split(',');
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== '') {
      newArray.push(array[i]);
    }
  }
  return newArray;
};

export const getFunctionNameFromSignature = (str: string) => {
  return str.split('(')[0];
};
