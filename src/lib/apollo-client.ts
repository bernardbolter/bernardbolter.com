// lib/apollo-client.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { registerApolloClient } from '@apollo/client-integration-nextjs';

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      // FIX: Force POST for all queries. This is the most stable setting.
      useGETForQueries: false, 
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'cache-first',
      },
    },
  });
});