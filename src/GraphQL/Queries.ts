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
      token0Symbol
      token0Decimals
      token1
      token1Name
      token1Symbol
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
    getTokensData {
      id
      address
      hederaId
      symbol
      name
      decimals
    }
  }
`;

export const GET_TOKEN_INFO = gql`
  query getTokenByAddressOrId($id: String!) {
    getTokenInfo(tokenIdOrAddress: $id) {
      id
      address
      hederaId
      symbol
      name
      decimals
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
