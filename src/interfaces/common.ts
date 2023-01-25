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
  NOT_STARTED,
  DAY_1_5,
  DAY_6,
  DAY_7,
  FINISHED,
}

export interface ILockdropData {
  heliAmountRaw: string;
  heliAmount: string;
  hbarAmount: string;
  hbarAmountRaw: string;
  lockedHbarAmount: string;
  endTimestamp: number;
}
