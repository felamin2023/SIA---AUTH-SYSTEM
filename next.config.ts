import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/user/signin",
        destination: "/frontend/pages/user/signin",
      },
      {
        source: "/user/signup",
        destination: "/frontend/pages/user/signup",
      },
      {
        source: "/user/dashboard/:path*",
        destination: "/frontend/pages/user/dashboard/:path*",
      },
    ];
  },
};

export default nextConfig;
