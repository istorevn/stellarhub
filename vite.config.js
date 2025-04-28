import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      process: 'process/browser',
      assert: 'assert',
      util: 'util',
    },
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'crypto-browserify'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeModulesPolyfillPlugin(),
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
});
