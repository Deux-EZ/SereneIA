/**
 * Configuración del cliente Apollo para GraphQL
 * Conecta con el backend de SereneIA
 */
import { 
  ApolloClient, 
  InMemoryCache, 
  createHttpLink,
  ApolloLink,
  from
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// URL del backend GraphQL
const GRAPHQL_URI = import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:8000/graphql/';

// Link HTTP base
const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

// Link de autenticación - añade el token JWT a cada request
const authLink = setContext((_, { headers }) => {
  // Obtener token del localStorage
  const token = localStorage.getItem('sereneia_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Link de manejo de errores
const errorLink = onError((errorResponse: any) => {
  const graphQLErrors = errorResponse?.graphQLErrors;
  const networkError = errorResponse?.networkError;
  
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL Error] Message: ${err.message}, Path: ${err.path}`,
      );
      
      // Si el token expiró o es inválido, limpiar sesión y redirigir a login
      const isAuthError =
        err.message.includes('Token inválido') ||
        err.message.includes('Token expirado') ||
        err.message.includes('No autenticado') ||
        err.message.includes('token') ||
        (err.extensions?.code as string)?.includes('AUTHENTICATION') ||
        err.extensions?.code === 'UNAUTHENTICATED';

      if (isAuthError) {
        localStorage.removeItem('sereneia_token');
        localStorage.removeItem('sereneia-auth');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
  }

  if (networkError) {
    console.error(`[Network Error]: ${networkError.message}`);
  }
});

// Link de logging para desarrollo
const logLink = new ApolloLink((operation, forward) => {
  if (import.meta.env.DEV) {
    console.log(`🚀 GraphQL Operation: ${operation.operationName}`);
    console.log('Variables:', operation.variables);
  }
  
  return forward(operation);
});

// Configuración del cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Cache de conversaciones por usuario
        conversations: {
          keyArgs: false,
          merge(_existing, incoming) {
            return incoming;
          },
        },
        // Cache del historial de conversación
        conversationHistory: {
          keyArgs: ['conversationId'],
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    // Identificadores únicos para los tipos
    UserType: {
      keyFields: ['id'],
    },
    ConversationType: {
      keyFields: ['id'],
    },
    ChatMessage: {
      keyFields: ['id'],
    },
  },
});

// Crear cliente Apollo
export const apolloClient = new ApolloClient({
  link: from([errorLink, logLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Función para resetear el cache (útil al hacer logout)
export const resetApolloCache = () => {
  apolloClient.clearStore();
};

export default apolloClient;
