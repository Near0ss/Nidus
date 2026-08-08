import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (err, _req, res) => {
            console.error('proxy /api:', err.message)
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: false,
                message: 'Servidor indisponível. Confira se o backend está rodando na porta 5000.',
              }))
            }
          })
        },
      },
    },
  },
})
