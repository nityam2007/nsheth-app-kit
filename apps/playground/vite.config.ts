import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { developmentTunnelOrigin } from './src/request-origin.ts'

const config = defineConfig({
  server: {
    allowedHosts: [new URL(developmentTunnelOrigin).hostname],
    strictPort: true,
    // Excluded framework modules also embed optimized React URLs. Caching those
    // across an optimizer restart can mix React instances and break hydration.
    headers: { 'Cache-Control': 'no-store' },
    forwardConsole: false,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: [
      '@tanstack/history',
      '@tanstack/router-core',
      '@tanstack/router-core/isServer',
      '@tanstack/router-core/ssr/client',
      '@tanstack/router-core/ssr/server',
      '@tanstack/react-query',
      '@tanstack/react-router-ssr-query',
      '@tanstack/react-query-devtools',
      '@tanstack/react-devtools',
      '@tanstack/react-hotkeys',
      '@tanstack/react-pacer',
      '@tanstack/react-store',
      '@tanstack/react-db',
      '@tanstack/query-db-collection',
      '@tanstack/match-sorter-utils',
      '@untitledui/icons',
      'react-aria-components',
      'tailwind-merge',
      'seroval',
      'h3-v2',
      'zod',
    ],
  },
  plugins: [
    devtools({
      consolePiping: { enabled: false },
      enhancedLogs: { enabled: false },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
