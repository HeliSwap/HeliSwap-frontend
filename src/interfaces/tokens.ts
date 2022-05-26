export interface ITokenData {
  hederaId: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  totalSupply: string;
  expiryTimestamp: string;
  type: TokenType;
}

export enum TokenType {
  HTS = 'HTS',
  ERC20 = 'ERC20',
  HBAR = 'HBAR',
}

export interface IUserToken {
  hederaId: string;
  balance: number;
}

export interface IWalletBalance {
  balance: number;
  tokens: IUserToken[];
}

export interface ISwapTokenData {
  tokenIdIn: string;
  tokenIdOut: string;
  amountIn: string;
  amountOut: string;
}

export interface IPairData {
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
  token0Shares?: string;
  token1Shares?: string;
  lpShares?: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
  icons: string[];
}
