export interface ITokenData {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  expiryTimestamp: string;
}

export interface IUserToken {
  tokenId: string;
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
  token0: string;
  token0Name: string;
  token0Amount: number;
  token0Symbol: string;
  token0Decimals: number;
  token1: string;
  token1Name: string;
  token1Amount: number;
  token1Symbol: string;
  token1Decimals: number;
  tvl: string;
  volume24h: string;
  volume7d: string;
  icons: string[];
}
