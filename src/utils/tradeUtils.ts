import { IPoolData } from '../interfaces/tokens';
import { formatStringToBigNumberEthersWei, formatStringToBigNumberWei } from './numberUtils';
import { hethers, BigNumber } from '@hashgraph/hethers';
import BN from 'bignumber.js';

interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number;
  // the maximum number of hops a trade should contain
  maxHops?: number;
}

interface Trade {
  pools: IPoolData[];
  currencyIn: string;
  currencyOut: string;
  amountIn: string;
  amountOut: string;
  path: string[];
  midPricesArr: string[];
}

export const getPossibleTradesExactIn = (
  pools: IPoolData[],
  amountIn: string,
  currencyIn: string,
  currencyOut: string,
  applyFees: boolean,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  currentPools: IPoolData[] = [],
  nextAmountIn: string = amountIn,
  nextCurrencyIn: string = currencyIn,
  possibleTrades: Trade[] = [],
  midPrices: string[] = [],
) => {
  for (let i = 0; i < pools.length; i++) {
    const currentPool = pools[i];
    const { token0, token1 } = currentPool;

    if (!(token0 === nextCurrencyIn) && !(token1 === nextCurrencyIn)) continue;

    const tokenInFirstAtPool = token0 === nextCurrencyIn;
    const amountOut = getAmountOut(nextAmountIn, tokenInFirstAtPool, currentPool, applyFees);
    const otherTokenInPool = tokenInFirstAtPool ? token1 : token0;

    const numerator0BN = new BN(currentPool.token0Amount);
    const numerator1BN = new BN(currentPool.token1Amount);
    const denominator0BN = new BN(10).pow(new BN(currentPool.token0Decimals));
    const denominator1BN = new BN(10).pow(new BN(currentPool.token1Decimals));

    let quot0BN = numerator0BN.div(denominator0BN);
    let quot1BN = numerator1BN.div(denominator1BN);

    const tokenInQuot = tokenInFirstAtPool ? quot0BN : quot1BN;
    const tokenOutQuot = tokenInFirstAtPool ? quot1BN : quot0BN;

    const currentMidPrice = tokenOutQuot.div(tokenInQuot).toString();

    if (otherTokenInPool === currencyOut) {
      possibleTrades.push({
        pools: [...currentPools, currentPool],
        currencyIn,
        currencyOut,
        amountIn,
        amountOut: amountOut,
        path: getPath([...currentPools, currentPool], currencyIn),
        midPricesArr: [...midPrices, currentMidPrice],
      });
    } else if (maxHops > 1 && pools.length > 1) {
      const poolsExcludingThisPool = pools.slice(0, i).concat(pools.slice(i + 1, pools.length));

      getPossibleTradesExactIn(
        poolsExcludingThisPool,
        amountIn,
        currencyIn,
        currencyOut,
        applyFees,
        {
          maxNumResults,
          maxHops: maxHops - 1,
        },
        [...currentPools, currentPool],
        amountOut,
        otherTokenInPool,
        possibleTrades,
        [...midPrices, currentMidPrice],
      );
    }
  }
  return possibleTrades;
};

export const getPossibleTradesExactOut = (
  pools: IPoolData[],
  amountOut: string,
  currencyIn: string,
  currencyOut: string,
  applyFees: boolean,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  currentPools: IPoolData[] = [],
  nextAmountOut: string = amountOut,
  nextCurrencyOut: string = currencyOut,
  possibleTrades: Trade[] = [],
  midPrices: string[] = [],
) => {
  for (let i = 0; i < pools.length; i++) {
    const currentPool = pools[i];
    const { token0, token1, token0Decimals, token1Decimals, token0Amount, token1Amount } =
      currentPool;

    if (!(token0 === nextCurrencyOut) && !(token1 === nextCurrencyOut)) continue;

    const tokenOutFirstAtPool = token0 === nextCurrencyOut;
    const nextTokenOutDecimals = tokenOutFirstAtPool ? token0Decimals : token1Decimals;
    const nextAmountOutBN = formatStringToBigNumberWei(nextAmountOut, nextTokenOutDecimals);

    //Filter out the pools which don't have enough amount
    if (
      (tokenOutFirstAtPool && nextAmountOutBN.gte(new BN(token0Amount))) ||
      (!tokenOutFirstAtPool && nextAmountOutBN.gte(new BN(token1Amount)))
    )
      continue;

    const amountIn = getAmountIn(nextAmountOut, tokenOutFirstAtPool, currentPool, applyFees);
    const otherTokenInPool = tokenOutFirstAtPool ? token1 : token0;

    const numerator0BN = new BN(currentPool.token0Amount);
    const numerator1BN = new BN(currentPool.token1Amount);
    const denominator0BN = new BN(10).pow(new BN(currentPool.token0Decimals));
    const denominator1BN = new BN(10).pow(new BN(currentPool.token1Decimals));

    let quot0BN = numerator0BN.div(denominator0BN);
    let quot1BN = numerator1BN.div(denominator1BN);

    const tokenInQuot = tokenOutFirstAtPool ? quot0BN : quot1BN;
    const tokenOutQuot = tokenOutFirstAtPool ? quot1BN : quot0BN;

    const currentMidPrice = tokenInQuot.div(tokenOutQuot).toString();

    if (otherTokenInPool === currencyIn) {
      possibleTrades.push({
        pools: [currentPool, ...currentPools],
        currencyIn,
        currencyOut,
        amountIn,
        amountOut,
        path: getPath([currentPool, ...currentPools], currencyIn),
        midPricesArr: [...midPrices, currentMidPrice],
      });
    } else if (maxHops > 1 && pools.length > 1) {
      const poolsExcludingThisPool = pools.slice(0, i).concat(pools.slice(i + 1, pools.length));

      getPossibleTradesExactOut(
        poolsExcludingThisPool,
        amountOut,
        currencyIn,
        currencyOut,
        applyFees,
        {
          maxNumResults,
          maxHops: maxHops - 1,
        },
        [currentPool, ...currentPools],
        amountIn,
        otherTokenInPool,
        possibleTrades,
        [...midPrices, currentMidPrice],
      );
    }
  }

  return possibleTrades;
};

const getPath = (poolsArray: IPoolData[], startingCurreny: string) => {
  const path = [startingCurreny];

  for (let index = 0; index < poolsArray.length; index++) {
    const currentInput = path[index];

    const currentPool = poolsArray[index];
    const output = currentInput === currentPool.token0 ? currentPool.token1 : currentPool.token0;
    path.push(output);
  }

  return path;
};

export const tradeComparator = (a: Trade, b: Trade) => {
  const ioComp = inputOutputComparator(a, b);

  if (ioComp !== 0) {
    return ioComp;
  }

  return a.path.length - b.path.length;
};

const inputOutputComparator = (a: Trade, b: Trade): number => {
  const aAmountInBN = new BN(a.amountIn);
  const bAmountInBN = new BN(b.amountIn);
  const aAmountOutBN = new BN(a.amountOut);
  const bAmountOutBN = new BN(b.amountOut);

  if (aAmountOutBN.eq(bAmountOutBN)) {
    if (aAmountInBN.eq(bAmountInBN)) {
      return 0;
    }
    // trade A requires less input than trade B, so A should come first
    return aAmountInBN.lt(bAmountInBN) ? -1 : 1;
  } else {
    // tradeA has less output than trade B, so should come second
    return aAmountOutBN.lt(bAmountOutBN) ? 1 : -1;
  }
};

const getSwapAmountOut = (
  amountIn: string,
  amountInRes: string,
  amountOutRes: string,
  decIn: number,
  decOut: number,
  applyFees: boolean,
) => {
  //get values in hethers big number
  const amountInBNStrHethers = formatStringToBigNumberEthersWei(amountIn, decIn);
  const amountInResBNStrHethers = BigNumber.from(amountInRes);
  const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

  //replicate contract calculations
  const amountInWithFee = amountInBNStrHethers.mul(applyFees ? 997 : 1000);
  const numerator = amountInWithFee.mul(amountOutResBNStrHethers);
  const denominator = amountInResBNStrHethers.mul(1000).add(amountInWithFee);
  const amountOut = numerator.div(denominator);

  return hethers.utils.formatUnits(amountOut, decOut).toString();
};

const getSwapAmountIn = (
  amountOut: string,
  amountInRes: string,
  amountOutRes: string,
  decIn: number,
  decOut: number,
  applyFees: boolean,
) => {
  //get values in hethers big number
  const amountOutBNStrHethers = formatStringToBigNumberEthersWei(amountOut, decOut);
  const amountInResBNStrHethers = BigNumber.from(amountInRes);
  const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

  //replicate contract calculations
  const numerator = amountInResBNStrHethers.mul(amountOutBNStrHethers).mul(1000);
  const denominator = amountOutResBNStrHethers
    .sub(amountOutBNStrHethers)
    .mul(applyFees ? 997 : 1000);
  const amountIn = numerator.div(denominator).add(1);

  return hethers.utils.formatUnits(amountIn, decIn).toString();
};

const getAmountOut = (
  amountIn: string,
  tokenInFirstAtPool: boolean,
  pool: IPoolData,
  applyFees: boolean,
) => {
  const { token0Amount, token1Amount, token0Decimals, token1Decimals } = pool;

  const resIn = tokenInFirstAtPool ? token0Amount : token1Amount;
  const resOut = tokenInFirstAtPool ? token1Amount : token0Amount;
  const decIn = tokenInFirstAtPool ? token0Decimals : token1Decimals;
  const decOut = tokenInFirstAtPool ? token1Decimals : token0Decimals;

  const swapAmountOut = getSwapAmountOut(amountIn, resIn, resOut, decIn, decOut, applyFees);
  return swapAmountOut;
};

const getAmountIn = (
  amountOut: string,
  tokenOutFirstAtPool: boolean,
  pool: IPoolData,
  applyFees: boolean,
) => {
  const { token0Amount, token1Amount, token0Decimals, token1Decimals } = pool;

  const resIn = tokenOutFirstAtPool ? token1Amount : token0Amount;
  const resOut = tokenOutFirstAtPool ? token0Amount : token1Amount;
  const decIn = tokenOutFirstAtPool ? token1Decimals : token0Decimals;
  const decOut = tokenOutFirstAtPool ? token0Decimals : token1Decimals;

  const swapAmountIn = getSwapAmountIn(amountOut, resIn, resOut, decIn, decOut, applyFees);
  return swapAmountIn;
};

export const getTradePriceImpact = (trade: Trade) => {
  const { midPricesArr, amountIn, amountOut } = trade;
  const tradeMidPrice = midPricesArr.slice(1).reduce((accumulator, currentValue) => {
    return Number(accumulator) * Number(currentValue);
  }, Number(midPricesArr[0]));

  const exactQuote = Number(amountIn) * Number(tradeMidPrice);
  const slippage = (exactQuote - Number(amountOut)) / exactQuote;

  return slippage * 100;
};
