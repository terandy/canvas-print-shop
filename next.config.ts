import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: process.cwd(),
  images: {
    qualities: [25, 50, 75, 80, 100],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
  /**
   * Retired landing pages.
   *
   * Calgary, Vancouver and Edmonton were removed because we only deliver to
   * Quebec and Ontario. They were indexed under the old sitemap, so they 308
   * to a relevant page instead of 404ing — that preserves any accumulated link
   * equity and avoids a spike of crawl errors in Search Console.
   *
   * These run at the edge, before rendering. An in-page `redirect()` cannot
   * work here because `generateMetadata` rejects the unknown slug first.
   */
  async redirects() {
    const retired = ["calgary", "vancouver", "edmonton"];
    return retired.flatMap((slug) => [
      {
        source: `/:locale(en|fr)/canvas-prints/${slug}`,
        destination: "/:locale/canvas-prints/custom",
        permanent: true,
      },
      {
        source: `/canvas-prints/${slug}`,
        destination: "/en/canvas-prints/custom",
        permanent: true,
      },
    ]);
  },
  webpack: (config) => {
    config.resolve.fallback = {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    };
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
