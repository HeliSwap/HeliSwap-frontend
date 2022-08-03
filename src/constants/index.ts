import { hethers } from '@hashgraph/hethers';
import BigNumber from 'bignumber.js';

export const MAX_UINT_ERC20 = hethers.constants.MaxUint256;
export const MAX_UINT_HTS = 15908979783.594148;
export const POOLS_FEE = '0.3%';
export const HUNDRED_BN = new BigNumber('100');
export const REFRESH_TIME = 5000;
export const HEALTH_CHECK_INTERVAL = 5000;
export const BALLANCE_FETCH_INTERVAL = 10000;
export const SLIDER_INITIAL_VALUE = '100';
export const MAX_SLIPPAGE_VALUE = 50;
export const MAX_EXPIRATION_VALUE = 4000;

export const TRANSACTION_MAX_FEES = {
  APPROVE_HTS: 850000,
  APPROVE_ERC20: 60000,
  PROVIDE_LIQUIDITY: 250000,
  CREATE_POOL: 2300000,
  REMOVE_NATIVE_LIQUIDITY: 1800000,
  REMOVE_LIQUIDITY: 300000,
  BASE_SWAP: 200000,
  EXTRA_SWAP: 100000,
  TOKEN_OUT_EXACT_SWAP: 100000,
  WRAP_HBAR: 60000,
  UNWRAP_WHBAR: 80000,
};

export enum SORT_OPTIONS_ENUM {
  TVL = 'tvl',
  VOL_7 = 'volume7',
  VOL_24 = 'volume24',
}

export type SORT_OPTIONS =
  | SORT_OPTIONS_ENUM.TVL
  | SORT_OPTIONS_ENUM.VOL_7
  | SORT_OPTIONS_ENUM.VOL_24;

export enum SORT_DIRECTION {
  ASC = 'asc',
  DESC = 'desc',
}
