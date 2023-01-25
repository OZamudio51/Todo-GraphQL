import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const authLink = setContext((_, { headers }) => {
 return {
 headers: {
      ...headers, 'x-hasura-admin-secret': `${process.env.REACT_APP_API_KEY}`
    }
  }
});

const httpLink = createHttpLink({
  uri: 'https://expert-mammoth-86.hasura.app/v1/graphql',
 });

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      GET_TODOS: {
        fields: {
         id : {
            // shorthand  
            merge: true,
          },
        },
      },
    },
  })
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
    <App />
    </ApolloProvider>
  </React.StrictMode>
);
