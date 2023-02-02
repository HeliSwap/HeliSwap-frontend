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
  DAY_1_5,
  DAY_6,
  DAY_7,
  VESTING,
  END,
}

export interface ILockdropData {
  lockdropEnd: number;
  lockDropDespositEnd: number;
  vestingEndTime: number;
  tokenAddress: string;
  totalLP: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  totalHbars: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  totalTokens: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  lockedHbars: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  claimed: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  lastUserWithdrawal: {
    valueBN: ethers.BigNumber;
    valueStringWei: string;
    valueStringETH: string;
  };
  estimatedLPTokens: {
    valueStringWei: string;
    valueStringETH: string;
  };
}
