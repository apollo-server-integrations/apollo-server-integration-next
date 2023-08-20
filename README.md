# apollo-server-integration-next

An Apollo Server integration for use with Next.js.

## Getting started

First create a Next.js API route by creating a file at for example `pages/api/graphql.js`.  
This API route will be accessible at `/api/graphql`.

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

## App Router (Route Handlers)

This integration has experimental support for [Next.js' App Router](https://nextjs.org/docs/app/building-your-application/routing/router-handlers), which is now the stable and default project structure for Next.js.

Make sure you're on recent version of Next.js (13.4+), then create a new Route
Handler file, for example at `app/api/graphql/route.js`.

This file's route handlers will be accessible at URI path `/api/graphql`.

Next create an Apollo Server instance, pass it to `startServerAndCreateNextHandler` and
finally pass the handler to both a GET and a POST route handler:

```js
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
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

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
```

## Typescript

When using this integration with Route Handlers you will have to specify the type of the incoming request object (`Response` or `NextResponse`) for the context function to receive the correct type signature:

```ts
import { NextRequest } from 'next/server';

// req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async req => ({ req }),
});
```
