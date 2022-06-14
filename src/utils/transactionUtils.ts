export const INITIAL_PROVIDE_SLIPPAGE_TOLERANCE = 0.5;
export const INITIAL_SWAP_SLIPPAGE_TOLERANCE = 0.1;
export const INITIAL_REMOVE_SLIPPAGE_TOLERANCE = 5;
export const INITIAL_SLIPPAGE_TOLERANCE = 0.1;
export const INITIAL_EXPIRATION_TIME = 60;

export const getTransactionSettings = () => {
  const slippage = localStorage.getItem('transactionSlippage');
  const expiration = localStorage.getItem('transactionExpiration');

  return {
    provideSlippage: slippage ? parseFloat(slippage) : INITIAL_PROVIDE_SLIPPAGE_TOLERANCE,
    swapSlippage: slippage ? parseFloat(slippage) : INITIAL_SWAP_SLIPPAGE_TOLERANCE,
    removeSlippage: slippage ? parseFloat(slippage) : INITIAL_REMOVE_SLIPPAGE_TOLERANCE,
    transactionExpiration: expiration ? parseInt(expiration) : INITIAL_EXPIRATION_TIME,
  };
};

export const setSlippageTolerance = (slippage: number, setDefault: boolean) => {
  setDefault
    ? localStorage.removeItem('transactionSlippage')
    : localStorage.setItem('transactionSlippage', slippage?.toString());
};

export const setTransactionDeadline = (expiration: number) => {
  localStorage.setItem('transactionExpiration', expiration?.toString());
};

export const handleSaveTransactionSettings = (
  setDefaultSlippage: boolean,
  slippage: number,
  expiration: number,
) => {
  setSlippageTolerance(slippage, setDefaultSlippage);
  setTransactionDeadline(expiration);
};
