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
