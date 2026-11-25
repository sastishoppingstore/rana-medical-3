import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = staticExport ? process.env.STATIC_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  output: staticExport ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: staticExport,
  images: { unoptimized: true },
};

export default nextConfig;
