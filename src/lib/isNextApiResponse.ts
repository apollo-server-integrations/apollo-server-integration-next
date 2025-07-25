import { NextApiResponse } from 'next';

const isNextApiResponse = (res: NextApiResponse | unknown): res is NextApiResponse =>
  Boolean(typeof res === 'object' && res && 'setPreviewData' in res);

export { isNextApiResponse };
