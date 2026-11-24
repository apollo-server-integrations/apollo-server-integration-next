import nextJest from 'next/jest.js';

export default nextJest({})({
  // Next.js internals import through `next/` even when loaded from a version alias.
  moduleNameMapper: process.env.NEXT_VERSION
    ? { '^next/(.*)$': `<rootDir>/node_modules/next${process.env.NEXT_VERSION}/$1` }
    : {},
});
