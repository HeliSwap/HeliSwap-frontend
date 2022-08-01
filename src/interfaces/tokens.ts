import BigNumber from 'bignumber.js';

export interface ITokenData {
  hederaId: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  type: TokenType;
  details?: any;
}

export interface ITokensData {
  tokenA: ITokenData;
  tokenB: ITokenData;
  [key: string]: ITokenData;
}

export interface IPoolData {
  pairName: string;
  pairAddress: string;
  pairSymbol: string;
  pairSupply: string;
  token0: string;
  token0Name: string;
  token0Amount: string;
  token0Symbol: string;
  token0Decimals: number;
  token1: string;
  token1Name: string;
  token1Amount: string;
  token1Symbol: string;
  token1Decimals: number;
  lpShares?: string;
  icons?: string[];
  volume7d: string;
  volume24h: string;
}

export interface IPoolExtendedData extends IPoolData {
  token0AmountFormatted: string;
  token1AmountFormatted: string;
  tvlBN: BigNumber;
  tvl: string;
  volume24Num?: number;
  volume24?: string;
  volume7Num?: number;
  volume7?: string;
  tokensPriceEvaluated?: boolean;
  [key: string]: any;
}

export enum TokenType {
  HTS = 'HTS',
  ERC20 = 'ERC20',
  HBAR = 'HBAR',
}

export interface IUserToken {
  tokenId: string;
  balance: number;
}

export interface ISwapTokenData {
  tokenIdIn: string;
  tokenIdOut: string;
  amountIn: string;
  amountOut: string;
}

export interface ICreatePairData {
  tokenAAmount: string;
  tokenBAmount: string;
  tokenAId: string;
  tokenBId: string;
  tokenADecimals: number;
  tokenBDecimals: number;
}

export interface IAllowanceData {
  owner: string;
  spender: string;
  amount_granted: number;
  token_id: string;
}

export interface IfaceInitialBalanceData {
  tokenA: string | undefined;
  tokenB: string | undefined;
}
