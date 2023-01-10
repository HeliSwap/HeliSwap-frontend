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
      hasCampaign
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
      hasCampaign
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
      hasCampaign
      farmAddress
      stakedBalance
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
      hasCampaign
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
      hasCampaign
      volume24hUsd
      volume7dUsd
      tvl
    }
  }
`;

export const GET_POOL_BY_ADDRESS = gql`
  query getPoolByAddress($poolAddress: String!, $tokens: [String]!) {
    getPoolByAddress(poolAddress: $poolAddress, tokens: $tokens) {
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
      hasCampaign
      volume24hUsd
      volume7dUsd
      tvl
      historicalData {
        time
        tvl
        volume
      }
      fees {
        amount
      }
      diff {
        tvl
        volume
      }
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
  query getFarmsOverview($userAddress: String!) {
    getFarmsOverview(userAddress: $userAddress) {
      address
      totalStaked
      stakingTokenAddress
      rewardsData {
        address
        symbol
        decimals
        rewardEnd
        totalAmount
        duration
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
//TODO: check parameters names
export const GET_FARM_BY_ADDRESS = gql`
  query getFarmDetails($farmAddress: String!, $userAddress: String!) {
    getFarmDetails(farmAddress: $farmAddress, userAddress: $userAddress) {
      address
      totalStaked
      stakingTokenAddress
      rewardsData {
        address
        symbol
        decimals
        rewardEnd
        totalAmount
        duration
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

export const GET_METRICS = gql`
  query {
    getMetrics {
      tvl
      time
      volume
    }
  }
`;
