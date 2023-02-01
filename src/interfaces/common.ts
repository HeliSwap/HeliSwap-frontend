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
  heliAmount: string;
  hbarAmount: string;
  lockedHbarAmount: string;
  endTimestamp: number;
  totalLP: string;
  vestingTimeEnd: number;
  claimedOf: string;
  lastTwoDaysWithdrawals: boolean;
  estimatedLPTokens: string;
}
