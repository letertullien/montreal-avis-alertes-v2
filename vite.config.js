import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Workbox — génération automatique du SW au build
      workbox: {
        // Fichiers à précacher au premier chargement (shell applicatif)
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],

        // Stratégies de cache au runtime (pendant la navigation)
        runtimeCaching: [
          {
            // Toutes les requêtes vers l'API de la Ville de Montréal
            urlPattern: /^https:\/\/donnees\.montreal\.ca\/api\//,
            // Stale-While-Revalidate : cache immédiat + maj en arrière-plan
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-avis-mtl',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // 24 heures
              },
            },
          },
        ],
      },

      manifest: {
        name: 'Avis et alertes Montréal',
        short_name: 'Avis MTL',
        description: 'Consultez les avis et alertes de la Ville de Montréal',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1a1a2e',
        lang: 'fr-CA',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/mobile.png',
            sizes: '1170x2531',
            type: 'image/png',
            form_factor: 'narrow',
            label: "Page d'accueil sur mobile",
          },
          {
            src: '/screenshots/desktop.png',
            sizes: '2560x1600',
            type: 'image/png',
            form_factor: 'wide',
            label: "Page d'accueil sur ordinateur",
          },
        ],
      },
    }),
  ],
})