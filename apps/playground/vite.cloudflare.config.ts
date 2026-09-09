import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import config from './vite.config.ts'

export default defineConfig({
  ...config,
  build: { outDir: 'dist/cloudflare' },
  plugins: [
    ...(config.plugins ?? []),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
  ],
})
