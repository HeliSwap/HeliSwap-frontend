import BigNumber from 'bignumber.js';

export interface ITokenData {
  hederaId: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  type: TokenType;
  keys?: IKeys;
  hasFees?: boolean;
  isHTS?: boolean;
  maxSupply?: string;
}

export interface ITokenDataAnalytics extends ITokenData {
  price: string;
  tvl?: string;
}

export interface IKeys {
  adminKey: boolean;
  supplyKey: boolean;
  wipeKey: boolean;
  pauseKey: boolean;
  freezeKey: boolean;
  feeScheduleKey: boolean;
  kycKey: boolean;
  [key: string]: boolean;
}

export interface ITokenListData {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  price?: string;
  tvl?: string;
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
  poolPercenatage?: string;
  icons?: string[];
  volume7d: string;
  volume24h: string;
  fee0?: string;
  fee1?: string;
  hasProblematicToken?: boolean;
  hasCampaign: boolean;
  tvl?: string;
  volume7dUsd?: string;
  volume24hUsd?: string;
  stakedBalance?: string;
}

export interface IPoolExtendedData extends IPoolData {
  token0AmountFormatted: string;
  token1AmountFormatted: string;
  fee0AmountFormatted?: string;
  fee1AmountFormatted?: string;
  lpSharesFormatted?: string;
  stakedBalanceFormatted?: string;
  stakedToken0AmountFormatted?: string;
  stakedToken1AmountFormatted?: string;
  tvlBN: BigNumber;
  tvl: string;
  stakedTvl?: string;
  volume24Num?: number;
  volume24?: string;
  volume7Num?: number;
  volume7?: string;
  feesNum?: number;
  feesStr?: string;
  tokensPriceEvaluated?: boolean;
  [key: string]: any;
  farmAddress?: string;
}

export interface IPoolsAnalytics {
  tvl: number;
  volume24h: number;
  volume7d: number;
}

export interface IFarmDataRaw {
  address: string;
  poolData: IPoolData;
  totalStaked: string;
  rewardsData: IRewardRaw[];
  stakingTokenAddress: string;
  userStakingData: IUserStakingDataRaw;
}

export interface IFarmData extends IFarmDataRaw {
  totalStakedUSD: string;
  rewardsData: IReward[];
  userStakingData: IUserStakingData;
  APR: string;
  totalRewardsUSD: string;
  campaignEndDate: number;
  [key: string]: any;
}

export interface IRewardRaw {
  address: string;
  symbol: string;
  decimals: number;
  totalAmount: string;
  duration: number;
  totalAccumulated: string;
  rewardEnd: number;
}

export interface IReward extends IRewardRaw {
  totalAmountUSD: string;
  totalAccumulatedUSD: string;
}

export interface IUserStakingDataRaw {
  stakedAmount?: string;
  rewardsAccumulated?: IRewardsAccumulatedRaw[];
  [key: string]: any;
}

export interface IUserStakingData extends IUserStakingDataRaw {
  stakedAmountUSD?: string;
  rewardsAccumulated?: IRewardsAccumulated[];
}

export interface IRewardsAccumulatedRaw {
  address: string;
  totalAccumulated: string;
}

export interface IRewardsAccumulated extends IRewardsAccumulatedRaw {
  totalAccumulatedUSD: string;
}

export interface IUserReward {
  address: string;
  symbol: string;
  pendingAmount: string;
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
