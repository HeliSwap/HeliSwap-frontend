import { gql } from '@apollo/client';

export const GET_POOLS = gql`
  query {
    pools {
      id
      pairName
      pairSymbol
      pairAddress
      token0
      token0Name
      token0Amount
      token0Decimals
      token1
      token1Name
      token1Amount
      token1Decimals
    }
  }
`;

export const GET_POOL_BY_TOKEN = gql`
  query getPoolByToken($token: String!) {
    poolsByToken(token: $token) {
      id
      pairName
      pairSymbol
      pairAddress
      token0
      token0Name
      token0Amount
      token0Decimals
      token1
      token1Name
      token1Amount
      token1Decimals
    }
  }
`;

export const GET_TOKENS = gql`
  query {
    getTokensIds {
      id
      icon
    }
  }
`;

export const GET_SWAP_RATE = gql`
  query {
    getSwapRate {
      amountOut
    }
  }
`;
