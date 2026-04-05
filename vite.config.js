import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }), // Activado para producción (reduce tamaño ~60%)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-helmet": "react-helmet-async",
    },
  },
  esbuild: {
    // drop: ['console', 'debugger'], // DEBUG: Comentado temporalmente para ver logs y errores en consola
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // FIX: Activado para que la consola muestre "CartContext.jsx:45" en lugar de "vendor.js"
    chunkSizeWarningLimit: 800, // Ajustado a 800kb para ser estricto pero realista con vendors pesados
    rollupOptions: {
      output: {
        // Estrategia de Code Splitting Manual
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 1. Separar librerías de UI pesadas (Prioridad alta para atrapar 'lucide-react' antes que el filtro de react)
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            
            // El resto de dependencias van a un chunk general
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        // AJUSTA ESTO: La URL donde corre tu PHP localmente (ej: localhost/Colshop-web/public)
        target: 'http://localhost/Colshop-web/public', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})