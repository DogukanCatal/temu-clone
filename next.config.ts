import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // tell next js that its okay to load images from other domain
  images: {
    domains: ["cdn.sanity.io"],
  },
};

export default nextConfig;
