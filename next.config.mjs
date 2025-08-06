/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "ad.laikad.com",
      "is4-ssl.mzstatic.com",
      "is1-ssl.mzstatic.com",
      "play-lh.googleusercontent.com",
      "media.graphassets.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/',
        permanent: false
      }
    ];
  }
};

export default nextConfig;
