import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '^.*/socket': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  plugins: [react()],
})
