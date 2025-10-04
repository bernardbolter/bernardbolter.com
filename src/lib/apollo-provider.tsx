// lib/apollo-provider.tsx
'use client';

import { ApolloClient, InMemoryCache, ApolloNextAppProvider } from '@apollo/client-integration-nextjs'; // Streaming-compatible exports
import { HttpLink } from '@apollo/client';

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      useGETForQueries: true, // Use GET for WPGraphQL Smart Cache
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'cache-first', // Align with server-side
      },
    },
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}