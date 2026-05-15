import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cisa-kev': {
        target: 'https://www.cisa.gov',
        changeOrigin: true,
        rewrite: () => '/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      },
    },
  },
})
