# apollo-server-integration-next

An Apollo Server integration for use with Next.js.

## Getting started

First create a Next.js API route by creating a file at for example `pages/api/graphql.ts`.  
This route will be accessible at `/api/graphql`.

Next create an Apollo Server instance and pass it to `startServerAndCreateNextHandler`:

```js
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';

const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

export default startServerAndCreateNextHandler(server);
```

You may also pass a context function to `startServerAndCreateNextHandler` as such:

```js
export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res, user: await getLoggedInUser(req) }),
});
```

The Next.js `req` and `res` objects are passed along to the context function.
