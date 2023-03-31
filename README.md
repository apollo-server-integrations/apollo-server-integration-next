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

## Route Handlers (experimental)

This integration has experimental support for Next.js' new Route Handlers feature.

To use this integration with Route Handlers, first opt into Next.js' beta app directory by adding the following to `next.config.js`:

```js
module.exports = {
  experimental: {
    appDir: true,
  },
};
```

Then create a new file at for example `app/graphql/route.js`.  
This file's route handlers will be accessible at `/graphql`.

Next create an Apollo Server instance, pass it to `startServerAndCreateNextHandler` and finally pass the handler to both a GET and a POST route handler:

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

export async function GET(request) {
  return handler(request);
}

export async function POST(request) {
  return handler(request);
}
```

## Typescript

When using this integration with Route Handlers you will have to specify the type of the incoming request object (`Response` or `NextResponse`) for the context function to receive the correct type signature:

```ts
import { NextRequest } from 'next/server';

// req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest>(server, { context: async req => ({ req }) });
```
