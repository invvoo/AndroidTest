/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Supabase Storage + hand-seeded logo/image URLs.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
