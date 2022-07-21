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
  tvl: string;
  volume24h: string;
  volume7d: string;
  icons: string[];
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
