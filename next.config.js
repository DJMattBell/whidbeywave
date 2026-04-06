/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/community',
        destination: '/forum',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
