import { startServerAndCreateNextHandler } from '@apollo-server-integration-next/integration';
import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { NextApiRequest } from 'next';

interface Context {
  req: NextApiRequest;
}

const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

const typeDefs = gql`
  type Query {
    hello: String!
  }
`;

const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
});

export default startServerAndCreateNextHandler(server, { context: async req => ({ req }) });
