import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

export const getApolloClient = () => {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    graphQLErrors?.forEach(({ message }) => {
      console.log('message', message);
    });
  });

  const link = from([errorLink, new HttpLink({ uri: process.env.REACT_APP_GRAPHQL_URI })]);
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
};
