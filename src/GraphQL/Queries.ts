import { gql } from '@apollo/client';

export const GET_PAIRS = gql`
  query {
    countries {
      name
      phone
    }
  }
`;
