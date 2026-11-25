import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_DEV_API_PROXY can be set in the shell or in .env.development.local.
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  const apiTarget = env.VITE_DEV_API_PROXY || 'http://127.0.0.1:8000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // In development, /api is proxied to the Django server so session cookies and CSRF work
      // on the same origin (localhost:5173). Always call relative /api/... URLs from the browser.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
