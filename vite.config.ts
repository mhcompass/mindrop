import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    // Old iPads (and every browser on iOS, since they all use the iPad's
    // built-in WebKit) can't run the modern ES that Vite ships by default.
    // This emits a transpiled + polyfilled bundle for older Safari/WebKit.
    // NOTE: only the *build* is legacy-safe — `npm run dev` still serves
    // modern syntax, so test the old iPad against `npm run preview`, not dev.
    legacy({
      targets: ['safari >= 12', 'ios >= 12'],
      // iOS 13 Safari supports ES modules, so by default it loads the *modern*
      // bundle — which only targets Safari 14 and breaks (BigInt, newer regex,
      // etc.). Emitting ONLY the legacy bundle forces every browser onto the
      // fully Babel-transpiled + core-js-polyfilled output targeting safari>=12.
      renderModernChunks: false,
    }),
  ],
  // host: true binds 0.0.0.0 so the dev server is reachable on the LAN
  // (e.g. http://192.168.1.12:5180), not just localhost.
  // `/api` is proxied to the local tracker service so `npm run dev` behaves
  // like the dockerized stack (where nginx does the same). Override the
  // target with VITE_API_PROXY when the api runs elsewhere.
  server: {
    host: true,
    port: 5180,
    proxy: { '/api': process.env.VITE_API_PROXY ?? 'http://localhost:46721' },
  },
  preview: {
    host: true,
    port: 5180,
    proxy: { '/api': process.env.VITE_API_PROXY ?? 'http://localhost:46721' },
  },
});
