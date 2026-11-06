import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@alpin/ui"],
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
    outputFileTracingRoot: path.join(process.cwd(), "../../"),
  }),
};

export default nextConfig;
