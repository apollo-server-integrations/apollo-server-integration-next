import { getBody } from './lib/getBody';
import { getHeaders } from './lib/getHeaders';
import { isNextApiRequest } from './lib/isNextApiRequest';
import { ApolloServer, BaseContext, ContextFunction } from '@apollo/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'url';

type HandlerRequest = NextApiRequest | NextRequest | Request;

interface Options<Req extends HandlerRequest, Context extends BaseContext> {
  context?: ContextFunction<[Req, Req extends NextApiRequest ? NextApiResponse : undefined], Context>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultContext: ContextFunction<[], any> = async () => ({});

function startServerAndCreateNextHandler<
  Req extends HandlerRequest = NextApiRequest,
  Context extends BaseContext = object,
>(server: ApolloServer<Context>, options?: Options<Req, Context>) {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

  const contextFunction = options?.context || defaultContext;

  async function handler<HandlerReq extends NextApiRequest>(req: HandlerReq, res: NextApiResponse): Promise<unknown>;
  async function handler<HandlerReq extends NextRequest | Request>(
    req: HandlerReq,
    res?: NextResponse,
  ): Promise<NextResponse | Response>;
  async function handler(req: HandlerRequest, res: NextApiResponse | NextResponse | undefined) {
    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      context: () => contextFunction(req as Req, res as Req extends NextApiRequest ? NextApiResponse : undefined),
      httpGraphQLRequest: {
        body: await getBody(req),
        headers: getHeaders(req),
        method: req.method || 'POST',
        search: req.url ? parse(req.url).search || '' : '',
      },
    });

    if (isNextApiRequest(req)) {
      const nextApiRes = res as unknown as NextApiResponse;
      if (!nextApiRes) {
        throw new Error('API Routes require you to pass both the req and res object.');
      }

      for (const [key, value] of httpGraphQLResponse.headers) {
        nextApiRes.setHeader(key, value);
      }

      nextApiRes.statusCode = httpGraphQLResponse.status || 200;

      if (httpGraphQLResponse.body.kind === 'complete') {
        nextApiRes.send(httpGraphQLResponse.body.string);
      } else {
        for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
          nextApiRes.write(chunk);
        }
      }

      nextApiRes.end();
      return;
    }

    const body = [];

    if (httpGraphQLResponse.body.kind === 'complete') {
      body.push(httpGraphQLResponse.body.string);
    } else {
      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        body.push(chunk);
      }
    }

    const nextRes: NextResponse | undefined = res as unknown as NextResponse; // for NextJs v13 app folder, NextResponse type
    if (nextRes?.headers?.set) {
      for (const [key, value] of httpGraphQLResponse.headers) {
        nextRes.headers.set(key, value);
      }

      // eslint-disable-next-line consistent-return
      return new NextResponse(body.join(''), {
        headers: nextRes.headers,
        status: httpGraphQLResponse.status || 200,
      });
    }

    const headers: Record<string, string> = {};

    for (const [key, value] of httpGraphQLResponse.headers) {
      headers[key] = value;
    }

    // eslint-disable-next-line consistent-return
    return new Response(body.join(''), {
      headers,
      status: httpGraphQLResponse.status || 200,
    });
  }

  return handler;
}

export { startServerAndCreateNextHandler };
