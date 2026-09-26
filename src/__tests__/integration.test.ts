import { startServerAndCreateNextHandler } from '../startServerAndCreateNextHandler';
import { ApolloServer, ApolloServerOptions, BaseContext, HeaderMap } from '@apollo/server';
import {
  CreateServerForIntegrationTestsOptions,
  defineIntegrationTestSuite,
} from '@apollo/server-integration-testsuite';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import * as legacyUrl from 'url';

jest.mock('url', () => {
  const actualUrl = jest.requireActual<typeof import('url')>('url');
  return { ...actualUrl, parse: jest.fn(actualUrl.parse) };
});

describe('startServerAndCreateNextHandler', () => {
  it('uses the WHATWG URL API for relative API route URLs', async () => {
    const executeHTTPGraphQLRequest = jest.fn().mockResolvedValue({
      body: { kind: 'complete', string: '{}' },
      headers: new HeaderMap(),
      status: 200,
    });
    const server = {
      executeHTTPGraphQLRequest,
      startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests: jest.fn(),
    } as unknown as ApolloServer<BaseContext>;
    const handler = startServerAndCreateNextHandler(server);
    const request = {
      body: undefined,
      headers: {},
      method: 'GET',
      query: {},
      url: '/api/graphql?operation=test%20query#fragment',
    } as NextApiRequest;
    const response = {
      end: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;
    const legacyParse = jest.mocked(legacyUrl.parse);
    legacyParse.mockClear();

    await handler(request, response);

    expect(legacyParse).not.toHaveBeenCalled();
    expect(executeHTTPGraphQLRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        httpGraphQLRequest: expect.objectContaining({ search: '?operation=test%20query' }),
      }),
    );
  });
});

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
