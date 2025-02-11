import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

// Configuración del enlace HTTP
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_URI,
  headers: {
    'x-hasura-admin-secret' : import.meta.env.VITE_HASURA_ADMIN_SECRET,
  }
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
