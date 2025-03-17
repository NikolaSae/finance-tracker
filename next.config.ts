import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Za direktan PostgreSQL pristup
    serverComponentsExternalPackages: ["pg"],
    // Omogućava Server Actions
    serverActions: true,
        incrementalCacheHandlerPath: process.env.NODE_ENV === 'production' 
      ? './cache-handler.js' 
      : undefined,
    // Optimizacija importa
    optimizePackageImports: [
      "@prisma/client",
      "next-auth"
    ],
    // Uključi Turbopack (ako je podržan u tvojoj verziji)
    turbopack: true
  },
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ]
      }
    ]
  },
  // Kada koristiš Turbopack, nije potrebno dodavati webpack konfiguraciju,
  // pa ukloni ili komentariši deo koji se odnosi na Webpack:
  // webpack: (config) => {
  //   config.externals.push({
  //     'pg-hstore': 'commonjs pg-hstore',
  //     pg: 'commonjs pg',
  //   })
  //   return config
  // }
}

export default nextConfig
