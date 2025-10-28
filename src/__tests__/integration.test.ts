import { startServerAndCreateNextHandler } from '../startServerAndCreateNextHandler';
import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import {
  CreateServerForIntegrationTestsOptions,
  defineIntegrationTestSuite,
} from '@apollo/server-integration-testsuite';
import { createServer } from 'http';
import { AddressInfo } from 'net';

async function getApiResolver() {
  let apiResolver;

  switch (process.env.NEXT_VERSION) {
    case '12':
      ({ apiResolver } = await import('next12/dist/server/api-utils/node'));
      break;
    case '13':
      ({ apiResolver } = await import('next13/dist/server/api-utils/node/api-resolver'));
      break;
    case '14':
      ({ apiResolver } = await import('next14/dist/server/api-utils/node/api-resolver'));
      break;
    case '15':
      ({ apiResolver } = await import('next15/dist/server/api-utils/node/api-resolver'));
      break;
    case '16':
      ({ apiResolver } = await import('next16/dist/server/api-utils/node/api-resolver'));
      break;
    default:
      throw new Error(
        'Next.js version not specified. Ensure the Next.js version is specified via the NEXT_VERSION environment variable.',
      );
  }

  return apiResolver;
}

describe('nextHandler', () => {
  defineIntegrationTestSuite(
    async (serverOptions: ApolloServerOptions<BaseContext>, testOptions?: CreateServerForIntegrationTestsOptions) => {
      const server = new ApolloServer(serverOptions);
      const handler = startServerAndCreateNextHandler(server, testOptions);
      const apiResolver = await getApiResolver();

      const httpServer = createServer((req, res) =>
        apiResolver(
          req,
          res,
          '',
          handler,
          { dev: false, previewModeEncryptionKey: '', previewModeId: '', previewModeSigningKey: '' },
          false,
        ),
      );

      await new Promise<void>(resolve => {
        httpServer.listen({ port: 0 }, resolve);
      });

      const { port } = httpServer.address() as AddressInfo;

      return {
        async extraCleanup() {
          await new Promise<void>(resolve => {
            httpServer.close(() => resolve());
          });
        },
        server,
        url: `http://localhost:${port}`,
      };
    },
    {
      serverIsStartedInBackground: true,
    },
  );
});
