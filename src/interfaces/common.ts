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
