import { ethers } from 'ethers';

export interface IStringToString {
  [key: string]: string;
}

export interface IStringToNumber {
  [key: string]: number;
}

export interface IStringToHTMLElement {
  [key: string]: JSX.Element;
}

export enum PageViews {
  ALL_POOLS,
  MY_POOLS,
}

export enum AnalyticsViews {
  OVERVIEW,
  TOKENS,
  FARMS,
}

export interface ChartDayData {
  date: number;
  volumeUSD: number;
  tvlUSD: number;
}

export type PoolChartEntry = {
  date: number;
  volumeUSD: number;
  totalValueLockedUSD: number;
  feesUSD: number;
};

export interface GenericChartEntry {
  time: string;
  value: number;
}

export enum VolumeChartView {
  daily,
  weekly,
  monthly,
}

export interface IHistoricalData {
  tvl: string;
  time: string;
  volume: string;
}

export interface ITokenHistoricalData {
  price: string;
  time: string;
  tvl: string;
}

export interface ITokenCandleData {
  time: string;
  open: string;
  close: string;
  high: string;
  low: string;
}

export interface ITokenData {
  address: string;
  name: string;
  symbol: string;
  metrics: ITokenHistoricalData[];
  priceCandles: ITokenCandleData[];
}

export enum LOCKDROP_STATE {
  DEPOSIT,
  WITHDRAW,
  PRE_VESTING,
  VESTING,
  END,
}

export interface IContractTokenValue {
  valueBN: ethers.BigNumber;
  valueStringWei: string;
  valueStringETH: string;
}

export interface ILockdropDataRaw {
  getLockDropUserInfo: {
    totalAllocated: String;
    claimable: String;
    claimed: String;
    deposited: String;
  };
}

export interface ILockdropData {
  lockDropDuration: number;
  lockdropEnd: number;
  lockDropDepositEnd: number;
  lastLockDropDay: number;
  vestingEndTime: number;
  tokenAddress: string;
  totalLP: IContractTokenValue;
  totalHbars: IContractTokenValue;
  totalTokens: IContractTokenValue;
  lockedHbars: IContractTokenValue;
  claimed: IContractTokenValue;
  claimable: IContractTokenValue;
  totalClaimable: IContractTokenValue;
  lastUserWithdrawal: number;
  estimatedLPTokens: {
    valueStringWei: string;
    valueStringETH: string;
  };
  estimatedLPPercentage: string;
  lpTokenAddress: string;
}

export interface IDaysMapping {
  [key: string]: {
    [key: string]: string;
  };
}

export interface IClaimdropDataRaw {
  getClaimDropUserInfo: {
    totalAllocated: String;
    claimable: String;
    claimed: String;
  };
}

export interface IClaimdropData {
  claimdropStart: {
    date: string;
    timestamp: number;
  };
  claimdropEnd: {
    date: string;
    timestamp: number;
  };
  expiryEnd: {
    date: string;
    timestamp: number;
  };
  vestingPeriod: {
    valueNumericDays: number;
    valueNumericMilliseconds: number;
    valueString: string;
  };
  claimPeriod: {
    valueNumericDays: number;
    valueNumericMilliseconds: number;
    valueString: string;
  };
  totalAllocated: IContractTokenValue;
  claimedOf: IContractTokenValue;
  vestedTokensOf: IContractTokenValue;
  claimable: IContractTokenValue;
  extraTokensOf: IContractTokenValue;
  totalAllocatedOf: IContractTokenValue;
  claimdropTitle?: string;
  claimdropDescription?: string;
}

export enum KeyType {
  ED25519 = 'ED25519',
  ECDSA_SECP256K1 = 'ECDSA_SECP256K1',
}
