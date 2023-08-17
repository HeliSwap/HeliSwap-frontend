import { BigNumberish } from 'ethers';

export enum ProposalStatus {
  WARMUP,
  ACTIVE,
  CANCELED,
  FAILED,
  ACCEPTED,
  QUEUED,
  GRACE,
  EXPIRED,
  EXECUTED,
  ABROGATED,
}

export interface IProposal {
  id: number;
  proposer: string;
  description: string;
  title: string;
  createTime: number;
  eta: number;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  quorum?: number;
  actions?: any[];
  parameters?: {
    acceptanceThreshold: number;
    activeDuration: number;
    gracePeriodDuration: number;
    minQuorum: number;
    queueDuration: number;
    warmUpDuration: number;
  };
  creatorThreshold?: number;
  votingStart?: number;
  votingEnd?: number;
}

export interface IAmountData {
  inETH: string;
  inWEI: string;
  inBG: BigNumberish;
}

export interface IDurationData {
  inMilliSeconds: number;
  inSeconds: number;
  inMinutes: number;
  inHours: number;
  inDays: number;
}

export interface ITimestampData {
  inMilliSeconds: number;
  inSeconds: number;
  inDate: Date;
}

export interface ISSSData {
  totalDeposited: IAmountData;
  rewardsPercentage: number;
  maxSupply: IAmountData;
  totalRewards: IAmountData;
  claimable: IAmountData;
  position: {
    amount: IAmountData;
    duration: IDurationData;
    expiration: ITimestampData;
    rewardsNotClaimed: IAmountData;
    rewardsPending: IAmountData;
  };
}
