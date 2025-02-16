/** @type {import('next').NextConfig} */
const config = {
  // Since we run eslint in CI we don't need to run it again when building Next.js.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
