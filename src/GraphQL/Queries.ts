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

export const GET_TOKENS = gql`
  query {
    getTokensIds {
      id
      icon
    }
  }
`;
