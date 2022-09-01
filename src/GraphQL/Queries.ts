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
      hasProblematicToken
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
      hasProblematicToken
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
      hasProblematicToken
    }
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
      hasProblematicToken
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
      keys {
        adminKey
        supplyKey
        wipeKey
        pauseKey
        freezeKey
        feeScheduleKey
        kycKey
      }
      hasFees
    }
  }
`;

export const GET_TOKENS_FILTERED = gql`
  query getFilterTokens($keyword: String!) {
    getTokensFilter(keyword: $keyword) {
      id
      address
      hederaId
      symbol
      name
      decimals
      isHTS
      keys {
        adminKey
        supplyKey
        wipeKey
        pauseKey
        freezeKey
        feeScheduleKey
        kycKey
      }
      hasFees
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
      keys {
        adminKey
        supplyKey
        wipeKey
        pauseKey
        freezeKey
        feeScheduleKey
        kycKey
      }
      hasFees
    }
  }
`;

export const GET_FARMS = gql`
  query getCampaignData($address: String!) {
    getCampaignData(eoaAddress: $address) {
      address
      totalStaked
      stakingTokenAddress
      rewardsData {
        address
        symbol
        decimals
        rewardEnd
        totalAmount
      }
      userStakingData {
        stakedAmount
        rewardsAccumulated {
          address
          totalAccumulated
        }
      }
      poolData {
        pairSymbol
        pairAddress
        pairName
        pairSupply
        lpShares
        token0
        token0Amount
        token0Decimals
        token0Symbol
        token1
        token1Amount
        token1Decimals
        token1Symbol
      }
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
