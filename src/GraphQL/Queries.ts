import { gql } from '@apollo/client';

export const GET_PAIRS = gql`
  query {
    getAllPairs {
      name
      tvl
      volume24h
      volume7d
      icons
    }
  }
`;

export const GET_POOLS = gql`
  query {
    pools {
      id
      pairName
      pairAddress
    }
  }
`;

export const GET_POOL_BY_TOKEN = gql`
  query getPoolByToken($token: String!) {
    poolsByToken(token: $token) {
      id
      pairName
      pairAddress
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
