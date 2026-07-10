/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) resolves its worker file relative to its own
  // package location at runtime. If webpack bundles it into the route's
  // compiled output, that relative path breaks. Keeping it external makes
  // Next.js require it directly from node_modules instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
