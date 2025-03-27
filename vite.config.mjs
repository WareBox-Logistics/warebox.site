import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    jsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate', // Registra el Service Worker
      manifest: {
        name: "WareBox Logistics",
        short_name: "WareBox",
        description: "Gestión de logística y seguimiento de envíos",
        theme_color: "#ff731d",
        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,png,jpg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'http://localhost:3000',
            handler: 'CacheFirst',
            options: {
              cacheName: 'dynamic-cache-v3',
              expiration: {
                maxEntries: 10,
              },
            },
          },
        ],
      },
    })
  ],
  server: {
    open: true,
    port: 3000,
  },
});
