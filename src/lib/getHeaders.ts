import { isNextApiRequest } from './isNextApiRequest';
import { HeaderMap } from '@apollo/server';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

const getHeaders = (req: NextApiRequest | NextRequest | Request) => {
  const headers = new HeaderMap();

  if (isNextApiRequest(req)) {
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      }
    }
  } else {
    req.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
};

export { getHeaders };
