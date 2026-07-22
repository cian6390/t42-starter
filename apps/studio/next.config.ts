import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@t42/auth", "@t42/ui"],
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
