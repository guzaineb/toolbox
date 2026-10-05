import type { NextConfig } from "next";

// `/uploads` est un asset servi par l'API.
//  - En production Docker, Nginx relaie /uploads/ -> api:3000 en amont. L'image
//    définit UPLOADS_PROXY_URL="none" pour qu'aucune rewrite ne soit émise
//    (une cible relative "/api/uploads" créerait une boucle de réécriture).
//  - En développement, le frontend n'est pas derrière Nginx : on relaie vers
//    l'API locale, via NEXT_PUBLIC_API_URL si elle est absolue, sinon :3000.
const uploadsProxy = (() => {
  const explicit = process.env.UPLOADS_PROXY_URL;
  if (explicit) return explicit.startsWith("http") ? explicit : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  return apiUrl.startsWith("http") ? apiUrl : "http://localhost:3000";
})();

const nextConfig: NextConfig = {
  // Image Docker beaucoup plus légère : le serveur n'embarque que les fichiers
  // réellement utilisés par les routes (output file tracing).
  output: "standalone",
  async rewrites() {
    return uploadsProxy
      ? [
          {
            source: "/uploads/:path*",
            destination: `${uploadsProxy}/uploads/:path*`,
          },
        ]
      : [];
  },
  images: {
    // `domains` est déprécié en Next 16 au profit de `remotePatterns`.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
      { protocol: "http", hostname: "91.134.139.163" },
      { protocol: "https", hostname: "91.134.139.163" },
    ],
  },
};

export default nextConfig;
