import { ApolloClient, InMemoryCache, split } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import jwt_decode from 'jwt-decode';

// Configuración del enlace HTTP
const httpLink = new HttpLink({
  uri: 'https://utt-products.hasura.app/v1/graphql',
});

// Configuración del enlace WebSocket de Hasura
const wsLink = new WebSocketLink({
  uri: 'wss://graphql-engine-rl7jojcn3q-uc.a.run.app/v1/graphql',
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem('token');
      let headers = {
        'x-hasura-role': 'anonymous',
      };
      if (token) {
        try {
          const jwt = jwt_decode(token);
          const role = jwt['https://hasura.io/jwt/claims']['x-hasura-role'];
          headers = {
            Authorization: `Bearer ${token}`,
            'x-hasura-role': role || 'anonymous',
          };
        } catch (e) {
          console.error('Failed to decode JWT', e);
        }
      }
      return { headers };
    },
    lazy: true,
    reconnect: true,
  },
});

// Autenticación para el enlace HTTP
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  let newHeaders = {
    ...headers,
    'x-hasura-role': 'anonymous',
  };
  if (token) {
    try {
      const jwt = jwt_decode(token);
      const role = jwt['https://hasura.io/jwt/claims']['x-hasura-role'];
      newHeaders = {
        ...headers,
        Authorization: `Bearer ${token}`,
        'x-hasura-role': role || 'anonymous',
      };
    } catch (e) {
      console.error('Failed to decode JWT', e);
    }
  }
  return { headers: newHeaders };
});

// Usar split para dirigir el tráfico de suscripciones a WebSocket y el resto a HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
