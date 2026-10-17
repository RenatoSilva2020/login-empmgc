import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: "SIS EMPMGC",
        short_name: "SIS EMPMGC",
        description: 'Sistema de autenticação para acesso ao portal do aluno',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          {
            src: "https://i.ibb.co/QwJbGJ9/e-EMPMGC.png",
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: "https://i.ibb.co/QwJbGJ9/e-EMPMGC.png",
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: './'
});
