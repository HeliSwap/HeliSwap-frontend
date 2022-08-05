import { gql } from '@apollo/client';

export const GET_POOLS = gql`
  query {
    pools {
      id
      pairName
      pairSymbol
      pairAddress
      pairSupply
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
      volume24h
      volume7d
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

export const GET_POOLS_BY_USER = gql`
  query getPoolsByUser($address: String!) {
    getPoolsByUser(eoaAddress: $address) {
      id
      pairName
      pairSymbol
      pairAddress
      pairSupply
      token0
      token0Name
      token0Symbol
      token0Amount
      token0Decimals
      token1
      token1Name
      token1Symbol
      token1Amount
      token1Decimals
      lpShares
      fee0
      fee1
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
      isHTS
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
      isHTS
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

export const HEALTH_CHECK = gql`
  query {
    healthcheck
  }
`;

export const GET_POOLS_FILTERED = gql`
  query getFilterPools($keyword: String!) {
    filterPools(keyword: $keyword) {
      id
      pairName
      pairSymbol
      pairAddress
      pairSupply
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
      volume24h
      volume7d
    }
  }
`;

export const GET_POOLS_WHITELISTED = gql`
  query getWhitelistedPools($tokens: [String]!) {
    poolsConsistingOf(tokens: $tokens) {
      id
      pairName
      pairSymbol
      pairAddress
      pairSupply
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
      volume24h
      volume7d
    }
  }
`;

export const GET_TOKENS_WHITELISTED = gql`
  query getWhitelistedTokens($addresses: [String]!) {
    getWhitelistedTokens(addresses: $addresses) {
      id
      address
      hederaId
      symbol
      name
      decimals
      isHTS
    }
  }
`;
