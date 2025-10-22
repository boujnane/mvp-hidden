import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "example.com", // ajoute ici tout autre domaine que tu utilises pour les images
    ],
  },
};

export default nextConfig;
