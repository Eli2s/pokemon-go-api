import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pokemon-go-api/pokemon-go-pwa/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pokédex GO',
        short_name: 'PokédexGO',
        description: 'Pokédex completa para Pokemon GO',
        start_url: '/pokemon-go-api/pokemon-go-pwa/',
        scope: '/pokemon-go-api/pokemon-go-pwa/',
        theme_color: '#EE1515',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'pt-BR',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/pokedex\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'pokedex-list' },
          },
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/pokedex\/id\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-detail',
              expiration: { maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https:\/\/pokemon-go-api\.github\.io\/pokemon-go-api\/api\/raidboss\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'raid-bosses' },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-images',
              expiration: { maxEntries: 1000, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
