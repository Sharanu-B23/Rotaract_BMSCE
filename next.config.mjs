/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/join",
        destination: "/join-the-club",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
