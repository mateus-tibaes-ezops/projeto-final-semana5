/** @type {import('next').NextConfig} */
const backendHost = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: '/api/:path*',
          destination: `${backendHost}/api/:path*`,
        },
      ];
    }

    return [];
  },
};

module.exports = nextConfig;
