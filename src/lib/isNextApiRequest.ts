import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

const isNextApiRequest = (req: NextApiRequest | NextRequest | Request): req is NextApiRequest => 'query' in req;

export { isNextApiRequest };
