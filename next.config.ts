import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes a self-contained site to ./out.
  output: "export",
  // Emit /problems/B01/index.html so any static file server resolves clean URLs.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
