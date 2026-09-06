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
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
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
